import { FastifyReply, FastifyRequest } from 'fastify';
import {
    initiateStripePayment,
    createManualPaymentRequest,
    uploadPaymentProof,
    handleStripeWebhook
} from './payments.service';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2026-01-28.clover'
});

/**
 * Initiate Stripe payment
 */
export const initiateStripeHandler = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
        const user = req.user as { id: number };
        const { plan } = req.body as { plan: 'starter' | 'pro' };

        if (!['starter', 'pro'].includes(plan)) {
            return reply.code(400).send({ message: `Plan invalide: ${plan}` });
        }

        const amount = plan === 'starter' ? 5000 : 10000;
        const result = await initiateStripePayment(user.id, plan, amount);

        return reply.send(result);
    } catch (err) {
        req.log.error({ err }, 'Stripe payment initiation error');
        return reply.code(500).send({
            message: "Erreur lors de l'initiation du paiement Stripe",
            error: (err as any).message
        });
    }
};

/**
 * Initiate manual payment (OM/MTN)
 */
export const initiateManualHandler = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
        const user = req.user as { id: number };
        const { plan, method } = req.body as { plan: 'starter' | 'pro'; method: 'om' | 'mtn' };

        if (!['starter', 'pro'].includes(plan)) {
            return reply.code(400).send({ message: `Plan invalide: ${plan}` });
        }

        if (!['om', 'mtn'].includes(method)) {
            return reply.code(400).send({ message: `Méthode invalide: ${method}` });
        }

        const amount = plan === 'starter' ? 5000 : 10000;
        const result = await createManualPaymentRequest(user.id, plan, amount, method);

        return reply.send(result);
    } catch (err) {
        req.log.error({ err }, 'Manual payment initiation error');
        return reply.code(500).send({
            message: "Erreur lors de la création de la demande de paiement",
            error: (err as any).message
        });
    }
};

/**
 * Upload payment proof
 */
export const uploadProofHandler = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
        const { transaction_id, proof_url } = req.body as { transaction_id: string; proof_url: string };

        if (!transaction_id || !proof_url) {
            return reply.code(400).send({ message: 'transaction_id et proof_url requis' });
        }

        const payment = await uploadPaymentProof(transaction_id, proof_url);

        return reply.send({
            message: 'Preuve de paiement enregistrée avec succès',
            payment
        });
    } catch (err) {
        req.log.error({ err }, 'Upload proof error');
        return reply.code(500).send({
            message: "Erreur lors de l'upload de la preuve",
            error: (err as any).message
        });
    }
};

/**
 * Stripe webhook handler
 */
export const stripeWebhookHandler = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
        const sig = req.headers['stripe-signature'] as string;
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

        if (!webhookSecret) {
            req.log.error('Stripe webhook secret not configured');
            return reply.code(500).send({ message: 'Webhook not configured' });
        }

        let event: Stripe.Event;

        try {
            event = stripe.webhooks.constructEvent(
                req.body as any,
                sig,
                webhookSecret
            );
        } catch (err) {
            req.log.error({ err }, 'Webhook signature verification failed');
            return reply.code(400).send({ message: 'Invalid signature' });
        }

        await handleStripeWebhook(event);

        return reply.send({ received: true });
    } catch (err) {
        req.log.error({ err }, 'Webhook processing error');
        return reply.code(500).send({ message: 'Webhook error' });
    }
};

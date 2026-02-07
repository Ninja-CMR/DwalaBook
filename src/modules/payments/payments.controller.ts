import { FastifyReply, FastifyRequest } from 'fastify';
import { initiateStripePayment, declareManualPayment } from './payments.service';

export const initiatePaymentHandler = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
        const user = req.user as { id: number };
        const { plan, method, transaction_id, phone } = req.body as {
            plan: 'starter' | 'pro',
            method: 'stripe' | 'manual',
            transaction_id?: string,
            phone?: string
        };

        if (!['starter', 'pro'].includes(plan)) {
            return reply.code(400).send({ message: 'Plan invalide' });
        }

        const amount = plan === 'starter' ? 5000 : 10000;

        if (method === 'stripe') {
            const result = await initiateStripePayment(user.id, plan, amount);
            return reply.send(result);
        } else if (method === 'manual') {
            if (!transaction_id || !phone) {
                return reply.code(400).send({ message: 'Transaction ID et numéro de téléphone requis pour le paiement manuel.' });
            }
            const result = await declareManualPayment(user.id, plan, amount, transaction_id, phone);
            return reply.send(result);
        } else {
            return reply.code(400).send({ message: 'Méthode de paiement invalide' });
        }

    } catch (err: any) {
        console.error('[PAYMENT CONTROLLER ERROR]', err);
        req.log.error({ err }, 'Payment initiation error');

        if (err.message && err.message.includes('existe déjà')) {
            return reply.code(409).send({
                message: err.message,
                error: 'DuplicateTransaction'
            });
        }

        return reply.code(500).send({
            message: "Erreur lors de l'initiation du paiement",
            error: err.message || 'Unknown error'
        });
    }
};

export const stripeWebhookHandler = async (req: FastifyRequest, reply: FastifyReply) => {
    // In a real implementation, you verify Stripe signature here
    // const sig = req.headers['stripe-signature'];

    // For now we assume if we get a status=success callback locally or a webhook event, we process it.
    // Ideally this listens for 'checkout.session.completed'
    return reply.send({ received: true });
};

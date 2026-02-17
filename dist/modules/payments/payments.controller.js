"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripeWebhookHandler = exports.uploadProofHandler = exports.initiateManualHandler = exports.initiateStripeHandler = void 0;
const payments_service_1 = require("./payments.service");
const stripe_1 = __importDefault(require("stripe"));
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2026-01-28.clover'
});
/**
 * Initiate Stripe payment
 */
const initiateStripeHandler = async (req, reply) => {
    try {
        const user = req.user;
        const { plan } = req.body;
        if (!['starter', 'pro'].includes(plan)) {
            return reply.code(400).send({ message: `Plan invalide: ${plan}` });
        }
        const amount = plan === 'starter' ? 5000 : 10000;
        const result = await (0, payments_service_1.initiateStripePayment)(user.id, plan, amount);
        return reply.send(result);
    }
    catch (err) {
        req.log.error({ err }, 'Stripe payment initiation error');
        return reply.code(500).send({
            message: "Erreur lors de l'initiation du paiement Stripe",
            error: err.message
        });
    }
};
exports.initiateStripeHandler = initiateStripeHandler;
/**
 * Initiate manual payment (OM/MTN)
 */
const initiateManualHandler = async (req, reply) => {
    try {
        const user = req.user;
        const { plan, method } = req.body;
        if (!['starter', 'pro'].includes(plan)) {
            return reply.code(400).send({ message: `Plan invalide: ${plan}` });
        }
        if (!['om', 'mtn'].includes(method)) {
            return reply.code(400).send({ message: `Méthode invalide: ${method}` });
        }
        const amount = plan === 'starter' ? 5000 : 10000;
        const result = await (0, payments_service_1.createManualPaymentRequest)(user.id, plan, amount, method);
        return reply.send(result);
    }
    catch (err) {
        req.log.error({ err }, 'Manual payment initiation error');
        return reply.code(500).send({
            message: "Erreur lors de la création de la demande de paiement",
            error: err.message
        });
    }
};
exports.initiateManualHandler = initiateManualHandler;
/**
 * Upload payment proof
 */
const uploadProofHandler = async (req, reply) => {
    try {
        const { transaction_id, proof_url } = req.body;
        if (!transaction_id || !proof_url) {
            return reply.code(400).send({ message: 'transaction_id et proof_url requis' });
        }
        const payment = await (0, payments_service_1.uploadPaymentProof)(transaction_id, proof_url);
        return reply.send({
            message: 'Preuve de paiement enregistrée avec succès',
            payment
        });
    }
    catch (err) {
        req.log.error({ err }, 'Upload proof error');
        return reply.code(500).send({
            message: "Erreur lors de l'upload de la preuve",
            error: err.message
        });
    }
};
exports.uploadProofHandler = uploadProofHandler;
/**
 * Stripe webhook handler
 */
const stripeWebhookHandler = async (req, reply) => {
    try {
        const sig = req.headers['stripe-signature'];
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
        if (!webhookSecret) {
            req.log.error('Stripe webhook secret not configured');
            return reply.code(500).send({ message: 'Webhook not configured' });
        }
        let event;
        try {
            event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
        }
        catch (err) {
            req.log.error({ err }, 'Webhook signature verification failed');
            return reply.code(400).send({ message: 'Invalid signature' });
        }
        await (0, payments_service_1.handleStripeWebhook)(event);
        return reply.send({ received: true });
    }
    catch (err) {
        req.log.error({ err }, 'Webhook processing error');
        return reply.code(500).send({ message: 'Webhook error' });
    }
};
exports.stripeWebhookHandler = stripeWebhookHandler;

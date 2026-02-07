import { FastifyInstance } from 'fastify';
import { initiatePaymentHandler, stripeWebhookHandler } from './payments.controller';

export async function paymentRoutes(fastify: FastifyInstance) {
    // Initiate payment (Protected)
    // Body: { plan: 'starter' | 'pro', method: 'stripe' | 'manual', ... }
    fastify.post('/initiate', {
        onRequest: [(fastify as any).authenticate]
    }, initiatePaymentHandler);

    // Stripe Webhook (Public)
    fastify.all('/webhook', stripeWebhookHandler);
}

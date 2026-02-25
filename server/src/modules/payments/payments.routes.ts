import { FastifyInstance } from 'fastify';
import {
    initiateStripeHandler,
    initiateManualHandler,
    uploadProofHandler,
    stripeWebhookHandler
} from './payments.controller';

export async function paymentRoutes(fastify: FastifyInstance) {
    // Stripe routes (protected)
    fastify.post('/stripe/create-session', {
        onRequest: [(fastify as any).authenticate]
    }, initiateStripeHandler);

    // Stripe webhook (public, but verified by signature)
    fastify.post('/stripe/webhook', {
        config: {
            rawBody: true // Required for Stripe signature verification
        }
    }, stripeWebhookHandler);

    // Manual payment routes (protected)
    fastify.post('/manual/request', {
        onRequest: [(fastify as any).authenticate]
    }, initiateManualHandler);

    fastify.post('/manual/upload-proof', {
        onRequest: [(fastify as any).authenticate]
    }, uploadProofHandler);
}

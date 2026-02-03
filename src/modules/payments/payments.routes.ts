import { FastifyInstance } from 'fastify';
import { initiatePaymentHandler, monetbilWebhookHandler } from './payments.controller';

export async function paymentRoutes(fastify: FastifyInstance) {
    // Initiate payment (Protected)
    fastify.post('/initiate', {
        onRequest: [(fastify as any).authenticate]
    }, initiatePaymentHandler);

    // Monetbil Webhook (Public)
    fastify.all('/webhook', monetbilWebhookHandler);
}

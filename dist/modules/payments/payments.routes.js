"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentRoutes = paymentRoutes;
const payments_controller_1 = require("./payments.controller");
async function paymentRoutes(fastify) {
    // Stripe routes (protected)
    fastify.post('/stripe/create-session', {
        onRequest: [fastify.authenticate]
    }, payments_controller_1.initiateStripeHandler);
    // Stripe webhook (public, but verified by signature)
    fastify.post('/stripe/webhook', {
        config: {
            rawBody: true // Required for Stripe signature verification
        }
    }, payments_controller_1.stripeWebhookHandler);
    // Manual payment routes (protected)
    fastify.post('/manual/request', {
        onRequest: [fastify.authenticate]
    }, payments_controller_1.initiateManualHandler);
    fastify.post('/manual/upload-proof', {
        onRequest: [fastify.authenticate]
    }, payments_controller_1.uploadProofHandler);
}

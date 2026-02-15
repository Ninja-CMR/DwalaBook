import { FastifyInstance } from 'fastify';
import {
    isAdmin,
    getPendingPaymentsHandler,
    activatePaymentHandler,
    getUsersHandler,
    manualActivateHandler
} from './admin.controller';

export async function adminRoutes(fastify: FastifyInstance) {
    // All admin routes require authentication AND admin role
    const adminMiddleware = [
        (fastify as any).authenticate,
        isAdmin
    ];

    // Get pending payments
    fastify.get('/pending-payments', {
        onRequest: adminMiddleware
    }, getPendingPaymentsHandler);

    // Activate a specific payment
    fastify.post('/activate-payment/:id', {
        onRequest: adminMiddleware
    }, activatePaymentHandler);

    // Get all users with subscription status
    fastify.get('/users', {
        onRequest: adminMiddleware
    }, getUsersHandler);

    // Manually activate a plan for a user
    fastify.post('/manual-activate', {
        onRequest: adminMiddleware
    }, manualActivateHandler);
}

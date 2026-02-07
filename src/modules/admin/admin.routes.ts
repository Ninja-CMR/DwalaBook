import { FastifyInstance } from 'fastify';
import { getPendingPaymentsHandler, approvePaymentHandler, rejectPaymentHandler, getAllUsersHandler } from './admin.controller';

export async function adminRoutes(fastify: FastifyInstance) {
    // Shared middleware for authentication (and ideally authorized role check)
    fastify.addHook('onRequest', async (request: any, reply) => {
        try {
            console.log(`[ADMIN MIDDLEWARE] Incoming request to ${request.url}`);
            await request.jwtVerify();
            console.log('[ADMIN MIDDLEWARE] Auth Success for user:', request.user);
            // TODO: Add admin role check here: request.user.role === 'admin'
        } catch (err: any) {
            console.error('[ADMIN MIDDLEWARE] Auth Failed:', err.message);
            // reply.send(err); // Let's see if this was swallowing errors without logging
            reply.code(401).send({ message: 'Unauthorized', error: err.message });
        }
    });

    fastify.get('/payments/pending', getPendingPaymentsHandler);
    fastify.post('/payments/approve', approvePaymentHandler);
    fastify.post('/payments/reject', rejectPaymentHandler);
    fastify.get('/users', getAllUsersHandler);
}

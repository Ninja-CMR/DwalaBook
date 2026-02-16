import { FastifyInstance, FastifyReply } from 'fastify';
import { query } from '../../databases';
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

    // Reject a specific payment
    fastify.post('/reject-payment/:id', {
        onRequest: adminMiddleware
    }, async (req: any, reply: FastifyReply) => {
        try {
            const { id } = req.params;
            const paymentId = parseInt(id);
            if (isNaN(paymentId)) return reply.code(400).send({ message: 'ID invalide' });

            await query('UPDATE PAYMENTS SET status = $1 WHERE id = $2', ['failed', paymentId]);
            return reply.send({ message: 'Paiement rejeté' });
        } catch (err) {
            req.log.error(err);
            return reply.code(500).send({ message: 'Erreur lors du rejet' });
        }
    });

    // Get all users
    fastify.get('/users', {
        onRequest: adminMiddleware
    }, getUsersHandler);
}

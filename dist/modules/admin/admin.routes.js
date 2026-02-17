"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRoutes = adminRoutes;
const databases_1 = require("../../databases");
const admin_controller_1 = require("./admin.controller");
async function adminRoutes(fastify) {
    // All admin routes require authentication AND admin role
    const adminMiddleware = [
        fastify.authenticate,
        admin_controller_1.isAdmin
    ];
    // Get pending payments
    fastify.get('/pending-payments', {
        onRequest: adminMiddleware
    }, admin_controller_1.getPendingPaymentsHandler);
    // Activate a specific payment
    fastify.post('/activate-payment/:id', {
        onRequest: adminMiddleware
    }, admin_controller_1.activatePaymentHandler);
    // Reject a specific payment
    fastify.post('/reject-payment/:id', {
        onRequest: adminMiddleware
    }, async (req, reply) => {
        try {
            const { id } = req.params;
            const paymentId = parseInt(id);
            if (isNaN(paymentId))
                return reply.code(400).send({ message: 'ID invalide' });
            await (0, databases_1.query)('UPDATE PAYMENTS SET status = $1 WHERE id = $2', ['failed', paymentId]);
            return reply.send({ message: 'Paiement rejeté' });
        }
        catch (err) {
            req.log.error(err);
            return reply.code(500).send({ message: 'Erreur lors du rejet' });
        }
    });
    // Get all users
    fastify.get('/users', {
        onRequest: adminMiddleware
    }, admin_controller_1.getUsersHandler);
}

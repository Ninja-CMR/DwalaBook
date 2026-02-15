"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRoutes = adminRoutes;
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
    // Get all users with subscription status
    fastify.get('/users', {
        onRequest: adminMiddleware
    }, admin_controller_1.getUsersHandler);
    // Manually activate a plan for a user
    fastify.post('/manual-activate', {
        onRequest: adminMiddleware
    }, admin_controller_1.manualActivateHandler);
}

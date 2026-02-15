"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.manualActivateHandler = exports.getUsersHandler = exports.activatePaymentHandler = exports.getPendingPaymentsHandler = exports.isAdmin = void 0;
const databases_1 = require("../../databases");
const payments_service_1 = require("../payments/payments.service");
const subscription_service_1 = require("../subscriptions/subscription.service");
/**
 * Middleware to check if user is admin
 */
const isAdmin = async (request, reply) => {
    const user = request.user;
    if (!user || user.role !== 'admin') {
        return reply.code(403).send({ message: 'Accès refusé. Admin uniquement.' });
    }
};
exports.isAdmin = isAdmin;
/**
 * Get all pending manual payments
 */
const getPendingPaymentsHandler = async (req, reply) => {
    try {
        const result = await (0, databases_1.query)('SELECT * FROM PAYMENTS WHERE status = $1', ['pending']);
        const payments = result.rows;
        // Enrich with user info
        const enrichedPayments = await Promise.all(payments.map(async (payment) => {
            const userResult = await (0, databases_1.query)('SELECT id, name, email FROM USERS WHERE id = $1', [payment.user_id]);
            return {
                ...payment,
                user: userResult.rows[0]
            };
        }));
        return reply.send({ payments: enrichedPayments });
    }
    catch (err) {
        req.log.error({ err }, 'Get pending payments error');
        return reply.code(500).send({ message: 'Erreur serveur' });
    }
};
exports.getPendingPaymentsHandler = getPendingPaymentsHandler;
/**
 * Activate a manual payment
 */
const activatePaymentHandler = async (req, reply) => {
    try {
        const { id } = req.params;
        const admin = req.user;
        const paymentId = parseInt(id);
        if (isNaN(paymentId)) {
            return reply.code(400).send({ message: 'ID invalide' });
        }
        const result = await (0, payments_service_1.activateManualPayment)(paymentId, admin.id);
        return reply.send({
            message: 'Paiement activé avec succès',
            ...result
        });
    }
    catch (err) {
        req.log.error({ err }, 'Activate payment error');
        return reply.code(500).send({
            message: err.message || 'Erreur lors de l\'activation'
        });
    }
};
exports.activatePaymentHandler = activatePaymentHandler;
/**
 * Get all users with subscription status
 */
const getUsersHandler = async (req, reply) => {
    try {
        const result = await (0, databases_1.query)('SELECT id, name, email, plan, plan_expire_at, created_at FROM USERS', []);
        const users = result.rows.map((user) => {
            const status = {
                ...user,
                is_active: user.plan !== 'free'
            };
            if (user.plan_expire_at) {
                const expireDate = new Date(user.plan_expire_at);
                const daysLeft = Math.ceil((expireDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                status.days_left = Math.max(0, daysLeft);
                status.is_expiring_soon = daysLeft <= 7 && daysLeft > 0;
            }
            return status;
        });
        return reply.send({ users });
    }
    catch (err) {
        req.log.error({ err }, 'Get users error');
        return reply.code(500).send({ message: 'Erreur serveur' });
    }
};
exports.getUsersHandler = getUsersHandler;
/**
 * Manually activate a plan for a user (direct activation)
 */
const manualActivateHandler = async (req, reply) => {
    try {
        const { user_id, plan, duration_days } = req.body;
        if (!user_id || !plan) {
            return reply.code(400).send({ message: 'user_id et plan requis' });
        }
        if (!['starter', 'pro'].includes(plan)) {
            return reply.code(400).send({ message: 'Plan invalide' });
        }
        const subscription = await (0, subscription_service_1.activateSubscription)(user_id, plan, duration_days || 30);
        return reply.send({
            message: `Plan ${plan} activé avec succès`,
            subscription
        });
    }
    catch (err) {
        req.log.error({ err }, 'Manual activation error');
        return reply.code(500).send({
            message: err.message || 'Erreur lors de l\'activation'
        });
    }
};
exports.manualActivateHandler = manualActivateHandler;

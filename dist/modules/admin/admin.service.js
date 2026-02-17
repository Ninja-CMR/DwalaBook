"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllUsers = exports.rejectPayment = exports.approvePayment = exports.getPendingPayments = void 0;
const databases_1 = require("../../databases");
const payments_service_1 = require("../payments/payments.service");
const getPendingPayments = async () => {
    const res = await (0, databases_1.query)(`
        SELECT p.*, u.name as user_name, u.email as user_email
        FROM PAYMENTS p
        JOIN USERS u ON p.user_id = u.id
        WHERE p.status = 'pending_review'
        ORDER BY p.created_at DESC
    `);
    return res.rows;
};
exports.getPendingPayments = getPendingPayments;
const email_service_1 = require("../email/email.service");
const approvePayment = async (transactionId) => {
    const payment = await (0, payments_service_1.updatePaymentStatus)(transactionId, 'approved');
    if (payment && payment.user_id) {
        const userRes = await (0, databases_1.query)('SELECT email FROM USERS WHERE id = $1', [payment.user_id]);
        const userEmail = userRes.rows[0]?.email;
        if (userEmail) {
            await (0, email_service_1.sendPaymentApprovedNotification)(userEmail, payment.plan);
        }
    }
    return payment;
};
exports.approvePayment = approvePayment;
const rejectPayment = async (transactionId) => {
    return await (0, payments_service_1.updatePaymentStatus)(transactionId, 'failed');
};
exports.rejectPayment = rejectPayment;
const getAllUsers = async () => {
    const res = await (0, databases_1.query)('SELECT id, name, email, plan, plan_expire_at, appointment_limit FROM USERS ORDER BY id ASC');
    return res.rows;
};
exports.getAllUsers = getAllUsers;

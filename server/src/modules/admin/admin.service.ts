import { query } from '../../databases';
import { updatePaymentStatus } from '../payments/payments.service';

export const getPendingPayments = async () => {
    const res = await query(`
        SELECT p.*, u.name as user_name, u.email as user_email
        FROM PAYMENTS p
        JOIN USERS u ON p.user_id = u.id
        WHERE p.status = 'pending_review'
        ORDER BY p.created_at DESC
    `);
    return res.rows;
};

import { sendPaymentApprovedNotification } from '../email/email.service';

export const approvePayment = async (transactionId: string) => {
    const payment = await updatePaymentStatus(transactionId, 'approved');

    if (payment && payment.user_id) {
        const userRes = await query('SELECT email FROM USERS WHERE id = $1', [payment.user_id]);
        const userEmail = userRes.rows[0]?.email;
        if (userEmail) {
            await sendPaymentApprovedNotification(userEmail, payment.plan);
        }
    }
    return payment;
};

export const rejectPayment = async (transactionId: string) => {
    return await updatePaymentStatus(transactionId, 'failed');
};

export const getAllUsers = async () => {
    const res = await query('SELECT id, name, email, plan, plan_expire_at, appointment_limit FROM USERS ORDER BY id ASC');
    return res.rows;
};

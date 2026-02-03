import { query } from '../../databases';

export const initiateMonetbilPayment = async (userId: number, plan: 'starter' | 'pro', amount: number) => {
    // In a real scenario, you would call Monetbil API here.
    // We'll simulate the transaction ID and return a fake redirect URL for demo.
    const transactionId = `TXN_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    await query(
        'INSERT INTO PAYMENTS (user_id, provider, transaction_id, amount, plan, status) VALUES ($1, $2, $3, $4, $5, $6)',
        [userId, 'monetbil', transactionId, amount, plan, 'pending']
    );

    const serviceKey = process.env.MONETBIL_SERVICE_KEY;
    const paymentMode = process.env.PAYMENT_MODE || 'test';

    // Test mode: local redirect with auto-success
    if (paymentMode === 'test') {
        const mockUrl = `http://localhost:5173/payment-result?status=success&transaction_id=${transactionId}&plan=${plan}`;
        return {
            payment_url: mockUrl,
            transaction_id: transactionId,
            test_mode: true
        };
    }

    if (!serviceKey || serviceKey === 'YOUR_KEY') {
        throw new Error('Clé de service Monetbil non configurée en mode production.');
    }

    // Production Monetbil Widget URL
    const returnUrl = encodeURIComponent('http://localhost:5173/payment-result');
    const paymentUrl = `https://www.monetbil.com/pay/v2.1/widget?service_key=${serviceKey}&amount=${amount}&item_name=Plan_${plan}&transaction_id=${transactionId}&return_url=${returnUrl}`;

    return {
        payment_url: paymentUrl,
        transaction_id: transactionId,
        test_mode: false
    };
};

export const updatePaymentStatus = async (transactionId: string, status: 'success' | 'failed') => {
    const res = await query('UPDATE PAYMENTS SET status = $1 WHERE transaction_id = $2 RETURNING *', [status, transactionId]);
    const payment = res.rows[0];

    if (payment && status === 'success') {
        const plan = payment.plan;
        const limit = 999999;
        const expireAt = new Date();
        expireAt.setDate(expireAt.getDate() + 30); // 30 days sub

        if (payment.user_id) {
            await query(
                'UPDATE USERS SET plan = $1, appointment_limit = $2, plan_expire_at = $3 WHERE id = $4',
                [plan, limit, expireAt.toISOString(), payment.user_id]
            );
        }
    }
    return payment;
};

export const checkExpirations = async () => {
    // This would be run by a cron job in production
    // For now, we'll just expose it as a function
    // Logic: Find users where plan_expire_at < NOW() and reset to free
};

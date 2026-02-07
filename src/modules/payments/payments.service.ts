import { query } from '../../databases';
import Stripe from 'stripe';

const stripe = process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY)
    : null;

import { sendPaymentDeclarationAdminNotification } from '../email/email.service';

// Manual Payment Declaration (OM/MOMO)
export const declareManualPayment = async (userId: number, plan: 'starter' | 'pro', amount: number, transactionId: string, phone: string) => {
    console.log(`[PAYMENT SERVICE] Declaring manual payment for user ${userId}, txn: ${transactionId}`);

    // Check if a pending payment already exists for this transaction ID to avoid duplicates
    const existing = await query('SELECT * FROM PAYMENTS WHERE transaction_id = $1', [transactionId]);
    if (existing.rows.length > 0) {
        console.warn(`[PAYMENT SERVICE] Duplicate transaction detected: ${transactionId}`);
        throw new Error('Une transaction avec cet ID existe déjà.');
    }

    // Get user email
    const userRes = await query('SELECT email FROM USERS WHERE id = $1', [userId]);
    const userEmail = userRes.rows[0]?.email;

    // Insert pending payment
    await query(
        'INSERT INTO PAYMENTS (user_id, provider, transaction_id, amount, plan, status, phone) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [userId, 'manual', transactionId, amount, plan, 'pending_review', phone]
    );

    // Send email to Admin
    console.log(`[PAYMENT SERVICE] Sending admin notification for txn: ${transactionId}`);
    await sendPaymentDeclarationAdminNotification(amount, plan, transactionId, userEmail);
    console.log(`[PAYMENT SERVICE] Notification sent (or mocked).`);

    return {
        message: 'Paiement déclaré avec succès. En attente de validation par un administrateur.',
        status: 'pending_review',
        transaction_id: transactionId
    };
};

// Stripe Integration
export const initiateStripePayment = async (userId: number, plan: 'starter' | 'pro', amount: number) => {
    if (!stripe) {
        throw new Error('Stripe n\'est pas configuré sur le serveur.');
    }

    const priceId = plan === 'starter' ? process.env.STRIPE_PRICE_ID_STARTER : process.env.STRIPE_PRICE_ID_PRO;

    // For simplicity in this demo, we create a Checkout Session
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
            {
                price_data: {
                    currency: 'eur', // Stripe usually handles major currencies better
                    product_data: {
                        name: `Abonnement DwalaBook ${plan.toUpperCase()}`,
                    },
                    unit_amount: plan === 'starter' ? 500 : 1000, // 5€ / 10€ approx equivalent
                },
                quantity: 1,
            },
        ],
        mode: 'payment', // or 'subscription' if you set up recurring in Stripe
        success_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/payment-result?status=success&plan=${plan}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/payment-result?status=failure`,
        metadata: {
            userId: userId.toString(),
            plan: plan
        }
    });

    return {
        payment_url: session.url,
        transaction_id: session.id,
        test_mode: false
    };
};

export const updatePaymentStatus = async (transactionId: string, status: 'success' | 'failed' | 'approved') => {
    const res = await query('UPDATE PAYMENTS SET status = $1 WHERE transaction_id = $2 RETURNING *', [status, transactionId]);
    const payment = res.rows[0];

    if (payment && (status === 'success' || status === 'approved')) {
        const plan = payment.plan;
        const limit = 999999;
        const expireAt = new Date();
        expireAt.setDate(expireAt.getDate() + 30); // 30 days sub

        if (payment.user_id) {
            await query(
                'UPDATE USERS SET plan = $1, appointment_limit = $2, plan_expire_at = $3 WHERE id = $4',
                [plan, limit, expireAt.toISOString(), payment.user_id]
            );
            console.log(`[SUBSCRIPTION] User ${payment.user_id} upgraded to ${plan}`);
        }
    }
    return payment;
};

export const checkExpirations = async () => {
    // This would be run by a cron job in production
    // Logic: Find users where plan_expire_at < NOW() and reset to free
};

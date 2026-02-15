import Stripe from 'stripe';
import { query } from '../../databases';
import { activateSubscription } from '../subscriptions/subscription.service';
import { sendPaymentConfirmation } from '../notifications/notifications.service';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2026-01-28.clover'
});

/**
 * Create a Stripe Checkout Session for subscription payment
 */
export const initiateStripePayment = async (
    userId: number,
    plan: 'starter' | 'pro',
    amount: number
) => {
    const transactionId = `STRIPE_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create payment record
    await query(
        'INSERT INTO PAYMENTS (user_id, provider, transaction_id, amount, plan, status) VALUES ($1, $2, $3, $4, $5, $6)',
        [userId, 'stripe', transactionId, amount, plan, 'pending']
    );

    // Get user info for metadata
    const userResult = await query('SELECT * FROM USERS WHERE id = $1', [userId]);
    const user = userResult.rows[0];

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
            {
                price_data: {
                    currency: 'xaf', // Central African CFA franc
                    product_data: {
                        name: `DwalaBook ${plan.toUpperCase()}`,
                        description: `Abonnement mensuel (30 jours)`,
                    },
                    unit_amount: amount, // Stripe uses smallest currency unit (no decimals for XAF)
                },
                quantity: 1,
            },
        ],
        mode: 'payment',
        success_url: `${process.env.CLIENT_URL}/payment-result?status=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.CLIENT_URL}/pricing?canceled=true`,
        client_reference_id: transactionId,
        customer_email: user.email,
        metadata: {
            user_id: userId.toString(),
            plan,
            transaction_id: transactionId
        }
    });

    console.log(`[STRIPE] Created checkout session for user ${userId}, plan ${plan}`);

    return {
        session_id: session.id,
        checkout_url: session.url,
        transaction_id: transactionId
    };
};

/**
 * Handle Stripe webhook events
 */
export const handleStripeWebhook = async (event: Stripe.Event) => {
    console.log(`[STRIPE] Webhook received: ${event.type}`);

    switch (event.type) {
        case 'checkout.session.completed': {
            const session = event.data.object as Stripe.Checkout.Session;
            const transactionId = session.client_reference_id;
            const userId = parseInt(session.metadata?.user_id || '0');
            const plan = session.metadata?.plan as 'starter' | 'pro';

            if (!transactionId || !userId || !plan) {
                console.error('[STRIPE] Missing metadata in webhook');
                return;
            }

            // Update payment status
            await query(
                'UPDATE PAYMENTS SET status = $1 WHERE transaction_id = $2',
                ['success', transactionId]
            );

            // Activate subscription
            const subscription = await activateSubscription(userId, plan, 30);

            // Get user for notification
            const userResult = await query('SELECT * FROM USERS WHERE id = $1', [userId]);
            const user = userResult.rows[0];

            // Send confirmation email
            const amount = session.amount_total || 0;
            await sendPaymentConfirmation(user, plan, amount, subscription.expires_at);

            console.log(`[STRIPE] Payment successful for user ${userId}, plan ${plan} activated`);
            break;
        }

        case 'checkout.session.expired':
        case 'payment_intent.payment_failed': {
            const session = event.data.object as any;
            const transactionId = session.client_reference_id || session.metadata?.transaction_id;

            if (transactionId) {
                await query(
                    'UPDATE PAYMENTS SET status = $1 WHERE transaction_id = $2',
                    ['failed', transactionId]
                );
                console.log(`[STRIPE] Payment failed for transaction ${transactionId}`);
            }
            break;
        }

        default:
            console.log(`[STRIPE] Unhandled event type: ${event.type}`);
    }
};

/**
 * Create a manual payment request (OM/MTN)
 */
export const createManualPaymentRequest = async (
    userId: number,
    plan: 'starter' | 'pro',
    amount: number,
    method: 'om' | 'mtn'
) => {
    const transactionId = `${method.toUpperCase()}_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    await query(
        'INSERT INTO PAYMENTS (user_id, provider, transaction_id, amount, plan, status) VALUES ($1, $2, $3, $4, $5, $6)',
        [userId, method, transactionId, amount, plan, 'pending']
    );

    console.log(`[MANUAL PAYMENT] Created ${method.toUpperCase()} payment request for user ${userId}`);

    return {
        transaction_id: transactionId,
        payment_number: method === 'om' ? process.env.OM_PAYMENT_NUMBER : process.env.MTN_PAYMENT_NUMBER,
        amount,
        plan
    };
};

/**
 * Upload payment proof for manual payment
 */
export const uploadPaymentProof = async (transactionId: string, proofUrl: string) => {
    const result = await query(
        'SELECT * FROM PAYMENTS WHERE transaction_id = $1',
        [transactionId]
    );

    const payment = result.rows[0];
    if (!payment) {
        throw new Error('Payment not found');
    }

    // Update payment with proof
    payment.payment_proof = proofUrl;
    await query(
        'UPDATE PAYMENTS SET payment_proof = $1 WHERE transaction_id = $2',
        [proofUrl, transactionId]
    );

    console.log(`[MANUAL PAYMENT] Proof uploaded for transaction ${transactionId}`);

    return payment;
};

/**
 * Activate manual payment (admin only)
 */
export const activateManualPayment = async (paymentId: number, adminId: number) => {
    const result = await query('SELECT * FROM PAYMENTS WHERE id = $1', [paymentId]);
    const payment = result.rows[0];

    if (!payment) {
        throw new Error('Payment not found');
    }

    if (payment.status === 'success') {
        throw new Error('Payment already activated');
    }

    // Update payment status
    await query(
        'UPDATE PAYMENTS SET status = $1, activated_by = $2 WHERE id = $3',
        ['success', adminId, paymentId]
    );

    // Activate subscription
    const subscription = await activateSubscription(payment.user_id, payment.plan, 30);

    // Get user for notification
    const userResult = await query('SELECT * FROM USERS WHERE id = $1', [payment.user_id]);
    const user = userResult.rows[0];

    // Send confirmation email
    await sendPaymentConfirmation(user, payment.plan, payment.amount, subscription.expires_at);

    console.log(`[MANUAL PAYMENT] Payment ${paymentId} activated by admin ${adminId}`);

    return {
        payment,
        subscription
    };
};

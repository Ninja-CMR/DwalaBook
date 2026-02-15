import { FastifyReply, FastifyRequest } from 'fastify';
import { query } from '../../databases';
import { activateManualPayment } from '../payments/payments.service';
import { activateSubscription } from '../subscriptions/subscription.service';

/**
 * Middleware to check if user is admin
 */
export const isAdmin = async (request: any, reply: FastifyReply) => {
    const user = request.user;

    if (!user || user.role !== 'admin') {
        return reply.code(403).send({ message: 'Accès refusé. Admin uniquement.' });
    }
};

/**
 * Get all pending manual payments
 */
export const getPendingPaymentsHandler = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
        const result = await query('SELECT * FROM PAYMENTS WHERE status = $1', ['pending']);
        const payments = result.rows;

        // Enrich with user info
        const enrichedPayments = await Promise.all(
            payments.map(async (payment: any) => {
                const userResult = await query('SELECT id, name, email FROM USERS WHERE id = $1', [payment.user_id]);
                return {
                    ...payment,
                    user: userResult.rows[0]
                };
            })
        );

        return reply.send({ payments: enrichedPayments });
    } catch (err) {
        req.log.error({ err }, 'Get pending payments error');
        return reply.code(500).send({ message: 'Erreur serveur' });
    }
};

/**
 * Activate a manual payment
 */
export const activatePaymentHandler = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
        const { id } = req.params as { id: string };
        const admin = (req as any).user as { id: number };

        const paymentId = parseInt(id);
        if (isNaN(paymentId)) {
            return reply.code(400).send({ message: 'ID invalide' });
        }

        const result = await activateManualPayment(paymentId, admin.id);

        return reply.send({
            message: 'Paiement activé avec succès',
            ...result
        });
    } catch (err) {
        req.log.error({ err }, 'Activate payment error');
        return reply.code(500).send({
            message: (err as any).message || 'Erreur lors de l\'activation'
        });
    }
};

/**
 * Get all users with subscription status
 */
export const getUsersHandler = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
        const result = await query('SELECT id, name, email, plan, plan_expire_at, created_at FROM USERS', []);
        const users = result.rows.map((user: any) => {
            const status: any = {
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
    } catch (err) {
        req.log.error({ err }, 'Get users error');
        return reply.code(500).send({ message: 'Erreur serveur' });
    }
};

/**
 * Manually activate a plan for a user (direct activation)
 */
export const manualActivateHandler = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
        const { user_id, plan, duration_days } = req.body as {
            user_id: number;
            plan: 'starter' | 'pro';
            duration_days?: number;
        };

        if (!user_id || !plan) {
            return reply.code(400).send({ message: 'user_id et plan requis' });
        }

        if (!['starter', 'pro'].includes(plan)) {
            return reply.code(400).send({ message: 'Plan invalide' });
        }

        const subscription = await activateSubscription(user_id, plan, duration_days || 30);

        return reply.send({
            message: `Plan ${plan} activé avec succès`,
            subscription
        });
    } catch (err) {
        req.log.error({ err }, 'Manual activation error');
        return reply.code(500).send({
            message: (err as any).message || 'Erreur lors de l\'activation'
        });
    }
};

import { FastifyReply, FastifyRequest } from 'fastify';
import { initiateMonetbilPayment, updatePaymentStatus } from './payments.service';

export const initiatePaymentHandler = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
        const user = req.user as { id: number };
        const { plan } = req.body as { plan: 'starter' | 'pro' };

        if (!['starter', 'pro'].includes(plan)) {
            return reply.code(400).send({ message: 'Plan invalide' });
        }

        const amount = plan === 'starter' ? 5000 : 10000;
        const result = await initiateMonetbilPayment(user.id, plan, amount);

        return reply.send(result);
    } catch (err) {
        req.log.error({ err }, 'Payment initiation error');
        return reply.code(500).send({
            message: "Erreur lors de l'initiation du paiement",
            error: (err as any).message
        });
    }
};

export const monetbilWebhookHandler = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
        const data = (req.body || req.query) as any;
        const { transaction_id, status } = data;

        req.log.info({ transaction_id, status }, 'Monetbil Webhook received');

        // Note: In production, verify Monetbil signature here!
        if (transaction_id && status === '1') {
            await updatePaymentStatus(transaction_id, 'success');
        } else if (transaction_id) {
            await updatePaymentStatus(transaction_id, 'failed');
        }

        return reply.send({ status: 'ok' });
    } catch (err) {
        req.log.error(err);
        return reply.code(500).send({ message: 'Webhook error' });
    }
};

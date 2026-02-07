import { FastifyReply, FastifyRequest } from 'fastify';
import { getPendingPayments, approvePayment, rejectPayment, getAllUsers } from './admin.service';

export const getPendingPaymentsHandler = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
        console.log('[ADMIN CONTROLLER] Fetching pending payments...');
        const payments = await getPendingPayments();
        console.log(`[ADMIN CONTROLLER] Found ${payments.length} payments.`);
        return reply.send(payments);
    } catch (err) {
        req.log.error(err);
        return reply.code(500).send({ message: 'Error fetching pending payments' });
    }
};

export const approvePaymentHandler = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
        const { transactionId } = req.body as { transactionId: string };
        const result = await approvePayment(transactionId);
        return reply.send(result);
    } catch (err) {
        req.log.error(err);
        return reply.code(500).send({ message: 'Error approving payment' });
    }
};

export const rejectPaymentHandler = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
        const { transactionId } = req.body as { transactionId: string };
        const result = await rejectPayment(transactionId);
        return reply.send(result);
    } catch (err) {
        req.log.error(err);
        return reply.code(500).send({ message: 'Error rejecting payment' });
    }
};

export const getAllUsersHandler = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
        const users = await getAllUsers();
        return reply.send(users);
    } catch (err) {
        req.log.error(err);
        return reply.code(500).send({ message: 'Error fetching users' });
    }
};

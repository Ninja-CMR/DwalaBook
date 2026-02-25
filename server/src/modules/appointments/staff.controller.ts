import { FastifyReply, FastifyRequest } from 'fastify';
import { getStaff, createStaff, updateStaff, deleteStaff } from './staff.service';

export const getStaffHandler = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
        const user = req.user as { id: number };
        const staff = await getStaff(user.id);
        return reply.send(staff);
    } catch (err) {
        req.log.error(err);
        return reply.code(500).send({ message: 'Erreur lors de la récupération du personnel' });
    }
};

export const createStaffHandler = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
        const user = req.user as { id: number };
        const { name, role, specialty } = req.body as { name: string, role: string, specialty?: string };
        if (!name || !role) {
            return reply.code(400).send({ message: 'Nom et rôle requis' });
        }
        const staff = await createStaff(user.id, name, role, specialty || null);
        return reply.code(201).send(staff);
    } catch (err) {
        req.log.error(err);
        return reply.code(500).send({ message: 'Erreur lors de la création du membre du personnel' });
    }
};

export const updateStaffHandler = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
        const user = req.user as { id: number };
        const { id } = req.params as { id: string };
        const { name, role, specialty, is_active } = req.body as { name: string, role: string, specialty?: string, is_active: boolean };
        const updated = await updateStaff(Number(id), user.id, name, role, specialty || null, is_active);
        return reply.send(updated);
    } catch (err) {
        req.log.error(err);
        return reply.code(500).send({ message: 'Erreur lors de la mise à jour du membre du personnel' });
    }
};

export const deleteStaffHandler = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
        const user = req.user as { id: number };
        const { id } = req.params as { id: string };
        await deleteStaff(Number(id), user.id);
        return reply.code(204).send();
    } catch (err) {
        req.log.error(err);
        return reply.code(500).send({ message: 'Erreur lors de la suppression du membre du personnel' });
    }
};

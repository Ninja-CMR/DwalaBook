import { FastifyReply, FastifyRequest } from 'fastify';
import { getInventory, createInventoryItem, updateInventoryItem, deleteInventoryItem } from './inventory.service';

export const getInventoryHandler = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
        const user = req.user as { id: number };
        const inventory = await getInventory(user.id);
        return reply.send(inventory);
    } catch (err) {
        req.log.error(err);
        return reply.code(500).send({ message: 'Erreur lors de la récupération de l\'inventaire' });
    }
};

export const createInventoryHandler = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
        const user = req.user as { id: number };
        const { name, quantity, alert_threshold, unit_price } = req.body as { name: string, quantity: number, alert_threshold: number, unit_price: number };
        if (!name || quantity === undefined) {
            return reply.code(400).send({ message: 'Nom et quantité requis' });
        }
        const item = await createInventoryItem(user.id, name, quantity, alert_threshold || 0, unit_price || 0);
        return reply.code(201).send(item);
    } catch (err) {
        req.log.error(err);
        return reply.code(500).send({ message: 'Erreur lors de la création de l\'article' });
    }
};

export const updateInventoryHandler = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
        const user = req.user as { id: number };
        const { id } = req.params as { id: string };
        const { name, quantity, alert_threshold, unit_price } = req.body as { name: string, quantity: number, alert_threshold: number, unit_price: number };
        const updated = await updateInventoryItem(Number(id), user.id, name, quantity, alert_threshold || 0, unit_price || 0);
        return reply.send(updated);
    } catch (err) {
        req.log.error(err);
        return reply.code(500).send({ message: 'Erreur lors de la mise à jour de l\'article' });
    }
};

export const deleteInventoryHandler = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
        const user = req.user as { id: number };
        const { id } = req.params as { id: string };
        await deleteInventoryItem(Number(id), user.id);
        return reply.code(204).send();
    } catch (err) {
        req.log.error(err);
        return reply.code(500).send({ message: 'Erreur lors de la suppression de l\'article' });
    }
};

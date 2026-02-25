import { FastifyInstance } from 'fastify';
import { getInventoryHandler, createInventoryHandler, updateInventoryHandler, deleteInventoryHandler } from './inventory.controller';

export async function inventoryRoutes(fastify: FastifyInstance) {
    fastify.addHook('onRequest', (fastify as any).authenticate);

    fastify.get('/', getInventoryHandler);
    fastify.post('/', createInventoryHandler);
    fastify.put('/:id', updateInventoryHandler);
    fastify.delete('/:id', deleteInventoryHandler);
}

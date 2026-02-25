import { FastifyInstance } from 'fastify';
import { getStaffHandler, createStaffHandler, updateStaffHandler, deleteStaffHandler } from './staff.controller';

export async function staffRoutes(fastify: FastifyInstance) {
    fastify.addHook('onRequest', (fastify as any).authenticate);

    fastify.get('/', getStaffHandler);
    fastify.post('/', createStaffHandler);
    fastify.put('/:id', updateStaffHandler);
    fastify.delete('/:id', deleteStaffHandler);
}

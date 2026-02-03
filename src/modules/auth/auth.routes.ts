import { FastifyInstance } from 'fastify';
import { loginHandler, registerHandler, upgradeHandler, updateProfileHandler } from './auth.controller';

export async function authRoutes(fastify: FastifyInstance) {
    fastify.post('/register', registerHandler);
    fastify.post('/login', loginHandler);
    fastify.post('/upgrade', { onRequest: [(fastify as any).authenticate] }, upgradeHandler);
    fastify.put('/me', { onRequest: [(fastify as any).authenticate] }, updateProfileHandler);
    fastify.get('/me', { onRequest: [(fastify as any).authenticate] }, async (req: any) => {
        // Return full user data from token or database
        return { user: req.user };
    });
}

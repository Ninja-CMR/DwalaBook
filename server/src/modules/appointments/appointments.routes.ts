import { FastifyInstance } from 'fastify';
import { createAppointmentHandler, getAppointmentsHandler, updateAppointmentStatusHandler } from './appointments.controller';
import { getCurrentMonthAppointmentCount } from './appointments.service';

export async function appointmentRoutes(fastify: FastifyInstance) {
    fastify.addHook('onRequest', async (request, reply) => {
        try {
            await request.jwtVerify();
        } catch (err) {
            return reply.code(401).send({ message: 'Session expirée ou invalide. Veuillez vous reconnecter.' });
        }
    });

    fastify.post('/', {
        preHandler: async (request: any, reply) => {
            try {
                const user = request.user as { id: number; plan: string };
                if (!user || !user.id) {
                    return reply.code(401).send({ message: 'Session invalide' });
                }

                const count = await getCurrentMonthAppointmentCount(user.id);

                if (user.plan === 'free' && count >= 5) {
                    return reply.code(403).send({
                        message: 'Limite de rendez-vous atteinte (5/mois). Passez au plan Starter pour un accès illimité.',
                        code: 'LIMIT_REACHED'
                    });
                }
            } catch (err) {
                request.log.error(err);
                return reply.code(500).send({ message: 'Erreur interne lors de la vérification' });
            }
        }
    }, createAppointmentHandler);
    fastify.get('/', getAppointmentsHandler);
    fastify.patch('/:id/status', updateAppointmentStatusHandler);
}

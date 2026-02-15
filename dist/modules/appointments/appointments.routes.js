"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appointmentRoutes = appointmentRoutes;
const appointments_controller_1 = require("./appointments.controller");
const appointments_service_1 = require("./appointments.service");
async function appointmentRoutes(fastify) {
    fastify.addHook('onRequest', async (request, reply) => {
        try {
            await request.jwtVerify();
        }
        catch (err) {
            return reply.code(401).send({ message: 'Session expirée ou invalide. Veuillez vous reconnecter.' });
        }
    });
    fastify.post('/', {
        preHandler: async (request, reply) => {
            try {
                const user = request.user;
                if (!user || !user.id) {
                    return reply.code(401).send({ message: 'Session invalide' });
                }
                const count = await (0, appointments_service_1.getCurrentMonthAppointmentCount)(user.id);
                if (user.plan === 'free' && count >= 5) {
                    return reply.code(403).send({
                        message: 'Limite de rendez-vous atteinte (5/mois). Passez au plan Starter pour un accès illimité.',
                        code: 'LIMIT_REACHED'
                    });
                }
            }
            catch (err) {
                request.log.error(err);
                return reply.code(500).send({ message: 'Erreur interne lors de la vérification' });
            }
        }
    }, appointments_controller_1.createAppointmentHandler);
    fastify.get('/', appointments_controller_1.getAppointmentsHandler);
    fastify.patch('/:id/status', appointments_controller_1.updateAppointmentStatusHandler);
}

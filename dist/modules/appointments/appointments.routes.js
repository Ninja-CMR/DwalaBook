"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appointmentRoutes = appointmentRoutes;
const appointments_controller_1 = require("./appointments.controller");
async function appointmentRoutes(fastify) {
    fastify.addHook('onRequest', async (request, reply) => {
        try {
            await request.jwtVerify();
        }
        catch (err) {
            reply.send(err);
        }
    });
    fastify.post('/', appointments_controller_1.createAppointmentHandler);
    fastify.get('/', appointments_controller_1.getAppointmentsHandler);
    fastify.patch('/:id/status', appointments_controller_1.updateAppointmentStatusHandler);
}

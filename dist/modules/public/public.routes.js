"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publicRoutes = publicRoutes;
const auth_service_1 = require("../auth/auth.service");
const appointments_service_1 = require("../appointments/appointments.service");
async function publicRoutes(fastify) {
    fastify.get('/business/:slug', async (req, reply) => {
        try {
            const { slug } = req.params;
            const business = await (0, auth_service_1.findUserBySlug)(slug);
            if (!business) {
                return reply.code(404).send({ message: 'Entreprise non trouvée' });
            }
            return reply.send(business);
        }
        catch (err) {
            req.log.error(err);
            return reply.code(500).send({ message: 'Erreur lors de la récupération' });
        }
    });
    fastify.post('/booking/:slug', async (req, reply) => {
        try {
            const { slug } = req.params;
            const business = await (0, auth_service_1.findUserBySlug)(slug);
            if (!business) {
                return reply.code(404).send({ message: 'Entreprise non trouvée' });
            }
            const { customer_name, email, phone, date, service, notes } = req.body;
            if (!customer_name || !date || !service) {
                return reply.code(400).send({ message: 'Champs requis manquants' });
            }
            const appointment = await (0, appointments_service_1.createAppointment)(business.id, {
                customer_name,
                email,
                phone,
                date,
                service,
                notes
            });
            return reply.code(201).send(appointment);
        }
        catch (err) {
            req.log.error(err);
            return reply.code(500).send({ message: 'Erreur lors de la réservation' });
        }
    });
}

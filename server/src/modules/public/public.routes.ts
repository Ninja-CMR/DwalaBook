import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { findUserBySlug } from '../auth/auth.service';
import { createAppointment } from '../appointments/appointments.service';

export async function publicRoutes(fastify: FastifyInstance) {
    fastify.get('/business/:slug', async (req: FastifyRequest, reply: FastifyReply) => {
        try {
            const { slug } = req.params as { slug: string };
            const business = await findUserBySlug(slug);
            if (!business) {
                return reply.code(404).send({ message: 'Entreprise non trouvée' });
            }
            return reply.send(business);
        } catch (err) {
            req.log.error(err);
            return reply.code(500).send({ message: 'Erreur lors de la récupération' });
        }
    });

    fastify.post('/booking/:slug', async (req: FastifyRequest, reply: FastifyReply) => {
        try {
            const { slug } = req.params as { slug: string };
            const business = await findUserBySlug(slug);
            if (!business) {
                return reply.code(404).send({ message: 'Entreprise non trouvée' });
            }

            const { customer_name, email, phone, date, service, notes } = req.body as any;
            if (!customer_name || !date || !service) {
                return reply.code(400).send({ message: 'Champs requis manquants' });
            }

            const appointment = await createAppointment(
                business.id,
                {
                    customer_name,
                    email,
                    phone,
                    date,
                    service,
                    notes
                }
            );

            return reply.code(201).send(appointment);
        } catch (err) {
            req.log.error(err);
            return reply.code(500).send({ message: 'Erreur lors de la réservation' });
        }
    });
}

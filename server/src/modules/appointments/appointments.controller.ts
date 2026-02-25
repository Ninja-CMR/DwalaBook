import { FastifyReply, FastifyRequest } from 'fastify';
import { createAppointment, getAppointments, updateAppointmentStatus } from './appointments.service';

export const createAppointmentHandler = async (req: FastifyRequest, reply: FastifyReply) => {
    const user = req.user as { id: number };
    const { customer_name, phone, date, staff_name } = req.body as any;

    if (!customer_name || !date) {
        return reply.code(400).send({ message: 'Tous les champs sont requis' });
    }

    try {
        const appointment = await createAppointment(user.id, { customer_name, phone, date, staff_name });
        return reply.code(201).send(appointment);
    } catch (err) {
        req.log.error(err);
        return reply.code(500).send({ message: 'Erreur interne du serveur' });
    }
};

export const getAppointmentsHandler = async (req: FastifyRequest, reply: FastifyReply) => {
    const user = req.user as { id: number };
    const appointments = await getAppointments(user.id);
    return reply.send(appointments);
};

export const updateAppointmentStatusHandler = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
        const user = req.user as { id: number };
        const { id } = req.params as { id: string };
        const { status } = req.body as { status: string };

        if (!status) {
            return reply.code(400).send({ message: 'Statut manquant' });
        }

        const appointmentId = parseInt(id, 10);
        if (isNaN(appointmentId)) {
            return reply.code(400).send({ message: 'ID invalide' });
        }

        const updated = await updateAppointmentStatus(appointmentId, status, user.id);
        if (!updated) {
            return reply.code(404).send({ message: 'Rendez-vous introuvable' });
        }
        return reply.send(updated);
    } catch (err) {
        req.log.error(err);
        return reply.code(500).send({ message: 'Erreur lors de la mise à jour' });
    }
};

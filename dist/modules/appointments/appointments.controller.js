"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAppointmentStatusHandler = exports.getAppointmentsHandler = exports.createAppointmentHandler = void 0;
const appointments_service_1 = require("./appointments.service");
const createAppointmentHandler = async (req, reply) => {
    const user = req.user;
    const { customer_name, phone, date, staff_name } = req.body;
    if (!customer_name || !date) {
        return reply.code(400).send({ message: 'Tous les champs sont requis' });
    }
    try {
        const appointment = await (0, appointments_service_1.createAppointment)(user.id, { customer_name, phone, date, staff_name });
        return reply.code(201).send(appointment);
    }
    catch (err) {
        req.log.error(err);
        return reply.code(500).send({ message: 'Erreur interne du serveur' });
    }
};
exports.createAppointmentHandler = createAppointmentHandler;
const getAppointmentsHandler = async (req, reply) => {
    const user = req.user;
    const appointments = await (0, appointments_service_1.getAppointments)(user.id);
    return reply.send(appointments);
};
exports.getAppointmentsHandler = getAppointmentsHandler;
const updateAppointmentStatusHandler = async (req, reply) => {
    try {
        const user = req.user;
        const { id } = req.params;
        const { status } = req.body;
        if (!status) {
            return reply.code(400).send({ message: 'Statut manquant' });
        }
        const appointmentId = parseInt(id, 10);
        if (isNaN(appointmentId)) {
            return reply.code(400).send({ message: 'ID invalide' });
        }
        const updated = await (0, appointments_service_1.updateAppointmentStatus)(appointmentId, status, user.id);
        if (!updated) {
            return reply.code(404).send({ message: 'Rendez-vous introuvable' });
        }
        return reply.send(updated);
    }
    catch (err) {
        req.log.error(err);
        return reply.code(500).send({ message: 'Erreur lors de la mise à jour' });
    }
};
exports.updateAppointmentStatusHandler = updateAppointmentStatusHandler;

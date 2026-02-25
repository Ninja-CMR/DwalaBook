"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteStaffHandler = exports.updateStaffHandler = exports.createStaffHandler = exports.getStaffHandler = void 0;
const staff_service_1 = require("./staff.service");
const getStaffHandler = async (req, reply) => {
    try {
        const user = req.user;
        const staff = await (0, staff_service_1.getStaff)(user.id);
        return reply.send(staff);
    }
    catch (err) {
        req.log.error(err);
        return reply.code(500).send({ message: 'Erreur lors de la récupération du personnel' });
    }
};
exports.getStaffHandler = getStaffHandler;
const createStaffHandler = async (req, reply) => {
    try {
        const user = req.user;
        const { name, role, specialty } = req.body;
        if (!name || !role) {
            return reply.code(400).send({ message: 'Nom et rôle requis' });
        }
        const staff = await (0, staff_service_1.createStaff)(user.id, name, role, specialty || null);
        return reply.code(201).send(staff);
    }
    catch (err) {
        req.log.error(err);
        return reply.code(500).send({ message: 'Erreur lors de la création du membre du personnel' });
    }
};
exports.createStaffHandler = createStaffHandler;
const updateStaffHandler = async (req, reply) => {
    try {
        const user = req.user;
        const { id } = req.params;
        const { name, role, specialty, is_active } = req.body;
        const updated = await (0, staff_service_1.updateStaff)(Number(id), user.id, name, role, specialty || null, is_active);
        return reply.send(updated);
    }
    catch (err) {
        req.log.error(err);
        return reply.code(500).send({ message: 'Erreur lors de la mise à jour du membre du personnel' });
    }
};
exports.updateStaffHandler = updateStaffHandler;
const deleteStaffHandler = async (req, reply) => {
    try {
        const user = req.user;
        const { id } = req.params;
        await (0, staff_service_1.deleteStaff)(Number(id), user.id);
        return reply.code(204).send();
    }
    catch (err) {
        req.log.error(err);
        return reply.code(500).send({ message: 'Erreur lors de la suppression du membre du personnel' });
    }
};
exports.deleteStaffHandler = deleteStaffHandler;

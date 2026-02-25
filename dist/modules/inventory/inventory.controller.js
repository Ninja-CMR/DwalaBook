"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteInventoryHandler = exports.updateInventoryHandler = exports.createInventoryHandler = exports.getInventoryHandler = void 0;
const inventory_service_1 = require("./inventory.service");
const getInventoryHandler = async (req, reply) => {
    try {
        const user = req.user;
        const inventory = await (0, inventory_service_1.getInventory)(user.id);
        return reply.send(inventory);
    }
    catch (err) {
        req.log.error(err);
        return reply.code(500).send({ message: 'Erreur lors de la récupération de l\'inventaire' });
    }
};
exports.getInventoryHandler = getInventoryHandler;
const createInventoryHandler = async (req, reply) => {
    try {
        const user = req.user;
        const { name, quantity, alert_threshold, unit_price } = req.body;
        if (!name || quantity === undefined) {
            return reply.code(400).send({ message: 'Nom et quantité requis' });
        }
        const item = await (0, inventory_service_1.createInventoryItem)(user.id, name, quantity, alert_threshold || 0, unit_price || 0);
        return reply.code(201).send(item);
    }
    catch (err) {
        req.log.error(err);
        return reply.code(500).send({ message: 'Erreur lors de la création de l\'article' });
    }
};
exports.createInventoryHandler = createInventoryHandler;
const updateInventoryHandler = async (req, reply) => {
    try {
        const user = req.user;
        const { id } = req.params;
        const { name, quantity, alert_threshold, unit_price } = req.body;
        const updated = await (0, inventory_service_1.updateInventoryItem)(Number(id), user.id, name, quantity, alert_threshold || 0, unit_price || 0);
        return reply.send(updated);
    }
    catch (err) {
        req.log.error(err);
        return reply.code(500).send({ message: 'Erreur lors de la mise à jour de l\'article' });
    }
};
exports.updateInventoryHandler = updateInventoryHandler;
const deleteInventoryHandler = async (req, reply) => {
    try {
        const user = req.user;
        const { id } = req.params;
        await (0, inventory_service_1.deleteInventoryItem)(Number(id), user.id);
        return reply.code(204).send();
    }
    catch (err) {
        req.log.error(err);
        return reply.code(500).send({ message: 'Erreur lors de la suppression de l\'article' });
    }
};
exports.deleteInventoryHandler = deleteInventoryHandler;

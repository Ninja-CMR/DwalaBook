"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.staffRoutes = staffRoutes;
const staff_controller_1 = require("./staff.controller");
async function staffRoutes(fastify) {
    fastify.addHook('onRequest', fastify.authenticate);
    fastify.get('/', staff_controller_1.getStaffHandler);
    fastify.post('/', staff_controller_1.createStaffHandler);
    fastify.put('/:id', staff_controller_1.updateStaffHandler);
    fastify.delete('/:id', staff_controller_1.deleteStaffHandler);
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inventoryRoutes = inventoryRoutes;
const inventory_controller_1 = require("./inventory.controller");
async function inventoryRoutes(fastify) {
    fastify.addHook('onRequest', fastify.authenticate);
    fastify.get('/', inventory_controller_1.getInventoryHandler);
    fastify.post('/', inventory_controller_1.createInventoryHandler);
    fastify.put('/:id', inventory_controller_1.updateInventoryHandler);
    fastify.delete('/:id', inventory_controller_1.deleteInventoryHandler);
}

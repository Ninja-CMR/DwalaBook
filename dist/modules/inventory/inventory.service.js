"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteInventoryItem = exports.updateInventoryItem = exports.createInventoryItem = exports.getInventory = void 0;
const databases_1 = require("../../databases");
const getInventory = async (userId) => {
    const res = await (0, databases_1.query)('SELECT * FROM inventory WHERE user_id = $1', [userId]);
    return res.rows;
};
exports.getInventory = getInventory;
const createInventoryItem = async (userId, name, quantity, alertThreshold, unitPrice) => {
    const res = await (0, databases_1.query)('INSERT INTO inventory (user_id, name, quantity, alert_threshold, unit_price) VALUES ($1, $2, $3, $4, $5) RETURNING *', [userId, name, quantity, alertThreshold, unitPrice]);
    return res.rows[0];
};
exports.createInventoryItem = createInventoryItem;
const updateInventoryItem = async (itemId, userId, name, quantity, alertThreshold, unitPrice) => {
    const res = await (0, databases_1.query)('UPDATE inventory SET name = $1, quantity = $2, alert_threshold = $3, unit_price = $4 WHERE id = $5 AND user_id = $6 RETURNING *', [name, quantity, alertThreshold, unitPrice, itemId, userId]);
    return res.rows[0];
};
exports.updateInventoryItem = updateInventoryItem;
const deleteInventoryItem = async (itemId, userId) => {
    await (0, databases_1.query)('DELETE FROM inventory WHERE id = $1 AND user_id = $2', [itemId, userId]);
};
exports.deleteInventoryItem = deleteInventoryItem;

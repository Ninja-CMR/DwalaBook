"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteStaff = exports.updateStaff = exports.createStaff = exports.getStaff = void 0;
const databases_1 = require("../../databases");
const getStaff = async (userId) => {
    const res = await (0, databases_1.query)('SELECT * FROM staff WHERE user_id = $1', [userId]);
    return res.rows;
};
exports.getStaff = getStaff;
const createStaff = async (userId, name, role, specialty) => {
    // For SQL, we would use INSERT. For JSON fallback, we simulate it.
    // The query helper in src/databases/index.ts handles JSON INSERT for known tables.
    // I need to ensure the query helper supports INSERT INTO staff.
    const res = await (0, databases_1.query)('INSERT INTO staff (user_id, name, role, specialty, is_active) VALUES ($1, $2, $3, $4, $5) RETURNING *', [userId, name, role, specialty, true]);
    return res.rows[0];
};
exports.createStaff = createStaff;
const updateStaff = async (staffId, userId, name, role, specialty, isActive) => {
    const res = await (0, databases_1.query)('UPDATE staff SET name = $1, role = $2, specialty = $3, is_active = $4 WHERE id = $5 AND user_id = $6 RETURNING *', [name, role, specialty, isActive, staffId, userId]);
    return res.rows[0];
};
exports.updateStaff = updateStaff;
const deleteStaff = async (staffId, userId) => {
    await (0, databases_1.query)('DELETE FROM staff WHERE id = $1 AND user_id = $2', [staffId, userId]);
};
exports.deleteStaff = deleteStaff;

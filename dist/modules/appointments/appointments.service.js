"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAppointmentStatus = exports.getAppointments = exports.createAppointment = void 0;
const databases_1 = require("../../databases");
const createAppointment = async (userId, data) => {
    const res = await (0, databases_1.query)('INSERT INTO appointments (user_id, customer_name, phone, date) VALUES ($1, $2, $3, $4) RETURNING *', [userId, data.customer_name, data.phone, data.date]);
    return res.rows[0];
};
exports.createAppointment = createAppointment;
const getAppointments = async (userId) => {
    const res = await (0, databases_1.query)('SELECT * FROM appointments WHERE user_id = $1 ORDER BY date ASC', [userId]);
    return res.rows;
};
exports.getAppointments = getAppointments;
const updateAppointmentStatus = async (id, status, userId) => {
    const res = await (0, databases_1.query)('UPDATE appointments SET status = $1 WHERE id = $2 AND user_id = $3 RETURNING *', [status, id, userId]);
    return res.rows[0];
};
exports.updateAppointmentStatus = updateAppointmentStatus;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markReminderAsSent = exports.getAllScheduledAppointments = exports.getCurrentMonthAppointmentCount = exports.updateAppointmentStatus = exports.getAppointments = exports.createAppointment = void 0;
const databases_1 = require("../../databases");
const createAppointment = async (userId, data) => {
    const res = await (0, databases_1.query)('INSERT INTO appointments (user_id, customer_name, phone, email, date, staff_name, service, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *', [userId, data.customer_name, data.phone, data.email, data.date, data.staff_name || 'Équipe DwalaBook', data.service || null, data.notes || null]);
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
const getCurrentMonthAppointmentCount = async (userId) => {
    const appointments = await (0, exports.getAppointments)(userId);
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    return appointments.filter(a => {
        const d = new Date(a.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).length;
};
exports.getCurrentMonthAppointmentCount = getCurrentMonthAppointmentCount;
const getAllScheduledAppointments = async () => {
    // For admin/cron use to find reminders
    // Join with users to get the plan for notification channel decision
    const res = await (0, databases_1.query)(`SELECT a.*, u.plan 
         FROM appointments a 
         JOIN users u ON a.user_id = u.id 
         WHERE a.status = 'scheduled' AND a.last_reminder_sent IS NULL 
         LIMIT 100`, []);
    return res.rows;
};
exports.getAllScheduledAppointments = getAllScheduledAppointments;
const markReminderAsSent = async (id) => {
    await (0, databases_1.query)('UPDATE appointments SET last_reminder_sent = NOW() WHERE id = $1', [id]);
};
exports.markReminderAsSent = markReminderAsSent;

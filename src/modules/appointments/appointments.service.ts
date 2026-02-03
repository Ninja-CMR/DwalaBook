import { query } from '../../databases';

export const createAppointment = async (userId: number, data: { customer_name: string; phone: string; email?: string; date: string; staff_name?: string }) => {
    const res = await query(
        'INSERT INTO appointments (user_id, customer_name, phone, email, date, staff_name) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [userId, data.customer_name, data.phone, data.email, data.date, data.staff_name || 'Équipe DwalaBook']
    );
    return res.rows[0];
};

export const getAppointments = async (userId: number) => {
    const res = await query('SELECT * FROM appointments WHERE user_id = $1 ORDER BY date ASC', [userId]);
    return res.rows;
};

export const updateAppointmentStatus = async (id: number, status: string, userId: number) => {
    const res = await query(
        'UPDATE appointments SET status = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
        [status, id, userId]
    );
    return res.rows[0];
};
export const getCurrentMonthAppointmentCount = async (userId: number) => {
    const appointments = await getAppointments(userId);
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return appointments.filter(a => {
        const d = new Date(a.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).length;
    return appointments.filter(a => {
        const d = new Date(a.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).length;
};

export const getAllScheduledAppointments = async () => {
    // For admin/cron use to find reminders
    // Join with users to get the plan for notification channel decision
    const res = await query(
        `SELECT a.*, u.plan 
         FROM appointments a 
         JOIN users u ON a.user_id = u.id 
         WHERE a.status = 'scheduled' 
         LIMIT 100`,
        []
    );
    return res.rows;
};

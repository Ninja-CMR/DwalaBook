import { query } from '../../databases';

export const getStaff = async (userId: number) => {
    const res = await query('SELECT * FROM staff WHERE user_id = $1', [userId]);
    return res.rows;
};

export const createStaff = async (userId: number, name: string, role: string, specialty: string | null) => {
    // For SQL, we would use INSERT. For JSON fallback, we simulate it.
    // The query helper in src/databases/index.ts handles JSON INSERT for known tables.
    // I need to ensure the query helper supports INSERT INTO staff.
    const res = await query(
        'INSERT INTO staff (user_id, name, role, specialty, is_active) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [userId, name, role, specialty, true]
    );
    return res.rows[0];
};

export const updateStaff = async (staffId: number, userId: number, name: string, role: string, specialty: string | null, isActive: boolean) => {
    const res = await query(
        'UPDATE staff SET name = $1, role = $2, specialty = $3, is_active = $4 WHERE id = $5 AND user_id = $6 RETURNING *',
        [name, role, specialty, isActive, staffId, userId]
    );
    return res.rows[0];
};

export const deleteStaff = async (staffId: number, userId: number) => {
    await query('DELETE FROM staff WHERE id = $1 AND user_id = $2', [staffId, userId]);
};

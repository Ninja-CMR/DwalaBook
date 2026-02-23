import { query } from '../../databases';

export const getInventory = async (userId: number) => {
    const res = await query('SELECT * FROM inventory WHERE user_id = $1', [userId]);
    return res.rows;
};

export const createInventoryItem = async (userId: number, name: string, quantity: number, alertThreshold: number, unitPrice: number) => {
    const res = await query(
        'INSERT INTO inventory (user_id, name, quantity, alert_threshold, unit_price) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [userId, name, quantity, alertThreshold, unitPrice]
    );
    return res.rows[0];
};

export const updateInventoryItem = async (itemId: number, userId: number, name: string, quantity: number, alertThreshold: number, unitPrice: number) => {
    const res = await query(
        'UPDATE inventory SET name = $1, quantity = $2, alert_threshold = $3, unit_price = $4 WHERE id = $5 AND user_id = $6 RETURNING *',
        [name, quantity, alertThreshold, unitPrice, itemId, userId]
    );
    return res.rows[0];
};

export const deleteInventoryItem = async (itemId: number, userId: number) => {
    await query('DELETE FROM inventory WHERE id = $1 AND user_id = $2', [itemId, userId]);
};

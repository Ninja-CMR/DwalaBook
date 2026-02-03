import bcrypt from 'bcrypt';
import { query } from '../../databases';

export const findUserById = async (id: number) => {
    const res = await query('SELECT * FROM users WHERE id = $1', [id]);
    return res.rows[0];
};

export const findUserByEmail = async (email: string) => {
    const res = await query('SELECT * FROM users WHERE email = $1', [email]);
    return res.rows[0];
};

export const createUser = async (name: string, email: string, password: string) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const res = await query(
        'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, plan, appointment_limit',
        [name, email, hashedPassword]
    );
    return res.rows[0];
};

export const upgradeUserToPlan = async (id: number, plan: 'starter' | 'pro') => {
    const limit = 999999;
    const expireAt = new Date();
    expireAt.setDate(expireAt.getDate() + 30);
    const res = await query('UPDATE users SET plan = $1, appointment_limit = $2, plan_expire_at = $3 WHERE id = $4 RETURNING *', [plan, limit, expireAt.toISOString(), id]);
    return res.rows[0];
};

export const updateProfile = async (id: number, name: string, email: string) => {
    const res = await query('UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *', [name, email, id]);
    return res.rows[0];
};

export const checkAndResetExpiredPlan = async (user: any) => {
    try {
        if (!user || !user.id || user.plan === 'free' || !user.plan_expire_at) return user;

        const expiryDate = new Date(user.plan_expire_at);
        if (expiryDate < new Date()) {
            console.log(`Plan expired for user ${user.id}. Reverting to free.`);
            const res = await query('UPDATE users SET plan = $1, appointment_limit = $2, plan_expire_at = $3 WHERE id = $4 RETURNING *', ['free', 5, null, user.id]);
            return res.rows[0];
        }
    } catch (err) {
        console.error('Error in checkAndResetExpiredPlan:', err);
    }
    return user;
};

export const verifyPassword = async (password: string, hash: string) => {
    return await bcrypt.compare(password, hash);
};

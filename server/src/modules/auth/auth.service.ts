import bcrypt from 'bcrypt';
import { query } from '../../databases';

export const findUserById = async (id: number) => {
    const res = await query('SELECT * FROM users WHERE id = $1', [id]);
    return res.rows[0];
};

export const findUserBySlug = async (slug: string) => {
    const res = await query('SELECT id, name, email, plan, business_slug FROM users WHERE business_slug = $1', [slug]);
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

export const updateProfile = async (id: number, name: string, email: string, business_slug?: string, notifications?: { email: boolean, sms: boolean, whatsapp: boolean }) => {
    let sql = 'UPDATE users SET name = $1, email = $2, business_slug = $3';
    const params: any[] = [name, email, business_slug || null];

    if (notifications) {
        sql += ', email_notifications = $4, sms_notifications = $5, whatsapp_notifications = $6';
        params.push(notifications.email, notifications.sms, notifications.whatsapp);
        sql += ' WHERE id = $7 RETURNING *';
        params.push(id);
    } else {
        sql += ' WHERE id = $4 RETURNING *';
        params.push(id);
    }

    const res = await query(sql, params);
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

export const generateResetToken = async (email: string) => {
    const user = await findUserByEmail(email);
    if (!user) return null;

    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const expires = new Date();
    expires.setHours(expires.getHours() + 1); // 1 hour expiry

    await query('UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE id = $3', [token, expires.toISOString(), user.id]);
    return token;
};

export const findUserByResetToken = async (token: string) => {
    const res = await query('SELECT * FROM users WHERE reset_token = $1', [token]);
    const user = res.rows[0];
    if (!user) return null;

    if (new Date(user.reset_token_expires) < new Date()) {
        return null;
    }
    return user;
};

export const updatePassword = async (userId: number, newPassword: string) => {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await query('UPDATE users SET password = $1, reset_token = null, reset_token_expires = null WHERE id = $2', [hashedPassword, userId]);
};

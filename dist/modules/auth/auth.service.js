"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePassword = exports.findUserByResetToken = exports.generateResetToken = exports.verifyPassword = exports.checkAndResetExpiredPlan = exports.updateProfile = exports.upgradeUserToPlan = exports.createUser = exports.findUserByEmail = exports.findUserBySlug = exports.findUserById = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const databases_1 = require("../../databases");
const findUserById = async (id) => {
    const res = await (0, databases_1.query)('SELECT * FROM users WHERE id = $1', [id]);
    return res.rows[0];
};
exports.findUserById = findUserById;
const findUserBySlug = async (slug) => {
    const res = await (0, databases_1.query)('SELECT id, name, email, plan, business_slug FROM users WHERE business_slug = $1', [slug]);
    return res.rows[0];
};
exports.findUserBySlug = findUserBySlug;
const findUserByEmail = async (email) => {
    const res = await (0, databases_1.query)('SELECT * FROM users WHERE email = $1', [email]);
    return res.rows[0];
};
exports.findUserByEmail = findUserByEmail;
const createUser = async (name, email, password) => {
    const hashedPassword = await bcrypt_1.default.hash(password, 10);
    const res = await (0, databases_1.query)('INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, plan, appointment_limit', [name, email, hashedPassword]);
    return res.rows[0];
};
exports.createUser = createUser;
const upgradeUserToPlan = async (id, plan) => {
    const limit = 999999;
    const expireAt = new Date();
    expireAt.setDate(expireAt.getDate() + 30);
    const res = await (0, databases_1.query)('UPDATE users SET plan = $1, appointment_limit = $2, plan_expire_at = $3 WHERE id = $4 RETURNING *', [plan, limit, expireAt.toISOString(), id]);
    return res.rows[0];
};
exports.upgradeUserToPlan = upgradeUserToPlan;
const updateProfile = async (id, name, email, business_slug) => {
    const res = await (0, databases_1.query)('UPDATE users SET name = $1, email = $2, business_slug = $3 WHERE id = $4 RETURNING *', [name, email, business_slug || null, id]);
    return res.rows[0];
};
exports.updateProfile = updateProfile;
const checkAndResetExpiredPlan = async (user) => {
    try {
        if (!user || !user.id || user.plan === 'free' || !user.plan_expire_at)
            return user;
        const expiryDate = new Date(user.plan_expire_at);
        if (expiryDate < new Date()) {
            console.log(`Plan expired for user ${user.id}. Reverting to free.`);
            const res = await (0, databases_1.query)('UPDATE users SET plan = $1, appointment_limit = $2, plan_expire_at = $3 WHERE id = $4 RETURNING *', ['free', 5, null, user.id]);
            return res.rows[0];
        }
    }
    catch (err) {
        console.error('Error in checkAndResetExpiredPlan:', err);
    }
    return user;
};
exports.checkAndResetExpiredPlan = checkAndResetExpiredPlan;
const verifyPassword = async (password, hash) => {
    return await bcrypt_1.default.compare(password, hash);
};
exports.verifyPassword = verifyPassword;
const generateResetToken = async (email) => {
    const user = await (0, exports.findUserByEmail)(email);
    if (!user)
        return null;
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const expires = new Date();
    expires.setHours(expires.getHours() + 1); // 1 hour expiry
    await (0, databases_1.query)('UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE id = $3', [token, expires.toISOString(), user.id]);
    return token;
};
exports.generateResetToken = generateResetToken;
const findUserByResetToken = async (token) => {
    const res = await (0, databases_1.query)('SELECT * FROM users WHERE reset_token = $1', [token]);
    const user = res.rows[0];
    if (!user)
        return null;
    if (new Date(user.reset_token_expires) < new Date()) {
        return null;
    }
    return user;
};
exports.findUserByResetToken = findUserByResetToken;
const updatePassword = async (userId, newPassword) => {
    const hashedPassword = await bcrypt_1.default.hash(newPassword, 10);
    await (0, databases_1.query)('UPDATE users SET password = $1, reset_token = null, reset_token_expires = null WHERE id = $2', [hashedPassword, userId]);
};
exports.updatePassword = updatePassword;

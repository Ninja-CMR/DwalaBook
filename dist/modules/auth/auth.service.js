"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPassword = exports.checkAndResetExpiredPlan = exports.updateProfile = exports.upgradeUserToPlan = exports.createUser = exports.findUserByEmail = exports.findUserById = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const databases_1 = require("../../databases");
const findUserById = async (id) => {
    const res = await (0, databases_1.query)('SELECT * FROM users WHERE id = $1', [id]);
    return res.rows[0];
};
exports.findUserById = findUserById;
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
const updateProfile = async (id, name, email) => {
    const res = await (0, databases_1.query)('UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *', [name, email, id]);
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

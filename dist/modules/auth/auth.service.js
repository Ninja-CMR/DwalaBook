"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPassword = exports.createUser = exports.findUserByEmail = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const databases_1 = require("../../databases");
const findUserByEmail = async (email) => {
    const res = await (0, databases_1.query)('SELECT * FROM users WHERE email = $1', [email]);
    return res.rows[0];
};
exports.findUserByEmail = findUserByEmail;
const createUser = async (name, email, password) => {
    const hashedPassword = await bcrypt_1.default.hash(password, 10);
    const res = await (0, databases_1.query)('INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email', [name, email, hashedPassword]);
    return res.rows[0];
};
exports.createUser = createUser;
const verifyPassword = async (password, hash) => {
    return await bcrypt_1.default.compare(password, hash);
};
exports.verifyPassword = verifyPassword;

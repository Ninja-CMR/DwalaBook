"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginHandler = exports.registerHandler = void 0;
const auth_service_1 = require("./auth.service");
const registerHandler = async (req, reply) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return reply.code(400).send({ message: 'Missing required fields' });
    }
    const existingUser = await (0, auth_service_1.findUserByEmail)(email);
    if (existingUser) {
        return reply.code(409).send({ message: 'User already exists' });
    }
    const user = await (0, auth_service_1.createUser)(name, email, password);
    return reply.code(201).send(user);
};
exports.registerHandler = registerHandler;
const loginHandler = async (req, reply) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return reply.code(400).send({ message: 'Missing email or password' });
    }
    const user = await (0, auth_service_1.findUserByEmail)(email);
    if (!user || !(await (0, auth_service_1.verifyPassword)(password, user.password))) {
        return reply.code(401).send({ message: 'Invalid credentials' });
    }
    const token = req.server.jwt.sign({ id: user.id, email: user.email });
    return reply.send({ token });
};
exports.loginHandler = loginHandler;

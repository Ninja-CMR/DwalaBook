"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = authRoutes;
const auth_controller_1 = require("./auth.controller");
async function authRoutes(fastify) {
    fastify.post('/register', auth_controller_1.registerHandler);
    fastify.post('/login', auth_controller_1.loginHandler);
    fastify.post('/upgrade', { onRequest: [fastify.authenticate] }, auth_controller_1.upgradeHandler);
    fastify.put('/me', { onRequest: [fastify.authenticate] }, auth_controller_1.updateProfileHandler);
    fastify.get('/me', { onRequest: [fastify.authenticate] }, async (req) => {
        // Return full user data from token or database
        return { user: req.user };
    });
    fastify.post('/forgot-password', auth_controller_1.forgotPasswordHandler);
    fastify.post('/reset-password', auth_controller_1.resetPasswordHandler);
}

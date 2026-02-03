"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const fastify_cors_1 = __importDefault(require("fastify-cors"));
const fastify_jwt_1 = __importDefault(require("fastify-jwt"));
const databases_1 = require("./databases");
const appointments_routes_1 = require("./modules/appointments/appointments.routes");
const auth_routes_1 = require("./modules/auth/auth.routes");
const server = (0, fastify_1.default)({ logger: true });
server.register(fastify_cors_1.default, {
    origin: '*',
});
server.register(fastify_jwt_1.default, {
    secret: process.env.JWT_SECRET || 'supersecret',
});
// Register routes
server.register(auth_routes_1.authRoutes, { prefix: '/auth' });
server.register(appointments_routes_1.appointmentRoutes, { prefix: '/appointments' });
const start = async () => {
    try {
        await (0, databases_1.initDatabase)();
        await server.listen({ port: 3000, host: '0.0.0.0' });
        console.log('Server running on http://localhost:3000');
    }
    catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};
start();

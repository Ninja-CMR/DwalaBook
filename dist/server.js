"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const jwt_1 = __importDefault(require("@fastify/jwt"));
const databases_1 = require("./databases");
const appointments_routes_1 = require("./modules/appointments/appointments.routes");
const auth_routes_1 = require("./modules/auth/auth.routes");
const payments_routes_1 = require("./modules/payments/payments.routes");
const admin_routes_1 = require("./modules/admin/admin.routes");
const auth_service_1 = require("./modules/auth/auth.service");
const cron_1 = require("./cron");
const staff_routes_1 = require("./modules/appointments/staff.routes");
const inventory_routes_1 = require("./modules/inventory/inventory.routes");
const public_routes_1 = require("./modules/public/public.routes");
const server = (0, fastify_1.default)({ logger: true });
server.register(cors_1.default, {
    origin: '*',
});
server.register(jwt_1.default, {
    secret: process.env.JWT_SECRET || 'supersecret',
});
server.decorate('authenticate', async (request, reply) => {
    try {
        await request.jwtVerify();
        server.log.info({ user: request.user }, 'Authentication successful');
        // Check for plan expiration
        if (request.user && request.user.id) {
            const dbUser = await (0, auth_service_1.findUserById)(request.user.id);
            if (dbUser) {
                // Remove password from request.user
                const { password: _, ...userWithoutPassword } = dbUser;
                request.user = userWithoutPassword;
                request.user = await (0, auth_service_1.checkAndResetExpiredPlan)(request.user);
            }
        }
    }
    catch (err) {
        server.log.error({ err }, 'Authentication failed');
        reply.send(err);
    }
});
// Health check
server.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
});
server.setErrorHandler((error, request, reply) => {
    server.log.error(error);
    reply.status(500).send({ message: 'Internal Server Error', error: error.message });
});
// Register routes
server.register(auth_routes_1.authRoutes, { prefix: '/api/auth' });
server.register(appointments_routes_1.appointmentRoutes, { prefix: '/api/appointments' });
server.register(staff_routes_1.staffRoutes, { prefix: '/api/staff' });
server.register(inventory_routes_1.inventoryRoutes, { prefix: '/api/inventory' });
server.register(public_routes_1.publicRoutes, { prefix: '/api/public' });
server.register(payments_routes_1.paymentRoutes, { prefix: '/api/payments' });
server.register(admin_routes_1.adminRoutes, { prefix: '/api/admin' });
// Graceful shutdown
['SIGINT', 'SIGTERM', 'SIGUSR2'].forEach(signal => {
    process.on(signal, async () => {
        await server.close();
        process.exit(0);
    });
});
const start = async () => {
    try {
        await (0, databases_1.initDatabase)();
        const PORT = Number(process.env.PORT) || 3000;
        await server.listen({ port: PORT, host: '0.0.0.0' });
        console.log(`Server running on http://localhost:${PORT}`);
        // Initialize automated jobs (Reminders, Expirations)
        (0, cron_1.initCronJobs)();
    }
    catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};
start();

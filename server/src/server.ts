import 'dotenv/config';
import fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { initDatabase, query } from './databases';
import { appointmentRoutes } from './modules/appointments/appointments.routes';
import { authRoutes } from './modules/auth/auth.routes';
import { paymentRoutes } from './modules/payments/payments.routes';
import { adminRoutes } from './modules/admin/admin.routes';
import { findUserById, checkAndResetExpiredPlan } from './modules/auth/auth.service';
import { initCronJobs } from './cron';
import { staffRoutes } from './modules/appointments/staff.routes';
import { inventoryRoutes } from './modules/inventory/inventory.routes';
import { publicRoutes } from './modules/public/public.routes';

const server = fastify({ logger: true });

server.register(cors, {
    origin: (origin, cb) => {
        const clientUrl = process.env.CLIENT_URL;
        // Allow local development and the configured CLIENT_URL
        if (!origin || (clientUrl && origin.startsWith(clientUrl)) || origin.includes('localhost') || origin.includes('127.0.0.1')) {
            cb(null, true);
            return;
        }
        cb(new Error('Not allowed by CORS'), false);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
});

server.register(jwt, {
    secret: process.env.JWT_SECRET || 'supersecret',
});

server.decorate('authenticate', async (request: any, reply: any) => {
    try {
        await request.jwtVerify();
        server.log.info({ user: request.user }, 'Authentication successful');
        // Check for plan expiration
        if (request.user && request.user.id) {
            const dbUser = await findUserById(request.user.id);
            if (dbUser) {
                // Remove password from request.user
                const { password: _, ...userWithoutPassword } = dbUser;
                request.user = userWithoutPassword;
                request.user = await checkAndResetExpiredPlan(request.user);
            }
        }
    } catch (err) {
        server.log.error({ err }, 'Authentication failed');
        reply.send(err);
    }
});

// Health check & Route Diagnostics
server.get('/health', async () => {
    // Collect all routes
    const routes: string[] = [];
    server.addHook('onRoute', (routeOptions) => {
        routes.push(`${routeOptions.method} ${routeOptions.url}`);
    });

    return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'production',
        // Note: Routes added before this hook won't show up here, 
        // but we'll print them to the console on start.
    };
});

server.setErrorHandler((error: any, request, reply) => {
    server.log.error(error);
    reply.status(500).send({ message: 'Internal Server Error', error: error.message });
});

// Register routes
server.register(authRoutes, { prefix: '/api/auth' });
server.register(appointmentRoutes, { prefix: '/api/appointments' });
server.register(staffRoutes, { prefix: '/api/staff' });
server.register(inventoryRoutes, { prefix: '/api/inventory' });
server.register(publicRoutes, { prefix: '/api/public' });
server.register(paymentRoutes, { prefix: '/api/payments' });
server.register(adminRoutes, { prefix: '/api/admin' });

// Graceful shutdown
['SIGINT', 'SIGTERM', 'SIGUSR2'].forEach(signal => {
    process.on(signal, async () => {
        await server.close();
        process.exit(0);
    });
});

const start = async () => {
    try {
        await initDatabase();
        const PORT = Number(process.env.PORT) || 3000;
        await server.listen({ port: PORT, host: '0.0.0.0' });
        console.log(`Server running on http://localhost:${PORT}`);

        // Initialize automated jobs (Reminders, Expirations)
        initCronJobs();

        // Log all registered routes for debugging 404s
        console.log('📝 Registered Routes:');
        console.log(server.printRoutes());

    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};

start();

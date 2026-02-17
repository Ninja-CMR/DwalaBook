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
server.register(payments_routes_1.paymentRoutes, { prefix: '/api/payments' });
server.register(admin_routes_1.adminRoutes, { prefix: '/api/admin' });
// Graceful shutdown
['SIGINT', 'SIGTERM', 'SIGUSR2'].forEach(signal => {
    process.on(signal, async () => {
        await server.close();
        process.exit(0);
    });
});
const nodemailer_1 = __importDefault(require("nodemailer"));
const appointments_service_1 = require("./modules/appointments/appointments.service");
// Email Transporter Config (Real)
const transporter = nodemailer_1.default.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});
const runReminderCheck = async () => {
    try {
        console.log('[CRON] Checking for appointment reminders at', new Date().toLocaleString());
        const appointments = await (0, appointments_service_1.getAllScheduledAppointments)();
        const now = new Date();
        // Find appointments roughly 24 hours from now
        const upcoming = appointments.filter(a => {
            const aptDate = new Date(a.date);
            const diff = aptDate.getTime() - now.getTime();
            // Reminder for appointments in 24h (+/- 30 min)
            return diff > 0 && diff <= 24 * 60 * 60 * 1000;
        });
        if (upcoming.length > 0) {
            console.log(`[CRON] Processing ${upcoming.length} reminders.`);
            for (const apt of upcoming) {
                const timeStr = new Date(apt.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                const message = `Bonjour ${apt.customer_name}, c'est un rappel pour votre rendez-vous de demain à ${timeStr}. À très vite !`;
                if (apt.plan === 'free') {
                    // REAL EMAIL
                    if (apt.email) {
                        try {
                            await transporter.sendMail({
                                from: `"DwalaBook" <${process.env.SMTP_USER}>`,
                                to: apt.email,
                                subject: 'Rappel de votre rendez-vous',
                                text: message,
                                html: `<div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                                        <h2 style="color: #8b5e3c;">Bonjour ${apt.customer_name}</h2>
                                        <p>${message}</p>
                                        <hr/>
                                        <small>Envoyé par DwalaBook - Géré par ${apt.staff_name || 'notre équipe'}</small>
                                       </div>`
                            });
                            console.log(`[REAL EMAIL SUCCESS] Email sent to ${apt.email}`);
                        }
                        catch (e) {
                            console.error(`[EMAIL FAILED] to ${apt.email}:`, e.message);
                        }
                    }
                }
                else {
                    // REAL WHATSAPP (Via API)
                    if (apt.phone) {
                        try {
                            // Example Integration with a WhatsApp API (e.g. Monetbil or other)
                            console.log(`[REAL WHATSAPP] 📱 Dispatching to WhatsApp API for ${apt.phone}`);
                            // In a real integration: 
                            // await axios.post('WHATSAPP_API_URL', { to: apt.phone, text: message }, { headers: { Authorization: ... } })
                            console.log(`[CONTENT] "${message}"`);
                        }
                        catch (e) {
                            console.error(`[WHATSAPP FAILED] to ${apt.phone}:`, e.message);
                        }
                    }
                }
            }
        }
    }
    catch (err) {
        console.error('[CRON ERROR]:', err);
    }
};
const start = async () => {
    try {
        await (0, databases_1.initDatabase)();
        const PORT = Number(process.env.PORT) || 3000;
        await server.listen({ port: PORT, host: '0.0.0.0' });
        console.log(`Server running on http://localhost:${PORT}`);
        // Start Reminder Loop (Every 60 seconds)
        setInterval(runReminderCheck, 60000);
        // Run immediately on startup for demo
        runReminderCheck();
    }
    catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};
start();

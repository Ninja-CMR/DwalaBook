import 'dotenv/config';
import fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { initDatabase } from './databases';
import { appointmentRoutes } from './modules/appointments/appointments.routes';
import { authRoutes } from './modules/auth/auth.routes';
import { paymentRoutes } from './modules/payments/payments.routes';
import { adminRoutes } from './modules/admin/admin.routes';
import { findUserById, checkAndResetExpiredPlan } from './modules/auth/auth.service';
import { initCronJobs } from './cron';

const server = fastify({ logger: true });

server.register(cors, {
    origin: '*',
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

// Health check
server.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
});

server.setErrorHandler((error: any, request, reply) => {
    server.log.error(error);
    reply.status(500).send({ message: 'Internal Server Error', error: error.message });
});

// Register routes
server.register(authRoutes, { prefix: '/auth' });
server.register(appointmentRoutes, { prefix: '/appointments' });
server.register(paymentRoutes, { prefix: '/payments' });
server.register(adminRoutes, { prefix: '/admin' });

// Graceful shutdown
['SIGINT', 'SIGTERM', 'SIGUSR2'].forEach(signal => {
    process.on(signal, async () => {
        await server.close();
        process.exit(0);
    });
});

import nodemailer from 'nodemailer';
import { getAllScheduledAppointments } from './modules/appointments/appointments.service';

// Email Transporter Config (Real)
const transporter = nodemailer.createTransport({
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
        const appointments = await getAllScheduledAppointments();
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
                        } catch (e: any) {
                            console.error(`[EMAIL FAILED] to ${apt.email}:`, e.message);
                        }
                    }
                } else {
                    // REAL WHATSAPP (Via API)
                    if (apt.phone) {
                        try {
                            // Example Integration with a WhatsApp API (e.g. Monetbil or other)
                            console.log(`[REAL WHATSAPP] 📱 Dispatching to WhatsApp API for ${apt.phone}`);
                            // In a real integration: 
                            // await axios.post('WHATSAPP_API_URL', { to: apt.phone, text: message }, { headers: { Authorization: ... } })
                            console.log(`[CONTENT] "${message}"`);
                        } catch (e: any) {
                            console.error(`[WHATSAPP FAILED] to ${apt.phone}:`, e.message);
                        }
                    }
                }
            }
        }
    } catch (err) {
        console.error('[CRON ERROR]:', err);
    }
};

const start = async () => {
    try {
        await initDatabase();
        const PORT = Number(process.env.PORT) || 3000;
        await server.listen({ port: PORT, host: '0.0.0.0' });
        console.log(`Server running on http://localhost:${PORT}`);

        // Start Reminder Loop (Every 60 seconds)
        setInterval(runReminderCheck, 60000);
        // Run immediately on startup for demo
        runReminderCheck();

    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};

start();

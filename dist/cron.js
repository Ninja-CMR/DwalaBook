"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initCronJobs = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const subscription_service_1 = require("./modules/subscriptions/subscription.service");
const appointments_service_1 = require("./modules/appointments/appointments.service");
const notifications_service_1 = require("./modules/notifications/notifications.service");
/**
 * Initialize all cron jobs
 */
const initCronJobs = () => {
    console.log('[CRON] Initializing jobs...');
    // Appointment Reminders (Check every 30 minutes)
    // Sends reminders for appointments in the next 24 hours
    node_cron_1.default.schedule('*/30 * * * *', async () => {
        console.log('[CRON] Checking scheduled appointments for reminders...');
        try {
            const appointments = await (0, appointments_service_1.getAllScheduledAppointments)();
            const now = new Date();
            const twentyFourHoursFromNow = new Date(now.getTime() + (24 * 60 * 60 * 1000));
            for (const apt of appointments) {
                const aptDate = new Date(apt.date);
                // Only send if it's within the next 24 hours AND in the future
                if (aptDate > now && aptDate <= twentyFourHoursFromNow) {
                    const success = await (0, notifications_service_1.sendAppointmentReminder)(apt);
                    if (success) {
                        await (0, appointments_service_1.markReminderAsSent)(apt.id);
                    }
                }
            }
        }
        catch (error) {
            console.error('[CRON] Error sending appointment reminders:', error);
        }
    });
    // Check for expiring subscriptions every 6 hours
    // Sends notifications 7 days before expiration
    node_cron_1.default.schedule('0 */6 * * *', async () => {
        console.log('[CRON] Running expiration check...');
        try {
            const count = await (0, subscription_service_1.checkExpiringSubscriptions)(7);
            console.log(`[CRON] Processed ${count} expiring subscriptions`);
        }
        catch (error) {
            console.error('[CRON] Error checking expiring subscriptions:', error);
        }
    });
    // Check and downgrade expired subscriptions daily at midnight
    node_cron_1.default.schedule('0 0 * * *', async () => {
        console.log('[CRON] Running expired subscriptions check...');
        try {
            const count = await (0, subscription_service_1.checkExpiredSubscriptions)();
            console.log(`[CRON] Downgraded ${count} expired subscriptions`);
        }
        catch (error) {
            console.error('[CRON] Error checking expired subscriptions:', error);
        }
    });
    console.log('[CRON] Jobs scheduled:');
    console.log('  - Expiration warnings: Every 6 hours');
    console.log('  - Expired downgrades: Daily at midnight');
};
exports.initCronJobs = initCronJobs;

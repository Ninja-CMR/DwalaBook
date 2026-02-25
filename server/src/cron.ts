import cron from 'node-cron';
import { checkExpiringSubscriptions, checkExpiredSubscriptions } from './modules/subscriptions/subscription.service';

import { getAllScheduledAppointments, markReminderAsSent } from './modules/appointments/appointments.service';
import { sendAppointmentReminder } from './modules/notifications/notifications.service';

/**
 * Initialize all cron jobs
 */
export const initCronJobs = () => {
    console.log('[CRON] Initializing jobs...');

    // Appointment Reminders (Check every 30 minutes)
    // Sends reminders for appointments in the next 24 hours
    cron.schedule('*/30 * * * *', async () => {
        console.log('[CRON] Checking scheduled appointments for reminders...');
        try {
            const appointments = await getAllScheduledAppointments();
            const now = new Date();
            const twentyFourHoursFromNow = new Date(now.getTime() + (24 * 60 * 60 * 1000));

            for (const apt of appointments) {
                const aptDate = new Date(apt.date);

                // Only send if it's within the next 24 hours AND in the future
                if (aptDate > now && aptDate <= twentyFourHoursFromNow) {
                    const success = await sendAppointmentReminder(apt);
                    if (success) {
                        await markReminderAsSent(apt.id);
                    }
                }
            }
        } catch (error) {
            console.error('[CRON] Error sending appointment reminders:', error);
        }
    });

    // Check for expiring subscriptions every 6 hours
    // Sends notifications 7 days before expiration
    cron.schedule('0 */6 * * *', async () => {
        console.log('[CRON] Running expiration check...');
        try {
            const count = await checkExpiringSubscriptions(7);
            console.log(`[CRON] Processed ${count} expiring subscriptions`);
        } catch (error) {
            console.error('[CRON] Error checking expiring subscriptions:', error);
        }
    });

    // Check and downgrade expired subscriptions daily at midnight
    cron.schedule('0 0 * * *', async () => {
        console.log('[CRON] Running expired subscriptions check...');
        try {
            const count = await checkExpiredSubscriptions();
            console.log(`[CRON] Downgraded ${count} expired subscriptions`);
        } catch (error) {
            console.error('[CRON] Error checking expired subscriptions:', error);
        }
    });

    console.log('[CRON] Jobs scheduled:');
    console.log('  - Expiration warnings: Every 6 hours');
    console.log('  - Expired downgrades: Daily at midnight');
};

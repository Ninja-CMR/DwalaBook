import cron from 'node-cron';
import { checkExpiringSubscriptions, checkExpiredSubscriptions } from './modules/subscriptions/subscription.service';

/**
 * Initialize all cron jobs
 */
export const initCronJobs = () => {
    console.log('[CRON] Initializing subscription management jobs...');

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

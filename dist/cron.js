"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initCronJobs = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const subscription_service_1 = require("./modules/subscriptions/subscription.service");
/**
 * Initialize all cron jobs
 */
const initCronJobs = () => {
    console.log('[CRON] Initializing subscription management jobs...');
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

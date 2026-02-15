"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSubscriptionStatus = exports.checkExpiredSubscriptions = exports.checkExpiringSubscriptions = exports.activateSubscription = void 0;
const databases_1 = require("../../databases");
const notifications_service_1 = require("../notifications/notifications.service");
/**
 * Activate a subscription for a user
 */
const activateSubscription = async (userId, plan, durationDays = 30) => {
    const limit = 999999;
    const expireAt = new Date();
    expireAt.setDate(expireAt.getDate() + durationDays);
    await (0, databases_1.query)('UPDATE USERS SET plan = $1, appointment_limit = $2, plan_expire_at = $3 WHERE id = $4', [plan, limit, expireAt.toISOString(), userId]);
    console.log(`[SUBSCRIPTION] Activated ${plan} for user ${userId} until ${expireAt.toISOString()}`);
    return {
        plan,
        expires_at: expireAt.toISOString()
    };
};
exports.activateSubscription = activateSubscription;
/**
 * Check for subscriptions expiring in N days
 */
const checkExpiringSubscriptions = async (daysBeforeExpiration = 7) => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + daysBeforeExpiration);
    // Get users expiring around target date (within 1 day window)
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);
    const result = await (0, databases_1.query)('SELECT * FROM USERS WHERE plan_expire_at <= $1', [nextDay.toISOString()]);
    const users = result.rows.filter((u) => {
        if (!u.plan_expire_at || u.plan === 'free')
            return false;
        const expireDate = new Date(u.plan_expire_at);
        const diffDays = Math.ceil((expireDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return diffDays === daysBeforeExpiration;
    });
    console.log(`[SUBSCRIPTION] Found ${users.length} subscriptions expiring in ${daysBeforeExpiration} days`);
    for (const user of users) {
        // Check if we already sent notification recently (avoid spam)
        if (user.last_notification_sent) {
            const lastSent = new Date(user.last_notification_sent);
            const hoursSinceLastNotif = (Date.now() - lastSent.getTime()) / (1000 * 60 * 60);
            if (hoursSinceLastNotif < 12) {
                console.log(`[SUBSCRIPTION] Skipping ${user.email}, notification sent recently`);
                continue;
            }
        }
        const sent = await (0, notifications_service_1.sendExpirationNotification)(user, daysBeforeExpiration, user.plan);
        if (sent) {
            // Update last notification timestamp
            await (0, databases_1.query)('UPDATE USERS SET last_notification_sent = $1 WHERE id = $2', [new Date().toISOString(), user.id]);
        }
    }
    return users.length;
};
exports.checkExpiringSubscriptions = checkExpiringSubscriptions;
/**
 * Check and downgrade expired subscriptions
 */
const checkExpiredSubscriptions = async () => {
    const now = new Date().toISOString();
    const result = await (0, databases_1.query)('SELECT * FROM USERS WHERE plan_expire_at <= $1', [now]);
    const expiredUsers = result.rows.filter((u) => u.plan !== 'free');
    console.log(`[SUBSCRIPTION] Found ${expiredUsers.length} expired subscriptions`);
    for (const user of expiredUsers) {
        // Downgrade to free
        await (0, databases_1.query)('UPDATE USERS SET plan = $1, appointment_limit = $2, plan_expire_at = $3 WHERE id = $4', ['free', 5, null, user.id]);
        console.log(`[SUBSCRIPTION] Downgraded user ${user.email} from ${user.plan} to free`);
    }
    return expiredUsers.length;
};
exports.checkExpiredSubscriptions = checkExpiredSubscriptions;
/**
 * Get subscription status for a user
 */
const getSubscriptionStatus = async (userId) => {
    const result = await (0, databases_1.query)('SELECT * FROM USERS WHERE id = $1', [userId]);
    const user = result.rows[0];
    if (!user) {
        throw new Error('User not found');
    }
    const status = {
        plan: user.plan,
        expires_at: user.plan_expire_at,
        is_active: user.plan !== 'free'
    };
    if (user.plan_expire_at) {
        const expireDate = new Date(user.plan_expire_at);
        const daysLeft = Math.ceil((expireDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        status.days_left = Math.max(0, daysLeft);
        status.is_expiring_soon = daysLeft <= 7 && daysLeft > 0;
    }
    return status;
};
exports.getSubscriptionStatus = getSubscriptionStatus;

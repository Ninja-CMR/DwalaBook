"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const notifications_service_1 = require("./notifications.service");
// Mock global fetch
global.fetch = vitest_1.vi.fn();
(0, vitest_1.describe)('Notifications Service', () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
        process.env.TWILIO_ACCOUNT_SID = 'AC_test_sid';
        process.env.TWILIO_AUTH_TOKEN = 'test_token';
        process.env.TWILIO_PHONE_NUMBER = '+14155238886';
    });
    (0, vitest_1.describe)('sendWhatsApp', () => {
        (0, vitest_1.it)('should return false if Twilio config is missing', async () => {
            delete process.env.TWILIO_ACCOUNT_SID;
            const result = await (0, notifications_service_1.sendWhatsApp)('+237123456789', 'Hello world');
            (0, vitest_1.expect)(result).toBe(false);
        });
        (0, vitest_1.it)('should return true if Twilio API call is successful', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ sid: 'SM123' })
            });
            const result = await (0, notifications_service_1.sendWhatsApp)('+237123456789', 'Hello world');
            (0, vitest_1.expect)(result).toBe(true);
            (0, vitest_1.expect)(global.fetch).toHaveBeenCalledWith(vitest_1.expect.stringContaining('AC_test_sid'), vitest_1.expect.objectContaining({
                method: 'POST',
                headers: vitest_1.expect.objectContaining({
                    'Authorization': vitest_1.expect.stringContaining('Basic')
                })
            }));
        });
        (0, vitest_1.it)('should return false if Twilio API call fails', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: false,
                text: async () => 'Twilio Error'
            });
            const result = await (0, notifications_service_1.sendWhatsApp)('+237123456789', 'Hello world');
            (0, vitest_1.expect)(result).toBe(false);
        });
    });
});

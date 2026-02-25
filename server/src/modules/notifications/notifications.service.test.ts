import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sendWhatsApp, sendEmail } from './notifications.service';

// Mock global fetch
global.fetch = vi.fn();

describe('Notifications Service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.TWILIO_ACCOUNT_SID = 'AC_test_sid';
        process.env.TWILIO_AUTH_TOKEN = 'test_token';
        process.env.TWILIO_PHONE_NUMBER = '+14155238886';
    });

    describe('sendWhatsApp', () => {
        it('should return false if Twilio config is missing', async () => {
            delete process.env.TWILIO_ACCOUNT_SID;
            const result = await sendWhatsApp('+237123456789', 'Hello world');
            expect(result).toBe(false);
        });

        it('should return true if Twilio API call is successful', async () => {
            (global.fetch as any).mockResolvedValueOnce({
                ok: true,
                json: async () => ({ sid: 'SM123' })
            });

            const result = await sendWhatsApp('+237123456789', 'Hello world');
            expect(result).toBe(true);
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('AC_test_sid'),
                expect.objectContaining({
                    method: 'POST',
                    headers: expect.objectContaining({
                        'Authorization': expect.stringContaining('Basic')
                    })
                })
            );
        });

        it('should return false if Twilio API call fails', async () => {
            (global.fetch as any).mockResolvedValueOnce({
                ok: false,
                text: async () => 'Twilio Error'
            });

            const result = await sendWhatsApp('+237123456789', 'Hello world');
            expect(result).toBe(false);
        });
    });
});

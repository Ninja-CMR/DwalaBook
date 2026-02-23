import dotenv from 'dotenv';
import { sendWhatsApp } from './modules/notifications/notifications.service';

dotenv.config();

const testWhatsApp = async () => {
    const to = process.argv[2];
    if (!to) {
        console.error('Usage: npx ts-node src/test_whatsapp.ts <phone_number>');
        process.exit(1);
    }

    console.log(`[TEST] Sending WhatsApp to ${to}...`);
    const success = await sendWhatsApp(to, '🚀 Test DwalaBook : Votre intégration UltraMsg est fonctionnelle !');

    if (success) {
        console.log('[TEST] Success! Check your phone.');
    } else {
        console.log('[TEST] Failed. Check the logs above.');
    }
};

testWhatsApp();

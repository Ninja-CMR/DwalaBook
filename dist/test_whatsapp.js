"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const notifications_service_1 = require("./modules/notifications/notifications.service");
dotenv_1.default.config();
const testWhatsApp = async () => {
    const to = process.argv[2];
    if (!to) {
        console.error('Usage: npx ts-node src/test_whatsapp.ts <phone_number>');
        process.exit(1);
    }
    console.log(`[TEST] Sending WhatsApp to ${to}...`);
    const success = await (0, notifications_service_1.sendWhatsApp)(to, '🚀 Test DwalaBook : Votre intégration UltraMsg est fonctionnelle !');
    if (success) {
        console.log('[TEST] Success! Check your phone.');
    }
    else {
        console.log('[TEST] Failed. Check the logs above.');
    }
};
testWhatsApp();

"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendAppointmentReminder = exports.sendPaymentConfirmation = exports.sendExpirationNotification = exports.sendWhatsApp = exports.sendEmail = void 0;
const nodemailer = __importStar(require("nodemailer"));
// Email Transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});
/**
 * Send email notification
 */
const sendEmail = async (to, subject, html) => {
    try {
        await transporter.sendMail({
            from: `"DwalaBook" <${process.env.SMTP_USER}>`,
            to,
            subject,
            html
        });
        console.log(`[NOTIFICATION] Email sent to ${to}: ${subject}`);
        return true;
    }
    catch (error) {
        console.error(`[NOTIFICATION] Email failed to ${to}:`, error);
        return false;
    }
};
exports.sendEmail = sendEmail;
/**
 * Send WhatsApp notification using multiple possible providers
 */
const sendWhatsApp = async (to, message) => {
    const provider = process.env.WHATSAPP_PROVIDER || 'simulation';
    // 1. UltraMsg (Very popular in Africa)
    if (provider === 'ultramsg') {
        const instanceId = process.env.ULTRAMSG_INSTANCE_ID;
        const token = process.env.ULTRAMSG_TOKEN;
        if (!instanceId || !token) {
            console.error('[NOTIFICATION] UltraMsg not configured');
            return false;
        }
        try {
            const response = await fetch(`https://api.ultramsg.com/${instanceId}/messages/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    token,
                    to,
                    body: message
                }).toString()
            });
            if (response.ok) {
                console.log(`[NOTIFICATION] WhatsApp sent via UltraMsg to ${to}`);
                return true;
            }
        }
        catch (error) {
            console.error('[NOTIFICATION] UltraMsg request failed', error);
        }
    }
    // 2. Twilio
    if (provider === 'twilio') {
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const fromNumber = process.env.TWILIO_PHONE_NUMBER;
        if (accountSid && authToken && fromNumber) {
            try {
                const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
                const formattedFrom = fromNumber.startsWith('whatsapp:') ? fromNumber : `whatsapp:${fromNumber}`;
                const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
                const apiUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': `Basic ${auth}`
                    },
                    body: new URLSearchParams({ To: formattedTo, From: formattedFrom, Body: message }).toString()
                });
                if (response.ok) {
                    console.log(`[NOTIFICATION] WhatsApp sent via Twilio to ${to}`);
                    return true;
                }
            }
            catch (error) {
                console.error('[NOTIFICATION] Twilio request failed', error);
            }
        }
    }
    // 3. Simulation Fallback (Default)
    console.log('--- 📱 WHATSAPP SIMULATION ---');
    console.log(`To: ${to}`);
    console.log(`Message: ${message}`);
    console.log(`Provider: ${provider}`);
    console.log('------------------------------');
    return true;
};
exports.sendWhatsApp = sendWhatsApp;
/**
 * Send expiration warning notification
 */
const sendExpirationNotification = async (user, daysLeft, plan) => {
    const subject = `⚠️ Votre abonnement ${plan.toUpperCase()} expire dans ${daysLeft} jours`;
    const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fcf9f4;">
            <div style="background-color: #4a3728; padding: 30px; border-radius: 20px; text-align: center;">
                <h1 style="color: #DDB892; margin: 0; font-size: 28px;">⏰ Rappel d'Expiration</h1>
            </div>
            
            <div style="background-color: white; padding: 30px; border-radius: 20px; margin-top: 20px;">
                <p style="font-size: 18px; color: #4a3728;">Bonjour <strong>${user.name}</strong>,</p>
                
                <p style="font-size: 16px; color: #666; line-height: 1.6;">
                    Votre abonnement <strong style="color: #8b5e3c;">${plan.toUpperCase()}</strong> expire dans 
                    <strong style="color: #ef4444; font-size: 20px;">${daysLeft} jours</strong>.
                </p>
                
                <p style="font-size: 16px; color: #666; line-height: 1.6;">
                    Pour continuer à profiter de toutes les fonctionnalités premium de DwalaBook, 
                    pensez à renouveler votre abonnement dès maintenant.
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.CLIENT_URL}/pricing" 
                       style="display: inline-block; background-color: #8b5e3c; color: white; padding: 15px 40px; 
                              text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 16px;">
                        Renouveler mon abonnement
                    </a>
                </div>
                
                <p style="font-size: 14px; color: #999; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
                    Besoin d'aide ? Contactez-nous à ${process.env.ADMIN_EMAIL}
                </p>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
                © ${new Date().getFullYear()} DwalaBook - Gestion de Rendez-vous à Douala
            </div>
        </div>
    `;
    const whatsappMessage = `
🔔 *DwalaBook - Rappel d'Expiration*

Bonjour *${user.name}*,

Votre abonnement *${plan.toUpperCase()}* expire dans *${daysLeft} jours*. ⏰

Pour continuer à gérer vos rendez-vous sans interruption, renouvelez dès maintenant ici : 
👉 ${process.env.CLIENT_URL}/pricing

Besoin d'aide ? Contactez ${process.env.ADMIN_EMAIL}

_L'équipe DwalaBook_
    `.trim();
    // Send based on user preference
    const results = [];
    if (user.notification_preference === 'email' || user.notification_preference === 'both') {
        results.push(await (0, exports.sendEmail)(user.email, subject, emailHtml));
    }
    if ((user.notification_preference === 'whatsapp' || user.notification_preference === 'both') && user.whatsapp_number) {
        results.push(await (0, exports.sendWhatsApp)(user.whatsapp_number, whatsappMessage));
    }
    return results.some(r => r === true);
};
exports.sendExpirationNotification = sendExpirationNotification;
/**
 * Send payment confirmation email
 */
const sendPaymentConfirmation = async (user, plan, amount, expiresAt) => {
    const subject = `✅ Paiement confirmé - Abonnement ${plan.toUpperCase()} activé`;
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fcf9f4;">
            <div style="background-color: #606C38; padding: 30px; border-radius: 20px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px;">✅ Paiement Confirmé !</h1>
            </div>
            
            <div style="background-color: white; padding: 30px; border-radius: 20px; margin-top: 20px;">
                <p style="font-size: 18px; color: #4a3728;">Félicitations <strong>${user.name}</strong> ! 🎉</p>
                
                <p style="font-size: 16px; color: #666; line-height: 1.6;">
                    Votre paiement de <strong style="color: #606C38;">${amount.toLocaleString()} FCFA</strong> 
                    a été confirmé avec succès.
                </p>
                
                <div style="background-color: #f0f0f0; padding: 20px; border-radius: 15px; margin: 20px 0;">
                    <p style="margin: 5px 0;"><strong>Plan activé :</strong> ${plan.toUpperCase()}</p>
                    <p style="margin: 5px 0;"><strong>Expire le :</strong> ${new Date(expiresAt).toLocaleDateString('fr-FR')}</p>
                    <p style="margin: 5px 0;"><strong>Durée :</strong> 30 jours</p>
                </div>
                
                <p style="font-size: 16px; color: #666; line-height: 1.6;">
                    Vous pouvez maintenant profiter de toutes les fonctionnalités premium de DwalaBook !
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.CLIENT_URL}/dashboard" 
                       style="display: inline-block; background-color: #606C38; color: white; padding: 15px 40px; 
                              text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 16px;">
                        Accéder au Dashboard
                    </a>
                </div>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
                © ${new Date().getFullYear()} DwalaBook
            </div>
        </div>
    `;
    return await (0, exports.sendEmail)(user.email, subject, html);
};
exports.sendPaymentConfirmation = sendPaymentConfirmation;
/**
 * Send appointment reminder
 */
const sendAppointmentReminder = async (appointment) => {
    const dateStr = new Date(appointment.date).toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    const subject = `⏰ Rappel de votre rendez-vous - DwalaBook`;
    const message = `
🌟 *RAPPEL RENDEZ-VOUS*

Bonjour *${appointment.customer_name}*,

Ceci est un rappel pour votre rendez-vous de *${appointment.service || 'prestation'}*.

📅 *Date* : ${dateStr}
👤 *Avec* : ${appointment.staff_name || 'notre équipe'}

Nous avons hâte de vous recevoir ! ✨

_Propulsé par DwalaBook_
    `.trim();
    const html = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #fcf9f4; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0;">
            <div style="background-color: #4a3728; padding: 40px 20px; text-align: center;">
                <h1 style="color: #DDB892; margin: 0; font-size: 28px; letter-spacing: -1px;">DwalaBook</h1>
                <p style="color: #fcf9f4; opacity: 0.8; margin-top: 5px; font-weight: bold; text-transform: uppercase; font-size: 12px; tracking: 2px;">Rappel de Rendez-vous</p>
            </div>
            <div style="padding: 40px; background-color: white;">
                <p style="font-size: 18px; color: #4a3728; margin-bottom: 20px;">Bonjour <strong>${appointment.customer_name}</strong>,</p>
                <p style="color: #64748b; line-height: 1.6;">Ceci est un rappel amical pour votre rendez-vous de demain. Nous avons hâte de vous recevoir !</p>
                
                <div style="background-color: #f8fafc; border: 2px dashed #e2e8f0; padding: 25px; border-radius: 15px; margin: 30px 0;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 8px 0; color: #94a3b8; font-size: 13px; font-weight: bold; text-transform: uppercase;">Service</td>
                            <td style="padding: 8px 0; color: #4a3728; font-weight: bold; text-align: right;">${appointment.service || 'Prestation'}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #94a3b8; font-size: 13px; font-weight: bold; text-transform: uppercase;">Date & Heure</td>
                            <td style="padding: 8px 0; color: #4a3728; font-weight: bold; text-align: right;">${dateStr}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #94a3b8; font-size: 13px; font-weight: bold; text-transform: uppercase;">Avec</td>
                            <td style="padding: 8px 0; color: #4a3728; font-weight: bold; text-align: right;">${appointment.staff_name || 'Notre équipe'}</td>
                        </tr>
                    </table>
                </div>

                <div style="text-align: center; margin-top: 30px;">
                    <p style="font-size: 14px; color: #64748b; margin-bottom: 20px;">Si vous avez un empêchement, merci de nous prévenir le plus tôt possible.</p>
                    <a href="${process.env.CLIENT_URL}" style="display: inline-block; background-color: #8b5e3c; color: white; padding: 15px 30px; border-radius: 12px; text-decoration: none; font-weight: bold; box-shadow: 0 4px 6px rgba(139, 94, 60, 0.2);">Gérer mon rendez-vous</a>
                </div>
            </div>
            <div style="padding: 20px; text-align: center; background-color: #f1f5f9;">
                <p style="margin: 0; color: #94a3b8; font-size: 12px;">© 2026 DwalaBook. Akwa, Douala, Cameroun.</p>
            </div>
        </div>
    `;
    const results = [];
    // All plans get email if email exists
    if (appointment.email) {
        results.push(await (0, exports.sendEmail)(appointment.email, subject, html));
    }
    // PRO and STARTER get WhatsApp (if number exists)
    // For now we use the appointment.phone for WhatsApp as well
    if (appointment.plan !== 'free' && appointment.phone) {
        // Basic check for phone format might be needed for WhatsApp APIs
        results.push(await (0, exports.sendWhatsApp)(appointment.phone, message));
    }
    return results.some(r => r === true);
};
exports.sendAppointmentReminder = sendAppointmentReminder;

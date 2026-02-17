"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPaymentApprovedNotification = exports.sendPaymentDeclarationAdminNotification = exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
require("dotenv/config");
// Email Transporter Config
const transporter = nodemailer_1.default.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});
const sendEmail = async (to, subject, text, html) => {
    // Skip if no SMTP user configured (Dev mode)
    if (!process.env.SMTP_USER) {
        console.log(`[EMAIL DEV REQUEST] To: ${to} | Subject: ${subject}`);
        return { messageId: 'dev-mock-id' };
    }
    try {
        const info = await transporter.sendMail({
            from: `"DwalaBook" <${process.env.SMTP_USER}>`,
            to,
            subject,
            text,
            html,
        });
        console.log(`[EMAIL SENT] MessageId: ${info.messageId} to ${to}`);
        return info;
    }
    catch (error) {
        console.error(`[EMAIL ERROR] Could not send email to ${to}:`, error.message);
        // Do not throw, just log. This prevents the payment flow from crashing.
        return null;
    }
};
exports.sendEmail = sendEmail;
const sendPaymentDeclarationAdminNotification = async (amount, plan, transactionId, userEmail) => {
    const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
    if (!adminEmail)
        return;
    const subject = `[ACTION REQUISE] Nouveau Paiement Manuel: ${amount} FCFA`;
    const text = `Un utilisateur a déclaré un paiement de ${amount} FCFA pour le plan ${plan}. Transaction ID: ${transactionId}. Utilisateur: ${userEmail}. Veuillez vérifier et valider dans le dashboard admin.`;
    const html = `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #8b5e3c;">Nouveau Paiement Déclaré</h2>
            <p><strong>Montant:</strong> ${amount} FCFA</p>
            <p><strong>Plan:</strong> ${plan.toUpperCase()}</p>
            <p><strong>Transaction ID:</strong> ${transactionId}</p>
            <p><strong>Utilisateur:</strong> ${userEmail}</p>
            <br/>
            <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/admin" style="display: inline-block; padding: 10px 20px; background-color: #8b5e3c; color: white; text-decoration: none; border-radius: 5px;">Accéder au Dashboard Admin</a>
        </div>
    `;
    await (0, exports.sendEmail)(adminEmail, subject, text, html);
};
exports.sendPaymentDeclarationAdminNotification = sendPaymentDeclarationAdminNotification;
const sendPaymentApprovedNotification = async (userEmail, plan) => {
    const subject = `Votre abonnement DwalaBook ${plan.toUpperCase()} est actif !`;
    const text = `Félicitations ! Votre paiement a été validé. Vous pouvez maintenant profiter de toutes les fonctionnalités du plan ${plan}. Connectez-vous sur DwalaBook.`;
    const html = `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #2e7d32;">Paiement Validé ! 🎉</h2>
            <p>Votre abonnement <strong>${plan.toUpperCase()}</strong> est maintenant actif.</p>
            <p>Merci de votre confiance. Vous avez accès à toutes les fonctionnalités premium.</p>
            <br/>
            <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard" style="display: inline-block; padding: 10px 20px; background-color: #8b5e3c; color: white; text-decoration: none; border-radius: 5px;">Accéder à mon compte</a>
        </div>
    `;
    await (0, exports.sendEmail)(userEmail, subject, text, html);
};
exports.sendPaymentApprovedNotification = sendPaymentApprovedNotification;

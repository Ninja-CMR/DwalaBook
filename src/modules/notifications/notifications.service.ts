import * as nodemailer from 'nodemailer';

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
export const sendEmail = async (to: string, subject: string, html: string) => {
    try {
        await transporter.sendMail({
            from: `"DwalaBook" <${process.env.SMTP_USER}>`,
            to,
            subject,
            html
        });
        console.log(`[NOTIFICATION] Email sent to ${to}: ${subject}`);
        return true;
    } catch (error) {
        console.error(`[NOTIFICATION] Email failed to ${to}:`, error);
        return false;
    }
};

/**
 * Send WhatsApp notification (requires external API like Twilio)
 */
export const sendWhatsApp = async (to: string, message: string) => {
    const apiKey = process.env.WHATSAPP_API_KEY;
    const apiUrl = process.env.WHATSAPP_API_URL;

    if (!apiKey || !apiUrl) {
        console.log('[NOTIFICATION] WhatsApp not configured, skipping');
        return false;
    }

    try {
        // Example for Twilio or similar API
        // Adjust based on your WhatsApp provider
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                to,
                from: process.env.WHATSAPP_FROM_NUMBER,
                body: message
            })
        });

        if (response.ok) {
            console.log(`[NOTIFICATION] WhatsApp sent to ${to}`);
            return true;
        } else {
            console.error(`[NOTIFICATION] WhatsApp failed to ${to}:`, await response.text());
            return false;
        }
    } catch (error) {
        console.error(`[NOTIFICATION] WhatsApp error:`, error);
        return false;
    }
};

/**
 * Send expiration warning notification
 */
export const sendExpirationNotification = async (
    user: { email: string; name: string; whatsapp_number?: string | null; notification_preference: string },
    daysLeft: number,
    plan: string
) => {
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
⚠️ *DwalaBook - Rappel d'Expiration*

Bonjour ${user.name},

Votre abonnement *${plan.toUpperCase()}* expire dans *${daysLeft} jours*.

Pour continuer à profiter de toutes les fonctionnalités premium, renouvelez dès maintenant : ${process.env.CLIENT_URL}/pricing

Besoin d'aide ? Contactez ${process.env.ADMIN_EMAIL}
    `.trim();

    // Send based on user preference
    const results = [];

    if (user.notification_preference === 'email' || user.notification_preference === 'both') {
        results.push(await sendEmail(user.email, subject, emailHtml));
    }

    if ((user.notification_preference === 'whatsapp' || user.notification_preference === 'both') && user.whatsapp_number) {
        results.push(await sendWhatsApp(user.whatsapp_number, whatsappMessage));
    }

    return results.some(r => r === true);
};

/**
 * Send payment confirmation email
 */
export const sendPaymentConfirmation = async (
    user: { email: string; name: string },
    plan: string,
    amount: number,
    expiresAt: string
) => {
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

    return await sendEmail(user.email, subject, html);
};

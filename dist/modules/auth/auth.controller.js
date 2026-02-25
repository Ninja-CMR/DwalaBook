"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordHandler = exports.forgotPasswordHandler = exports.updateProfileHandler = exports.upgradeHandler = exports.loginHandler = exports.registerHandler = void 0;
const auth_service_1 = require("./auth.service");
const notifications_service_1 = require("../notifications/notifications.service");
const registerHandler = async (req, reply) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return reply.code(400).send({ message: 'Tous les champs sont requis' });
        }
        const existingUser = await (0, auth_service_1.findUserByEmail)(email);
        if (existingUser) {
            return reply.code(409).send({ message: 'Cet email est déjà utilisé' });
        }
        const user = await (0, auth_service_1.createUser)(name, email, password);
        const { password: _, ...userWithoutPassword } = user;
        // After registration, immediately provide a token too
        const token = req.server.jwt.sign({
            id: user.id,
            email: user.email,
            plan: user.plan
        });
        return reply.code(201).send({
            message: 'Utilisateur créé avec succès',
            user: userWithoutPassword,
            token
        });
    }
    catch (err) {
        req.log.error(err);
        return reply.code(500).send({ message: 'Erreur lors de la création du compte' });
    }
};
exports.registerHandler = registerHandler;
const loginHandler = async (req, reply) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return reply.code(400).send({ message: 'Email et mot de passe requis' });
        }
        const user = await (0, auth_service_1.findUserByEmail)(email);
        if (!user || !(await (0, auth_service_1.verifyPassword)(password, user.password))) {
            return reply.code(401).send({ message: 'Identifiants invalides' });
        }
        const token = req.server.jwt.sign({
            id: user.id,
            email: user.email,
            plan: user.plan
        });
        const { password: _, ...userWithoutPassword } = user;
        return reply.send({
            token,
            user: userWithoutPassword
        });
    }
    catch (err) {
        req.log.error(err);
        return reply.code(500).send({ message: 'Erreur lors de la connexion' });
    }
};
exports.loginHandler = loginHandler;
const upgradeHandler = async (req, reply) => {
    try {
        const { plan } = req.body;
        if (!['starter', 'pro'].includes(plan)) {
            return reply.code(400).send({ message: 'Plan invalide' });
        }
        const user = req.user;
        const updated = await (0, auth_service_1.upgradeUserToPlan)(user.id, plan);
        if (!updated) {
            return reply.code(404).send({ message: 'Utilisateur introuvable' });
        }
        const { password: _, ...userWithoutPassword } = updated;
        return reply.send({ user: userWithoutPassword });
    }
    catch (err) {
        req.log.error(err);
        return reply.code(500).send({ message: 'Erreur lors du passage au plan supérieur' });
    }
};
exports.upgradeHandler = upgradeHandler;
const updateProfileHandler = async (req, reply) => {
    try {
        const { name, email, business_slug } = req.body;
        const user = req.user;
        if (!name || !email) {
            return reply.code(400).send({ message: 'Nom et email requis' });
        }
        const updated = await (0, auth_service_1.updateProfile)(user.id, name, email, business_slug);
        const { password: _, ...userWithoutPassword } = updated;
        return reply.send({ user: userWithoutPassword });
    }
    catch (err) {
        req.log.error(err);
        return reply.code(500).send({ message: 'Erreur lors de la mise à jour du profil' });
    }
};
exports.updateProfileHandler = updateProfileHandler;
const forgotPasswordHandler = async (req, reply) => {
    try {
        const { email } = req.body;
        if (!email) {
            return reply.code(400).send({ message: 'Email requis' });
        }
        const token = await (0, auth_service_1.generateResetToken)(email);
        if (token) {
            const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
            await (0, notifications_service_1.sendEmail)(email, 'Réinitialisation de votre mot de passe - DwalaBook', `
                <div style="font-family: sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #4a3728;">Réinitialisation de mot de passe</h2>
                    <p>Vous avez demandé la réinitialisation de votre mot de passe sur DwalaBook.</p>
                    <p>Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe. Ce lien est valable pendant 1 heure.</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetLink}" style="background-color: #8b5e3c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Réinitialiser mon mot de passe</a>
                    </div>
                    <p style="font-size: 12px; color: #777;">Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email.</p>
                </div>
                `);
        }
        return reply.send({ message: 'Si cet email correspond à un compte, un lien de réinitialisation a été envoyé.' });
    }
    catch (err) {
        req.log.error(err);
        return reply.code(500).send({ message: 'Erreur lors de la demande de réinitialisation' });
    }
};
exports.forgotPasswordHandler = forgotPasswordHandler;
const resetPasswordHandler = async (req, reply) => {
    try {
        const { token, password } = req.body;
        if (!token || !password) {
            return reply.code(400).send({ message: 'Token et mot de passe requis' });
        }
        const user = await (0, auth_service_1.findUserByResetToken)(token);
        if (!user) {
            return reply.code(400).send({ message: 'Token invalide ou expiré' });
        }
        await (0, auth_service_1.updatePassword)(user.id, password);
        return reply.send({ message: 'Mot de passe mis à jour avec succès' });
    }
    catch (err) {
        req.log.error(err);
        return reply.code(500).send({ message: 'Erreur lors de la réinitialisation du mot de passe' });
    }
};
exports.resetPasswordHandler = resetPasswordHandler;

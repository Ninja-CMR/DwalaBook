"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfileHandler = exports.upgradeHandler = exports.loginHandler = exports.registerHandler = void 0;
const auth_service_1 = require("./auth.service");
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
        const { name, email } = req.body;
        const user = req.user;
        if (!name || !email) {
            return reply.code(400).send({ message: 'Nom et email requis' });
        }
        const updated = await (0, auth_service_1.updateProfile)(user.id, name, email);
        const { password: _, ...userWithoutPassword } = updated;
        return reply.send({ user: userWithoutPassword });
    }
    catch (err) {
        req.log.error(err);
        return reply.code(500).send({ message: 'Erreur lors de la mise à jour du profil' });
    }
};
exports.updateProfileHandler = updateProfileHandler;

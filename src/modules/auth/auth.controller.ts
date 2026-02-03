import { FastifyReply, FastifyRequest } from 'fastify';
import { createUser, findUserByEmail, verifyPassword, upgradeUserToPlan, updateProfile } from './auth.service';

export const registerHandler = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
        const { name, email, password } = req.body as any;

        if (!name || !email || !password) {
            return reply.code(400).send({ message: 'Tous les champs sont requis' });
        }

        const existingUser = await findUserByEmail(email);
        if (existingUser) {
            return reply.code(409).send({ message: 'Cet email est déjà utilisé' });
        }

        const user = await createUser(name, email, password);
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
    } catch (err) {
        req.log.error(err);
        return reply.code(500).send({ message: 'Erreur lors de la création du compte' });
    }
};

export const loginHandler = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
        const { email, password } = req.body as any;

        if (!email || !password) {
            return reply.code(400).send({ message: 'Email et mot de passe requis' });
        }

        const user = await findUserByEmail(email);
        if (!user || !(await verifyPassword(password, user.password))) {
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
    } catch (err) {
        req.log.error(err);
        return reply.code(500).send({ message: 'Erreur lors de la connexion' });
    }
};
export const upgradeHandler = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
        const { plan } = req.body as { plan: 'starter' | 'pro' };
        if (!['starter', 'pro'].includes(plan)) {
            return reply.code(400).send({ message: 'Plan invalide' });
        }
        const user = req.user as { id: number };
        const updated = await upgradeUserToPlan(user.id, plan);
        if (!updated) {
            return reply.code(404).send({ message: 'Utilisateur introuvable' });
        }
        const { password: _, ...userWithoutPassword } = updated;
        return reply.send({ user: userWithoutPassword });
    } catch (err) {
        req.log.error(err);
        return reply.code(500).send({ message: 'Erreur lors du passage au plan supérieur' });
    }
};

export const updateProfileHandler = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
        const { name, email } = req.body as { name: string, email: string };
        const user = req.user as { id: number };

        if (!name || !email) {
            return reply.code(400).send({ message: 'Nom et email requis' });
        }

        const updated = await updateProfile(user.id, name, email);
        const { password: _, ...userWithoutPassword } = updated;
        return reply.send({ user: userWithoutPassword });
    } catch (err) {
        req.log.error(err);
        return reply.code(500).send({ message: 'Erreur lors de la mise à jour du profil' });
    }
};

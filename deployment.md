# 🚀 Guide de Déploiement : DwalaBook SaaS

Ce guide détaille la procédure pour mettre votre application en ligne.

## Architecture
- **Frontend** : Vue.js 3 + Vite (Hébergé sur [Vercel](https://vercel.com))
- **Backend** : Node.js + Fastify (Hébergé sur [Render](https://render.com))
- **Base de Données** :
  - *Dev/Test* : Fichier JSON (`database.json`)
  - *Prod* : PostgreSQL (via [Supabase](https://supabase.com) ou [Neon](https://neon.tech))

---

## 1. Pré-requis
- Un compte GitHub (le code doit être poussé).
- Un compte [Vercel](https://vercel.com).
- Un compte [Render](https://render.com).

---

## 2. Déploiement du Backend (Render)

1. **Créer le service** :
   - Allez sur le Dashboard Render -> "New" -> "Web Service".
   - Connectez votre dépôt GitHub `DwalaBook`.
   - Donnez un nom (ex: `dwalabook-api`).

2. **Configuration** :
   - **Environment** : `Node`
   - **Root Directory** : `server` 👈 **Important**
   - **Build Command** : `npm install && npm run build`
   - **Start Command** : `npm start`
   - **Instance Type** : Free

3. **Variables d'Environnement** (Section "Environment") :
   Ajoutez les clés suivantes :
   ```env
   CLIENT_URL=https://votre-projet-vercel.app (URL du frontend)
   
   # WhatsApp Integration
   WHATSAPP_PROVIDER=ultramsg (ou twilio)
   ULTRAMSG_INSTANCE_ID=votre_instance
   ULTRAMSG_TOKEN=votre_token
   ```
   > **Note sur la BDD** : Par défaut, l'application utilise `server/database.json`. Sur Render gratuit, ce fichier est réinitialisé régulièrement. Pour la production, ajoutez `DATABASE_URL` (voir section 4).

4. **Déployer** : Cliquez sur "Create Web Service".
   - Notez l'URL fournie (ex: `https://dwalabook-api.onrender.com`).

---

## 3. Déploiement du Frontend (Vercel)

1. **Créer le projet** :
   - Allez sur le Dashboard Vercel -> "Add New..." -> "Project".
   - Importez le dépôt `DwalaBook`.

2. **Configuration du dossier** :
   - **Framework Preset** : Vite
   - **Root Directory** : `client` 👈 **Important**

3. **Variables d'Environnement** :
   - `VITE_API_URL` : L'URL de votre backend Render (ex: `https://dwalabook-api.onrender.com`).
   - **Attention** : Pas de slash `/` à la fin, et pas de `/api`. Juste la racine.

4. **Déployer** : Cliquez sur "Deploy".

---

## 4. Migration vers PostgreSQL (Production)

Pour éviter de perdre vos données, migrez vers une vraie base de données.

1. **Créer une BDD** sur Supabase ou Neon (offres gratuites).
2. **Récupérer la connection string** (ex: `postgres://user:pass@host:port/db`).
3. **Mettre à jour Render** :
   - Ajoutez la variable `DATABASE_URL` avec votre connection string.
4. **Migration des données** (Optionnel) :
   - Si vous voulez conserver vos utilisateurs actuels (dont l'admin), exécutez le script `migrate_to_pg.js` **localement** :
     ```bash
     # Dans votre terminal local
     export DATABASE_URL="votre_connection_string_production"
     node migrate_to_pg.js
     ```
   - Ensuite, il faudra modifier `src/databases/index.ts` pour qu'il se connecte à Postgres si `DATABASE_URL` est présent (cette modification n'est pas encore active dans le code actuel, demandez-la si nécessaire).

---

## 5. Vérification
- Connectez-vous sur le Frontend (Vercel).
- Tentez de vous connecter avec `admin@dwalabook.com`.
- Vérifiez que les données chargent bien.

---

## 6. Maintenance (Éviter l'endormissement de Render)

Sur l'offre gratuite de Render, votre serveur s'endort après 15 minutes d'inactivité. Cela cause un délai lors de la première connexion (le temps que le serveur redémarre).

Pour garder votre backend toujours actif :
1. Utilisez un service gratuit comme [Cron-job.org](https://cron-job.org/) ou [UptimeRobot](https://uptimerobot.com/).
2. Configurez une tâche de surveillance (ping) toutes les **14 minutes**.
3. L'URL à appeler est : `https://votre-backend.onrender.com/api/health`

Cela garantira une réponse instantanée pour vos utilisateurs sans erreur réseau.

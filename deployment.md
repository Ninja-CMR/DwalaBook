# 🚀 Guide de Déploiement (Options Gratuites)

Ce guide explique comment mettre votre application **DwalaBook** en ligne gratuitement.

## 1. Architecture recommandée
- **Frontend (Vue.js + Vite)** : [Vercel](https://vercel.com/) (Gratuit, performant, déploiement automatique via GitHub).
- **Backend (Fastify + Node.js)** : [Render](https://render.com/) (Offre "Free Web Service" disponible).
- **Base de données** : 
    - *Actuel* : `database.json`. **Attention** : Sur Render (gratuit), les fichiers créés/modifiés sont supprimés à chaque redémarrage.
    - *Recommandé* : [Supabase](https://supabase.com/) ou [Neon.tech](https://neon.tech/) (PostgreSQL gratuit) pour une persistance réelle.

---

## 2. Déploiement du Backend (sur Render)

1. Créez un compte sur [Render.com](https://render.com/).
2. Créez un nouveau **Web Service** et connectez votre dépôt GitHub.
3. Configurez les paramètres :
   - **Environment** : `Node`
   - **Build Command** : `npm install && npm run build`
   - **Start Command** : `npm start`
4. Ajoutez les **Environment Variables** (Secret Files ou variables) :
   - `JWT_SECRET` : Une clé secrète aléatoire.
   - `PORT` : 3000 (Render gère cela automatiquement généralement).
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` : Vos identifiants e-mail pour les rappels.

> [!WARNING]
> Avec l'offre gratuite de Render, le serveur "s'endort" après 15 minutes d'inactivité. Le premier chargement après une pause peut prendre ~30 secondes.

---

## 3. Déploiement du Frontend (sur Vercel)

1. Créez un compte sur [Vercel.com](https://vercel.com/).
2. Importez votre projet GitHub.
3. Sélectionnez le dossier `client` comme dossier racine du projet.
4. Configurez les paramètres :
   - **Framework Preset** : `Vite`
   - **Build Command** : `npm run build`
   - **Output Directory** : `dist`
5. Ajoutez la variable d'environnement :
   - `VITE_API_URL` : L'URL de votre backend sur Render (ex: `https://votre-api.onrender.com`).

---

## 4. Configuration finale (Proxy et API)

Puisque nous utilisons des domaines différents en production (ex: `dwalabook.vercel.app` et `dwalabook-api.onrender.com`), le proxy Vite ne fonctionne pas en production.

L'application est déjà configurée pour utiliser `VITE_API_URL` s'il est présent. Assurez-vous que l'URL du backend dans la variable Vercel finit bien **sans** slash `/api`.

---

## 5. Migration vers une base de données réelle (PostgreSQL)
Le projet est prêt à utiliser `pg` (PostgreSQL). Pour passer du JSON à SQL :
1. Créez une instance gratuite sur Supabase.
2. Copiez la `DATABASE_URL`.
3. Mettez à jour le fichier `src/databases/index.ts` pour utiliser le client `pg` au lieu de lire le fichier JSON. (Je peux vous aider pour cette étape quand vous serez prêt).

---

Besoin d'aide pour une étape spécifique ? N'hésitez pas !

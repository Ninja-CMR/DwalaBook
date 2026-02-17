const fs = require('fs');
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config();

const DB_FILE = path.join(__dirname, 'database.json');

async function migrate() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        console.error('Erreur: DATABASE_URL manquante dans .env');
        process.exit(1);
    }

    console.log('Lecture du fichier database.json...');
    const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));

    const pool = new Pool({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('Connexion à PostgreSQL...');
        await pool.query('SELECT NOW()');

        console.log('Migration des UTILISATEURS...');
        for (const user of data.users) {
            await pool.query(
                `INSERT INTO users (id, name, email, password, plan, appointment_limit, plan_expire_at, role, notification_preference, whatsapp_number, last_notification_sent, created_at)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                 ON CONFLICT (email) DO UPDATE SET 
                    name = EXCLUDED.name,
                    plan = EXCLUDED.plan,
                    appointment_limit = EXCLUDED.appointment_limit,
                    plan_expire_at = EXCLUDED.plan_expire_at`,
                [
                    user.id, user.name, user.email, user.password, user.plan || 'free',
                    user.appointment_limit || 5, user.plan_expire_at, user.role || 'user',
                    user.notification_preference, user.whatsapp_number, user.last_notification_sent,
                    user.created_at
                ]
            );
        }

        console.log('Migration des RENDEZ-VOUS...');
        for (const apt of data.appointments) {
            await pool.query(
                `INSERT INTO appointments (id, user_id, customer_name, phone, email, date, staff_name, status, created_at)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                 ON CONFLICT (id) DO NOTHING`,
                [
                    apt.id, apt.user_id, apt.customer_name, apt.phone, apt.email,
                    apt.date, apt.staff_name, apt.status, apt.created_at
                ]
            );
        }

        console.log('Migration des PAIEMENTS...');
        for (const pay of data.payments) {
            await pool.query(
                `INSERT INTO payments (id, user_id, provider, transaction_id, amount, plan, status, payment_proof, activated_by, activated_at, created_at)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                 ON CONFLICT (transaction_id) DO NOTHING`,
                [
                    pay.id, pay.user_id, pay.provider, pay.transaction_id, pay.amount,
                    pay.plan, pay.status, pay.payment_proof, pay.activated_by,
                    pay.activated_at, pay.created_at
                ]
            );
        }

        // Reset Serial sequences to avoid ID conflicts
        console.log('Réinitialisation des séquences ID...');
        await pool.query("SELECT setval(pg_get_serial_sequence('users', 'id'), coalesce(max(id),0) + 1, false) FROM users");
        await pool.query("SELECT setval(pg_get_serial_sequence('appointments', 'id'), coalesce(max(id),0) + 1, false) FROM appointments");
        await pool.query("SELECT setval(pg_get_serial_sequence('payments', 'id'), coalesce(max(id),0) + 1, false) FROM payments");

        console.log('✅ Migration terminée avec succès !');

    } catch (err) {
        console.error('❌ Erreur pendant la migration:', err);
    } finally {
        await pool.end();
    }
}

migrate();

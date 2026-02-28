const { Client } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function resetAdmin() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        const hashedPassword = await bcrypt.hash('admin123456', 10);
        const res = await client.query(
            "UPDATE users SET password = $1 WHERE email = 'admin@dwalabook.com' RETURNING id",
            [hashedPassword]
        );

        if (res.rowCount > 0) {
            console.log('✅ Admin password reset to: admin123456');
        } else {
            console.log('❌ User admin@dwalabook.com not found');
        }
    } catch (err) {
        console.error('❌ Error resetting admin password:', err);
    } finally {
        await client.end();
    }
}

resetAdmin();

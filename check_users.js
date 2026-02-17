const { Client } = require('pg');
require('dotenv').config();

async function checkUsers() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();
        const res = await client.query('SELECT id, name, email, role, plan FROM users');
        console.log('--- Users in Database ---');
        console.table(res.rows);
    } catch (err) {
        console.error('Error checking users:', err);
    } finally {
        await client.end();
    }
}

checkUsers();

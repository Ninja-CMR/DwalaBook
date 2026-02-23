const { Pool } = require('pg');
require('dotenv').config();

async function updateSchema() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        console.error('DATABASE_URL is missing');
        process.exit(1);
    }

    const pool = new Pool({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('Updating PostgreSQL schema...');

        // Add missing columns to users
        await pool.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS business_slug TEXT UNIQUE,
            ADD COLUMN IF NOT EXISTS reset_token TEXT,
            ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMP WITH TIME ZONE
        `);

        // Create staff table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS staff (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                name TEXT NOT NULL,
                role TEXT NOT NULL,
                specialty TEXT,
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create inventory table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS inventory (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                name TEXT NOT NULL,
                quantity INTEGER DEFAULT 0,
                alert_threshold INTEGER DEFAULT 5,
                unit_price NUMERIC DEFAULT 0,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Update appointments table
        await pool.query(`
            ALTER TABLE appointments 
            ADD COLUMN IF NOT EXISTS service TEXT,
            ADD COLUMN IF NOT EXISTS notes TEXT
        `);

        console.log('✅ PostgreSQL schema updated successfully');
    } catch (err) {
        console.error('❌ Error updating schema:', err);
    } finally {
        await pool.end();
    }
}

updateSchema();

const { query, initDatabase } = require('./src/databases/index');

async function test() {
    await initDatabase();

    console.log('--- Testing Payments ---');
    const pResult = await query('SELECT * FROM PAYMENTS WHERE status = $1', ['pending']);
    console.log(`Found ${pResult.rows.length} pending payments`);
    if (pResult.rows.length > 0) {
        console.log('Sample payment:', pResult.rows[0].transaction_id);
    }

    console.log('\n--- Testing Users ---');
    const uResult = await query('SELECT id, name, email, plan, plan_expire_at, created_at FROM USERS', []);
    console.log(`Found ${uResult.rows.length} users`);
    if (uResult.rows.length > 0) {
        console.log('Sample user:', uResult.rows[0].email, 'Role:', uResult.rows[0].role);
    }

    console.log('\n--- Testing Admin Role ---');
    const adminResult = await query('SELECT * FROM USERS WHERE role = $1', ['admin']);
    console.log(`Found ${adminResult.rows.length} admins`);
}

test().catch(console.error);

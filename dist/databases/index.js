"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.query = exports.initDatabase = void 0;
const pg_1 = require("pg");
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const DB_FILE = path_1.default.join(__dirname, '../../database.json');
let data = {
    users: [],
    appointments: [],
    payments: [],
    staff: [],
    inventory: []
};
let pool = null;
if (process.env.DATABASE_URL) {
    console.log('🔌 Connecting to PostgreSQL...');
    pool = new pg_1.Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });
}
const initDatabase = async () => {
    if (pool) {
        try {
            await pool.query('SELECT NOW()');
            console.log('✅ Connected to PostgreSQL successfully');
            return;
        }
        catch (err) {
            console.error('❌ Failed to connect to PostgreSQL, falling back to JSON:', err);
            pool = null; // Fallback to JSON
        }
    }
    try {
        const content = await promises_1.default.readFile(DB_FILE, 'utf-8');
        data = JSON.parse(content);
        if (!data.users)
            data.users = [];
        if (!data.appointments)
            data.appointments = [];
        if (!data.payments)
            data.payments = [];
        console.log('📂 JSON Database loaded successfully');
    }
    catch (err) {
        await save();
        console.log('📂 JSON Database initialized');
    }
};
exports.initDatabase = initDatabase;
const save = async () => {
    await promises_1.default.writeFile(DB_FILE, JSON.stringify(data, null, 2));
};
const query = async (text, params = []) => {
    // 1. PostgreSQL Strategy
    if (pool) {
        return pool.query(text, params);
    }
    // 2. JSON File Strategy (Fallback)
    const t = text.trim().toUpperCase();
    if (t.startsWith('SELECT')) {
        if (t.includes('FROM USERS')) {
            if (!t.includes('WHERE')) {
                return { rows: data.users };
            }
            const param = params[0];
            // Support role-based queries
            if (t.includes('WHERE ROLE =')) {
                const rows = data.users.filter(u => u.role === param);
                return { rows };
            }
            // Support expiration queries
            if (t.includes('WHERE PLAN_EXPIRE_AT')) {
                const targetDate = new Date(param);
                const rows = data.users.filter(u => {
                    if (!u.plan_expire_at)
                        return false;
                    const expireDate = new Date(u.plan_expire_at);
                    return expireDate <= targetDate && u.plan !== 'free';
                });
                return { rows };
            }
            // Default: email or id lookup
            const rows = data.users.filter(u => u.email === param || u.id === param);
            return { rows };
        }
        if (t.includes('FROM APPOINTMENTS')) {
            // Handle the specialized join query
            if (t.includes('JOIN USERS u ON a.user_id = u.id')) {
                const rows = data.appointments
                    .filter(a => a.status === 'scheduled' && !a.last_reminder_sent)
                    .map(a => {
                    const user = data.users.find(u => u.id === a.user_id);
                    return { ...a, plan: user?.plan };
                })
                    .slice(0, 100);
                return { rows };
            }
            const userId = params[0];
            const rows = data.appointments.filter(a => a.user_id === userId);
            return { rows };
        }
        if (t.includes('FROM PAYMENTS')) {
            if (!t.includes('WHERE')) {
                return { rows: data.payments };
            }
            // Support pending payments query
            if (t.includes('WHERE STATUS =')) {
                const status = params[0];
                const rows = data.payments.filter(p => p.status === status);
                return { rows };
            }
            // Support transaction lookup
            if (t.includes('WHERE TRANSACTION_ID =')) {
                const txId = params[0];
                const rows = data.payments.filter(p => p.transaction_id === txId);
                return { rows };
            }
            // Support specific payment lookup by ID
            if (t.includes('WHERE ID =')) {
                const id = Number(params[0]);
                const rows = data.payments.filter(p => p.id === id);
                return { rows };
            }
            // Support user payments
            const userId = params[0];
            const rows = data.payments.filter(p => p.user_id === userId);
            return { rows };
        }
        if (t.includes('FROM STAFF')) {
            const userId = params[0];
            const rows = (data.staff || []).filter(s => s.user_id === userId);
            return { rows };
        }
        if (t.includes('FROM INVENTORY')) {
            const userId = params[0];
            const rows = (data.inventory || []).filter(i => i.user_id === userId);
            return { rows };
        }
    }
    if (t.startsWith('INSERT INTO USERS')) {
        const nextId = data.users.length > 0 ? Math.max(...data.users.map(u => u.id)) + 1 : 1;
        const newUser = {
            id: nextId,
            name: params[0],
            email: params[1],
            password: params[2],
            plan: 'free',
            appointment_limit: 5,
            plan_expire_at: null,
            role: 'user',
            notification_preference: 'email',
            whatsapp_number: null,
            last_notification_sent: null,
            created_at: new Date().toISOString(),
            business_slug: params[3] || null, // Capture slug if provided
            reset_token: null,
            reset_token_expires: null
        };
        data.users.push(newUser);
        await save();
        return { rows: [newUser] };
    }
    if (t.startsWith('INSERT INTO APPOINTMENTS')) {
        const nextId = data.appointments.length > 0 ? Math.max(...data.appointments.map(a => a.id)) + 1 : 1;
        const newApt = {
            id: nextId,
            user_id: params[0],
            customer_name: params[1],
            phone: params[2],
            email: params[3] || null,
            date: params[4],
            staff_name: params[5] || 'Équipe DwalaBook',
            service: params[6] || null,
            notes: params[7] || null,
            status: 'scheduled',
            created_at: new Date().toISOString()
        };
        data.appointments.push(newApt);
        await save();
        return { rows: [newApt] };
    }
    if (t.startsWith('UPDATE APPOINTMENTS')) {
        if (t.includes('SET STATUS =')) {
            const status = params[0];
            const id = Number(params[1]);
            const userId = Number(params[2]);
            const apt = data.appointments.find(a => a.id === id && a.user_id === userId);
            if (apt) {
                apt.status = status;
                await save();
                return { rows: [apt] };
            }
        }
        else if (t.includes('SET LAST_REMINDER_SENT =')) {
            const id = Number(params[0]);
            const apt = data.appointments.find(a => a.id === id);
            if (apt) {
                apt.last_reminder_sent = new Date().toISOString();
                await save();
                return { rows: [apt] };
            }
        }
    }
    if (t.startsWith('UPDATE USERS')) {
        // Check if it's the plan update or a generic profile update
        const id = Number(params[params.length - 1]); // Ensure ID is a number
        const userIndex = data.users.findIndex(u => u.id === id);
        if (userIndex !== -1) {
            if (t.includes('SET PLAN =')) {
                // Legacy/Specific plan update
                const plan = params[0];
                const limit = params[1];
                const expireAt = params[2];
                data.users[userIndex].plan = plan;
                data.users[userIndex].appointment_limit = limit;
                data.users[userIndex].plan_expire_at = expireAt;
            }
            else if (t.includes('SET NAME =') && t.includes('BUSINESS_SLUG =')) {
                // Profile update: name, email, business_slug
                data.users[userIndex].name = params[0];
                data.users[userIndex].email = params[1];
                data.users[userIndex].business_slug = params[2];
            }
            else if (t.includes('SET NAME =')) {
                // Profile update: name, email
                data.users[userIndex].name = params[0];
                data.users[userIndex].email = params[1];
            }
            await save();
            return { rows: [data.users[userIndex]] };
        }
    }
    if (t.startsWith('INSERT INTO PAYMENTS')) {
        const nextId = data.payments.length > 0 ? Math.max(...data.payments.map(p => p.id)) + 1 : 1;
        const newPayment = {
            id: nextId,
            user_id: params[0],
            provider: params[1],
            transaction_id: params[2],
            amount: params[3],
            plan: params[4],
            status: params[5] || 'pending',
            payment_proof: params[6] || null,
            activated_by: null,
            activated_at: null,
            created_at: new Date().toISOString()
        };
        data.payments.push(newPayment);
        await save();
        return { rows: [newPayment] };
    }
    if (t.startsWith('INSERT INTO STAFF')) {
        const nextId = (data.staff || []).length > 0 ? Math.max(...(data.staff || []).map(s => s.id)) + 1 : 1;
        const newStaff = {
            id: nextId,
            user_id: params[0],
            name: params[1],
            role: params[2],
            specialty: params[3] || null,
            is_active: params[4] ?? true,
            created_at: new Date().toISOString()
        };
        if (!data.staff)
            data.staff = [];
        data.staff.push(newStaff);
        await save();
        return { rows: [newStaff] };
    }
    if (t.startsWith('INSERT INTO INVENTORY')) {
        const nextId = (data.inventory || []).length > 0 ? Math.max(...(data.inventory || []).map(i => i.id)) + 1 : 1;
        const newItem = {
            id: nextId,
            user_id: params[0],
            name: params[1],
            quantity: params[2],
            alert_threshold: params[3],
            unit_price: params[4],
            created_at: new Date().toISOString()
        };
        if (!data.inventory)
            data.inventory = [];
        data.inventory.push(newItem);
        await save();
        return { rows: [newItem] };
    }
    if (t.startsWith('UPDATE PAYMENTS')) {
        // Handle activation by admin
        if (t.includes('SET STATUS =') && t.includes('ACTIVATED_BY =')) {
            const status = params[0];
            const activatedBy = params[1];
            const paymentId = params[2];
            const p = data.payments.find(pm => pm.id === paymentId);
            if (p) {
                p.status = status;
                p.activated_by = activatedBy;
                p.activated_at = new Date().toISOString();
                await save();
                return { rows: [p] };
            }
        }
        // Handle proof upload (Specific check for payment_proof in query)
        if (t.includes('SET PAYMENT_PROOF =')) {
            const proofUrl = params[0];
            const transactionId = params[1];
            const p = data.payments.find(pm => pm.transaction_id === transactionId);
            if (p) {
                p.payment_proof = proofUrl;
                await save();
                return { rows: [p] };
            }
        }
        // Handle status update by transaction ID (e.g., Stripe)
        if (t.includes('SET STATUS =') && !t.includes('PAYMENT_PROOF')) {
            const status = params[0];
            const transactionId = params[1];
            const p = data.payments.find(pm => pm.transaction_id === transactionId);
            if (p) {
                p.status = status;
                await save();
                return { rows: [p] };
            }
        }
    }
    if (t.startsWith('UPDATE STAFF')) {
        const id = Number(params[params.length - 2]);
        const userId = Number(params[params.length - 1]);
        const staffIndex = (data.staff || []).findIndex(s => s.id === id && s.user_id === userId);
        if (staffIndex !== -1) {
            data.staff[staffIndex] = {
                ...data.staff[staffIndex],
                name: params[0],
                role: params[1],
                specialty: params[2],
                is_active: params[3]
            };
            await save();
            return { rows: [data.staff[staffIndex]] };
        }
    }
    if (t.startsWith('DELETE FROM STAFF')) {
        const id = params[0];
        const userId = params[1];
        data.staff = (data.staff || []).filter(s => !(s.id === id && s.user_id === userId));
        await save();
        return { rows: [] };
    }
    if (t.startsWith('UPDATE INVENTORY')) {
        const id = Number(params[params.length - 2]);
        const userId = Number(params[params.length - 1]);
        const itemIndex = (data.inventory || []).findIndex(i => i.id === id && i.user_id === userId);
        if (itemIndex !== -1) {
            data.inventory[itemIndex] = {
                ...data.inventory[itemIndex],
                name: params[0],
                quantity: params[1],
                alert_threshold: params[2],
                unit_price: params[3]
            };
            await save();
            return { rows: [data.inventory[itemIndex]] };
        }
    }
    if (t.startsWith('DELETE FROM INVENTORY')) {
        const id = params[0];
        const userId = params[1];
        data.inventory = (data.inventory || []).filter(i => !(i.id === id && i.user_id === userId));
        await save();
        return { rows: [] };
    }
    return { rows: [] };
};
exports.query = query;

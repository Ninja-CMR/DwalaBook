import fs from 'fs/promises';
import path from 'path';

const DB_FILE = path.join(__dirname, '../../database.json');

interface LocalData {
  users: any[];
  appointments: any[];
  payments: any[];
}

let data: LocalData = { users: [], appointments: [], payments: [] };

export const initDatabase = async () => {
  try {
    const content = await fs.readFile(DB_FILE, 'utf-8');
    data = JSON.parse(content);
    if (!data.users) data.users = [];
    if (!data.appointments) data.appointments = [];
    if (!data.payments) data.payments = [];
    console.log('JSON Database loaded successfully');
  } catch (err) {
    await save();
    console.log('JSON Database initialized');
  }
};

const save = async () => {
  await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2));
};

export const query = async (text: string, params: any[] = []) => {
  const t = text.trim().toUpperCase();

  if (t.startsWith('SELECT')) {
    if (t.includes('FROM USERS')) {
      const param = params[0];
      const rows = data.users.filter(u => u.email === param || u.id === param);
      return { rows };
    }
    if (t.includes('FROM APPOINTMENTS')) {
      // Handle the specialized join query I added for reminders
      if (t.includes('JOIN USERS u ON a.user_id = u.id')) {
        const rows = data.appointments
          .filter(a => a.status === 'scheduled')
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
      console.log('--- DB QUERY: FROM PAYMENTS ---');
      console.log('Query Text:', t);

      // Handle Admin Dashboard Join Query
      // The query in admin.service.ts is: SELECT ... FROM PAYMENTS p JOIN USERS u ...
      if (t.includes('JOIN USERS')) {
        console.log('Detected ADMIN JOIN Query');

        // Filter for pending_review if requested
        let filtered = data.payments;
        if (t.includes("'PENDING_REVIEW'")) {
          console.log('Filtering for pending_review');
          filtered = filtered.filter(p => p.status === 'pending_review');
        }

        const rows = filtered.map(p => {
          const user = data.users.find(u => u.id === p.user_id);
          // Explicitly construct the result to ensure all fields are present
          return {
            id: p.id,
            user_id: p.user_id,
            provider: p.provider,
            transaction_id: p.transaction_id,
            amount: p.amount,
            plan: p.plan,
            status: p.status,
            phone: p.phone,
            created_at: p.created_at,
            user_name: user ? user.name : 'Inconnu',
            user_email: user ? user.email : 'Inconnu'
          };
        })
          .sort((a, b) => {
            const dateA = new Date(a.created_at || 0).getTime();
            const dateB = new Date(b.created_at || 0).getTime();
            return dateB - dateA;
          });

        console.log('Returning rows:', rows.length);
        if (rows.length > 0) console.log('Sample Row:', rows[0]);
        return { rows };
      }

      // Simple select (duplicate check or other)
      if (t.includes('WHERE TRANSACTION_ID =')) {
        const txId = params[0];
        const rows = data.payments.filter(p => p.transaction_id === txId);
        console.log(`[DB] Checking duplicate for ${txId}: ${rows.length} found`);
        return { rows };
      }

      return { rows: data.payments };
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
      created_at: new Date().toISOString()
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
      email: params[3] || null, // Capture email
      date: params[4],
      staff_name: params[5] || 'Équipe DwalaBook',
      status: 'scheduled',
      created_at: new Date().toISOString()
    };
    data.appointments.push(newApt);
    await save();
    return { rows: [newApt] };
  }

  if (t.startsWith('UPDATE APPOINTMENTS')) {
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
      } else if (t.includes('SET NAME =')) {
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
      phone: params[6] || null,
      created_at: new Date().toISOString()
    };
    data.payments.push(newPayment);
    await save();
    return { rows: [newPayment] };
  }

  if (t.startsWith('UPDATE PAYMENTS')) {
    const status = params[0];
    const transactionId = params[1];
    const p = data.payments.find(pm => pm.transaction_id === transactionId);
    if (p) {
      p.status = status;
      await save();
      return { rows: [p] };
    }
  }

  return { rows: [] };
};

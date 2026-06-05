require('dotenv').config();
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function setup() {
  const users = [
    { username: 'admin',  password: 'Admin123!', full_name: 'Главный администратор', role: 'admin' },
    { username: 'judge1', password: 'Judge123!', full_name: 'Судья 1', role: 'judge' },
    { username: 'judge2', password: 'Judge123!', full_name: 'Судья 2', role: 'judge' },
  ];

  for (const u of users) {
    const hash = await bcrypt.hash(u.password, 10);
    await pool.query(
      `INSERT INTO users (username, password_hash, full_name, role)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT (username) DO UPDATE SET password_hash=$2`,
      [u.username, hash, u.full_name, u.role]
    );
    console.log(`✓ Пользователь создан: ${u.username} / ${u.password}`);
  }

  console.log('\nГотово! Войдите на сайт с указанными логинами и паролями.');
  pool.end();
}

setup().catch(console.error);

import 'dotenv/config';
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

(async () => {
  const r = await pool.query(
    "SELECT id, email, role, created_at FROM users WHERE email ILIKE '%sansline%' ORDER BY id"
  );
  console.log('Rows:', r.rows.length);
  for (const u of r.rows) {
    console.log(JSON.stringify(u));
  }
  await pool.end();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });

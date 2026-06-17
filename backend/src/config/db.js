import * as mariadb from 'mariadb';
import dotenv from 'dotenv';

dotenv.config();

// Support both local .env (DB_HOST, etc.) and Railway (MYSQLHOST, etc.)
const config = {
    host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
    user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
    password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '',
    database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'gymbuddy_database_1',
    port: parseInt(process.env.MYSQLPORT || process.env.DB_PORT || '3306'),
    connectionLimit: 10,
    ssl: process.env.DB_SSL === 'true' ? true : false
};

console.log('[DB] Connecting to MySQL:', config.host + ':' + config.port + '/' + config.database);

const pool = mariadb.createPool(config);

let dbConnected = false;

export const isDBConnected = () => dbConnected;

export const connectDB = async (retries = 10, delay = 5000) => {
    console.log('[DB] Connecting to database...');
    for (let i = 0; i < retries; i++) {
        try {
            const connection = await pool.getConnection();
            await connection.query('SELECT 1');
            connection.release();
            dbConnected = true;
            console.log('Database connected successfully');
            return true;
        } catch (error) {
            console.log('[DB] Connection attempt ' + (i + 1) + '/' + retries + ' failed:', error.message);
            if (i < retries - 1) {
                console.log('[DB] Retrying in ' + (delay / 1000) + ' seconds...');
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    console.error('[DB] All connection attempts failed. Server will run without database.');
    return false;
};

export const getDBPool = () => {
    console.log('[Config] getDBPool called');
    return pool;
};

export default pool;

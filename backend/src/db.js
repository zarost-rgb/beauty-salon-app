const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'beauty_user',
  password: process.env.DB_PASSWORD || 'beauty_secret_pass',
  database: process.env.DB_NAME || 'beauty_salon_db',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('[Database Pool Error]:', err.message);
});

/**
 * Execute a query with parameters
 * @param {string} text 
 * @param {Array} params 
 * @returns {Promise<any>}
 */
const query = (text, params) => pool.query(text, params);

/**
 * Check if the database connection is healthy
 * @returns {Promise<boolean>}
 */
const checkConnection = async () => {
  try {
    const res = await pool.query('SELECT 1 AS healthy');
    return res.rows && res.rows[0].healthy === 1;
  } catch (err) {
    console.error('[Database Health Check Failed]:', err.message);
    return false;
  }
};

module.exports = {
  pool,
  query,
  checkConnection,
};

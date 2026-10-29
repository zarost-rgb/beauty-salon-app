const express = require('express');
const router = express.Router();
const db = require('../db');
const { version } = require('../../package.json');

/**
 * @route GET /health
 * @desc Full readiness and healthcheck endpoint (verifies DB connection)
 */
router.get('/', async (req, res) => {
  const isDbHealthy = await db.checkConnection();
  const uptime = process.uptime();
  const timestamp = new Date().toISOString();

  if (isDbHealthy) {
    return res.status(200).json({
      status: 'UP',
      database: 'connected',
      uptime: Math.round(uptime),
      version,
      timestamp,
    });
  }

  return res.status(503).json({
    status: 'DOWN',
    database: 'disconnected',
    uptime: Math.round(uptime),
    version,
    timestamp,
  });
});

/**
 * @route GET /health/live
 * @desc Liveness probe endpoint (checks only if Node process is responsive)
 */
router.get('/live', (req, res) => {
  res.status(200).json({
    status: 'UP',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;

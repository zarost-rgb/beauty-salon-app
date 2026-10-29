const express = require('express');
const router = express.Router();
const db = require('../db');

/**
 * @route GET /api/services
 * @desc Get all beauty salon services
 */
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM services ORDER BY id ASC');
    res.json({
      success: true,
      count: rows.length,
      data: rows,
    });
  } catch (err) {
    console.error('[Error fetching services]:', err.message);
    res.status(500).json({
      success: false,
      error: 'Nie udało się pobrać listy usług. Spróbuj ponownie później.',
    });
  }
});

/**
 * @route GET /api/services/:id
 * @desc Get a single service by ID
 */
router.get('/:id', async (req, res) => {
  const serviceId = parseInt(req.params.id, 10);
  if (isNaN(serviceId)) {
    return res.status(400).json({
      success: false,
      error: 'Nieprawidłowy identyfikator usługi.',
    });
  }

  try {
    const { rows } = await db.query('SELECT * FROM services WHERE id = $1', [serviceId]);
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Usługa o podanym identyfikatorze nie istnieje.',
      });
    }

    res.json({
      success: true,
      data: rows[0],
    });
  } catch (err) {
    console.error('[Error fetching service by ID]:', err.message);
    res.status(500).json({
      success: false,
      error: 'Wystąpił błąd serwera podczas pobierania usługi.',
    });
  }
});

module.exports = router;

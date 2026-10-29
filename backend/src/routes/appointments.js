const express = require('express');
const router = express.Router();
const db = require('../db');

/**
 * Validate email format
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * @route GET /api/appointments
 * @desc Get all appointments with service information
 */
router.get('/', async (req, res) => {
  try {
    const queryText = `
      SELECT 
        a.id,
        a.customer_name,
        a.customer_email,
        a.customer_phone,
        a.service_id,
        s.name AS service_name,
        s.price AS service_price,
        s.duration_min AS service_duration_min,
        TO_CHAR(a.appointment_date, 'YYYY-MM-DD') AS appointment_date,
        a.appointment_time,
        a.notes,
        a.status,
        a.created_at
      FROM appointments a
      LEFT JOIN services s ON a.service_id = s.id
      ORDER BY a.appointment_date ASC, a.appointment_time ASC
    `;
    const { rows } = await db.query(queryText);
    res.json({
      success: true,
      count: rows.length,
      data: rows,
    });
  } catch (err) {
    console.error('[Error fetching appointments]:', err.message);
    res.status(500).json({
      success: false,
      error: 'Błąd podczas pobierania listy rezerwacji.',
    });
  }
});

/**
 * @route POST /api/appointments
 * @desc Create a new appointment
 */
router.post('/', async (req, res) => {
  const {
    customer_name,
    customer_email,
    customer_phone,
    service_id,
    appointment_date,
    appointment_time,
    notes,
  } = req.body;

  // Validation
  if (!customer_name || !customer_email || !customer_phone || !service_id || !appointment_date || !appointment_time) {
    return res.status(400).json({
      success: false,
      error: 'Wszystkie wymagane pola muszą zostać wypełnione (imię, e-mail, telefon, usługa, data, godzina).',
    });
  }

  if (!isValidEmail(customer_email)) {
    return res.status(400).json({
      success: false,
      error: 'Podano nieprawidłowy format adresu e-mail.',
    });
  }

  const parsedServiceId = parseInt(service_id, 10);
  if (isNaN(parsedServiceId)) {
    return res.status(400).json({
      success: false,
      error: 'Nieprawidłowy identyfikator wybranej usługi.',
    });
  }

  try {
    // Check if the service exists
    const serviceCheck = await db.query('SELECT id, name FROM services WHERE id = $1', [parsedServiceId]);
    if (serviceCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Wybrana usługa nie istnieje w bazie danych.',
      });
    }

    const insertQuery = `
      INSERT INTO appointments 
        (customer_name, customer_email, customer_phone, service_id, appointment_date, appointment_time, notes, status)
      VALUES 
        ($1, $2, $3, $4, $5, $6, $7, 'potwierdzona')
      RETURNING 
        id, customer_name, customer_email, customer_phone, service_id, 
        TO_CHAR(appointment_date, 'YYYY-MM-DD') AS appointment_date, 
        appointment_time, notes, status, created_at
    `;

    const { rows } = await db.query(insertQuery, [
      customer_name.trim(),
      customer_email.trim().toLowerCase(),
      customer_phone.trim(),
      parsedServiceId,
      appointment_date,
      appointment_time,
      notes ? notes.trim() : null,
    ]);

    const createdAppointment = rows[0];
    createdAppointment.service_name = serviceCheck.rows[0].name;

    res.status(201).json({
      success: true,
      message: 'Rezerwacja została pomyślnie utworzona.',
      data: createdAppointment,
    });
  } catch (err) {
    console.error('[Error creating appointment]:', err.message);
    res.status(500).json({
      success: false,
      error: 'Wystąpił błąd podczas zapisywania rezerwacji.',
    });
  }
});

/**
 * @route DELETE /api/appointments/:id
 * @desc Cancel/delete an appointment by ID
 */
router.delete('/:id', async (req, res) => {
  const appointmentId = parseInt(req.params.id, 10);
  if (isNaN(appointmentId)) {
    return res.status(400).json({
      success: false,
      error: 'Nieprawidłowy identyfikator rezerwacji.',
    });
  }

  try {
    const { rowCount } = await db.query('DELETE FROM appointments WHERE id = $1', [appointmentId]);
    if (rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Rezerwacja o podanym identyfikatorze nie została odnaleziona.',
      });
    }

    res.json({
      success: true,
      message: 'Rezerwacja została pomyślnie anulowana.',
    });
  } catch (err) {
    console.error('[Error deleting appointment]:', err.message);
    res.status(500).json({
      success: false,
      error: 'Błąd podczas usuwania rezerwacji.',
    });
  }
});

module.exports = router;

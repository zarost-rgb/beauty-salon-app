const request = require('supertest');
const app = require('../src/app');
const db = require('../src/db');

// Mock database module
jest.mock('../src/db');

describe('Services & Appointments API Endpoints', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/services', () => {
    it('powinien zwrócić listę dostępnych usług salonu', async () => {
      const mockServices = [
        { id: 1, name: 'Strzyżenie damskie', price: '120.00', duration_min: 60 },
        { id: 2, name: 'Manicure hybrydowy', price: '110.00', duration_min: 60 },
      ];
      db.query.mockResolvedValue({ rows: mockServices });

      const response = await request(app).get('/api/services');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].name).toBe('Strzyżenie damskie');
    });

    it('powinien obsłużyć błąd serwera przy pobieraniu usług', async () => {
      db.query.mockRejectedValue(new Error('Błąd bazy danych'));

      const response = await request(app).get('/api/services');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/services/:id', () => {
    it('powinien zwrócić usługę o podanym ID', async () => {
      const mockService = { id: 1, name: 'Strzyżenie damskie', price: '120.00' };
      db.query.mockResolvedValue({ rows: [mockService] });

      const response = await request(app).get('/api/services/1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(1);
    });

    it('powinien zwrócić 400 dla niepoprawnego formatu ID', async () => {
      const response = await request(app).get('/api/services/abc');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('powinien zwrócić 404 dla nieistniejącej usługi', async () => {
      db.query.mockResolvedValue({ rows: [] });

      const response = await request(app).get('/api/services/999');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/appointments', () => {
    it('powinien odrzucić rezerwację z brakującymi polami', async () => {
      const response = await request(app)
        .post('/api/appointments')
        .send({ customer_name: 'Jan Kowalski' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Wszystkie wymagane pola');
    });

    it('powinien odrzucić rezerwację z niepoprawnym adresem email', async () => {
      const response = await request(app)
        .post('/api/appointments')
        .send({
          customer_name: 'Jan Kowalski',
          customer_email: 'nie-poprawny-email',
          customer_phone: '123456789',
          service_id: 1,
          appointment_date: '2026-11-20',
          appointment_time: '12:00',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('nieprawidłowy format adresu e-mail');
    });

    it('powinien pomyślnie utworzyć rezerwację przy poprawnych danych', async () => {
      // 1st query: check service exists
      db.query.mockResolvedValueOnce({
        rows: [{ id: 1, name: 'Strzyżenie damskie' }],
      });
      // 2nd query: insert appointment
      db.query.mockResolvedValueOnce({
        rows: [{
          id: 10,
          customer_name: 'Anna Nowak',
          customer_email: 'anna@example.com',
          customer_phone: '+48 111 222 333',
          service_id: 1,
          appointment_date: '2026-11-20',
          appointment_time: '14:00',
          notes: 'Brak',
          status: 'potwierdzona',
        }],
      });

      const response = await request(app)
        .post('/api/appointments')
        .send({
          customer_name: 'Anna Nowak',
          customer_email: 'anna@example.com',
          customer_phone: '+48 111 222 333',
          service_id: 1,
          appointment_date: '2026-11-20',
          appointment_time: '14:00',
          notes: 'Brak',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.customer_name).toBe('Anna Nowak');
      expect(response.body.data.service_name).toBe('Strzyżenie damskie');
    });
  });

  describe('DELETE /api/appointments/:id', () => {
    it('powinien pomyślnie anulować istniejącą rezerwację', async () => {
      db.query.mockResolvedValue({ rowCount: 1 });

      const response = await request(app).delete('/api/appointments/5');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('pomyślnie anulowana');
    });

    it('powinien zwrócić 404 przy próbie usunięcia nieistniejącej rezerwacji', async () => {
      db.query.mockResolvedValue({ rowCount: 0 });

      const response = await request(app).delete('/api/appointments/999');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });
});

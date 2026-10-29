const request = require('supertest');
const app = require('../src/app');
const db = require('../src/db');

// Mock database pool
jest.mock('../src/db');

describe('Health and Metrics Endpoints', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /health', () => {
    it('powinien zwrócić status 200 i status UP, gdy baza danych jest połączona', async () => {
      db.checkConnection.mockResolvedValue(true);

      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'UP');
      expect(response.body).toHaveProperty('database', 'connected');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('version');
    });

    it('powinien zwrócić status 503 i status DOWN, gdy baza danych nie odpowiada', async () => {
      db.checkConnection.mockResolvedValue(false);

      const response = await request(app).get('/health');

      expect(response.status).toBe(503);
      expect(response.body).toHaveProperty('status', 'DOWN');
      expect(response.body).toHaveProperty('database', 'disconnected');
    });
  });

  describe('GET /health/live', () => {
    it('powinien zwrócić status 200 dla liveness probe', async () => {
      const response = await request(app).get('/health/live');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'UP');
    });
  });

  describe('GET /metrics', () => {
    it('powinien wyeksportować metryki Prometheusa', async () => {
      const response = await request(app).get('/metrics');

      expect(response.status).toBe(200);
      expect(response.text).toContain('beauty_salon_');
    });
  });
});

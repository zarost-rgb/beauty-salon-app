const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { metricsMiddleware, metricsEndpoint } = require('./middleware/metrics');

const healthRoutes = require('./routes/health');
const servicesRoutes = require('./routes/services');
const appointmentsRoutes = require('./routes/appointments');

const app = express();

// Security and utility middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Prometheus metrics middleware
app.use(metricsMiddleware);

// Monitoring and health endpoints
app.use('/health', healthRoutes);
app.get('/metrics', metricsEndpoint);

// Business REST API routes
app.use('/api/services', servicesRoutes);
app.use('/api/appointments', appointmentsRoutes);

// Root informational endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Bellezza Studio API',
    description: 'REST API dla systemu rezerwacji salonu urody',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      metrics: '/metrics',
      services: '/api/services',
      appointments: '/api/appointments',
    },
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Nie znaleziono ścieżki: ${req.method} ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Express Error]:', err);
  res.status(500).json({
    success: false,
    error: 'Wewnętrzny błąd serwera. Skontaktuj się z administratorem.',
  });
});

module.exports = app;

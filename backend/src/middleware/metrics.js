const client = require('prom-client');

// Initialize default recommended Node.js/system metrics
const register = new client.Registry();
client.collectDefaultMetrics({
  register,
  prefix: 'beauty_salon_',
});

// Custom metric: HTTP request duration histogram
const httpRequestDurationSeconds = new client.Histogram({
  name: 'beauty_salon_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
  registers: [register],
});

// Custom metric: HTTP total request counter
const httpRequestsTotal = new client.Counter({
  name: 'beauty_salon_http_requests_total',
  help: 'Total number of HTTP requests processed',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

/**
 * Middleware measuring request duration and counting requests
 */
const metricsMiddleware = (req, res, next) => {
  const start = process.hrtime();

  res.on('finish', () => {
    const diff = process.hrtime(start);
    const durationInSeconds = diff[0] + diff[1] / 1e9;
    
    // Normalize path to prevent high cardinality (e.g., /api/appointments/123 -> /api/appointments/:id)
    let route = req.baseUrl + (req.route ? req.route.path : req.path);
    if (!route || route === '') {
      route = req.path;
    }

    const labels = {
      method: req.method,
      route: route,
      status_code: res.statusCode,
    };

    httpRequestDurationSeconds.observe(labels, durationInSeconds);
    httpRequestsTotal.inc(labels);
  });

  next();
};

/**
 * Route handler to expose metrics endpoint
 */
const metricsEndpoint = async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    res.status(500).end(err.message);
  }
};

module.exports = {
  register,
  metricsMiddleware,
  metricsEndpoint,
  httpRequestDurationSeconds,
  httpRequestsTotal,
};

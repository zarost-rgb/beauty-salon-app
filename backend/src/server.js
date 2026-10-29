const app = require('./app');
const { pool } = require('./db');
require('dotenv').config();

const PORT = parseInt(process.env.PORT || '5000', 10);

const server = app.listen(PORT, () => {
  console.log(`[Bellezza Studio Backend] Serwer uruchomiony na porcie ${PORT}`);
  console.log(`[Healthcheck] http://localhost:${PORT}/health`);
  console.log(`[Metrics] http://localhost:${PORT}/metrics`);
});

// Graceful shutdown handling
const gracefulShutdown = (signal) => {
  console.log(`\n[Bellezza Studio Backend] Otrzymano sygnał ${signal}. Rozpoczynanie zamykania serwera...`);
  
  server.close(async () => {
    console.log('[Bellezza Studio Backend] Serwer HTTP został zamknięty.');
    try {
      await pool.end();
      console.log('[Bellezza Studio Backend] Pula połączeń z PostgreSQL została zamknięta.');
      process.exit(0);
    } catch (err) {
      console.error('[Bellezza Studio Backend] Błąd podczas zamykania bazy danych:', err.message);
      process.exit(1);
    }
  });

  // Force close after 10 seconds if graceful shutdown takes too long
  setTimeout(() => {
    console.error('[Bellezza Studio Backend] Wymuszone zamknięcie po przekroczeniu limitu czasu.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

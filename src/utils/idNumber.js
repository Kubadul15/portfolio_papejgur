const config = require('../config');

/**
 * Generuje losowy, czytelny numer dokumentu, np. EH-4821.
 * Losowy zamiast sekwencyjnego, zeby nie trzeba bylo trzymac
 * trwalego licznika (bot dziala bez wlasnej bazy danych).
 */
function generateIdNumber(prefix = config.idPrefix) {
  const number = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${number}`;
}

module.exports = { generateIdNumber };

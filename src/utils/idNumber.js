const config = require('../config');

/**
 * Generuje losowy, czytelny numer dowodu, np. EH-4821.
 * Losowy zamiast sekwencyjnego, zeby nie trzeba bylo trzymac
 * trwalego licznika (bot dziala bez wlasnej bazy danych).
 */
function generateIdNumber() {
  const number = Math.floor(1000 + Math.random() * 9000);
  return `${config.idPrefix}-${number}`;
}

module.exports = { generateIdNumber };

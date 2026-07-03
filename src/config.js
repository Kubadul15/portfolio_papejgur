const path = require('path');
require('dotenv').config();

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Brak wymaganej zmiennej srodowiskowej: ${name}`);
  }
  return value;
}

// Domyslnie plik trzymany jest w repo (data/registry.json) - to dziala
// lokalnie, ale na Railway dysk jest efemeryczny i znika przy kazdym
// redeployu. Aby rejestr (dowody/prawa jazdy/pojazdy/system policyjny)
// przetrwal redeploy, trzeba podpiac Railway Volume i ustawic REGISTRY_PATH
// na sciezke montowania (np. /data/registry.json) - patrz README.
const rawRegistryPath = process.env.REGISTRY_PATH || 'data/registry.json';

module.exports = {
  discordToken: requireEnv('DISCORD_TOKEN'),
  clientId: requireEnv('CLIENT_ID'),
  guildId: requireEnv('GUILD_ID'),
  targetChannelId: requireEnv('TARGET_CHANNEL_ID'),
  idPrefix: process.env.ID_PREFIX || 'EH',
  serverName: process.env.SERVER_NAME || 'Emergency Hamburg ROLEPLAY | Gdansk RP',
  embedColor: process.env.EMBED_COLOR || '#8b5cf6',
  // Opcjonalny - jesli nie ustawiony, logowanie administracyjne jest pomijane.
  adminLogChannelId: process.env.ADMIN_LOG_CHANNEL_ID || null,
  registryPath: path.isAbsolute(rawRegistryPath) ? rawRegistryPath : path.join(__dirname, '..', rawRegistryPath),
  // Bot moze byc zaproszony na wiecej niz jeden serwer, ale caly system
  // policyjny (/policja) ma dzialac wylacznie na glownym serwerze Gdansk RP -
  // domyslna wartosc ponizej mozna nadpisac zmienna POLICE_GUILD_ID.
  policeGuildId: process.env.POLICE_GUILD_ID || '1522536500242284685',
};

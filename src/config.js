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

// Bot moze byc zaproszony na wiecej niz jeden serwer, ale caly system
// policyjny (/policja) ma dzialac wylacznie na jednym, glownym serwerze -
// domyslna wartosc ponizej mozna nadpisac zmienna POLICE_GUILD_ID.
const policeGuildId = process.env.POLICE_GUILD_ID || '1522536500242284685';

// Odwrotna sytuacja: /robloxban ma dzialac wylacznie na "starym" serwerze
// (tym sprzed dodania serwera policyjnego), niezaleznie od tego, na ilu
// serwerach bot jest obecny.
const legacyGuildId = process.env.LEGACY_GUILD_ID || '1521870662162190388';

// Kanal, na ktory /robloxban wysyla embed z banem - mozna nadpisac
// zmienna ROBLOX_BAN_CHANNEL_ID.
const robloxBanChannelId = process.env.ROBLOX_BAN_CHANNEL_ID || '1522589245267644557';

// GUILD_ID moze byc jednym ID albo lista ID rozdzielona przecinkami, jesli
// bot ma dzialac (i miec zarejestrowane slash commands) na wiecej niz jednym
// serwerze - patrz deploy-commands.js, ktore rejestruje komendy na kazdym
// z nich osobno. Serwer policyjny (policeGuildId) jest zawsze dolaczany do
// tej listy na sztywno, zeby literowka albo pominiecie go w GUILD_ID na
// Railway nie zostawily tego serwera bez zarejestrowanych komend.
const guildIds = Array.from(
  new Set([
    ...requireEnv('GUILD_ID')
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean),
    policeGuildId,
  ])
);

module.exports = {
  discordToken: requireEnv('DISCORD_TOKEN'),
  clientId: requireEnv('CLIENT_ID'),
  guildId: guildIds[0],
  guildIds,
  targetChannelId: requireEnv('TARGET_CHANNEL_ID'),
  idPrefix: process.env.ID_PREFIX || 'EH',
  serverName: process.env.SERVER_NAME || 'Emergency Hamburg ROLEPLAY | Gdansk RP',
  embedColor: process.env.EMBED_COLOR || '#8b5cf6',
  // Opcjonalny - jesli nie ustawiony, logowanie administracyjne jest pomijane.
  adminLogChannelId: process.env.ADMIN_LOG_CHANNEL_ID || null,
  registryPath: path.isAbsolute(rawRegistryPath) ? rawRegistryPath : path.join(__dirname, '..', rawRegistryPath),
  policeGuildId,
  legacyGuildId,
  robloxBanChannelId,
};

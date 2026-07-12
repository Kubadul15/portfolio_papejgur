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
// redeployu. Aby rejestr (dowody/pojazdy/domy/aukcje) przetrwal redeploy,
// trzeba podpiac Railway Volume i ustawic REGISTRY_PATH na sciezke
// montowania (np. /data/registry.json) - patrz README.
const rawRegistryPath = process.env.REGISTRY_PATH || 'data/registry.json';

// /robloxban ma dzialac wylacznie na tym, skonfigurowanym serwerze
// (domyslnie jedyny serwer bota, ale mozna nadpisac osobno).
const legacyGuildId = process.env.LEGACY_GUILD_ID || '1515306861241565352';

// Kanal, na ktory /robloxban wysyla embed z banem - mozna nadpisac
// zmienna ROBLOX_BAN_CHANNEL_ID.
const robloxBanChannelId = process.env.ROBLOX_BAN_CHANNEL_ID || '1522589245267644557';

// Kod sesji RP jest stale (jeden, ten sam kazdorazowo), nie losowany -
// mozna go nadpisac zmienna ROLEPLAY_SESSION_CODE.
const roleplaySessionCode = process.env.ROLEPLAY_SESSION_CODE || 'pt9iqi8i';

// Kanal, na ktory trafiaja zatwierdzone dowody (klik "Wyslij") - mozna
// nadpisac zmienna TARGET_CHANNEL_ID.
const targetChannelId = process.env.TARGET_CHANNEL_ID || '1523744374360506418';

// Rola uprawniona do rozpoczynania aukcji domow (/panel aukcja-domow) -
// mozna nadpisac zmienna HOUSE_AUCTION_ADMIN_ROLE_ID. Kazdy moze licytowac,
// ale tylko ta rola (lub sam prowadzacy aukcje) moze ja rozpoczac/zakonczyc.
const houseAuctionAdminRoleId = process.env.HOUSE_AUCTION_ADMIN_ROLE_ID || '1523744175822995617';

// GUILD_ID moze byc jednym ID albo lista ID rozdzielona przecinkami, jesli
// bot ma dzialac (i miec zarejestrowane slash commands) na wiecej niz jednym
// serwerze - patrz deploy-commands.js, ktore rejestruje komendy na kazdym
// z nich osobno. Domyslnie jest to jedyny serwer bota (Małopolska RP).
const guildIds = Array.from(
  new Set(
    (process.env.GUILD_ID || '1515306861241565352')
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean)
  )
);

module.exports = {
  discordToken: requireEnv('DISCORD_TOKEN'),
  clientId: requireEnv('CLIENT_ID'),
  guildId: guildIds[0],
  guildIds,
  targetChannelId,
  idPrefix: process.env.ID_PREFIX || 'EH',
  serverName: process.env.SERVER_NAME || 'Emergency Hamburg ROLEPLAY | Małopolska RP',
  embedColor: process.env.EMBED_COLOR || '#8b5cf6',
  // Opcjonalny - jesli nie ustawiony, logowanie administracyjne jest pomijane.
  adminLogChannelId: process.env.ADMIN_LOG_CHANNEL_ID || null,
  registryPath: path.isAbsolute(rawRegistryPath) ? rawRegistryPath : path.join(__dirname, '..', rawRegistryPath),
  legacyGuildId,
  robloxBanChannelId,
  roleplaySessionCode,
  houseAuctionAdminRoleId,
};

require('dotenv').config();

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Brak wymaganej zmiennej srodowiskowej: ${name}`);
  }
  return value;
}

module.exports = {
  discordToken: requireEnv('DISCORD_TOKEN'),
  clientId: requireEnv('CLIENT_ID'),
  guildId: requireEnv('GUILD_ID'),
  targetChannelId: requireEnv('TARGET_CHANNEL_ID'),
  idPrefix: process.env.ID_PREFIX || 'EH',
  serverName: process.env.SERVER_NAME || 'Emergency Hamburg ROLEPLAY | Gdansk RP',
  embedColor: process.env.EMBED_COLOR || '#8b5cf6',
};

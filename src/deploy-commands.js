const { REST, Routes } = require('discord.js');
const config = require('./config');
const panelCommand = require('./commands/panel');
const robloxbanCommand = require('./commands/robloxban');
const roleplayCommand = require('./commands/roleplay');

const commands = [
  panelCommand.data.toJSON(),
  robloxbanCommand.data.toJSON(),
  roleplayCommand.data.toJSON(),
];

const rest = new REST().setToken(config.discordToken);

(async () => {
  let hadError = false;

  for (const guildId of config.guildIds) {
    try {
      console.log(`Rejestrowanie ${commands.length} komend na serwerze ${guildId}...`);

      await rest.put(Routes.applicationGuildCommands(config.clientId, guildId), {
        body: commands,
      });

      console.log(`Komendy zarejestrowane pomyślnie na serwerze ${guildId}.`);
    } catch (error) {
      hadError = true;
      console.error(`Błąd podczas rejestracji komend na serwerze ${guildId}:`, error);
    }
  }

  if (hadError) {
    process.exitCode = 1;
  }
})();

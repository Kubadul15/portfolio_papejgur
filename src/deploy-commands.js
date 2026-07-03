const { REST, Routes } = require('discord.js');
const config = require('./config');
const panelCommand = require('./commands/panel');
const policjaCommand = require('./commands/policja');

const commands = [panelCommand.data.toJSON(), policjaCommand.data.toJSON()];

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

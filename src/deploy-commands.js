const { REST, Routes } = require('discord.js');
const config = require('./config');
const panelCommand = require('./commands/panel');
const policjaCommand = require('./commands/policja');

const commands = [panelCommand.data.toJSON(), policjaCommand.data.toJSON()];

const rest = new REST().setToken(config.discordToken);

(async () => {
  try {
    console.log(`Rejestrowanie ${commands.length} komend na serwerze ${config.guildId}...`);

    await rest.put(Routes.applicationGuildCommands(config.clientId, config.guildId), {
      body: commands,
    });

    console.log('Komendy zarejestrowane pomyślnie.');
  } catch (error) {
    console.error('Błąd podczas rejestracji komend:', error);
    process.exitCode = 1;
  }
})();

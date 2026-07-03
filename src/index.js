const { Client, GatewayIntentBits, Collection } = require('discord.js');
const config = require('./config');
const panelCommand = require('./commands/panel');
const policjaCommand = require('./commands/policja');
const { routeInteraction } = require('./interactions');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

const commands = new Collection();
commands.set(panelCommand.data.name, panelCommand);
commands.set(policjaCommand.data.name, policjaCommand);

client.once('ready', () => {
  console.log(`Zalogowano jako ${client.user.tag} — ${config.serverName}`);
});

client.on('interactionCreate', (interaction) => routeInteraction(interaction, commands));

client.login(config.discordToken);

const fs = require('fs');
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const config = require('./config');
const panelCommand = require('./commands/panel');
const policjaCommand = require('./commands/policja');
const robloxbanCommand = require('./commands/robloxban');
const { routeInteraction } = require('./interactions');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

const commands = new Collection();
commands.set(panelCommand.data.name, panelCommand);
commands.set(policjaCommand.data.name, policjaCommand);
commands.set(robloxbanCommand.data.name, robloxbanCommand);

client.once('ready', () => {
  console.log(`Zalogowano jako ${client.user.tag} — ${config.serverName}`);

  // Diagnostyka trwalego rejestru - jesli po kazdym restarcie widac tu
  // "plik NIE istnieje", to znaczy, ze REGISTRY_PATH nie wskazuje na
  // podpiety Railway Volume i dane naprawde znikaja przy kazdym redeployu
  // (patrz sekcja "Trwaly rejestr danych" w README).
  const registryExists = fs.existsSync(config.registryPath);
  console.log(
    `Rejestr danych: ${config.registryPath} (plik ${registryExists ? 'ISTNIEJE — dane powinny przetrwać restart' : 'NIE istnieje — pierwsze uruchomienie albo brak podpiętego Railway Volume'})`
  );
});

client.on('interactionCreate', (interaction) => routeInteraction(interaction, commands));

client.login(config.discordToken);

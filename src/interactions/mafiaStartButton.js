const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const { MAFIA_START_PREFIX, MAFIA_SIZE_PREFIX } = require('./constants');

const SIZE_OPTIONS = ['3', '4', '5', '6', '7', '8', '9', '10', '10+'];

async function handleMafiaStartButton(interaction) {
  const channelId = interaction.customId.slice(MAFIA_START_PREFIX.length + 1);

  const select = new StringSelectMenuBuilder()
    .setCustomId(`${MAFIA_SIZE_PREFIX}:${channelId}`)
    .setPlaceholder('Ile osób jest w organizacji? (min. 3)')
    .addOptions(SIZE_OPTIONS.map((value) => ({ label: value, value })));

  const row = new ActionRowBuilder().addComponents(select);

  await interaction.reply({
    content: 'Ile osób liczy Twoja organizacja?',
    components: [row],
    ephemeral: true,
  });
}

module.exports = { handleMafiaStartButton };

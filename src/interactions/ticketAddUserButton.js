const { ActionRowBuilder, UserSelectMenuBuilder } = require('discord.js');
const { parseTicketTopic } = require('../utils/ticket');
const { TICKET_ADD_USER_SELECT_ID } = require('./constants');

async function handleTicketAddUserButton(interaction) {
  const parsed = parseTicketTopic(interaction.channel.topic);
  if (!parsed) {
    await interaction.reply({ content: '❌ Nie rozpoznano danych tego ticketu.', ephemeral: true });
    return;
  }

  if (!interaction.member.roles.cache.has(parsed.supportRoleId)) {
    await interaction.reply({ content: '❌ Tylko obsługa może dodawać osoby do ticketu.', ephemeral: true });
    return;
  }

  const select = new UserSelectMenuBuilder()
    .setCustomId(TICKET_ADD_USER_SELECT_ID)
    .setPlaceholder('Wybierz osobę do dodania')
    .setMinValues(1)
    .setMaxValues(1);

  const row = new ActionRowBuilder().addComponents(select);

  await interaction.reply({ content: 'Kogo chcesz dodać do tego ticketu?', components: [row], ephemeral: true });
}

module.exports = { handleTicketAddUserButton };

const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { parseTicketTopic } = require('../utils/ticket');
const { TICKET_CREATE_PREFIX, TICKET_MODAL_PREFIX, MODAL_FIELD_TICKET_REASON } = require('./constants');

async function handleTicketCreateButton(interaction) {
  const [categoryId, supportRoleId] = interaction.customId.slice(TICKET_CREATE_PREFIX.length + 1).split(':');

  const category = interaction.guild.channels.cache.get(categoryId);
  if (!category) {
    await interaction.reply({
      content: '❌ Kategoria ticketów nie istnieje. Skontaktuj się z administracją.',
      ephemeral: true,
    });
    return;
  }

  const existing = category.children.cache.find((channel) => {
    const parsed = parseTicketTopic(channel.topic);
    return parsed && parsed.ownerId === interaction.user.id;
  });

  if (existing) {
    await interaction.reply({
      content: `❌ Masz już otwarty ticket: ${existing}. Zamknij go, zanim stworzysz kolejny.`,
      ephemeral: true,
    });
    return;
  }

  const modal = new ModalBuilder()
    .setCustomId(`${TICKET_MODAL_PREFIX}:${categoryId}:${supportRoleId}`)
    .setTitle('Nowy Ticket');

  const reasonInput = new TextInputBuilder()
    .setCustomId(MODAL_FIELD_TICKET_REASON)
    .setLabel('Temat / powód ticketu')
    .setStyle(TextInputStyle.Paragraph)
    .setMaxLength(500)
    .setRequired(true);

  modal.addComponents(new ActionRowBuilder().addComponents(reasonInput));

  await interaction.showModal(modal);
}

module.exports = { handleTicketCreateButton };

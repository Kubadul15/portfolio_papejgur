const { ChannelType, PermissionFlagsBits } = require('discord.js');
const { buildTicketTopic, parseTicketTopic, buildTicketActionRow } = require('../utils/ticket');
const { buildTicketEmbed } = require('../utils/embeds');
const { sendAdminLog } = require('../utils/adminLog');
const { TICKET_MODAL_PREFIX, MODAL_FIELD_TICKET_REASON } = require('./constants');

function buildTicketChannelName(username) {
  const sanitized = username
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return `ticket-${sanitized || 'user'}`.slice(0, 90);
}

async function handleTicketModal(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const [categoryId, supportRoleId] = interaction.customId.slice(TICKET_MODAL_PREFIX.length + 1).split(':');
  const reason = interaction.fields.getTextInputValue(MODAL_FIELD_TICKET_REASON).trim();

  const category = interaction.guild.channels.cache.get(categoryId);
  if (!category) {
    await interaction.editReply({ content: '❌ Kategoria ticketów nie istnieje. Skontaktuj się z administracją.' });
    return;
  }

  const existing = category.children.cache.find((channel) => {
    const parsed = parseTicketTopic(channel.topic);
    return parsed && parsed.ownerId === interaction.user.id;
  });

  if (existing) {
    await interaction.editReply({ content: `❌ Masz już otwarty ticket: ${existing}.` });
    return;
  }

  let ticketChannel;
  try {
    ticketChannel = await interaction.guild.channels.create({
      name: buildTicketChannelName(interaction.user.username),
      type: ChannelType.GuildText,
      parent: categoryId,
      topic: buildTicketTopic({ ownerId: interaction.user.id, supportRoleId }),
      permissionOverwrites: [
        { id: interaction.guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
        {
          id: interaction.user.id,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
        },
        {
          id: supportRoleId,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
        },
      ],
    });
  } catch (error) {
    console.error('Błąd podczas tworzenia kanału ticketu:', error);
    await interaction.editReply({
      content: '❌ Nie udało się utworzyć kanału ticketu. Sprawdź, czy bot ma uprawnienie Zarządzaj kanałami.',
    });
    return;
  }

  const embed = buildTicketEmbed({ owner: interaction.user, reason, claimerId: null });
  const row = buildTicketActionRow({ claimed: false });

  await ticketChannel.send({
    content: `${interaction.user} | <@&${supportRoleId}>`,
    embeds: [embed],
    components: [row],
  });

  await interaction.editReply({ content: `✅ Ticket utworzony: ${ticketChannel}.` });

  await sendAdminLog(interaction.client, {
    title: '🎫 Nowy ticket utworzony',
    description:
      `**Kto:** <@${interaction.user.id}> (${interaction.user.tag})\n` +
      `**Kanał:** ${ticketChannel}\n` +
      `**Temat:** ${reason}`,
  });
}

module.exports = { handleTicketModal };

const { ChannelType, PermissionFlagsBits, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const { buildApplicationTopic, parseApplicationTopic } = require('../utils/application');
const { buildApplicationEmbed } = require('../utils/embeds');
const { buildSlugChannelName } = require('../utils/channelName');
const { sendAdminLog } = require('../utils/adminLog');
const { parseAge } = require('../utils/validation');
const {
  APP_MODAL_PREFIX,
  APP_REVIEW_SELECT_ID,
  MODAL_FIELD_APP_AGE,
  MODAL_FIELD_APP_OTHER_SERVERS,
  MODAL_FIELD_APP_EH_EXPERIENCE,
  MODAL_FIELD_APP_FOUND_VIA,
  MODAL_FIELD_APP_HOURS,
} = require('./constants');

function buildReviewRow() {
  const select = new StringSelectMenuBuilder()
    .setCustomId(APP_REVIEW_SELECT_ID)
    .setPlaceholder('Rozpatrz podanie')
    .addOptions(
      { label: 'Przyjmij', value: 'accept', emoji: '✅' },
      { label: 'Odrzuć', value: 'reject', emoji: '❌' },
      { label: 'Wezwij użytkownika', value: 'summon', emoji: '📞' },
      { label: 'W trakcie rozpatrywania', value: 'review', emoji: '👀' }
    );

  return new ActionRowBuilder().addComponents(select);
}

async function handleApplicationModal(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const [categoryId, supportRoleId, acceptRoleId, mic] = interaction.customId
    .slice(APP_MODAL_PREFIX.length + 1)
    .split(':');

  const rawAge = interaction.fields.getTextInputValue(MODAL_FIELD_APP_AGE).trim();
  const otherServers = interaction.fields.getTextInputValue(MODAL_FIELD_APP_OTHER_SERVERS).trim();
  const ehExperience = interaction.fields.getTextInputValue(MODAL_FIELD_APP_EH_EXPERIENCE).trim();
  const foundVia = interaction.fields.getTextInputValue(MODAL_FIELD_APP_FOUND_VIA).trim();
  const hoursOnServer = interaction.fields.getTextInputValue(MODAL_FIELD_APP_HOURS).trim();

  const age = parseAge(rawAge);
  if (age === null) {
    await interaction.editReply({
      content: '⚠️ Podaj prawidłowy wiek — liczba całkowita od 1 do 100. Użyj przycisku jeszcze raz.',
    });
    return;
  }

  const category = interaction.guild.channels.cache.get(categoryId);
  if (!category) {
    await interaction.editReply({ content: '❌ Kategoria podań nie istnieje. Skontaktuj się z administracją.' });
    return;
  }

  const existing = category.children.cache.find((channel) => {
    const parsed = parseApplicationTopic(channel.topic);
    return parsed && parsed.ownerId === interaction.user.id;
  });

  if (existing) {
    await interaction.editReply({ content: `❌ Masz już otwarte podanie: ${existing}.` });
    return;
  }

  let applicationChannel;
  try {
    applicationChannel = await interaction.guild.channels.create({
      name: buildSlugChannelName('podanie', interaction.user.username),
      type: ChannelType.GuildText,
      parent: categoryId,
      topic: buildApplicationTopic({ ownerId: interaction.user.id, supportRoleId, acceptRoleId, status: 'new' }),
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
    console.error('Błąd podczas tworzenia kanału podania:', error);
    await interaction.editReply({
      content: '❌ Nie udało się utworzyć kanału podania. Sprawdź, czy bot ma uprawnienie Zarządzaj kanałami.',
    });
    return;
  }

  const embed = buildApplicationEmbed({
    applicant: interaction.member,
    mic: mic === 'tak' ? '✅ Tak' : '❌ Nie',
    age: String(age),
    otherServers,
    ehExperience,
    foundVia,
    hoursOnServer,
    status: 'new',
  });

  await applicationChannel.send({
    content: `${interaction.user} | <@&${supportRoleId}>`,
    embeds: [embed],
    components: [buildReviewRow()],
  });

  await interaction.editReply({ content: `✅ Podanie wysłane: ${applicationChannel}.` });

  await sendAdminLog(interaction.client, {
    title: '📝 Nowe podanie',
    description: `**Kto:** <@${interaction.user.id}> (${interaction.user.tag})\n**Kanał:** ${applicationChannel}`,
  });
}

module.exports = { handleApplicationModal, buildReviewRow };

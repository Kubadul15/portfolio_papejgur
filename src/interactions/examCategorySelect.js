const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const {
  EXAM_CATEGORY_PREFIX,
  EXAM_MODAL_PREFIX,
  MODAL_FIELD_FULL_NAME,
  MODAL_FIELD_AGE,
  MODAL_FIELD_ROBLOX,
} = require('./constants');

async function handleExamCategorySelect(interaction) {
  const channelId = interaction.customId.slice(EXAM_CATEGORY_PREFIX.length + 1);
  const category = interaction.values[0];

  const modal = new ModalBuilder()
    .setCustomId(`${EXAM_MODAL_PREFIX}:${channelId}:${category}`)
    .setTitle(`Zgłoszenie — kat. ${category}`);

  const fullNameInput = new TextInputBuilder()
    .setCustomId(MODAL_FIELD_FULL_NAME)
    .setLabel('Imię i nazwisko RP')
    .setStyle(TextInputStyle.Short)
    .setMaxLength(50)
    .setRequired(true);

  const ageInput = new TextInputBuilder()
    .setCustomId(MODAL_FIELD_AGE)
    .setLabel('Wiek RP')
    .setStyle(TextInputStyle.Short)
    .setMaxLength(3)
    .setRequired(true);

  const robloxInput = new TextInputBuilder()
    .setCustomId(MODAL_FIELD_ROBLOX)
    .setLabel('Nick Roblox')
    .setStyle(TextInputStyle.Short)
    .setMaxLength(20)
    .setRequired(true);

  modal.addComponents(
    new ActionRowBuilder().addComponents(fullNameInput),
    new ActionRowBuilder().addComponents(ageInput),
    new ActionRowBuilder().addComponents(robloxInput)
  );

  await interaction.showModal(modal);
}

module.exports = { handleExamCategorySelect };

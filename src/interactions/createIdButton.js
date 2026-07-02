const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const {
  CREATE_ID_BUTTON_ID,
  CREATE_ID_MODAL_ID,
  MODAL_FIELD_FULL_NAME,
  MODAL_FIELD_AGE,
  MODAL_FIELD_CITIZENSHIP,
  MODAL_FIELD_ROBLOX,
} = require('./constants');

async function handleCreateIdButton(interaction) {
  const rest = interaction.customId.slice(CREATE_ID_BUTTON_ID.length);
  const roleId = rest.startsWith(':') ? rest.slice(1) : null;
  const modalCustomId = roleId ? `${CREATE_ID_MODAL_ID}:${roleId}` : CREATE_ID_MODAL_ID;

  const modal = new ModalBuilder().setCustomId(modalCustomId).setTitle('Stwórz Dowód Osobisty RP');

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

  const citizenshipInput = new TextInputBuilder()
    .setCustomId(MODAL_FIELD_CITIZENSHIP)
    .setLabel('Obywatelstwo RP')
    .setStyle(TextInputStyle.Short)
    .setMaxLength(40)
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
    new ActionRowBuilder().addComponents(citizenshipInput),
    new ActionRowBuilder().addComponents(robloxInput)
  );

  await interaction.showModal(modal);
}

module.exports = { handleCreateIdButton };

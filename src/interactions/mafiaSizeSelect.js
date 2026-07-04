const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const {
  MAFIA_SIZE_PREFIX,
  MAFIA_MODAL_PREFIX,
  MODAL_FIELD_MAFIA_OWNER,
  MODAL_FIELD_MAFIA_COOWNER,
  MODAL_FIELD_MAFIA_NAME,
  MODAL_FIELD_MAFIA_COLOR,
  MODAL_FIELD_MAFIA_LOCATION,
} = require('./constants');

async function handleMafiaSizeSelect(interaction) {
  const channelId = interaction.customId.slice(MAFIA_SIZE_PREFIX.length + 1);
  const size = interaction.values[0];

  const modal = new ModalBuilder()
    .setCustomId(`${MAFIA_MODAL_PREFIX}:${channelId}:${size}`)
    .setTitle('Rejestracja Mafii/Gangu');

  const ownerInput = new TextInputBuilder()
    .setCustomId(MODAL_FIELD_MAFIA_OWNER)
    .setLabel('Właściciel Mafii/Gangu')
    .setStyle(TextInputStyle.Short)
    .setMaxLength(100)
    .setRequired(true);

  const coOwnerInput = new TextInputBuilder()
    .setCustomId(MODAL_FIELD_MAFIA_COOWNER)
    .setLabel('Współwłaściciel Mafii/Gangu')
    .setStyle(TextInputStyle.Short)
    .setMaxLength(100)
    .setRequired(true);

  const nameInput = new TextInputBuilder()
    .setCustomId(MODAL_FIELD_MAFIA_NAME)
    .setLabel('Nazwa Mafii/Gangu')
    .setStyle(TextInputStyle.Short)
    .setMaxLength(50)
    .setRequired(true);

  const colorInput = new TextInputBuilder()
    .setCustomId(MODAL_FIELD_MAFIA_COLOR)
    .setLabel('Kolor Aut')
    .setStyle(TextInputStyle.Short)
    .setMaxLength(30)
    .setRequired(true);

  const locationInput = new TextInputBuilder()
    .setCustomId(MODAL_FIELD_MAFIA_LOCATION)
    .setLabel('Miejscówka (gdzie jest baza)')
    .setStyle(TextInputStyle.Short)
    .setMaxLength(100)
    .setRequired(true);

  modal.addComponents(
    new ActionRowBuilder().addComponents(ownerInput),
    new ActionRowBuilder().addComponents(coOwnerInput),
    new ActionRowBuilder().addComponents(nameInput),
    new ActionRowBuilder().addComponents(colorInput),
    new ActionRowBuilder().addComponents(locationInput)
  );

  await interaction.showModal(modal);
}

module.exports = { handleMafiaSizeSelect };

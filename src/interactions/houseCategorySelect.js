const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const {
  HOUSE_CATEGORY_PREFIX,
  HOUSE_MODAL_PREFIX,
  MODAL_FIELD_HOUSE_OWNER,
  MODAL_FIELD_HOUSE_LOCATION,
  MODAL_FIELD_HOUSE_ADDRESS,
  MODAL_FIELD_HOUSE_PRICE,
  MODAL_FIELD_HOUSE_ROOMS,
} = require('./constants');

async function handleHouseCategorySelect(interaction) {
  const channelId = interaction.customId.slice(HOUSE_CATEGORY_PREFIX.length + 1);
  const category = interaction.values[0];

  const modal = new ModalBuilder()
    .setCustomId(`${HOUSE_MODAL_PREFIX}:${channelId}:${category}`)
    .setTitle(`Załóż dom — ${category}`.slice(0, 45));

  const ownerInput = new TextInputBuilder()
    .setCustomId(MODAL_FIELD_HOUSE_OWNER)
    .setLabel('Właściciel (imię i nazwisko RP)')
    .setStyle(TextInputStyle.Short)
    .setMaxLength(50)
    .setRequired(true);

  const locationInput = new TextInputBuilder()
    .setCustomId(MODAL_FIELD_HOUSE_LOCATION)
    .setLabel('Lokalizacja (dzielnica/okolica)')
    .setStyle(TextInputStyle.Short)
    .setMaxLength(50)
    .setRequired(true);

  const addressInput = new TextInputBuilder()
    .setCustomId(MODAL_FIELD_HOUSE_ADDRESS)
    .setLabel('Adres (ulica i numer)')
    .setStyle(TextInputStyle.Short)
    .setMaxLength(60)
    .setRequired(true);

  const priceInput = new TextInputBuilder()
    .setCustomId(MODAL_FIELD_HOUSE_PRICE)
    .setLabel('Cena (np. 500000)')
    .setStyle(TextInputStyle.Short)
    .setMaxLength(12)
    .setRequired(true);

  const roomsInput = new TextInputBuilder()
    .setCustomId(MODAL_FIELD_HOUSE_ROOMS)
    .setLabel('Liczba pokoi')
    .setStyle(TextInputStyle.Short)
    .setMaxLength(2)
    .setRequired(true);

  modal.addComponents(
    new ActionRowBuilder().addComponents(ownerInput),
    new ActionRowBuilder().addComponents(locationInput),
    new ActionRowBuilder().addComponents(addressInput),
    new ActionRowBuilder().addComponents(priceInput),
    new ActionRowBuilder().addComponents(roomsInput)
  );

  await interaction.showModal(modal);
}

module.exports = { handleHouseCategorySelect };

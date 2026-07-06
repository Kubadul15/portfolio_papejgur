const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const registry = require('../utils/registry');
const { parsePrice, parseRooms } = require('../utils/validation');
const {
  HOUSE_MODAL_PREFIX,
  HOUSE_DETAILS_START_PREFIX,
  MODAL_FIELD_HOUSE_OWNER,
  MODAL_FIELD_HOUSE_LOCATION,
  MODAL_FIELD_HOUSE_ADDRESS,
  MODAL_FIELD_HOUSE_PRICE,
  MODAL_FIELD_HOUSE_ROOMS,
} = require('./constants');

async function handleHouseModal(interaction) {
  const [channelId, category] = interaction.customId.slice(HOUSE_MODAL_PREFIX.length + 1).split(':');

  const owner = interaction.fields.getTextInputValue(MODAL_FIELD_HOUSE_OWNER).trim();
  const location = interaction.fields.getTextInputValue(MODAL_FIELD_HOUSE_LOCATION).trim();
  const address = interaction.fields.getTextInputValue(MODAL_FIELD_HOUSE_ADDRESS).trim();
  const rawPrice = interaction.fields.getTextInputValue(MODAL_FIELD_HOUSE_PRICE);
  const rawRooms = interaction.fields.getTextInputValue(MODAL_FIELD_HOUSE_ROOMS);

  const price = parsePrice(rawPrice);
  if (price === null) {
    await interaction.reply({
      content: '⚠️ Podaj prawidłową cenę — samą liczbę, bez liter (np. 500000). Użyj przycisku jeszcze raz.',
      ephemeral: true,
    });
    return;
  }

  const rooms = parseRooms(rawRooms);
  if (rooms === null) {
    await interaction.reply({
      content: '⚠️ Podaj prawidłową liczbę pokoi — liczba całkowita 1–20. Użyj przycisku jeszcze raz.',
      ephemeral: true,
    });
    return;
  }

  const pendingId = registry.savePendingHouse({ channelId, category, owner, location, address, price, rooms });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`${HOUSE_DETAILS_START_PREFIX}:${pendingId}`)
      .setLabel('Podaj dodatkowe szczegóły')
      .setEmoji('📋')
      .setStyle(ButtonStyle.Primary)
  );

  await interaction.reply({
    content:
      'Ostatni krok — kliknij przycisk, aby podać dodatkowe szczegóły domu (powierzchnia, rok budowy, garaż, basen, opis).',
    components: [row],
    ephemeral: true,
  });
}

module.exports = { handleHouseModal };

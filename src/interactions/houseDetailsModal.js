const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const registry = require('../utils/registry');
const { buildHouseCardEmbed } = require('../utils/embeds');
const { generateIdNumber } = require('../utils/idNumber');
const { parseArea, parseYear, parseYesNo } = require('../utils/validation');
const {
  HOUSE_DETAILS_MODAL_PREFIX,
  HOUSE_SEND_PREFIX,
  MODAL_FIELD_HOUSE_AREA,
  MODAL_FIELD_HOUSE_YEAR,
  MODAL_FIELD_HOUSE_GARAGE,
  MODAL_FIELD_HOUSE_POOL,
  MODAL_FIELD_HOUSE_DESC,
  CANCEL_ID_BUTTON_ID,
} = require('./constants');

async function handleHouseDetailsModal(interaction) {
  const pendingId = interaction.customId.slice(HOUSE_DETAILS_MODAL_PREFIX.length + 1);
  const pending = registry.getPendingHouse(pendingId);

  if (!pending) {
    await interaction.reply({
      content: '❌ Sesja rejestracji wygasła albo już została użyta. Użyj przycisku "Załóż Dom" jeszcze raz.',
      ephemeral: true,
    });
    return;
  }

  const rawArea = interaction.fields.getTextInputValue(MODAL_FIELD_HOUSE_AREA);
  const rawYear = interaction.fields.getTextInputValue(MODAL_FIELD_HOUSE_YEAR);
  const rawGarage = interaction.fields.getTextInputValue(MODAL_FIELD_HOUSE_GARAGE);
  const rawPool = interaction.fields.getTextInputValue(MODAL_FIELD_HOUSE_POOL);
  const description = interaction.fields.getTextInputValue(MODAL_FIELD_HOUSE_DESC).trim();

  const area = parseArea(rawArea);
  if (area === null) {
    await interaction.reply({
      content: '⚠️ Podaj prawidłową powierzchnię w m² — liczba 10–5000. Użyj przycisku jeszcze raz.',
      ephemeral: true,
    });
    return;
  }

  const yearBuilt = parseYear(rawYear);
  if (yearBuilt === null) {
    await interaction.reply({
      content: '⚠️ Podaj prawidłowy rok budowy (1900 – obecny rok). Użyj przycisku jeszcze raz.',
      ephemeral: true,
    });
    return;
  }

  const garage = parseYesNo(rawGarage);
  if (garage === null) {
    await interaction.reply({
      content: '⚠️ Pole "Garaż" musi zawierać "tak" albo "nie". Użyj przycisku jeszcze raz.',
      ephemeral: true,
    });
    return;
  }

  const pool = parseYesNo(rawPool);
  if (pool === null) {
    await interaction.reply({
      content: '⚠️ Pole "Basen" musi zawierać "tak" albo "nie". Użyj przycisku jeszcze raz.',
      ephemeral: true,
    });
    return;
  }

  registry.deletePendingHouse(pendingId);

  const embed = buildHouseCardEmbed({
    discordUser: interaction.user,
    category: pending.category,
    owner: pending.owner,
    location: pending.location,
    address: pending.address,
    price: pending.price,
    rooms: pending.rooms,
    area,
    yearBuilt,
    garage,
    pool,
    description,
    houseNumber: generateIdNumber('DOM'),
  });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`${HOUSE_SEND_PREFIX}:${pending.channelId}`)
      .setLabel('Wyślij')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId(CANCEL_ID_BUTTON_ID).setLabel('Anuluj').setStyle(ButtonStyle.Danger)
  );

  await interaction.reply({
    content: 'Oto podgląd Aktu Własności Domu — widoczny tylko dla Ciebie. Sprawdź dane i kliknij **Wyślij**.',
    embeds: [embed],
    components: [row],
    ephemeral: true,
  });
}

module.exports = { handleHouseDetailsModal };

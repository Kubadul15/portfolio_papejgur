const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const registry = require('../utils/registry');
const {
  HOUSE_DETAILS_START_PREFIX,
  HOUSE_DETAILS_MODAL_PREFIX,
  MODAL_FIELD_HOUSE_AREA,
  MODAL_FIELD_HOUSE_YEAR,
  MODAL_FIELD_HOUSE_GARAGE,
  MODAL_FIELD_HOUSE_POOL,
  MODAL_FIELD_HOUSE_DESC,
} = require('./constants');

async function handleHouseDetailsStartButton(interaction) {
  const pendingId = interaction.customId.slice(HOUSE_DETAILS_START_PREFIX.length + 1);

  if (!registry.getPendingHouse(pendingId)) {
    await interaction.reply({
      content: '❌ Sesja rejestracji wygasła albo już została użyta. Użyj przycisku "Załóż Dom" jeszcze raz.',
      ephemeral: true,
    });
    return;
  }

  const modal = new ModalBuilder()
    .setCustomId(`${HOUSE_DETAILS_MODAL_PREFIX}:${pendingId}`)
    .setTitle('Dodatkowe szczegóły domu');

  const areaInput = new TextInputBuilder()
    .setCustomId(MODAL_FIELD_HOUSE_AREA)
    .setLabel('Powierzchnia (m²)')
    .setStyle(TextInputStyle.Short)
    .setMaxLength(6)
    .setRequired(true);

  const yearInput = new TextInputBuilder()
    .setCustomId(MODAL_FIELD_HOUSE_YEAR)
    .setLabel('Rok budowy')
    .setStyle(TextInputStyle.Short)
    .setMaxLength(4)
    .setRequired(true);

  const garageInput = new TextInputBuilder()
    .setCustomId(MODAL_FIELD_HOUSE_GARAGE)
    .setLabel('Garaż (tak/nie)')
    .setStyle(TextInputStyle.Short)
    .setMaxLength(3)
    .setRequired(true);

  const poolInput = new TextInputBuilder()
    .setCustomId(MODAL_FIELD_HOUSE_POOL)
    .setLabel('Basen (tak/nie)')
    .setStyle(TextInputStyle.Short)
    .setMaxLength(3)
    .setRequired(true);

  const descInput = new TextInputBuilder()
    .setCustomId(MODAL_FIELD_HOUSE_DESC)
    .setLabel('Opis / dodatkowe udogodnienia')
    .setStyle(TextInputStyle.Paragraph)
    .setMaxLength(300)
    .setRequired(true);

  modal.addComponents(
    new ActionRowBuilder().addComponents(areaInput),
    new ActionRowBuilder().addComponents(yearInput),
    new ActionRowBuilder().addComponents(garageInput),
    new ActionRowBuilder().addComponents(poolInput),
    new ActionRowBuilder().addComponents(descInput)
  );

  await interaction.showModal(modal);
}

module.exports = { handleHouseDetailsStartButton };

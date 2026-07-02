const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { buildVehicleCardEmbed } = require('../utils/embeds');
const { generatePlateNumber, generateVin } = require('../utils/vehicle');
const { parseYear } = require('../utils/validation');
const {
  VEHICLE_MODAL_PREFIX,
  VEHICLE_SEND_PREFIX,
  MODAL_FIELD_VEHICLE_MAKE,
  MODAL_FIELD_VEHICLE_YEAR,
  MODAL_FIELD_VEHICLE_COLOR,
  MODAL_FIELD_VEHICLE_ENGINE,
  MODAL_FIELD_VEHICLE_OWNER,
  CANCEL_ID_BUTTON_ID,
} = require('./constants');

async function handleVehicleModal(interaction) {
  const [channelId, category] = interaction.customId.slice(VEHICLE_MODAL_PREFIX.length + 1).split(':');

  const make = interaction.fields.getTextInputValue(MODAL_FIELD_VEHICLE_MAKE).trim();
  const rawYear = interaction.fields.getTextInputValue(MODAL_FIELD_VEHICLE_YEAR).trim();
  const color = interaction.fields.getTextInputValue(MODAL_FIELD_VEHICLE_COLOR).trim();
  const engine = interaction.fields.getTextInputValue(MODAL_FIELD_VEHICLE_ENGINE).trim();
  const owner = interaction.fields.getTextInputValue(MODAL_FIELD_VEHICLE_OWNER).trim();

  const year = parseYear(rawYear);
  if (year === null) {
    await interaction.reply({
      content: `⚠️ Podaj prawidłowy rok produkcji — liczba czterocyfrowa od 1900 do ${new Date().getFullYear() + 1}. Użyj przycisku jeszcze raz.`,
      ephemeral: true,
    });
    return;
  }

  const embed = buildVehicleCardEmbed({
    discordUser: interaction.user,
    make,
    year,
    color,
    engine,
    owner,
    category,
    plateNumber: generatePlateNumber(),
    vin: generateVin(),
  });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`${VEHICLE_SEND_PREFIX}:${channelId}`)
      .setLabel('Wyślij')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId(CANCEL_ID_BUTTON_ID).setLabel('Anuluj').setStyle(ButtonStyle.Danger)
  );

  await interaction.reply({
    content: 'Oto podgląd dowodu rejestracyjnego — widoczny tylko dla Ciebie. Sprawdź dane i kliknij **Wyślij**.',
    embeds: [embed],
    components: [row],
    ephemeral: true,
  });
}

module.exports = { handleVehicleModal };

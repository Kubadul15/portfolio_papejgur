const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { buildMafiaCardEmbed } = require('../utils/embeds');
const { generateIdNumber } = require('../utils/idNumber');
const {
  MAFIA_MODAL_PREFIX,
  MAFIA_SEND_PREFIX,
  MODAL_FIELD_MAFIA_OWNER,
  MODAL_FIELD_MAFIA_COOWNER,
  MODAL_FIELD_MAFIA_NAME,
  MODAL_FIELD_MAFIA_COLOR,
  MODAL_FIELD_MAFIA_LOCATION,
  CANCEL_ID_BUTTON_ID,
} = require('./constants');

async function handleMafiaModal(interaction) {
  const [channelId, size] = interaction.customId.slice(MAFIA_MODAL_PREFIX.length + 1).split(':');

  const owner = interaction.fields.getTextInputValue(MODAL_FIELD_MAFIA_OWNER).trim();
  const coOwner = interaction.fields.getTextInputValue(MODAL_FIELD_MAFIA_COOWNER).trim();
  const name = interaction.fields.getTextInputValue(MODAL_FIELD_MAFIA_NAME).trim();
  const color = interaction.fields.getTextInputValue(MODAL_FIELD_MAFIA_COLOR).trim();
  const location = interaction.fields.getTextInputValue(MODAL_FIELD_MAFIA_LOCATION).trim();

  const embed = buildMafiaCardEmbed({
    discordUser: interaction.user,
    owner,
    coOwner,
    name,
    color,
    size,
    location,
    orgNumber: generateIdNumber('MG'),
  });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`${MAFIA_SEND_PREFIX}:${channelId}`)
      .setLabel('Wyślij')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId(CANCEL_ID_BUTTON_ID).setLabel('Anuluj').setStyle(ButtonStyle.Danger)
  );

  await interaction.reply({
    content: 'Oto podgląd karty organizacji — widoczny tylko dla Ciebie. Sprawdź dane i kliknij **Wyślij**.',
    embeds: [embed],
    components: [row],
    ephemeral: true,
  });
}

module.exports = { handleMafiaModal };

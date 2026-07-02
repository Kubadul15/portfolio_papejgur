const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { verifyRobloxUsername } = require('../utils/roblox');
const { buildIdCardEmbed } = require('../utils/embeds');
const { generateIdNumber } = require('../utils/idNumber');
const { parseAge } = require('../utils/validation');
const {
  CREATE_ID_MODAL_ID,
  MODAL_FIELD_FULL_NAME,
  MODAL_FIELD_AGE,
  MODAL_FIELD_CITIZENSHIP,
  MODAL_FIELD_ROBLOX,
  SEND_ID_BUTTON_ID,
  CANCEL_ID_BUTTON_ID,
} = require('./constants');

async function handleCreateIdModal(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const rest = interaction.customId.slice(CREATE_ID_MODAL_ID.length);
  const roleId = rest.startsWith(':') ? rest.slice(1) : null;

  const fullName = interaction.fields.getTextInputValue(MODAL_FIELD_FULL_NAME).trim();
  const rawAge = interaction.fields.getTextInputValue(MODAL_FIELD_AGE).trim();
  const citizenship = interaction.fields.getTextInputValue(MODAL_FIELD_CITIZENSHIP).trim();
  const robloxUsername = interaction.fields.getTextInputValue(MODAL_FIELD_ROBLOX).trim();

  const age = parseAge(rawAge);
  if (age === null) {
    await interaction.editReply({
      content: '⚠️ Podaj prawidłowy wiek — liczba całkowita od 1 do 100. Użyj przycisku jeszcze raz.',
    });
    return;
  }

  let robloxData = null;
  let lookupFailed = false;

  try {
    robloxData = await verifyRobloxUsername(robloxUsername);
  } catch (error) {
    console.error('Błąd podczas weryfikacji nicku Roblox:', error);
    lookupFailed = true;
  }

  const idNumber = generateIdNumber();

  const embed = buildIdCardEmbed({
    discordUser: interaction.user,
    fullName,
    age,
    citizenship,
    robloxUsername,
    robloxData,
    idNumber,
    awardRoleId: roleId,
  });

  const buttons = [
    new ButtonBuilder().setCustomId(CANCEL_ID_BUTTON_ID).setLabel('Anuluj').setStyle(ButtonStyle.Danger),
  ];

  if (robloxData) {
    buttons.unshift(
      new ButtonBuilder().setCustomId(SEND_ID_BUTTON_ID).setLabel('Wyślij').setStyle(ButtonStyle.Success)
    );
  }

  const row = new ActionRowBuilder().addComponents(buttons);

  let content;
  if (lookupFailed) {
    content = '⚠️ Nie udało się połączyć z API Roblox. Spróbuj ponownie za chwilę lub popraw dane i anuluj.';
  } else if (!robloxData) {
    content = '⚠️ Nie znaleziono takiego konta na Roblox. Popraw nick i spróbuj ponownie (Anuluj i użyj przycisku jeszcze raz).';
  } else {
    content = 'Poniżej podgląd Twojego dowodu — widoczny tylko dla Ciebie. Sprawdź dane i kliknij **Wyślij**.';
  }

  await interaction.editReply({ content, embeds: [embed], components: [row] });
}

module.exports = { handleCreateIdModal };

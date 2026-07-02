const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { verifyRobloxUsername } = require('../utils/roblox');
const { buildVerificationCodeEmbed } = require('../utils/embeds');
const { generateVerificationCode } = require('../utils/verificationCode');
const {
  VERIFY_MODAL_PREFIX,
  VERIFY_CHECK_PREFIX,
  MODAL_FIELD_VERIFY_ROBLOX,
  CANCEL_ID_BUTTON_ID,
} = require('./constants');

async function handleVerifyModal(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const roleId = interaction.customId.slice(VERIFY_MODAL_PREFIX.length + 1);
  const robloxUsername = interaction.fields.getTextInputValue(MODAL_FIELD_VERIFY_ROBLOX).trim();

  let robloxData = null;
  try {
    robloxData = await verifyRobloxUsername(robloxUsername);
  } catch (error) {
    console.error('Błąd podczas weryfikacji nicku Roblox:', error);
    await interaction.editReply({
      content: '⚠️ Nie udało się połączyć z API Roblox. Spróbuj ponownie za chwilę.',
    });
    return;
  }

  if (!robloxData) {
    await interaction.editReply({
      content: '⚠️ Nie znaleziono konta o takim nicku na Roblox. Sprawdź pisownię i użyj przycisku jeszcze raz.',
    });
    return;
  }

  const code = generateVerificationCode();
  const embed = buildVerificationCodeEmbed({ discordUser: interaction.user, robloxData, code });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`${VERIFY_CHECK_PREFIX}:${roleId}:${robloxData.id}:${code}`)
      .setLabel('Sprawdź kod')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId(CANCEL_ID_BUTTON_ID).setLabel('Anuluj').setStyle(ButtonStyle.Danger)
  );

  await interaction.editReply({
    content: 'To Twoje konto? Dodaj kod do opisu profilu, a potem kliknij **Sprawdź kod**.',
    embeds: [embed],
    components: [row],
  });
}

module.exports = { handleVerifyModal };

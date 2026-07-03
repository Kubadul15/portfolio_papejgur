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
  CANCEL_ID_BUTTON_ID,
} = require('./constants');

const IMAGE_WAIT_MS = 2 * 60 * 1000;

async function handleMafiaModal(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const [channelId, size] = interaction.customId.slice(MAFIA_MODAL_PREFIX.length + 1).split(':');

  const owner = interaction.fields.getTextInputValue(MODAL_FIELD_MAFIA_OWNER).trim();
  const coOwner = interaction.fields.getTextInputValue(MODAL_FIELD_MAFIA_COOWNER).trim();
  const name = interaction.fields.getTextInputValue(MODAL_FIELD_MAFIA_NAME).trim();
  const color = interaction.fields.getTextInputValue(MODAL_FIELD_MAFIA_COLOR).trim();

  let dmChannel;
  try {
    dmChannel = await interaction.user.createDM();
    await dmChannel.send(
      `📎 Wyślij mi tutaj **zdjęcie mapy bazy** organizacji **${name}** (jako załącznik) — masz 2 minuty.`
    );
  } catch (error) {
    console.error('Błąd podczas wysyłania DM z prośbą o zdjęcie bazy:', error);
    await interaction.editReply({
      content:
        '❌ Nie mogę wysłać Ci wiadomości prywatnej. Włącz wiadomości prywatne od członków serwera (Ustawienia serwera → Prywatność) i użyj przycisku jeszcze raz.',
    });
    return;
  }

  await interaction.editReply({
    content: '📨 Sprawdź wiadomości prywatne — wyślij tam zdjęcie mapy bazy (masz 2 minuty).',
  });

  const collected = await dmChannel
    .awaitMessages({
      filter: (message) => message.author.id === interaction.user.id && message.attachments.size > 0,
      max: 1,
      time: IMAGE_WAIT_MS,
    })
    .catch(() => null);

  const attachment = collected && collected.first() ? collected.first().attachments.first() : null;

  if (!attachment) {
    await interaction.editReply({
      content: '⏳ Nie otrzymałem zdjęcia w wyznaczonym czasie. Użyj przycisku jeszcze raz, aby spróbować ponownie.',
    });
    await dmChannel.send('⏳ Czas na wysłanie zdjęcia minął. Wróć na serwer i użyj przycisku jeszcze raz.').catch(() => {});
    return;
  }

  await dmChannel.send('✅ Otrzymano zdjęcie! Wróć na serwer, aby dokończyć zgłoszenie.').catch(() => {});

  const embed = buildMafiaCardEmbed({
    discordUser: interaction.user,
    owner,
    coOwner,
    name,
    color,
    size,
    baseImageUrl: attachment.url,
    orgNumber: generateIdNumber('MG'),
  });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`${MAFIA_SEND_PREFIX}:${channelId}`)
      .setLabel('Wyślij')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId(CANCEL_ID_BUTTON_ID).setLabel('Anuluj').setStyle(ButtonStyle.Danger)
  );

  await interaction.editReply({
    content: 'Oto podgląd karty organizacji — widoczny tylko dla Ciebie. Sprawdź dane i kliknij **Wyślij**.',
    embeds: [embed],
    components: [row],
  });
}

module.exports = { handleMafiaModal };

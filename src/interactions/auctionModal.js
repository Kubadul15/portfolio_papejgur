const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const registry = require('../utils/registry');
const { buildAuctionEmbed } = require('../utils/embeds');
const { parsePrice } = require('../utils/validation');
const {
  AUCTION_MODAL_PREFIX,
  AUCTION_BID_PREFIX,
  AUCTION_END_PREFIX,
  MODAL_FIELD_AUCTION_HOUSE,
  MODAL_FIELD_AUCTION_LOCATION,
  MODAL_FIELD_AUCTION_PRICE,
  MODAL_FIELD_AUCTION_INCREMENT,
  MODAL_FIELD_AUCTION_DESC,
} = require('./constants');

async function handleAuctionModal(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const channelId = interaction.customId.slice(AUCTION_MODAL_PREFIX.length + 1);

  const house = interaction.fields.getTextInputValue(MODAL_FIELD_AUCTION_HOUSE).trim();
  const location = interaction.fields.getTextInputValue(MODAL_FIELD_AUCTION_LOCATION).trim();
  const rawPrice = interaction.fields.getTextInputValue(MODAL_FIELD_AUCTION_PRICE);
  const rawIncrement = interaction.fields.getTextInputValue(MODAL_FIELD_AUCTION_INCREMENT);
  const description = interaction.fields.getTextInputValue(MODAL_FIELD_AUCTION_DESC).trim();

  const startingPrice = parsePrice(rawPrice);
  if (startingPrice === null) {
    await interaction.editReply({
      content: '⚠️ Podaj prawidłową cenę wywoławczą — samą liczbę, bez liter (np. 500000). Użyj przycisku jeszcze raz.',
    });
    return;
  }

  const minIncrement = parsePrice(rawIncrement);
  if (minIncrement === null) {
    await interaction.editReply({
      content: '⚠️ Podaj prawidłową minimalną podbitkę — samą liczbę, bez liter (np. 10000). Użyj przycisku jeszcze raz.',
    });
    return;
  }

  const auctionId = registry.startHouseAuction({
    channelId,
    house,
    location,
    description,
    startingPrice,
    minIncrement,
    auctioneerId: interaction.user.id,
    auctioneerTag: interaction.user.tag,
  });

  const auction = registry.getHouseAuction(auctionId);
  const embed = buildAuctionEmbed(auction, auctionId);
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`${AUCTION_BID_PREFIX}:${auctionId}`)
      .setLabel('Licytuj')
      .setEmoji('💰')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(`${AUCTION_END_PREFIX}:${auctionId}`)
      .setLabel('Zakończ aukcję')
      .setEmoji('🔴')
      .setStyle(ButtonStyle.Danger)
  );

  try {
    const targetChannel = await interaction.client.channels.fetch(channelId);
    const message = await targetChannel.send({ embeds: [embed], components: [row] });
    registry.setAuctionMessageId(auctionId, message.id);
  } catch (error) {
    console.error('Błąd podczas wysyłania ogłoszenia aukcji:', error);
    await interaction.editReply({
      content: '❌ Nie udało się wysłać ogłoszenia aukcji na kanał docelowy. Sprawdź uprawnienia bota.',
    });
    return;
  }

  await interaction.editReply({ content: `✅ Aukcja domu "${house}" została rozpoczęta na <#${channelId}>.` });
}

module.exports = { handleAuctionModal };

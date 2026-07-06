const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const config = require('../config');
const {
  AUCTION_START_PREFIX,
  AUCTION_MODAL_PREFIX,
  MODAL_FIELD_AUCTION_HOUSE,
  MODAL_FIELD_AUCTION_LOCATION,
  MODAL_FIELD_AUCTION_PRICE,
  MODAL_FIELD_AUCTION_INCREMENT,
  MODAL_FIELD_AUCTION_DESC,
} = require('./constants');

async function handleAuctionStartButton(interaction) {
  const channelId = interaction.customId.slice(AUCTION_START_PREFIX.length + 1);

  if (!interaction.member.roles.cache.has(config.houseAuctionAdminRoleId)) {
    await interaction.reply({
      content: `❌ Tylko rola <@&${config.houseAuctionAdminRoleId}> może rozpoczynać aukcje domów.`,
      ephemeral: true,
    });
    return;
  }

  const modal = new ModalBuilder().setCustomId(`${AUCTION_MODAL_PREFIX}:${channelId}`).setTitle('Nowa aukcja domu RP');

  const houseInput = new TextInputBuilder()
    .setCustomId(MODAL_FIELD_AUCTION_HOUSE)
    .setLabel('Dom (nazwa/krótki opis)')
    .setStyle(TextInputStyle.Short)
    .setMaxLength(60)
    .setRequired(true);

  const locationInput = new TextInputBuilder()
    .setCustomId(MODAL_FIELD_AUCTION_LOCATION)
    .setLabel('Lokalizacja')
    .setStyle(TextInputStyle.Short)
    .setMaxLength(50)
    .setRequired(true);

  const priceInput = new TextInputBuilder()
    .setCustomId(MODAL_FIELD_AUCTION_PRICE)
    .setLabel('Cena wywoławcza (np. 500000)')
    .setStyle(TextInputStyle.Short)
    .setMaxLength(12)
    .setRequired(true);

  const incrementInput = new TextInputBuilder()
    .setCustomId(MODAL_FIELD_AUCTION_INCREMENT)
    .setLabel('Minimalna podbitka (np. 10000)')
    .setStyle(TextInputStyle.Short)
    .setMaxLength(12)
    .setRequired(true);

  const descInput = new TextInputBuilder()
    .setCustomId(MODAL_FIELD_AUCTION_DESC)
    .setLabel('Opis domu')
    .setStyle(TextInputStyle.Paragraph)
    .setMaxLength(300)
    .setRequired(true);

  modal.addComponents(
    new ActionRowBuilder().addComponents(houseInput),
    new ActionRowBuilder().addComponents(locationInput),
    new ActionRowBuilder().addComponents(priceInput),
    new ActionRowBuilder().addComponents(incrementInput),
    new ActionRowBuilder().addComponents(descInput)
  );

  await interaction.showModal(modal);
}

module.exports = { handleAuctionStartButton };

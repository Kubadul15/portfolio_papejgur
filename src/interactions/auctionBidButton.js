const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const registry = require('../utils/registry');
const { AUCTION_BID_PREFIX, AUCTION_BID_MODAL_PREFIX, MODAL_FIELD_AUCTION_BID } = require('./constants');

async function handleAuctionBidButton(interaction) {
  const auctionId = interaction.customId.slice(AUCTION_BID_PREFIX.length + 1);
  const auction = registry.getHouseAuction(auctionId);

  if (!auction || auction.status !== 'active') {
    await interaction.reply({ content: '❌ Ta aukcja już się zakończyła.', ephemeral: true });
    return;
  }

  const minRequired = auction.highestBid !== null ? auction.highestBid + auction.minIncrement : auction.startingPrice;

  const modal = new ModalBuilder().setCustomId(`${AUCTION_BID_MODAL_PREFIX}:${auctionId}`).setTitle('Złóż ofertę');

  const bidInput = new TextInputBuilder()
    .setCustomId(MODAL_FIELD_AUCTION_BID)
    .setLabel(`Oferta (min. ${minRequired.toLocaleString('pl-PL')})`.slice(0, 45))
    .setStyle(TextInputStyle.Short)
    .setMaxLength(12)
    .setRequired(true);

  modal.addComponents(new ActionRowBuilder().addComponents(bidInput));

  await interaction.showModal(modal);
}

module.exports = { handleAuctionBidButton };

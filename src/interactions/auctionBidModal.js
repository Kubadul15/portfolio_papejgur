const registry = require('../utils/registry');
const { buildAuctionEmbed } = require('../utils/embeds');
const { parsePrice } = require('../utils/validation');
const { AUCTION_BID_MODAL_PREFIX, MODAL_FIELD_AUCTION_BID } = require('./constants');

async function handleAuctionBidModal(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const auctionId = interaction.customId.slice(AUCTION_BID_MODAL_PREFIX.length + 1);
  const rawBid = interaction.fields.getTextInputValue(MODAL_FIELD_AUCTION_BID);

  const amount = parsePrice(rawBid);
  if (amount === null) {
    await interaction.editReply({ content: '⚠️ Podaj prawidłową kwotę — samą liczbę, bez liter.' });
    return;
  }

  const result = registry.placeBid(auctionId, {
    bidderId: interaction.user.id,
    bidderTag: interaction.user.tag,
    amount,
  });

  if (!result.ok) {
    if (result.reason === 'not_found') {
      await interaction.editReply({ content: '❌ Nie znaleziono tej aukcji.' });
    } else if (result.reason === 'ended') {
      await interaction.editReply({ content: '❌ Ta aukcja już się zakończyła.' });
    } else if (result.reason === 'too_low') {
      await interaction.editReply({
        content: `❌ Twoja oferta jest za niska — minimalna wymagana oferta to ${result.minRequired.toLocaleString('pl-PL')} zł.`,
      });
    }
    return;
  }

  const { auction } = result;
  const embed = buildAuctionEmbed(auction, auctionId);

  try {
    const channel = await interaction.client.channels.fetch(auction.channelId);
    const message = await channel.messages.fetch(auction.messageId);
    await message.edit({ embeds: [embed], components: message.components });
  } catch (error) {
    console.error('Błąd podczas aktualizacji ogłoszenia aukcji po nowej ofercie:', error);
  }

  await interaction.editReply({ content: `✅ Twoja oferta ${amount.toLocaleString('pl-PL')} zł została przyjęta!` });
}

module.exports = { handleAuctionBidModal };

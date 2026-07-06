const config = require('../config');
const registry = require('../utils/registry');
const { buildAuctionEmbed } = require('../utils/embeds');
const { AUCTION_END_PREFIX } = require('./constants');

async function handleAuctionEndButton(interaction) {
  const auctionId = interaction.customId.slice(AUCTION_END_PREFIX.length + 1);
  const auction = registry.getHouseAuction(auctionId);

  if (!auction) {
    await interaction.reply({ content: '❌ Nie znaleziono tej aukcji.', ephemeral: true });
    return;
  }

  const isAdmin = interaction.member.roles.cache.has(config.houseAuctionAdminRoleId);
  const isAuctioneer = interaction.user.id === auction.auctioneerId;

  if (!isAdmin && !isAuctioneer) {
    await interaction.reply({
      content: `❌ Tylko rola <@&${config.houseAuctionAdminRoleId}> albo osoba, która rozpoczęła tę aukcję, może ją zakończyć.`,
      ephemeral: true,
    });
    return;
  }

  const result = registry.endHouseAuction(auctionId, {
    endedBy: interaction.user.id,
    endedByTag: interaction.user.tag,
  });

  if (!result.ok) {
    await interaction.reply({ content: '❌ Ta aukcja jest już zakończona.', ephemeral: true });
    return;
  }

  const embed = buildAuctionEmbed(result.auction, auctionId);
  await interaction.update({ embeds: [embed], components: [] });
}

module.exports = { handleAuctionEndButton };

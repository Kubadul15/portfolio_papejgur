const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { TICKET_CLAIM_BUTTON_ID, TICKET_ADD_USER_BUTTON_ID, TICKET_CLOSE_BUTTON_ID } = require('../interactions/constants');

/**
 * Caly stan ticketu (wlasciciel, rola obslugi, kto go przyjal) jest
 * trzymany w temacie kanalu - zero pamieci po stronie bota, przetrwa
 * restart. Format: "owner:<id>|support:<id>|claimer:<id>" (claimer
 * pojawia sie dopiero po przyjeciu).
 */
function buildTicketTopic({ ownerId, supportRoleId, claimerId }) {
  const claimerPart = claimerId ? `|claimer:${claimerId}` : '';
  return `owner:${ownerId}|support:${supportRoleId}${claimerPart}`;
}

function parseTicketTopic(topic) {
  if (!topic) return null;

  const ownerMatch = /owner:(\d+)/.exec(topic);
  const supportMatch = /support:(\d+)/.exec(topic);
  if (!ownerMatch || !supportMatch) return null;

  const claimerMatch = /claimer:(\d+)/.exec(topic);

  return {
    ownerId: ownerMatch[1],
    supportRoleId: supportMatch[1],
    claimerId: claimerMatch ? claimerMatch[1] : null,
  };
}

function buildTicketActionRow({ claimed }) {
  const row = new ActionRowBuilder();

  if (!claimed) {
    row.addComponents(
      new ButtonBuilder()
        .setCustomId(TICKET_CLAIM_BUTTON_ID)
        .setLabel('Przyjmij')
        .setEmoji('🙋')
        .setStyle(ButtonStyle.Success)
    );
  }

  row.addComponents(
    new ButtonBuilder()
      .setCustomId(TICKET_ADD_USER_BUTTON_ID)
      .setLabel('Dodaj osobę')
      .setEmoji('➕')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId(TICKET_CLOSE_BUTTON_ID).setLabel('Zamknij').setEmoji('🔒').setStyle(ButtonStyle.Danger)
  );

  return row;
}

module.exports = { buildTicketTopic, parseTicketTopic, buildTicketActionRow };

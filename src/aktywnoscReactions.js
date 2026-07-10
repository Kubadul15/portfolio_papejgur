const { EmbedBuilder } = require('discord.js');
const registry = require('./utils/registry');

const MEDALS = ['🥇', '🥈', '🥉'];

function buildRankingText(order) {
  if (order.length === 0) {
    return 'Bądź pierwszy/a! Miejsca pojawią się tutaj po zareagowaniu.';
  }
  return order
    .slice(0, 3)
    .map((userId, index) => `${MEDALS[index]} — <@${userId}>`)
    .join('\n');
}

async function updateAktywnoscMessage(message, session) {
  const oldEmbed = message.embeds[0];
  if (!oldEmbed) return;
  const embed = EmbedBuilder.from(oldEmbed);
  const fields = oldEmbed.fields.map((f) =>
    f.name.includes('Ranking') ? { name: f.name, value: buildRankingText(session.order), inline: f.inline } : f
  );
  embed.setFields(fields);
  await message.edit({ embeds: [embed] });
}

function emojiMatches(reactionEmoji, storedEmoji) {
  return reactionEmoji.name === storedEmoji || reactionEmoji.toString() === storedEmoji;
}

async function handleReactionAdd(reaction, user) {
  if (user.bot) return;
  try {
    if (reaction.partial) await reaction.fetch();
  } catch (error) {
    return;
  }
  const session = registry.getAktywnoscSession(reaction.message.id);
  if (!session || !emojiMatches(reaction.emoji, session.emoji)) return;

  const updated = registry.addAktywnoscReaction(reaction.message.id, user.id);
  if (!updated) return;

  try {
    const message = reaction.message.partial ? await reaction.message.fetch() : reaction.message;
    await updateAktywnoscMessage(message, updated);
  } catch (error) {
    console.error('Błąd podczas aktualizacji rankingu aktywności:', error);
  }
}

async function handleReactionRemove(reaction, user) {
  if (user.bot) return;
  try {
    if (reaction.partial) await reaction.fetch();
  } catch (error) {
    return;
  }
  const session = registry.getAktywnoscSession(reaction.message.id);
  if (!session || !emojiMatches(reaction.emoji, session.emoji)) return;

  const updated = registry.removeAktywnoscReaction(reaction.message.id, user.id);
  if (!updated) return;

  try {
    const message = reaction.message.partial ? await reaction.message.fetch() : reaction.message;
    await updateAktywnoscMessage(message, updated);
  } catch (error) {
    console.error('Błąd podczas aktualizacji rankingu aktywności (usunięcie):', error);
  }
}

module.exports = { handleReactionAdd, handleReactionRemove };

const { getEmbedFieldValue } = require('../utils/embeds');
const registry = require('../utils/registry');
const { EXAM_SEND_PREFIX } = require('./constants');

async function handleExamSendButton(interaction) {
  const channelId = interaction.customId.slice(EXAM_SEND_PREFIX.length + 1);
  const embed = interaction.message.embeds[0];

  try {
    const targetChannel = await interaction.client.channels.fetch(channelId);
    await targetChannel.send({ embeds: [embed] });

    const category = getEmbedFieldValue(embed, 'Kategoria');
    const licenseNumber = getEmbedFieldValue(embed, 'Numer');
    const robloxMatch = /\[@(.+?)\]/.exec(getEmbedFieldValue(embed, 'Nick Roblox'));
    if (robloxMatch) {
      registry.recordLicenseCategory(interaction.user.id, interaction.user.tag, {
        category,
        licenseNumber,
        robloxUsername: robloxMatch[1],
      });
    }

    await interaction.update({
      content: `✅ Prawo jazdy zostało wysłane na kanał <#${channelId}>.`,
      embeds: [embed],
      components: [],
    });
  } catch (error) {
    console.error('Błąd podczas wysyłania prawa jazdy na kanał docelowy:', error);
    await interaction.update({
      content: '❌ Nie udało się wysłać prawa jazdy na kanał docelowy. Sprawdź uprawnienia bota na tym kanale.',
      embeds: [embed],
      components: [],
    });
  }
}

module.exports = { handleExamSendButton };

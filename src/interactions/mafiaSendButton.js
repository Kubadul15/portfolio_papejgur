const { sendAdminLog } = require('../utils/adminLog');
const { MAFIA_SEND_PREFIX } = require('./constants');

async function handleMafiaSendButton(interaction) {
  const channelId = interaction.customId.slice(MAFIA_SEND_PREFIX.length + 1);
  const embed = interaction.message.embeds[0];

  try {
    const targetChannel = await interaction.client.channels.fetch(channelId);
    await targetChannel.send({ embeds: [embed] });

    await interaction.update({
      content: `✅ Organizacja została zarejestrowana na kanale <#${channelId}>.`,
      embeds: [embed],
      components: [],
    });

    await sendAdminLog(interaction.client, {
      title: '🔫 Nowa organizacja zarejestrowana',
      description: `**Kto:** <@${interaction.user.id}> (${interaction.user.tag})\n**Kanał:** <#${channelId}>`,
    });
  } catch (error) {
    console.error('Błąd podczas wysyłania karty organizacji na kanał docelowy:', error);
    await interaction.update({
      content: '❌ Nie udało się wysłać karty organizacji na kanał docelowy. Sprawdź uprawnienia bota.',
      embeds: [embed],
      components: [],
    });
  }
}

module.exports = { handleMafiaSendButton };

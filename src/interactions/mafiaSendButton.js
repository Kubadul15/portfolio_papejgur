const { sendAdminLog } = require('../utils/adminLog');
const { getEmbedFieldValue } = require('../utils/embeds');
const registry = require('../utils/registry');
const { MAFIA_SEND_PREFIX } = require('./constants');

async function handleMafiaSendButton(interaction) {
  const channelId = interaction.customId.slice(MAFIA_SEND_PREFIX.length + 1);
  const embed = interaction.message.embeds[0];

  try {
    const targetChannel = await interaction.client.channels.fetch(channelId);
    await targetChannel.send({ embeds: [embed] });

    registry.recordMafiaOrg(interaction.user.id, interaction.user.tag, {
      name: getEmbedFieldValue(embed, 'Nazwa'),
      owner: getEmbedFieldValue(embed, 'Właściciel'),
      coOwner: getEmbedFieldValue(embed, 'Współwłaściciel'),
      color: getEmbedFieldValue(embed, 'Kolor Aut'),
      size: getEmbedFieldValue(embed, 'Liczba członków'),
      orgNumber: getEmbedFieldValue(embed, 'Numer organizacji'),
      location: getEmbedFieldValue(embed, 'Miejscówka'),
    });

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

const { sendAdminLog } = require('../utils/adminLog');
const { getEmbedFieldValue } = require('../utils/embeds');
const registry = require('../utils/registry');
const { HOUSE_SEND_PREFIX } = require('./constants');

async function handleHouseSendButton(interaction) {
  const channelId = interaction.customId.slice(HOUSE_SEND_PREFIX.length + 1);
  const embed = interaction.message.embeds[0];

  try {
    const targetChannel = await interaction.client.channels.fetch(channelId);
    await targetChannel.send({ embeds: [embed] });

    registry.recordHouse(interaction.user.id, interaction.user.tag, {
      category: getEmbedFieldValue(embed, 'Typ nieruchomości'),
      owner: getEmbedFieldValue(embed, 'Właściciel'),
      location: getEmbedFieldValue(embed, 'Lokalizacja'),
      address: getEmbedFieldValue(embed, 'Adres'),
      price: getEmbedFieldValue(embed, 'Cena'),
      rooms: getEmbedFieldValue(embed, 'Liczba pokoi'),
      area: getEmbedFieldValue(embed, 'Powierzchnia'),
      yearBuilt: getEmbedFieldValue(embed, 'Rok budowy'),
      garage: getEmbedFieldValue(embed, 'Garaż'),
      pool: getEmbedFieldValue(embed, 'Basen'),
      description: getEmbedFieldValue(embed, 'Opis'),
      houseNumber: getEmbedFieldValue(embed, 'Numer aktu'),
    });

    await interaction.update({
      content: `✅ Dom został zarejestrowany na kanale <#${channelId}>.`,
      embeds: [embed],
      components: [],
    });

    await sendAdminLog(interaction.client, {
      title: '🏠 Dom zarejestrowany',
      description: `**Kto:** <@${interaction.user.id}> (${interaction.user.tag})\n**Kanał:** <#${channelId}>`,
    });
  } catch (error) {
    console.error('Błąd podczas wysyłania aktu własności domu na kanał docelowy:', error);
    await interaction.update({
      content: '❌ Nie udało się wysłać aktu własności na kanał docelowy. Sprawdź uprawnienia bota.',
      embeds: [embed],
      components: [],
    });
  }
}

module.exports = { handleHouseSendButton };

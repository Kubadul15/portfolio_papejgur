const config = require('../config');
const { sendAdminLog } = require('../utils/adminLog');
const { getEmbedFieldValue } = require('../utils/embeds');

async function handleSendIdButton(interaction) {
  const embed = interaction.message.embeds[0];

  try {
    const targetChannel = await interaction.client.channels.fetch(config.targetChannelId);
    await targetChannel.send({ embeds: [embed] });

    let roleNote = '';
    const roleFieldValue = getEmbedFieldValue(embed, 'Rola po wysłaniu');
    const roleMatch = /<@&(\d+)>/.exec(roleFieldValue);
    if (roleMatch) {
      try {
        const role = await interaction.guild.roles.fetch(roleMatch[1]);
        if (!role) throw new Error('Rola z panelu dowodu już nie istnieje na serwerze.');
        await interaction.member.roles.add(role);
        roleNote = `\n🔑 Otrzymujesz rolę <@&${roleMatch[1]}>.`;
      } catch (error) {
        console.error('Błąd podczas nadawania roli po wysłaniu dowodu:', error);
        roleNote = '\n⚠️ Nie udało się nadać roli — skontaktuj się z administracją.';
      }
    }

    await interaction.update({
      content: `✅ Dowód został wysłany na kanał <#${config.targetChannelId}>.${roleNote}`,
      embeds: [embed],
      components: [],
    });

    await sendAdminLog(interaction.client, {
      title: '🪪 Dowód Osobisty RP wysłany',
      description:
        `**Kto:** <@${interaction.user.id}> (${interaction.user.tag})\n` +
        `**Kanał:** <#${config.targetChannelId}>`,
    });
  } catch (error) {
    console.error('Błąd podczas wysyłania dowodu na kanał docelowy:', error);
    await interaction.update({
      content: '❌ Nie udało się wysłać dowodu na kanał docelowy. Sprawdź konfigurację TARGET_CHANNEL_ID i uprawnienia bota.',
      embeds: [embed],
      components: [],
    });
  }
}

async function handleCancelIdButton(interaction) {
  await interaction.update({
    content: '❌ Anulowano.',
    embeds: [],
    components: [],
  });
}

module.exports = { handleSendIdButton, handleCancelIdButton };

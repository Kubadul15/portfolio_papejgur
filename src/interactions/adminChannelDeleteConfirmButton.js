const { PermissionFlagsBits } = require('discord.js');
const { sendAdminLog } = require('../utils/adminLog');
const { ADMIN_CHANNEL_DELETE_CONFIRM_PREFIX } = require('./constants');

async function handleAdminChannelDeleteConfirmButton(interaction) {
  if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageChannels)) {
    await interaction.update({ content: '❌ Ta komenda wymaga uprawnienia Zarządzaj kanałami.', embeds: [], components: [] });
    return;
  }

  const channelId = interaction.customId.slice(ADMIN_CHANNEL_DELETE_CONFIRM_PREFIX.length + 1);

  try {
    const channel = await interaction.client.channels.fetch(channelId);
    if (!channel) throw new Error('Kanał już nie istnieje.');

    const channelName = channel.name;
    await channel.delete(`Usunięto przez ${interaction.user.tag} (/admin usun-kanal)`);

    await interaction.update({ content: `✅ Kanał \`${channelName}\` został usunięty.`, embeds: [], components: [] });

    await sendAdminLog(interaction.client, {
      title: '🗑️ Kanał usunięty',
      description: `**Kto:** <@${interaction.user.id}> (${interaction.user.tag})\n**Kanał:** \`${channelName}\` (${channelId})`,
      color: '#e02b2b',
    });
  } catch (error) {
    console.error('Błąd podczas usuwania kanału:', error);
    await interaction.update({
      content: '❌ Nie udało się usunąć kanału. Sprawdź, czy bot ma uprawnienie Zarządzaj kanałami.',
      embeds: [],
      components: [],
    });
  }
}

module.exports = { handleAdminChannelDeleteConfirmButton };

const { parseTicketTopic } = require('../utils/ticket');
const { sendAdminLog } = require('../utils/adminLog');

async function buildTranscriptFile(channel) {
  const messages = await channel.messages.fetch({ limit: 100 });
  const lines = [...messages.values()]
    .reverse()
    .map((message) => `[${message.createdAt.toISOString()}] ${message.author.tag}: ${message.content}`);

  if (lines.length === 0) return null;

  return { attachment: Buffer.from(lines.join('\n'), 'utf-8'), name: `${channel.name}.txt` };
}

async function handleTicketCloseButton(interaction) {
  const parsed = parseTicketTopic(interaction.channel.topic);
  if (!parsed) {
    await interaction.reply({ content: '❌ Nie rozpoznano danych tego ticketu.', ephemeral: true });
    return;
  }

  const isOwner = interaction.user.id === parsed.ownerId;
  const isSupport = interaction.member.roles.cache.has(parsed.supportRoleId);

  if (!isOwner && !isSupport) {
    await interaction.reply({ content: '❌ Nie masz uprawnień, aby zamknąć ten ticket.', ephemeral: true });
    return;
  }

  await interaction.reply('🔒 Ticket zostanie zamknięty i usunięty za kilka sekund...');

  try {
    const transcriptFile = await buildTranscriptFile(interaction.channel);

    await sendAdminLog(interaction.client, {
      title: '🎫 Ticket zamknięty',
      description:
        `**Właściciel:** <@${parsed.ownerId}>\n` +
        `**Przyjęty przez:** ${parsed.claimerId ? `<@${parsed.claimerId}>` : 'nikt'}\n` +
        `**Zamknięty przez:** <@${interaction.user.id}> (${interaction.user.tag})\n` +
        `**Kanał:** #${interaction.channel.name}`,
      files: transcriptFile ? [transcriptFile] : [],
    });
  } catch (error) {
    console.error('Błąd podczas tworzenia transkryptu ticketu:', error);
  }

  await new Promise((resolve) => setTimeout(resolve, 4000));
  await interaction.channel.delete().catch((error) => {
    console.error('Błąd podczas usuwania kanału ticketu:', error);
  });
}

module.exports = { handleTicketCloseButton };

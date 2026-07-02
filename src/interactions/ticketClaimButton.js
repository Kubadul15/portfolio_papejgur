const { EmbedBuilder } = require('discord.js');
const { parseTicketTopic, buildTicketTopic, buildTicketActionRow } = require('../utils/ticket');

async function handleTicketClaimButton(interaction) {
  const parsed = parseTicketTopic(interaction.channel.topic);
  if (!parsed) {
    await interaction.reply({ content: '❌ Nie rozpoznano danych tego ticketu.', ephemeral: true });
    return;
  }

  if (parsed.claimerId) {
    await interaction.reply({
      content: `❌ Ten ticket został już przyjęty przez <@${parsed.claimerId}>.`,
      ephemeral: true,
    });
    return;
  }

  if (!interaction.member.roles.cache.has(parsed.supportRoleId)) {
    await interaction.reply({ content: '❌ Tylko obsługa może przyjmować tickety.', ephemeral: true });
    return;
  }

  await interaction.deferUpdate();

  const newTopic = buildTicketTopic({
    ownerId: parsed.ownerId,
    supportRoleId: parsed.supportRoleId,
    claimerId: interaction.user.id,
  });

  try {
    await interaction.channel.setTopic(newTopic);
    await interaction.channel.permissionOverwrites.edit(parsed.supportRoleId, { ViewChannel: false });
    await interaction.channel.permissionOverwrites.edit(interaction.user.id, {
      ViewChannel: true,
      SendMessages: true,
      ReadMessageHistory: true,
    });
  } catch (error) {
    console.error('Błąd podczas przyjmowania ticketu:', error);
    await interaction.followUp({
      content: '❌ Nie udało się przyjąć ticketu — sprawdź uprawnienia bota (Zarządzaj kanałami/rolami).',
      ephemeral: true,
    });
    return;
  }

  const embed = EmbedBuilder.from(interaction.message.embeds[0]);
  embed.spliceFields(1, 1, { name: '📌 Status', value: `🟢 Przyjęty przez ${interaction.user}`, inline: true });

  const row = buildTicketActionRow({ claimed: true });

  await interaction.editReply({ embeds: [embed], components: [row] });
  await interaction.channel.send(
    `🔒 Ticket przyjęty przez ${interaction.user}. Inni członkowie obsługi już go nie widzą.`
  );
}

module.exports = { handleTicketClaimButton };

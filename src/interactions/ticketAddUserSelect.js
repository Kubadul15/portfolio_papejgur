const { parseTicketTopic } = require('../utils/ticket');

async function handleTicketAddUserSelect(interaction) {
  const parsed = parseTicketTopic(interaction.channel.topic);
  if (!parsed || !interaction.member.roles.cache.has(parsed.supportRoleId)) {
    await interaction.update({ content: '❌ Tylko obsługa może dodawać osoby do ticketu.', components: [] });
    return;
  }

  const targetUser = interaction.users.first();

  try {
    await interaction.channel.permissionOverwrites.edit(targetUser.id, {
      ViewChannel: true,
      SendMessages: true,
      ReadMessageHistory: true,
    });
  } catch (error) {
    console.error('Błąd podczas dodawania osoby do ticketu:', error);
    await interaction.update({ content: '❌ Nie udało się dodać tej osoby do ticketu.', components: [] });
    return;
  }

  await interaction.update({ content: `✅ Dodano ${targetUser} do ticketu.`, components: [] });
  await interaction.channel.send(`➕ ${targetUser} został dodany do ticketu przez ${interaction.user}.`);
}

module.exports = { handleTicketAddUserSelect };

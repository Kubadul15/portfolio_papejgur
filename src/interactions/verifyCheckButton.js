const { getUserDescription } = require('../utils/roblox');
const { sendAdminLog } = require('../utils/adminLog');
const { getEmbedFieldValue } = require('../utils/embeds');
const registry = require('../utils/registry');

async function handleVerifyCheckButton(interaction) {
  await interaction.deferUpdate();

  const [, roleId, robloxUserId, code] = interaction.customId.split(':');

  let description = '';
  try {
    description = await getUserDescription(robloxUserId);
  } catch (error) {
    console.error('Błąd podczas pobierania opisu profilu Roblox:', error);
    await interaction.followUp({
      content: '⚠️ Nie udało się sprawdzić opisu profilu Roblox. Spróbuj ponownie za chwilę.',
      ephemeral: true,
    });
    return;
  }

  if (!description.toUpperCase().includes(code.toUpperCase())) {
    await interaction.followUp({
      content: `❌ Nie znaleziono kodu \`${code}\` w opisie Twojego profilu Roblox. Upewnij się, że zapisałeś zmiany na Roblox, i spróbuj ponownie (dane czasem odświeżają się z opóźnieniem).`,
      ephemeral: true,
    });
    return;
  }

  try {
    const role = await interaction.guild.roles.fetch(roleId);
    if (!role) {
      throw new Error('Rola z panelu weryfikacji już nie istnieje na serwerze.');
    }
    await interaction.member.roles.add(role);
  } catch (error) {
    console.error('Błąd podczas nadawania roli po weryfikacji:', error);
    await interaction.followUp({
      content:
        '❌ Kod się zgadza, ale nie udało się nadać roli. Skontaktuj się z administracją — bot może nie mieć uprawnień do zarządzania tą rolą.',
      ephemeral: true,
    });
    return;
  }

  const robloxMatch = /\[@(.+?)\]/.exec(getEmbedFieldValue(interaction.message.embeds[0], 'Konto Roblox'));
  if (robloxMatch) {
    registry.linkRoblox(interaction.user.id, interaction.user.tag, robloxMatch[1]);
  }

  await interaction.editReply({
    content: `✅ Zweryfikowano! Otrzymujesz rolę <@&${roleId}>.`,
    embeds: interaction.message.embeds,
    components: [],
  });

  await sendAdminLog(interaction.client, {
    title: '🔐 Weryfikacja Roblox zakończona sukcesem',
    description:
      `**Kto:** <@${interaction.user.id}> (${interaction.user.tag})\n` +
      `**Rola:** <@&${roleId}>\n` +
      `**Roblox ID:** ${robloxUserId}`,
  });
}

module.exports = { handleVerifyCheckButton };

const { EmbedBuilder } = require('discord.js');
const { buildApplicationTopic, parseApplicationTopic } = require('../utils/application');
const { setApplicationRejectionCooldown } = require('../utils/cooldown');
const { sendAdminLog } = require('../utils/adminLog');
const { MODAL_FIELD_APP_REJECT_REASON } = require('./constants');

const STATUS_FIELD_INDEX = 9;

// ModalSubmitInteraction pokazany z poziomu select menu nie zawsze ma
// niezawodnie wypelnione .message, wiec bezpieczniej jest znalezc
// wiadomosc bota z embedem samodzielnie.
async function findReviewMessage(channel, clientUserId) {
  const messages = await channel.messages.fetch({ limit: 10 });
  return messages.find((message) => message.author.id === clientUserId && message.embeds.length > 0);
}

async function handleApplicationRejectModal(interaction) {
  await interaction.deferUpdate();

  const parsed = parseApplicationTopic(interaction.channel.topic);
  if (!parsed) {
    await interaction.followUp({ content: '❌ Nie rozpoznano danych tego podania.', ephemeral: true });
    return;
  }

  if (!interaction.member.roles.cache.has(parsed.supportRoleId)) {
    await interaction.followUp({ content: '❌ Tylko obsługa może rozpatrywać podania.', ephemeral: true });
    return;
  }

  if (parsed.status === 'accepted' || parsed.status === 'rejected') {
    await interaction.followUp({ content: '❌ To podanie zostało już rozpatrzone.', ephemeral: true });
    return;
  }

  const reason = interaction.fields.getTextInputValue(MODAL_FIELD_APP_REJECT_REASON).trim();

  const applicant = await interaction.guild.members.fetch(parsed.ownerId).catch(() => null);
  setApplicationRejectionCooldown(parsed.ownerId);

  if (applicant) {
    await applicant
      .send(
        `❌ Niestety, Twoje podanie zostało **odrzucone**.${reason ? `\n**Powód:** ${reason}` : ''}\n\n` +
          'Możesz spróbować ponownie za 24 godziny.'
      )
      .catch(() => {});
  }

  await interaction.channel.setTopic(buildApplicationTopic({ ...parsed, status: 'rejected' }));

  const reviewMessage = await findReviewMessage(interaction.channel, interaction.client.user.id);
  if (reviewMessage) {
    const embed = EmbedBuilder.from(reviewMessage.embeds[0]);
    embed.spliceFields(STATUS_FIELD_INDEX, 1, {
      name: '📌 Status',
      value: `❌ Odrzucone przez ${interaction.user}${reason ? ` — powód: ${reason}` : ''}`,
      inline: false,
    });
    await reviewMessage.edit({ embeds: [embed], components: [] });
  }

  await interaction.channel.send(
    `❌ Podanie odrzucone przez ${interaction.user}. Kanał zostanie usunięty za kilka sekund.`
  );

  await sendAdminLog(interaction.client, {
    title: '📝 Podanie odrzucone',
    description:
      `**Kandydat:** <@${parsed.ownerId}>\n` +
      `**Odrzucił:** <@${interaction.user.id}> (${interaction.user.tag})\n` +
      `**Powód:** ${reason || 'brak'}`,
    color: '#e02b2b',
  });

  await new Promise((resolve) => setTimeout(resolve, 5000));
  await interaction.channel.delete().catch((error) => console.error('Błąd podczas usuwania kanału podania:', error));
}

module.exports = { handleApplicationRejectModal };

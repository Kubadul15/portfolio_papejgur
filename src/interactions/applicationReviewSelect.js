const { EmbedBuilder, ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { buildApplicationTopic, parseApplicationTopic } = require('../utils/application');
const { sendAdminLog } = require('../utils/adminLog');
const { APP_REJECT_MODAL_ID, MODAL_FIELD_APP_REJECT_REASON } = require('./constants');

const STATUS_FIELD_INDEX = 9;

async function handleApplicationReviewSelect(interaction) {
  const parsed = parseApplicationTopic(interaction.channel.topic);
  if (!parsed) {
    await interaction.reply({ content: '❌ Nie rozpoznano danych tego podania.', ephemeral: true });
    return;
  }

  if (!interaction.member.roles.cache.has(parsed.supportRoleId)) {
    await interaction.reply({ content: '❌ Tylko obsługa może rozpatrywać podania.', ephemeral: true });
    return;
  }

  if (parsed.status === 'accepted' || parsed.status === 'rejected') {
    await interaction.reply({ content: '❌ To podanie zostało już rozpatrzone.', ephemeral: true });
    return;
  }

  const action = interaction.values[0];

  if (action === 'reject') {
    const modal = new ModalBuilder().setCustomId(APP_REJECT_MODAL_ID).setTitle('Powód odrzucenia');

    const reasonInput = new TextInputBuilder()
      .setCustomId(MODAL_FIELD_APP_REJECT_REASON)
      .setLabel('Powód odrzucenia (opcjonalnie)')
      .setStyle(TextInputStyle.Paragraph)
      .setMaxLength(300)
      .setRequired(false);

    modal.addComponents(new ActionRowBuilder().addComponents(reasonInput));
    await interaction.showModal(modal);
    return;
  }

  await interaction.deferUpdate();

  const applicant = await interaction.guild.members.fetch(parsed.ownerId).catch(() => null);

  if (action === 'accept') {
    if (parsed.acceptRoleId && applicant) {
      try {
        await applicant.roles.add(parsed.acceptRoleId);
      } catch (error) {
        console.error('Błąd podczas nadawania roli po akceptacji podania:', error);
      }
    }

    if (applicant) {
      await applicant.send('🎉 Gratulacje! Twoje podanie zostało **przyjęte**. Witamy na serwerze!').catch(() => {});
    }

    await interaction.channel.setTopic(buildApplicationTopic({ ...parsed, status: 'accepted' }));

    const embed = EmbedBuilder.from(interaction.message.embeds[0]);
    embed.spliceFields(STATUS_FIELD_INDEX, 1, {
      name: '📌 Status',
      value: `✅ Przyjęte przez ${interaction.user}`,
      inline: false,
    });

    await interaction.editReply({ embeds: [embed], components: [] });
    await interaction.channel.send(
      `✅ Podanie przyjęte przez ${interaction.user}. Kanał zostanie usunięty za kilka sekund.`
    );

    await sendAdminLog(interaction.client, {
      title: '📝 Podanie przyjęte',
      description: `**Kandydat:** <@${parsed.ownerId}>\n**Zaakceptował:** <@${interaction.user.id}> (${interaction.user.tag})`,
    });

    await new Promise((resolve) => setTimeout(resolve, 5000));
    await interaction.channel.delete().catch((error) => console.error('Błąd podczas usuwania kanału podania:', error));
    return;
  }

  if (action === 'summon') {
    if (applicant) {
      await applicant
        .send(
          `📞 Obsługa serwera prosi Cię o kontakt w sprawie Twojego podania. Wróć na kanał ${interaction.channel} tak szybko, jak możesz.`
        )
        .catch(() => {});
    }

    await interaction.channel.send(
      `📞 ${interaction.user} wezwał(a) ${applicant ? applicant.toString() : 'kandydata'} (wysłano wiadomość prywatną).`
    );
    return;
  }

  if (action === 'review') {
    await interaction.channel.setTopic(buildApplicationTopic({ ...parsed, status: 'review' }));

    const embed = EmbedBuilder.from(interaction.message.embeds[0]);
    embed.spliceFields(STATUS_FIELD_INDEX, 1, {
      name: '📌 Status',
      value: `👀 W trakcie rozpatrywania przez ${interaction.user}`,
      inline: false,
    });

    await interaction.editReply({ embeds: [embed] });
  }
}

module.exports = { handleApplicationReviewSelect };

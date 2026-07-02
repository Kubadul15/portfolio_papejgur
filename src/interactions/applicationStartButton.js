const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const { parseApplicationTopic } = require('../utils/application');
const { getApplicationCooldownExpiresAt } = require('../utils/cooldown');
const { APP_START_PREFIX, APP_MIC_SELECT_PREFIX } = require('./constants');

async function handleApplicationStartButton(interaction) {
  const cooldownExpiresAt = getApplicationCooldownExpiresAt(interaction.user.id);
  if (cooldownExpiresAt) {
    await interaction.reply({
      content: `⏳ Twoje ostatnie podanie zostało odrzucone. Możesz spróbować ponownie <t:${Math.floor(cooldownExpiresAt / 1000)}:R>.`,
      ephemeral: true,
    });
    return;
  }

  const [categoryId, supportRoleId, acceptRoleId] = interaction.customId
    .slice(APP_START_PREFIX.length + 1)
    .split(':');

  const category = interaction.guild.channels.cache.get(categoryId);
  if (!category) {
    await interaction.reply({
      content: '❌ Kategoria podań nie istnieje. Skontaktuj się z administracją.',
      ephemeral: true,
    });
    return;
  }

  const existing = category.children.cache.find((channel) => {
    const parsed = parseApplicationTopic(channel.topic);
    return parsed && parsed.ownerId === interaction.user.id;
  });

  if (existing) {
    await interaction.reply({
      content: `❌ Masz już otwarte podanie: ${existing}. Poczekaj na jego rozpatrzenie.`,
      ephemeral: true,
    });
    return;
  }

  const select = new StringSelectMenuBuilder()
    .setCustomId(`${APP_MIC_SELECT_PREFIX}:${categoryId}:${supportRoleId}:${acceptRoleId || ''}`)
    .setPlaceholder('Czy posiadasz sprawny mikrofon?')
    .addOptions(
      { label: 'Tak', value: 'tak', emoji: '🎙️' },
      { label: 'Nie', value: 'nie', emoji: '🔇' }
    );

  const row = new ActionRowBuilder().addComponents(select);

  await interaction.reply({ content: 'Zanim przejdziemy dalej — czy posiadasz sprawny mikrofon?', components: [row], ephemeral: true });
}

module.exports = { handleApplicationStartButton };

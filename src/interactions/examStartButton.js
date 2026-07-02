const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const { LICENSE_CATEGORIES } = require('../data/licenseCategories');
const { EXAM_START_PREFIX, EXAM_CATEGORY_PREFIX } = require('./constants');

async function handleExamStartButton(interaction) {
  const channelId = interaction.customId.slice(EXAM_START_PREFIX.length + 1);

  const select = new StringSelectMenuBuilder()
    .setCustomId(`${EXAM_CATEGORY_PREFIX}:${channelId}`)
    .setPlaceholder('Wybierz kategorię prawa jazdy')
    .addOptions(
      LICENSE_CATEGORIES.map((category) => ({
        label: category.value,
        value: category.value,
        description: category.description,
      }))
    );

  const row = new ActionRowBuilder().addComponents(select);

  await interaction.reply({
    content: 'Na jaką kategorię prawa jazdy chcesz podejść do egzaminu?',
    components: [row],
    ephemeral: true,
  });
}

module.exports = { handleExamStartButton };

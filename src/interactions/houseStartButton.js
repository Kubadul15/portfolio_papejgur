const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const { HOUSE_CATEGORIES } = require('../data/houseCategories');
const { HOUSE_START_PREFIX, HOUSE_CATEGORY_PREFIX } = require('./constants');

async function handleHouseStartButton(interaction) {
  const channelId = interaction.customId.slice(HOUSE_START_PREFIX.length + 1);

  const select = new StringSelectMenuBuilder()
    .setCustomId(`${HOUSE_CATEGORY_PREFIX}:${channelId}`)
    .setPlaceholder('Wybierz typ nieruchomości')
    .addOptions(
      HOUSE_CATEGORIES.map((category) => ({
        label: category.value,
        value: category.value,
        description: category.description,
      }))
    );

  const row = new ActionRowBuilder().addComponents(select);

  await interaction.reply({
    content: 'Jaki typ nieruchomości chcesz zarejestrować?',
    components: [row],
    ephemeral: true,
  });
}

module.exports = { handleHouseStartButton };

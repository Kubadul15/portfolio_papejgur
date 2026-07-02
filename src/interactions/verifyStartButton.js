const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { VERIFY_START_PREFIX, VERIFY_MODAL_PREFIX, MODAL_FIELD_VERIFY_ROBLOX } = require('./constants');

async function handleVerifyStartButton(interaction) {
  const roleId = interaction.customId.slice(VERIFY_START_PREFIX.length + 1);

  const modal = new ModalBuilder()
    .setCustomId(`${VERIFY_MODAL_PREFIX}:${roleId}`)
    .setTitle('Weryfikacja konta Roblox');

  const robloxInput = new TextInputBuilder()
    .setCustomId(MODAL_FIELD_VERIFY_ROBLOX)
    .setLabel('Twój nick Roblox')
    .setStyle(TextInputStyle.Short)
    .setMaxLength(20)
    .setRequired(true);

  modal.addComponents(new ActionRowBuilder().addComponents(robloxInput));

  await interaction.showModal(modal);
}

module.exports = { handleVerifyStartButton };

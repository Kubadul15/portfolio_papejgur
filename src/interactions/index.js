const { handleCreateIdButton } = require('./createIdButton');
const { handleCreateIdModal } = require('./createIdModal');
const { handleSendIdButton, handleCancelIdButton } = require('./confirmButtons');
const { handleVerifyStartButton } = require('./verifyStartButton');
const { handleVerifyModal } = require('./verifyModal');
const { handleVerifyCheckButton } = require('./verifyCheckButton');
const {
  CREATE_ID_BUTTON_ID,
  CREATE_ID_MODAL_ID,
  SEND_ID_BUTTON_ID,
  CANCEL_ID_BUTTON_ID,
  VERIFY_START_PREFIX,
  VERIFY_MODAL_PREFIX,
  VERIFY_CHECK_PREFIX,
} = require('./constants');

async function routeInteraction(interaction, commands) {
  try {
    if (interaction.isChatInputCommand()) {
      const command = commands.get(interaction.commandName);
      if (!command) return;
      await command.execute(interaction);
      return;
    }

    if (interaction.isButton()) {
      const id = interaction.customId;

      if (id === CREATE_ID_BUTTON_ID) return await handleCreateIdButton(interaction);
      if (id === SEND_ID_BUTTON_ID) return await handleSendIdButton(interaction);
      if (id === CANCEL_ID_BUTTON_ID) return await handleCancelIdButton(interaction);
      if (id.startsWith(`${VERIFY_START_PREFIX}:`)) return await handleVerifyStartButton(interaction);
      if (id.startsWith(`${VERIFY_CHECK_PREFIX}:`)) return await handleVerifyCheckButton(interaction);
      return;
    }

    if (interaction.isModalSubmit()) {
      const id = interaction.customId;

      if (id === CREATE_ID_MODAL_ID) return await handleCreateIdModal(interaction);
      if (id.startsWith(`${VERIFY_MODAL_PREFIX}:`)) return await handleVerifyModal(interaction);
    }
  } catch (error) {
    console.error('Błąd podczas obsługi interakcji:', error);

    const errorMessage = { content: '❌ Wystąpił błąd podczas przetwarzania tej akcji.', ephemeral: true };
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply(errorMessage).catch(() => {});
    } else {
      await interaction.reply(errorMessage).catch(() => {});
    }
  }
}

module.exports = { routeInteraction };

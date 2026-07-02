const { handleCreateIdButton } = require('./createIdButton');
const { handleCreateIdModal } = require('./createIdModal');
const { handleSendIdButton, handleCancelIdButton } = require('./confirmButtons');
const {
  CREATE_ID_BUTTON_ID,
  CREATE_ID_MODAL_ID,
  SEND_ID_BUTTON_ID,
  CANCEL_ID_BUTTON_ID,
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
      switch (interaction.customId) {
        case CREATE_ID_BUTTON_ID:
          return await handleCreateIdButton(interaction);
        case SEND_ID_BUTTON_ID:
          return await handleSendIdButton(interaction);
        case CANCEL_ID_BUTTON_ID:
          return await handleCancelIdButton(interaction);
        default:
          return;
      }
    }

    if (interaction.isModalSubmit()) {
      if (interaction.customId === CREATE_ID_MODAL_ID) {
        return await handleCreateIdModal(interaction);
      }
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

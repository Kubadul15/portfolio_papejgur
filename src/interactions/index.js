const { handleCreateIdButton } = require('./createIdButton');
const { handleCreateIdModal } = require('./createIdModal');
const { handleSendIdButton, handleCancelIdButton } = require('./confirmButtons');
const { handleVerifyStartButton } = require('./verifyStartButton');
const { handleVerifyModal } = require('./verifyModal');
const { handleVerifyCheckButton } = require('./verifyCheckButton');
const { handleExamStartButton } = require('./examStartButton');
const { handleExamCategorySelect } = require('./examCategorySelect');
const { handleExamModal } = require('./examModal');
const { handleExamAnswerButton } = require('./examAnswerButton');
const { handleExamSendButton } = require('./examSendButton');
const { handleVehicleStartButton } = require('./vehicleStartButton');
const { handleVehicleCategorySelect } = require('./vehicleCategorySelect');
const { handleVehicleModal } = require('./vehicleModal');
const { handleVehicleSendButton } = require('./vehicleSendButton');
const {
  CREATE_ID_BUTTON_ID,
  CREATE_ID_MODAL_ID,
  SEND_ID_BUTTON_ID,
  CANCEL_ID_BUTTON_ID,
  VERIFY_START_PREFIX,
  VERIFY_MODAL_PREFIX,
  VERIFY_CHECK_PREFIX,
  EXAM_START_PREFIX,
  EXAM_CATEGORY_PREFIX,
  EXAM_MODAL_PREFIX,
  EXAM_ANSWER_PREFIX,
  EXAM_SEND_PREFIX,
  VEHICLE_START_PREFIX,
  VEHICLE_CATEGORY_PREFIX,
  VEHICLE_MODAL_PREFIX,
  VEHICLE_SEND_PREFIX,
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

      if (id === CREATE_ID_BUTTON_ID || id.startsWith(`${CREATE_ID_BUTTON_ID}:`)) {
        return await handleCreateIdButton(interaction);
      }
      if (id === SEND_ID_BUTTON_ID) return await handleSendIdButton(interaction);
      if (id === CANCEL_ID_BUTTON_ID) return await handleCancelIdButton(interaction);
      if (id.startsWith(`${VERIFY_START_PREFIX}:`)) return await handleVerifyStartButton(interaction);
      if (id.startsWith(`${VERIFY_CHECK_PREFIX}:`)) return await handleVerifyCheckButton(interaction);
      if (id.startsWith(`${EXAM_START_PREFIX}:`)) return await handleExamStartButton(interaction);
      if (id.startsWith(`${EXAM_ANSWER_PREFIX}:`)) return await handleExamAnswerButton(interaction);
      if (id.startsWith(`${EXAM_SEND_PREFIX}:`)) return await handleExamSendButton(interaction);
      if (id.startsWith(`${VEHICLE_START_PREFIX}:`)) return await handleVehicleStartButton(interaction);
      if (id.startsWith(`${VEHICLE_SEND_PREFIX}:`)) return await handleVehicleSendButton(interaction);
      return;
    }

    if (interaction.isStringSelectMenu()) {
      const id = interaction.customId;

      if (id.startsWith(`${EXAM_CATEGORY_PREFIX}:`)) return await handleExamCategorySelect(interaction);
      if (id.startsWith(`${VEHICLE_CATEGORY_PREFIX}:`)) return await handleVehicleCategorySelect(interaction);
      return;
    }

    if (interaction.isModalSubmit()) {
      const id = interaction.customId;

      if (id === CREATE_ID_MODAL_ID || id.startsWith(`${CREATE_ID_MODAL_ID}:`)) {
        return await handleCreateIdModal(interaction);
      }
      if (id.startsWith(`${VERIFY_MODAL_PREFIX}:`)) return await handleVerifyModal(interaction);
      if (id.startsWith(`${EXAM_MODAL_PREFIX}:`)) return await handleExamModal(interaction);
      if (id.startsWith(`${VEHICLE_MODAL_PREFIX}:`)) return await handleVehicleModal(interaction);
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

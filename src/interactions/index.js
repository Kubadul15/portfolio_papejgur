const { handleCreateIdButton } = require('./createIdButton');
const { handleCreateIdModal } = require('./createIdModal');
const { handleSendIdButton, handleCancelIdButton } = require('./confirmButtons');
const { handleVehicleStartButton } = require('./vehicleStartButton');
const { handleVehicleCategorySelect } = require('./vehicleCategorySelect');
const { handleVehicleModal } = require('./vehicleModal');
const { handleVehiclePlateStartButton } = require('./vehiclePlateStartButton');
const { handleVehiclePlateModal } = require('./vehiclePlateModal');
const { handleVehicleSendButton } = require('./vehicleSendButton');
const { handleTicketCreateButton } = require('./ticketCreateButton');
const { handleTicketModal } = require('./ticketModal');
const { handleTicketClaimButton } = require('./ticketClaimButton');
const { handleTicketAddUserButton } = require('./ticketAddUserButton');
const { handleTicketAddUserSelect } = require('./ticketAddUserSelect');
const { handleTicketCloseButton } = require('./ticketCloseButton');
const { handleApplicationStartButton } = require('./applicationStartButton');
const { handleApplicationMicSelect } = require('./applicationMicSelect');
const { handleApplicationModal } = require('./applicationModal');
const { handleApplicationReviewSelect } = require('./applicationReviewSelect');
const { handleApplicationRejectModal } = require('./applicationRejectModal');
const { handleMafiaStartButton } = require('./mafiaStartButton');
const { handleMafiaSizeSelect } = require('./mafiaSizeSelect');
const { handleMafiaModal } = require('./mafiaModal');
const { handleMafiaSendButton } = require('./mafiaSendButton');
const { handleHouseStartButton } = require('./houseStartButton');
const { handleHouseCategorySelect } = require('./houseCategorySelect');
const { handleHouseModal } = require('./houseModal');
const { handleHouseDetailsStartButton } = require('./houseDetailsStartButton');
const { handleHouseDetailsModal } = require('./houseDetailsModal');
const { handleHouseSendButton } = require('./houseSendButton');
const { handleAuctionStartButton } = require('./auctionStartButton');
const { handleAuctionModal } = require('./auctionModal');
const { handleAuctionBidButton } = require('./auctionBidButton');
const { handleAuctionBidModal } = require('./auctionBidModal');
const { handleAuctionEndButton } = require('./auctionEndButton');
const {
  CREATE_ID_BUTTON_ID,
  CREATE_ID_MODAL_ID,
  SEND_ID_BUTTON_ID,
  CANCEL_ID_BUTTON_ID,
  VEHICLE_START_PREFIX,
  VEHICLE_CATEGORY_PREFIX,
  VEHICLE_MODAL_PREFIX,
  VEHICLE_PLATE_START_PREFIX,
  VEHICLE_PLATE_MODAL_PREFIX,
  VEHICLE_SEND_PREFIX,
  TICKET_CREATE_PREFIX,
  TICKET_MODAL_PREFIX,
  TICKET_CLAIM_BUTTON_ID,
  TICKET_ADD_USER_BUTTON_ID,
  TICKET_ADD_USER_SELECT_ID,
  TICKET_CLOSE_BUTTON_ID,
  APP_START_PREFIX,
  APP_MIC_SELECT_PREFIX,
  APP_MODAL_PREFIX,
  APP_REVIEW_SELECT_ID,
  APP_REJECT_MODAL_ID,
  MAFIA_START_PREFIX,
  MAFIA_SIZE_PREFIX,
  MAFIA_MODAL_PREFIX,
  MAFIA_SEND_PREFIX,
  HOUSE_START_PREFIX,
  HOUSE_CATEGORY_PREFIX,
  HOUSE_MODAL_PREFIX,
  HOUSE_DETAILS_START_PREFIX,
  HOUSE_DETAILS_MODAL_PREFIX,
  HOUSE_SEND_PREFIX,
  AUCTION_START_PREFIX,
  AUCTION_MODAL_PREFIX,
  AUCTION_BID_PREFIX,
  AUCTION_BID_MODAL_PREFIX,
  AUCTION_END_PREFIX,
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
      if (id.startsWith(`${VEHICLE_START_PREFIX}:`)) return await handleVehicleStartButton(interaction);
      if (id.startsWith(`${VEHICLE_PLATE_START_PREFIX}:`)) return await handleVehiclePlateStartButton(interaction);
      if (id.startsWith(`${VEHICLE_SEND_PREFIX}:`)) return await handleVehicleSendButton(interaction);
      if (id.startsWith(`${TICKET_CREATE_PREFIX}:`)) return await handleTicketCreateButton(interaction);
      if (id === TICKET_CLAIM_BUTTON_ID) return await handleTicketClaimButton(interaction);
      if (id === TICKET_ADD_USER_BUTTON_ID) return await handleTicketAddUserButton(interaction);
      if (id === TICKET_CLOSE_BUTTON_ID) return await handleTicketCloseButton(interaction);
      if (id.startsWith(`${APP_START_PREFIX}:`)) return await handleApplicationStartButton(interaction);
      if (id.startsWith(`${MAFIA_START_PREFIX}:`)) return await handleMafiaStartButton(interaction);
      if (id.startsWith(`${MAFIA_SEND_PREFIX}:`)) return await handleMafiaSendButton(interaction);
      if (id.startsWith(`${HOUSE_START_PREFIX}:`)) return await handleHouseStartButton(interaction);
      if (id.startsWith(`${HOUSE_DETAILS_START_PREFIX}:`)) return await handleHouseDetailsStartButton(interaction);
      if (id.startsWith(`${HOUSE_SEND_PREFIX}:`)) return await handleHouseSendButton(interaction);
      if (id.startsWith(`${AUCTION_START_PREFIX}:`)) return await handleAuctionStartButton(interaction);
      if (id.startsWith(`${AUCTION_BID_PREFIX}:`)) return await handleAuctionBidButton(interaction);
      if (id.startsWith(`${AUCTION_END_PREFIX}:`)) return await handleAuctionEndButton(interaction);
      return;
    }

    if (interaction.isStringSelectMenu()) {
      const id = interaction.customId;

      if (id.startsWith(`${VEHICLE_CATEGORY_PREFIX}:`)) return await handleVehicleCategorySelect(interaction);
      if (id.startsWith(`${APP_MIC_SELECT_PREFIX}:`)) return await handleApplicationMicSelect(interaction);
      if (id === APP_REVIEW_SELECT_ID) return await handleApplicationReviewSelect(interaction);
      if (id.startsWith(`${MAFIA_SIZE_PREFIX}:`)) return await handleMafiaSizeSelect(interaction);
      if (id.startsWith(`${HOUSE_CATEGORY_PREFIX}:`)) return await handleHouseCategorySelect(interaction);
      return;
    }

    if (interaction.isUserSelectMenu()) {
      if (interaction.customId === TICKET_ADD_USER_SELECT_ID) return await handleTicketAddUserSelect(interaction);
      return;
    }

    if (interaction.isModalSubmit()) {
      const id = interaction.customId;

      if (id === CREATE_ID_MODAL_ID || id.startsWith(`${CREATE_ID_MODAL_ID}:`)) {
        return await handleCreateIdModal(interaction);
      }
      if (id.startsWith(`${VEHICLE_MODAL_PREFIX}:`)) return await handleVehicleModal(interaction);
      if (id.startsWith(`${VEHICLE_PLATE_MODAL_PREFIX}:`)) return await handleVehiclePlateModal(interaction);
      if (id.startsWith(`${TICKET_MODAL_PREFIX}:`)) return await handleTicketModal(interaction);
      if (id.startsWith(`${APP_MODAL_PREFIX}:`)) return await handleApplicationModal(interaction);
      if (id === APP_REJECT_MODAL_ID) return await handleApplicationRejectModal(interaction);
      if (id.startsWith(`${MAFIA_MODAL_PREFIX}:`)) return await handleMafiaModal(interaction);
      if (id.startsWith(`${HOUSE_MODAL_PREFIX}:`)) return await handleHouseModal(interaction);
      if (id.startsWith(`${HOUSE_DETAILS_MODAL_PREFIX}:`)) return await handleHouseDetailsModal(interaction);
      if (id.startsWith(`${AUCTION_BID_MODAL_PREFIX}:`)) return await handleAuctionBidModal(interaction);
      if (id.startsWith(`${AUCTION_MODAL_PREFIX}:`)) return await handleAuctionModal(interaction);
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

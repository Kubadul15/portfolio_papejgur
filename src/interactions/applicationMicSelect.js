const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const {
  APP_MIC_SELECT_PREFIX,
  APP_MODAL_PREFIX,
  MODAL_FIELD_APP_AGE,
  MODAL_FIELD_APP_OTHER_SERVERS,
  MODAL_FIELD_APP_EH_EXPERIENCE,
  MODAL_FIELD_APP_FOUND_VIA,
  MODAL_FIELD_APP_HOURS,
} = require('./constants');

async function handleApplicationMicSelect(interaction) {
  const [categoryId, supportRoleId, acceptRoleId] = interaction.customId
    .slice(APP_MIC_SELECT_PREFIX.length + 1)
    .split(':');
  const mic = interaction.values[0];

  const modal = new ModalBuilder()
    .setCustomId(`${APP_MODAL_PREFIX}:${categoryId}:${supportRoleId}:${acceptRoleId || ''}:${mic}`)
    .setTitle('Podanie o dołączenie');

  const ageInput = new TextInputBuilder()
    .setCustomId(MODAL_FIELD_APP_AGE)
    .setLabel('Ile masz lat?')
    .setStyle(TextInputStyle.Short)
    .setMaxLength(3)
    .setRequired(true);

  const otherServersInput = new TextInputBuilder()
    .setCustomId(MODAL_FIELD_APP_OTHER_SERVERS)
    .setLabel('Byłeś na innych serwerach? Jeśli tak, na jakich?')
    .setStyle(TextInputStyle.Paragraph)
    .setMaxLength(300)
    .setRequired(true);

  const ehExperienceInput = new TextInputBuilder()
    .setCustomId(MODAL_FIELD_APP_EH_EXPERIENCE)
    .setLabel('Ile grasz w Emergency Hamburg?')
    .setStyle(TextInputStyle.Short)
    .setMaxLength(100)
    .setRequired(true);

  const foundViaInput = new TextInputBuilder()
    .setCustomId(MODAL_FIELD_APP_FOUND_VIA)
    .setLabel('Skąd poznałeś nasz serwer?')
    .setStyle(TextInputStyle.Short)
    .setMaxLength(150)
    .setRequired(true);

  const hoursInput = new TextInputBuilder()
    .setCustomId(MODAL_FIELD_APP_HOURS)
    .setLabel('Ile masz godzin u nas na serwerze?')
    .setStyle(TextInputStyle.Short)
    .setMaxLength(50)
    .setRequired(true);

  modal.addComponents(
    new ActionRowBuilder().addComponents(ageInput),
    new ActionRowBuilder().addComponents(otherServersInput),
    new ActionRowBuilder().addComponents(ehExperienceInput),
    new ActionRowBuilder().addComponents(foundViaInput),
    new ActionRowBuilder().addComponents(hoursInput)
  );

  await interaction.showModal(modal);
}

module.exports = { handleApplicationMicSelect };

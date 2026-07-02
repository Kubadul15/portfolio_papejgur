const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { verifyRobloxUsername } = require('../utils/roblox');
const { buildExamCandidateEmbed, buildExamQuestionEmbed } = require('../utils/embeds');
const { buildAnswerButtons } = require('../utils/exam');
const { EXAM_QUESTIONS } = require('../data/examQuestions');
const {
  EXAM_MODAL_PREFIX,
  MODAL_FIELD_FULL_NAME,
  MODAL_FIELD_AGE,
  MODAL_FIELD_ROBLOX,
  CANCEL_ID_BUTTON_ID,
} = require('./constants');

async function handleExamModal(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const [channelId, category] = interaction.customId.slice(EXAM_MODAL_PREFIX.length + 1).split(':');
  const fullName = interaction.fields.getTextInputValue(MODAL_FIELD_FULL_NAME).trim();
  const age = interaction.fields.getTextInputValue(MODAL_FIELD_AGE).trim();
  const robloxUsername = interaction.fields.getTextInputValue(MODAL_FIELD_ROBLOX).trim();

  let robloxData = null;
  try {
    robloxData = await verifyRobloxUsername(robloxUsername);
  } catch (error) {
    console.error('Błąd podczas weryfikacji nicku Roblox:', error);
    await interaction.editReply({
      content: '⚠️ Nie udało się połączyć z API Roblox. Spróbuj ponownie za chwilę.',
    });
    return;
  }

  if (!robloxData) {
    await interaction.editReply({
      content: '⚠️ Nie znaleziono konta o takim nicku na Roblox. Sprawdź pisownię i użyj przycisku jeszcze raz.',
    });
    return;
  }

  const candidateEmbed = buildExamCandidateEmbed({
    discordUser: interaction.user,
    fullName,
    age,
    category,
    robloxData,
  });
  const firstQuestion = EXAM_QUESTIONS[0];
  const questionEmbed = buildExamQuestionEmbed(firstQuestion, 0, EXAM_QUESTIONS.length, 0);

  const answerRow = buildAnswerButtons(channelId, 0, 0, firstQuestion);
  const abortRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(CANCEL_ID_BUTTON_ID).setLabel('Przerwij egzamin').setStyle(ButtonStyle.Danger)
  );

  await interaction.editReply({
    content: 'Zaczynamy egzamin teoretyczny — odpowiadaj zgodnie z przepisami!',
    embeds: [candidateEmbed, questionEmbed],
    components: [answerRow, abortRow],
  });
}

module.exports = { handleExamModal };

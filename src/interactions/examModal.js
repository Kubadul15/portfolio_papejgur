const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { verifyRobloxUsername } = require('../utils/roblox');
const { buildExamCandidateEmbed, buildExamQuestionEmbed } = require('../utils/embeds');
const { buildAnswerButtons, pickRandomQuestionIndices, EXAM_QUESTION_COUNT } = require('../utils/exam');
const { parseAge } = require('../utils/validation');
const { getCategoryMinAge } = require('../data/licenseCategories');
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

  const [channelId, roleId, category] = interaction.customId.slice(EXAM_MODAL_PREFIX.length + 1).split(':');
  const fullName = interaction.fields.getTextInputValue(MODAL_FIELD_FULL_NAME).trim();
  const rawAge = interaction.fields.getTextInputValue(MODAL_FIELD_AGE).trim();
  const robloxUsername = interaction.fields.getTextInputValue(MODAL_FIELD_ROBLOX).trim();

  const age = parseAge(rawAge);
  if (age === null) {
    await interaction.editReply({
      content: '⚠️ Podaj prawidłowy wiek — liczba całkowita od 1 do 100. Użyj przycisku jeszcze raz.',
    });
    return;
  }

  const minAge = getCategoryMinAge(category);
  if (age < minAge) {
    await interaction.editReply({
      content: `❌ Do kategorii **${category}** wymagany jest wiek co najmniej ${minAge} lat, a podałeś ${age}. Egzamin nie może się odbyć.`,
    });
    return;
  }

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
    awardRoleId: roleId || null,
  });
  const [firstIndex, ...remaining] = pickRandomQuestionIndices();
  const firstQuestion = EXAM_QUESTIONS[firstIndex];
  const questionEmbed = buildExamQuestionEmbed(firstQuestion, 0, EXAM_QUESTION_COUNT, 0);

  const answerRow = buildAnswerButtons(channelId, 0, firstIndex, remaining, firstQuestion);
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

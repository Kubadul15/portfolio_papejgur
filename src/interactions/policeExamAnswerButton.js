const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { POLICE_EXAM_QUESTIONS } = require('../data/policeExamQuestions');
const { buildExamQuestionEmbed } = require('../utils/embeds');
const { buildPoliceAnswerButtons, isPolicePassing, POLICE_EXAM_QUESTION_COUNT } = require('../utils/policeExam');
const { setPoliceExamFailureCooldown, POLICE_EXAM_COOLDOWN_MS } = require('../utils/cooldown');
const registry = require('../utils/registry');
const { sendAdminLog } = require('../utils/adminLog');
const { POLICE_EXAM_ANSWER_PREFIX, APP_START_PREFIX, CANCEL_ID_BUTTON_ID } = require('./constants');

async function handlePoliceExamAnswerButton(interaction) {
  await interaction.deferUpdate();

  const [panelId, scoreStr, answerIndexStr, questionIndexStr, remainingStr] = interaction.customId
    .slice(POLICE_EXAM_ANSWER_PREFIX.length + 1)
    .split(':');
  const score = Number(scoreStr);
  const answerIndex = Number(answerIndexStr);
  const questionIndex = Number(questionIndexStr);
  const remaining = remainingStr ? remainingStr.split('-').map(Number) : [];

  const question = POLICE_EXAM_QUESTIONS[questionIndex];
  const newScore = score + (answerIndex === question.correctIndex ? 1 : 0);
  const position = POLICE_EXAM_QUESTION_COUNT - 1 - remaining.length;

  if (remaining.length > 0) {
    const [nextIndex, ...nextRemaining] = remaining;
    const nextQuestion = POLICE_EXAM_QUESTIONS[nextIndex];
    const questionEmbed = buildExamQuestionEmbed(nextQuestion, position + 1, POLICE_EXAM_QUESTION_COUNT, newScore);
    const answerRow = buildPoliceAnswerButtons(panelId, newScore, nextIndex, nextRemaining, nextQuestion);
    const abortRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(CANCEL_ID_BUTTON_ID).setLabel('Przerwij egzamin').setStyle(ButtonStyle.Danger)
    );

    await interaction.editReply({ embeds: [questionEmbed], components: [answerRow, abortRow] });
    return;
  }

  const total = POLICE_EXAM_QUESTION_COUNT;
  const passed = isPolicePassing(newScore);
  const panel = registry.getPoliceRecruitmentPanel(panelId);

  if (passed && panel) {
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`${APP_START_PREFIX}:${panel.categoryId}:${panel.supportRoleId}:${panel.acceptRoleId || ''}`)
        .setLabel('Złóż podanie')
        .setEmoji('📝')
        .setStyle(ButtonStyle.Success)
    );

    await interaction.editReply({
      content: `🎉 Gratulacje, zdałeś egzamin wiedzy (${newScore}/${total})! Kliknij przycisk, aby złożyć podanie do KMP.`,
      embeds: [],
      components: [row],
    });
  } else if (passed && !panel) {
    await interaction.editReply({
      content: `🎉 Zdałeś egzamin (${newScore}/${total}), ale panel rekrutacji już nie jest aktywny — skontaktuj się z administracją.`,
      embeds: [],
      components: [],
    });
  } else {
    setPoliceExamFailureCooldown(interaction.user.id);
    const cooldownMinutes = Math.round(POLICE_EXAM_COOLDOWN_MS / 60000);
    await interaction.editReply({
      content: `❌ Niestety, nie zdałeś egzaminu (${newScore}/${total}). Możesz podejść ponownie za ${cooldownMinutes} minut.`,
      embeds: [],
      components: [],
    });
  }

  await sendAdminLog(interaction.client, {
    title: '🚓 Egzamin wiedzy do KMP zakończony',
    description:
      `**Kto:** <@${interaction.user.id}> (${interaction.user.tag})\n` +
      `**Wynik:** ${newScore}/${total}\n` +
      `**Status:** ${passed ? '✅ Zdany' : '❌ Niezdany'}`,
    color: passed ? undefined : '#e02b2b',
  });
}

module.exports = { handlePoliceExamAnswerButton };

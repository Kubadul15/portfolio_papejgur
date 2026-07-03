const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { WRD_EXAM_QUESTIONS } = require('../data/wrdExamQuestions');
const { buildExamQuestionEmbed } = require('../utils/embeds');
const { buildWrdAnswerButtons, isWrdPassing, WRD_EXAM_QUESTION_COUNT } = require('../utils/wrdExam');
const { setWrdExamFailureCooldown, WRD_EXAM_COOLDOWN_MS } = require('../utils/cooldown');
const registry = require('../utils/registry');
const { sendAdminLog } = require('../utils/adminLog');
const { WRD_EXAM_ANSWER_PREFIX, APP_START_PREFIX, CANCEL_ID_BUTTON_ID } = require('./constants');

async function handleWrdExamAnswerButton(interaction) {
  await interaction.deferUpdate();

  const [panelId, scoreStr, answerIndexStr, questionIndexStr, remainingStr] = interaction.customId
    .slice(WRD_EXAM_ANSWER_PREFIX.length + 1)
    .split(':');
  const score = Number(scoreStr);
  const answerIndex = Number(answerIndexStr);
  const questionIndex = Number(questionIndexStr);
  const remaining = remainingStr ? remainingStr.split('-').map(Number) : [];

  const question = WRD_EXAM_QUESTIONS[questionIndex];
  const newScore = score + (answerIndex === question.correctIndex ? 1 : 0);
  const position = WRD_EXAM_QUESTION_COUNT - 1 - remaining.length;

  if (remaining.length > 0) {
    const [nextIndex, ...nextRemaining] = remaining;
    const nextQuestion = WRD_EXAM_QUESTIONS[nextIndex];
    const questionEmbed = buildExamQuestionEmbed(nextQuestion, position + 1, WRD_EXAM_QUESTION_COUNT, newScore);
    const answerRow = buildWrdAnswerButtons(panelId, newScore, nextIndex, nextRemaining, nextQuestion);
    const abortRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(CANCEL_ID_BUTTON_ID).setLabel('Przerwij egzamin').setStyle(ButtonStyle.Danger)
    );

    await interaction.editReply({ embeds: [questionEmbed], components: [answerRow, abortRow] });
    return;
  }

  const total = WRD_EXAM_QUESTION_COUNT;
  const passed = isWrdPassing(newScore);
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
      content: `🎉 Gratulacje, zdałeś egzamin podstawowy (${newScore}/${total})! Kliknij przycisk, aby złożyć podanie do WRD.`,
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
    setWrdExamFailureCooldown(interaction.user.id);
    const cooldownMinutes = Math.round(WRD_EXAM_COOLDOWN_MS / 60000);
    await interaction.editReply({
      content: `❌ Niestety, nie zdałeś egzaminu (${newScore}/${total}). Możesz podejść ponownie za ${cooldownMinutes} minut.`,
      embeds: [],
      components: [],
    });
  }

  await sendAdminLog(interaction.client, {
    title: '🚦 Egzamin podstawowy do WRD zakończony',
    description:
      `**Kto:** <@${interaction.user.id}> (${interaction.user.tag})\n` +
      `**Wynik:** ${newScore}/${total}\n` +
      `**Status:** ${passed ? '✅ Zdany' : '❌ Niezdany'}`,
    color: passed ? undefined : '#e02b2b',
  });
}

module.exports = { handleWrdExamAnswerButton };

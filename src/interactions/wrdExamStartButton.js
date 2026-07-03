const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const registry = require('../utils/registry');
const { parseApplicationTopic } = require('../utils/application');
const { getWrdExamCooldownExpiresAt } = require('../utils/cooldown');
const { buildExamQuestionEmbed } = require('../utils/embeds');
const { pickRandomWrdQuestionIndices, buildWrdAnswerButtons, WRD_EXAM_QUESTION_COUNT } = require('../utils/wrdExam');
const { WRD_EXAM_QUESTIONS } = require('../data/wrdExamQuestions');
const { WRD_EXAM_START_PREFIX, CANCEL_ID_BUTTON_ID } = require('./constants');

async function handleWrdExamStartButton(interaction) {
  const panelId = interaction.customId.slice(WRD_EXAM_START_PREFIX.length + 1);
  const panel = registry.getPoliceRecruitmentPanel(panelId);

  if (!panel) {
    await interaction.reply({
      content: '❌ Ten panel rekrutacji do WRD już nie jest aktywny. Skontaktuj się z administracją.',
      ephemeral: true,
    });
    return;
  }

  const cooldownExpiresAt = getWrdExamCooldownExpiresAt(interaction.user.id);
  if (cooldownExpiresAt) {
    await interaction.reply({
      content: `⏳ Oblałeś ostatnio egzamin podstawowy do WRD. Możesz podejść ponownie <t:${Math.floor(cooldownExpiresAt / 1000)}:R>.`,
      ephemeral: true,
    });
    return;
  }

  const category = interaction.guild.channels.cache.get(panel.categoryId);
  if (category) {
    const existing = category.children.cache.find((channel) => {
      const parsed = parseApplicationTopic(channel.topic);
      return parsed && parsed.ownerId === interaction.user.id;
    });
    if (existing) {
      await interaction.reply({
        content: `❌ Masz już otwarte podanie: ${existing}. Poczekaj na jego rozpatrzenie.`,
        ephemeral: true,
      });
      return;
    }
  }

  const [firstIndex, ...remaining] = pickRandomWrdQuestionIndices();
  const firstQuestion = WRD_EXAM_QUESTIONS[firstIndex];
  const questionEmbed = buildExamQuestionEmbed(firstQuestion, 0, WRD_EXAM_QUESTION_COUNT, 0);
  const answerRow = buildWrdAnswerButtons(panelId, 0, firstIndex, remaining, firstQuestion);
  const abortRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(CANCEL_ID_BUTTON_ID).setLabel('Przerwij egzamin').setStyle(ButtonStyle.Danger)
  );

  await interaction.reply({
    content: `🚦 Egzamin podstawowy do WRD — ${WRD_EXAM_QUESTION_COUNT} pytań o ruchu drogowym, dopuszczalne 2 pomyłki. Powodzenia!`,
    embeds: [questionEmbed],
    components: [answerRow, abortRow],
    ephemeral: true,
  });
}

module.exports = { handleWrdExamStartButton };

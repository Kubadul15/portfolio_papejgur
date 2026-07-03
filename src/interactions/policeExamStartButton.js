const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const registry = require('../utils/registry');
const { parseApplicationTopic } = require('../utils/application');
const { getPoliceExamCooldownExpiresAt } = require('../utils/cooldown');
const { buildExamQuestionEmbed } = require('../utils/embeds');
const { pickRandomPoliceQuestionIndices, buildPoliceAnswerButtons, POLICE_EXAM_QUESTION_COUNT } = require('../utils/policeExam');
const { POLICE_EXAM_QUESTIONS } = require('../data/policeExamQuestions');
const { POLICE_EXAM_START_PREFIX, CANCEL_ID_BUTTON_ID } = require('./constants');

async function handlePoliceExamStartButton(interaction) {
  const panelId = interaction.customId.slice(POLICE_EXAM_START_PREFIX.length + 1);
  const panel = registry.getPoliceRecruitmentPanel(panelId);

  if (!panel) {
    await interaction.reply({
      content: '❌ Ten panel rekrutacji do KMP już nie jest aktywny. Skontaktuj się z administracją.',
      ephemeral: true,
    });
    return;
  }

  const cooldownExpiresAt = getPoliceExamCooldownExpiresAt(interaction.user.id);
  if (cooldownExpiresAt) {
    await interaction.reply({
      content: `⏳ Oblałeś ostatnio egzamin wiedzy do KMP. Możesz podejść ponownie <t:${Math.floor(cooldownExpiresAt / 1000)}:R>.`,
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

  const [firstIndex, ...remaining] = pickRandomPoliceQuestionIndices();
  const firstQuestion = POLICE_EXAM_QUESTIONS[firstIndex];
  const questionEmbed = buildExamQuestionEmbed(firstQuestion, 0, POLICE_EXAM_QUESTION_COUNT, 0);
  const answerRow = buildPoliceAnswerButtons(panelId, 0, firstIndex, remaining, firstQuestion);
  const abortRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(CANCEL_ID_BUTTON_ID).setLabel('Przerwij egzamin').setStyle(ButtonStyle.Danger)
  );

  await interaction.reply({
    content: `🚓 Egzamin wiedzy do KMP — ${POLICE_EXAM_QUESTION_COUNT} pytań, dopuszczalna tylko 1 pomyłka. Powodzenia!`,
    embeds: [questionEmbed],
    components: [answerRow, abortRow],
    ephemeral: true,
  });
}

module.exports = { handlePoliceExamStartButton };

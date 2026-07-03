const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { POLICE_EXAM_QUESTIONS } = require('../data/policeExamQuestions');
const { POLICE_EXAM_ANSWER_PREFIX } = require('../interactions/constants');

// "Ciezki" egzamin wiedzy dla kandydatow do KMP - wiecej pytan i taki sam
// wymog jak na prawdziwym egzaminie (max jedna pomylka), zeby faktycznie
// przesiac kandydatow przed dopuszczeniem do napisania podania.
const POLICE_EXAM_QUESTION_COUNT = 10;
const POLICE_EXAM_PASSING_SCORE = POLICE_EXAM_QUESTION_COUNT - 1;

function isPolicePassing(score) {
  return score >= POLICE_EXAM_PASSING_SCORE;
}

function pickRandomPoliceQuestionIndices(count = POLICE_EXAM_QUESTION_COUNT) {
  const indices = POLICE_EXAM_QUESTIONS.map((_, index) => index);

  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  return indices.slice(0, count);
}

// customId niesie: krotki panelId (wskazujacy w rejestrze na kategorie/role
// docelowe podania - trzy pelne ID discordowe nie zmiescilyby sie w limicie
// 100 znakow customId razem z reszta stanu egzaminu), dotychczasowy wynik,
// indeks pytania i pozostale (jeszcze nie zadane) indeksy.
function buildPoliceAnswerButtons(panelId, score, questionIndex, remainingIndices, question) {
  const remainingStr = remainingIndices.join('-');
  const row = new ActionRowBuilder();

  question.answers.forEach((answerText, answerIndex) => {
    row.addComponents(
      new ButtonBuilder()
        .setCustomId(`${POLICE_EXAM_ANSWER_PREFIX}:${panelId}:${score}:${answerIndex}:${questionIndex}:${remainingStr}`)
        .setLabel(answerText)
        .setStyle(ButtonStyle.Secondary)
    );
  });

  return row;
}

module.exports = {
  POLICE_EXAM_QUESTION_COUNT,
  POLICE_EXAM_PASSING_SCORE,
  isPolicePassing,
  pickRandomPoliceQuestionIndices,
  buildPoliceAnswerButtons,
};

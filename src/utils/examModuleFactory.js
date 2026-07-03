const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

// Wspolna fabryka logiki egzaminow typu "pytanie -> przycisk z odpowiedzia"
// uzywana zarowno przez glowny egzamin wiedzy do KMP, jak i lzejszy egzamin
// podstawowy do WRD - rozne pule pytan/progi zdawalnosci, ale identyczny
// mechanizm losowania i kodowania stanu w customId (bezstanowo, przetrwa
// restart bota).
function createExamModule({ questions, answerPrefix, questionCount, passingScore }) {
  function isPassing(score) {
    return score >= passingScore;
  }

  function pickRandomQuestionIndices(count = questionCount) {
    const indices = questions.map((_, index) => index);

    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    return indices.slice(0, count);
  }

  // customId niesie: krotki panelId (wskazujacy w rejestrze na kategorie/role
  // docelowe podania), dotychczasowy wynik, indeks pytania i pozostale
  // (jeszcze nie zadane) indeksy.
  function buildAnswerButtons(panelId, score, questionIndex, remainingIndices, question) {
    const remainingStr = remainingIndices.join('-');
    const row = new ActionRowBuilder();

    question.answers.forEach((answerText, answerIndex) => {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`${answerPrefix}:${panelId}:${score}:${answerIndex}:${questionIndex}:${remainingStr}`)
          .setLabel(answerText)
          .setStyle(ButtonStyle.Secondary)
      );
    });

    return row;
  }

  return {
    QUESTIONS: questions,
    QUESTION_COUNT: questionCount,
    PASSING_SCORE: passingScore,
    isPassing,
    pickRandomQuestionIndices,
    buildAnswerButtons,
  };
}

module.exports = { createExamModule };

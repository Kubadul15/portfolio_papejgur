const { WRD_EXAM_QUESTIONS } = require('../data/wrdExamQuestions');
const { WRD_EXAM_ANSWER_PREFIX } = require('../interactions/constants');
const { createExamModule } = require('./examModuleFactory');

// Egzamin PODSTAWOWY dla kandydatow do WRD - krotszy i bardziej
// wybaczajacy niz glowny egzamin do KMP (dopuszczalne 2 pomylki), bo to
// wstepny test wiedzy o ruchu drogowym, a nie pelna rekrutacja policyjna.
const mod = createExamModule({
  questions: WRD_EXAM_QUESTIONS,
  answerPrefix: WRD_EXAM_ANSWER_PREFIX,
  questionCount: 8,
  passingScore: 6,
});

module.exports = {
  WRD_EXAM_QUESTION_COUNT: mod.QUESTION_COUNT,
  WRD_EXAM_PASSING_SCORE: mod.PASSING_SCORE,
  isWrdPassing: mod.isPassing,
  pickRandomWrdQuestionIndices: mod.pickRandomQuestionIndices,
  buildWrdAnswerButtons: mod.buildAnswerButtons,
};

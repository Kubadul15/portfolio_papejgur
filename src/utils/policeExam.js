const { POLICE_EXAM_QUESTIONS } = require('../data/policeExamQuestions');
const { POLICE_EXAM_ANSWER_PREFIX } = require('../interactions/constants');
const { createExamModule } = require('./examModuleFactory');

// "Ciezki" egzamin wiedzy dla kandydatow do KMP - wiecej pytan i taki sam
// wymog jak na prawdziwym egzaminie (max jedna pomylka), zeby faktycznie
// przesiac kandydatow przed dopuszczeniem do napisania podania.
const mod = createExamModule({
  questions: POLICE_EXAM_QUESTIONS,
  answerPrefix: POLICE_EXAM_ANSWER_PREFIX,
  questionCount: 10,
  passingScore: 9,
});

module.exports = {
  POLICE_EXAM_QUESTION_COUNT: mod.QUESTION_COUNT,
  POLICE_EXAM_PASSING_SCORE: mod.PASSING_SCORE,
  isPolicePassing: mod.isPassing,
  pickRandomPoliceQuestionIndices: mod.pickRandomQuestionIndices,
  buildPoliceAnswerButtons: mod.buildAnswerButtons,
};

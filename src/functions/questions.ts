import questionsData from '@/assets/questions.json';
import { isQuestion, Question, QuestionCondition } from '@/type';

const QUESTIONS: Question[] = (questionsData.records as Question[]).filter(isQuestion);

export function getQuestion(condition: QuestionCondition): Question | null {
  const filters: ((question: Question) => boolean)[] = [];

  if (condition.concealedCondition !== "all") {
    filters.push(question =>
      condition.concealedCondition === "concealed"
        ? question.hand.openMelds.every(meld => meld.callFrom === "SELF")
        : question.hand.openMelds.some(meld => meld.callFrom !== "SELF")
    );
  }

  if (condition.winningCondition !== "all") {
    filters.push(question =>
      condition.winningCondition === "tsumo"
        ? question.hand.situation.isTsumo
        : !question.hand.situation.isTsumo
    );
  }

  if (condition.dealerCondition !== "all") {
    filters.push(question =>
      condition.dealerCondition === "dealer"
        ? question.hand.situation.seatWind === "EAST"
        : question.hand.situation.seatWind !== "EAST"
    );
  }

  if (condition.doublesLowerLimit) {
    filters.push(question => (question.score.isHandLimit ? 13 : question.score.doubles) >= condition.doublesLowerLimit);
  }

  if (condition.doublesUpperLimit) {
    filters.push(question => (question.score.isHandLimit ? 13 : question.score.doubles) <= condition.doublesUpperLimit);
  }

  const shuffled = QUESTIONS.slice().sort(() => Math.random() - 0.5);
  return shuffled.find(question => filters.every(filter => filter(question))) || null;
}

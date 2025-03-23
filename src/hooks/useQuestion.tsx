import { getQuestion } from "@/functions/questions";
import { DEFAULT_CONDITION, Question, QuestionCondition } from "@/type";
import { useEffect, useState } from "react";

/**
 * 麻雀点数計算問題を取得するカスタムフック
 */
export function useQuestion(): [
  Question | null,
  QuestionCondition,
  React.Dispatch<React.SetStateAction<QuestionCondition>>,
  () => void
] {
  const [condition, setCondition] = useState<QuestionCondition>(() => DEFAULT_CONDITION);
  const [question, setQuestion] = useState<Question | null>(null);
  
  // 現在の設定をもとに次の問題を取得する
  const nextQuestion = () => {
    const newQuestion = getQuestion(condition);
    setQuestion(newQuestion);
  }

  // nextQuestion が冪等でないため、useEffect で初期値を設定する
  useEffect(() => {
    nextQuestion();
  }, []);
  
  return [
    question,
    condition,
    setCondition,
    nextQuestion,
  ];
}
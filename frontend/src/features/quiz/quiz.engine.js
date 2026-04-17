export function calculateScore(questions, selected) {
  const total = questions.length;
  const correct = questions.filter(
    (question) => selected[question.id] === question.answer,
  ).length;

  return { correct, total };
}

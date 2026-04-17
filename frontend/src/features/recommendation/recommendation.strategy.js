export function recommendNextTopic(progressData) {
  const ratio = progressData.total
    ? progressData.completed / progressData.total
    : 0;

  if (ratio < 0.4) {
    return "Focus on fundamentals and complete one short lesson today.";
  }

  if (ratio < 0.8) {
    return `Continue from '${progressData.recentTopic}' and practice with a small quiz.`;
  }

  return "Great progress. Move to advanced projects and peer discussion.";
}

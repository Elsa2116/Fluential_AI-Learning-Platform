export function buildProgressLabel(completed, total) {
  if (!total) {
    return "No modules tracked yet.";
  }

  const percent = Math.round((completed / total) * 100);
  return `${completed}/${total} modules completed (${percent}%).`;
}

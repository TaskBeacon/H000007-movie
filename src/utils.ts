export function resolveMovieConditions(n_trials: number, condition_labels: string[]): string[] {
  const labels = condition_labels.length > 0 ? condition_labels : ["movie"];
  const value = String(labels[0]);
  return Array.from({ length: n_trials }, () => value);
}

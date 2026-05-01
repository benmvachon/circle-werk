export function generateId(): string {
  return crypto.randomUUID();
}

export function formatCadence(hours: number): string {
  if (hours < 24) return `${hours}h`;
  const days = hours / 24;
  return days === 1 ? '1 day' : `${days} days`;
}

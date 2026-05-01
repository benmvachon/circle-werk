import { Timestamp } from 'firebase/firestore';

export function generateId(): string {
  return crypto.randomUUID();
}

export function formatCadence(hours: number): string {
  if (hours < 24) return `${hours}h`;
  const days = hours / 24;
  return days === 1 ? '1 day' : `${days} days`;
}

export function formatTimeRemaining(dueAt: Timestamp): string {
  const ms = dueAt.toMillis() - Date.now();
  if (ms <= 0) return 'Overdue';
  const hours = Math.floor(ms / 3_600_000);
  if (hours < 1) {
    const mins = Math.floor(ms / 60_000);
    return `${mins}m left`;
  }
  if (hours < 24) return `${hours}h left`;
  const days = Math.floor(hours / 24);
  return days === 1 ? '1 day left' : `${days} days left`;
}

export function formatDate(ts: Timestamp): string {
  return ts.toDate().toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatRelativeDate(ts: Timestamp): string {
  const ms = Date.now() - ts.toMillis();
  if (ms < 0) return 'just now';
  const mins = Math.floor(ms / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  return formatDate(ts);
}

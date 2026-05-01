import { Timestamp } from 'firebase/firestore';
import { ProfileIcon } from './ProfileIcon';
import { formatRelativeDate } from '../lib/format';
import type { Entry } from '../types/firestore';

interface EntryCardProps {
  entry: Entry;
  authorName?: string;
  authorEmail?: string;
}

export function EntryCard({ entry, authorName, authorEmail }: EntryCardProps) {
  return (
    <div className="entry-card">
      <div className="entry-card-header">
        <ProfileIcon
          name={authorName ?? entry.user_id.slice(0, 8)}
          email={authorEmail ?? entry.user_id}
          size="sm"
        />
        <div className="entry-card-meta">
          <span className="entry-card-author">{authorName ?? 'Unknown'}</span>
          <span className="entry-card-time">
            Round {entry.round_number + 1}
            {entry.created_at instanceof Timestamp && ` · ${formatRelativeDate(entry.created_at)}`}
          </span>
        </div>
      </div>
      <div className="entry-card-content">
        {entry.content}
      </div>
    </div>
  );
}

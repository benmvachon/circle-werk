import { Link } from 'react-router-dom';
import { Timestamp } from 'firebase/firestore';
import { ProfileIcon } from './ProfileIcon';
import { formatRelativeDate } from '../lib/format';
import type { Story } from '../types/firestore';

interface StoryCardProps {
  story: Story;
  ownerName?: string;
  ownerEmail?: string;
  currentUserId: string;
}

export function StoryCard({ story, ownerName, ownerEmail, currentUserId }: StoryCardProps) {
  const isOwner = story.owner_id === currentUserId;
  const statusClass = story.status === 'active' ? 'badge-primary' : 'badge-success';

  return (
    <Link to={`/stories/${story.id}`} className="story-card">
      <div className="story-card-header">
        <span className={`badge ${statusClass}`}>{story.status}</span>
        <span className="story-card-round">Round {story.current_round + 1}</span>
      </div>
      <div className="story-card-body">
        <span className="story-card-title">
          {story.title ?? (isOwner ? 'Your story' : `${ownerName ?? 'Unknown'}'s story`)}
        </span>
      </div>
      <div className="story-card-footer">
        <ProfileIcon
          name={ownerName ?? story.owner_id.slice(0, 8)}
          email={ownerEmail ?? story.owner_id}
          size="sm"
        />
        <span className="story-card-updated">
          {story.updated_at instanceof Timestamp
            ? formatRelativeDate(story.updated_at)
            : ''}
        </span>
      </div>
    </Link>
  );
}

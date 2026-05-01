import { Link } from 'react-router-dom';
import { Timestamp } from 'firebase/firestore';
import { formatCadence } from '../lib/format';
import { ProfileIcon } from './ProfileIcon';
import type { Circle } from '../types/firestore';

interface CircleCardProps {
  circle: Circle;
  currentUserId: string;
  memberProfiles: Map<string, { name: string; email: string }>;
  onEdit: (circle: Circle) => void;
}

export function CircleCard({ circle, currentUserId, memberProfiles, onEdit }: CircleCardProps) {
  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit(circle);
  };

  const startDate = circle.start_at instanceof Timestamp
    ? circle.start_at.toDate().toLocaleDateString()
    : '';

  return (
    <Link to={`/circles/${circle.id}`} className="circle-card">
      <div className="circle-card-header">
        <h3>{circle.name}</h3>
        {circle.created_by === currentUserId && (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleEditClick}
            aria-label="Edit circle name"
          >
            Edit
          </button>
        )}
      </div>
      <div className="circle-card-meta">
        <span>{circle.member_ids.length} members</span>
        <span>{formatCadence(circle.cadence_hours)} cadence</span>
        {startDate && <span>Started {startDate}</span>}
      </div>
      <div className="circle-card-members">
        {circle.member_ids.map((memberId) => {
          const profile = memberProfiles.get(memberId);
          return (
            <ProfileIcon
              key={memberId}
              name={profile?.name ?? memberId.slice(0, 8)}
              email={profile?.email ?? memberId}
              size="sm"
            />
          );
        })}
      </div>
    </Link>
  );
}

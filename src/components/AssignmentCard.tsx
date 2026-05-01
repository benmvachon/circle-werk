import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Timestamp } from 'firebase/firestore';
import { formatTimeRemaining, formatDate } from '../lib/format';
import type { Assignment } from '../types/firestore';

interface AssignmentCardProps {
  assignment: Assignment;
  circleName?: string;
  compact?: boolean;
}

export function AssignmentCard({ assignment, circleName, compact = false }: AssignmentCardProps) {
  const [now] = useState(() => Date.now());
  const isOverdue = !assignment.submitted && assignment.due_at instanceof Timestamp && assignment.due_at.toMillis() < now;
  const isPending = !assignment.submitted && !isOverdue;

  const statusClass = assignment.submitted ? 'badge-success' : isOverdue ? 'badge-error' : 'badge-warning';
  const statusLabel = assignment.submitted ? 'Submitted' : isOverdue ? 'Overdue' : 'Pending';

  return (
    <Link
      to={`/stories/${assignment.story_id}?round=${assignment.round_number}`}
      className={`assignment-card ${compact ? 'assignment-card-compact' : ''}`}
    >
      <div className="assignment-card-header">
        <span className={`badge ${statusClass}`}>{statusLabel}</span>
        {circleName && <span className="assignment-card-circle">{circleName}</span>}
      </div>
      <div className="assignment-card-body">
        <span className="assignment-card-round">Round {assignment.round_number + 1}</span>
        {!compact && (
          <span className="assignment-card-due">
            {assignment.submitted
              ? `Submitted ${assignment.submitted_at instanceof Timestamp ? formatDate(assignment.submitted_at) : ''}`
              : isPending
                ? formatTimeRemaining(assignment.due_at)
                : `Due ${formatDate(assignment.due_at)}`}
          </span>
        )}
      </div>
    </Link>
  );
}

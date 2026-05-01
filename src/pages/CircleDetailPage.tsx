import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Timestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { getCircle } from '../lib/circles';
import { getCircleStories } from '../lib/stories';
import { getUsersByIds } from '../lib/users';
import { formatCadence, formatDate } from '../lib/format';
import { ProfileIcon } from '../components/ProfileIcon';
import { StoryCard } from '../components/StoryCard';
import { EditCircleModal } from '../components/EditCircleModal';
import type { Circle, Story } from '../types/firestore';

export function CircleDetailPage() {
  const { circleId } = useParams<{ circleId: string }>();
  const { user } = useAuth();
  const [circle, setCircle] = useState<Circle | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [memberProfiles, setMemberProfiles] = useState<Map<string, { name: string; email: string }>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingCircle, setEditingCircle] = useState(false);

  useEffect(() => {
    if (!user || !circleId) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const [c, s] = await Promise.all([
          getCircle(circleId!),
          getCircleStories(circleId!),
        ]);
        if (cancelled) return;
        if (!c) {
          setError('Circle not found');
          setLoading(false);
          return;
        }
        setCircle(c);
        setStories(s);

        const users = await getUsersByIds(c.member_ids);
        if (cancelled) return;
        const profiles = new Map<string, { name: string; email: string }>();
        users.forEach((u, id) => profiles.set(id, { name: u.name, email: u.email }));
        setMemberProfiles(profiles);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load circle');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [user, circleId]);

  const handleCircleRenamed = (_id: string, newName: string) => {
    setCircle((prev) => prev ? { ...prev, name: newName } : prev);
    setEditingCircle(false);
  };

  if (!user) return null;

  if (loading) {
    return <div className="loading-screen"><p>Loading circle...</p></div>;
  }

  if (error || !circle) {
    return (
      <div className="circle-detail-page">
        <div className="error-inline">{error || 'Circle not found'}</div>
        <Link to="/circles" className="btn btn-secondary">Back to Circles</Link>
      </div>
    );
  }

  const isCreator = circle.created_by === user.uid;
  const activeStories = stories.filter((s) => s.status === 'active');
  const completedStories = stories.filter((s) => s.status === 'complete');

  return (
    <div className="circle-detail-page">
      <Link to="/circles" className="back-link">&larr; Back to Circles</Link>

      <div className="page-header">
        <h1>{circle.name}</h1>
        {isCreator && (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setEditingCircle(true)}
          >
            Rename
          </button>
        )}
      </div>

      <div className="circle-detail-meta">
        <div className="meta-item">
          <span className="meta-label">Cadence</span>
          <span className="meta-value">{formatCadence(circle.cadence_hours)}</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Members</span>
          <span className="meta-value">{circle.member_ids.length}</span>
        </div>
        {circle.start_at instanceof Timestamp && (
          <div className="meta-item">
            <span className="meta-label">Started</span>
            <span className="meta-value">{formatDate(circle.start_at)}</span>
          </div>
        )}
      </div>

      <div className="circle-detail-section">
        <h2>Members</h2>
        <div className="member-tags">
          {circle.member_ids.map((id) => {
            const profile = memberProfiles.get(id);
            return (
              <ProfileIcon
                key={id}
                name={profile?.name ?? id.slice(0, 8)}
                email={profile?.email ?? id}
                size="sm"
              />
            );
          })}
        </div>
      </div>

      <div className="circle-detail-section">
        <h2>Active Stories ({activeStories.length})</h2>
        {activeStories.length === 0 ? (
          <p className="text-muted">No active stories.</p>
        ) : (
          <div className="stories-grid">
            {activeStories.map((s) => {
              const owner = memberProfiles.get(s.owner_id);
              return (
                <StoryCard
                  key={s.id}
                  story={s}
                  ownerName={owner?.name}
                  ownerEmail={owner?.email}
                  currentUserId={user.uid}
                />
              );
            })}
          </div>
        )}
      </div>

      {completedStories.length > 0 && (
        <div className="circle-detail-section">
          <h2>Completed Stories ({completedStories.length})</h2>
          <div className="stories-grid">
            {completedStories.map((s) => {
              const owner = memberProfiles.get(s.owner_id);
              return (
                <StoryCard
                  key={s.id}
                  story={s}
                  ownerName={owner?.name}
                  ownerEmail={owner?.email}
                  currentUserId={user.uid}
                />
              );
            })}
          </div>
        </div>
      )}

      {editingCircle && (
        <EditCircleModal
          circle={circle}
          onClose={() => setEditingCircle(false)}
          onUpdated={handleCircleRenamed}
        />
      )}
    </div>
  );
}

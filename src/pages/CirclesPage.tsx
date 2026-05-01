import { useEffect, useState } from 'react';
import { Timestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { getUserCircles } from '../lib/circles';
import { getUsersByIds } from '../lib/users';
import { CircleCard } from '../components/CircleCard';
import { CreateCircleModal } from '../components/CreateCircleModal';
import { EditCircleModal } from '../components/EditCircleModal';
import type { Circle } from '../types/firestore';

export function CirclesPage() {
  const { user } = useAuth();
  const [circles, setCircles] = useState<Circle[]>([]);
  const [memberProfiles, setMemberProfiles] = useState<Map<string, { name: string; email: string }>>(new Map());
  const [currentUserName, setCurrentUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCircle, setEditingCircle] = useState<Circle | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    async function fetchCircles() {
      setLoading(true);
      setError('');
      try {
        const data = await getUserCircles(user!.uid);
        if (cancelled) return;
        data.sort((a, b) => {
          const aTime = a.created_at instanceof Timestamp ? a.created_at.toMillis() : 0;
          const bTime = b.created_at instanceof Timestamp ? b.created_at.toMillis() : 0;
          return bTime - aTime;
        });
        setCircles(data);

        const allMemberIds = new Set<string>();
        data.forEach((c) => c.member_ids.forEach((id) => allMemberIds.add(id)));
        if (allMemberIds.size > 0) {
          const users = await getUsersByIds([...allMemberIds]);
          if (cancelled) return;
          const profiles = new Map<string, { name: string; email: string }>();
          users.forEach((u, id) => profiles.set(id, { name: u.name, email: u.email }));
          setMemberProfiles(profiles);
          const self = users.get(user!.uid);
          if (self) setCurrentUserName(self.name);
        }
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load circles');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchCircles();
    return () => { cancelled = true; };
  }, [user]);

  const handleCircleCreated = (circle: Circle) => {
    setCircles((prev) => [circle, ...prev]);
    setShowCreateModal(false);
  };

  const handleCircleRenamed = (circleId: string, newName: string) => {
    setCircles((prev) =>
      prev.map((c) => (c.id === circleId ? { ...c, name: newName } : c))
    );
    setEditingCircle(null);
  };

  if (!user) return null;

  return (
    <div className="circles-page">
      <div className="page-header">
        <h1>My Circles</h1>
        <button
          type="button"
          className="btn"
          onClick={() => setShowCreateModal(true)}
        >
          + New Circle
        </button>
      </div>

      {error && <div className="error-inline">{error}</div>}

      {loading ? (
        <div className="loading-screen">
          <p>Loading circles...</p>
        </div>
      ) : circles.length === 0 ? (
        <div className="empty-state">
          <h3>No circles yet</h3>
          <p>Create your first writing circle to get started.</p>
          <button
            type="button"
            className="btn"
            onClick={() => setShowCreateModal(true)}
          >
            Create a Circle
          </button>
        </div>
      ) : (
        <div className="circles-grid">
          {circles.map((circle) => (
            <CircleCard
              key={circle.id}
              circle={circle}
              currentUserId={user.uid}
              memberProfiles={memberProfiles}
              onEdit={setEditingCircle}
            />
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateCircleModal
          currentUserId={user.uid}
          currentUserEmail={user.email ?? user.uid}
          currentUserName={currentUserName || user.displayName || 'You'}
          onClose={() => setShowCreateModal(false)}
          onCreated={handleCircleCreated}
        />
      )}

      {editingCircle && (
        <EditCircleModal
          circle={editingCircle}
          onClose={() => setEditingCircle(null)}
          onUpdated={handleCircleRenamed}
        />
      )}
    </div>
  );
}

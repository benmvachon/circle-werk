import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserAssignments } from '../lib/assignments';
import { getUserCircles } from '../lib/circles';
import { AssignmentCard } from '../components/AssignmentCard';
import type { Assignment, Circle } from '../types/firestore';

type Tab = 'active' | 'completed';

interface CategorizedAssignments {
  active: Assignment[];
  completed: Assignment[];
  overdue: Assignment[];
  pending: Assignment[];
}

function categorize(assignments: Assignment[]): CategorizedAssignments {
  const now = Date.now();
  const active = assignments.filter((a) => !a.submitted);
  const completed = assignments.filter((a) => a.submitted);
  const overdue = active.filter((a) => a.due_at.toMillis() < now);
  const pending = active.filter((a) => a.due_at.toMillis() >= now);
  return { active, completed, overdue, pending };
}

export function AssignmentsPage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<CategorizedAssignments>({ active: [], completed: [], overdue: [], pending: [] });
  const [circleNames, setCircleNames] = useState<Map<string, string>>(new Map());
  const [tab, setTab] = useState<Tab>('active');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const [allAssignments, circles] = await Promise.all([
          getUserAssignments(user!.uid),
          getUserCircles(user!.uid),
        ]);
        if (cancelled) return;
        setCategories(categorize(allAssignments));
        const names = new Map<string, string>();
        circles.forEach((c: Circle) => names.set(c.id, c.name));
        setCircleNames(names);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load assignments');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [user]);

  const { active, completed, overdue, pending } = categories;

  if (!user) return null;

  return (
    <div className="assignments-page">
      <div className="page-header">
        <h1>My Assignments</h1>
      </div>

      <div className="tabs">
        <button
          type="button"
          className={`tab ${tab === 'active' ? 'tab-active' : ''}`}
          onClick={() => setTab('active')}
        >
          Active ({active.length})
        </button>
        <button
          type="button"
          className={`tab ${tab === 'completed' ? 'tab-active' : ''}`}
          onClick={() => setTab('completed')}
        >
          Completed ({completed.length})
        </button>
      </div>

      {error && <div className="error-inline">{error}</div>}

      {loading ? (
        <div className="loading-screen"><p>Loading assignments...</p></div>
      ) : tab === 'active' ? (
        active.length === 0 ? (
          <div className="empty-state">
            <h3>No active assignments</h3>
            <p>You're all caught up!</p>
          </div>
        ) : (
          <>
            {overdue.length > 0 && (
              <div className="assignment-section">
                <h3 className="section-heading section-heading-error">Overdue ({overdue.length})</h3>
                <div className="assignment-list">
                  {overdue.map((a) => (
                    <AssignmentCard key={a.id} assignment={a} circleName={circleNames.get(a.circle_id)} />
                  ))}
                </div>
              </div>
            )}
            {pending.length > 0 && (
              <div className="assignment-section">
                <h3 className="section-heading">Pending ({pending.length})</h3>
                <div className="assignment-list">
                  {pending.map((a) => (
                    <AssignmentCard key={a.id} assignment={a} circleName={circleNames.get(a.circle_id)} />
                  ))}
                </div>
              </div>
            )}
          </>
        )
      ) : completed.length === 0 ? (
        <div className="empty-state">
          <h3>No completed assignments</h3>
          <p>Completed assignments will appear here.</p>
        </div>
      ) : (
        <div className="assignment-list">
          {completed.map((a) => (
            <AssignmentCard key={a.id} assignment={a} circleName={circleNames.get(a.circle_id)} />
          ))}
        </div>
      )}
    </div>
  );
}

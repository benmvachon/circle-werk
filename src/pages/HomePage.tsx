import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserCircles } from '../lib/circles';
import { getUserAssignments } from '../lib/assignments';
import { getUserStories } from '../lib/stories';
import { AssignmentCard } from '../components/AssignmentCard';
import { CircleCard } from '../components/CircleCard';
import { getUsersByIds } from '../lib/users';
import type { Circle, Assignment } from '../types/firestore';

interface DashboardData {
  circles: Circle[];
  activeAssignments: Assignment[];
  overdueAssignments: Assignment[];
  totalStories: number;
  completedAssignments: number;
  circleNames: Map<string, string>;
  memberProfiles: Map<string, { name: string; email: string }>;
}

function emptyDashboard(): DashboardData {
  return {
    circles: [],
    activeAssignments: [],
    overdueAssignments: [],
    totalStories: 0,
    completedAssignments: 0,
    circleNames: new Map(),
    memberProfiles: new Map(),
  };
}

export function HomePage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData>(emptyDashboard);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const [circles, assignments, stories] = await Promise.all([
          getUserCircles(user!.uid),
          getUserAssignments(user!.uid),
          getUserStories(user!.uid),
        ]);
        if (cancelled) return;

        const now = Date.now();
        const active = assignments.filter((a) => !a.submitted);
        const overdue = active.filter((a) => a.due_at.toMillis() < now);
        const completed = assignments.filter((a) => a.submitted);

        const names = new Map<string, string>();
        circles.forEach((c) => names.set(c.id, c.name));

        const allMemberIds = new Set<string>();
        circles.forEach((c) => c.member_ids.forEach((id) => allMemberIds.add(id)));
        const memberProfiles = new Map<string, { name: string; email: string }>();
        if (allMemberIds.size > 0) {
          const users = await getUsersByIds([...allMemberIds]);
          if (cancelled) return;
          users.forEach((u, id) => memberProfiles.set(id, { name: u.name, email: u.email }));
        }

        setData({
          circles,
          activeAssignments: active,
          overdueAssignments: overdue,
          totalStories: stories.length,
          completedAssignments: completed.length,
          circleNames: names,
          memberProfiles,
        });
      } catch {
        // Silently fail on dashboard — individual pages will show errors
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [user]);

  if (!user) return null;

  if (loading) {
    return <div className="loading-screen"><p>Loading dashboard...</p></div>;
  }

  const { circles, activeAssignments, overdueAssignments, totalStories, completedAssignments, circleNames, memberProfiles } = data;

  return (
    <div className="home-page">
      <div className="page-header">
        <h1>Welcome back{user.displayName ? `, ${user.displayName}` : ''}</h1>
      </div>

      <div className="dashboard-stats">
        <Link to="/circles" className="stat-card">
          <span className="stat-value">{circles.length}</span>
          <span className="stat-label">Circles</span>
        </Link>
        <Link to="/assignments" className="stat-card">
          <span className="stat-value">{activeAssignments.length}</span>
          <span className="stat-label">Active Assignments</span>
        </Link>
        <div className="stat-card">
          <span className="stat-value">{totalStories}</span>
          <span className="stat-label">Stories</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{completedAssignments}</span>
          <span className="stat-label">Submitted</span>
        </div>
      </div>

      {overdueAssignments.length > 0 && (
        <div className="dashboard-section">
          <div className="section-header">
            <h2 className="section-heading section-heading-error">Overdue ({overdueAssignments.length})</h2>
            <Link to="/assignments" className="section-link">View all</Link>
          </div>
          <div className="assignment-list">
            {overdueAssignments.slice(0, 3).map((a) => (
              <AssignmentCard key={a.id} assignment={a} circleName={circleNames.get(a.circle_id)} />
            ))}
          </div>
        </div>
      )}

      {activeAssignments.length > 0 && (
        <div className="dashboard-section">
          <div className="section-header">
            <h2 className="section-heading">Upcoming Assignments</h2>
            <Link to="/assignments" className="section-link">View all</Link>
          </div>
          <div className="assignment-list">
            {activeAssignments
              .filter((a) => !overdueAssignments.includes(a))
              .slice(0, 3)
              .map((a) => (
                <AssignmentCard key={a.id} assignment={a} circleName={circleNames.get(a.circle_id)} />
              ))}
          </div>
        </div>
      )}

      {circles.length > 0 && (
        <div className="dashboard-section">
          <div className="section-header">
            <h2 className="section-heading">My Circles</h2>
            <Link to="/circles" className="section-link">View all</Link>
          </div>
          <div className="circles-grid">
            {circles.slice(0, 3).map((circle) => (
              <CircleCard
                key={circle.id}
                circle={circle}
                currentUserId={user.uid}
                memberProfiles={memberProfiles}
                onEdit={() => {}}
              />
            ))}
          </div>
        </div>
      )}

      {circles.length === 0 && activeAssignments.length === 0 && (
        <div className="empty-state">
          <h3>Getting started</h3>
          <p>Join or create your first writing circle to begin collaborating.</p>
          <Link to="/circles" className="btn">Go to Circles</Link>
        </div>
      )}
    </div>
  );
}

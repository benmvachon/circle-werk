import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Timestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { getStory } from '../lib/stories';
import { getStoryEntries } from '../lib/entries';
import { getStoryAssignments } from '../lib/assignments';
import { getCircle } from '../lib/circles';
import { getUsersByIds } from '../lib/users';
import { submitEntryAndRotate } from '../lib/rotation-engine';
import { EntryCard } from '../components/EntryCard';
import type { Story, Entry, Assignment, Circle } from '../types/firestore';

export function StoryDetailPage() {
  const { storyId } = useParams<{ storyId: string }>();
  const { user } = useAuth();
  const [story, setStory] = useState<Story | null>(null);
  const [circle, setCircle] = useState<Circle | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [profiles, setProfiles] = useState<Map<string, { name: string; email: string }>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Entry submission state
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (!user || !storyId) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const s = await getStory(storyId!);
        if (cancelled) return;
        if (!s) {
          setError('Story not found');
          setLoading(false);
          return;
        }
        setStory(s);

        const [e, a, c] = await Promise.all([
          getStoryEntries(storyId!),
          getStoryAssignments(storyId!),
          getCircle(s.circle_id),
        ]);
        if (cancelled) return;
        setEntries(e);
        setAssignments(a);
        setCircle(c);

        if (c) {
          const users = await getUsersByIds(c.member_ids);
          if (cancelled) return;
          const p = new Map<string, { name: string; email: string }>();
          users.forEach((u, id) => p.set(id, { name: u.name, email: u.email }));
          setProfiles(p);
        }
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load story');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [user, storyId]);

  const currentAssignment = assignments.find(
    (a) => a.user_id === user?.uid && !a.submitted && a.round_number === story?.current_round
  );

  const canSubmit = !!currentAssignment && !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !story || !currentAssignment) return;
    setSubmitError('');

    if (!content.trim()) {
      setSubmitError('Entry cannot be empty');
      return;
    }
    if (content.length > 1200) {
      setSubmitError('Entry must be 1200 characters or less');
      return;
    }

    setSubmitting(true);
    try {
      const result = await submitEntryAndRotate(
        user.uid,
        story.id,
        currentAssignment.round_number,
        content.trim(),
      );
      if (!result.success) {
        setSubmitError(result.error ?? 'Failed to submit entry');
        return;
      }
      // Reload
      const [newEntries, newAssignments, newStory] = await Promise.all([
        getStoryEntries(story.id),
        getStoryAssignments(story.id),
        getStory(story.id),
      ]);
      setEntries(newEntries);
      setAssignments(newAssignments);
      if (newStory) setStory(newStory);
      setContent('');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  if (loading) {
    return <div className="loading-screen"><p>Loading story...</p></div>;
  }

  if (error || !story) {
    return (
      <div className="story-detail-page">
        <div className="error-inline">{error || 'Story not found'}</div>
        <Link to="/circles" className="btn btn-secondary">Back to Circles</Link>
      </div>
    );
  }

  const ownerProfile = profiles.get(story.owner_id);
  const isOwner = story.owner_id === user.uid;

  return (
    <div className="story-detail-page">
      {circle && (
        <Link to={`/circles/${circle.id}`} className="back-link">
          &larr; Back to {circle.name}
        </Link>
      )}

      <div className="page-header">
        <h1>{story.title ?? (isOwner ? 'Your Story' : `${ownerProfile?.name ?? 'Unknown'}'s Story`)}</h1>
        <span className={`badge ${story.status === 'active' ? 'badge-primary' : 'badge-success'}`}>
          {story.status}
        </span>
      </div>

      <div className="story-detail-meta">
        <span>Round {story.current_round + 1}</span>
        <span>{entries.length} {entries.length === 1 ? 'entry' : 'entries'}</span>
        {story.created_at instanceof Timestamp && (
          <span>Started {story.created_at.toDate().toLocaleDateString()}</span>
        )}
      </div>

      <div className="story-entries">
        <h2>Entries</h2>
        {entries.length === 0 ? (
          <p className="text-muted">No entries yet. The story is waiting for its first contribution.</p>
        ) : (
          <div className="entries-list">
            {entries.map((entry) => {
              const author = profiles.get(entry.user_id);
              return (
                <EntryCard
                  key={entry.id}
                  entry={entry}
                  authorName={author?.name}
                  authorEmail={author?.email}
                />
              );
            })}
          </div>
        )}
      </div>

      {canSubmit && (
        <div className="story-submit">
          <h2>Your Turn</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="entry-content">
                Continue the story (max 1200 characters)
              </label>
              <textarea
                id="entry-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your entry..."
                rows={6}
                maxLength={1200}
                disabled={submitting}
              />
              <span className="help-text">{content.length}/1200</span>
            </div>
            {submitError && <div className="error-inline">{submitError}</div>}
            <button type="submit" className="btn" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Entry'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUser, updateUserNotificationPreferences } from '../lib/users';
import { ProfileIcon } from '../components/ProfileIcon';
import type { User } from '../types/firestore';

export function ProfilePage() {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Notification pref state
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [reminderHours, setReminderHours] = useState(24);

  useEffect(() => {
    if (!authUser) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const u = await getUser(authUser!.uid);
        if (cancelled) return;
        if (u) {
          setProfile(u);
          setEmailEnabled(u.notification_preferences.email_enabled);
          setPushEnabled(u.notification_preferences.push_enabled);
          setReminderHours(u.notification_preferences.reminder_hours_before_deadline);
        }
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [authUser]);

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUser) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await updateUserNotificationPreferences(authUser.uid, {
        email_enabled: emailEnabled,
        push_enabled: pushEnabled,
        reminder_hours_before_deadline: reminderHours,
      });
      setSuccess('Preferences saved');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  if (!authUser) return null;

  if (loading) {
    return <div className="loading-screen"><p>Loading profile...</p></div>;
  }

  return (
    <div className="profile-page">
      <h1>Profile</h1>

      <div className="profile-header">
        <ProfileIcon
          name={profile?.name ?? authUser.displayName ?? 'You'}
          email={profile?.email ?? authUser.email ?? ''}
          size="lg"
          hoverable={false}
        />
        <div className="profile-info">
          <h2>{profile?.name ?? authUser.displayName ?? 'Unknown'}</h2>
          <p className="text-muted">{profile?.email ?? authUser.email}</p>
        </div>
      </div>

      <div className="profile-section">
        <h2>Notification Preferences</h2>
        <form onSubmit={handleSavePreferences}>
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={emailEnabled}
                onChange={(e) => setEmailEnabled(e.target.checked)}
                disabled={saving}
              />
              Email notifications
            </label>
          </div>
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={pushEnabled}
                onChange={(e) => setPushEnabled(e.target.checked)}
                disabled={saving}
              />
              Push notifications
            </label>
          </div>
          <div className="form-group">
            <label htmlFor="reminder-hours">Reminder (hours before deadline)</label>
            <select
              id="reminder-hours"
              value={reminderHours}
              onChange={(e) => setReminderHours(Number(e.target.value))}
              disabled={saving}
            >
              <option value={6}>6 hours</option>
              <option value={12}>12 hours</option>
              <option value={24}>24 hours</option>
              <option value={48}>48 hours</option>
            </select>
          </div>

          {error && <div className="error-inline">{error}</div>}
          {success && <div className="success-inline">{success}</div>}

          <button type="submit" className="btn" disabled={saving}>
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </form>
      </div>
    </div>
  );
}

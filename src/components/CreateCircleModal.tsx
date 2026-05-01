import { useState } from 'react';
import { createCircle } from '../lib/circles';
import { generateId } from '../lib/format';
import { Modal } from './Modal';
import { CircleFormFields, type CircleMember } from './CircleModal';
import type { Circle, User } from '../types/firestore';

interface CreateCircleModalProps {
  currentUserId: string;
  currentUserEmail: string;
  currentUserName: string;
  onClose: () => void;
  onCreated: (circle: Circle) => void;
}

export function CreateCircleModal({
  currentUserId,
  currentUserEmail,
  currentUserName,
  onClose,
  onCreated,
}: CreateCircleModalProps) {
  const [name, setName] = useState('');
  const [cadenceHours, setCadenceHours] = useState(48);
  const [members, setMembers] = useState<CircleMember[]>([
    { id: currentUserId, name: currentUserName, email: currentUserEmail },
  ]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const addMember = (user: User) => {
    if (members.some((m) => m.id === user.id)) return;
    setMembers((prev) => [...prev, { id: user.id, name: user.name, email: user.email }]);
    setError('');
  };

  const removeMember = (id: string) => {
    if (id === currentUserId) return;
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Circle name is required');
      return;
    }
    if (members.length < 6) {
      setError(`Need at least 6 members (currently ${members.length})`);
      return;
    }
    if (members.length > 8) {
      setError(`Maximum 8 members allowed (currently ${members.length})`);
      return;
    }

    setLoading(true);
    try {
      const circle = await createCircle(generateId(), {
        name: name.trim(),
        cadence_hours: cadenceHours,
        member_ids: members.map((m) => m.id),
        created_by: currentUserId,
      });
      onCreated(circle);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create circle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Create Circle" onClose={onClose} footer={
      <>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          form="create-circle-form"
          className="btn"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Circle'}
        </button>
      </>
    }>
      <form id="create-circle-form" onSubmit={handleSubmit}>
        <CircleFormFields
          name={name}
          onNameChange={setName}
          cadenceHours={cadenceHours}
          onCadenceChange={setCadenceHours}
          members={members}
          currentUserId={currentUserId}
          onAddMember={addMember}
          onRemoveMember={removeMember}
          disabled={loading}
        />
        {error && <div className="error-inline">{error}</div>}
      </form>
    </Modal>
  );
}

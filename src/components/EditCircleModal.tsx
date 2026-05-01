import { useState } from 'react';
import { updateCircleName } from '../lib/circles';
import { Modal } from './Modal';
import type { Circle } from '../types/firestore';

interface EditCircleModalProps {
  circle: Circle;
  onClose: () => void;
  onUpdated: (circleId: string, newName: string) => void;
}

export function EditCircleModal({ circle, onClose, onUpdated }: EditCircleModalProps) {
  const [name, setName] = useState(circle.name);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmed = name.trim();
    if (!trimmed) {
      setError('Circle name is required');
      return;
    }
    if (trimmed === circle.name) {
      onClose();
      return;
    }

    setLoading(true);
    try {
      await updateCircleName(circle.id, trimmed);
      onUpdated(circle.id, trimmed);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update name');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Rename Circle" onClose={onClose} footer={
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
          form="edit-circle-form"
          className="btn"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save'}
        </button>
      </>
    }>
      <form id="edit-circle-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="edit-circle-name">Circle Name</label>
          <input
            id="edit-circle-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            autoFocus
          />
        </div>
        {error && <div className="error-inline">{error}</div>}
      </form>
    </Modal>
  );
}

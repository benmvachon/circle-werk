import { ProfileIcon } from './ProfileIcon';
import { MemberSearch } from './MemberSearch';
import type { User } from '../types/firestore';

export interface CircleMember {
  id: string;
  name: string;
  email: string;
}

interface CircleFormFieldsProps {
  name: string;
  onNameChange: (value: string) => void;
  cadenceHours: number;
  onCadenceChange: (value: number) => void;
  members: CircleMember[];
  currentUserId: string;
  onAddMember: (user: User) => void;
  onRemoveMember: (id: string) => void;
  disabled?: boolean;
  showCadence?: boolean;
  showMembers?: boolean;
}

export function CircleFormFields({
  name,
  onNameChange,
  cadenceHours,
  onCadenceChange,
  members,
  currentUserId,
  onAddMember,
  onRemoveMember,
  disabled = false,
  showCadence = true,
  showMembers = true,
}: CircleFormFieldsProps) {
  const memberIds = new Set(members.map((m) => m.id));

  return (
    <>
      <div className="form-group">
        <label htmlFor="circle-name">Circle Name</label>
        <input
          id="circle-name"
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="e.g. The Inkwell"
          disabled={disabled}
          autoFocus
        />
      </div>

      {showCadence && (
        <div className="form-group">
          <label htmlFor="cadence">Writing Cadence</label>
          <select
            id="cadence"
            value={cadenceHours}
            onChange={(e) => onCadenceChange(Number(e.target.value))}
            disabled={disabled}
          >
            <option value={24}>Every 24 hours</option>
            <option value={48}>Every 48 hours (default)</option>
            <option value={72}>Every 72 hours</option>
            <option value={96}>Every 4 days</option>
            <option value={168}>Every 7 days</option>
          </select>
          <span className="help-text">
            How long each writer has to submit their entry.
          </span>
        </div>
      )}

      {showMembers && (
        <div className="form-group">
          <label>Members ({members.length}/8)</label>
          <div className="member-tags">
            {members.map((member) => (
              <ProfileIcon
                key={member.id}
                name={member.name}
                email={member.email}
                size="sm"
                onRemove={member.id !== currentUserId ? () => onRemoveMember(member.id) : undefined}
              />
            ))}
          </div>
          {members.length < 8 && (
            <MemberSearch
              excludeIds={memberIds}
              disabled={disabled}
              onSelect={onAddMember}
            />
          )}
          <span className="help-text">
            Search and add 6–8 members by name or email. You are added automatically.
          </span>
        </div>
      )}
    </>
  );
}

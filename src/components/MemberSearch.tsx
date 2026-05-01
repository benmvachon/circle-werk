import { useCallback } from 'react';
import { searchUsers } from '../lib/users';
import { SearchInput } from './SearchInput';
import type { User } from '../types/firestore';

interface MemberSearchProps {
  excludeIds: Set<string>;
  disabled?: boolean;
  onSelect: (user: User) => void;
}

export function MemberSearch({ excludeIds, disabled = false, onSelect }: MemberSearchProps) {
  const handleSearch = useCallback(
    async (query: string) => {
      const found = await searchUsers(query);
      return found.filter((u) => !excludeIds.has(u.id));
    },
    [excludeIds]
  );

  return (
    <SearchInput<User>
      onSearch={handleSearch}
      onSelect={onSelect}
      renderItem={(user) => (
        <>
          <span className="search-item-name">{user.name}</span>
          <span className="search-item-email">{user.email}</span>
        </>
      )}
      getItemKey={(user) => user.id}
      placeholder="Search by name or email..."
      disabled={disabled}
      emptyMessage="No users found"
      className="member-search"
    />
  );
}

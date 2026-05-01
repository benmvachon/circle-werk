import { useState, useRef, useEffect, type ReactNode } from 'react';

interface SearchInputProps<T> {
  onSearch: (query: string) => Promise<T[]>;
  onSelect: (item: T) => void;
  renderItem: (item: T) => ReactNode;
  getItemKey: (item: T) => string;
  placeholder?: string;
  disabled?: boolean;
  debounceMs?: number;
  emptyMessage?: string;
  loadingMessage?: string;
  className?: string;
}

export function SearchInput<T>({
  onSearch,
  onSelect,
  renderItem,
  getItemKey,
  placeholder = 'Search...',
  disabled = false,
  debounceMs = 300,
  emptyMessage = 'No results found',
  loadingMessage = 'Searching...',
  className = '',
}: SearchInputProps<T>) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<T[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (value: string) => {
    setQuery(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!value.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const found = await onSearch(value.trim());
        setResults(found);
        setShowResults(true);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, debounceMs);
  };

  const handleSelect = (item: T) => {
    onSelect(item);
    setQuery('');
    setResults([]);
    setShowResults(false);
  };

  return (
    <div className={`search-input ${className}`} ref={containerRef}>
      <input
        type="text"
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => { if (results.length > 0) setShowResults(true); }}
        placeholder={placeholder}
        disabled={disabled}
      />
      {showResults && (
        <div className="search-input-results">
          {searching ? (
            <div className="search-input-loading">{loadingMessage}</div>
          ) : results.length === 0 ? (
            <div className="search-input-empty">{emptyMessage}</div>
          ) : (
            results.map((item) => (
              <button
                key={getItemKey(item)}
                type="button"
                className="search-input-item"
                onClick={() => handleSelect(item)}
              >
                {renderItem(item)}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

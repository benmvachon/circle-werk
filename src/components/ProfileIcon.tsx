import { useState, useRef, useEffect } from 'react';

interface ProfileIconProps {
  name: string;
  email: string;
  hoverable?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onRemove?: () => void;
  onClick?: () => void;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
}

const COLOR_CLASSES = [
  'profile-color-mocha',
  'profile-color-mauve',
  'profile-color-cerulean',
  'profile-color-indigo',
  'profile-color-grey',
  'profile-color-mint',
  'profile-color-orange',
];

function pickColorClass(name: string): string {
  const index = Math.abs(hashCode(name)) % COLOR_CLASSES.length;
  return COLOR_CLASSES[index];
}

export function ProfileIcon({ name, email, hoverable = true, size = 'md', onRemove, onClick }: ProfileIconProps) {
  const [showPopover, setShowPopover] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const initials = getInitials(name);
  const colorClass = pickColorClass(name);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setShowPopover(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setShowPopover(false), 150);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (!showPopover || !popoverRef.current || !containerRef.current) return;

    const popover = popoverRef.current;
    const rect = popover.getBoundingClientRect();

    if (rect.right > window.innerWidth) {
      popover.style.left = 'auto';
      popover.style.right = '0';
    }
    if (rect.left < 0) {
      popover.style.left = '0';
      popover.style.right = 'auto';
    }
  }, [showPopover]);

  return (
    <div
      className={`profile-icon-wrapper profile-icon-${size} ${onClick ? 'profile-icon-clickable' : ''}`}
      ref={containerRef}
      onMouseEnter={hoverable ? handleMouseEnter : undefined}
      onMouseLeave={hoverable ? handleMouseLeave : undefined}
      onClick={onClick}
    >
      <div
        className={`profile-icon ${colorClass}`}
        aria-label={name}
      >
        {initials}
      </div>
      {onRemove && (
        <button
          type="button"
          className="profile-icon-remove"
          onClick={onRemove}
          aria-label={`Remove ${name}`}
        >
          &times;
        </button>
      )}
      {showPopover && (
        <div className="profile-icon-popover" ref={popoverRef}>
          <div
            className={`profile-icon profile-icon-popover-avatar ${colorClass}`}
          >
            {initials}
          </div>
          <div className="profile-icon-popover-details">
            <span className="profile-icon-popover-name">{name}</span>
            <span className="profile-icon-popover-email">{email}</span>
          </div>
        </div>
      )}
    </div>
  );
}

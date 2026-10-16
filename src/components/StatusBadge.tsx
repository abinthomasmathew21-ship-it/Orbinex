import React from 'react';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  let badgeStyles = 'bg-neutral-100 text-neutral-700 border-neutral-200';

  const s = status.toLowerCase();
  if (s === 'available' || s === 'completed' || s === 'delivered' || s === 'active') {
    badgeStyles = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (s === 'pending') {
    badgeStyles = 'bg-amber-50 text-amber-800 border-amber-200';
  } else if (s === 'accepted' || s === 'preparing') {
    badgeStyles = 'bg-sky-50 text-sky-800 border-sky-200';
  } else if (s === 'vehicle assigned' || s === 'out for delivery') {
    badgeStyles = 'bg-orange-50 text-orange-800 border-orange-200';
  } else if (s === 'in transit') {
    badgeStyles = 'bg-blue-50 text-blue-800 border-blue-200';
  } else if (s === 'unavailable' || s === 'cancelled' || s === 'inactive' || s === 'maintenance') {
    badgeStyles = 'bg-neutral-100 text-neutral-600 border-neutral-300';
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${badgeStyles} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-70" />
      {status}
    </span>
  );
};

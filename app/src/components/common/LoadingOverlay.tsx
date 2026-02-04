/**
 * LoadingOverlay Component
 * 
 * Full-page loading overlay that doesn't block interaction unnecessarily.
 * Can be used as a fixed overlay over the entire viewport or positioned
 * relative to a container.
 * 
 * Task: AE-47 - Loading states and optimistic updates
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from './LoadingSpinner';

export interface LoadingOverlayProps {
  /** Whether the overlay is visible */
  isLoading: boolean;
  /** Text to display under the spinner */
  text?: string;
  /** Whether to use fixed positioning (covers entire viewport) */
  fixed?: boolean;
  /** Whether to show a semi-transparent backdrop */
  backdrop?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export function LoadingOverlay({
  isLoading,
  text = 'Loading...',
  fixed = false,
  backdrop = true,
  className,
}: LoadingOverlayProps) {
  if (!isLoading) return null;

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center z-50',
        fixed ? 'fixed inset-0' : 'absolute inset-0',
        backdrop && 'bg-white/80 backdrop-blur-sm',
        className
      )}
      role="status"
      aria-live="polite"
      aria-busy={isLoading}
    >
      <LoadingSpinner size="lg" variant="primary" aria-label={text} />
      {text && (
        <p className="mt-4 text-sm font-medium text-gray-700">{text}</p>
      )}
    </div>
  );
}

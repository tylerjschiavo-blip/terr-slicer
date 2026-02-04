/**
 * Reusable Tooltip component using Radix UI
 * Provides accessible, customizable tooltips for the application
 */

import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';

interface TooltipProps {
  /** Content to show in the tooltip */
  content: React.ReactNode;
  /** Element that triggers the tooltip */
  children: React.ReactNode;
  /** Side where tooltip appears relative to trigger */
  side?: 'top' | 'right' | 'bottom' | 'left';
  /** Alignment of tooltip relative to trigger */
  align?: 'start' | 'center' | 'end';
  /** Delay before showing tooltip (in ms) */
  delayDuration?: number;
  /** Additional CSS classes for the tooltip content */
  className?: string;
}

/**
 * Tooltip component with consistent styling and behavior
 * 
 * @example
 * ```tsx
 * <Tooltip content="This explains the feature">
 *   <button>Hover me</button>
 * </Tooltip>
 * ```
 */
export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  side = 'top',
  align = 'center',
  delayDuration = 200,
  className = '',
}) => {
  return (
    <TooltipPrimitive.Provider delayDuration={delayDuration}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>
          {children}
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={side}
            align={align}
            className={`
              z-50 overflow-hidden rounded-md bg-slate-900 px-3 py-2
              text-sm text-slate-50 shadow-md animate-in fade-in-0
              zoom-in-95 max-w-xs
              ${className}
            `}
            sideOffset={5}
          >
            {content}
            <TooltipPrimitive.Arrow className="fill-slate-900" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
};

/**
 * Info icon component to use as tooltip trigger
 * Provides a consistent visual indicator for tooltips
 */
export const InfoIcon: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={`w-4 h-4 inline-block text-slate-500 hover:text-slate-700 cursor-help ${className}`}
    >
      <path
        fillRule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
        clipRule="evenodd"
      />
    </svg>
  );
};

export default Tooltip;

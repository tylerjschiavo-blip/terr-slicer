/**
 * Common Tooltip Component (AE-41)
 * 
 * Reusable tooltip wrapper that combines the UI Tooltip component
 * with content from the definitions file.
 * 
 * Features:
 * - Hover trigger with info icon or custom trigger element
 * - Content loaded from definitions file
 * - Accessible (keyboard focus, screen reader support via Radix UI)
 * - Proper positioning to avoid screen cutoff
 */

import * as React from 'react';
import { Tooltip as UITooltip, InfoIcon } from '@/components/ui/Tooltip';
import { TooltipDefinitions } from '@/lib/tooltips/definitions';
import type { TooltipKey } from '@/lib/tooltips/definitions';

interface DefinitionTooltipProps {
  /** Key to look up tooltip content from definitions */
  definitionKey: TooltipKey;
  /** Custom trigger element (defaults to InfoIcon) */
  children?: React.ReactNode;
  /** Side where tooltip appears relative to trigger */
  side?: 'top' | 'right' | 'bottom' | 'left';
  /** Alignment of tooltip relative to trigger */
  align?: 'start' | 'center' | 'end';
  /** Additional CSS classes for the tooltip content */
  className?: string;
}

/**
 * Tooltip component that displays definition text from the definitions file.
 * 
 * @example
 * ```tsx
 * // With default info icon
 * <DefinitionTooltip definitionKey="FAIRNESS_SCORE" />
 * 
 * // With custom trigger (label with icon)
 * <DefinitionTooltip definitionKey="BLENDED_SCORE">
 *   <span className="flex items-center gap-1">
 *     Blended Score <InfoIcon />
 *   </span>
 * </DefinitionTooltip>
 * ```
 */
export function DefinitionTooltip({
  definitionKey,
  children,
  side = 'top',
  align = 'center',
  className,
}: DefinitionTooltipProps) {
  const content = TooltipDefinitions[definitionKey];

  return (
    <UITooltip
      content={content}
      side={side}
      align={align}
      className={className}
    >
      {children ?? <InfoIcon />}
    </UITooltip>
  );
}

interface CustomTooltipProps {
  /** Custom tooltip content */
  content: string | React.ReactNode;
  /** Custom trigger element (defaults to InfoIcon) */
  children?: React.ReactNode;
  /** Side where tooltip appears relative to trigger */
  side?: 'top' | 'right' | 'bottom' | 'left';
  /** Alignment of tooltip relative to trigger */
  align?: 'start' | 'center' | 'end';
  /** Additional CSS classes for the tooltip content */
  className?: string;
}

/**
 * Tooltip component with custom content (not from definitions).
 * Use this for component-specific tooltips that don't need centralized definitions.
 * 
 * @example
 * ```tsx
 * <CustomTooltip content="This is a custom tooltip">
 *   <button>Hover me</button>
 * </CustomTooltip>
 * ```
 */
export function CustomTooltip({
  content,
  children,
  side = 'top',
  align = 'center',
  className,
}: CustomTooltipProps) {
  return (
    <UITooltip
      content={content}
      side={side}
      align={align}
      className={className}
    >
      {children ?? <InfoIcon />}
    </UITooltip>
  );
}

// Re-export InfoIcon for convenience
export { InfoIcon };

/**
 * HelpIcon Component
 * 
 * Reusable help icon button that triggers the glossary modal.
 * Displays a question mark icon, accessible, and styled for header placement.
 * 
 * Task: GHM-2
 * 
 * @example
 * ```tsx
 * <HelpIcon onClick={() => setShowModal(true)} />
 * ```
 */

import { HelpCircle } from 'lucide-react';

interface HelpIconProps {
  /** Click handler for opening the help/glossary modal */
  onClick: () => void;
  /** Optional custom className for styling */
  className?: string;
}

export function HelpIcon({ onClick, className = '' }: HelpIconProps) {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <button
      onClick={onClick}
      onKeyDown={handleKeyDown}
      aria-label="Open help and glossary"
      className={`
        inline-flex items-center justify-center
        w-8 h-8
        text-gray-600
        rounded-full
        transition-all duration-200
        hover:text-gray-900 hover:bg-gray-100
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        active:bg-gray-200
        ${className}
      `.trim()}
      type="button"
    >
      <HelpCircle className="w-5 h-5" aria-hidden="true" />
    </button>
  );
}

export default HelpIcon;

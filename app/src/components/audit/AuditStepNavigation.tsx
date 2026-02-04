import { useState, useEffect } from 'react';
import { useAllocationStore } from '@/store/allocationStore';
import { cn } from '@/lib/utils';

/**
 * AuditStepNavigation Component
 * 
 * Provides navigation controls for stepping through the audit trail:
 * - Previous button (disabled when at first step)
 * - Next button (disabled when at last step)
 * - Interactive step input allowing direct step number entry or arrow controls
 */
export default function AuditStepNavigation() {
  const auditTrail = useAllocationStore((state) => state.auditTrail);
  const currentAuditStep = useAllocationStore((state) => state.currentAuditStep);
  const setCurrentAuditStep = useAllocationStore((state) => state.setCurrentAuditStep);

  const totalSteps = auditTrail.length;
  const stepNumber = currentAuditStep + 1; // 1-indexed for display
  const isFirstStep = currentAuditStep === 0;
  const isLastStep = currentAuditStep === totalSteps - 1;

  // Local state for input value
  const [inputValue, setInputValue] = useState(stepNumber.toString());

  // Sync input with current step when it changes externally
  useEffect(() => {
    setInputValue(stepNumber.toString());
  }, [stepNumber]);

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentAuditStep(currentAuditStep - 1);
    }
  };

  const handleNext = () => {
    if (!isLastStep) {
      setCurrentAuditStep(currentAuditStep + 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputBlur = () => {
    const num = parseInt(inputValue, 10);
    if (!isNaN(num) && num >= 1 && num <= totalSteps) {
      setCurrentAuditStep(num - 1); // Convert back to 0-indexed
    } else {
      // Reset to current valid value if invalid
      setInputValue(stepNumber.toString());
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleInputBlur();
      e.currentTarget.blur();
    }
  };

  return (
    <div className="flex items-center justify-center gap-4">
      {/* Previous Button */}
      <button
        onClick={handlePrevious}
        disabled={isFirstStep}
        className={cn(
          'bg-white rounded-lg shadow-sm hover:shadow-md px-4 py-2 text-sm transition-shadow duration-200',
          isFirstStep ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        )}
        aria-label="Previous step"
      >
        Previous
      </button>

      {/* Step Counter with Input */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <span>Step</span>
        <input
          type="number"
          min={1}
          max={totalSteps}
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyDown}
          className="w-20 px-2 py-1 text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          aria-label="Step number"
        />
        <span>of {totalSteps}</span>
      </div>

      {/* Next Button */}
      <button
        onClick={handleNext}
        disabled={isLastStep}
        className={cn(
          'bg-white rounded-lg shadow-sm hover:shadow-md px-4 py-2 text-sm transition-shadow duration-200',
          isLastStep ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        )}
        aria-label="Next step"
      >
        Next
      </button>
    </div>
  );
}

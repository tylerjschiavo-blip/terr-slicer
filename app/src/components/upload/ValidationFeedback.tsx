/**
 * ValidationFeedback component
 * 
 * Displays validation errors and warnings to users with clear, actionable messages.
 * 
 * Features:
 * - Hard errors (blocking) displayed in red alert box
 * - Soft warnings (non-blocking) displayed in yellow info box
 * - Errors grouped by type (structural, data quality, consistency)
 * - Row/column context included in error messages
 * - Validation note about geo matching displayed
 * 
 * Task: AE-45 - Updated to use AlertBanner component
 * 
 * Integrates with Zustand store (validationErrors, validationWarnings)
 */

import { AlertBanner, AlertBannerTitle, AlertBannerDescription } from '../common/AlertBanner';
import { useAllocationStore } from '../../store/allocationStore';

interface ErrorGroup {
  title: string;
  errors: string[];
}

/**
 * Groups errors by type for better organization
 */
function groupErrors(errors: string[]): ErrorGroup[] {
  const groups: ErrorGroup[] = [];
  
  const structuralErrors: string[] = [];
  const dataQualityErrors: string[] = [];
  const consistencyErrors: string[] = [];
  const otherErrors: string[] = [];
  
  errors.forEach(error => {
    const lowerError = error.toLowerCase();
    
    if (
      lowerError.includes('missing') ||
      lowerError.includes('column') ||
      lowerError.includes('required field')
    ) {
      structuralErrors.push(error);
    } else if (
      lowerError.includes('duplicate') ||
      lowerError.includes('invalid') ||
      lowerError.includes('must be') ||
      lowerError.includes('out of range')
    ) {
      dataQualityErrors.push(error);
    } else if (
      lowerError.includes('orphan') ||
      lowerError.includes('not found') ||
      lowerError.includes('reference')
    ) {
      consistencyErrors.push(error);
    } else {
      otherErrors.push(error);
    }
  });
  
  if (structuralErrors.length > 0) {
    groups.push({ title: 'Structural Issues', errors: structuralErrors });
  }
  if (dataQualityErrors.length > 0) {
    groups.push({ title: 'Data Quality Issues', errors: dataQualityErrors });
  }
  if (consistencyErrors.length > 0) {
    groups.push({ title: 'Data Consistency Issues', errors: consistencyErrors });
  }
  if (otherErrors.length > 0) {
    groups.push({ title: 'Other Issues', errors: otherErrors });
  }
  
  return groups;
}

export function ValidationFeedback() {
  const { validationErrors, validationWarnings } = useAllocationStore();
  
  const hasErrors = validationErrors.length > 0;
  const hasWarnings = validationWarnings.length > 0;
  
  // Don't render anything if there are no errors or warnings
  if (!hasErrors && !hasWarnings) {
    return null;
  }
  
  const errorGroups = groupErrors(validationErrors);
  
  return (
    <div className="space-y-4">
      {/* Hard Errors (Blocking) */}
      {hasErrors && (
        <AlertBanner variant="error">
          <AlertBannerTitle>
            Validation Errors ({validationErrors.length})
          </AlertBannerTitle>
          <AlertBannerDescription>
            <p className="mb-3 font-medium">
              The following errors must be fixed before processing can continue:
            </p>
            <div className="space-y-4">
              {errorGroups.map((group, groupIndex) => (
                <div key={groupIndex}>
                  <p className="mb-2 font-semibold text-sm">{group.title}:</p>
                  <ul className="list-disc list-inside space-y-1 pl-2">
                    {group.errors.map((error, errorIndex) => (
                      <li key={errorIndex} className="text-sm">
                        {error}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </AlertBannerDescription>
        </AlertBanner>
      )}
      
      {/* Soft Warnings (Non-blocking) */}
      {hasWarnings && (
        <AlertBanner variant="warning">
          <AlertBannerTitle>
            Validation Warnings ({validationWarnings.length})
          </AlertBannerTitle>
          <AlertBannerDescription>
            <p className="mb-3 font-medium">
              The following warnings were detected. Processing can continue, but you may want to review:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              {validationWarnings.map((warning, index) => (
                <li key={index} className="text-sm">
                  {warning}
                </li>
              ))}
            </ul>
          </AlertBannerDescription>
        </AlertBanner>
      )}
      
      {/* Geo Matching Validation Note */}
      <AlertBanner variant="info">
        <AlertBannerTitle>
          Geo Matching Note
        </AlertBannerTitle>
        <AlertBannerDescription>
          <p className="text-sm">
            <strong>Important:</strong> Geo match uses exact string match (case-insensitive). 
            Ensure location formats align between Reps and Accounts files. For example, 
            "CA" will match "ca" but not "California".
          </p>
        </AlertBannerDescription>
      </AlertBanner>
    </div>
  );
}

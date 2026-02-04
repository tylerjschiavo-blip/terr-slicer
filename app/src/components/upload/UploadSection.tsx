/**
 * UploadSection Component
 * 
 * Container component with single XLSX upload zone that auto-detects Reps and Accounts tabs
 * Integrates with Zustand store for state management
 */

import { useAllocationStore } from '@/store/allocationStore';
import { FileUploadZone } from './FileUploadZone';
import { MissingRiskBanner } from '@/components/common/MissingRiskBanner';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useState } from 'react';
import { parseXLSXFile } from '@/lib/parsers/xlsxParser';

export function UploadSection() {
  // Get store actions and state
  const setReps = useAllocationStore((state) => state.setReps);
  const setAccounts = useAllocationStore((state) => state.setAccounts);
  const reps = useAllocationStore((state) => state.reps);
  const accounts = useAllocationStore((state) => state.accounts);
  
  // Local state for UI only (file name, processing, errors)
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [repsTabName, setRepsTabName] = useState<string>('');
  const [accountsTabName, setAccountsTabName] = useState<string>('');
  const [parseErrors, setParseErrors] = useState<string[]>([]);

  /**
   * Handle XLSX file selection and parse it
   */
  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    setError('');
    setIsProcessing(true);
    setParseErrors([]);
    
    try {
      // Parse the XLSX file with auto-detection
      const result = await parseXLSXFile(selectedFile);
      
      // Check for parsing errors
      if (result.errors.length > 0) {
        const errorMessages = result.errors.map(err => {
          const parts = [err.tabName ? `[${err.tabName}]` : ''];
          if (err.row > 0) parts.push(`Row ${err.row}`);
          if (err.column) parts.push(`Column ${err.column}`);
          parts.push(err.message);
          return parts.filter(p => p).join(' ');
        });
        setParseErrors(errorMessages);
        
        // If we have critical errors (no tabs detected), show main error
        const criticalErrors = result.errors.filter(e => e.row === 0);
        if (criticalErrors.length > 0 && (!result.repsTabName || !result.accountsTabName)) {
          setError(criticalErrors[0].message);
        }
      }
      
      // Store parsed data in Zustand store (persists across navigation)
      setReps(result.reps);
      setAccounts(result.accounts);
      setRepsTabName(result.repsTabName || '');
      setAccountsTabName(result.accountsTabName || '');
      
      console.log('XLSX file parsed:', {
        repsCount: result.repsCount,
        accountsCount: result.accountsCount,
        repsTab: result.repsTabName,
        accountsTab: result.accountsTabName
      });
      
      // TODO: Integrate with data validators
      // - validateRepsData(reps) from dataValidator.ts
      // - validateAccountsData(accounts) from dataValidator.ts
      // - validateDataConsistency(reps, accounts) from dataValidator.ts
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse XLSX file');
      // Clear store data on error
      setReps([]);
      setAccounts([]);
      setRepsTabName('');
      setAccountsTabName('');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Upload Data File
        </h2>
        <p className="text-sm text-gray-600">
          Upload a single XLSX file containing both Reps and Accounts data in separate tabs.
          The system will automatically detect which tab contains which data.
        </p>
      </div>

      {/* Single Upload Zone */}
      <FileUploadZone
        label="Upload XLSX File"
        description="Upload an XLSX file with Reps and Accounts data in separate tabs"
        onFileSelect={handleFileSelect}
        selectedFile={file}
        error={error}
        disabled={isProcessing}
      />

      {/* Info Banner */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start">
          <svg
            className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-blue-900 mb-1">
              Data Requirements
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>
                <strong>Reps tab:</strong> Must include columns: Rep_Name, Segment (Enterprise or Mid Market), Location
              </li>
              <li>
                <strong>Accounts tab:</strong> Must include columns: Account_ID, Account_Name, 
                Original_Rep, ARR, Num_Employees, Location. Risk_Score is optional.
              </li>
              <li>
                <strong>Tab names:</strong> Can be anything - tabs are detected automatically based on column headers
              </li>
              <li>
                <strong>Note:</strong> Geo match uses exact string match (case-insensitive). 
                Ensure location formats align between Reps and Accounts tabs.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Detection Results */}
      {file && !isProcessing && (repsTabName || accountsTabName) && (
        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Detected Tabs</h3>
          <div className="space-y-2 text-sm">
            {repsTabName && (
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 text-green-500 mr-2 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-gray-900">
                  <strong>Reps tab:</strong> "{repsTabName}" ({reps.length} {reps.length === 1 ? 'row' : 'rows'})
                </span>
              </div>
            )}
            {accountsTabName && (
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 text-green-500 mr-2 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-gray-900">
                  <strong>Accounts tab:</strong> "{accountsTabName}" ({accounts.length} {accounts.length === 1 ? 'row' : 'rows'})
                </span>
              </div>
            )}
          </div>
          
          {repsTabName && accountsTabName && parseErrors.length === 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-sm text-green-700 font-medium">
                ✓ Both tabs detected successfully. Data validation will be implemented in future updates.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Missing Risk Banner */}
      {file && !isProcessing && accounts.length > 0 && (
        <div className="mt-6">
          <MissingRiskBanner />
        </div>
      )}

      {/* Parse Errors */}
      {parseErrors.length > 0 && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-900 mb-2">
                Parsing Errors ({parseErrors.length})
              </h3>
              <ul className="text-sm text-red-800 space-y-1 max-h-48 overflow-y-auto">
                {parseErrors.slice(0, 10).map((err, idx) => (
                  <li key={idx} className="font-mono text-xs">
                    {err}
                  </li>
                ))}
                {parseErrors.length > 10 && (
                  <li className="text-red-700 italic">
                    ... and {parseErrors.length - 10} more errors
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Processing Indicator */}
      {isProcessing && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <LoadingSpinner
            size="md"
            variant="primary"
            text="Processing XLSX file..."
            aria-label="Processing XLSX file"
          />
        </div>
      )}
    </div>
  );
}

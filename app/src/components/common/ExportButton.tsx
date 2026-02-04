/**
 * Export Button Component
 * 
 * Triggers CSV export of allocation results with browser download
 * - Button: "Export CSV"
 * - Filename: territory-allocation-YYYY-MM-DD.csv
 * - Disabled when no allocation results available
 * 
 * Task: AE-42
 */

import { useAllocationStore } from '@/store/allocationStore';
import { exportAllocationResults, downloadCsv } from '@/lib/export/csvExporter';

interface ExportButtonProps {
  /** Optional custom className for styling */
  className?: string;
}

export function ExportButton({ className = '' }: ExportButtonProps) {
  const accounts = useAllocationStore((state) => state.accounts);
  const allocationResults = useAllocationStore((state) => state.results);
  
  // Disable button if no allocation results available
  const hasResults = allocationResults.length > 0 && accounts.length > 0;
  
  const handleExport = () => {
    if (!hasResults) {
      return;
    }
    
    // Generate CSV content
    const csvContent = exportAllocationResults(accounts, allocationResults);
    
    // Trigger download
    downloadCsv(csvContent);
  };
  
  return (
    <button
      onClick={handleExport}
      disabled={!hasResults}
      className={`
        w-full py-2.5 px-4 
        bg-gray-900 text-white text-sm font-medium
        rounded-lg
        transition-all duration-200
        hover:bg-gray-800 hover:shadow-md
        disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed disabled:shadow-none
        focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2
        ${className}
      `.trim()}
      title={hasResults ? 'Export allocation results as CSV' : 'No allocation results to export'}
    >
      <div className="flex items-center justify-center gap-2">
        {/* Download icon */}
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span>Export CSV</span>
      </div>
    </button>
  );
}

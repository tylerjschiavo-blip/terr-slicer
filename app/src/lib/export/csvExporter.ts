/**
 * CSV Export Utilities for Territory Allocation Results
 * 
 * Exports allocation results as CSV with:
 * - All original account columns
 * - Segment column (Enterprise or Mid Market)
 * - Assigned_Rep column
 * - Proper CSV formatting with escaped special characters
 */

import type { Account, AllocationResult } from '@/types';

/**
 * Escape a CSV field value
 * - Wraps in quotes if contains comma, quote, or newline
 * - Escapes internal quotes by doubling them
 */
function escapeCsvField(value: string | number | null | undefined): string {
  if (value === null || value === undefined) {
    return '';
  }
  
  const strValue = String(value);
  
  // Check if field needs quoting
  const needsQuoting = strValue.includes(',') || strValue.includes('"') || strValue.includes('\n') || strValue.includes('\r');
  
  if (needsQuoting) {
    // Escape quotes by doubling them
    const escaped = strValue.replace(/"/g, '""');
    return `"${escaped}"`;
  }
  
  return strValue;
}

/**
 * Generate CSV string from allocation results
 * 
 * @param accounts - Array of account objects with all original data
 * @param allocationResults - Array of allocation results with assigned reps and segments
 * @returns CSV string with headers and data rows
 */
export function exportAllocationResults(
  accounts: Account[],
  allocationResults: AllocationResult[]
): string {
  // Create a map of accountId -> allocation result for quick lookup
  const allocationMap = new Map<string, AllocationResult>();
  allocationResults.forEach(result => {
    allocationMap.set(result.accountId, result);
  });
  
  // Define CSV headers (all original columns + Segment + Assigned_Rep)
  const headers = [
    'Account_ID',
    'Account_Name',
    'Original_Rep',
    'ARR',
    'Num_Employees',
    'Location',
    'Risk_Score',
    'Segment',
    'Assigned_Rep',
  ];
  
  // Build CSV rows
  const rows: string[] = [];
  
  // Add header row
  rows.push(headers.join(','));
  
  // Add data rows
  accounts.forEach(account => {
    const allocation = allocationMap.get(account.Account_ID);
    
    // If no allocation found for this account, skip it or use empty values
    const segment = allocation?.segment || '';
    const assignedRep = allocation?.assignedRep || '';
    
    const row = [
      escapeCsvField(account.Account_ID),
      escapeCsvField(account.Account_Name),
      escapeCsvField(account.Original_Rep),
      escapeCsvField(account.ARR),
      escapeCsvField(account.Num_Employees),
      escapeCsvField(account.Location),
      escapeCsvField(account.Risk_Score),
      escapeCsvField(segment),
      escapeCsvField(assignedRep),
    ];
    
    rows.push(row.join(','));
  });
  
  // Join all rows with newlines
  return rows.join('\n');
}

/**
 * Trigger browser download of CSV file
 * 
 * @param csvContent - CSV string content
 * @param filename - Desired filename (default: territory-allocation-YYYY-MM-DD.csv)
 */
export function downloadCsv(csvContent: string, filename?: string): void {
  // Generate filename with current date if not provided
  const defaultFilename = `territory-allocation-${new Date().toISOString().split('T')[0]}.csv`;
  const finalFilename = filename || defaultFilename;
  
  // Create blob with CSV content
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Create temporary download link
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', finalFilename);
  link.style.visibility = 'hidden';
  
  // Append to document, click, and remove
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up the URL object
  URL.revokeObjectURL(url);
}

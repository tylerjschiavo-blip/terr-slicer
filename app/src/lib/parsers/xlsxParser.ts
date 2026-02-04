/**
 * XLSX Parser for Rep and Account data with auto-detection
 * 
 * Handles XLSX file parsing with:
 * - Auto-detection of Reps and Accounts tabs based on column headers
 * - Case-insensitive header matching
 * - Numeric conversions
 * - Detailed error reporting with row/column context
 */

import * as XLSX from 'xlsx';
import type { Rep, Account } from '@/types';

/**
 * Error result from XLSX parsing
 */
export interface XLSXParseError {
  row: number;
  column?: string;
  message: string;
  tabName?: string;
}

/**
 * Parse result containing both Reps and Accounts data
 */
export interface XLSXParseResult {
  reps: Rep[];
  accounts: Account[];
  errors: XLSXParseError[];
  repsTabName?: string;
  accountsTabName?: string;
  repsCount?: number;
  accountsCount?: number;
}

/**
 * Normalize header names (case-insensitive, trim whitespace)
 */
function normalizeHeader(header: string): string {
  return String(header).trim().toLowerCase().replace(/\s+/g, '_');
}

/**
 * Create a case-insensitive header mapping
 */
function createHeaderMapping(headers: string[]): Record<string, string> {
  const mapping: Record<string, string> = {};
  headers.forEach(header => {
    if (header) {
      const normalized = normalizeHeader(header);
      mapping[normalized] = header;
    }
  });
  return mapping;
}

/**
 * Get column value with case-insensitive header matching
 */
function getColumnValue(row: Record<string, unknown>, columnName: string, headerMapping: Record<string, string>): unknown {
  const normalized = normalizeHeader(columnName);
  const actualHeader = headerMapping[normalized];
  if (!actualHeader) {
    return undefined;
  }
  return row[actualHeader];
}

/**
 * Parse numeric value from XLSX column
 */
function parseNumber(value: unknown, columnName: string, row: number, tabName: string): { value: number | null; error: XLSXParseError | null } {
  if (value === null || value === undefined || value === '') {
    return { value: null, error: null };
  }
  
  const strValue = String(value).trim();
  if (strValue === '') {
    return { value: null, error: null };
  }
  
  const numValue = Number(strValue);
  if (isNaN(numValue)) {
    return {
      value: null,
      error: {
        row,
        column: columnName,
        message: `Invalid number format: "${strValue}"`,
        tabName
      }
    };
  }
  
  return { value: numValue, error: null };
}

/**
 * Detect if a tab contains Reps data based on column headers
 * Looks for: Rep_Name, Segment, Location
 */
function isRepsTab(headers: string[]): boolean {
  const normalizedHeaders = headers.map(h => normalizeHeader(h));
  const requiredColumns = ['rep_name', 'segment', 'location'];
  return requiredColumns.every(col => normalizedHeaders.includes(col));
}

/**
 * Detect if a tab contains Accounts data based on column headers
 * Looks for: Account_ID, Account_Name, (Current_Rep OR Original_Rep), ARR, Num_Employees, Location
 */
function isAccountsTab(headers: string[]): boolean {
  const normalizedHeaders = headers.map(h => normalizeHeader(h));
  const requiredColumns = ['account_id', 'account_name', 'arr', 'num_employees', 'location'];
  const hasRequiredColumns = requiredColumns.every(col => normalizedHeaders.includes(col));
  
  // Check for either Current_Rep or Original_Rep
  const hasRepColumn = normalizedHeaders.includes('current_rep') || normalizedHeaders.includes('original_rep');
  
  return hasRequiredColumns && hasRepColumn;
}

/**
 * Parse Reps data from a worksheet
 */
function parseRepsFromSheet(sheet: XLSX.WorkSheet, tabName: string): { reps: Rep[]; errors: XLSXParseError[] } {
  const errors: XLSXParseError[] = [];
  const reps: Rep[] = [];
  
  // Convert sheet to JSON with header row
  const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: '' });
  
  if (jsonData.length === 0) {
    return { reps, errors };
  }
  
  // Get headers from first row
  const firstRow = jsonData[0] as Record<string, unknown>;
  const headers = Object.keys(firstRow);
  const headerMapping = createHeaderMapping(headers);
  
  // Parse each row
  jsonData.forEach((row: unknown, index: number) => {
    const rowNum = index + 2; // +2 because: +1 for header row, +1 for 0-based index
    const rowData = row as Record<string, unknown>;
    
    // Extract values with case-insensitive matching
    const repName = getColumnValue(rowData, 'Rep_Name', headerMapping);
    const segment = getColumnValue(rowData, 'Segment', headerMapping);
    const location = getColumnValue(rowData, 'Location', headerMapping);
    
    // Validate required fields
    if (!repName || String(repName).trim() === '') {
      errors.push({
        row: rowNum,
        column: 'Rep_Name',
        message: 'Rep_Name is required and cannot be empty',
        tabName
      });
      return;
    }
    
    if (!segment || String(segment).trim() === '') {
      errors.push({
        row: rowNum,
        column: 'Segment',
        message: 'Segment is required and cannot be empty',
        tabName
      });
      return;
    }
    
    const segmentValue = String(segment).trim();
    const normalizedSegment = segmentValue.toLowerCase();
    if (normalizedSegment !== 'enterprise' && normalizedSegment !== 'mid market') {
      errors.push({
        row: rowNum,
        column: 'Segment',
        message: `Invalid Segment value: "${segment}". Must be "Enterprise" or "Mid Market"`,
        tabName
      });
      return;
    }
    
    // Map to proper case (case-insensitive input, but output is standardized)
    const finalSegment = normalizedSegment === 'enterprise' ? 'Enterprise' : 'Mid Market';
    
    if (!location || String(location).trim() === '') {
      errors.push({
        row: rowNum,
        column: 'Location',
        message: 'Location is required and cannot be empty',
        tabName
      });
      return;
    }
    
    // Create Rep object
    reps.push({
      Rep_Name: String(repName).trim(),
      Segment: finalSegment as 'Enterprise' | 'Mid Market',
      Location: String(location).trim()
    });
  });
  
  return { reps, errors };
}

/**
 * Parse Accounts data from a worksheet
 */
function parseAccountsFromSheet(sheet: XLSX.WorkSheet, tabName: string): { accounts: Account[]; errors: XLSXParseError[] } {
  const errors: XLSXParseError[] = [];
  const accounts: Account[] = [];
  
  // Convert sheet to JSON with header row
  const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: '' });
  
  if (jsonData.length === 0) {
    return { accounts, errors };
  }
  
  // Get headers from first row
  const firstRow = jsonData[0] as Record<string, unknown>;
  const headers = Object.keys(firstRow);
  const headerMapping = createHeaderMapping(headers);
  
  // Parse each row
  jsonData.forEach((row: unknown, index: number) => {
    const rowNum = index + 2; // +2 because: +1 for header row, +1 for 0-based index
    const rowData = row as Record<string, unknown>;
    
    // Extract values with case-insensitive matching
    const accountId = getColumnValue(rowData, 'Account_ID', headerMapping);
    const accountName = getColumnValue(rowData, 'Account_Name', headerMapping);
    // Try Current_Rep first, fallback to Original_Rep for backward compatibility
    const originalRep = getColumnValue(rowData, 'Current_Rep', headerMapping) || getColumnValue(rowData, 'Original_Rep', headerMapping);
    const arrValue = getColumnValue(rowData, 'ARR', headerMapping);
    const numEmployeesValue = getColumnValue(rowData, 'Num_Employees', headerMapping);
    const location = getColumnValue(rowData, 'Location', headerMapping);
    const riskScoreValue = getColumnValue(rowData, 'Risk_Score', headerMapping);
    
    // Validate required string fields
    if (!accountId || String(accountId).trim() === '') {
      errors.push({
        row: rowNum,
        column: 'Account_ID',
        message: 'Account_ID is required and cannot be empty',
        tabName
      });
      return;
    }
    
    if (!accountName || String(accountName).trim() === '') {
      errors.push({
        row: rowNum,
        column: 'Account_Name',
        message: 'Account_Name is required and cannot be empty',
        tabName
      });
      return;
    }
    
    if (!originalRep || String(originalRep).trim() === '') {
      errors.push({
        row: rowNum,
        column: 'Current_Rep/Original_Rep',
        message: 'Current_Rep or Original_Rep is required and cannot be empty',
        tabName
      });
      return;
    }
    
    if (!location || String(location).trim() === '') {
      errors.push({
        row: rowNum,
        column: 'Location',
        message: 'Location is required and cannot be empty',
        tabName
      });
      return;
    }
    
    // Parse numeric fields
    const arrResult = parseNumber(arrValue, 'ARR', rowNum, tabName);
    if (arrResult.error) {
      errors.push(arrResult.error);
      return;
    }
    if (arrResult.value === null) {
      errors.push({
        row: rowNum,
        column: 'ARR',
        message: 'ARR is required and cannot be empty',
        tabName
      });
      return;
    }
    if (arrResult.value < 0) {
      errors.push({
        row: rowNum,
        column: 'ARR',
        message: `ARR must be positive: ${arrResult.value}`,
        tabName
      });
      return;
    }
    
    const numEmployeesResult = parseNumber(numEmployeesValue, 'Num_Employees', rowNum, tabName);
    if (numEmployeesResult.error) {
      errors.push(numEmployeesResult.error);
      return;
    }
    if (numEmployeesResult.value === null) {
      errors.push({
        row: rowNum,
        column: 'Num_Employees',
        message: 'Num_Employees is required and cannot be empty',
        tabName
      });
      return;
    }
    if (numEmployeesResult.value < 0) {
      errors.push({
        row: rowNum,
        column: 'Num_Employees',
        message: `Num_Employees must be positive: ${numEmployeesResult.value}`,
        tabName
      });
      return;
    }
    
    // Parse optional Risk_Score
    let riskScore: number | null = null;
    if (riskScoreValue !== null && riskScoreValue !== undefined && String(riskScoreValue).trim() !== '') {
      const riskScoreResult = parseNumber(riskScoreValue, 'Risk_Score', rowNum, tabName);
      if (riskScoreResult.error) {
        errors.push(riskScoreResult.error);
        return;
      }
      if (riskScoreResult.value !== null) {
        if (riskScoreResult.value < 0 || riskScoreResult.value > 100) {
          errors.push({
            row: rowNum,
            column: 'Risk_Score',
            message: `Risk_Score must be between 0 and 100: ${riskScoreResult.value}`,
            tabName
          });
          return;
        }
        riskScore = riskScoreResult.value;
      }
    }
    
    // Create Account object
    accounts.push({
      Account_ID: String(accountId).trim(),
      Account_Name: String(accountName).trim(),
      Original_Rep: String(originalRep).trim(),
      ARR: arrResult.value,
      Num_Employees: numEmployeesResult.value,
      Location: String(location).trim(),
      Risk_Score: riskScore
    });
  });
  
  return { accounts, errors };
}

/**
 * Parse XLSX file with auto-detection of Reps and Accounts tabs
 * 
 * @param file - XLSX file containing Reps and/or Accounts data
 * @returns Promise resolving to parsed data with both Reps and Accounts, plus any errors
 */
export async function parseXLSXFile(file: File): Promise<XLSXParseResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          resolve({
            reps: [],
            accounts: [],
            errors: [{
              row: 0,
              message: 'Failed to read file data'
            }]
          });
          return;
        }
        
        // Parse the workbook
        const workbook = XLSX.read(data, { type: 'binary' });
        
        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
          resolve({
            reps: [],
            accounts: [],
            errors: [{
              row: 0,
              message: 'XLSX file contains no sheets'
            }]
          });
          return;
        }
        
        let reps: Rep[] = [];
        let accounts: Account[] = [];
        const errors: XLSXParseError[] = [];
        let repsTabName: string | undefined;
        let accountsTabName: string | undefined;
        
        // Iterate through all sheets to find Reps and Accounts tabs
        for (const sheetName of workbook.SheetNames) {
          const sheet = workbook.Sheets[sheetName];
          
          // Get headers from the sheet
          const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: '' });
          if (jsonData.length === 0) {
            continue; // Skip empty sheets
          }
          
          const firstRow = jsonData[0] as Record<string, unknown>;
          const headers = Object.keys(firstRow);
          
          // Check if this is a Reps tab
          if (isRepsTab(headers)) {
            if (repsTabName) {
              errors.push({
                row: 0,
                message: `Multiple Reps tabs detected: "${repsTabName}" and "${sheetName}". Using the first one found.`,
                tabName: sheetName
              });
            } else {
              repsTabName = sheetName;
              const result = parseRepsFromSheet(sheet, sheetName);
              reps = result.reps;
              errors.push(...result.errors);
            }
          }
          
          // Check if this is an Accounts tab
          if (isAccountsTab(headers)) {
            if (accountsTabName) {
              errors.push({
                row: 0,
                message: `Multiple Accounts tabs detected: "${accountsTabName}" and "${sheetName}". Using the first one found.`,
                tabName: sheetName
              });
            } else {
              accountsTabName = sheetName;
              const result = parseAccountsFromSheet(sheet, sheetName);
              accounts = result.accounts;
              errors.push(...result.errors);
            }
          }
        }
        
        // Check if we found the required tabs
        if (!repsTabName) {
          errors.push({
            row: 0,
            message: 'No Reps tab detected. Expected columns: Rep_Name, Segment, Location'
          });
        }
        
        if (!accountsTabName) {
          errors.push({
            row: 0,
            message: 'No Accounts tab detected. Expected columns: Account_ID, Account_Name, (Current_Rep OR Original_Rep), ARR, Num_Employees, Location'
          });
        }
        
        resolve({
          reps,
          accounts,
          errors,
          repsTabName,
          accountsTabName,
          repsCount: reps.length,
          accountsCount: accounts.length
        });
        
      } catch (error) {
        resolve({
          reps: [],
          accounts: [],
          errors: [{
            row: 0,
            message: `Failed to parse XLSX file: ${error instanceof Error ? error.message : 'Unknown error'}`
          }]
        });
      }
    };
    
    reader.onerror = () => {
      resolve({
        reps: [],
        accounts: [],
        errors: [{
          row: 0,
          message: 'Failed to read file'
        }]
      });
    };
    
    reader.readAsBinaryString(file);
  });
}

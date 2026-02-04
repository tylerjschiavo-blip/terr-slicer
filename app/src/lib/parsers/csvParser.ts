/**
 * CSV Parser for Rep and Account data
 * 
 * Handles CSV file parsing with case-insensitive header matching,
 * numeric conversions, and detailed error reporting with row/column context.
 */

import Papa from 'papaparse';
import type { Rep, Account } from '@/types';

/**
 * Error result from CSV parsing
 */
export interface CSVParseError {
  row: number;
  column?: string;
  message: string;
}

/**
 * Parse result containing either data or errors
 */
export interface ParseResult<T> {
  data: T[];
  errors: CSVParseError[];
}

/**
 * Normalize CSV header names (case-insensitive, trim whitespace)
 */
function normalizeHeader(header: string): string {
  return header.trim().toLowerCase().replace(/\s+/g, '_');
}

/**
 * Create a case-insensitive header mapping
 */
function createHeaderMapping(headers: string[]): Record<string, string> {
  const mapping: Record<string, string> = {};
  headers.forEach(header => {
    const normalized = normalizeHeader(header);
    mapping[normalized] = header;
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
 * Parse numeric value from CSV column
 */
function parseNumber(value: unknown, columnName: string, row: number): { value: number | null; error: CSVParseError | null } {
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
        message: `Invalid number format: "${strValue}"`
      }
    };
  }
  
  return { value: numValue, error: null };
}

/**
 * Parse Reps CSV file
 * 
 * Expected columns (case-insensitive):
 * - Rep_Name: string, required
 * - Segment: 'Enterprise' | 'Mid Market', required
 * - Location: string, required
 * 
 * @param file - CSV file containing Rep data
 * @returns Promise resolving to array of Rep objects and parsing errors
 */
export async function parseRepsCSV(file: File): Promise<ParseResult<Rep>> {
  return new Promise((resolve) => {
    const errors: CSVParseError[] = [];
    const reps: Rep[] = [];

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (!results.meta.fields || results.meta.fields.length === 0) {
          errors.push({
            row: 0,
            message: 'CSV file has no headers'
          });
          resolve({ data: [], errors });
          return;
        }

        // Create header mapping for case-insensitive matching
        const headerMapping = createHeaderMapping(results.meta.fields);

        // Check for required columns
        const requiredColumns = ['rep_name', 'segment', 'location'];
        const missingColumns = requiredColumns.filter(col => !headerMapping[col]);
        
        if (missingColumns.length > 0) {
          errors.push({
            row: 0,
            message: `Missing required columns: ${missingColumns.map(c => c.replace('_', ' ')).join(', ')}`
          });
          resolve({ data: [], errors });
          return;
        }

        // Parse each row
        results.data.forEach((row: unknown, index: number) => {
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
              message: 'Rep_Name is required and cannot be empty'
            });
            return;
          }

          if (!segment || String(segment).trim() === '') {
            errors.push({
              row: rowNum,
              column: 'Segment',
              message: 'Segment is required and cannot be empty'
            });
            return;
          }

          const segmentValue = String(segment).trim();
          const normalizedSegment = segmentValue.toLowerCase();
          if (normalizedSegment !== 'enterprise' && normalizedSegment !== 'mid market') {
            errors.push({
              row: rowNum,
              column: 'Segment',
              message: `Invalid Segment value: "${segment}". Must be "Enterprise" or "Mid Market"`
            });
            return;
          }

          // Map to proper case (case-insensitive input, but output is standardized)
          const finalSegment = normalizedSegment === 'enterprise' ? 'Enterprise' : 'Mid Market';

          if (!location || String(location).trim() === '') {
            errors.push({
              row: rowNum,
              column: 'Location',
              message: 'Location is required and cannot be empty'
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

        resolve({ data: reps, errors });
      },
      error: (error) => {
        errors.push({
          row: 0,
          message: `CSV parsing error: ${error.message}`
        });
        resolve({ data: [], errors });
      }
    });
  });
}

/**
 * Parse Accounts CSV file
 * 
 * Expected columns (case-insensitive):
 * - Account_ID: string, required
 * - Account_Name: string, required
 * - Original_Rep: string, required
 * - ARR: number, required
 * - Num_Employees: number, required
 * - Location: string, required
 * - Risk_Score: number (0-100), optional
 * 
 * @param file - CSV file containing Account data
 * @returns Promise resolving to array of Account objects and parsing errors
 */
export async function parseAccountsCSV(file: File): Promise<ParseResult<Account>> {
  return new Promise((resolve) => {
    const errors: CSVParseError[] = [];
    const accounts: Account[] = [];

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (!results.meta.fields || results.meta.fields.length === 0) {
          errors.push({
            row: 0,
            message: 'CSV file has no headers'
          });
          resolve({ data: [], errors });
          return;
        }

        // Create header mapping for case-insensitive matching
        const headerMapping = createHeaderMapping(results.meta.fields);

        // Check for required columns
        const requiredColumns = ['account_id', 'account_name', 'original_rep', 'arr', 'num_employees', 'location'];
        const missingColumns = requiredColumns.filter(col => !headerMapping[col]);
        
        if (missingColumns.length > 0) {
          errors.push({
            row: 0,
            message: `Missing required columns: ${missingColumns.map(c => c.replace('_', ' ')).join(', ')}`
          });
          resolve({ data: [], errors });
          return;
        }

        // Parse each row
        results.data.forEach((row: unknown, index: number) => {
          const rowNum = index + 2; // +2 because: +1 for header row, +1 for 0-based index
          const rowData = row as Record<string, unknown>;

          // Extract values with case-insensitive matching
          const accountId = getColumnValue(rowData, 'Account_ID', headerMapping);
          const accountName = getColumnValue(rowData, 'Account_Name', headerMapping);
          const originalRep = getColumnValue(rowData, 'Original_Rep', headerMapping);
          const arrValue = getColumnValue(rowData, 'ARR', headerMapping);
          const numEmployeesValue = getColumnValue(rowData, 'Num_Employees', headerMapping);
          const location = getColumnValue(rowData, 'Location', headerMapping);
          const riskScoreValue = getColumnValue(rowData, 'Risk_Score', headerMapping);

          // Validate required string fields
          if (!accountId || String(accountId).trim() === '') {
            errors.push({
              row: rowNum,
              column: 'Account_ID',
              message: 'Account_ID is required and cannot be empty'
            });
            return;
          }

          if (!accountName || String(accountName).trim() === '') {
            errors.push({
              row: rowNum,
              column: 'Account_Name',
              message: 'Account_Name is required and cannot be empty'
            });
            return;
          }

          if (!originalRep || String(originalRep).trim() === '') {
            errors.push({
              row: rowNum,
              column: 'Original_Rep',
              message: 'Original_Rep is required and cannot be empty'
            });
            return;
          }

          if (!location || String(location).trim() === '') {
            errors.push({
              row: rowNum,
              column: 'Location',
              message: 'Location is required and cannot be empty'
            });
            return;
          }

          // Parse numeric fields
          const arrResult = parseNumber(arrValue, 'ARR', rowNum);
          if (arrResult.error) {
            errors.push(arrResult.error);
            return;
          }
          if (arrResult.value === null) {
            errors.push({
              row: rowNum,
              column: 'ARR',
              message: 'ARR is required and cannot be empty'
            });
            return;
          }
          if (arrResult.value < 0) {
            errors.push({
              row: rowNum,
              column: 'ARR',
              message: `ARR must be positive: ${arrResult.value}`
            });
            return;
          }

          const numEmployeesResult = parseNumber(numEmployeesValue, 'Num_Employees', rowNum);
          if (numEmployeesResult.error) {
            errors.push(numEmployeesResult.error);
            return;
          }
          if (numEmployeesResult.value === null) {
            errors.push({
              row: rowNum,
              column: 'Num_Employees',
              message: 'Num_Employees is required and cannot be empty'
            });
            return;
          }
          if (numEmployeesResult.value < 0) {
            errors.push({
              row: rowNum,
              column: 'Num_Employees',
              message: `Num_Employees must be positive: ${numEmployeesResult.value}`
            });
            return;
          }

          // Parse optional Risk_Score
          let riskScore: number | null = null;
          if (riskScoreValue !== null && riskScoreValue !== undefined && String(riskScoreValue).trim() !== '') {
            const riskScoreResult = parseNumber(riskScoreValue, 'Risk_Score', rowNum);
            if (riskScoreResult.error) {
              errors.push(riskScoreResult.error);
              return;
            }
            if (riskScoreResult.value !== null) {
              if (riskScoreResult.value < 0 || riskScoreResult.value > 100) {
                errors.push({
                  row: rowNum,
                  column: 'Risk_Score',
                  message: `Risk_Score must be between 0 and 100: ${riskScoreResult.value}`
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

        resolve({ data: accounts, errors });
      },
      error: (error) => {
        errors.push({
          row: 0,
          message: `CSV parsing error: ${error.message}`
        });
        resolve({ data: [], errors });
      }
    });
  });
}

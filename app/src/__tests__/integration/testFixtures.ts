/**
 * Test Fixtures for Integration Tests
 * 
 * Provides realistic test data for end-to-end workflow testing
 * Task: AE-49
 */

import type { Account, Rep } from '@/types';

/**
 * Sample reps data - 6 reps across 2 segments
 */
export const mockReps: Rep[] = [
  // Enterprise reps
  {
    Rep_Name: 'Alice Johnson',
    Segment: 'Enterprise',
    Location: 'CA',
  },
  {
    Rep_Name: 'Bob Smith',
    Segment: 'Enterprise',
    Location: 'NY',
  },
  {
    Rep_Name: 'Carol Williams',
    Segment: 'Enterprise',
    Location: 'TX',
  },
  // Mid Market reps
  {
    Rep_Name: 'David Brown',
    Segment: 'Mid Market',
    Location: 'CA',
  },
  {
    Rep_Name: 'Eve Davis',
    Segment: 'Mid Market',
    Location: 'NY',
  },
  {
    Rep_Name: 'Frank Miller',
    Segment: 'Mid Market',
    Location: 'TX',
  },
];

/**
 * Sample accounts data - 12 accounts with varied attributes
 * Mix of Enterprise and Mid Market based on 5000 employee threshold
 */
export const mockAccounts: Account[] = [
  // Enterprise accounts (≥5000 employees)
  {
    Account_ID: 'ACC-001',
    Account_Name: 'TechCorp Global',
    Original_Rep: 'Alice Johnson',
    ARR: 500000,
    Num_Employees: 8000,
    Location: 'CA',
    Risk_Score: 85,
  },
  {
    Account_ID: 'ACC-002',
    Account_Name: 'MegaSoft Industries',
    Original_Rep: 'Bob Smith',
    ARR: 750000,
    Num_Employees: 12000,
    Location: 'NY',
    Risk_Score: 45,
  },
  {
    Account_ID: 'ACC-003',
    Account_Name: 'Enterprise Solutions',
    Original_Rep: 'Carol Williams',
    ARR: 600000,
    Num_Employees: 10000,
    Location: 'TX',
    Risk_Score: 90,
  },
  {
    Account_ID: 'ACC-004',
    Account_Name: 'Global Finance Co',
    Original_Rep: 'Alice Johnson',
    ARR: 400000,
    Num_Employees: 7000,
    Location: 'CA',
    Risk_Score: 60,
  },
  {
    Account_ID: 'ACC-005',
    Account_Name: 'Big Data Systems',
    Original_Rep: 'Bob Smith',
    ARR: 550000,
    Num_Employees: 9000,
    Location: 'NY',
    Risk_Score: 75,
  },
  {
    Account_ID: 'ACC-006',
    Account_Name: 'Cloud Networks Inc',
    Original_Rep: 'Carol Williams',
    ARR: 480000,
    Num_Employees: 6500,
    Location: 'TX',
    Risk_Score: 55,
  },
  // Mid Market accounts (<5000 employees)
  {
    Account_ID: 'ACC-007',
    Account_Name: 'StartupTech Inc',
    Original_Rep: 'David Brown',
    ARR: 150000,
    Num_Employees: 1200,
    Location: 'CA',
    Risk_Score: 40,
  },
  {
    Account_ID: 'ACC-008',
    Account_Name: 'Regional Solutions',
    Original_Rep: 'Eve Davis',
    ARR: 200000,
    Num_Employees: 2500,
    Location: 'NY',
    Risk_Score: 30,
  },
  {
    Account_ID: 'ACC-009',
    Account_Name: 'Growth Corp',
    Original_Rep: 'Frank Miller',
    ARR: 180000,
    Num_Employees: 1800,
    Location: 'TX',
    Risk_Score: 65,
  },
  {
    Account_ID: 'ACC-010',
    Account_Name: 'Small Business Co',
    Original_Rep: 'David Brown',
    ARR: 120000,
    Num_Employees: 800,
    Location: 'CA',
    Risk_Score: 25,
  },
  {
    Account_ID: 'ACC-011',
    Account_Name: 'Local Enterprises',
    Original_Rep: 'Eve Davis',
    ARR: 160000,
    Num_Employees: 1500,
    Location: 'NY',
    Risk_Score: 35,
  },
  {
    Account_ID: 'ACC-012',
    Account_Name: 'Midsize Tech',
    Original_Rep: 'Frank Miller',
    ARR: 190000,
    Num_Employees: 2200,
    Location: 'TX',
    Risk_Score: 70,
  },
];

/**
 * Sample CSV content for upload testing
 * Reps CSV format
 */
export const mockRepsCsv = `Rep_Name,Segment,Location
Alice Johnson,Enterprise,CA
Bob Smith,Enterprise,NY
Carol Williams,Enterprise,TX
David Brown,Mid Market,CA
Eve Davis,Mid Market,NY
Frank Miller,Mid Market,TX`;

/**
 * Sample CSV content for upload testing
 * Accounts CSV format
 */
export const mockAccountsCsv = `Account_ID,Account_Name,Original_Rep,ARR,Num_Employees,Location,Risk_Score
ACC-001,TechCorp Global,Alice Johnson,500000,8000,CA,85
ACC-002,MegaSoft Industries,Bob Smith,750000,12000,NY,45
ACC-003,Enterprise Solutions,Carol Williams,600000,10000,TX,90
ACC-004,Global Finance Co,Alice Johnson,400000,7000,CA,60
ACC-005,Big Data Systems,Bob Smith,550000,9000,NY,75
ACC-006,Cloud Networks Inc,Carol Williams,480000,6500,TX,55
ACC-007,StartupTech Inc,David Brown,150000,1200,CA,40
ACC-008,Regional Solutions,Eve Davis,200000,2500,NY,30
ACC-009,Growth Corp,Frank Miller,180000,1800,TX,65
ACC-010,Small Business Co,David Brown,120000,800,CA,25
ACC-011,Local Enterprises,Eve Davis,160000,1500,NY,35
ACC-012,Midsize Tech,Frank Miller,190000,2200,TX,70`;

/**
 * Create a File object from CSV string for upload testing
 */
export function createCsvFile(content: string, filename: string): File {
  const blob = new Blob([content], { type: 'text/csv' });
  return new File([blob], filename, { type: 'text/csv' });
}

/**
 * Minimal accounts without Risk_Score for testing missing risk handling
 */
export const mockAccountsWithoutRisk: Account[] = mockAccounts.map((acc) => ({
  ...acc,
  Risk_Score: null,
}));

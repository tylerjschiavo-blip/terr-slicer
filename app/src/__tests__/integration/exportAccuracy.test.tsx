/**
 * Integration Test: Export CSV Accuracy
 * 
 * Tests that exported CSV contains correct data matching allocation results:
 * - All columns present (original + Segment + Assigned_Rep)
 * - Correct values for each account
 * - Proper CSV formatting
 * - No data loss or corruption
 * 
 * Task: AE-49
 * 
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAllocationStore } from '@/store/allocationStore';
import { resetStore } from './testUtils';
import { mockReps, mockAccounts } from './testFixtures';
import { allocateAccounts } from '@/lib/allocation/greedyAllocator';
import { exportAllocationResults } from '@/lib/export/csvExporter';
import type { AllocationConfig } from '@/types';

describe('Integration: Export CSV Accuracy', () => {
  beforeEach(() => {
    resetStore();
  });

  it('should export CSV with all required columns', async () => {
    const { result } = renderHook(() => useAllocationStore());

    // Setup and allocate
    act(() => {
      result.current.setReps(mockReps);
      result.current.setAccounts(mockAccounts);
    });

    const config: AllocationConfig = {
      threshold: result.current.threshold,
      arrWeight: result.current.arrWeight,
      accountWeight: result.current.accountWeight,
      riskWeight: result.current.riskWeight,
      geoMatchBonus: result.current.geoMatchBonus,
      preserveBonus: result.current.preserveBonus,
      highRiskThreshold: result.current.highRiskThreshold,
    };

    const allocationResults = allocateAccounts(
      result.current.accounts,
      result.current.reps,
      config
    );

    act(() => {
      result.current.setAllocationResults(allocationResults);
    });

    // Export CSV
    const csvContent = exportAllocationResults(
      result.current.accounts,
      result.current.results
    );

    // Parse CSV header
    const lines = csvContent.split('\n');
    const header = lines[0];
    const expectedColumns = [
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

    expect(header).toBe(expectedColumns.join(','));
  });

  it('should export correct number of data rows matching accounts', async () => {
    const { result } = renderHook(() => useAllocationStore());

    act(() => {
      result.current.setReps(mockReps);
      result.current.setAccounts(mockAccounts);
    });

    const config: AllocationConfig = {
      threshold: result.current.threshold,
      arrWeight: result.current.arrWeight,
      accountWeight: result.current.accountWeight,
      riskWeight: result.current.riskWeight,
      geoMatchBonus: result.current.geoMatchBonus,
      preserveBonus: result.current.preserveBonus,
      highRiskThreshold: result.current.highRiskThreshold,
    };

    const allocationResults = allocateAccounts(
      result.current.accounts,
      result.current.reps,
      config
    );

    act(() => {
      result.current.setAllocationResults(allocationResults);
    });

    const csvContent = exportAllocationResults(
      result.current.accounts,
      result.current.results
    );

    const lines = csvContent.split('\n');
    
    // Should have: 1 header + N data rows
    expect(lines.length).toBe(mockAccounts.length + 1);
  });

  it('should export correct values for each account', async () => {
    const { result } = renderHook(() => useAllocationStore());

    act(() => {
      result.current.setReps(mockReps);
      result.current.setAccounts(mockAccounts);
    });

    const config: AllocationConfig = {
      threshold: result.current.threshold,
      arrWeight: result.current.arrWeight,
      accountWeight: result.current.accountWeight,
      riskWeight: result.current.riskWeight,
      geoMatchBonus: result.current.geoMatchBonus,
      preserveBonus: result.current.preserveBonus,
      highRiskThreshold: result.current.highRiskThreshold,
    };

    const allocationResults = allocateAccounts(
      result.current.accounts,
      result.current.reps,
      config
    );

    act(() => {
      result.current.setAllocationResults(allocationResults);
    });

    const csvContent = exportAllocationResults(
      result.current.accounts,
      result.current.results
    );

    const lines = csvContent.split('\n');
    
    // Check first account (ACC-001)
    const firstDataRow = lines[1];
    const firstAccount = mockAccounts[0];
    const firstAllocation = result.current.results.find(
      (r) => r.accountId === firstAccount.Account_ID
    );

    expect(firstAllocation).toBeDefined();
    
    // Should contain all original account data
    expect(firstDataRow).toContain(firstAccount.Account_ID);
    expect(firstDataRow).toContain(firstAccount.Account_Name);
    expect(firstDataRow).toContain(firstAccount.Original_Rep);
    expect(firstDataRow).toContain(String(firstAccount.ARR));
    expect(firstDataRow).toContain(String(firstAccount.Num_Employees));
    expect(firstDataRow).toContain(firstAccount.Location);
    
    // Should contain allocation results
    expect(firstDataRow).toContain(firstAllocation!.segment);
    expect(firstDataRow).toContain(firstAllocation!.assignedRep);
  });

  it('should match allocation results for all accounts', async () => {
    const { result } = renderHook(() => useAllocationStore());

    act(() => {
      result.current.setReps(mockReps);
      result.current.setAccounts(mockAccounts);
    });

    const config: AllocationConfig = {
      threshold: result.current.threshold,
      arrWeight: result.current.arrWeight,
      accountWeight: result.current.accountWeight,
      riskWeight: result.current.riskWeight,
      geoMatchBonus: result.current.geoMatchBonus,
      preserveBonus: result.current.preserveBonus,
      highRiskThreshold: result.current.highRiskThreshold,
    };

    const allocationResults = allocateAccounts(
      result.current.accounts,
      result.current.reps,
      config
    );

    act(() => {
      result.current.setAllocationResults(allocationResults);
    });

    const csvContent = exportAllocationResults(
      result.current.accounts,
      result.current.results
    );

    const lines = csvContent.split('\n');
    
    // Verify each account is present in CSV with correct allocation
    mockAccounts.forEach((account, index) => {
      const dataRow = lines[index + 1]; // Skip header
      const allocation = result.current.results.find(
        (r) => r.accountId === account.Account_ID
      );

      expect(allocation).toBeDefined();
      expect(dataRow).toContain(account.Account_ID);
      expect(dataRow).toContain(allocation!.assignedRep);
      expect(dataRow).toContain(allocation!.segment);
    });
  });

  it('should handle accounts with special characters in CSV export', async () => {
    const { result } = renderHook(() => useAllocationStore());

    // Create accounts with special characters
    const specialAccounts = [
      {
        Account_ID: 'ACC-SPECIAL',
        Account_Name: 'Company, Inc.',
        Original_Rep: 'Rep "Quotes" Name',
        ARR: 100000,
        Num_Employees: 5000,
        Location: 'CA',
        Risk_Score: 50,
      },
    ];

    const specialReps = [
      {
        Rep_Name: 'Rep "Quotes" Name',
        Segment: 'Enterprise' as const,
        Location: 'CA',
      },
    ];

    act(() => {
      result.current.setReps(specialReps);
      result.current.setAccounts(specialAccounts);
    });

    const config: AllocationConfig = {
      threshold: 5000,
      arrWeight: 33,
      accountWeight: 33,
      riskWeight: 34,
      geoMatchBonus: 0.05,
      preserveBonus: 0.05,
      highRiskThreshold: 70,
    };

    const allocationResults = allocateAccounts(
      result.current.accounts,
      result.current.reps,
      config
    );

    act(() => {
      result.current.setAllocationResults(allocationResults);
    });

    const csvContent = exportAllocationResults(
      result.current.accounts,
      result.current.results
    );

    // CSV should properly escape special characters
    expect(csvContent).toContain('"Company, Inc."'); // Comma in name requires quotes
    expect(csvContent).toContain('Rep ""Quotes"" Name'); // Quotes should be doubled
  });

  it('should handle accounts with null Risk_Score in export', async () => {
    const { result } = renderHook(() => useAllocationStore());

    const accountsNoRisk = mockAccounts.map((acc) => ({
      ...acc,
      Risk_Score: null,
    }));

    act(() => {
      result.current.setReps(mockReps);
      result.current.setAccounts(accountsNoRisk);
    });

    const config: AllocationConfig = {
      threshold: 5000,
      arrWeight: 50,
      accountWeight: 50,
      riskWeight: 0,
      geoMatchBonus: 0.05,
      preserveBonus: 0.05,
      highRiskThreshold: 70,
    };

    const allocationResults = allocateAccounts(
      result.current.accounts,
      result.current.reps,
      config
    );

    act(() => {
      result.current.setAllocationResults(allocationResults);
    });

    const csvContent = exportAllocationResults(
      result.current.accounts,
      result.current.results
    );

    const lines = csvContent.split('\n');
    
    // Check that null Risk_Score is handled (should be empty string)
    const firstDataRow = lines[1].split(',');
    const riskScoreIndex = 6; // Risk_Score is 7th column (index 6)
    
    // Should be empty string for null Risk_Score
    expect(firstDataRow[riskScoreIndex]).toBe('');
  });

  it('should export consistent data across multiple exports', async () => {
    const { result } = renderHook(() => useAllocationStore());

    act(() => {
      result.current.setReps(mockReps);
      result.current.setAccounts(mockAccounts);
    });

    const config: AllocationConfig = {
      threshold: result.current.threshold,
      arrWeight: result.current.arrWeight,
      accountWeight: result.current.accountWeight,
      riskWeight: result.current.riskWeight,
      geoMatchBonus: result.current.geoMatchBonus,
      preserveBonus: result.current.preserveBonus,
      highRiskThreshold: result.current.highRiskThreshold,
    };

    const allocationResults = allocateAccounts(
      result.current.accounts,
      result.current.reps,
      config
    );

    act(() => {
      result.current.setAllocationResults(allocationResults);
    });

    // Export twice
    const export1 = exportAllocationResults(
      result.current.accounts,
      result.current.results
    );

    const export2 = exportAllocationResults(
      result.current.accounts,
      result.current.results
    );

    // Both exports should be identical
    expect(export1).toBe(export2);
  });

  it('should preserve all original account data in export', async () => {
    const { result } = renderHook(() => useAllocationStore());

    act(() => {
      result.current.setReps(mockReps);
      result.current.setAccounts(mockAccounts);
    });

    const config: AllocationConfig = {
      threshold: result.current.threshold,
      arrWeight: result.current.arrWeight,
      accountWeight: result.current.accountWeight,
      riskWeight: result.current.riskWeight,
      geoMatchBonus: result.current.geoMatchBonus,
      preserveBonus: result.current.preserveBonus,
      highRiskThreshold: result.current.highRiskThreshold,
    };

    const allocationResults = allocateAccounts(
      result.current.accounts,
      result.current.reps,
      config
    );

    act(() => {
      result.current.setAllocationResults(allocationResults);
    });

    const csvContent = exportAllocationResults(
      result.current.accounts,
      result.current.results
    );

    // Verify no data loss: all original values should be in CSV
    mockAccounts.forEach((account) => {
      expect(csvContent).toContain(account.Account_ID);
      expect(csvContent).toContain(String(account.ARR));
      expect(csvContent).toContain(String(account.Num_Employees));
      expect(csvContent).toContain(account.Location);
    });
  });

  it('should export valid CSV format that can be re-imported', async () => {
    const { result } = renderHook(() => useAllocationStore());

    act(() => {
      result.current.setReps(mockReps);
      result.current.setAccounts(mockAccounts);
    });

    const config: AllocationConfig = {
      threshold: result.current.threshold,
      arrWeight: result.current.arrWeight,
      accountWeight: result.current.accountWeight,
      riskWeight: result.current.riskWeight,
      geoMatchBonus: result.current.geoMatchBonus,
      preserveBonus: result.current.preserveBonus,
      highRiskThreshold: result.current.highRiskThreshold,
    };

    const allocationResults = allocateAccounts(
      result.current.accounts,
      result.current.reps,
      config
    );

    act(() => {
      result.current.setAllocationResults(allocationResults);
    });

    const csvContent = exportAllocationResults(
      result.current.accounts,
      result.current.results
    );

    // CSV validation checks
    const lines = csvContent.split('\n');
    
    // All data rows should have same number of columns as header
    const headerColumns = lines[0].split(',').length;
    
    for (let i = 1; i < lines.length; i++) {
      // Simple check: count commas (works for our test data without quoted commas)
      const rowCommas = (lines[i].match(/,/g) || []).length;
      const headerCommas = (lines[0].match(/,/g) || []).length;
      
      // Both should have same number of commas
      expect(rowCommas).toBe(headerCommas);
    }
  });
});

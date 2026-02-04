/**
 * Integration Test: Full Allocation Workflow
 * 
 * Tests the complete user journey:
 * Upload CSVs → Configure threshold/weights → View results → Navigate pages → Export
 * 
 * Task: AE-49
 * 
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAllocationStore } from '@/store/allocationStore';
import { resetStore } from './testUtils';
import { mockReps, mockAccounts } from './testFixtures';
import { allocateAccounts } from '@/lib/allocation/greedyAllocator';
import type { AllocationConfig } from '@/types';

describe('Integration: Full Allocation Workflow', () => {
  beforeEach(() => {
    resetStore();
  });

  it('should complete full workflow: upload → configure → allocate → results', async () => {
    const { result } = renderHook(() => useAllocationStore());

    // Step 1: Upload data (simulate CSV upload)
    act(() => {
      result.current.setReps(mockReps);
      result.current.setAccounts(mockAccounts);
    });

    // Verify data loaded
    expect(result.current.reps).toHaveLength(6);
    expect(result.current.accounts).toHaveLength(12);
    expect(result.current.hasRiskScore).toBe(true);

    // Step 2: Configure threshold and weights
    act(() => {
      result.current.updateConfig({
        threshold: 6000, // Adjust threshold
        arrWeight: 40,
        accountWeight: 30,
        riskWeight: 30,
      });
    });

    expect(result.current.threshold).toBe(6000);
    expect(result.current.arrWeight).toBe(40);

    // Step 3: Run allocation (simulating useEffect in page component)
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

    // Step 4: Verify allocation results
    expect(result.current.results).toHaveLength(12); // All accounts allocated
    
    // Verify all accounts are assigned to valid reps
    const repNames = mockReps.map((r) => r.Rep_Name);
    result.current.results.forEach((allocation) => {
      expect(repNames).toContain(allocation.assignedRep);
    });

    // Verify segment assignment matches threshold
    const enterpriseAccounts = mockAccounts.filter(
      (acc) => acc.Num_Employees >= 6000
    );
    const midMarketAccounts = mockAccounts.filter(
      (acc) => acc.Num_Employees < 6000
    );

    const enterpriseAllocations = result.current.results.filter(
      (r) => r.segment === 'Enterprise'
    );
    const midMarketAllocations = result.current.results.filter(
      (r) => r.segment === 'Mid Market'
    );

    expect(enterpriseAllocations.length).toBe(enterpriseAccounts.length);
    expect(midMarketAllocations.length).toBe(midMarketAccounts.length);

    // Verify Enterprise accounts are assigned to Enterprise reps
    const enterpriseReps = mockReps
      .filter((r) => r.Segment === 'Enterprise')
      .map((r) => r.Rep_Name);
    enterpriseAllocations.forEach((allocation) => {
      expect(enterpriseReps).toContain(allocation.assignedRep);
    });

    // Verify Mid Market accounts are assigned to Mid Market reps
    const midMarketReps = mockReps
      .filter((r) => r.Segment === 'Mid Market')
      .map((r) => r.Rep_Name);
    midMarketAllocations.forEach((allocation) => {
      expect(midMarketReps).toContain(allocation.assignedRep);
    });
  });

  it('should handle workflow with missing Risk_Score data', async () => {
    const { result } = renderHook(() => useAllocationStore());

    // Upload accounts without Risk_Score
    const accountsNoRisk = mockAccounts.map((acc) => ({
      ...acc,
      Risk_Score: null,
    }));

    act(() => {
      result.current.setReps(mockReps);
      result.current.setAccounts(accountsNoRisk);
    });

    // Verify Risk_Score handling
    expect(result.current.hasRiskScore).toBe(false);
    expect(result.current.riskWeight).toBe(0); // Should auto-set to 0
    expect(result.current.arrWeight).toBe(50); // Should redistribute
    expect(result.current.accountWeight).toBe(50);

    // Run allocation with adjusted config
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

    // Should still complete successfully
    expect(result.current.results).toHaveLength(12);
  });

  it('should recalculate allocation when config changes', async () => {
    const { result } = renderHook(() => useAllocationStore());

    // Initial setup
    act(() => {
      result.current.setReps(mockReps);
      result.current.setAccounts(mockAccounts);
    });

    // First allocation with threshold 5000
    let config: AllocationConfig = {
      threshold: 5000,
      arrWeight: 33,
      accountWeight: 33,
      riskWeight: 34,
      geoMatchBonus: 0.05,
      preserveBonus: 0.05,
      highRiskThreshold: 70,
    };

    let results1 = allocateAccounts(
      result.current.accounts,
      result.current.reps,
      config
    );

    act(() => {
      result.current.setAllocationResults(results1);
    });

    const initialEnterpriseCount = result.current.results.filter(
      (r) => r.segment === 'Enterprise'
    ).length;

    // Change threshold to 8000 (fewer Enterprise accounts)
    act(() => {
      result.current.updateConfig({ threshold: 8000 });
    });

    config = {
      ...config,
      threshold: 8000,
    };

    const results2 = allocateAccounts(
      result.current.accounts,
      result.current.reps,
      config
    );

    act(() => {
      result.current.setAllocationResults(results2);
    });

    const newEnterpriseCount = result.current.results.filter(
      (r) => r.segment === 'Enterprise'
    ).length;

    // Verify segment counts changed
    expect(newEnterpriseCount).toBeLessThan(initialEnterpriseCount);
  });

  it('should validate no console errors during workflow', async () => {
    const { result } = renderHook(() => useAllocationStore());

    // Monitor console.error (it's not mocked in setup)
    const originalError = console.error;
    const errors: any[] = [];
    console.error = (...args: any[]) => {
      errors.push(args);
      originalError(...args);
    };

    try {
      // Run full workflow
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

      // Navigate through pages
      act(() => {
        result.current.setCurrentPage('comparison');
      });

      act(() => {
        result.current.setCurrentPage('audit');
      });

      // Verify no errors occurred
      expect(errors).toHaveLength(0);
    } finally {
      console.error = originalError;
    }
  });

  it('should handle edge case: single rep per segment', async () => {
    const { result } = renderHook(() => useAllocationStore());

    // Create minimal reps (1 Enterprise, 1 Mid Market)
    const minimalReps = [
      {
        Rep_Name: 'Solo Enterprise Rep',
        Segment: 'Enterprise' as const,
        Location: 'CA',
      },
      {
        Rep_Name: 'Solo Mid Market Rep',
        Segment: 'Mid Market' as const,
        Location: 'NY',
      },
    ];

    act(() => {
      result.current.setReps(minimalReps);
      result.current.setAccounts(mockAccounts);
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

    // All accounts should be allocated (no errors)
    expect(result.current.results).toHaveLength(12);

    // Verify all Enterprise accounts go to Solo Enterprise Rep
    const enterpriseAllocations = result.current.results.filter(
      (r) => r.segment === 'Enterprise'
    );
    enterpriseAllocations.forEach((allocation) => {
      expect(allocation.assignedRep).toBe('Solo Enterprise Rep');
    });

    // Verify all Mid Market accounts go to Solo Mid Market Rep
    const midMarketAllocations = result.current.results.filter(
      (r) => r.segment === 'Mid Market'
    );
    midMarketAllocations.forEach((allocation) => {
      expect(allocation.assignedRep).toBe('Solo Mid Market Rep');
    });
  });
});

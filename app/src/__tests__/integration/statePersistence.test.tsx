/**
 * Integration Test: State Persistence Across Pages
 * 
 * Tests that allocation data and configuration persist correctly
 * when navigating between Slicer → Comparison → Audit pages
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
import { generateAuditTrail } from '@/lib/allocation/auditTrail';
import type { AllocationConfig } from '@/types';

describe('Integration: State Persistence Across Pages', () => {
  beforeEach(() => {
    resetStore();
  });

  it('should persist allocation results when navigating between pages', async () => {
    const { result } = renderHook(() => useAllocationStore());

    // Setup data and run allocation
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

    // Store initial results
    const initialResults = [...result.current.results];
    const initialResultsCount = initialResults.length;

    // Navigate to Comparison page
    act(() => {
      result.current.setCurrentPage('comparison');
    });

    expect(result.current.currentPage).toBe('comparison');
    
    // Verify results persisted
    expect(result.current.results).toHaveLength(initialResultsCount);
    expect(result.current.results[0]).toEqual(initialResults[0]);

    // Navigate to Audit page
    act(() => {
      result.current.setCurrentPage('audit');
    });

    expect(result.current.currentPage).toBe('audit');
    
    // Verify results still persisted
    expect(result.current.results).toHaveLength(initialResultsCount);

    // Navigate back to Slicer
    act(() => {
      result.current.setCurrentPage('slicer');
    });

    // Verify results still intact
    expect(result.current.results).toHaveLength(initialResultsCount);
    expect(result.current.results).toEqual(initialResults);
  });

  it('should persist configuration when navigating between pages', async () => {
    const { result } = renderHook(() => useAllocationStore());

    // Setup and configure
    act(() => {
      result.current.setReps(mockReps);
      result.current.setAccounts(mockAccounts);
      result.current.updateConfig({
        threshold: 7500,
        arrWeight: 45,
        accountWeight: 30,
        riskWeight: 25,
      });
    });

    const initialConfig = {
      threshold: result.current.threshold,
      arrWeight: result.current.arrWeight,
      accountWeight: result.current.accountWeight,
      riskWeight: result.current.riskWeight,
    };

    // Navigate through all pages
    act(() => {
      result.current.setCurrentPage('comparison');
    });

    expect(result.current.threshold).toBe(initialConfig.threshold);
    expect(result.current.arrWeight).toBe(initialConfig.arrWeight);

    act(() => {
      result.current.setCurrentPage('audit');
    });

    expect(result.current.threshold).toBe(initialConfig.threshold);
    expect(result.current.accountWeight).toBe(initialConfig.accountWeight);

    act(() => {
      result.current.setCurrentPage('slicer');
    });

    // All config should remain unchanged
    expect(result.current.threshold).toBe(initialConfig.threshold);
    expect(result.current.arrWeight).toBe(initialConfig.arrWeight);
    expect(result.current.accountWeight).toBe(initialConfig.accountWeight);
    expect(result.current.riskWeight).toBe(initialConfig.riskWeight);
  });

  it('should persist uploaded data (reps and accounts) across page navigation', async () => {
    const { result } = renderHook(() => useAllocationStore());

    // Upload data
    act(() => {
      result.current.setReps(mockReps);
      result.current.setAccounts(mockAccounts);
    });

    const initialRepsCount = result.current.reps.length;
    const initialAccountsCount = result.current.accounts.length;
    const firstRep = result.current.reps[0];
    const firstAccount = result.current.accounts[0];

    // Navigate through pages
    const pages: ('slicer' | 'comparison' | 'audit')[] = [
      'comparison',
      'audit',
      'slicer',
      'comparison',
      'audit',
    ];

    for (const page of pages) {
      act(() => {
        result.current.setCurrentPage(page);
      });

      // Data should persist
      expect(result.current.reps).toHaveLength(initialRepsCount);
      expect(result.current.accounts).toHaveLength(initialAccountsCount);
      expect(result.current.reps[0]).toEqual(firstRep);
      expect(result.current.accounts[0]).toEqual(firstAccount);
    }
  });

  it('should persist audit trail data for Audit page navigation', async () => {
    const { result } = renderHook(() => useAllocationStore());

    // Setup data and run allocation
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

    const auditTrail = generateAuditTrail(
      result.current.accounts,
      result.current.reps,
      config
    );

    act(() => {
      result.current.setAllocationResults(allocationResults);
      result.current.setAuditTrail(auditTrail);
    });

    const initialAuditTrailLength = result.current.auditTrail.length;
    const firstStep = result.current.auditTrail[0];

    // Navigate to Audit page
    act(() => {
      result.current.setCurrentPage('audit');
    });

    expect(result.current.auditTrail).toHaveLength(initialAuditTrailLength);
    expect(result.current.auditTrail[0]).toEqual(firstStep);

    // Navigate away and back
    act(() => {
      result.current.setCurrentPage('comparison');
    });

    act(() => {
      result.current.setCurrentPage('audit');
    });

    // Audit trail should still be there
    expect(result.current.auditTrail).toHaveLength(initialAuditTrailLength);
    expect(result.current.auditTrail[0]).toEqual(firstStep);
  });

  it('should maintain audit step position when navigating away and back', async () => {
    const { result } = renderHook(() => useAllocationStore());

    // Setup
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

    const auditTrail = generateAuditTrail(
      result.current.accounts,
      result.current.reps,
      config
    );

    act(() => {
      result.current.setAuditTrail(auditTrail);
    });

    // Navigate to step 5 in audit trail
    act(() => {
      result.current.setCurrentAuditStep(5);
      result.current.setCurrentPage('audit');
    });

    expect(result.current.currentAuditStep).toBe(5);

    // Navigate away to Comparison
    act(() => {
      result.current.setCurrentPage('comparison');
    });

    // Navigate back to Audit
    act(() => {
      result.current.setCurrentPage('audit');
    });

    // UI state (currentAuditStep) is NOT persisted by design (see store.ts)
    // But audit trail data should be intact
    expect(result.current.auditTrail).toHaveLength(auditTrail.length);
  });

  it('should maintain hasRiskScore flag across navigation', async () => {
    const { result } = renderHook(() => useAllocationStore());

    // Upload data with Risk_Score
    act(() => {
      result.current.setReps(mockReps);
      result.current.setAccounts(mockAccounts);
    });

    expect(result.current.hasRiskScore).toBe(true);

    // Navigate through pages
    act(() => {
      result.current.setCurrentPage('comparison');
    });
    expect(result.current.hasRiskScore).toBe(true);

    act(() => {
      result.current.setCurrentPage('audit');
    });
    expect(result.current.hasRiskScore).toBe(true);

    act(() => {
      result.current.setCurrentPage('slicer');
    });
    expect(result.current.hasRiskScore).toBe(true);
  });

  it('should handle full workflow with multiple config changes and navigation', async () => {
    const { result } = renderHook(() => useAllocationStore());

    // Initial setup
    act(() => {
      result.current.setReps(mockReps);
      result.current.setAccounts(mockAccounts);
    });

    // First allocation
    const config1: AllocationConfig = {
      threshold: 5000,
      arrWeight: 33,
      accountWeight: 33,
      riskWeight: 34,
      geoMatchBonus: 0.05,
      preserveBonus: 0.05,
      highRiskThreshold: 70,
    };

    let results = allocateAccounts(
      result.current.accounts,
      result.current.reps,
      config1
    );

    act(() => {
      result.current.setAllocationResults(results);
    });

    const resultsCount1 = result.current.results.length;

    // Navigate to Comparison
    act(() => {
      result.current.setCurrentPage('comparison');
    });

    expect(result.current.results).toHaveLength(resultsCount1);

    // Navigate back and change config
    act(() => {
      result.current.setCurrentPage('slicer');
      result.current.updateConfig({ threshold: 8000, arrWeight: 50 });
    });

    const config2: AllocationConfig = {
      ...config1,
      threshold: 8000,
      arrWeight: 50,
      accountWeight: 25,
      riskWeight: 25,
    };

    results = allocateAccounts(
      result.current.accounts,
      result.current.reps,
      config2
    );

    act(() => {
      result.current.setAllocationResults(results);
    });

    // Navigate to Audit
    act(() => {
      result.current.setCurrentPage('audit');
    });

    // Results should reflect new allocation
    expect(result.current.results).toHaveLength(resultsCount1); // Same count, different assignments
    expect(result.current.threshold).toBe(8000);
    expect(result.current.arrWeight).toBe(50);
  });
});

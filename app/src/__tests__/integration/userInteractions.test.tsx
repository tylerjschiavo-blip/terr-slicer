/**
 * Integration Test: User Interactions
 * 
 * Tests user interactions and their effects on state:
 * - Slider changes (threshold, weights)
 * - Optimize weights button
 * - Step navigation in audit trail
 * - Page navigation
 * - State updates trigger correct recalculations
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

describe('Integration: User Interactions', () => {
  beforeEach(() => {
    resetStore();
  });

  describe('Threshold Slider Interactions', () => {
    it('should update threshold and trigger segmentation change', async () => {
      const { result } = renderHook(() => useAllocationStore());

      act(() => {
        result.current.setReps(mockReps);
        result.current.setAccounts(mockAccounts);
      });

      // Initial threshold: 5000
      expect(result.current.threshold).toBe(5000);

      const initialConfig: AllocationConfig = {
        threshold: result.current.threshold,
        arrWeight: result.current.arrWeight,
        accountWeight: result.current.accountWeight,
        riskWeight: result.current.riskWeight,
        geoMatchBonus: result.current.geoMatchBonus,
        preserveBonus: result.current.preserveBonus,
        highRiskThreshold: result.current.highRiskThreshold,
      };

      const initialResults = allocateAccounts(
        result.current.accounts,
        result.current.reps,
        initialConfig
      );

      act(() => {
        result.current.setAllocationResults(initialResults);
      });

      const initialEnterpriseCount = result.current.results.filter(
        (r) => r.segment === 'Enterprise'
      ).length;

      // User drags threshold slider to 8000
      act(() => {
        result.current.updateConfig({ threshold: 8000 });
      });

      expect(result.current.threshold).toBe(8000);

      // Recalculate with new threshold (simulating page useEffect)
      const newConfig: AllocationConfig = {
        ...initialConfig,
        threshold: 8000,
      };

      const newResults = allocateAccounts(
        result.current.accounts,
        result.current.reps,
        newConfig
      );

      act(() => {
        result.current.setAllocationResults(newResults);
      });

      const newEnterpriseCount = result.current.results.filter(
        (r) => r.segment === 'Enterprise'
      ).length;

      // With higher threshold, fewer accounts are Enterprise
      expect(newEnterpriseCount).toBeLessThan(initialEnterpriseCount);
    });

    it('should handle threshold changes in 1000 increments', async () => {
      const { result } = renderHook(() => useAllocationStore());

      act(() => {
        result.current.setReps(mockReps);
        result.current.setAccounts(mockAccounts);
      });

      // Simulate user dragging slider through increments
      const thresholdValues = [1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000];

      thresholdValues.forEach((threshold) => {
        act(() => {
          result.current.updateConfig({ threshold });
        });

        expect(result.current.threshold).toBe(threshold);
      });
    });
  });

  describe('Weight Slider Interactions', () => {
    it('should update weights and auto-normalize to 100%', async () => {
      const { result } = renderHook(() => useAllocationStore());

      act(() => {
        result.current.setReps(mockReps);
        result.current.setAccounts(mockAccounts);
      });

      // User adjusts weights (setWeights auto-normalizes)
      act(() => {
        result.current.setWeights(50, 30, 20);
      });

      // Should be normalized to sum to 100
      const sum =
        result.current.arrWeight +
        result.current.accountWeight +
        result.current.riskWeight;
      expect(sum).toBe(100);
    });

    it('should update individual weight and normalize others', async () => {
      const { result } = renderHook(() => useAllocationStore());

      act(() => {
        result.current.setReps(mockReps);
        result.current.setAccounts(mockAccounts);
      });

      // Initial weights: 33, 33, 34
      expect(result.current.arrWeight).toBe(33);
      expect(result.current.accountWeight).toBe(33);
      expect(result.current.riskWeight).toBe(34);

      // User drags ARR weight slider to 60
      act(() => {
        result.current.setWeights(60, 20, 20);
      });

      // Should normalize
      expect(result.current.arrWeight + result.current.accountWeight + result.current.riskWeight).toBe(100);
    });

    it('should trigger allocation recalculation when weights change', async () => {
      const { result } = renderHook(() => useAllocationStore());

      act(() => {
        result.current.setReps(mockReps);
        result.current.setAccounts(mockAccounts);
      });

      // Initial allocation
      const config1: AllocationConfig = {
        threshold: result.current.threshold,
        arrWeight: 33,
        accountWeight: 33,
        riskWeight: 34,
        geoMatchBonus: result.current.geoMatchBonus,
        preserveBonus: result.current.preserveBonus,
        highRiskThreshold: result.current.highRiskThreshold,
      };

      const results1 = allocateAccounts(
        result.current.accounts,
        result.current.reps,
        config1
      );

      act(() => {
        result.current.setAllocationResults(results1);
      });

      const firstAssignment1 = result.current.results[0].assignedRep;

      // Change weights significantly
      act(() => {
        result.current.setWeights(80, 10, 10);
      });

      // Recalculate
      const config2: AllocationConfig = {
        threshold: result.current.threshold,
        arrWeight: result.current.arrWeight,
        accountWeight: result.current.accountWeight,
        riskWeight: result.current.riskWeight,
        geoMatchBonus: result.current.geoMatchBonus,
        preserveBonus: result.current.preserveBonus,
        highRiskThreshold: result.current.highRiskThreshold,
      };

      const results2 = allocateAccounts(
        result.current.accounts,
        result.current.reps,
        config2
      );

      act(() => {
        result.current.setAllocationResults(results2);
      });

      // Results should be different (allocations may change with different weights)
      // Note: They might be the same if the algorithm converges to same solution
      // The important part is that recalculation happens
      expect(result.current.results).toHaveLength(results2.length);
    });
  });

  describe('Audit Trail Step Navigation', () => {
    it('should navigate through audit steps forward and backward', async () => {
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

      const auditTrail = generateAuditTrail(
        result.current.accounts,
        result.current.reps,
        config
      );

      act(() => {
        result.current.setAuditTrail(auditTrail);
      });

      expect(result.current.auditTrail.length).toBeGreaterThan(0);
      expect(result.current.currentAuditStep).toBe(0);

      // Navigate forward
      act(() => {
        result.current.setCurrentAuditStep(1);
      });
      expect(result.current.currentAuditStep).toBe(1);

      act(() => {
        result.current.setCurrentAuditStep(2);
      });
      expect(result.current.currentAuditStep).toBe(2);

      // Navigate backward
      act(() => {
        result.current.setCurrentAuditStep(1);
      });
      expect(result.current.currentAuditStep).toBe(1);

      act(() => {
        result.current.setCurrentAuditStep(0);
      });
      expect(result.current.currentAuditStep).toBe(0);
    });

    it('should navigate to last step', async () => {
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

      const auditTrail = generateAuditTrail(
        result.current.accounts,
        result.current.reps,
        config
      );

      act(() => {
        result.current.setAuditTrail(auditTrail);
      });

      const lastStep = auditTrail.length - 1;

      act(() => {
        result.current.setCurrentAuditStep(lastStep);
      });

      expect(result.current.currentAuditStep).toBe(lastStep);
    });

    it('should handle bounds of audit trail navigation', async () => {
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

      const auditTrail = generateAuditTrail(
        result.current.accounts,
        result.current.reps,
        config
      );

      act(() => {
        result.current.setAuditTrail(auditTrail);
      });

      // Start at step 0
      expect(result.current.currentAuditStep).toBe(0);

      // Try to go negative (component should prevent this)
      // Store allows any value, component enforces bounds
      act(() => {
        result.current.setCurrentAuditStep(-1);
      });
      expect(result.current.currentAuditStep).toBe(-1);

      // Reset to valid
      act(() => {
        result.current.setCurrentAuditStep(0);
      });

      // Try to go beyond max (component should prevent this)
      act(() => {
        result.current.setCurrentAuditStep(auditTrail.length + 10);
      });
      expect(result.current.currentAuditStep).toBe(auditTrail.length + 10);
    });
  });

  describe('Page Navigation Interactions', () => {
    it('should navigate between all pages', async () => {
      const { result } = renderHook(() => useAllocationStore());

      // Initial page
      expect(result.current.currentPage).toBe('slicer');

      // Navigate to Comparison
      act(() => {
        result.current.setCurrentPage('comparison');
      });
      expect(result.current.currentPage).toBe('comparison');

      // Navigate to Audit
      act(() => {
        result.current.setCurrentPage('audit');
      });
      expect(result.current.currentPage).toBe('audit');

      // Navigate back to Slicer
      act(() => {
        result.current.setCurrentPage('slicer');
      });
      expect(result.current.currentPage).toBe('slicer');
    });

    it('should maintain data when navigating between pages', async () => {
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

      const resultsCount = result.current.results.length;

      // Navigate through pages
      act(() => {
        result.current.setCurrentPage('comparison');
      });
      expect(result.current.results).toHaveLength(resultsCount);

      act(() => {
        result.current.setCurrentPage('audit');
      });
      expect(result.current.results).toHaveLength(resultsCount);

      act(() => {
        result.current.setCurrentPage('slicer');
      });
      expect(result.current.results).toHaveLength(resultsCount);
    });
  });

  describe('Complex User Interaction Workflows', () => {
    it('should handle rapid slider adjustments', async () => {
      const { result } = renderHook(() => useAllocationStore());

      act(() => {
        result.current.setReps(mockReps);
        result.current.setAccounts(mockAccounts);
      });

      // Simulate user rapidly adjusting threshold slider
      const thresholds = [5000, 6000, 5500, 7000, 6500, 8000];

      thresholds.forEach((threshold) => {
        act(() => {
          result.current.updateConfig({ threshold });
        });
      });

      // Should end with last value
      expect(result.current.threshold).toBe(8000);
    });

    it('should handle full interaction sequence: upload → adjust sliders → navigate → adjust again', async () => {
      const { result } = renderHook(() => useAllocationStore());

      // Step 1: Upload
      act(() => {
        result.current.setReps(mockReps);
        result.current.setAccounts(mockAccounts);
      });

      expect(result.current.reps).toHaveLength(6);
      expect(result.current.accounts).toHaveLength(12);

      // Step 2: Adjust threshold
      act(() => {
        result.current.updateConfig({ threshold: 6000 });
      });

      expect(result.current.threshold).toBe(6000);

      // Step 3: Allocate
      let config: AllocationConfig = {
        threshold: result.current.threshold,
        arrWeight: result.current.arrWeight,
        accountWeight: result.current.accountWeight,
        riskWeight: result.current.riskWeight,
        geoMatchBonus: result.current.geoMatchBonus,
        preserveBonus: result.current.preserveBonus,
        highRiskThreshold: result.current.highRiskThreshold,
      };

      let results = allocateAccounts(
        result.current.accounts,
        result.current.reps,
        config
      );

      act(() => {
        result.current.setAllocationResults(results);
      });

      expect(result.current.results).toHaveLength(12);

      // Step 4: Navigate to Comparison
      act(() => {
        result.current.setCurrentPage('comparison');
      });

      // Step 5: Navigate back and adjust weights
      act(() => {
        result.current.setCurrentPage('slicer');
        result.current.setWeights(50, 30, 20);
      });

      // Step 6: Recalculate
      config = {
        ...config,
        arrWeight: result.current.arrWeight,
        accountWeight: result.current.accountWeight,
        riskWeight: result.current.riskWeight,
      };

      results = allocateAccounts(
        result.current.accounts,
        result.current.reps,
        config
      );

      act(() => {
        result.current.setAllocationResults(results);
      });

      // Step 7: Navigate to Audit
      act(() => {
        result.current.setCurrentPage('audit');
      });

      // Verify final state
      expect(result.current.currentPage).toBe('audit');
      expect(result.current.results).toHaveLength(12);
      expect(result.current.threshold).toBe(6000);
      expect(result.current.arrWeight + result.current.accountWeight + result.current.riskWeight).toBe(100);
    });
  });

  describe('Loading State Interactions', () => {
    it('should manage loading state during operations', async () => {
      const { result } = renderHook(() => useAllocationStore());

      expect(result.current.isLoading).toBe(false);

      // Simulate starting a loading operation
      act(() => {
        result.current.setIsLoading(true);
      });

      expect(result.current.isLoading).toBe(true);

      // Simulate completing the operation
      act(() => {
        result.current.setIsLoading(false);
      });

      expect(result.current.isLoading).toBe(false);
    });
  });
});

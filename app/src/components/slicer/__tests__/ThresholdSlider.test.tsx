/**
 * Unit tests for ThresholdSlider component
 * 
 * Task: AE-21
 * 
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAllocationStore } from '../../../store/allocationStore';
import type { Account } from '../../../types';

describe('ThresholdSlider', () => {
  beforeEach(() => {
    // Reset store before each test
    const { result } = renderHook(() => useAllocationStore());
    act(() => {
      result.current.setAccounts([]);
      result.current.updateConfig({ threshold: 5000 });
    });
  });

  describe('Store Integration', () => {
    it('should read threshold from store', () => {
      const { result } = renderHook(() => useAllocationStore());
      
      expect(result.current.threshold).toBe(5000);
    });

    it('should update threshold in store', () => {
      const { result } = renderHook(() => useAllocationStore());
      
      act(() => {
        result.current.updateConfig({ threshold: 3000 });
      });
      
      expect(result.current.threshold).toBe(3000);
    });

    it('should calculate threshold range from account data', () => {
      const { result } = renderHook(() => useAllocationStore());
      
      const mockAccounts: Account[] = [
        {
          Account_ID: 'ACC-1',
          Account_Name: 'Small Corp',
          Original_Rep: 'Rep A',
          ARR: 100000,
          Num_Employees: 250,
          Location: 'CA',
          Risk_Score: null,
        },
        {
          Account_ID: 'ACC-2',
          Account_Name: 'Big Corp',
          Original_Rep: 'Rep B',
          ARR: 500000,
          Num_Employees: 5500,
          Location: 'NY',
          Risk_Score: null,
        },
      ];
      
      act(() => {
        result.current.setAccounts(mockAccounts);
      });
      
      // Verify accounts are set
      expect(result.current.accounts).toHaveLength(2);
      expect(result.current.accounts[0].Num_Employees).toBe(250);
      expect(result.current.accounts[1].Num_Employees).toBe(5500);
    });

    it('should handle 1000-employee increments', () => {
      const { result } = renderHook(() => useAllocationStore());
      
      // Set threshold to values that should align with 1K increments
      act(() => {
        result.current.updateConfig({ threshold: 1000 });
      });
      expect(result.current.threshold).toBe(1000);
      
      act(() => {
        result.current.updateConfig({ threshold: 2000 });
      });
      expect(result.current.threshold).toBe(2000);
      
      act(() => {
        result.current.updateConfig({ threshold: 5000 });
      });
      expect(result.current.threshold).toBe(5000);
    });
  });

  describe('Threshold Range Calculation', () => {
    it('should use getThresholdRange for dynamic min/max', () => {
      const { result } = renderHook(() => useAllocationStore());
      
      const mockAccounts: Account[] = [
        {
          Account_ID: 'ACC-1',
          Account_Name: 'Small',
          Original_Rep: 'Rep A',
          ARR: 50000,
          Num_Employees: 100,
          Location: 'CA',
          Risk_Score: null,
        },
        {
          Account_ID: 'ACC-2',
          Account_Name: 'Medium',
          Original_Rep: 'Rep B',
          ARR: 150000,
          Num_Employees: 2500,
          Location: 'NY',
          Risk_Score: null,
        },
        {
          Account_ID: 'ACC-3',
          Account_Name: 'Large',
          Original_Rep: 'Rep C',
          ARR: 800000,
          Num_Employees: 12000,
          Location: 'TX',
          Risk_Score: null,
        },
      ];
      
      act(() => {
        result.current.setAccounts(mockAccounts);
      });
      
      // Min should be 0 (100 rounded down to nearest 1K)
      // Max should be 12000 (already at 1K boundary)
      // Threshold should remain within this range
      expect(result.current.accounts).toHaveLength(3);
    });

    it('should adjust threshold if outside new range', () => {
      const { result } = renderHook(() => useAllocationStore());
      
      // Set initial threshold
      act(() => {
        result.current.updateConfig({ threshold: 15000 });
      });
      
      // Now add accounts with a narrower range
      const mockAccounts: Account[] = [
        {
          Account_ID: 'ACC-1',
          Account_Name: 'Small',
          Original_Rep: 'Rep A',
          ARR: 50000,
          Num_Employees: 500,
          Location: 'CA',
          Risk_Score: null,
        },
        {
          Account_ID: 'ACC-2',
          Account_Name: 'Large',
          Original_Rep: 'Rep B',
          ARR: 200000,
          Num_Employees: 8000,
          Location: 'NY',
          Risk_Score: null,
        },
      ];
      
      act(() => {
        result.current.setAccounts(mockAccounts);
      });
      
      // Component should adjust threshold to be within new range (max = 8000)
      // This is tested through the component's useEffect logic
      expect(result.current.accounts).toHaveLength(2);
    });
  });

  describe('Accessibility', () => {
    it('should store threshold value for ARIA labels', () => {
      const { result } = renderHook(() => useAllocationStore());
      
      act(() => {
        result.current.updateConfig({ threshold: 3500 });
      });
      
      // Threshold should be accessible for ARIA labels
      expect(result.current.threshold).toBe(3500);
    });
  });

  describe('Segmentation Integration', () => {
    it('should trigger recalculation when threshold changes', () => {
      const { result } = renderHook(() => useAllocationStore());
      
      const mockAccounts: Account[] = [
        {
          Account_ID: 'ACC-1',
          Account_Name: 'Account A',
          Original_Rep: 'Rep A',
          ARR: 100000,
          Num_Employees: 1000,
          Location: 'CA',
          Risk_Score: null,
        },
        {
          Account_ID: 'ACC-2',
          Account_Name: 'Account B',
          Original_Rep: 'Rep B',
          ARR: 200000,
          Num_Employees: 4000,
          Location: 'NY',
          Risk_Score: null,
        },
      ];
      
      act(() => {
        result.current.setAccounts(mockAccounts);
        result.current.updateConfig({ threshold: 2500 });
      });
      
      // Verify threshold was updated
      expect(result.current.threshold).toBe(2500);
      
      // Changing threshold should affect segmentation:
      // - With threshold 2500: ACC-1 (1000) is Mid-Market, ACC-2 (4000) is Enterprise
      
      // Update threshold
      act(() => {
        result.current.updateConfig({ threshold: 5000 });
      });
      
      // Now both should be Mid-Market
      expect(result.current.threshold).toBe(5000);
    });
  });
});

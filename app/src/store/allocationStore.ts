/**
 * Zustand store for Territory Allocation Engine
 * 
 * This store manages state across 4 slices:
 * - dataSlice: Reps, accounts, and validation state
 * - configSlice: Algorithm configuration and weights
 * - allocationSlice: Allocation results and metrics
 * - uiSlice: UI state and navigation
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Rep,
  Account,
  AllocationResult,
  FairnessMetrics,
  SensitivityDataPoint,
  AuditStep,
} from '../types';

// ============================================================================
// Type Definitions
// ============================================================================

type PageType = 'slicer' | 'comparison' | 'audit';

interface DataSlice {
  reps: Rep[];
  accounts: Account[];
  validationErrors: string[];
  validationWarnings: string[];
  hasRiskScore: boolean;
  
  // Actions
  setReps: (reps: Rep[]) => void;
  setAccounts: (accounts: Account[]) => void;
  setValidationErrors: (errors: string[]) => void;
  setValidationWarnings: (warnings: string[]) => void;
}

interface ConfigSlice {
  threshold: number;
  arrWeight: number;
  accountWeight: number;
  riskWeight: number;
  geoMatchBonus: number;
  preserveBonus: number;
  highRiskThreshold: number;
  /** Optimization: cap Enterprise ARR max/min ratio (null = off) */
  enterpriseCapEnabled: boolean;
  enterpriseCapValue: number;
  /** Optimization: cap Mid Market ARR max/min ratio (null = off) */
  midMarketCapEnabled: boolean;
  midMarketCapValue: number;

  // Actions
  updateConfig: (config: Partial<Omit<ConfigSlice, 'updateConfig' | 'setWeights'>>) => void;
  setWeights: (arrWeight: number, accountWeight: number, riskWeight: number) => void;
}

interface AllocationSlice {
  results: AllocationResult[];
  fairnessMetrics: FairnessMetrics;
  sensitivityData: SensitivityDataPoint[];
  auditTrail: AuditStep[];
  
  // Actions
  setAllocationResults: (results: AllocationResult[]) => void;
  setFairnessMetrics: (metrics: FairnessMetrics) => void;
  setSensitivityData: (data: SensitivityDataPoint[]) => void;
  setAuditTrail: (trail: AuditStep[]) => void;
}

interface UiSlice {
  currentPage: PageType;
  isLoading: boolean;
  currentAuditStep: number;
  
  // Actions
  setCurrentPage: (page: PageType) => void;
  setIsLoading: (loading: boolean) => void;
  setCurrentAuditStep: (step: number) => void;
}

interface GlobalActions {
  clearData: () => void;
}

type AllocationStore = DataSlice & ConfigSlice & AllocationSlice & UiSlice & GlobalActions;

// ============================================================================
// Store Implementation
// ============================================================================

export const useAllocationStore = create<AllocationStore>()(
  persist(
    (set) => ({
  // ============================================================================
  // Data Slice State
  // ============================================================================
  reps: [],
  accounts: [],
  validationErrors: [],
  validationWarnings: [],
  hasRiskScore: false,
  
  // Data Slice Actions
  setReps: (reps) => set({ reps }),
  
  setAccounts: (accounts) => {
    const hasRiskScore = accounts.some(account => account.Risk_Score !== null);
    
    // If Risk_Score is missing, set risk weight to 0 and redistribute to ARR/Account
    if (!hasRiskScore) {
      set({ 
        accounts, 
        hasRiskScore,
        riskWeight: 0,
        arrWeight: 50,
        accountWeight: 50,
      });
    } else {
      set({ accounts, hasRiskScore });
    }
  },
  
  setValidationErrors: (errors) => set({ validationErrors: errors }),
  setValidationWarnings: (warnings) => set({ validationWarnings: warnings }),
  
  // ============================================================================
  // Config Slice State
  // ============================================================================
  threshold: 5000,
  arrWeight: 33,
  accountWeight: 33,
  riskWeight: 34,
  geoMatchBonus: 0.05,
  preserveBonus: 0.05,
  highRiskThreshold: 70,
  enterpriseCapEnabled: false,
  enterpriseCapValue: 1.0,
  midMarketCapEnabled: false,
  midMarketCapValue: 1.0,

  // Config Slice Actions
  updateConfig: (config) => set(config),
  
  setWeights: (arrWeight, accountWeight, riskWeight) => {
    // Auto-normalize weights to sum to 100%
    const total = arrWeight + accountWeight + riskWeight;
    if (total === 0) {
      // If all zeros, reset to defaults
      set({
        arrWeight: 33,
        accountWeight: 33,
        riskWeight: 34,
      });
      return;
    }
    
    // Normalize to 100
    const normalizedArr = Math.round((arrWeight / total) * 100);
    const normalizedAccount = Math.round((accountWeight / total) * 100);
    const normalizedRisk = 100 - normalizedArr - normalizedAccount; // Ensure sum is exactly 100
    
    set({
      arrWeight: normalizedArr,
      accountWeight: normalizedAccount,
      riskWeight: normalizedRisk,
    });
  },
  
  // ============================================================================
  // Allocation Slice State
  // ============================================================================
  results: [],
  fairnessMetrics: {
    arrFairness: null,
    accountFairness: null,
    riskFairness: null,
    customComposite: null,
    balancedComposite: null,
  },
  sensitivityData: [],
  auditTrail: [],
  
  // Allocation Slice Actions
  setAllocationResults: (results) => set({ results }),
  setFairnessMetrics: (metrics) => set({ fairnessMetrics: metrics }),
  setSensitivityData: (data) => set({ sensitivityData: data }),
  setAuditTrail: (trail) => set({ auditTrail: trail }),
  
  // ============================================================================
  // UI Slice State
  // ============================================================================
  currentPage: 'slicer',
  isLoading: false,
  currentAuditStep: 0,
  
  // UI Slice Actions
  setCurrentPage: (page) => set({ currentPage: page }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setCurrentAuditStep: (step) => set({ currentAuditStep: step }),
  
  // Global Actions
  clearData: () => set({
    // Clear data
    reps: [],
    accounts: [],
    validationErrors: [],
    validationWarnings: [],
    hasRiskScore: false,
    // Clear allocation results
    results: [],
    fairnessMetrics: {
      arrFairness: null,
      accountFairness: null,
      riskFairness: null,
      customComposite: null,
      balancedComposite: null,
    },
    sensitivityData: [],
    auditTrail: [],
    // Reset UI state
    currentAuditStep: 0,
    isLoading: false,
  }),
    }),
    {
      name: 'territory-slicer-storage',
      partialize: (state) => ({
        // Persist data
        reps: state.reps,
        accounts: state.accounts,
        hasRiskScore: state.hasRiskScore,
        // Persist config
        threshold: state.threshold,
        arrWeight: state.arrWeight,
        accountWeight: state.accountWeight,
        riskWeight: state.riskWeight,
        geoMatchBonus: state.geoMatchBonus,
        preserveBonus: state.preserveBonus,
        highRiskThreshold: state.highRiskThreshold,
        enterpriseCapEnabled: state.enterpriseCapEnabled,
        enterpriseCapValue: state.enterpriseCapValue,
        midMarketCapEnabled: state.midMarketCapEnabled,
        midMarketCapValue: state.midMarketCapValue,
        // Persist allocation results
        results: state.results,
        fairnessMetrics: state.fairnessMetrics,
        sensitivityData: state.sensitivityData,
        auditTrail: state.auditTrail,
        // Don't persist: validationErrors, validationWarnings, UI state (isLoading, currentAuditStep, currentPage)
      }),
    }
  )
);

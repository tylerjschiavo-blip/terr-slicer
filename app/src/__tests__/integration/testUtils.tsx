/**
 * Integration Test Utilities
 * 
 * Provides helpers for testing React components with routing and state
 * Task: AE-49
 */

import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { useAllocationStore } from '@/store/allocationStore';

/**
 * Custom render function that wraps components with required providers
 */
export function renderWithRouter(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, {
    wrapper: ({ children }) => <BrowserRouter>{children}</BrowserRouter>,
    ...options,
  });
}

/**
 * Reset the allocation store to initial state
 * Use this in beforeEach to ensure test isolation
 */
export function resetStore() {
  const store = useAllocationStore.getState();
  store.clearData();
  
  // Also reset config to defaults
  store.updateConfig({
    threshold: 5000,
    arrWeight: 33,
    accountWeight: 33,
    riskWeight: 34,
    geoMatchBonus: 0.05,
    preserveBonus: 0.05,
    highRiskThreshold: 70,
  });
  
  // Reset UI state
  store.setCurrentPage('slicer');
  store.setIsLoading(false);
  store.setCurrentAuditStep(0);
}

/**
 * Wait for async state updates to complete
 */
export function waitForStateUpdate() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

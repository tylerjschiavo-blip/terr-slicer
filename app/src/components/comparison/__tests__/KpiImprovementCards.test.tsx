/**
 * Tests for KPI Improvement Cards Component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { KpiImprovementCards } from '../KpiImprovementCards';
import { useAllocationStore } from '@/store/allocationStore';
import type { Rep, Account, AllocationResult } from '@/types';

// Mock the store
vi.mock('@/store/allocationStore');

describe('KpiImprovementCards', () => {
  const mockReps: Rep[] = [
    { Rep_Name: 'Alice', Segment: 'Enterprise', Location: 'CA' },
    { Rep_Name: 'Bob', Segment: 'Enterprise', Location: 'NY' },
  ];

  const mockAccounts: Account[] = [
    {
      Account_ID: 'A1',
      Account_Name: 'Acme Corp',
      Original_Rep: 'Alice',
      ARR: 100000,
      Num_Employees: 5000,
      Location: 'CA',
      Risk_Score: 80,
    },
    {
      Account_ID: 'A2',
      Account_Name: 'Beta Inc',
      Original_Rep: 'Alice',
      ARR: 50000,
      Num_Employees: 3000,
      Location: 'NY',
      Risk_Score: 60,
    },
    {
      Account_ID: 'A3',
      Account_Name: 'Gamma LLC',
      Original_Rep: 'Bob',
      ARR: 75000,
      Num_Employees: 4000,
      Location: 'CA',
      Risk_Score: 70,
    },
  ];

  const mockResults: AllocationResult[] = [
    {
      accountId: 'A1',
      assignedRep: 'Alice',
      segment: 'Enterprise',
      blendedScore: 0.5,
      geoBonus: 0.05,
      preserveBonus: 0.05,
      totalScore: 0.6,
    },
    {
      accountId: 'A2',
      assignedRep: 'Bob',
      segment: 'Enterprise',
      blendedScore: 0.3,
      geoBonus: 0.05,
      preserveBonus: 0,
      totalScore: 0.35,
    },
    {
      accountId: 'A3',
      assignedRep: 'Bob',
      segment: 'Enterprise',
      blendedScore: 0.4,
      geoBonus: 0,
      preserveBonus: 0.05,
      totalScore: 0.45,
    },
  ];

  it('should render KPI improvement cards with metrics', () => {
    (useAllocationStore as any).mockImplementation((selector: any) => {
      const state = {
        reps: mockReps,
        accounts: mockAccounts,
        results: mockResults,
        highRiskThreshold: 70,
        hasRiskScore: true,
      };
      return selector(state);
    });

    render(<KpiImprovementCards />);

    // Check for section title
    expect(screen.getByText('KPI Improvement')).toBeInTheDocument();

    // Check for metric labels
    expect(screen.getByText('ARR CV%')).toBeInTheDocument();
    expect(screen.getByText('Account CV%')).toBeInTheDocument();
    expect(screen.getByText('Risk CV%')).toBeInTheDocument();
    expect(screen.getByText('Geo Match %')).toBeInTheDocument();
  });

  it('should return null when no data is available', () => {
    (useAllocationStore as any).mockImplementation((selector: any) => {
      const state = {
        reps: [],
        accounts: [],
        results: [],
        highRiskThreshold: 70,
        hasRiskScore: false,
      };
      return selector(state);
    });

    const { container } = render(<KpiImprovementCards />);
    expect(container.firstChild).toBeNull();
  });

  it('should show N/A for Risk CV% when Risk_Score is missing', () => {
    const accountsWithoutRisk = mockAccounts.map(acc => ({
      ...acc,
      Risk_Score: null,
    }));

    (useAllocationStore as any).mockImplementation((selector: any) => {
      const state = {
        reps: mockReps,
        accounts: accountsWithoutRisk,
        results: mockResults,
        highRiskThreshold: 70,
        hasRiskScore: false,
      };
      return selector(state);
    });

    render(<KpiImprovementCards />);

    // Risk CV% should show N/A
    const riskRow = screen.getByText('Risk CV%').closest('div');
    expect(riskRow).toHaveTextContent('N/A');
  });

  it('should calculate improvement correctly (negative delta for CV%)', () => {
    // Setup: Original allocation has high CV%, new allocation has lower CV%
    // This should show as improvement (negative delta, green bar)
    (useAllocationStore as any).mockImplementation((selector: any) => {
      const state = {
        reps: mockReps,
        accounts: mockAccounts,
        results: mockResults,
        highRiskThreshold: 70,
        hasRiskScore: true,
      };
      return selector(state);
    });

    const { container } = render(<KpiImprovementCards />);

    // Check for green bars (improvement indicators)
    const greenBars = container.querySelectorAll('.bg-green-500');
    expect(greenBars.length).toBeGreaterThan(0);
  });
});

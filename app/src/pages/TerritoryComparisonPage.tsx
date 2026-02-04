import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAllocationStore } from '@/store/allocationStore';
import TerritoryPageHeader from '@/components/layout/TerritoryPageHeader';
import SlicerLayout from '@/components/slicer/SlicerLayout';
import SlicerControls from '@/components/slicer/SlicerControls';
import RepDistributionCharts from '@/components/comparison/RepDistributionCharts';
import { KpiImprovementCards } from '@/components/comparison/KpiImprovementCards';
import AccountMovementTable from '@/components/comparison/AccountMovementTable';
import { allocateAccounts } from '@/lib/allocation/greedyAllocator';
import { generateSensitivityData } from '@/lib/allocation/sensitivity';
import { generateAuditTrail } from '@/lib/allocation/auditTrail';
import {
  calculateSegmentBasedFairness,
} from '@/lib/allocation/fairness';
import type { AllocationConfig } from '@/types';

/**
 * Territory Comparison Page
 * Compares original rep assignments (from loaded data) against new allocation
 * 
 * Task: AE-31 - Page layout implementation
 * Individual comparison components (charts, KPI cards, movement table) will be implemented in future tasks
 */
function TerritoryComparisonPage() {
  const reps = useAllocationStore((state) => state.reps);
  const accounts = useAllocationStore((state) => state.accounts);
  const results = useAllocationStore((state) => state.results);
  const threshold = useAllocationStore((state) => state.threshold);
  const arrWeight = useAllocationStore((state) => state.arrWeight);
  const accountWeight = useAllocationStore((state) => state.accountWeight);
  const riskWeight = useAllocationStore((state) => state.riskWeight);
  const geoMatchBonus = useAllocationStore((state) => state.geoMatchBonus);
  const preserveBonus = useAllocationStore((state) => state.preserveBonus);
  const highRiskThreshold = useAllocationStore((state) => state.highRiskThreshold);
  const setAllocationResults = useAllocationStore((state) => state.setAllocationResults);
  const setFairnessMetrics = useAllocationStore((state) => state.setFairnessMetrics);
  const setSensitivityData = useAllocationStore((state) => state.setSensitivityData);
  const setAuditTrail = useAllocationStore((state) => state.setAuditTrail);
  
  // Check if we have data
  const hasData = reps.length > 0 && accounts.length > 0;

  // Run allocation when data or config changes (same as Analyze page)
  useEffect(() => {
    if (!hasData) {
      return;
    }

    // Build allocation config
    const config: AllocationConfig = {
      threshold,
      arrWeight,
      accountWeight,
      riskWeight,
      geoMatchBonus,
      preserveBonus,
      highRiskThreshold,
    };

    // Run allocation
    const allocationResults = allocateAccounts(accounts, reps, config);
    setAllocationResults(allocationResults);

    // Calculate segment-based fairness (matching Analyze page and optimizer)
    const fairnessMetrics = calculateSegmentBasedFairness(
      reps,
      allocationResults,
      accounts,
      {
        arr: config.arrWeight,
        account: config.accountWeight,
        risk: config.riskWeight,
      },
      config.highRiskThreshold
    );

    setFairnessMetrics(fairnessMetrics);

    // Generate sensitivity data
    const sensitivityData = generateSensitivityData(accounts, reps, config);
    setSensitivityData(sensitivityData);

    // Generate audit trail
    const auditTrail = generateAuditTrail(accounts, reps, config);
    setAuditTrail(auditTrail);
  }, [
    hasData,
    accounts,
    reps,
    threshold,
    arrWeight,
    accountWeight,
    riskWeight,
    geoMatchBonus,
    preserveBonus,
    highRiskThreshold,
    setAllocationResults,
    setFairnessMetrics,
    setSensitivityData,
    setAuditTrail,
  ]);

  // Redirect to Analyze page (which shows upload) if no data
  if (!hasData) {
    return <Navigate to="/slicer" replace />;
  }

  // Main layout with data loaded
  return (
    <SlicerLayout sidebar={<SlicerControls />}>
      <TerritoryPageHeader />

      {/* Main Content Sections */}
      
      {/* KPI Improvement Cards */}
      <section className="mb-8 mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">KPI Improvement</h2>
        <KpiImprovementCards />
      </section>

      {/* Rep Distribution - Before vs After */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Rep Distribution - Before vs. After</h2>
        <RepDistributionCharts />
      </section>

      {/* Account Movement Table (collapsible) */}
      <section>
        <AccountMovementTable />
      </section>
    </SlicerLayout>
  );
}

export default TerritoryComparisonPage;

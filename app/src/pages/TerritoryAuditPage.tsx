import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAllocationStore } from '@/store/allocationStore';
import TerritoryPageHeader from '@/components/layout/TerritoryPageHeader';
import SlicerLayout from '@/components/slicer/SlicerLayout';
import SlicerControls from '@/components/slicer/SlicerControls';
import { AccountDecisionCard } from '@/components/audit/AccountDecisionCard';
import RepScoresTable from '@/components/audit/RepScoresTable';
import AuditStepNavigation from '@/components/audit/AuditStepNavigation';
import { allocateAccounts } from '@/lib/allocation/greedyAllocator';
import { generateSensitivityData } from '@/lib/allocation/sensitivity';
import { generateAuditTrail } from '@/lib/allocation/auditTrail';
import { calculateSegmentBasedFairness } from '@/lib/allocation/fairness';
import type { AllocationConfig } from '@/types';

/**
 * Territory Audit Page
 * Displays the audit trail showing step-by-step account allocation decisions
 *
 * Re-runs allocation when config (sliders) changes so the audit trail and
 * scores stay in sync with the current weights/threshold/preferences.
 */
function TerritoryAuditPage() {
  const auditTrail = useAllocationStore((state) => state.auditTrail);
  const currentAuditStep = useAllocationStore((state) => state.currentAuditStep);
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
  const setCurrentAuditStep = useAllocationStore((state) => state.setCurrentAuditStep);

  // Check if we have data
  const hasData = reps.length > 0 && accounts.length > 0;

  // Re-run allocation when config changes (same as Analyze/Compare) so audit trail and table stay correct
  useEffect(() => {
    if (!hasData) return;

    const config: AllocationConfig = {
      threshold,
      arrWeight,
      accountWeight,
      riskWeight,
      geoMatchBonus,
      preserveBonus,
      highRiskThreshold,
    };

    try {
      const allocationResults = allocateAccounts(accounts, reps, config);
      setAllocationResults(allocationResults);

      const fairnessMetrics = calculateSegmentBasedFairness(
        reps,
        allocationResults,
        accounts,
        { arr: config.arrWeight, account: config.accountWeight, risk: config.riskWeight },
        config.highRiskThreshold
      );
      setFairnessMetrics(fairnessMetrics);

      const sensitivityData = generateSensitivityData(accounts, reps, config);
      setSensitivityData(sensitivityData);

      const newAuditTrail = generateAuditTrail(accounts, reps, config);
      setAuditTrail(newAuditTrail);
      setCurrentAuditStep(0);
    } catch (error) {
      console.error('Allocation failed:', error);
    }
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
    setCurrentAuditStep,
  ]);

  // Check if allocation has been run
  const hasAllocation = results.length > 0 && auditTrail.length > 0;
  
  // Get current step data
  const currentStep = auditTrail[currentAuditStep];
  const totalSteps = auditTrail.length;
  const stepNumber = currentAuditStep + 1; // 1-indexed for display

  // Redirect to Analyze page if no data or no allocation
  if (!hasData || !hasAllocation) {
    return <Navigate to="/slicer" replace />;
  }

  // Main layout with data loaded
  return (
    <SlicerLayout sidebar={<SlicerControls />}>
      <TerritoryPageHeader />

      {/* Main Content Sections */}
      
      {/* Audit Trail Header */}
      <section className="mb-8 mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Audit Trail — Step {stepNumber} of {totalSteps}
        </h2>
      </section>

      {/* Account Decision Card */}
      {currentStep && (
        <section className="mb-8">
          <AccountDecisionCard step={currentStep} threshold={threshold} />
        </section>
      )}

      {/* Rep Scores Table with Winner Reasoning */}
      {currentStep && (
        <RepScoresTable 
          step={currentStep} 
          allocationResults={results}
        />
      )}

      {/* Navigation Controls */}
      <section className="mb-8">
        <AuditStepNavigation />
      </section>
    </SlicerLayout>
  );
}

export default TerritoryAuditPage;

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { UploadSection } from '@/components/upload/UploadSection';
import { MissingRiskBanner } from '@/components/common/MissingRiskBanner';
import HelpIcon from '@/components/common/HelpIcon';
import GlossaryModal from '@/components/common/GlossaryModal';
import { useAllocationStore } from '@/store/allocationStore';
import SlicerLayout from '@/components/slicer/SlicerLayout';
import SlicerControls from '@/components/slicer/SlicerControls';
import SegmentOverviewCards from '@/components/slicer/SegmentOverviewCards';
import RepDistributionCharts from '@/components/slicer/RepDistributionCharts';
import ThresholdSensitivityChart from '@/components/slicer/ThresholdSensitivityChart';
import RepSummaryTable from '@/components/slicer/RepSummaryTable';
import AccountAssignmentsTable from '@/components/slicer/AccountAssignmentsTable';
import { allocateAccounts } from '@/lib/allocation/greedyAllocator';
import { generateSensitivityData } from '@/lib/allocation/sensitivity';
import { generateAuditTrail } from '@/lib/allocation/auditTrail';
import {
  calculateSegmentBasedFairness,
} from '@/lib/allocation/fairness';
import type { AllocationConfig } from '@/types';

/**
 * Territory Slicer Page
 * Main page for territory allocation with controls, metrics, charts, and tables
 * 
 * Task: AE-20 - Page layout implementation
 * Individual components (sliders, charts, tables) will be implemented in tasks AE-21 through AE-30
 */
function TerritorySlicerPage() {
  const [showGlossary, setShowGlossary] = useState(false);
  const reps = useAllocationStore((state) => state.reps);
  const accounts = useAllocationStore((state) => state.accounts);
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
  
  // Show upload section if no data loaded
  const hasData = reps.length > 0 && accounts.length > 0;

  // Debug logging
  console.log('TerritorySlicerPage render:', { hasData, repsCount: reps.length, accountsCount: accounts.length });

  // Run allocation when data or config changes
  useEffect(() => {
    if (!hasData) {
      return;
    }

    try {
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

      // Calculate segment-based fairness (matching UI display and optimizer)
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
  ]);

  // Empty state: Show upload section
  if (!hasData) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="max-w-2xl w-full px-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Territory Slicer</h1>
            <p className="text-gray-600">Upload data to begin territory allocation</p>
          </div>
          <UploadSection />
        </div>
      </div>
    );
  }

  // Main layout with data loaded
  return (
    <SlicerLayout
      sidebar={<SlicerControls />}
    >
      {/* Page Header with Tabs - Sticky */}
      <div className="sticky top-0 z-20 bg-gray-50 -mx-8 px-8">
        <div className="flex items-center gap-3 mb-6 pt-8">
          <h1 className="text-3xl font-semibold text-gray-900">Territory Slicer</h1>
          <HelpIcon onClick={() => setShowGlossary(true)} />
        </div>
        
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex gap-8">
            <Link
              to="/slicer"
              className="pb-3 px-1 text-sm font-medium transition-colors relative text-gray-900"
            >
              Analyze
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900"></div>
            </Link>
            <Link
              to="/comparison"
              className="pb-3 px-1 text-sm font-medium transition-colors relative text-gray-500 hover:text-gray-700"
            >
              Compare
            </Link>
            <Link
              to="/audit"
              className="pb-3 px-1 text-sm font-medium transition-colors relative text-gray-500 hover:text-gray-700"
            >
              Audit
            </Link>
          </nav>
        </div>
      </div>

      {/* Main Content Sections */}
      
      {/* Missing Risk Banner */}
      <div className="mt-8 mb-6">
        <MissingRiskBanner />
      </div>

      {/* Segment Overview - 3 unified cards: Enterprise, Mid Market, Total */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Segment Overview</h2>
        <SegmentOverviewCards />
      </section>

      {/* Rep Distribution - ARR and Account charts for E and MM */}
      <section className="mb-8">
        <RepDistributionCharts />
      </section>

      {/* Threshold Sensitivity Chart */}
      <section className="mb-8">
        <ThresholdSensitivityChart />
      </section>

      {/* Rep Summary Table */}
      <section className="mb-8">
        <RepSummaryTable />
      </section>

      {/* Account Assignments Table (collapsible) */}
      <section>
        <AccountAssignmentsTable />
      </section>
      
      <GlossaryModal open={showGlossary} onOpenChange={setShowGlossary} />
    </SlicerLayout>
  );
}

export default TerritorySlicerPage;

import { Navigate } from 'react-router-dom';
import { useAllocationStore } from '@/store/allocationStore';
import TerritoryPageHeader from '@/components/layout/TerritoryPageHeader';
import SlicerLayout from '@/components/slicer/SlicerLayout';
import SlicerControls from '@/components/slicer/SlicerControls';
import { AccountDecisionCard } from '@/components/audit/AccountDecisionCard';
import RepScoresTable from '@/components/audit/RepScoresTable';
import AuditStepNavigation from '@/components/audit/AuditStepNavigation';

/**
 * Territory Audit Page
 * Displays the audit trail showing step-by-step account allocation decisions
 * 
 * Wave 6 implementation with all audit components integrated
 */
function TerritoryAuditPage() {
  const auditTrail = useAllocationStore((state) => state.auditTrail);
  const currentAuditStep = useAllocationStore((state) => state.currentAuditStep);
  const reps = useAllocationStore((state) => state.reps);
  const accounts = useAllocationStore((state) => state.accounts);
  const results = useAllocationStore((state) => state.results);
  const threshold = useAllocationStore((state) => state.threshold);
  
  // Check if we have data
  const hasData = reps.length > 0 && accounts.length > 0;
  
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

import { Link, Navigate } from 'react-router-dom';
import { useAllocationStore } from '@/store/allocationStore';
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
      {/* Page Header with Tabs - Sticky */}
      <div className="sticky top-0 z-20 bg-gray-50 -mx-8 px-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-6 pt-8">Territory Slicer</h1>
        
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex gap-8">
            <Link
              to="/slicer"
              className="pb-3 px-1 text-sm font-medium transition-colors relative text-gray-500 hover:text-gray-700"
            >
              Analyze
            </Link>
            <Link
              to="/comparison"
              className="pb-3 px-1 text-sm font-medium transition-colors relative text-gray-500 hover:text-gray-700"
            >
              Compare
            </Link>
            <button
              className="pb-3 px-1 text-sm font-medium transition-colors relative text-gray-900"
            >
              Audit
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900"></div>
            </button>
          </nav>
        </div>
      </div>

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

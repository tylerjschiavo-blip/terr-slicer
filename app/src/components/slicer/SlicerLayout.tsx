import type { ReactNode } from 'react';

interface SlicerLayoutProps {
  sidebar: ReactNode;
  children: ReactNode;
}

/**
 * Layout wrapper for Territory Slicer page
 * Provides left sidebar + main content area structure with independent scrolling
 * Responsive: Full-width sidebar on mobile, fixed width on tablet+
 */
function SlicerLayout({ sidebar, children }: SlicerLayoutProps) {
  return (
    <div className="flex h-screen w-full bg-gray-50">
      {/* Left Sidebar - Controls (fixed, independently scrollable) */}
      {/* Mobile: w-full, Tablet+: w-80 */}
      <aside className="w-full md:w-80 border-r border-gray-200 bg-white overflow-y-auto flex-shrink-0">
        <div className="p-4">
          {sidebar}
        </div>
      </aside>
      
      {/* Main Content Area (independently scrollable) */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-50">
        {/* Mobile: p-4, Tablet+: p-8 */}
        <div className="p-4 md:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}

export default SlicerLayout;

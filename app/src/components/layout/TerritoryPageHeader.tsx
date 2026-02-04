/**
 * Territory Page Header
 *
 * Shared header for Analyze, Compare, and Audit pages: title, help icon (glossary),
 * and tab navigation. Renders the same on every tab so the glossary is always available.
 */

import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import HelpIcon from '@/components/common/HelpIcon';
import GlossaryModal from '@/components/common/GlossaryModal';

const TAB_CONFIG = [
  { path: '/slicer', label: 'Analyze' },
  { path: '/comparison', label: 'Compare' },
  { path: '/audit', label: 'Audit' },
] as const;

function TerritoryPageHeader() {
  const [showGlossary, setShowGlossary] = useState(false);
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <>
      <div className="sticky top-0 z-20 bg-gray-50 -mx-8 px-8">
        <div className="flex items-center gap-3 mb-6 pt-8">
          <h1 className="text-3xl font-semibold text-gray-900">Territory Slicer</h1>
          <HelpIcon onClick={() => setShowGlossary(true)} />
        </div>

        <div className="border-b border-gray-200">
          <nav className="flex gap-8">
            {TAB_CONFIG.map(({ path, label }) => {
              const isActive = pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
                    isActive ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {label}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      <GlossaryModal open={showGlossary} onOpenChange={setShowGlossary} />
    </>
  );
}

export default TerritoryPageHeader;

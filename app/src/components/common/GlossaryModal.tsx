/**
 * Glossary Modal Component
 * 
 * Displays glossary content in a modal dialog with two sections:
 * - Key Inputs/Outputs
 * - How It Works
 * 
 * Task: GHM-3
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import ReactMarkdown from 'react-markdown';
import glossaryContent from '@/content/glossary-content.md?raw';

interface GlossaryModalProps {
  /** Whether modal is open */
  open: boolean;
  /** Callback when open state changes */
  onOpenChange: (open: boolean) => void;
}

export default function GlossaryModal({
  open,
  onOpenChange,
}: GlossaryModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[85vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-8 pt-8 pb-4 border-b border-gray-200 bg-white sticky top-0 z-10">
          <DialogTitle className="text-2xl font-semibold text-gray-900">How It Works</DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto px-8 pb-6">
          {/* Rationale-style formatting; uses app font to match rest of UI */}
          <div className="max-w-[700px] text-[#222] leading-[1.5]">
            <ReactMarkdown
              components={{
                h2: ({ children }) => (
                  <h2 className="text-[1.15rem] font-semibold text-[#333] mt-6 mb-4 first:mt-0">
                    {children}
                  </h2>
                ),
                p: ({ children }) => (
                  <p className="my-2 text-[#222]">{children}</p>
                ),
                ul: ({ children }) => (
                  <ul className="my-2 pl-6 list-disc">{children}</ul>
                ),
                li: ({ children }) => (
                  <li className="my-1 pl-1">{children}</li>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-[#222]">{children}</strong>
                ),
                hr: () => (
                  <hr className="border-0 border-t border-[#ddd] my-6" />
                ),
                blockquote: ({ children }) => (
                  <blockquote className="my-4 py-3 px-4 rounded-md border-l-4 border-amber-500 bg-amber-50 text-[#222] not-italic">
                    {children}
                  </blockquote>
                ),
              }}
            >
              {glossaryContent}
            </ReactMarkdown>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

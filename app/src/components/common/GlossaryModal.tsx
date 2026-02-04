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
          <DialogTitle className="text-2xl font-semibold text-gray-900">Glossary</DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto px-8 pb-6">
          <div className="prose prose-slate max-w-none
            prose-headings:font-semibold prose-headings:text-gray-900
            prose-h2:text-xl prose-h2:mt-0 prose-h2:mb-4 prose-h2:pb-2 prose-h2:border-b prose-h2:border-gray-200
            prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-3 prose-h3:text-gray-800
            prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
            prose-code:text-sm prose-code:bg-gray-100 prose-code:text-blue-600 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-code:before:content-[''] prose-code:after:content-['']
            prose-strong:text-gray-900 prose-strong:font-semibold
          ">
            <ReactMarkdown
              components={{
                h1: ({ children }) => (
                  <h1 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-gray-300">{children}</h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-xl font-semibold text-gray-900 first:mt-0 mt-8 mb-4 pb-2 border-b border-gray-200">{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">{children}</h3>
                ),
                p: ({ children }) => (
                  <p className="text-gray-700 leading-relaxed mb-4">{children}</p>
                ),
                code: ({ children }) => (
                  <code className="text-sm bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-mono">{children}</code>
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

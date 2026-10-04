import React from 'react';
import {
  CheckCheck,
  RotateCcw,
  Copy,
  Check,
  Printer,
  ShieldCheck,
} from 'lucide-react';

interface GroceryProgressCardProps {
  totalCount: number;
  checkedCount: number;
  progressPercent: number;
  copiedToast: boolean;
  onMarkAll: () => void;
  onReset: () => void;
  onCopyList: () => void;
}

export const GroceryProgressCard: React.FC<GroceryProgressCardProps> = ({
  totalCount,
  checkedCount,
  progressPercent,
  copiedToast,
  onMarkAll,
  onReset,
  onCopyList,
}) => {
  return (
    <div className="bg-surface-container-lowest p-5 sm:p-6 rounded-2xl shadow-tactile border border-outline-variant/40 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-surface-container">
        <div className="flex items-center gap-2">
          <span className="font-bold text-base text-on-surface">Cart Progress</span>
        </div>
        <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
          {progressPercent}% Complete
        </span>
      </div>

      {/* Progress Bar & Counter */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs text-on-surface-variant font-medium">
          <span>Items Gathered</span>
          <span className="font-bold text-on-surface">
            {checkedCount} of {totalCount} items checked
          </span>
        </div>
        <div className="w-full h-3 rounded-full bg-surface-container overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Primary Actions: Mark All / Reset Checks */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onMarkAll}
          className="h-10 px-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <CheckCheck className="w-4 h-4" />
          <span>Mark All Safe</span>
        </button>
        <button
          type="button"
          onClick={onReset}
          className="h-10 px-3 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface-variant font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset Checks</span>
        </button>
      </div>

      {/* Export Options: Copy for WhatsApp / Print */}
      <div className="flex flex-col gap-2 pt-2 border-t border-surface-container">
        {/* Copy Button */}
        <button
          type="button"
          onClick={onCopyList}
          className="w-full h-11 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-[#07381a] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer"
        >
          {copiedToast ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          <span>{copiedToast ? 'Copied to Clipboard!' : 'Copy Grocery List'}</span>
        </button>

        {/* Print Button */}
        <button
          type="button"
          onClick={() => window.print()}
          className="w-full h-10 px-4 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <Printer className="w-4 h-4 text-on-surface-variant" />
          <span>Print Shopping Checklist</span>
        </button>
      </div>

      {/* Safety Reassurance Card */}
      <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-start gap-2.5 text-xs text-on-surface-variant leading-relaxed">
        <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <p>
          Ingredients automatically consolidated and cross-checked against active household member
          allergy protocols.
        </p>
      </div>
    </div>
  );
};

import React from 'react';
import { ShieldCheck, AlertTriangle, ShieldAlert } from 'lucide-react';

interface ScannerDemoExamplesProps {
  onSelectSample: (text: string) => void;
}

export const DEMO_SAMPLES = [
  {
    type: 'SAFE' as const,
    title: 'Safe Example (Oat & Seed Mix)',
    description: '100% nut-free & dairy-free ingredients',
    ingredients:
      'Certified gluten-free rolled oats, toasted pumpkin seeds, pure maple syrup, black chia seeds, ground cinnamon, sea salt.',
    icon: ShieldCheck,
    btnClass: 'bg-status-safe-bg/60 text-status-safe-text border-status-safe-text/30 hover:bg-status-safe-bg',
  },
  {
    type: 'CAUTION' as const,
    title: 'Caution Example (Ambiguous & Shared Line)',
    description: 'Natural flavors + shared line cross-contact advisory',
    ingredients:
      'Rolled oats, brown rice syrup, dried blueberries, natural flavors. Manufactured on shared equipment with dairy products.',
    icon: AlertTriangle,
    btnClass: 'bg-status-caution-bg/60 text-status-caution-text border-status-caution-text/30 hover:bg-status-caution-bg',
  },
  {
    type: 'UNSAFE' as const,
    title: 'Unsafe Example (Peanut & Whey)',
    description: 'Contains hydrolyzed peanut protein & whey isolate',
    ingredients:
      'Whole grain oats, cane sugar, crisp rice, whey protein isolate, hydrolyzed peanut protein, sea salt.',
    icon: ShieldAlert,
    btnClass: 'bg-status-unsafe-bg/60 text-status-unsafe-text border-status-unsafe-text/30 hover:bg-status-unsafe-bg',
  },
];

export const ScannerDemoExamples: React.FC<ScannerDemoExamplesProps> = ({
  onSelectSample,
}) => {
  return (
    <div className="bg-surface-container-lowest p-5 sm:p-6 rounded-2xl shadow-tactile border border-outline-variant/40 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm sm:text-base font-bold text-on-surface">
            Try Packaging Label Examples
          </h4>
          <p className="text-xs text-on-surface-variant">
            Click an example to test the deterministic Safety Engine against your active profile.
          </p>
        </div>
        <span className="text-[11px] text-on-surface-variant bg-surface-container px-2.5 py-1 rounded-full font-medium">
          Live Rules Test
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1">
        {DEMO_SAMPLES.map((sample, idx) => {
          const Icon = sample.icon;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectSample(sample.ingredients)}
              className={`p-3.5 rounded-xl border text-left transition-all duration-150 flex flex-col gap-1.5 cursor-pointer shadow-sm hover:shadow active:scale-[0.98] ${sample.btnClass}`}
            >
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{sample.title}</span>
              </div>
              <p className="text-[11px] opacity-85 leading-snug line-clamp-2">
                {sample.description}
              </p>
              <span className="text-[10px] font-semibold underline mt-1">
                Load & Analyze →
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

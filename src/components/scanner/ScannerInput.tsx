import React from 'react';
import { ScanText, RotateCcw, ArrowRight } from 'lucide-react';

interface ScannerInputProps {
  value: string;
  onChange: (val: string) => void;
  onAnalyze: () => void;
  onClear: () => void;
  isAnalyzing?: boolean;
}

export const ScannerInput: React.FC<ScannerInputProps> = ({
  value,
  onChange,
  onAnalyze,
  onClear,
  isAnalyzing = false,
}) => {
  return (
    <div className="bg-surface-container-lowest p-5 sm:p-6 rounded-2xl shadow-tactile border border-outline-variant/40 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-base sm:text-lg text-on-surface">
            Text Ingredient Scanner
          </h3>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Type or paste an ingredient label from packaged foods, recipes, or menus.
          </p>
        </div>
        {value && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-semibold text-on-surface-variant hover:text-error transition-colors flex items-center gap-1 cursor-pointer py-1 px-2 rounded-lg hover:bg-surface-container"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Input</span>
          </button>
        )}
      </div>

      <div className="relative">
        <textarea
          rows={5}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste or type ingredients here (e.g. Milk, cocoa powder, sugar, whey protein concentrate...)"
          className="w-full p-4 rounded-xl bg-surface-container-low text-on-surface placeholder:text-on-surface-variant/60 text-sm leading-relaxed border border-outline-variant/50 focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary shadow-inner resize-y min-h-[120px]"
        />
      </div>

      <div className="flex items-center justify-between gap-3 pt-1">
        <span className="text-xs text-on-surface-variant">
          Analyzed by local deterministic engine • 0% cloud transmission
        </span>
        <button
          type="button"
          onClick={onAnalyze}
          disabled={!value.trim() || isAnalyzing}
          className="h-11 px-6 rounded-xl bg-primary hover:bg-tertiary text-on-primary font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          <ScanText className="w-4 h-4" />
          <span>Analyze Ingredients</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

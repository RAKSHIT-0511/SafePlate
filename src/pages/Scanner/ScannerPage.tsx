import React, { useState } from 'react';
import { UserProfile } from '../../types/profile';
import { evaluateSafety } from '../../safety/safetyEngine';
import { SafetyCheckResult } from '../../safety/types';
import { DEMO_SAMPLES } from '../../components/scanner/ScannerDemoExamples';
import {
  ScanText,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface ScannerPageProps {
  activeProfile: UserProfile | null;
}

export const ScannerPage: React.FC<ScannerPageProps> = ({ activeProfile }) => {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<SafetyCheckResult | null>(null);
  const [showDetailedWhy, setShowDetailedWhy] = useState(false);

  const handleAnalyze = (textToAnalyze?: string) => {
    const text = textToAnalyze !== undefined ? textToAnalyze : inputText;
    if (!text.trim()) return;

    const res = evaluateSafety(text, activeProfile?.allergens || [], {
      profileName: activeProfile?.name || 'Active Member',
    });
    setResult(res);
  };

  const handleSelectDemo = (ingredients: string) => {
    setInputText(ingredients);
    handleAnalyze(ingredients);
  };

  const handleClear = () => {
    setInputText('');
    setResult(null);
  };

  // Main primary safety banner styling
  const getStatusDisplay = (status: 'SAFE' | 'CAUTION' | 'UNSAFE') => {
    switch (status) {
      case 'SAFE':
        return {
          icon: CheckCircle2,
          label: 'SAFE',
          subLabel: 'No Triggers Detected',
          badgeClass: 'bg-[#E6F4EA] text-[#1B5E3C] border-[#1B5E3C]/30',
          dot: '🟢',
        };
      case 'CAUTION':
        return {
          icon: AlertTriangle,
          label: 'CAUTION',
          subLabel: 'Check Packaging Label',
          badgeClass: 'bg-[#FFF4E5] text-[#B76E00] border-[#B76E00]/30',
          dot: '🟠',
        };
      case 'UNSAFE':
        return {
          icon: ShieldAlert,
          label: 'UNSAFE',
          subLabel: 'Contains Known Trigger',
          badgeClass: 'bg-[#FDEDEC] text-[#D64545] border-[#D64545]/30',
          dot: '🔴',
        };
    }
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6 pb-12 animate-fade-in">
      {/* Page Title & Profile Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
            Ingredient Scanner
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
            Check any ingredient list against{' '}
            <strong className="text-on-surface">{activeProfile?.name || 'active profile'}</strong>.
          </p>
        </div>

        {/* Quick Demo Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <span className="text-xs text-on-surface-variant font-semibold">Try Demo:</span>
          {DEMO_SAMPLES.map((demo, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectDemo(demo.ingredients)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-surface-container-low hover:bg-surface-container text-on-surface border border-outline-variant/30 transition-all cursor-pointer shadow-sm active:scale-95 flex items-center gap-1.5"
            >
              <span>
                {demo.type === 'SAFE' && '🟢'}
                {demo.type === 'CAUTION' && '🟠'}
                {demo.type === 'UNSAFE' && '🔴'}
              </span>
              <span>
                {demo.type === 'SAFE' && 'Safe Example'}
                {demo.type === 'CAUTION' && 'Caution Example'}
                {demo.type === 'UNSAFE' && 'Unsafe Example'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Input Card */}
      <div className="bg-surface-container-lowest p-5 sm:p-6 rounded-2xl shadow-tactile border border-outline-variant/40 flex flex-col gap-4">
        <div className="relative">
          <textarea
            rows={5}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste ingredients here..."
            className="w-full p-4 rounded-xl bg-surface-container-low text-on-surface placeholder:text-on-surface-variant/60 text-base leading-relaxed border border-outline-variant/40 focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary shadow-inner resize-y min-h-[130px]"
          />

          {inputText && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute top-3 right-3 text-xs text-on-surface-variant hover:text-error bg-surface-container-lowest/90 px-2.5 py-1 rounded-lg border border-outline-variant/30 transition-colors cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Single Obvious Primary Button: [Check Ingredients] */}
        <button
          type="button"
          onClick={() => handleAnalyze()}
          disabled={!inputText.trim()}
          className="w-full h-13 rounded-xl bg-primary hover:bg-tertiary text-on-primary font-bold text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-40 cursor-pointer"
        >
          <ScanText className="w-5 h-5" />
          <span>Check Ingredients</span>
        </button>
      </div>

      {/* RESULT SECTION - Immediate 🟢 🟠 🔴 Banner + Short Reason */}
      {result && (
        <div className="flex flex-col gap-4 animate-scale-up">
          {(() => {
            const display = getStatusDisplay(result.status);
            const Icon = display.icon;
            const primaryReason =
              result.reasons[0] ||
              (result.status === 'SAFE'
                ? 'No configured allergens were detected in this ingredient list.'
                : 'Allergen triggers detected.');

            return (
              <div
                className={`p-5 sm:p-6 rounded-2xl border-2 shadow-tactile flex flex-col gap-4 ${display.badgeClass}`}
              >
                {/* Status Hero */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-surface-container-lowest flex items-center justify-center shadow-sm shrink-0">
                      <Icon className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{display.dot}</span>
                        <h2 className="text-2xl font-black tracking-tight">{display.label}</h2>
                      </div>
                      <span className="text-xs font-semibold opacity-90">{display.subLabel}</span>
                    </div>
                  </div>

                  <span className="text-xs font-bold bg-surface-container-lowest/80 px-3 py-1 rounded-full text-on-surface shadow-sm">
                    {result.details.profileName}
                  </span>
                </div>

                {/* Short, direct reason */}
                <div className="p-3.5 rounded-xl bg-surface-container-lowest/90 text-on-surface text-sm sm:text-base font-semibold leading-relaxed shadow-sm">
                  {primaryReason}
                </div>

                {/* Matched triggers pills if any */}
                {result.matchedIngredients.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 text-xs text-on-surface">
                    <span className="font-bold">Detected triggers:</span>
                    {result.matchedIngredients.map((ing) => (
                      <span
                        key={ing}
                        className="px-2 py-0.5 rounded-md bg-surface-container-lowest font-mono font-bold text-xs"
                      >
                        {ing}
                      </span>
                    ))}
                  </div>
                )}

                {/* Expandable "Why?" for full details */}
                <div className="pt-2 border-t border-current/20">
                  <button
                    type="button"
                    onClick={() => setShowDetailedWhy(!showDetailedWhy)}
                    className="flex items-center justify-between w-full text-xs font-bold text-on-surface hover:opacity-80 transition-opacity cursor-pointer"
                  >
                    <span>{showDetailedWhy ? 'Hide full details' : 'View full safety details'}</span>
                    {showDetailedWhy ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>

                  {showDetailedWhy && (
                    <div className="mt-3 p-3.5 rounded-xl bg-surface-container-lowest text-xs text-on-surface flex flex-col gap-2 shadow-sm animate-fade-in">
                      <p>
                        <strong>Allergens checked:</strong>{' '}
                        {result.details.checkedAllergens.join(', ') || 'None'}
                      </p>
                      {result.crossContactWarnings.length > 0 && (
                        <p>
                          <strong>Advisories:</strong>{' '}
                          {result.crossContactWarnings.join('; ')}
                        </p>
                      )}
                      {result.ambiguousIngredients.length > 0 && (
                        <p>
                          <strong>Ambiguous items:</strong>{' '}
                          {result.ambiguousIngredients.join(', ')} (verify with manufacturer)
                        </p>
                      )}
                      <div className="flex flex-col gap-1 pt-1">
                        <strong>All engine reasons:</strong>
                        {result.reasons.map((r, i) => (
                          <span key={i} className="text-on-surface-variant">
                            • {r}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

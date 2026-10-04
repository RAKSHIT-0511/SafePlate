import React, { useState } from 'react';
import { SafetyCheckResult } from '../../safety/types';
import { ChevronDown, ChevronUp, ShieldCheck, Check } from 'lucide-react';

interface WhyThisIsSafeAccordionProps {
  safetyResult: SafetyCheckResult;
}

export const WhyThisIsSafeAccordion: React.FC<WhyThisIsSafeAccordionProps> = ({
  safetyResult,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full mt-2 pt-2 border-t border-surface-container/60">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="w-full flex items-center justify-between text-xs font-semibold text-primary hover:text-primary-container transition-colors py-1 cursor-pointer"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Why this is safe</span>
        </span>
        {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="mt-2 p-3 rounded-xl bg-surface-container-low text-xs text-on-surface flex flex-col gap-2 border border-outline-variant/30 animate-fade-in"
        >
          {/* Active Profile */}
          <div className="flex items-center justify-between">
            <span className="text-on-surface-variant text-[11px]">Active Profile:</span>
            <span className="font-bold text-on-surface">{safetyResult.details.profileName}</span>
          </div>

          {/* Allergens Checked */}
          <div className="flex flex-col gap-1">
            <span className="text-on-surface-variant text-[11px]">Allergens Checked:</span>
            <div className="flex flex-wrap gap-1">
              {safetyResult.details.checkedAllergens.length > 0 ? (
                safetyResult.details.checkedAllergens.map((alg) => (
                  <span
                    key={alg}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-container text-primary font-medium text-[10px]"
                  >
                    <Check className="w-2.5 h-2.5" />
                    <span>{alg}</span>
                  </span>
                ))
              ) : (
                <span className="text-on-surface-variant italic text-[11px]">
                  None configured
                </span>
              )}
            </div>
          </div>

          {/* Matched Terms */}
          <div className="flex items-center justify-between">
            <span className="text-on-surface-variant text-[11px]">Matched Triggers:</span>
            <span className="font-semibold text-primary">
              {safetyResult.matchedIngredients.length > 0
                ? safetyResult.matchedIngredients.join(', ')
                : '0 Triggers detected'}
            </span>
          </div>

          {/* Cross-contact */}
          <div className="flex items-center justify-between">
            <span className="text-on-surface-variant text-[11px]">Cross-Contact Advisory:</span>
            <span className="font-semibold text-primary">
              {safetyResult.crossContactWarnings.length > 0
                ? safetyResult.crossContactWarnings.join('; ')
                : 'Clear (Zero cross-contact warnings)'}
            </span>
          </div>

          {/* Safety Reasoning */}
          <div className="pt-1.5 border-t border-surface-container/70 flex flex-col gap-1">
            <span className="text-on-surface-variant text-[11px]">Safety Reasoning:</span>
            {safetyResult.reasons.map((reason, idx) => (
              <p key={idx} className="text-on-surface text-[11px] leading-relaxed">
                • {reason}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

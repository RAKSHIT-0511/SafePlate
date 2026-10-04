import React from 'react';
import { SafetyCheckResult } from '../../safety/types';
import { AlertTriangle, ShieldAlert, CheckCircle2, Info } from 'lucide-react';
import { SeverityBadge } from '../common/SeverityBadge';

interface ScannerResultCardProps {
  result: SafetyCheckResult | null;
}

export const ScannerResultCard: React.FC<ScannerResultCardProps> = ({ result }) => {
  if (!result) return null;

  const statusConfig = {
    SAFE: {
      title: 'VERIFIED SAFE',
      subtitle: 'No configured allergens or ambiguous ingredients detected.',
      bgColor: 'bg-status-safe-bg/60 border-status-safe-text/30',
      bannerBg: 'bg-status-safe-bg text-status-safe-text',
      icon: CheckCircle2,
      badgeText: 'Clear for Active Profile',
    },
    CAUTION: {
      title: 'CAUTION / CHECK LABEL',
      subtitle: 'Ambiguous ingredients or possible cross-contact advisories detected.',
      bgColor: 'bg-status-caution-bg/60 border-status-caution-text/30',
      bannerBg: 'bg-status-caution-bg text-status-caution-text',
      icon: AlertTriangle,
      badgeText: 'Manual Review Advised',
    },
    UNSAFE: {
      title: 'UNSAFE / CONTAINS ALLERGEN',
      subtitle: 'Known profile allergen detected in the analyzed ingredients.',
      bgColor: 'bg-status-unsafe-bg/60 border-status-unsafe-text/30',
      bannerBg: 'bg-status-unsafe-bg text-status-unsafe-text',
      icon: ShieldAlert,
      badgeText: 'Do Not Ingest',
    },
  }[result.status];

  const Icon = statusConfig.icon;

  return (
    <div
      className={`rounded-2xl p-5 sm:p-6 border shadow-tactile flex flex-col gap-5 ${statusConfig.bgColor} transition-all duration-300`}
    >
      {/* Top Banner Status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-outline-variant/30">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 bg-surface-container-lowest shadow-sm">
            <Icon className="w-7 h-7 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-lg sm:text-xl tracking-tight">
                {statusConfig.title}
              </h3>
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-surface-container-lowest/80">
                {statusConfig.badgeText}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
              {statusConfig.subtitle}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:items-end text-xs">
          <span className="text-on-surface-variant font-medium">Evaluated for:</span>
          <span className="font-bold text-on-surface text-sm">
            {result.details.profileName}
          </span>
        </div>
      </div>

      {/* Summary Matrix of Triggers */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Matched Allergens */}
        <div className="bg-surface-container-lowest p-3.5 rounded-xl border border-outline-variant/30 flex flex-col gap-1">
          <span className="text-[11px] uppercase tracking-wider font-bold text-on-surface-variant">
            Matched Allergens
          </span>
          <div className="flex flex-wrap gap-1 mt-0.5">
            {result.matchedAllergens.length > 0 ? (
              result.matchedAllergens.map((alg) => (
                <span
                  key={alg}
                  className="px-2 py-0.5 rounded bg-error-container text-error font-bold text-xs"
                >
                  {alg}
                </span>
              ))
            ) : (
              <span className="text-xs text-primary font-semibold">None detected</span>
            )}
          </div>
        </div>

        {/* Matched Ingredients */}
        <div className="bg-surface-container-lowest p-3.5 rounded-xl border border-outline-variant/30 flex flex-col gap-1">
          <span className="text-[11px] uppercase tracking-wider font-bold text-on-surface-variant">
            Trigger Terms
          </span>
          <div className="flex flex-wrap gap-1 mt-0.5">
            {result.matchedIngredients.length > 0 ? (
              result.matchedIngredients.map((term) => (
                <span
                  key={term}
                  className="px-2 py-0.5 rounded bg-surface-container text-on-surface font-mono text-xs font-semibold"
                >
                  '{term}'
                </span>
              ))
            ) : (
              <span className="text-xs text-primary font-semibold">0 Triggers</span>
            )}
          </div>
        </div>

        {/* Evaluated Severity */}
        <div className="bg-surface-container-lowest p-3.5 rounded-xl border border-outline-variant/30 flex flex-col gap-1">
          <span className="text-[11px] uppercase tracking-wider font-bold text-on-surface-variant">
            Highest Severity
          </span>
          <div className="mt-0.5">
            {result.severity ? (
              <SeverityBadge severity={result.severity} />
            ) : (
              <span className="text-xs text-primary font-semibold">Safe / Clear</span>
            )}
          </div>
        </div>
      </div>

      {/* Safety Reasoning / Explanation */}
      <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30 flex flex-col gap-2">
        <h4 className="text-xs sm:text-sm font-bold text-on-surface flex items-center gap-1.5">
          <Info className="w-4 h-4 text-primary" />
          <span>Safety Reasoning & Explanations</span>
        </h4>
        <div className="flex flex-col gap-1.5 pt-1">
          {result.reasons.map((reason, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2 p-2 rounded-lg bg-surface-container-low/70 text-xs sm:text-sm text-on-surface leading-relaxed"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
              <span>{reason}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Ambiguous Ingredients Alert if Present */}
      {result.ambiguousIngredients.length > 0 && (
        <div className="p-3.5 rounded-xl bg-status-caution-bg text-status-caution-text border border-status-caution-text/30 flex items-start gap-2.5 text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-status-caution-text" />
          <div className="flex flex-col gap-1">
            <strong>Ambiguous items requiring verification:</strong>
            <p>
              Ingredients like {result.ambiguousIngredients.map((i) => `'${i}'`).join(', ')} cannot
              be guaranteed allergen-free without verifying manufacturer processing details.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

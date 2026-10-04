import React from 'react';
import { ShieldCheck, Lock, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-surface-container-low mt-16 sm:mt-24 py-8 sm:py-12 border-t border-surface-container">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6">
        {/* Medical disclaimer callout strip */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-surface-container-lowest p-4 sm:p-5 rounded-2xl shadow-[0_1px_8px_rgba(47,111,78,0.04)] border border-outline-variant/40">
          <div className="flex items-start sm:items-center gap-3 text-secondary">
            <AlertCircle className="w-6 h-6 shrink-0 mt-0.5 sm:mt-0 text-secondary" />
            <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              <strong className="font-bold text-on-surface text-secondary">
                Medical Disclaimer:{' '}
              </strong>
              SafePlate is a planning and ingredient-checking tool and does not replace medical
              advice or careful label reading. Always verify packaging labels directly.
            </p>
          </div>
          <div className="flex items-center gap-1.5 bg-surface-container px-3 py-1.5 rounded-full whitespace-nowrap shrink-0 self-start md:self-auto border border-outline-variant/30">
            <Lock className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary">
              Runs locally on device • 100% Private
            </span>
          </div>
        </div>

        {/* Footer bottom row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-on-surface-variant pt-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span className="font-semibold text-on-surface">SafePlate</span>
            <span>— Deterministic Allergy Safety Engine</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/profiles" className="hover:text-primary transition-colors">
              Profiles
            </Link>
            <Link to="/this-week" className="hover:text-primary transition-colors">
              Planner
            </Link>
            <Link to="/scanner" className="hover:text-primary transition-colors">
              Scanner
            </Link>
            <Link to="/grocery" className="hover:text-primary transition-colors">
              Grocery
            </Link>
          </div>
          <div className="text-on-surface-variant/70 text-xs">
            © {new Date().getFullYear()} SafePlate. Built with React & Vite.
          </div>
        </div>
      </div>
    </footer>
  );
};

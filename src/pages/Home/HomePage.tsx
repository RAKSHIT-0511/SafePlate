import React from 'react';
import { Link } from 'react-router-dom';
import { UserProfile } from '../../types/profile';
import {
  ShieldCheck,
  CalendarDays,
  ScanText,
  ShoppingCart,
  Users,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface HomePageProps {
  activeProfile: UserProfile | null;
}

export const HomePage: React.FC<HomePageProps> = ({ activeProfile }) => {
  const flowSteps = [
    {
      num: '1',
      title: 'Create Profile',
      tag: 'Name & Role',
      desc: 'Set up each person in your household.',
      link: '/profiles?new=true',
      linkText: 'Create Profile',
      icon: Users,
    },
    {
      num: '2',
      title: 'Select Allergies & Severity',
      tag: 'Avoid / Trace OK / Life-Threatening',
      desc: 'Tap allergen chips and choose reaction level.',
      link: '/profiles',
      linkText: 'Choose Allergies',
      icon: ShieldCheck,
    },
    {
      num: '3',
      title: 'Generate Week',
      tag: '21 Safe Meals',
      desc: 'Instant meal plan filtered by your exact safety profile.',
      link: '/this-week',
      linkText: 'Generate Week',
      icon: CalendarDays,
    },
    {
      num: '4',
      title: 'Scan Ingredients',
      tag: '🟢 SAFE / 🟠 CAUTION / 🔴 UNSAFE',
      desc: 'Paste any label text for instant safety clearance.',
      link: '/scanner',
      linkText: 'Scan Ingredients',
      icon: ScanText,
    },
    {
      num: '5',
      title: 'Get Grocery List',
      tag: 'Checklist & 1-Click Copy',
      desc: 'Sorted by grocery aisle ready for your store run.',
      link: '/grocery',
      linkText: 'Copy List',
      icon: ShoppingCart,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8 pb-16 animate-fade-in">
      {/* Visual Hero Header */}
      <section className="text-center flex flex-col items-center gap-3.5 pt-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
          <ShieldCheck className="w-4 h-4" />
          <span>Local Allergy Safety Engine</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-on-surface tracking-tight leading-[1.15]">
          Meals everyone can <span className="text-primary italic font-serif">safely</span> eat.
        </h1>

        <p className="text-sm sm:text-base text-on-surface-variant max-w-lg leading-relaxed">
          Deterministic safety checks. Zero guesswork. Zero AI hallucinations.
        </p>

        {/* ONE OBVIOUS PRIMARY ACTION */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 w-full sm:w-auto">
          <Link
            to="/this-week"
            className="w-full sm:w-auto h-13 px-8 rounded-2xl bg-primary hover:bg-tertiary text-on-primary font-bold text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-5 h-5" />
            <span>Generate Week</span>
            <ArrowRight className="w-5 h-5" />
          </Link>

          <Link
            to="/scanner"
            className="w-full sm:w-auto h-13 px-6 rounded-2xl bg-surface-container-low hover:bg-surface-container text-on-surface font-semibold text-sm transition-all flex items-center justify-center gap-2 border border-outline-variant/30 cursor-pointer"
          >
            <ScanText className="w-4 h-4 text-primary" />
            <span>Check Ingredients</span>
          </Link>
        </div>

        {/* Active Profile Status Pill */}
        {activeProfile && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container-low text-xs border border-outline-variant/30 mt-1">
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
            <span className="text-on-surface-variant">
              Active Filter: <strong className="text-on-surface font-bold">{activeProfile.name}</strong>{' '}
              ({activeProfile.allergens.length > 0
                ? activeProfile.allergens.map((a) => a.allergenName).join(', ')
                : 'No restrictions'}
              )
            </span>
            <Link to="/profiles" className="text-primary font-bold hover:underline ml-1">
              Switch
            </Link>
          </div>
        )}
      </section>

      {/* VISUAL FIRST-TIME USER FLOW */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs sm:text-sm font-bold text-on-surface uppercase tracking-wider">
            Simple 5-Step Safe Flow
          </h2>
          <span className="text-xs text-primary font-bold">Fast & Intuitive</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {flowSteps.map((st) => {
            const Icon = st.icon;
            return (
              <Link
                key={st.num}
                to={st.link}
                className="bg-surface-container-lowest p-5 rounded-2xl shadow-tactile border border-outline-variant/40 hover:border-primary transition-all flex flex-col justify-between gap-3 group select-none cursor-pointer"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 rounded-full bg-primary text-on-primary font-black text-xs flex items-center justify-center shadow-sm">
                      {st.num}
                    </span>
                    <Icon className="w-5 h-5 text-on-surface-variant group-hover:text-primary transition-colors" />
                  </div>
                  <h3 className="font-bold text-base text-on-surface group-hover:text-primary transition-colors">
                    {st.title}
                  </h3>
                  <span className="text-[11px] font-semibold text-primary/90 bg-primary/10 px-2 py-0.5 rounded-md self-start">
                    {st.tag}
                  </span>
                  <p className="text-xs text-on-surface-variant leading-relaxed">{st.desc}</p>
                </div>

                <div className="pt-2 border-t border-surface-container flex items-center justify-between text-xs font-bold text-primary group-hover:translate-x-1 transition-transform">
                  <span>[{st.linkText}]</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Reassuring Guarantee Card */}
      <section className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/40 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-8 h-8 text-primary shrink-0" />
          <div className="text-left">
            <h4 className="font-bold text-sm text-on-surface">100% Client-Side & Private</h4>
            <p className="text-xs text-on-surface-variant">
              No cloud accounts, external databases, or AI APIs. All safety rules run deterministically
              in your browser.
            </p>
          </div>
        </div>

        <Link
          to="/profiles"
          className="h-10 px-4 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary font-bold text-xs flex items-center justify-center shrink-0 transition-colors"
        >
          Manage Household
        </Link>
      </section>
    </div>
  );
};

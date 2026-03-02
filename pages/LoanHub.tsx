
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext.tsx';
import { FarmerProfile } from '../types.ts';

interface BankLoan {
  bankName: string;
  loanScheme: string;
  category: string;
  interestRate: string;
  interestRateNumeric: number;
  eligibility: string;
  officialUrl: string;
  icon: string;
  states: string[]; // which states this loan applies to; [] = all India
  tag?: string;     // e.g. 'Popular', 'Low Interest', 'State Scheme'
}

// ──────────────────────────────────────────────────────────────
//  COMPREHENSIVE REAL INDIAN AGRICULTURAL LOAN DATABASE
// ──────────────────────────────────────────────────────────────
const ALL_LOANS: BankLoan[] = [
  // ── NATIONAL / ALL-INDIA ──────────────────────────
  {
    bankName: 'State Bank of India',
    loanScheme: 'Kisan Credit Card (KCC)',
    category: 'Crop Loan',
    interestRate: '7.00% p.a.',
    interestRateNumeric: 7.0,
    eligibility: 'All farmers, sharecroppers, and tenant farmers. Limit up to ₹3 lakh at 7% with interest subvention.',
    officialUrl: 'https://sbi.co.in/web/personal-banking/loans/agri-loans/kisan-credit-card',
    icon: 'fa-credit-card',
    states: [],
    tag: 'Most Popular',
  },
  {
    bankName: 'State Bank of India',
    loanScheme: 'SBI Agri Gold Loan',
    category: 'Gold Loan',
    interestRate: '8.70% p.a.',
    interestRateNumeric: 8.7,
    eligibility: 'Any farmer owning gold jewellery. Loan up to ₹50 lakh. No income proof needed.',
    officialUrl: 'https://sbi.co.in/web/personal-banking/loans/agri-loans/agri-gold-loan',
    icon: 'fa-coins',
    states: [],
    tag: 'Quick Approval',
  },
  {
    bankName: 'State Bank of India',
    loanScheme: 'SBI Farm Mechanization Loan',
    category: 'Equipment Loan',
    interestRate: '9.00% p.a.',
    interestRateNumeric: 9.0,
    eligibility: 'Individual farmers and joint borrowers for purchase of tractors, harvesters, tillers.',
    officialUrl: 'https://sbi.co.in/web/personal-banking/loans/agri-loans',
    icon: 'fa-tractor',
    states: [],
  },
  {
    bankName: 'NABARD',
    loanScheme: 'Kisan Vikas Patra Refinance',
    category: 'Rural Infrastructure',
    interestRate: '6.50% p.a.',
    interestRateNumeric: 6.5,
    eligibility: 'Cooperative banks & RRBs refinanced by NABARD for agricultural infrastructure development.',
    officialUrl: 'https://www.nabard.org/content.aspx?id=572',
    icon: 'fa-building-columns',
    states: [],
    tag: 'Low Interest',
  },
  {
    bankName: 'NABARD',
    loanScheme: 'Dairy Entrepreneurship Development Scheme',
    category: 'Animal Husbandry',
    interestRate: '6.50% p.a.',
    interestRateNumeric: 6.5,
    eligibility: 'Farmers, dairy co-ops, milk unions. Subsidy: 25% (33% for SC/ST). Loan for purchase of milch animals.',
    officialUrl: 'https://www.nabard.org/content.aspx?id=591',
    icon: 'fa-cow',
    states: [],
  },
  {
    bankName: 'NABARD',
    loanScheme: 'Agri Clinic & Agri Business Centres',
    category: 'Agri Business',
    interestRate: '7.00% p.a.',
    interestRateNumeric: 7.0,
    eligibility: 'Agriculture graduates. Loan up to ₹20 lakh. 44% subsidy for individuals, 36% for groups.',
    officialUrl: 'https://www.nabard.org/content.aspx?id=578',
    icon: 'fa-flask',
    states: [],
  },
  {
    bankName: 'HDFC Bank',
    loanScheme: 'HDFC Tractor Loan',
    category: 'Equipment Loan',
    interestRate: '9.50% p.a.',
    interestRateNumeric: 9.5,
    eligibility: 'Farmers with minimum 2 acres land. 100% financing available. Flexible repayment up to 7 years.',
    officialUrl: 'https://www.hdfcbank.com/personal/borrow/popular-loans/agriculture-loans',
    icon: 'fa-tractor',
    states: [],
  },
  {
    bankName: 'HDFC Bank',
    loanScheme: 'Kisan Gold Card',
    category: 'Crop Loan',
    interestRate: '8.00% p.a.',
    interestRateNumeric: 8.0,
    eligibility: 'All farmers. Flexible cash credit limit based on crop requirement. Valid for 3 years.',
    officialUrl: 'https://www.hdfcbank.com/personal/borrow/popular-loans/agriculture-loans',
    icon: 'fa-credit-card',
    states: [],
  },
  {
    bankName: 'Punjab National Bank',
    loanScheme: 'PNB Krishak Saathi',
    category: 'Crop Loan',
    interestRate: '7.00% p.a.',
    interestRateNumeric: 7.0,
    eligibility: 'Marginal/small farmers. Loan up to ₹50,000. No collateral needed for loans below ₹1.6 lakh.',
    officialUrl: 'https://www.pnbindia.in/agricultural-loans.html',
    icon: 'fa-seedling',
    states: [],
  },

  // ── TAMIL NADU ────────────────────────────────────
  {
    bankName: 'Tamil Nadu State Co-op Bank',
    loanScheme: 'Short Term Crop Loan',
    category: 'Crop Loan',
    interestRate: '3.00% p.a.',
    interestRateNumeric: 3.0,
    eligibility: 'Farmers in Tamil Nadu. Interest subvention brings effective rate to 0% within 365 days. Up to ₹3 lakh.',
    officialUrl: 'https://www.tnscb.co.in/',
    icon: 'fa-wheat-awn',
    states: ['Tamil Nadu'],
    tag: '0% Effective Rate',
  },
  {
    bankName: 'Tamil Nadu State Co-op Bank',
    loanScheme: 'Paddy Procurement Loan',
    category: 'Post-Harvest',
    interestRate: '4.00% p.a.',
    interestRateNumeric: 4.0,
    eligibility: 'Paddy farmers in Tamil Nadu. Loan against paddy stock. Repayable within 6 months.',
    officialUrl: 'https://www.tnscb.co.in/',
    icon: 'fa-box-archive',
    states: ['Tamil Nadu'],
  },
  {
    bankName: 'TAHDCO',
    loanScheme: 'SC/ST Farmer Development Loan',
    category: 'Special Category',
    interestRate: '4.00% p.a.',
    interestRateNumeric: 4.0,
    eligibility: 'SC/ST farmers in Tamil Nadu. Loan up to ₹1 lakh for crop production. Subsidised by TN Govt.',
    officialUrl: 'https://www.tahdco.com/',
    icon: 'fa-hand-holding-heart',
    states: ['Tamil Nadu'],
    tag: 'Govt Subsidised',
  },
  {
    bankName: 'Canara Bank',
    loanScheme: 'Canara Farm House Scheme',
    category: 'Land Development',
    interestRate: '9.25% p.a.',
    interestRateNumeric: 9.25,
    eligibility: 'Farmers in TN/KA. For construction of farm house on agricultural land. Loan up to ₹10 lakh.',
    officialUrl: 'https://canarabank.com/agricultural-loans',
    icon: 'fa-house',
    states: ['Tamil Nadu', 'Karnataka'],
  },

  // ── KERALA ────────────────────────────────────────
  {
    bankName: 'Kerala Bank',
    loanScheme: 'Karshaka Samriddhi Loan',
    category: 'Crop Loan',
    interestRate: '5.00% p.a.',
    interestRateNumeric: 5.0,
    eligibility: 'Farmers in Kerala. For cultivation of paddy, vegetables, banana, coconut. Up to ₹3 lakh.',
    officialUrl: 'https://www.keralabank.com/',
    icon: 'fa-leaf',
    states: ['Kerala'],
    tag: 'Kerala Exclusive',
  },
  {
    bankName: 'Kerala Bank',
    loanScheme: 'Rubber Plantation Loan',
    category: 'Plantation',
    interestRate: '6.00% p.a.',
    interestRateNumeric: 6.0,
    eligibility: 'Rubber farmers in Kerala. For new planting and replanting. Loan up to ₹5 lakh per hectare.',
    officialUrl: 'https://www.keralabank.com/',
    icon: 'fa-tree',
    states: ['Kerala'],
  },
  {
    bankName: 'Kerala Financial Corporation',
    loanScheme: 'Agro-Processing Unit Loan',
    category: 'Agri Business',
    interestRate: '8.50% p.a.',
    interestRateNumeric: 8.5,
    eligibility: 'Small entrepreneurs and farmers in Kerala for setting up agro-processing units. Up to ₹50 lakh.',
    officialUrl: 'https://www.kfc.org/',
    icon: 'fa-industry',
    states: ['Kerala'],
  },

  // ── KARNATAKA ─────────────────────────────────────
  {
    bankName: 'Karnataka Vikas Grameena Bank',
    loanScheme: 'Suvarna KCC',
    category: 'Crop Loan',
    interestRate: '7.00% p.a.',
    interestRateNumeric: 7.0,
    eligibility: 'Farmers in North Karnataka districts. Short-term credit for crop production up to ₹3 lakh.',
    officialUrl: 'https://kvgbank.com/',
    icon: 'fa-credit-card',
    states: ['Karnataka'],
    tag: 'North Karnataka',
  },
  {
    bankName: 'Karnataka State Co-op Apex Bank',
    loanScheme: 'Coffee / Areca Plantation Loan',
    category: 'Plantation',
    interestRate: '6.50% p.a.',
    interestRateNumeric: 6.5,
    eligibility: 'Coffee and arecanut farmers in Coorg, Hassan, Chikmagalur. Up to ₹5 lakh per acre.',
    officialUrl: 'https://www.kscardb.kar.nic.in/',
    icon: 'fa-mug-hot',
    states: ['Karnataka'],
  },

  // ── ANDHRA PRADESH ────────────────────────────────
  {
    bankName: 'AP Grameena Vikas Bank',
    loanScheme: 'YSR Free Crop Insurance',
    category: 'Crop Insurance',
    interestRate: '0.00% p.a.',
    interestRateNumeric: 0.0,
    eligibility: 'All farmers in Andhra Pradesh. Premium fully paid by AP Govt under YSR scheme.',
    officialUrl: 'https://www.apgvb.in/',
    icon: 'fa-shield-halved',
    states: ['Andhra Pradesh'],
    tag: '0% – Govt Paid',
  },
  {
    bankName: 'AP Grameena Vikas Bank',
    loanScheme: 'Rythubandhu Input Support',
    category: 'Investment Support',
    interestRate: '7.00% p.a.',
    interestRateNumeric: 7.0,
    eligibility: 'Land-owning farmers in AP. ₹5,000 per acre per season. Supplementary loan available.',
    officialUrl: 'https://www.apgvb.in/',
    icon: 'fa-hand-holding-dollar',
    states: ['Andhra Pradesh'],
  },

  // ── MAHARASHTRA ───────────────────────────────────
  {
    bankName: 'Maharashtra Gramin Bank',
    loanScheme: 'Shetaji Gold Loan',
    category: 'Gold Loan',
    interestRate: '8.00% p.a.',
    interestRateNumeric: 8.0,
    eligibility: 'Farmers in Maharashtra owning gold. Quick disbursal within 24 hours. Up to ₹20 lakh.',
    officialUrl: 'https://mahagramin.in/',
    icon: 'fa-coins',
    states: ['Maharashtra'],
    tag: '24hr Disbursal',
  },
  {
    bankName: 'Maharashtra Gramin Bank',
    loanScheme: 'Onion/Sugarcane Crop Loan',
    category: 'Crop Loan',
    interestRate: '7.00% p.a.',
    interestRateNumeric: 7.0,
    eligibility: 'Onion and sugarcane farmers in Nashik, Pune, Kolhapur, Solapur districts.',
    officialUrl: 'https://mahagramin.in/',
    icon: 'fa-seedling',
    states: ['Maharashtra'],
  },

  // ── PUNJAB / HARYANA ──────────────────────────────
  {
    bankName: 'Punjab & Sind Bank',
    loanScheme: 'PSB Kisan Tatkal Scheme',
    category: 'Emergency Crop Loan',
    interestRate: '7.25% p.a.',
    interestRateNumeric: 7.25,
    eligibility: 'Farmers facing crop emergencies in Punjab, Haryana. Disbursal within 48 hours. Up to ₹1 lakh.',
    officialUrl: 'https://punjabandsindbank.co.in/',
    icon: 'fa-bolt',
    states: ['Punjab', 'Haryana'],
    tag: '48hr Emergency',
  },

  // ── MICRO-FINANCE / WOMEN ─────────────────────────
  {
    bankName: 'MUDRA Bank',
    loanScheme: 'Kishor / Tarun Agri Loan',
    category: 'Micro Finance',
    interestRate: '8.50% p.a.',
    interestRateNumeric: 8.5,
    eligibility: 'Small and marginal farmers, agri laborers. No collateral. Loan ₹50K–10 lakh.',
    officialUrl: 'https://www.mudra.org.in/',
    icon: 'fa-hand-holding-usd',
    states: [],
  },
  {
    bankName: 'Union Bank of India',
    loanScheme: 'Union Kisan OD Scheme',
    category: 'Overdraft',
    interestRate: '7.70% p.a.',
    interestRateNumeric: 7.7,
    eligibility: 'Farmers with existing SB accounts. Overdraft facility up to ₹5 lakh linked to land records.',
    officialUrl: 'https://www.unionbankofindia.co.in/english/kisan-overdraft.aspx',
    icon: 'fa-money-bill-transfer',
    states: [],
  },
];

// ── Resolve which loans to show based on farmer state ──
function getLoansForState(state: string): BankLoan[] {
  if (!state) return ALL_LOANS;
  const national = ALL_LOANS.filter(l => l.states.length === 0);
  const stateSpecific = ALL_LOANS.filter(l =>
    l.states.some(s => s.toLowerCase() === state.toLowerCase())
  );
  // State-specific first, then national
  const merged = [...stateSpecific, ...national];
  // Deduplicate
  const seen = new Set<string>();
  return merged.filter(l => {
    const key = l.bankName + l.loanScheme;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const LoanHub: React.FC = () => {
  const { t } = useLanguage();
  const [profile, setProfile] = useState<FarmerProfile | null>(null);
  const [loans, setLoans] = useState<BankLoan[]>([]);
  const [appliedLoanIds, setAppliedLoanIds] = useState<string[]>([]);
  const [redirectingTo, setRedirectingTo] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('All');

  useEffect(() => {
    const profileStr = localStorage.getItem('farmerProfile');
    const p = profileStr ? JSON.parse(profileStr) : null;
    setProfile(p);
    setLoans(getLoansForState(p?.state || ''));

    const appliedStr = localStorage.getItem('applied_loans_registry');
    if (appliedStr) setAppliedLoanIds(JSON.parse(appliedStr));
  }, []);

  const handleRedirection = (loan: BankLoan) => {
    const loanId = loan.bankName + '-' + loan.loanScheme;
    const updatedIds = Array.from(new Set([...appliedLoanIds, loanId]));
    setAppliedLoanIds(updatedIds);
    localStorage.setItem('applied_loans_registry', JSON.stringify(updatedIds));
    setRedirectingTo(loan.officialUrl);
    setTimeout(() => {
      window.open(loan.officialUrl, '_blank', 'noopener,noreferrer');
      setRedirectingTo(null);
    }, 1400);
  };

  const categories = ['All', ...Array.from(new Set(loans.map(l => l.category)))];
  const filteredLoans = filter === 'All' ? loans : loans.filter(l => l.category === filter);

  const standardNationalBanks = [
    { bankName: t('bank_sbi'), url: 'https://sbi.co.in/web/personal-banking/loans/agri-loans' },
    { bankName: t('bank_nabard'), url: 'https://www.nabard.org/' },
    { bankName: t('bank_hdfc'), url: 'https://www.hdfcbank.com/personal/borrow/popular-loans/agriculture-loans' },
  ];

  return (
    <div className="bg-stone-50 dark:bg-stone-950 min-h-screen py-16 px-4 transition-colors">
      {redirectingTo && (
        <div className="fixed inset-0 bg-emerald-950/95 backdrop-blur-3xl z-[100] flex flex-col items-center justify-center text-white animate-fade-in">
          <div className="w-24 h-24 bg-emerald-500 rounded-3xl flex items-center justify-center mb-8 animate-pulse shadow-2xl">
            <i className="fas fa-vault text-4xl"></i>
          </div>
          <h3 className="heading-font text-4xl font-black mb-4 tracking-tight">Secure Redirection</h3>
          <p className="text-emerald-400 font-bold uppercase tracking-widest text-[10px]">Connecting to Official Banking Portal</p>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-16 animate-fade-in">
          <div className="inline-flex items-center space-x-3 bg-emerald-900 text-emerald-100 px-5 py-2 rounded-full mb-6 border border-emerald-800 shadow-xl">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Krishi Finance Network</span>
          </div>
          <h1 className="heading-font text-5xl md:text-8xl font-black text-stone-900 dark:text-stone-100 tracking-tighter leading-[0.85]">
            {t('nav_loans').split(' ')[0]} <span className="text-emerald-600">{t('nav_loans').split(' ')[1] || 'Hub'}.</span>
          </h1>
          <p className="text-xl text-stone-500 dark:text-stone-400 font-medium mt-6 max-w-3xl leading-relaxed">
            {t('loan_hub_subtitle')}
          </p>
          {profile?.state && (
            <div className="inline-flex items-center gap-3 mt-6 px-5 py-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl">
              <i className="fas fa-location-dot text-emerald-600 text-sm" />
              <span className="text-sm font-black text-emerald-800 dark:text-emerald-400">
                Showing loans for <span className="text-emerald-600">{profile.state}</span> + All India
              </span>
              <span className="text-[10px] font-black text-emerald-600 bg-emerald-100 dark:bg-emerald-900/50 px-2 py-0.5 rounded-full uppercase tracking-widest">
                {filteredLoans.length} schemes
              </span>
            </div>
          )}
        </div>

        {/* National Banks Quick Access */}
        <section className="mb-16">
          <h2 className="text-sm font-black uppercase tracking-[0.4em] text-stone-400 mb-8 flex items-center">
            <i className="fas fa-landmark mr-4 text-emerald-600"></i> {t('bank_national')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {standardNationalBanks.map((bank, i) => (
              <div key={i} className="bg-white dark:bg-stone-900 p-8 rounded-[3rem] border border-stone-100 dark:border-stone-800 shadow-sm flex flex-col justify-between group hover:shadow-2xl hover:border-emerald-500/40 transition-all">
                <h3 className="text-xl font-black text-stone-900 dark:text-stone-100 mb-6">{bank.bankName}</h3>
                <button onClick={() => window.open(bank.url, '_blank')} className="text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-900 flex items-center gap-2">
                  {t('btn_apply_bank')} <i className="fas fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Category Filter */}
        <section>
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <h2 className="text-sm font-black uppercase tracking-[0.4em] text-stone-400 flex items-center">
              <i className="fas fa-magnifying-glass-location mr-4 text-emerald-600"></i>
              {profile?.state ? `${profile.state} & National Loan Schemes` : t('bank_state_specific')}
            </h2>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${filter === cat
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                    : 'bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-500 hover:border-emerald-500 hover:text-emerald-600'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in">
            {filteredLoans.map((loan, idx) => {
              const loanId = loan.bankName + '-' + loan.loanScheme;
              const isApplied = appliedLoanIds.includes(loanId);
              const isStateSpecific = loan.states.length > 0;

              return (
                <div key={idx} className="bg-white dark:bg-stone-900 rounded-[4rem] border border-stone-100 dark:border-stone-800 shadow-sm hover:shadow-2xl transition-all group overflow-hidden flex flex-col relative">

                  {/* State-specific ribbon */}
                  {isStateSpecific && (
                    <div className="absolute top-5 right-5 bg-emerald-500 text-white text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
                      {loan.states[0]}
                    </div>
                  )}

                  {/* Tag badge */}
                  {loan.tag && (
                    <div className="absolute top-5 left-5 bg-amber-400 text-amber-950 text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
                      {loan.tag}
                    </div>
                  )}

                  <div className="p-10 flex-grow pt-14">
                    <div className="flex justify-between items-start mb-8">
                      <div className="w-14 h-14 bg-stone-50 dark:bg-stone-800 rounded-2xl flex items-center justify-center text-emerald-600 text-2xl shadow-inner group-hover:rotate-6 transition-transform">
                        <i className={`fas ${loan.icon || 'fa-piggy-bank'}`}></i>
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-stone-400 bg-stone-100 dark:bg-stone-800 px-3 py-1 rounded-full">
                        {loan.category}
                      </span>
                    </div>

                    <h3 className="text-xl font-black text-stone-900 dark:text-stone-100 mb-1 tracking-tighter leading-tight">{loan.bankName}</h3>
                    <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-6">{loan.loanScheme}</p>

                    <div className="bg-stone-50 dark:bg-stone-950 p-5 rounded-3xl mb-6">
                      <p className="text-[8px] font-black text-stone-400 uppercase tracking-[0.2em] mb-1">Interest Rate</p>
                      <p className={`text-3xl font-black tracking-tighter ${loan.interestRateNumeric === 0 ? 'text-emerald-500' : 'text-emerald-950 dark:text-emerald-400'}`}>
                        {loan.interestRate}
                      </p>
                    </div>

                    <div>
                      <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-2">Eligibility</p>
                      <p className="text-xs font-bold text-stone-600 dark:text-stone-400 leading-relaxed line-clamp-3">{loan.eligibility}</p>
                    </div>
                  </div>

                  <div className="px-10 py-8 bg-stone-50 dark:bg-stone-800/30 border-t border-stone-100 dark:border-stone-800">
                    <button
                      onClick={() => handleRedirection(loan)}
                      className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-[9px] shadow-lg transition-all ${isApplied
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-emerald-900 dark:bg-emerald-700 text-white hover:bg-black active:scale-95'
                        }`}
                    >
                      {isApplied ? `✓ ${t('loan_applied')}` : t('btn_apply_bank')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Info footer */}
        <div className="mt-20 p-10 bg-white dark:bg-stone-900 rounded-[3rem] border border-stone-100 dark:border-stone-800">
          <div className="flex items-start gap-6">
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center flex-shrink-0">
              <i className="fas fa-circle-info text-amber-600 text-lg"></i>
            </div>
            <div>
              <h5 className="font-black text-stone-900 dark:text-stone-100 mb-2">Disclaimer</h5>
              <p className="text-xs text-stone-400 leading-relaxed">
                Interest rates and eligibility criteria are indicative and subject to change by the respective banks. Please visit the official bank website or your nearest branch for accurate and current information. UzhavanForum is not responsible for any discrepancies.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanHub;

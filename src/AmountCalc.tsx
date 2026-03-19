import React, { useState, useMemo, useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { AlertCircle, TrendingUp, TrendingDown, Minus, IndianRupee, Percent, Calendar, PiggyBank, Briefcase, Clock, CheckCircle2, Coins } from 'lucide-react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function ScrollFadeIn({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const staggerItem = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

const fmt = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');
const fmtLakhs = (n: number) => n >= 10000000 ? `₹${(n / 10000000).toFixed(2)} Cr` : `₹${(n / 100000).toFixed(2)} L`;

const getFOIR = (income: number): number => {
  if (income < 50000) return 0.40;
  if (income < 100000) return 0.50;
  if (income < 200000) return 0.55;
  return 0.60;
};

const getLTV = (propertyValue: number): number => {
  if (propertyValue <= 3000000) return 0.90;
  if (propertyValue <= 7500000) return 0.80;
  return 0.75;
};

const getLTVPremium = (ltv: number): number => {
  if (ltv <= 0.60) return -0.10;
  if (ltv <= 0.75) return 0.00;
  if (ltv <= 0.80) return 0.25;
  return 0.50;
};

const getCIBILAdjustment = (score: number): { factor: number; label: string; color: string } => {
  if (score >= 800) return { factor: 1.05, label: '+5% (Excellent)', color: 'text-green-600' };
  if (score >= 750) return { factor: 1.00, label: 'No change (Good)', color: 'text-blue-600' };
  if (score >= 700) return { factor: 0.95, label: '−5% (Fair)', color: 'text-amber-600' };
  if (score >= 650) return { factor: 0.85, label: '−15% (Below Avg)', color: 'text-orange-600' };
  return { factor: 0, label: 'High Risk — Not Eligible', color: 'text-red-500' };
};

const getBaseRate = (score: number): { rate: number; band: string } => {
  if (score >= 800) return { rate: 7.25, band: '800+' };
  if (score >= 775) return { rate: 7.50, band: '775–799' };
  if (score >= 750) return { rate: 7.75, band: '750–774' };
  if (score >= 725) return { rate: 8.10, band: '725–749' };
  if (score >= 700) return { rate: 8.50, band: '700–724' };
  if (score >= 675) return { rate: 8.95, band: '675–699' };
  if (score >= 650) return { rate: 9.50, band: '650–674' };
  return { rate: 10.25, band: 'Below 650' };
};

const emiToLoan = (emi: number, annualRate: number, months: number): number => {
  const r = annualRate / 12 / 100;
  if (r === 0) return emi * months;
  return emi * (Math.pow(1 + r, months) - 1) / (r * Math.pow(1 + r, months));
};

type Employment = 'salaried' | 'self-employed' | 'professional';
type AssessmentMethod = 'itr' | 'adb' | 'gst-turnover';

const RETIREMENT_AGE: Record<Employment, number> = { 'salaried': 60, 'self-employed': 60, 'professional': 65 };
const MAX_TENURE: Record<Employment, number> = { 'salaried': 30, 'self-employed': 20, 'professional': 30 };

const AmountCalc = () => {
  const [monthlySalary, setMonthlySalary] = useState(100000);
  const [age, setAge] = useState(30);
  const [cibil, setCibil] = useState(760);
  const [employment, setEmployment] = useState<Employment>('salaried');
  const [assessmentMethod, setAssessmentMethod] = useState<AssessmentMethod>('itr');
  // ITR / P&L — banks average last 2 years
  const [itrRevY1, setItrRevY1] = useState(2800000);
  const [itrExpY1, setItrExpY1] = useState(1700000);
  const [itrRevY2, setItrRevY2] = useState(3200000);
  const [itrExpY2, setItrExpY2] = useState(1900000);
  // GST Turnover
  const [gstAnnualSales, setGstAnnualSales] = useState(5000000);
  const [turnoverFactor, setTurnoverFactor] = useState(12);
  // ADB
  const [avgBankBalance, setAvgBankBalance] = useState(500000);
  const [adbFactor, setAdbFactor] = useState(27);
  // Common for non-salaried
  const [recognitionRate, setRecognitionRate] = useState(100);

  // Derived monthly income based on method
  // ITR: avg net profit of last 2 financial years (bank standard)
  const itrProfitY1 = Math.max(itrRevY1 - itrExpY1, 0);
  const itrProfitY2 = Math.max(itrRevY2 - itrExpY2, 0);
  const itrAvgProfit = (itrProfitY1 + itrProfitY2) / 2;
  const itrMonthlyIncome = itrAvgProfit / 12;
  // GST: annual sales × turnover-to-income factor / 12
  const gstMonthlyIncome = (gstAnnualSales * (Math.min(Math.max(turnoverFactor, 10), 15) / 100)) / 12;
  // ADB: avg balance × ADB multiplier
  const adbMonthlyIncome = avgBankBalance * (Math.min(Math.max(adbFactor, 25), 30) / 100);

  const derivedMonthlyIncome =
    employment === 'salaried' ? monthlySalary
    : assessmentMethod === 'itr' ? itrMonthlyIncome
    : assessmentMethod === 'gst-turnover' ? gstMonthlyIncome
    : adbMonthlyIncome;
  const [obligations, setObligations] = useState(10000);
  const [rateOverride, setRateOverride] = useState(false);
  const [customRate, setCustomRate] = useState(8.50);
  const cibilRate = getBaseRate(cibil);
  const interestRate = rateOverride ? customRate : cibilRate.rate;
  const [propertyValue, setPropertyValue] = useState(5000000);
  const [loanApplied, setLoanApplied] = useState(4000000);
  const [foirOverride, setFoirOverride] = useState(false);
  const [customFOIR, setCustomFOIR] = useState(50);

  const retirementAge = RETIREMENT_AGE[employment];
  const ageError = age < 21 ? 'Minimum age is 21.' : age >= retirementAge ? `Age must be below ${retirementAge} for ${employment} category.` : null;
  const cibilAdj = getCIBILAdjustment(cibil);

  // Display-only: compute the effective FOIR the same way the calculation does
  const displayRecognisedIncome = derivedMonthlyIncome * ((employment === 'salaried' ? 100 : recognitionRate) / 100);
  const displaySlabFOIR = employment === 'self-employed' ? Math.max(getFOIR(displayRecognisedIncome) - 0.05, 0.35) : getFOIR(displayRecognisedIncome);

  const results = useMemo(() => {
    if (ageError) return null;

    // Salaried: 100% recognition always. Non-salaried: bank applies haircut.
    const effectiveRecognition = employment === 'salaried' ? 100 : recognitionRate;
    const recognisedIncome = derivedMonthlyIncome * (effectiveRecognition / 100);

    // FOIR: slab-based. Self-employed gets −5% penalty (higher risk).
    // Professionals get full slab (stable income like doctors/CAs).
    const foirRate = getFOIR(recognisedIncome);
    const slabFOIR = employment === 'self-employed' ? Math.max(foirRate - 0.05, 0.35) : foirRate;
    const effectiveFOIR = foirOverride ? customFOIR / 100 : slabFOIR;
    const maxEMI = recognisedIncome * effectiveFOIR;

    const netEMI = maxEMI - obligations;
    if (netEMI <= 0) return { eligible: false as const, maxEMI, netEMI, foirRate: effectiveFOIR };

    const remainingYears = RETIREMENT_AGE[employment] - age;
    const tenureYears = Math.min(remainingYears, MAX_TENURE[employment]);
    const tenureMonths = tenureYears * 12;

    const ltvSlab = getLTV(propertyValue);
    const loanByLTV = propertyValue * ltvSlab;
    const actualLTV = loanApplied / propertyValue;
    const ltvPremium = getLTVPremium(Math.min(actualLTV, ltvSlab));
    const effectiveRate = interestRate + ltvPremium;

    const loanFromEMI = emiToLoan(netEMI, effectiveRate, tenureMonths);

    const cibilAdj = getCIBILAdjustment(cibil);
    if (cibilAdj.factor === 0) return { eligible: false as const, maxEMI, netEMI, foirRate: effectiveFOIR, cibilAdj };

    const preCreditLoan = Math.min(loanFromEMI, loanByLTV, loanApplied);
    const finalLoan = preCreditLoan * cibilAdj.factor;

    return {
      eligible: true as const, foirRate: effectiveFOIR, recognisedIncome, maxEMI, netEMI,
      tenureYears, tenureMonths, loanFromEMI, loanByLTV, ltvSlab, actualLTV, ltvPremium, effectiveRate,
      cibilAdj, preCreditLoan, finalLoan,
    };
  }, [derivedMonthlyIncome, recognitionRate, foirOverride, customFOIR, age, cibil, employment, obligations, interestRate, propertyValue, loanApplied, ageError, rateOverride, customRate]);

  const inputClass = "w-full text-lg font-bold text-[#144d78] bg-[#144d78]/[0.03] rounded-2xl px-4 py-3.5 outline-none border-2 border-transparent focus:border-[#46b8c3] focus:bg-white transition-all";
  const inputWithPrefixClass = "w-full text-lg font-bold text-[#144d78] bg-[#144d78]/[0.03] rounded-2xl pl-8 pr-4 py-3.5 outline-none border-2 border-transparent focus:border-[#46b8c3] focus:bg-white transition-all";
  const labelClass = "text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5";

  return (
    <>
      {/* ── INPUTS CARD ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 mt-10 mb-10"
      >
        {/* Employment Type Toggle */}
        <div className="mb-6">
          <label className={labelClass}>
            <Briefcase className="w-3.5 h-3.5" /> Employment Type
          </label>
          <div className="grid grid-cols-3 gap-3">
            {([
              { value: 'salaried', label: 'Salaried' },
              { value: 'self-employed', label: 'Self-Employed' },
              { value: 'professional', label: 'Professional' },
            ] as { value: Employment; label: string }[]).map(({ value, label }) => (
              <button
                key={value}
                onClick={() => { setEmployment(value); setAssessmentMethod('itr'); setRecognitionRate(100); }}
                className={cn(
                  'py-3 rounded-2xl border-2 text-sm font-semibold transition-all',
                  employment === value
                    ? 'bg-[#144d78] text-white border-[#144d78]'
                    : 'bg-[#144d78]/[0.03] text-[#144d78] border-transparent hover:border-[#46b8c3]'
                )}
              >
                {label}
              </button>
            ))}
          </div>
          {employment === 'professional' && (
            <p className="text-xs text-[#46b8c3] mt-2 pl-1 font-medium">Tenure extended to age 65</p>
          )}
        </div>

        {/* Assessment Method — non-salaried */}
        {employment !== 'salaried' && (
          <div className="mb-6">
            <label className={labelClass}>
              <Percent className="w-3.5 h-3.5" /> Income Assessment
            </label>
            <div className="grid grid-cols-3 gap-3">
              {([
                { value: 'itr', label: 'ITR / P&L' },
                { value: 'adb', label: 'Avg Daily Balance' },
                { value: 'gst-turnover', label: 'GST Turnover' },
              ] as { value: AssessmentMethod; label: string }[]).map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setAssessmentMethod(value)}
                  className={cn(
                    'py-2.5 rounded-2xl border-2 text-xs font-semibold transition-all',
                    assessmentMethod === value
                      ? 'bg-[#1b6896] text-white border-[#1b6896]'
                      : 'bg-[#46b8c3]/[0.05] text-[#1b6896] border-transparent hover:border-[#46b8c3]'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Main Input Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          {/* === INCOME SECTION — varies by employment + method === */}
          {employment === 'salaried' ? (
            <div>
              <label className={labelClass}>
                <IndianRupee className="w-3.5 h-3.5" /> Monthly Salary
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1b6896]/40 font-semibold text-sm">₹</span>
                <input type="number" value={monthlySalary} onChange={(e) => setMonthlySalary(Number(e.target.value))} className={inputWithPrefixClass} />
              </div>
              <p className="text-xs font-medium text-[#46b8c3] mt-2 pl-1">{fmtLakhs(monthlySalary * 12)}/yr</p>
            </div>
          ) : assessmentMethod === 'itr' ? (
            <>
              <div>
                <label className={labelClass}>
                  <IndianRupee className="w-3.5 h-3.5" /> Revenue (FY1)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1b6896]/40 font-semibold text-sm">₹</span>
                  <input type="number" value={itrRevY1} onChange={(e) => setItrRevY1(Number(e.target.value))} className={inputWithPrefixClass} />
                </div>
                <p className="text-xs font-medium text-slate-400 mt-2 pl-1">Profit: {fmtLakhs(itrProfitY1)}</p>
              </div>
              <div>
                <label className={labelClass}>
                  <Coins className="w-3.5 h-3.5" /> Expenses (FY1)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1b6896]/40 font-semibold text-sm">₹</span>
                  <input type="number" value={itrExpY1} onChange={(e) => setItrExpY1(Number(e.target.value))} className={inputWithPrefixClass} />
                </div>
                <p className="text-xs font-medium mt-2 pl-1 invisible">&nbsp;</p>
              </div>
              <div>
                <label className={labelClass}>
                  <IndianRupee className="w-3.5 h-3.5" /> Revenue (FY2)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1b6896]/40 font-semibold text-sm">₹</span>
                  <input type="number" value={itrRevY2} onChange={(e) => setItrRevY2(Number(e.target.value))} className={inputWithPrefixClass} />
                </div>
                <p className="text-xs font-medium text-slate-400 mt-2 pl-1">Profit: {fmtLakhs(itrProfitY2)}</p>
              </div>
              <div>
                <label className={labelClass}>
                  <Coins className="w-3.5 h-3.5" /> Expenses (FY2)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1b6896]/40 font-semibold text-sm">₹</span>
                  <input type="number" value={itrExpY2} onChange={(e) => setItrExpY2(Number(e.target.value))} className={inputWithPrefixClass} />
                </div>
                <p className="text-xs font-medium text-[#46b8c3] mt-2 pl-1">Avg: {fmtLakhs(itrAvgProfit)}/yr → {fmt(itrMonthlyIncome)}/mo</p>
              </div>
            </>
          ) : assessmentMethod === 'gst-turnover' ? (
            <>
              <div>
                <label className={labelClass}>
                  <IndianRupee className="w-3.5 h-3.5" /> Annual GST Sales
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1b6896]/40 font-semibold text-sm">₹</span>
                  <input type="number" value={gstAnnualSales} onChange={(e) => setGstAnnualSales(Number(e.target.value))} className={inputWithPrefixClass} />
                </div>
                <p className="text-xs font-medium text-[#46b8c3] mt-2 pl-1">{fmtLakhs(gstAnnualSales)}</p>
              </div>
              <div>
                <label className={labelClass}>
                  <Percent className="w-3.5 h-3.5" /> Turnover Factor
                </label>
                <div className="relative">
                  <input type="number" value={turnoverFactor} onChange={(e) => setTurnoverFactor(Number(e.target.value))} min={10} max={15} className={inputClass} />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1b6896]/40 font-semibold text-sm">%</span>
                </div>
                <p className="text-xs font-medium text-slate-400 mt-2 pl-1">Banks use 10–15% → {fmt(gstMonthlyIncome)}/mo</p>
              </div>
            </>
          ) : (
            /* ADB */
            <>
              <div>
                <label className={labelClass}>
                  <IndianRupee className="w-3.5 h-3.5" /> Avg Bank Balance
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1b6896]/40 font-semibold text-sm">₹</span>
                  <input type="number" value={avgBankBalance} onChange={(e) => setAvgBankBalance(Number(e.target.value))} className={inputWithPrefixClass} />
                </div>
                <p className="text-xs font-medium text-[#46b8c3] mt-2 pl-1">{fmtLakhs(avgBankBalance)}</p>
              </div>
              <div>
                <label className={labelClass}>
                  <Percent className="w-3.5 h-3.5" /> ADB Factor
                </label>
                <div className="relative">
                  <input type="number" value={adbFactor} onChange={(e) => setAdbFactor(Number(e.target.value))} min={25} max={30} className={inputClass} />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1b6896]/40 font-semibold text-sm">%</span>
                </div>
                <p className="text-xs font-medium text-slate-400 mt-2 pl-1">Banks use 25–30% → {fmt(adbMonthlyIncome)}/mo</p>
              </div>
            </>
          )}

          {/* Recognition Rate — non-salaried only, inline in the grid */}
          {employment !== 'salaried' && (
            <div>
              <label className={labelClass}>
                <Percent className="w-3.5 h-3.5" /> Recognition Rate
              </label>
              <div className="relative">
                <input type="number" value={recognitionRate} onChange={(e) => setRecognitionRate(Number(e.target.value))} min={50} max={100} className={inputClass} />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1b6896]/40 font-semibold text-sm">%</span>
              </div>
              <p className="text-xs font-medium text-slate-400 mt-2 pl-1">Recognised: {fmt(derivedMonthlyIncome * recognitionRate / 100)}/mo</p>
            </div>
          )}

          {/* Age */}
          <div>
            <label className={labelClass}>
              <Calendar className="w-3.5 h-3.5" /> Age
            </label>
            <div className="relative">
              <input type="number" value={age} onChange={(e) => setAge(Number(e.target.value))} min={21} max={65} className={inputClass} />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1b6896]/40 font-semibold text-sm">yrs</span>
            </div>
            {ageError ? (
              <p className="text-xs font-medium text-red-500 mt-2 pl-1">{ageError}</p>
            ) : (
              <p className="text-xs font-medium mt-2 pl-1 invisible">&nbsp;</p>
            )}
          </div>

          {/* CIBIL Score */}
          <div>
            <label className={labelClass}>
              <CheckCircle2 className="w-3.5 h-3.5" /> CIBIL Score
            </label>
            <input type="number" value={cibil} onChange={(e) => setCibil(Number(e.target.value))} min={300} max={900} className={inputClass} />
            <p className={cn("text-xs font-medium mt-2 pl-1", cibilAdj.color)}>{cibilAdj.label}</p>
          </div>

          {/* Interest Rate — auto from CIBIL */}
          <div>
            <label className={labelClass}>
              <Percent className="w-3.5 h-3.5" /> Interest Rate
              <button
                onClick={() => setRateOverride(p => !p)}
                className={cn(
                  'ml-auto text-[10px] px-2 py-0.5 rounded-lg border font-semibold transition-all',
                  rateOverride ? 'bg-[#144d78] text-white border-[#144d78]' : 'border-slate-300 text-slate-400'
                )}
              >
                {rateOverride ? 'Custom' : 'Auto'}
              </button>
            </label>
            {rateOverride ? (
              <div className="relative">
                <input type="number" value={customRate} onChange={(e) => setCustomRate(Number(e.target.value))} min={6} max={15} step={0.25} className={inputClass} />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1b6896]/40 font-semibold text-sm">%</span>
              </div>
            ) : (
              <div className="w-full text-lg font-bold text-[#144d78] bg-[#144d78]/[0.03] rounded-2xl px-4 py-3.5">
                {cibilRate.rate}%
                <span className="text-slate-400 font-normal text-sm ml-1">({cibilRate.band})</span>
              </div>
            )}
            <p className="text-xs font-medium text-[#46b8c3] mt-2 pl-1">CIBIL {cibil} → {cibilRate.band} band</p>
          </div>

          {/* Existing Obligations */}
          <div>
            <label className={labelClass}>
              <Coins className="w-3.5 h-3.5" /> Existing EMIs
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1b6896]/40 font-semibold text-sm">₹</span>
              <input type="number" value={obligations} onChange={(e) => setObligations(Number(e.target.value))} className={inputWithPrefixClass} />
            </div>
            <p className="text-xs font-medium mt-2 pl-1 invisible">&nbsp;</p>
          </div>

          {/* Property Value */}
          <div>
            <label className={labelClass}>
              <PiggyBank className="w-3.5 h-3.5" /> Property Value
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1b6896]/40 font-semibold text-sm">₹</span>
              <input type="number" value={propertyValue} onChange={(e) => setPropertyValue(Number(e.target.value))} className={inputWithPrefixClass} />
            </div>
            <p className="text-xs font-medium text-[#46b8c3] mt-2 pl-1">{fmtLakhs(propertyValue)}</p>
          </div>

          {/* Loan Applied */}
          <div>
            <label className={labelClass}>
              <IndianRupee className="w-3.5 h-3.5" /> Loan Applied For
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1b6896]/40 font-semibold text-sm">₹</span>
              <input type="number" value={loanApplied} onChange={(e) => setLoanApplied(Number(e.target.value))} className={inputWithPrefixClass} />
            </div>
            <p className={cn("text-xs font-medium mt-2 pl-1", loanApplied > propertyValue ? 'text-red-500' : 'text-[#46b8c3]')}>
              {loanApplied > propertyValue ? `Exceeds property value (${fmtLakhs(propertyValue)})` : fmtLakhs(loanApplied)}
            </p>
          </div>

          {/* FOIR */}
          <div>
            <label className={labelClass}>
              <Percent className="w-3.5 h-3.5" /> FOIR
              <button
                onClick={() => setFoirOverride(p => !p)}
                className={cn(
                  'ml-auto text-[10px] px-2 py-0.5 rounded-lg border font-semibold transition-all',
                  foirOverride ? 'bg-[#144d78] text-white border-[#144d78]' : 'border-slate-300 text-slate-400'
                )}
              >
                {foirOverride ? 'Custom' : 'Auto'}
              </button>
            </label>
            {foirOverride ? (
              <div className="relative">
                <input type="number" value={customFOIR} onChange={(e) => setCustomFOIR(Number(e.target.value))} min={20} max={70} className={inputClass} />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1b6896]/40 font-semibold text-sm">%</span>
              </div>
            ) : (
              <div className="w-full text-lg font-bold text-[#144d78] bg-[#144d78]/[0.03] rounded-2xl px-4 py-3.5">
                {(displaySlabFOIR * 100).toFixed(0)}%
                <span className="text-slate-400 font-normal text-sm ml-1">(auto{employment === 'self-employed' ? ', SE −5%' : ''})</span>
              </div>
            )}
            <p className="text-xs font-medium mt-2 pl-1 invisible">&nbsp;</p>
          </div>
        </div>
      </motion.div>

      {/* ── HERO SECTION ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-gradient-to-br from-[#144d78] to-[#1b6896] rounded-3xl border border-[#1b6896] shadow-2xl p-8 md:p-12 mb-10 text-center relative overflow-hidden"
      >
        <div className="absolute right-0 top-0 w-72 h-72 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute left-0 bottom-0 w-48 h-48 bg-[#46b8c3]/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3"></div>

        {results?.eligible ? (
          <>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight relative z-10">
              You're eligible for <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#46b8c3] to-[#8edce4]">{fmtLakhs(results.finalLoan)}</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/60 font-light leading-relaxed max-w-2xl mx-auto relative z-10">
              Based on your {fmt(derivedMonthlyIncome)}/mo income, {cibil} CIBIL score, and {fmtLakhs(propertyValue)} property.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-6 leading-tight relative z-10">
              {ageError ? 'Age Out of Range' : cibilAdj.factor === 0 ? 'CIBIL Too Low' : 'Obligations Too High'}
            </h1>
            <p className="text-xl text-white/60 font-light leading-relaxed max-w-2xl mx-auto relative z-10">
              {ageError || (cibilAdj.factor === 0 ? 'CIBIL score below 650 — most lenders will decline.' : 'Existing EMIs exceed your allowed capacity. Reduce obligations or increase income.')}
            </p>
          </>
        )}
      </motion.div>
      {/* ── CONTEXT STRIP ── */}
      {results?.eligible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 mb-10"
        >
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08, delayChildren: 0.35 } } }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <motion.div variants={staggerItem}>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5" /> FOIR Applied
              </label>
              <div className="w-full text-lg font-bold text-[#144d78] bg-[#144d78]/[0.03] rounded-2xl px-4 py-3.5">
                {(results.foirRate * 100).toFixed(0)}%
                <span className="text-slate-400 font-normal text-sm ml-1">
                  {employment === 'self-employed' ? '(SE −5%)' : employment === 'salaried' ? '(salaried)' : '(slab)'}
                </span>
              </div>
            </motion.div>
            <motion.div variants={staggerItem}>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5" /> Net EMI Capacity
              </label>
              <div className="w-full text-lg font-bold text-[#144d78] bg-[#144d78]/[0.03] rounded-2xl px-4 py-3.5">
                {fmt(results.netEMI)}
              </div>
            </motion.div>
            <motion.div variants={staggerItem}>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Max Tenure
              </label>
              <div className="w-full text-lg font-bold text-[#144d78] bg-[#144d78]/[0.03] rounded-2xl px-4 py-3.5">
                {results.tenureYears} Years
              </div>
            </motion.div>
            <motion.div variants={staggerItem}>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <TrendingDown className="w-3.5 h-3.5" /> Effective Rate
              </label>
              <div className="w-full text-lg font-bold text-[#144d78] bg-[#144d78]/[0.03] rounded-2xl px-4 py-3.5">
                {results.effectiveRate.toFixed(2)}%
                {results.ltvPremium !== 0 && (
                  <span className={cn("text-sm font-normal ml-1", results.ltvPremium > 0 ? 'text-amber-500' : 'text-green-500')}>
                    ({results.ltvPremium > 0 ? '+' : ''}{results.ltvPremium}% LTV)
                  </span>
                )}
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
      {/* ── DETAIL SECTIONS ── */}
      {results?.eligible && (
        <>
          {/* CIBIL Adjustment + Loan Constraints — two cards side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            {/* CIBIL Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className={cn(
                'bg-white rounded-3xl p-8 shadow-sm border hover:shadow-lg transition-shadow duration-300',
                cibil > 780 ? 'border-green-200' : cibil >= 750 ? 'border-blue-200' : 'border-amber-200'
              )}
            >
              <div className="mb-6">
                <div className={cn(
                  'inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold',
                  cibil > 780 ? 'bg-green-100 text-green-700' : cibil >= 750 ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                )}>
                  {cibil > 780 ? <TrendingUp className="w-4 h-4" /> : cibil >= 750 ? <Minus className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  CIBIL: {cibil}
                </div>
              </div>
              <h3 className="text-2xl font-bold text-[#0d3a5c] mb-2">Credit Score Impact</h3>
              <p className="text-sm text-slate-500 mb-8">Your score of {cibil} results in a <span className={cn('font-semibold', cibilAdj.color)}>{cibilAdj.label}</span> adjustment.</p>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                  <span className="text-sm text-slate-500">Pre-adjustment</span>
                  <span className="text-sm font-semibold text-[#0d3a5c]">{fmt(results.preCreditLoan)}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                  <span className="text-sm text-slate-500">Multiplier</span>
                  <span className="text-sm font-semibold text-[#0d3a5c]">×{results.cibilAdj.factor}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-sm text-slate-500 flex items-center gap-2"><PiggyBank className="w-4 h-4" /> Final Amount</span>
                  <span className="text-sm font-bold text-[#46b8c3]">{fmt(results.finalLoan)}</span>
                </div>
              </div>
            </motion.div>

            {/* Loan Constraints Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-[#144d78] rounded-3xl p-8 shadow-sm border border-[#1b6896] hover:shadow-lg transition-shadow duration-300 text-white relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#1b6896]/30 to-transparent pointer-events-none"></div>
              <div className="mb-6 relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#46b8c3]/20 text-[#46b8c3] text-sm font-semibold border border-[#46b8c3]/30">
                  Loan Constraints
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2 relative z-10">Three-Way Cap</h3>
              <p className="text-sm text-slate-400 mb-8 relative z-10">Your loan is the minimum of these three limits.</p>
              <div className="space-y-4 relative z-10">
                <div className="flex justify-between items-center pb-4 border-b border-white/10">
                  <span className="text-sm text-slate-300 flex items-center gap-2"><IndianRupee className="w-4 h-4" /> EMI Capacity</span>
                  <span className="text-sm font-semibold text-white">{fmt(results.loanFromEMI)}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-white/10">
                  <span className="text-sm text-slate-300 flex items-center gap-2"><PiggyBank className="w-4 h-4" /> LTV Cap ({(results.ltvSlab * 100).toFixed(0)}%)</span>
                  <span className="text-sm font-semibold text-white">{fmt(results.loanByLTV)}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-white/10">
                  <span className="text-sm text-slate-300 flex items-center gap-2"><Coins className="w-4 h-4" /> Applied Amount</span>
                  <span className="text-sm font-semibold text-white">{fmt(loanApplied)}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-sm text-slate-300 font-semibold">Binding Constraint</span>
                  <span className="text-sm font-bold text-[#46b8c3]">{fmt(results.preCreditLoan)}</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* STEP-BY-STEP BREAKDOWN */}
          <ScrollFadeIn className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden mb-12">
            <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#144d78]/10 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-[#1b6896]" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[#0d3a5c]">How This Was Calculated</h3>
                <p className="text-sm text-slate-500 mt-1">Step-by-step eligibility assessment</p>
              </div>
            </div>
            <div className="p-8 space-y-4">
              {(() => {
                const effectiveRecognition = employment === 'salaried' ? 100 : recognitionRate;
                const steps: { s: string; l: string; v: string; d: string }[] = [];
                let stepNum = 1;

                // Step 1 — Income derivation (varies by method)
                if (employment === 'salaried') {
                  steps.push({
                    s: String(stepNum++),
                    l: 'Gross Monthly Income (Salaried)',
                    v: fmt(monthlySalary),
                    d: 'Net in-hand salary from payslip. Banks use fixed monthly salary as declared income. Recognition: 100% (no haircut for salaried).'
                  });
                } else if (assessmentMethod === 'itr') {
                  steps.push({
                    s: String(stepNum++),
                    l: 'Net Profit — FY1 (from ITR/P&L)',
                    v: fmt(itrProfitY1),
                    d: `Revenue ${fmt(itrRevY1)} − Expenses ${fmt(itrExpY1)} = ${fmt(itrProfitY1)}. Banks use net profit after all business deductions from filed ITR.`
                  });
                  steps.push({
                    s: String(stepNum++),
                    l: 'Net Profit — FY2 (from ITR/P&L)',
                    v: fmt(itrProfitY2),
                    d: `Revenue ${fmt(itrRevY2)} − Expenses ${fmt(itrExpY2)} = ${fmt(itrProfitY2)}. Second year used for averaging to smooth income volatility.`
                  });
                  steps.push({
                    s: String(stepNum++),
                    l: 'Average Annual Net Profit (2-yr avg)',
                    v: `${fmtLakhs(itrAvgProfit)}/yr`,
                    d: `(${fmt(itrProfitY1)} + ${fmt(itrProfitY2)}) ÷ 2 = ${fmt(itrAvgProfit)}. Banks mandate 2-year average to assess income stability.`
                  });
                  steps.push({
                    s: String(stepNum++),
                    l: 'Monthly Income (from avg profit)',
                    v: fmt(itrMonthlyIncome),
                    d: `${fmt(itrAvgProfit)} ÷ 12 = ${fmt(itrMonthlyIncome)}/mo. This is the base income before recognition haircut.`
                  });
                } else if (assessmentMethod === 'gst-turnover') {
                  steps.push({
                    s: String(stepNum++),
                    l: 'Annual GST Sales Turnover',
                    v: fmtLakhs(gstAnnualSales),
                    d: `Total sales as per GST returns. Banks use this as a proxy for business volume.`
                  });
                  steps.push({
                    s: String(stepNum++),
                    l: `Turnover-to-Income Factor (${turnoverFactor}%)`,
                    v: fmt(gstMonthlyIncome),
                    d: `${fmtLakhs(gstAnnualSales)} × ${turnoverFactor}% ÷ 12 = ${fmt(gstMonthlyIncome)}/mo. Banks apply 10–15% of turnover as deemed monthly income.`
                  });
                } else {
                  // ADB
                  steps.push({
                    s: String(stepNum++),
                    l: 'Average Daily Bank Balance (12-mo)',
                    v: fmt(avgBankBalance),
                    d: `Average balance maintained across all bank accounts over last 12 months. Banks use this to gauge cash flow stability.`
                  });
                  steps.push({
                    s: String(stepNum++),
                    l: `ADB Multiplier (${adbFactor}%)`,
                    v: fmt(adbMonthlyIncome),
                    d: `${fmt(avgBankBalance)} × ${adbFactor}% = ${fmt(adbMonthlyIncome)}/mo. Banks apply 25–30% of ADB as deemed monthly income.`
                  });
                }

                // Step — Recognition rate (non-salaried only)
                if (employment !== 'salaried') {
                  steps.push({
                    s: String(stepNum++),
                    l: `Income Recognition (${effectiveRecognition}% haircut)`,
                    v: fmt(results.recognisedIncome),
                    d: `${fmt(derivedMonthlyIncome)} × ${effectiveRecognition}% = ${fmt(results.recognisedIncome)}/mo. Banks apply a haircut on non-salaried income to account for income variability.`
                  });
                }

                // Step — FOIR
                steps.push({
                  s: String(stepNum++),
                  l: `FOIR — Fixed Obligation to Income Ratio`,
                  v: `${(results.foirRate * 100).toFixed(0)}%`,
                  d: employment === 'self-employed'
                    ? `Income slab gives ${(getFOIR(results.recognisedIncome) * 100).toFixed(0)}%, but self-employed gets −5% penalty = ${(results.foirRate * 100).toFixed(0)}%. Banks cap total EMI burden at this % of income.`
                    : employment === 'salaried'
                    ? `Salary of ${fmt(results.recognisedIncome)}/mo falls in the ${(getFOIR(results.recognisedIncome) * 100).toFixed(0)}% FOIR slab. Salaried borrowers get the standard slab rate with no haircut.`
                    : `Recognised income of ${fmt(results.recognisedIncome)}/mo (after ${recognitionRate}% haircut) falls in the ${(getFOIR(results.recognisedIncome) * 100).toFixed(0)}% FOIR slab. Professionals get the full slab rate (no SE penalty).`
                });

                // Step — Max EMI
                steps.push({
                  s: String(stepNum++),
                  l: 'Maximum Allowed EMI',
                  v: fmt(results.maxEMI),
                  d: `${fmt(results.recognisedIncome)} × ${(results.foirRate * 100).toFixed(0)}% = ${fmt(results.maxEMI)}. This is the total EMI capacity including all loans.`
                });

                // Step — Net EMI
                steps.push({
                  s: String(stepNum++),
                  l: 'Net EMI Capacity (after existing obligations)',
                  v: fmt(results.netEMI),
                  d: `${fmt(results.maxEMI)} − ${fmt(obligations)} existing EMIs = ${fmt(results.netEMI)}. This is the EMI available for the new home loan.`
                });

                // Step — Tenure
                steps.push({
                  s: String(stepNum++),
                  l: 'Maximum Loan Tenure',
                  v: `${results.tenureYears} years (${results.tenureMonths} months)`,
                  d: `MIN(Retirement age ${retirementAge} − Current age ${age} = ${retirementAge - age}yrs, ${employment} cap ${MAX_TENURE[employment]}yrs) = ${results.tenureYears} years. Loan must be repaid before retirement.`
                });

                // Step — LTV
                steps.push({
                  s: String(stepNum++),
                  l: `LTV Ratio (RBI/NHB norms)`,
                  v: `${(results.ltvSlab * 100).toFixed(0)}%`,
                  d: `Property value ${fmtLakhs(propertyValue)} falls in the ${propertyValue <= 3000000 ? '≤30L (90%)' : propertyValue <= 7500000 ? '30L–75L (80%)' : '>75L (75%)'} slab. Max loan from property = ${fmt(results.loanByLTV)}.`
                });

                // Step — Base rate from CIBIL
                steps.push({
                  s: String(stepNum++),
                  l: `Base Interest Rate (CIBIL ${cibil} → ${cibilRate.band})`,
                  v: `${interestRate}%`,
                  d: rateOverride
                    ? `Custom rate override: ${customRate}%. Auto rate for CIBIL ${cibil} would be ${cibilRate.rate}% (${cibilRate.band} band).`
                    : `CIBIL score ${cibil} falls in the ${cibilRate.band} band → base rate ${cibilRate.rate}%. Higher scores get lower rates.`
                });

                // Step — Rate premium
                steps.push({
                  s: String(stepNum++),
                  l: 'Effective Interest Rate (with LTV premium)',
                  v: `${results.effectiveRate.toFixed(2)}%`,
                  d: `Actual LTV = ${fmtLakhs(loanApplied)} / ${fmtLakhs(propertyValue)} = ${(results.actualLTV * 100).toFixed(0)}%. Base rate ${interestRate}% ${results.ltvPremium === 0 ? '+ 0% (no LTV premium for this slab)' : results.ltvPremium > 0 ? `+ ${results.ltvPremium}% LTV risk premium (higher LTV = higher risk)` : `${results.ltvPremium}% LTV concession (low LTV = lower risk)`} = ${results.effectiveRate.toFixed(2)}%.`
                });

                // Step — EMI-based loan
                steps.push({
                  s: String(stepNum++),
                  l: 'Loan Amount from EMI Capacity',
                  v: fmt(results.loanFromEMI),
                  d: `Using standard EMI formula: P = EMI × [(1+r)ⁿ − 1] / [r × (1+r)ⁿ] where EMI=${fmt(results.netEMI)}, r=${results.effectiveRate.toFixed(2)}%/12, n=${results.tenureMonths} months.`
                });

                // Step — LTV-based loan
                steps.push({
                  s: String(stepNum++),
                  l: 'Loan Amount from LTV Cap',
                  v: fmt(results.loanByLTV),
                  d: `${fmtLakhs(propertyValue)} × ${(results.ltvSlab * 100).toFixed(0)}% = ${fmt(results.loanByLTV)}. RBI mandates this ceiling based on property value.`
                });

                // Step — Pre-credit
                steps.push({
                  s: String(stepNum++),
                  l: 'Pre-Credit Assessment (binding constraint)',
                  v: fmt(results.preCreditLoan),
                  d: `MIN(EMI-based ${fmt(results.loanFromEMI)}, LTV-based ${fmt(results.loanByLTV)}, Applied ${fmt(loanApplied)}) = ${fmt(results.preCreditLoan)}. Bank takes the most conservative limit.`
                });

                // Step — CIBIL
                steps.push({
                  s: String(stepNum++),
                  l: `CIBIL Adjustment (Score: ${cibil})`,
                  v: fmt(results.finalLoan),
                  d: `${fmt(results.preCreditLoan)} × ${results.cibilAdj.factor} = ${fmt(results.finalLoan)}. ${cibil >= 800 ? 'Excellent score — bank rewards with +5% uplift.' : cibil >= 750 ? 'Good score — no adjustment applied.' : cibil >= 700 ? 'Fair score — bank applies 5% reduction as risk buffer.' : 'Below average — bank applies 15% reduction.'}`
                });

                return steps.map(({ s, l, v, d }) => (
                  <div key={s} className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg hover:bg-slate-100/80 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-[#144d78] text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {s}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-[#0d3a5c]">{l}</div>
                      <div className="text-sm text-slate-500 mt-1">{d}</div>
                    </div>
                    <div className="font-bold text-[#144d78] text-right whitespace-nowrap">{v}</div>
                  </div>
                ));
              })()}
            </div>
          </ScrollFadeIn>

          {/* REFERENCE TABLES */}
          <ScrollFadeIn className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden mb-12">
            <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#46b8c3]/15 flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-[#1b6896]" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[#0d3a5c]">Reference Tables</h3>
                <p className="text-sm text-slate-500 mt-1">Industry norms used in this calculation</p>
              </div>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 bg-slate-50 rounded-xl">
                <h4 className="font-semibold text-[#0d3a5c] mb-3">FOIR Slabs (Income-based)</h4>
                <div className="space-y-2 text-sm">
                  <div className={displayRecognisedIncome < 50000 ? 'font-bold text-[#144d78]' : 'text-slate-600'}>&lt; ₹50K/month → 40%</div>
                  <div className={displayRecognisedIncome >= 50000 && displayRecognisedIncome < 100000 ? 'font-bold text-[#144d78]' : 'text-slate-600'}>₹50K–₹1L/month → 50%</div>
                  <div className={displayRecognisedIncome >= 100000 && displayRecognisedIncome < 200000 ? 'font-bold text-[#144d78]' : 'text-slate-600'}>₹1L–₹2L/month → 55%</div>
                  <div className={displayRecognisedIncome >= 200000 ? 'font-bold text-[#144d78]' : 'text-slate-600'}>&gt; ₹2L/month → 60%</div>
                </div>
              </div>
              <div className="p-5 bg-slate-50 rounded-xl">
                <h4 className="font-semibold text-[#0d3a5c] mb-3">LTV Norms (RBI)</h4>
                <div className="space-y-2 text-sm">
                  <div className={propertyValue <= 3000000 ? 'font-bold text-[#144d78]' : 'text-slate-600'}>≤ ₹30L property → 90%</div>
                  <div className={propertyValue > 3000000 && propertyValue <= 7500000 ? 'font-bold text-[#144d78]' : 'text-slate-600'}>₹30L–₹75L property → 80%</div>
                  <div className={propertyValue > 7500000 ? 'font-bold text-[#144d78]' : 'text-slate-600'}>&gt; ₹75L property → 75%</div>
                </div>
              </div>
              <div className="p-5 bg-slate-50 rounded-xl">
                <h4 className="font-semibold text-[#0d3a5c] mb-3">LTV Rate Premium</h4>
                <div className="space-y-2 text-sm">
                  <div className={results.actualLTV <= 0.60 ? 'font-bold text-green-600' : 'text-slate-600'}>≤60% → −0.10%</div>
                  <div className={results.actualLTV > 0.60 && results.actualLTV <= 0.75 ? 'font-bold text-[#144d78]' : 'text-slate-600'}>61–75% → 0%</div>
                  <div className={results.actualLTV > 0.75 && results.actualLTV <= 0.80 ? 'font-bold text-amber-600' : 'text-slate-600'}>76–80% → +0.25%</div>
                  <div className={results.actualLTV > 0.80 ? 'font-bold text-red-500' : 'text-slate-600'}>81–90% → +0.50%</div>
                </div>
              </div>
              <div className="p-5 bg-slate-50 rounded-xl">
                <h4 className="font-semibold text-[#0d3a5c] mb-3">CIBIL → Base Rate</h4>
                <div className="space-y-2 text-sm">
                  {[
                    { min: 800, max: 900, band: '800+', rate: '7.25%' },
                    { min: 775, max: 799, band: '775–799', rate: '7.50%' },
                    { min: 750, max: 774, band: '750–774', rate: '7.75%' },
                    { min: 725, max: 749, band: '725–749', rate: '8.10%' },
                    { min: 700, max: 724, band: '700–724', rate: '8.50%' },
                    { min: 675, max: 699, band: '675–699', rate: '8.95%' },
                    { min: 650, max: 674, band: '650–674', rate: '9.50%' },
                    { min: 0, max: 649, band: 'Below 650', rate: '10.25%' },
                  ].map(({ min, max, band, rate }) => (
                    <div key={band} className={cibil >= min && cibil <= max ? 'font-bold text-[#144d78]' : 'text-slate-600'}>{band} → {rate}</div>
                  ))}
                </div>
              </div>
              <div className="p-5 bg-slate-50 rounded-xl">
                <h4 className="font-semibold text-[#0d3a5c] mb-3">Max Tenure (by type)</h4>
                <div className="space-y-2 text-sm">
                  <div className={employment === 'salaried' ? 'font-bold text-[#144d78]' : 'text-slate-600'}>Salaried → 30 yrs (retire 60)</div>
                  <div className={employment === 'self-employed' ? 'font-bold text-[#144d78]' : 'text-slate-600'}>Self-Employed → 20 yrs (retire 60)</div>
                  <div className={employment === 'professional' ? 'font-bold text-[#144d78]' : 'text-slate-600'}>Professional → 30 yrs (retire 65)</div>
                </div>
              </div>
            </div>
          </ScrollFadeIn>
        </>
      )}
    </>
  );
};

export default AmountCalc;

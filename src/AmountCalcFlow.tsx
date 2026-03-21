import React, { useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence, useInView } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Minus,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function ScrollFadeIn({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
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

const fmt = (n: number) => `Rs. ${Math.round(n).toLocaleString('en-IN')}`;
const fmtLakhs = (n: number) =>
  n >= 10000000 ? `Rs. ${(n / 10000000).toFixed(2)} Cr` : `Rs. ${(n / 100000).toFixed(2)} L`;
const fmtIndian = (n: number) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n);
const parseIndian = (s: string) => Number(s.replace(/\D/g, '')) || 0;

const getFOIR = (income: number): number => {
  if (income < 50000) return 0.4;
  if (income < 100000) return 0.5;
  if (income < 200000) return 0.55;
  return 0.6;
};

const getLTV = (propertyValue: number): number => {
  if (propertyValue <= 3000000) return 0.9;
  if (propertyValue <= 7500000) return 0.8;
  return 0.75;
};

const getLTVPremium = (ltv: number): number => {
  if (ltv <= 0.6) return -0.1;
  if (ltv <= 0.75) return 0;
  if (ltv <= 0.8) return 0.25;
  return 0.5;
};

const getCIBILAdjustment = (score: number): { factor: number; label: string; color: string } => {
  if (score >= 800) return { factor: 1.05, label: '+5% (Excellent)', color: 'text-green-600' };
  if (score >= 750) return { factor: 1, label: 'No change (Good)', color: 'text-blue-600' };
  if (score >= 700) return { factor: 0.95, label: '-5% (Fair)', color: 'text-amber-600' };
  if (score >= 650) return { factor: 0.85, label: '-15% (Below Avg)', color: 'text-orange-600' };
  return { factor: 0, label: 'High Risk - Not Eligible', color: 'text-red-500' };
};

const getBaseRate = (score: number): { rate: number; band: string } => {
  if (score >= 800) return { rate: 7.25, band: '800+' };
  if (score >= 775) return { rate: 7.5, band: '775-799' };
  if (score >= 750) return { rate: 7.75, band: '750-774' };
  if (score >= 725) return { rate: 8.1, band: '725-749' };
  if (score >= 700) return { rate: 8.5, band: '700-724' };
  if (score >= 675) return { rate: 8.95, band: '675-699' };
  if (score >= 650) return { rate: 9.5, band: '650-674' };
  return { rate: 10.25, band: 'Below 650' };
};

const emiToLoan = (emi: number, annualRate: number, months: number): number => {
  const r = annualRate / 12 / 100;
  if (r === 0) return emi * months;
  return (emi * (Math.pow(1 + r, months) - 1)) / (r * Math.pow(1 + r, months));
};

type Employment = 'salaried' | 'self-employed' | 'professional';
type AssessmentMethod = 'itr' | 'adb' | 'gst-turnover';
type StepId = 1 | 2 | 3 | 4 | 5;

const RETIREMENT_AGE: Record<Employment, number> = {
  salaried: 60,
  'self-employed': 60,
  professional: 65,
};

const MAX_TENURE: Record<Employment, number> = {
  salaried: 30,
  'self-employed': 20,
  professional: 30,
};

const STEPS: { id: StepId; label: string; title: string; description: string }[] = [
  { id: 1, label: 'Employment', title: 'Screen 1 - Employment Type', description: 'Start by choosing the income profile we should underwrite against.' },
  { id: 2, label: 'Income', title: 'Screen 2 - Income', description: 'Capture the right income proof model for this borrower.' },
  { id: 3, label: 'Profile', title: 'Screen 3 - Your Profile', description: 'Age and CIBIL shape tenure, rate, and final credit adjustment.' },
  { id: 4, label: 'Loan', title: 'Screen 4 - Loan Details', description: 'Property, requested loan, rate, and FOIR define the main underwriting caps.' },
  { id: 5, label: 'Obligations', title: 'Screen 5 - Obligations', description: 'Net off existing EMIs, then calculate the final eligibility.' },
];

function FieldShell({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">{label}</label>
      {children}
      {hint ? <p className="mt-2 pl-1 text-xs font-medium text-slate-500">{hint}</p> : null}
    </div>
  );
}

function MoneyInput({
  value,
  onChange,
  className,
}: {
  value: number;
  onChange: (value: number) => void;
  className?: string;
}) {
  return (
    <div className="relative">
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#1b6896]/40">Rs.</span>
      <input
        type="text"
        inputMode="numeric"
        value={fmtIndian(value)}
        onChange={(e) => onChange(parseIndian(e.target.value))}
        className={cn(
          'w-full rounded-2xl border border-slate-200 bg-[#144d78]/[0.03] py-2 pl-11 pr-4 text-lg font-bold text-[#144d78] outline-none transition-all focus:border-[#46b8c3] focus:bg-white',
          className,
        )}
      />
    </div>
  );
}

function NumberInput({
  value,
  onChange,
  suffix,
  min,
  max,
  step,
}: {
  value: number;
  onChange: (value: number) => void;
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <div className="relative">
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full rounded-2xl border border-slate-200 bg-[#144d78]/[0.03] px-4 py-2 pr-14 text-lg font-bold text-[#144d78] outline-none transition-all focus:border-[#46b8c3] focus:bg-white"
      />
      {suffix ? (
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#1b6896]/40">{suffix}</span>
      ) : null}
    </div>
  );
}

function SummaryRow({
  label,
  value,
  accent = false,
  dark = true,
}: {
  label: string;
  value: string;
  accent?: boolean;
  dark?: boolean;
}) {
  return (
    <div className={cn('flex items-start justify-between gap-4 pb-3 last:border-b-0 last:pb-0', dark ? 'border-b border-white/10' : 'border-b border-slate-100')}>
      <span className={cn('text-sm', dark ? 'text-slate-300' : 'text-slate-500')}>{label}</span>
      <span className={cn('text-right text-sm font-semibold', accent ? (dark ? 'text-[#8edce4]' : 'text-[#144d78]') : dark ? 'text-white' : 'text-[#0d3a5c]')}>{value}</span>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-bold text-[#0d3a5c]">{value}</p>
    </div>
  );
}

const AmountCalcFlow = () => {
  const [step, setStep] = useState<StepId>(1);
  const [direction, setDirection] = useState(1);
  const [hasCalculated, setHasCalculated] = useState(false);
  const resultsRef = useRef<HTMLDivElement | null>(null);

  const [monthlySalary, setMonthlySalary] = useState(100000);
  const [age, setAge] = useState(30);
  const [cibil, setCibil] = useState(760);
  const [employment, setEmployment] = useState<Employment>('salaried');
  const [assessmentMethod, setAssessmentMethod] = useState<AssessmentMethod>('itr');
  const [itrRevY1, setItrRevY1] = useState(2800000);
  const [itrExpY1, setItrExpY1] = useState(1700000);
  const [itrRevY2, setItrRevY2] = useState(3200000);
  const [itrExpY2, setItrExpY2] = useState(1900000);
  const [gstAnnualSales, setGstAnnualSales] = useState(5000000);
  const [turnoverFactor, setTurnoverFactor] = useState(12);
  const [avgBankBalance, setAvgBankBalance] = useState(500000);
  const [adbFactor, setAdbFactor] = useState(27);
  const [recognitionRate, setRecognitionRate] = useState(100);
  const [obligations, setObligations] = useState(10000);
  const [rateOverride, setRateOverride] = useState(false);
  const [customRate, setCustomRate] = useState(8.5);
  const [propertyValue, setPropertyValue] = useState(5000000);
  const [loanApplied, setLoanApplied] = useState(4000000);
  const [foirOverride, setFoirOverride] = useState(false);
  const [customFOIR, setCustomFOIR] = useState(50);

  const itrProfitY1 = Math.max(itrRevY1 - itrExpY1, 0);
  const itrProfitY2 = Math.max(itrRevY2 - itrExpY2, 0);
  const itrAvgProfit = (itrProfitY1 + itrProfitY2) / 2;
  const itrMonthlyIncome = itrAvgProfit / 12;
  const gstMonthlyIncome = (gstAnnualSales * (Math.min(Math.max(turnoverFactor, 10), 15) / 100)) / 12;
  const adbMonthlyIncome = avgBankBalance * (Math.min(Math.max(adbFactor, 25), 30) / 100);

  const derivedMonthlyIncome =
    employment === 'salaried'
      ? monthlySalary
      : assessmentMethod === 'itr'
        ? itrMonthlyIncome
        : assessmentMethod === 'gst-turnover'
          ? gstMonthlyIncome
          : adbMonthlyIncome;

  const cibilRate = getBaseRate(cibil);
  const interestRate = rateOverride ? customRate : cibilRate.rate;
  const retirementAge = RETIREMENT_AGE[employment];
  const ageError =
    age < 21
      ? 'Minimum age is 21.'
      : age >= retirementAge
        ? `Age must be below ${retirementAge} for ${employment}.`
        : null;
  const cibilAdj = getCIBILAdjustment(cibil);
  const effectiveRecognition = employment === 'salaried' ? 100 : recognitionRate;
  const displayRecognisedIncome = derivedMonthlyIncome * (effectiveRecognition / 100);
  const displaySlabFOIR =
    employment === 'self-employed'
      ? Math.max(getFOIR(displayRecognisedIncome) - 0.05, 0.35)
      : getFOIR(displayRecognisedIncome);

  const results = useMemo(() => {
    if (ageError) return null;

    const recognisedIncome = derivedMonthlyIncome * (effectiveRecognition / 100);
    const foirRate = getFOIR(recognisedIncome);
    const slabFOIR = employment === 'self-employed' ? Math.max(foirRate - 0.05, 0.35) : foirRate;
    const effectiveFOIR = foirOverride ? customFOIR / 100 : slabFOIR;
    const maxEMI = recognisedIncome * effectiveFOIR;
    const netEMI = maxEMI - obligations;

    if (netEMI <= 0) {
      return { eligible: false as const, maxEMI, netEMI, foirRate: effectiveFOIR };
    }

    const remainingYears = RETIREMENT_AGE[employment] - age;
    const tenureYears = Math.min(remainingYears, MAX_TENURE[employment]);
    const tenureMonths = tenureYears * 12;
    const ltvSlab = getLTV(propertyValue);
    const loanByLTV = propertyValue * ltvSlab;
    const actualLTV = propertyValue > 0 ? loanApplied / propertyValue : 0;
    const ltvPremium = getLTVPremium(Math.min(actualLTV, ltvSlab));
    const effectiveRate = interestRate + ltvPremium;
    const loanFromEMI = emiToLoan(netEMI, effectiveRate, tenureMonths);
    const cibilAdjustment = getCIBILAdjustment(cibil);

    if (cibilAdjustment.factor === 0) {
      return { eligible: false as const, maxEMI, netEMI, foirRate: effectiveFOIR, cibilAdj: cibilAdjustment };
    }

    const preCreditLoan = Math.min(loanFromEMI, loanByLTV, loanApplied);
    const finalLoan = preCreditLoan * cibilAdjustment.factor;

    return {
      eligible: true as const,
      foirRate: effectiveFOIR,
      recognisedIncome,
      maxEMI,
      netEMI,
      tenureYears,
      tenureMonths,
      loanFromEMI,
      loanByLTV,
      ltvSlab,
      actualLTV,
      ltvPremium,
      effectiveRate,
      cibilAdj: cibilAdjustment,
      preCreditLoan,
      finalLoan,
    };
  }, [
    age,
    ageError,
    cibil,
    customFOIR,
    derivedMonthlyIncome,
    effectiveRecognition,
    employment,
    foirOverride,
    interestRate,
    loanApplied,
    obligations,
    propertyValue,
  ]);

  const currentStepMeta = STEPS.find((item) => item.id === step)!;

  const stepError = useMemo(() => {
    switch (step) {
      case 1:
        return null;
      case 2:
        if (employment === 'salaried') return monthlySalary > 0 ? null : 'Enter a monthly salary.';
        if (recognitionRate <= 0 || recognitionRate > 100) return 'Recognition rate must be between 1% and 100%.';
        if (assessmentMethod === 'itr') {
          if (itrRevY1 <= 0 || itrRevY2 <= 0) return 'Enter revenue for both financial years.';
          if (itrExpY1 < 0 || itrExpY2 < 0) return 'Expenses cannot be negative.';
          return null;
        }
        if (assessmentMethod === 'gst-turnover') {
          if (gstAnnualSales <= 0) return 'Enter annual GST sales.';
          if (turnoverFactor < 10 || turnoverFactor > 15) return 'Turnover factor should stay between 10% and 15%.';
          return null;
        }
        if (avgBankBalance <= 0) return 'Enter the average bank balance.';
        if (adbFactor < 25 || adbFactor > 30) return 'ADB factor should stay between 25% and 30%.';
        return null;
      case 3:
        if (ageError) return ageError;
        if (cibil < 300 || cibil > 900) return 'CIBIL should be between 300 and 900.';
        return null;
      case 4:
        if (propertyValue <= 0) return 'Enter the property value.';
        if (loanApplied <= 0) return 'Enter the loan amount applied.';
        if (interestRate <= 0) return 'Interest rate must be greater than 0.';
        if (foirOverride && (customFOIR <= 0 || customFOIR > 100)) return 'Custom FOIR must be between 1% and 100%.';
        return null;
      case 5:
        return obligations < 0 ? 'Existing EMIs cannot be negative.' : null;
      default:
        return null;
    }
  }, [
    adbFactor,
    ageError,
    assessmentMethod,
    avgBankBalance,
    cibil,
    customFOIR,
    employment,
    foirOverride,
    gstAnnualSales,
    interestRate,
    itrExpY1,
    itrExpY2,
    itrRevY1,
    itrRevY2,
    loanApplied,
    monthlySalary,
    obligations,
    propertyValue,
    recognitionRate,
    step,
    turnoverFactor,
  ]);

  const goToStep = (nextStep: StepId) => {
    setDirection(nextStep > step ? 1 : -1);
    setStep(nextStep);
  };

  const goNext = () => {
    if (step < STEPS.length) goToStep((step + 1) as StepId);
  };

  const goBack = () => {
    if (step > 1) goToStep((step - 1) as StepId);
  };

  const handleCalculate = () => {
    if (stepError) return;
    setHasCalculated(true);
    window.setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  const renderIncomeScreen = () => {
    if (employment === 'salaried') {
      return (
        <div className="grid gap-6 md:grid-cols-2">
          <FieldShell label="Monthly Salary" hint={`${fmtLakhs(monthlySalary * 12)} / year`}>
            <MoneyInput value={monthlySalary} onChange={setMonthlySalary} />
          </FieldShell>
          <MiniStat label="Recognised Income" value={`${fmt(monthlySalary)} / month`} />
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div>
          <label className="mb-1.5 block text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Income Method</label>
          <div className="grid gap-3 md:grid-cols-3">
            {([
              { value: 'itr', label: 'ITR / P&L' },
              { value: 'adb', label: 'Avg Daily Balance' },
              { value: 'gst-turnover', label: 'GST Turnover' },
            ] as { value: AssessmentMethod; label: string }[]).map((item) => (
              <button
                key={item.value}
                onClick={() => setAssessmentMethod(item.value)}
                className={cn(
                  'rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition-all',
                  assessmentMethod === item.value
                    ? 'border-[#1b6896] bg-[#1b6896] text-white'
                    : 'border-slate-200 bg-[#46b8c3]/[0.04] text-[#1b6896] hover:border-[#46b8c3]',
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {assessmentMethod === 'itr' ? (
          <div className="grid gap-6 md:grid-cols-2">
            <FieldShell label="Revenue (FY1)" hint={`Profit: ${fmtLakhs(itrProfitY1)}`}>
              <MoneyInput value={itrRevY1} onChange={setItrRevY1} />
            </FieldShell>
            <FieldShell label="Expenses (FY1)">
              <MoneyInput value={itrExpY1} onChange={setItrExpY1} />
            </FieldShell>
            <FieldShell label="Revenue (FY2)" hint={`Profit: ${fmtLakhs(itrProfitY2)}`}>
              <MoneyInput value={itrRevY2} onChange={setItrRevY2} />
            </FieldShell>
            <FieldShell label="Expenses (FY2)" hint={`Average annual profit: ${fmtLakhs(itrAvgProfit)}`}>
              <MoneyInput value={itrExpY2} onChange={setItrExpY2} />
            </FieldShell>
          </div>
        ) : null}

        {assessmentMethod === 'gst-turnover' ? (
          <div className="grid gap-6 md:grid-cols-2">
            <FieldShell label="Annual GST Sales" hint={`${fmtLakhs(gstAnnualSales)} turnover`}>
              <MoneyInput value={gstAnnualSales} onChange={setGstAnnualSales} />
            </FieldShell>
            <FieldShell label="Turnover Factor" hint={`Banks usually use 10% to 15%, giving ${fmt(gstMonthlyIncome)} / month`}>
              <NumberInput value={turnoverFactor} onChange={setTurnoverFactor} suffix="%" min={10} max={15} />
            </FieldShell>
          </div>
        ) : null}

        {assessmentMethod === 'adb' ? (
          <div className="grid gap-6 md:grid-cols-2">
            <FieldShell label="Average Bank Balance" hint={`${fmt(avgBankBalance)} average maintained`}>
              <MoneyInput value={avgBankBalance} onChange={setAvgBankBalance} />
            </FieldShell>
            <FieldShell label="ADB Factor" hint={`Banks usually use 25% to 30%, giving ${fmt(adbMonthlyIncome)} / month`}>
              <NumberInput value={adbFactor} onChange={setAdbFactor} suffix="%" min={25} max={30} />
            </FieldShell>
          </div>
        ) : null}

        <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_220px]">
          <FieldShell
            label="Recognition Rate"
            hint={`Recognised income: ${fmt(displayRecognisedIncome)} / month after haircut`}
          >
            <NumberInput value={recognitionRate} onChange={setRecognitionRate} suffix="%" min={1} max={100} />
          </FieldShell>
          <MiniStat label="Derived Income" value={`${fmt(derivedMonthlyIncome)} / month`} />
        </div>
      </div>
    );
  };

  const renderCurrentScreen = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid gap-3 md:grid-cols-3">
              {([
                { value: 'salaried', label: 'Salaried', note: 'Stable salary, full recognition, standard FOIR.' },
                { value: 'self-employed', label: 'Self-Employed', note: 'Business income, haircut applies, FOIR penalty.' },
                { value: 'professional', label: 'Professional', note: 'Practice income, haircut applies, tenure up to age 65.' },
              ] as { value: Employment; label: string; note: string }[]).map((item) => (
                <button
                  key={item.value}
                  onClick={() => {
                    setEmployment(item.value);
                    if (item.value !== 'salaried') setAssessmentMethod('itr');
                  }}
                  className={cn(
                    'rounded-3xl border p-5 text-left transition-all',
                    employment === item.value
                      ? 'border-[#144d78] bg-[#144d78] text-white shadow-sm'
                      : 'border-slate-200 bg-slate-50/70 text-[#0d3a5c] hover:border-[#46b8c3] hover:bg-white',
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-lg font-bold">{item.label}</span>
                    {employment === item.value ? <CheckCircle2 className="h-5 w-5 text-[#8edce4]" /> : null}
                  </div>
                  <p className={cn('mt-3 text-sm', employment === item.value ? 'text-white/75' : 'text-slate-500')}>{item.note}</p>
                </button>
              ))}
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <MiniStat label="Retirement Age" value={`${RETIREMENT_AGE[employment]} years`} />
              <MiniStat label="Max Tenure Cap" value={`${MAX_TENURE[employment]} years`} />
              <MiniStat label="Recognition Rule" value={employment === 'salaried' ? '100% recognised' : 'Haircut applicable'} />
            </div>
          </div>
        );
      case 2:
        return renderIncomeScreen();
      case 3:
        return (
          <div className="grid gap-6 md:grid-cols-2">
            <FieldShell label="Age" hint={ageError ?? `Eligible until age ${retirementAge} for this profile`}>
              <NumberInput value={age} onChange={setAge} suffix="yrs" min={21} max={75} />
            </FieldShell>
            <FieldShell label="CIBIL Score" hint={`Base pricing band: ${cibilRate.band}, base rate ${cibilRate.rate.toFixed(2)}%`}>
              <NumberInput value={cibil} onChange={setCibil} min={300} max={900} />
            </FieldShell>
            <MiniStat label="Credit Adjustment" value={cibilAdj.label} />
            <MiniStat label="Estimated Base Rate" value={`${cibilRate.rate.toFixed(2)}%`} />
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <FieldShell label="Property Value" hint={`LTV slab: ${(getLTV(propertyValue) * 100).toFixed(0)}%`}>
                <MoneyInput value={propertyValue} onChange={setPropertyValue} />
              </FieldShell>
              <FieldShell
                label="Loan Applied"
                hint={`Applied LTV: ${propertyValue > 0 ? ((loanApplied / propertyValue) * 100).toFixed(0) : 0}%`}
              >
                <MoneyInput value={loanApplied} onChange={setLoanApplied} />
              </FieldShell>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Interest Rate</p>
                    <p className="mt-1 text-sm text-slate-500">Use CIBIL-linked rate or override manually.</p>
                  </div>
                  <button
                    onClick={() => setRateOverride((value) => !value)}
                    className={cn(
                      'rounded-full px-3 py-1 text-xs font-semibold transition-all',
                      rateOverride ? 'bg-[#144d78] text-white' : 'bg-slate-200 text-slate-600',
                    )}
                  >
                    {rateOverride ? 'Manual' : 'Auto'}
                  </button>
                </div>
                <NumberInput
                  value={rateOverride ? customRate : cibilRate.rate}
                  onChange={rateOverride ? setCustomRate : () => undefined}
                  suffix="%"
                  step={0.05}
                />
                <p className="mt-2 pl-1 text-xs font-medium text-slate-500">
                  {rateOverride
                    ? `Auto suggestion for CIBIL ${cibil}: ${cibilRate.rate.toFixed(2)}%`
                    : `Auto-derived from ${cibilRate.band} band`}
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">FOIR</p>
                    <p className="mt-1 text-sm text-slate-500">Keep the slab-based FOIR or set a manual value.</p>
                  </div>
                  <button
                    onClick={() => setFoirOverride((value) => !value)}
                    className={cn(
                      'rounded-full px-3 py-1 text-xs font-semibold transition-all',
                      foirOverride ? 'bg-[#144d78] text-white' : 'bg-slate-200 text-slate-600',
                    )}
                  >
                    {foirOverride ? 'Manual' : 'Auto'}
                  </button>
                </div>
                <NumberInput
                  value={foirOverride ? customFOIR : Number((displaySlabFOIR * 100).toFixed(0))}
                  onChange={foirOverride ? setCustomFOIR : () => undefined}
                  suffix="%"
                  min={1}
                  max={100}
                />
                <p className="mt-2 pl-1 text-xs font-medium text-slate-500">
                  {foirOverride
                    ? `Auto suggestion from recognised income: ${(displaySlabFOIR * 100).toFixed(0)}%`
                    : `Auto FOIR for current recognised income: ${(displaySlabFOIR * 100).toFixed(0)}%`}
                </p>
              </div>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_240px]">
            <FieldShell label="Existing EMIs" hint={`Net EMI capacity currently projects to ${results && 'netEMI' in results ? fmt(results.netEMI) : fmt(0)}`}>
              <MoneyInput value={obligations} onChange={setObligations} />
            </FieldShell>
            <div className="rounded-3xl border border-[#46b8c3]/25 bg-[#46b8c3]/10 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1b6896]/70">Ready To Calculate</p>
              <p className="mt-2 text-sm text-[#1b6896]">
                This last screen only asks for existing obligations. Use Calculate to reveal the final eligible loan amount.
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const calculationSteps = results?.eligible
    ? (() => {
        const steps: { s: string; l: string; v: string; d: string }[] = [];
        let stepNum = 1;

        if (employment === 'salaried') {
          steps.push({
            s: String(stepNum++),
            l: 'Gross Monthly Income',
            v: fmt(monthlySalary),
            d: 'For salaried profiles, the declared monthly salary is taken as the base income with full recognition.',
          });
        } else if (assessmentMethod === 'itr') {
          steps.push({
            s: String(stepNum++),
            l: 'Net Profit - FY1',
            v: fmt(itrProfitY1),
            d: `${fmt(itrRevY1)} revenue minus ${fmt(itrExpY1)} expenses.`,
          });
          steps.push({
            s: String(stepNum++),
            l: 'Net Profit - FY2',
            v: fmt(itrProfitY2),
            d: `${fmt(itrRevY2)} revenue minus ${fmt(itrExpY2)} expenses.`,
          });
          steps.push({
            s: String(stepNum++),
            l: 'Average Monthly Income',
            v: fmt(itrMonthlyIncome),
            d: `Two-year average annual profit ${fmt(itrAvgProfit)} divided by 12.`,
          });
        } else if (assessmentMethod === 'gst-turnover') {
          steps.push({
            s: String(stepNum++),
            l: 'Turnover-Based Income',
            v: fmt(gstMonthlyIncome),
            d: `${fmtLakhs(gstAnnualSales)} annual sales multiplied by ${turnoverFactor}% and divided by 12.`,
          });
        } else {
          steps.push({
            s: String(stepNum++),
            l: 'ADB-Based Income',
            v: fmt(adbMonthlyIncome),
            d: `${fmt(avgBankBalance)} average balance multiplied by ${adbFactor}%.`,
          });
        }

        if (employment !== 'salaried') {
          steps.push({
            s: String(stepNum++),
            l: 'Recognised Income',
            v: fmt(results.recognisedIncome),
            d: `${fmt(derivedMonthlyIncome)} multiplied by ${recognitionRate}% recognition.`,
          });
        }

        steps.push({
          s: String(stepNum++),
          l: 'FOIR Applied',
          v: `${(results.foirRate * 100).toFixed(0)}%`,
          d: foirOverride
            ? `Manual FOIR override applied at ${customFOIR}%.`
            : 'Auto FOIR applied based on recognised income slab and employment rules.',
        });
        steps.push({
          s: String(stepNum++),
          l: 'Maximum EMI Capacity',
          v: fmt(results.maxEMI),
          d: `${fmt(results.recognisedIncome)} multiplied by ${(results.foirRate * 100).toFixed(0)}%.`,
        });
        steps.push({
          s: String(stepNum++),
          l: 'Net EMI Capacity',
          v: fmt(results.netEMI),
          d: `${fmt(results.maxEMI)} minus ${fmt(obligations)} existing obligations.`,
        });
        steps.push({
          s: String(stepNum++),
          l: 'Maximum Tenure',
          v: `${results.tenureYears} years`,
          d: `Minimum of retirement runway and product cap for ${employment}.`,
        });
        steps.push({
          s: String(stepNum++),
          l: 'Effective Interest Rate',
          v: `${results.effectiveRate.toFixed(2)}%`,
          d: `${interestRate.toFixed(2)}% base rate plus ${results.ltvPremium >= 0 ? '+' : ''}${results.ltvPremium}% LTV premium.`,
        });
        steps.push({
          s: String(stepNum++),
          l: 'Loan By EMI',
          v: fmt(results.loanFromEMI),
          d: 'Loan amount derived from EMI affordability using the standard amortization formula.',
        });
        steps.push({
          s: String(stepNum++),
          l: 'Loan By LTV',
          v: fmt(results.loanByLTV),
          d: `${fmtLakhs(propertyValue)} property value capped at ${(results.ltvSlab * 100).toFixed(0)}% LTV.`,
        });
        steps.push({
          s: String(stepNum++),
          l: 'Pre-Credit Cap',
          v: fmt(results.preCreditLoan),
          d: 'Minimum of EMI-based cap, LTV cap, and requested loan amount.',
        });
        steps.push({
          s: String(stepNum++),
          l: 'Credit Adjustment',
          v: fmt(results.finalLoan),
          d: `Pre-credit cap adjusted by CIBIL multiplier ${results.cibilAdj.factor}.`,
        });

        return steps;
      })()
    : [];

  const summaryRows = [
    { label: 'Employment', value: employment === 'self-employed' ? 'Self-Employed' : employment === 'professional' ? 'Professional' : 'Salaried' },
    { label: 'Income Base', value: `${fmt(derivedMonthlyIncome)} / mo` },
    { label: 'Recognised Income', value: `${fmt(displayRecognisedIncome)} / mo` },
    { label: 'Age / CIBIL', value: `${age} yrs / ${cibil}` },
    { label: 'Property / Loan', value: `${fmtLakhs(propertyValue)} / ${fmtLakhs(loanApplied)}` },
  ];

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-6 mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="mb-6 flex flex-wrap items-center gap-1.5">
          {STEPS.map((item, index) => (
            <React.Fragment key={item.id}>
              <button onClick={() => goToStep(item.id)} className="group flex items-center gap-2">
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all',
                    step === item.id
                      ? 'scale-110 bg-[#144d78] text-white'
                      : step > item.id
                        ? 'bg-[#46b8c3] text-white'
                        : 'bg-slate-100 text-slate-400',
                  )}
                >
                  {step > item.id ? '✓' : item.id}
                </div>
                <span
                  className={cn(
                    'hidden text-xs font-semibold sm:block',
                    step === item.id ? 'text-[#144d78]' : step > item.id ? 'text-[#46b8c3]' : 'text-slate-400',
                  )}
                >
                  {item.label}
                </span>
              </button>
              {index < STEPS.length - 1 ? (
                <ArrowRight className={cn('h-3.5 w-3.5 shrink-0', step > item.id ? 'text-[#46b8c3]' : 'text-slate-200')} />
              ) : null}
            </React.Fragment>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
            <div className="border-b border-slate-100 bg-slate-50/70 px-6 py-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#46b8c3]">
                Phase {step} of {STEPS.length}
              </p>
              <h2 className="mt-2 text-2xl font-bold text-[#0d3a5c]">{currentStepMeta.title}</h2>
              <p className="mt-2 max-w-2xl text-sm text-slate-500">{currentStepMeta.description}</p>
            </div>

            <div className="p-6">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={step}
                  custom={direction}
                  variants={{
                    enter: (value: number) => ({ opacity: 0, x: value * 32 }),
                    center: { opacity: 1, x: 0 },
                    exit: (value: number) => ({ opacity: 0, x: value * -32 }),
                  }}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.22, ease: 'easeInOut' }}
                >
                  {renderCurrentScreen()}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex flex-col gap-4 border-t border-slate-100 px-6 py-5 md:flex-row md:items-center md:justify-between">
              <div>
                {stepError ? <p className="text-sm font-medium text-red-500">{stepError}</p> : <p className="text-sm text-slate-500">Move through the screens in order to keep the form lightweight.</p>}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={goBack}
                  disabled={step === 1}
                  className={cn(
                    'flex items-center gap-2 rounded-2xl border px-5 py-2.5 text-sm font-semibold transition-all',
                    step === 1
                      ? 'cursor-not-allowed border-slate-100 text-slate-300'
                      : 'border-slate-200 text-slate-500 hover:border-[#144d78] hover:text-[#144d78]',
                  )}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>

                {step < STEPS.length ? (
                  <button
                    onClick={goNext}
                    disabled={Boolean(stepError)}
                    className={cn(
                      'flex items-center gap-2 rounded-2xl px-6 py-2.5 text-sm font-semibold transition-all',
                      stepError
                        ? 'cursor-not-allowed bg-slate-200 text-slate-400'
                        : 'bg-[#144d78] text-white hover:bg-[#1b6896]',
                    )}
                  >
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleCalculate}
                    disabled={Boolean(stepError)}
                    className={cn(
                      'flex items-center gap-2 rounded-2xl px-6 py-2.5 text-sm font-semibold transition-all',
                      stepError
                        ? 'cursor-not-allowed bg-slate-200 text-slate-400'
                        : 'bg-[#46b8c3] text-[#0d3a5c] hover:bg-[#5ac5cf]',
                    )}
                  >
                    Calculate
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <motion.aside
            initial="hidden"
            animate="visible"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } } }}
            className="rounded-3xl border border-[#1b6896] bg-[#144d78] p-6 text-white shadow-sm"
          >
            <motion.div variants={staggerItem}>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8edce4]">Flow Snapshot</p>
              <h3 className="mt-2 text-2xl font-bold">One screen at a time</h3>
              <p className="mt-2 text-sm text-slate-300">
                The calculator now stages inputs so the borrower only sees the decisions relevant to the current phase.
              </p>
            </motion.div>
            <motion.div variants={staggerItem} className="mt-6 space-y-3">
              {summaryRows.map((row) => (
                <React.Fragment key={row.label}>
                  <SummaryRow label={row.label} value={row.value} accent={row.label === 'Recognised Income'} />
                </React.Fragment>
              ))}
            </motion.div>
            <motion.div variants={staggerItem} className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">Current Screen Goal</p>
              <p className="mt-2 text-sm text-white">{currentStepMeta.label}</p>
              <p className="mt-1 text-sm text-slate-300">{currentStepMeta.description}</p>
            </motion.div>
          </motion.aside>
        </div>
      </motion.div>

      {hasCalculated ? (
        <div ref={resultsRef}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="relative mb-10 overflow-hidden rounded-3xl border border-[#1b6896] bg-gradient-to-br from-[#144d78] to-[#1b6896] p-8 text-center shadow-2xl md:p-12"
          >
            <div className="absolute right-0 top-0 h-72 w-72 translate-x-1/3 -translate-y-1/2 rounded-full bg-white/5 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-48 w-48 -translate-x-1/3 translate-y-1/2 rounded-full bg-[#46b8c3]/10 blur-3xl" />

            {results?.eligible ? (
              <>
                <h1 className="relative z-10 mb-6 text-5xl font-extrabold leading-tight tracking-tight text-white md:text-7xl">
                  Eligible for <span className="bg-gradient-to-r from-[#46b8c3] to-[#8edce4] bg-clip-text text-transparent">{fmtLakhs(results.finalLoan)}</span>
                </h1>
                <p className="relative z-10 mx-auto max-w-2xl text-xl font-light leading-relaxed text-white/60 md:text-2xl">
                  Based on {fmt(displayRecognisedIncome)} recognised income, CIBIL {cibil}, and a property value of {fmtLakhs(propertyValue)}.
                </p>
              </>
            ) : (
              <>
                <h1 className="relative z-10 mb-6 text-4xl font-extrabold leading-tight tracking-tight text-white md:text-5xl">
                  {ageError ? 'Age Out of Range' : cibilAdj.factor === 0 ? 'CIBIL Too Low' : 'Obligations Too High'}
                </h1>
                <p className="relative z-10 mx-auto max-w-2xl text-xl font-light leading-relaxed text-white/60">
                  {ageError ||
                    (cibilAdj.factor === 0
                      ? 'CIBIL score below 650 usually leads to a decline.'
                      : 'Existing EMIs consume too much of the permitted FOIR capacity.')}
                </p>
              </>
            )}
          </motion.div>

          {results?.eligible ? (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-10 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"
              >
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08, delayChildren: 0.35 } } }}
                  className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
                >
                  <motion.div variants={staggerItem}>
                    <MiniStat label="FOIR Applied" value={`${(results.foirRate * 100).toFixed(0)}%`} />
                  </motion.div>
                  <motion.div variants={staggerItem}>
                    <MiniStat label="Net EMI Capacity" value={fmt(results.netEMI)} />
                  </motion.div>
                  <motion.div variants={staggerItem}>
                    <MiniStat label="Max Tenure" value={`${results.tenureYears} years`} />
                  </motion.div>
                  <motion.div variants={staggerItem}>
                    <MiniStat label="Effective Rate" value={`${results.effectiveRate.toFixed(2)}%`} />
                  </motion.div>
                </motion.div>
              </motion.div>

              <div className="mb-10 grid grid-cols-1 gap-8 md:grid-cols-2">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className={cn(
                    'rounded-3xl border bg-white p-8 shadow-sm transition-shadow duration-300 hover:shadow-lg',
                    cibil > 780 ? 'border-green-200' : cibil >= 750 ? 'border-blue-200' : 'border-amber-200',
                  )}
                >
                  <div className="mb-6">
                    <div
                      className={cn(
                        'inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold',
                        cibil > 780 ? 'bg-green-100 text-green-700' : cibil >= 750 ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700',
                      )}
                    >
                      {cibil > 780 ? <TrendingUp className="h-4 w-4" /> : cibil >= 750 ? <Minus className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                      CIBIL: {cibil}
                    </div>
                  </div>
                  <h3 className="mb-2 text-2xl font-bold text-[#0d3a5c]">Credit Score Impact</h3>
                  <p className="mb-8 text-sm text-slate-500">
                    Your score applies a <span className={cn('font-semibold', results.cibilAdj.color)}>{results.cibilAdj.label}</span> adjustment.
                  </p>
                  <div className="space-y-4">
                    <SummaryRow label="Pre-adjustment" value={fmt(results.preCreditLoan)} dark={false} />
                    <SummaryRow label="Multiplier" value={`x${results.cibilAdj.factor}`} dark={false} />
                    <SummaryRow label="Final Amount" value={fmt(results.finalLoan)} accent dark={false} />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="relative overflow-hidden rounded-3xl border border-[#1b6896] bg-[#144d78] p-8 text-white shadow-sm transition-shadow duration-300 hover:shadow-lg"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#1b6896]/30 to-transparent" />
                  <div className="relative z-10 mb-6">
                    <div className="inline-flex items-center gap-2 rounded-full border border-[#46b8c3]/30 bg-[#46b8c3]/20 px-3 py-1 text-sm font-semibold text-[#46b8c3]">
                      Loan Constraints
                    </div>
                  </div>
                  <h3 className="relative z-10 mb-2 text-2xl font-bold text-white">Three-Way Cap</h3>
                  <p className="relative z-10 mb-8 text-sm text-slate-300">Final eligibility is the minimum of EMI affordability, LTV cap, and requested amount.</p>
                  <div className="relative z-10 space-y-4">
                    <SummaryRow label="EMI Capacity" value={fmt(results.loanFromEMI)} />
                    <SummaryRow label={`LTV Cap (${(results.ltvSlab * 100).toFixed(0)}%)`} value={fmt(results.loanByLTV)} />
                    <SummaryRow label="Applied Amount" value={fmt(loanApplied)} />
                    <SummaryRow label="Binding Constraint" value={fmt(results.preCreditLoan)} accent />
                  </div>
                </motion.div>
              </div>

              <ScrollFadeIn className="mb-12 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/50 px-8 py-6">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#144d78]/10">
                    <CheckCircle2 className="h-4 w-4 text-[#1b6896]" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-[#0d3a5c]">How This Was Calculated</h3>
                    <p className="mt-1 text-sm text-slate-500">Step-by-step underwriting path</p>
                  </div>
                </div>
                <div className="space-y-4 p-8">
                  {calculationSteps.map((item) => (
                    <div key={item.s} className="flex items-start gap-4 rounded-lg bg-slate-50 p-4 transition-colors hover:bg-slate-100/80">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#144d78] text-sm font-bold text-white">
                        {item.s}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-[#0d3a5c]">{item.l}</div>
                        <div className="mt-1 text-sm text-slate-500">{item.d}</div>
                      </div>
                      <div className="whitespace-nowrap text-right font-bold text-[#144d78]">{item.v}</div>
                    </div>
                  ))}
                </div>
              </ScrollFadeIn>

              <ScrollFadeIn className="mb-12 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/50 px-8 py-6">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#46b8c3]/15">
                    <CheckCircle2 className="h-4 w-4 text-[#1b6896]" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-[#0d3a5c]">Reference Tables</h3>
                    <p className="mt-1 text-sm text-slate-500">Current slabs driving the eligibility result</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-6 p-8 md:grid-cols-2">
                  <div className="rounded-xl bg-slate-50 p-5">
                    <h4 className="mb-3 font-semibold text-[#0d3a5c]">FOIR Slabs</h4>
                    <div className="space-y-2 text-sm">
                      <div className={displayRecognisedIncome < 50000 ? 'font-bold text-[#144d78]' : 'text-slate-600'}>{'<'} Rs. 50K / month -&gt; 40%</div>
                      <div className={displayRecognisedIncome >= 50000 && displayRecognisedIncome < 100000 ? 'font-bold text-[#144d78]' : 'text-slate-600'}>Rs. 50K - Rs. 1L / month -&gt; 50%</div>
                      <div className={displayRecognisedIncome >= 100000 && displayRecognisedIncome < 200000 ? 'font-bold text-[#144d78]' : 'text-slate-600'}>Rs. 1L - Rs. 2L / month -&gt; 55%</div>
                      <div className={displayRecognisedIncome >= 200000 ? 'font-bold text-[#144d78]' : 'text-slate-600'}>{'>'} Rs. 2L / month -&gt; 60%</div>
                    </div>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-5">
                    <h4 className="mb-3 font-semibold text-[#0d3a5c]">LTV Norms</h4>
                    <div className="space-y-2 text-sm">
                      <div className={propertyValue <= 3000000 ? 'font-bold text-[#144d78]' : 'text-slate-600'}>{'<='} Rs. 30L property -&gt; 90%</div>
                      <div className={propertyValue > 3000000 && propertyValue <= 7500000 ? 'font-bold text-[#144d78]' : 'text-slate-600'}>Rs. 30L - Rs. 75L property -&gt; 80%</div>
                      <div className={propertyValue > 7500000 ? 'font-bold text-[#144d78]' : 'text-slate-600'}>{'>'} Rs. 75L property -&gt; 75%</div>
                    </div>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-5">
                    <h4 className="mb-3 font-semibold text-[#0d3a5c]">LTV Rate Premium</h4>
                    <div className="space-y-2 text-sm">
                      <div className={results.actualLTV <= 0.6 ? 'font-bold text-green-600' : 'text-slate-600'}>{'<='} 60% -&gt; -0.10%</div>
                      <div className={results.actualLTV > 0.6 && results.actualLTV <= 0.75 ? 'font-bold text-[#144d78]' : 'text-slate-600'}>61% - 75% -&gt; 0%</div>
                      <div className={results.actualLTV > 0.75 && results.actualLTV <= 0.8 ? 'font-bold text-amber-600' : 'text-slate-600'}>76% - 80% -&gt; +0.25%</div>
                      <div className={results.actualLTV > 0.8 ? 'font-bold text-red-500' : 'text-slate-600'}>{'>'} 80% -&gt; +0.50%</div>
                    </div>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-5">
                    <h4 className="mb-3 font-semibold text-[#0d3a5c]">CIBIL To Base Rate</h4>
                    <div className="space-y-2 text-sm">
                      {[
                        { min: 800, max: 900, band: '800+', rate: '7.25%' },
                        { min: 775, max: 799, band: '775-799', rate: '7.50%' },
                        { min: 750, max: 774, band: '750-774', rate: '7.75%' },
                        { min: 725, max: 749, band: '725-749', rate: '8.10%' },
                        { min: 700, max: 724, band: '700-724', rate: '8.50%' },
                        { min: 675, max: 699, band: '675-699', rate: '8.95%' },
                        { min: 650, max: 674, band: '650-674', rate: '9.50%' },
                        { min: 0, max: 649, band: 'Below 650', rate: '10.25%' },
                      ].map((item) => (
                        <div key={item.band} className={cibil >= item.min && cibil <= item.max ? 'font-bold text-[#144d78]' : 'text-slate-600'}>
                          {item.band} -&gt; {item.rate}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-5">
                    <h4 className="mb-3 font-semibold text-[#0d3a5c]">Max Tenure By Profile</h4>
                    <div className="space-y-2 text-sm">
                      <div className={employment === 'salaried' ? 'font-bold text-[#144d78]' : 'text-slate-600'}>Salaried -&gt; 30 years, retire at 60</div>
                      <div className={employment === 'self-employed' ? 'font-bold text-[#144d78]' : 'text-slate-600'}>Self-Employed -&gt; 20 years, retire at 60</div>
                      <div className={employment === 'professional' ? 'font-bold text-[#144d78]' : 'text-slate-600'}>Professional -&gt; 30 years, retire at 65</div>
                    </div>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-5">
                    <h4 className="mb-3 font-semibold text-[#0d3a5c]">Current Underwriting Snapshot</h4>
                    <div className="space-y-2 text-sm text-slate-600">
                      <div>Recognised income -&gt; {fmt(displayRecognisedIncome)}</div>
                      <div>FOIR used -&gt; {(results.foirRate * 100).toFixed(0)}%</div>
                      <div>Requested LTV -&gt; {(results.actualLTV * 100).toFixed(0)}%</div>
                      <div>Existing obligations -&gt; {fmt(obligations)}</div>
                    </div>
                  </div>
                </div>
              </ScrollFadeIn>
            </>
          ) : null}
        </div>
      ) : null}
    </>
  );
};

export default AmountCalcFlow;

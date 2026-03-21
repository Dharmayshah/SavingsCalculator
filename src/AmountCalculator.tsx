import React, { useState } from 'react';
import { motion } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import BasicAmountCalc from './BasicAmountCalc';
import AmountCalcFlow from './AmountCalcFlow';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Employment = 'salaried' | 'self-employed' | 'professional';
type Mode = 'basic' | 'advanced';

export default function AmountCalculator() {
  const [mode, setMode] = useState<Mode>('basic');
  const [employment, setEmployment] = useState<Employment>('salaried');
  const [monthlyIncome, setMonthlyIncome] = useState(100000);
  const [age, setAge] = useState(30);
  const [cibil, setCibil] = useState(760);
  const [propertyValue, setPropertyValue] = useState(5000000);
  const [loanApplied, setLoanApplied] = useState(4000000);
  const [obligations, setObligations] = useState(10000);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="mt-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#46b8c3]">Amount Calculator</p>
            <h2 className="mt-1 text-2xl font-bold text-[#0d3a5c]">Choose the level of detail</h2>
            <p className="mt-1 text-sm text-slate-500">
              Start simple for faster lead capture, then switch to advanced when you need underwriting-specific assumptions.
            </p>
          </div>

          <div className="inline-flex rounded-2xl bg-slate-100 p-1">
            {([
              ['basic', 'Basic'],
              ['advanced', 'Advanced'],
            ] as const).map(([value, label]) => (
              <button
                key={value}
                onClick={() => setMode(value)}
                className={cn(
                  'rounded-xl px-5 py-2 text-sm font-semibold transition-all',
                  mode === value ? 'bg-[#144d78] text-white shadow-sm' : 'text-slate-500 hover:text-[#144d78]',
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {mode === 'basic' ? (
        <BasicAmountCalc
          employment={employment}
          setEmployment={setEmployment}
          monthlyIncome={monthlyIncome}
          setMonthlyIncome={setMonthlyIncome}
          age={age}
          setAge={setAge}
          cibil={cibil}
          setCibil={setCibil}
          propertyValue={propertyValue}
          setPropertyValue={setPropertyValue}
          loanApplied={loanApplied}
          setLoanApplied={setLoanApplied}
          obligations={obligations}
          setObligations={setObligations}
        />
      ) : (
        <AmountCalcFlow />
      )}
    </>
  );
}

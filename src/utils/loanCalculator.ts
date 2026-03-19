export function calculateEMI(principal: number, annualRate: number, months: number): number {
  const r = annualRate / 12 / 100;
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}

export function calculateTenure(principal: number, annualRate: number, emi: number): number {
  const r = annualRate / 12 / 100;
  const x = emi / (principal * r);
  if (x <= 1) return Infinity; // EMI is less than interest
  return Math.log(x / (x - 1)) / Math.log(1 + r);
}

export function generateAmortizationSchedule(principal: number, annualRate: number, emi: number, months: number) {
  let balance = principal;
  const r = annualRate / 12 / 100;
  const schedule = [];
  let totalInterest = 0;
  const safeMonths = isFinite(months) ? Math.min(months, 1200) : 1200;

  for (let i = 1; i <= safeMonths; i++) {
    const interest = balance * r;
    let principalPayment = emi - interest;
    
    if (balance < principalPayment) {
        principalPayment = balance;
    }
    
    balance -= principalPayment;
    totalInterest += interest;

    if (i % 12 === 0 || balance <= 0) {
      schedule.push({
        month: i,
        year: Math.ceil(i / 12),
        balance: Math.max(0, balance),
        interestPaid: totalInterest,
        principalPaid: principal - balance
      });
    }

    if (balance <= 0) break;
  }

  return schedule;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatLakhs(amount: number): string {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  }
  return `₹${(amount / 100000).toFixed(2)} L`;
}

import React, { useRef, useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { ArrowDown, CheckCircle2, Phone, Mail, User, Building2, Send, ChevronUp, CalendarDays, Timer, Shield, Eye, Scale, Rocket, RefreshCw, ArrowRightLeft, Zap, Clock } from 'lucide-react';
import App from './App';

function formatIndianNumber(amount: number) {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(amount);
}

function StickyNav({ activeSection }: { activeSection: string }) {
  const [visible, setVisible] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;
    const handler = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const heroH = window.innerHeight * 0.8;
        setScrolled(y > heroH);
        // Show on any scroll up (even 1px), hide only on scroll down past hero
        if (y < lastY) {
          setVisible(true);
        } else if (y > lastY && y > heroH) {
          setVisible(false);
        }
        lastY = y;
        ticking = false;
      });
    };
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const links = [
    { id: 'hero', label: 'Home' },
    { id: 'calculator', label: 'Calculator' },
    { id: 'our-approach', label: 'Our Approach' },
    { id: 'how-it-works', label: 'How It Works' },
    { id: 'footer', label: 'Contact' },
  ];

  return (
    <>
      {/* Logo — top left */}
      <div
        className={`hidden lg:block fixed top-6 left-8 z-50 transition-all duration-500 ease-in-out ${
          !visible ? '-translate-y-32 opacity-0' : ''
        } ${scrolled ? 'opacity-0 pointer-events-none' : ''}`}
      >
        <a href="#hero" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#1b6896] to-[#46b8c3] flex items-center justify-center shadow-md shadow-[#46b8c3]/20">
            <ArrowDown className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-bold tracking-tight text-[#144d78]">RateReset</span>
        </a>
      </div>

      {/* Floating pill nav — center */}
      <div
        className={`hidden lg:block fixed top-6 inset-x-0 max-w-xl mx-auto z-50 transition-all duration-500 ease-in-out ${
          !visible ? '-translate-y-32 opacity-0' : ''
        }`}
      >
        <nav className="relative rounded-full border border-[#1b6896]/30 bg-[#46b8c3]/10 backdrop-blur-sm flex justify-center space-x-10 px-8 py-3">
          {links.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              className={`text-lg font-semibold transition-colors ${
                activeSection === link.id
                  ? 'text-[#144d78]'
                  : 'text-slate-400 hover:text-[#144d78]'
              }`}
              style={{ letterSpacing: '0.01em' }}
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>

      {/* CTA — top right */}
      <div
        className={`hidden lg:block fixed top-6 right-8 z-50 transition-all duration-500 ease-in-out ${
          !visible ? '-translate-y-32 opacity-0' : ''
        } ${scrolled ? 'opacity-0 pointer-events-none' : ''}`}
      >
        <a
          href="#avail"
          className="inline-flex items-center justify-center px-6 py-3 bg-[#46b8c3] text-white rounded-full text-sm font-medium hover:bg-[#46b8c3]/90 transition-colors"
          style={{ letterSpacing: '0.01em' }}
        >
          Submit Request
        </a>
      </div>

      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <a href="#hero" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#1b6896] to-[#46b8c3] flex items-center justify-center">
                <ArrowDown className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-sm font-bold text-[#144d78]">RateReset</span>
            </a>
            <a
              href="#avail"
              className="px-4 py-2 bg-[#46b8c3] text-white rounded-full text-sm font-medium hover:bg-[#46b8c3]/90 transition-colors"
            >
              Submit Request
            </a>
          </div>
        </div>
      </header>
    </>
  );
}

function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = () => setVisible(window.scrollY > 600);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-6 right-6 z-50 w-11 h-11 rounded-2xl bg-[#144d78] text-white shadow-xl shadow-[#144d78]/30 flex items-center justify-center hover:bg-[#1b6896] transition-colors"
    >
      <ChevronUp className="w-5 h-5" />
    </button>
  );
}

function HeroSection({ heroRef }: { heroRef: React.RefObject<HTMLDivElement | null> }) {
  const textRef = useRef<HTMLHeadingElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!textRef.current) return;
    const rect = textRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    textRef.current.style.backgroundImage = `radial-gradient(circle 600px at ${x}px ${y}px, #144d78, #46b8c3)`;
  };

  return (
    <section
      ref={heroRef}
      id="hero"
      className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden bg-white"
      onMouseMove={handleMouseMove}
    >
      {/* Fading bars from left (blue) */}
      <div className="bg-fade-left-bar bg-fade-left-bar-1"></div>
      <div className="bg-fade-left-bar bg-fade-left-bar-2"></div>
      <div className="bg-fade-left-bar bg-fade-left-bar-3"></div>
      <div className="bg-fade-left-bar bg-fade-left-bar-4"></div>
      <div className="bg-fade-left-bar bg-fade-left-bar-5"></div>
      <div className="bg-fade-left-bar bg-fade-left-bar-6"></div>
      <div className="bg-fade-left-bar bg-fade-left-bar-7 hidden lg:block"></div>
      <div className="bg-fade-left-bar bg-fade-left-bar-8 hidden lg:block"></div>

      {/* Fading bars from right (teal) */}
      <div className="bg-fade-right-bar bg-fade-right-bar-1"></div>
      <div className="bg-fade-right-bar bg-fade-right-bar-2"></div>
      <div className="bg-fade-right-bar bg-fade-right-bar-3"></div>
      <div className="bg-fade-right-bar bg-fade-right-bar-4"></div>
      <div className="bg-fade-right-bar bg-fade-right-bar-5"></div>
      <div className="bg-fade-right-bar bg-fade-right-bar-6"></div>
      <div className="bg-fade-right-bar bg-fade-right-bar-7 hidden lg:block"></div>
      <div className="bg-fade-right-bar bg-fade-right-bar-8 hidden lg:block"></div>

      {/* Bottom fade to page bg */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-b from-transparent to-[#fafafa] z-[1]"></div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1
          ref={textRef}
          className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.4] mb-6 relative z-10"
          style={{
            backgroundImage: 'radial-gradient(circle 600px at 50% 50%, #144d78, #46b8c3)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          } as React.CSSProperties}
        >
          A Small Rate Drop.
          <br />
          A Massive Wealth Shift.
        </h1>

        <p className="text-base text-slate-400 font-medium leading-relaxed">
              When you bought your home, you focused on getting the loan approved. Now, it's time to{' '}
              <span className="text-[#144d78] font-semibold">optimize</span> it.
              Just a 1% reduction in your interest rate can change your financial future.
            </p>

        <div className="flex flex-col items-center gap-3">
          <a
            href="#calculator"
            className="group inline-flex items-center gap-3 px-8 py-4 rounded-full bg-[#46b8c3] text-white font-bold text-base hover:bg-[#46b8c3]/90 transition-all"
          >
            Calculate My Exact Savings
            <ArrowDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
          </a>
          
          
          <p className="text-xs text-slate-400">(Takes less than 2 minutes · Zero physical paperwork)</p>
          <p className="text-xs text-slate-400 mt-1">🔒 Bank-grade security · Built on India's Account Aggregator (AA) network</p>
          <a
            href="#avail"
            className="text-sm text-slate-400 hover:text-[#144d78] font-medium transition-colors mt-1"
          >
            or skip to request a rate reset →
          </a>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-slate-300 flex items-start justify-center pt-2">
          <div className="w-1 h-2 rounded-full bg-slate-400" />
        </div>
      </div>
    </section>
  );
}

export default function OnePager() {
  const heroRef = useRef<HTMLDivElement>(null);
  const calcRef = useRef<HTMLDivElement>(null);
  const availRef = useRef<HTMLDivElement>(null);
  const howRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState('hero');

  // Lead form state — pre-filled from calculator defaults
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [bank, setBank] = useState('');
  const [loanAmount, setLoanAmount] = useState('1,00,00,000');
  const [currentRate, setCurrentRate] = useState('8');
  const [sanctionDate, setSanctionDate] = useState('');
  const [originalTenure, setOriginalTenure] = useState('20');
  const [cibilScore, setCibilScore] = useState('');
  const [obligations, setObligations] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Auto-calculate remaining tenure from sanction date + original tenure
  const remainingTenure = React.useMemo(() => {
    if (!sanctionDate || !originalTenure) return null;
    const sanction = new Date(sanctionDate);
    if (isNaN(sanction.getTime())) return null;
    const tenureYears = parseInt(originalTenure, 10);
    if (!tenureYears || tenureYears <= 0) return null;
    const endDate = new Date(sanction);
    endDate.setFullYear(endDate.getFullYear() + tenureYears);
    const now = new Date();
    if (endDate <= now) return { years: 0, months: 0, totalMonths: 0, elapsed: true };
    const diffMs = endDate.getTime() - now.getTime();
    const totalMonths = Math.ceil(diffMs / (1000 * 60 * 60 * 24 * 30.44));
    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;
    // Elapsed time
    const elapsedMs = now.getTime() - sanction.getTime();
    const elapsedMonths = Math.max(0, Math.floor(elapsedMs / (1000 * 60 * 60 * 24 * 30.44)));
    const elapsedYears = Math.floor(elapsedMonths / 12);
    const elapsedRemainingMonths = elapsedMonths % 12;
    return { years, months, totalMonths, elapsed: false, elapsedYears, elapsedRemainingMonths };
  }, [sanctionDate, originalTenure]);

  // Intersection observer for active section
  useEffect(() => {
    const sections = [
      { id: 'hero', ref: heroRef },
      { id: 'calculator', ref: calcRef },
      { id: 'avail', ref: availRef },
      { id: 'how-it-works', ref: howRef },
      { id: 'footer', ref: footerRef },
    ];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            if (id) setActiveSection(id);
          }
        });
      },
      { threshold: 0.3 }
    );
    sections.forEach(({ ref }) => {
      if (ref.current) observer.observe(ref.current);
    });
    return () => observer.disconnect();
  }, []);

  const [queryName, setQueryName] = useState('');
  const [queryEmail, setQueryEmail] = useState('');
  const [queryMessage, setQueryMessage] = useState('');
  const [querySent, setQuerySent] = useState(false);

  const handleQuerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ queryName, queryEmail, queryMessage });
    setQuerySent(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ name, phone, email, bank, loanAmount, currentRate, sanctionDate, originalTenure, remainingTenure, cibilScore, obligations });
    setSubmitted(true);
  };

  const inputClass =
    'w-full rounded-2xl border border-slate-200 bg-[#144d78]/[0.03] px-4 py-3 text-lg font-bold text-[#144d78] outline-none transition-all focus:border-[#46b8c3] focus:bg-white placeholder:text-slate-400 placeholder:font-normal placeholder:text-base';

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#0d3a5c] font-['Poppins',sans-serif] selection:bg-[#46b8c3]/30">
      <StickyNav activeSection={activeSection} />

      {/* ═══════════════════════════════════════════
          SECTION 1 — HERO / PROMOTIONAL BANNER
      ═══════════════════════════════════════════ */}
      <HeroSection heroRef={heroRef} />

      {/* ═══════════════════════════════════════════
          SECTION 1.5 — THE "AHA" MOMENT (SAVINGS HIGHLIGHT)
      ═══════════════════════════════════════════ */}
      <section className="scroll-mt-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-4">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#0d3a5c] tracking-tight mb-3">
              A Small Rate Drop. A Massive Wealth Shift.
            </h2>
            <p className="text-base text-slate-400 font-medium leading-relaxed">
              When you bought your home, you focused on getting the loan approved. Now, it's time to{' '}
              <span className="text-[#144d78] font-semibold">optimize</span> it.
              Just a 1% reduction in your interest rate can change your financial future.
            </p>
            <p className="text-sm text-slate-400 mt-3">
              Stop settling for market averages. Discover your{' '}
              <span className="text-[#144d78] font-semibold">exact personalized savings</span> down to the last rupee.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 2 — CALCULATOR
      ═══════════════════════════════════════════ */}
      <section ref={calcRef} id="calculator" className="scroll-mt-14 pt-4">
        <App />
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 2.5 — IS THIS FOR YOU? (ELIGIBILITY)
      ═══════════════════════════════════════════ */}
      <section className="scroll-mt-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-8 py-6 border-b border-[#46b8c3]/20 bg-[#46b8c3]/10">
              <h3 className="text-2xl font-bold text-[#0d3a5c]">Who Benefits the Most?</h3>
              <p className="text-base text-slate-400 font-medium mt-1">If you check these boxes, you're likely sitting on hidden savings.</p>
            </div>
            <div className="p-6 flex flex-col sm:flex-row items-center gap-6 justify-center">
              {[
                { label: 'Outstanding Loan', value: '> ₹10 Lakhs' },
                { label: 'Remaining Tenure', value: '> 5 Years' },
                { label: 'Current Rate', value: '8.0% or higher' },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center gap-3 rounded-2xl bg-[#144d78]/[0.03] px-5 py-4">
                  <CheckCircle2 className="w-5 h-5 text-[#46b8c3] shrink-0" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">{label}</p>
                    <p className="text-sm font-bold text-[#0d3a5c]">{value}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-8 pb-6 text-center">
              <a href="#avail" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#46b8c3] text-white font-bold text-sm hover:bg-[#46b8c3]/90 transition-all">
                Check My Eligibility in 60 Seconds
                <ArrowDown className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 2.75 — OUR APPROACH: RESET-FIRST, SWITCH-SECOND
      ═══════════════════════════════════════════ */}
      <section id="our-approach" className="scroll-mt-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-8 py-6 border-b border-[#46b8c3]/20 bg-[#46b8c3]/10">
              <h3 className="text-2xl font-bold text-[#0d3a5c]">The Smartest Way to Optimize Your Home Loan</h3>
              <p className="text-base text-slate-400 font-medium mt-1">
                Every comparison site shows you a better rate. We are the only platform that{' '}
                <span className="text-[#144d78] font-semibold">actually gets it for you</span>.
              </p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Step 1: Same-Bank Reset */}
                <div className="rounded-2xl border border-[#46b8c3]/20 bg-[#46b8c3]/[0.04] p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-[#46b8c3] text-white text-sm font-bold flex items-center justify-center shrink-0">1</div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#46b8c3]">Preferred Path</p>
                      <h4 className="text-lg font-bold text-[#0d3a5c]">The 'Same-Bank' Reset</h4>
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed mb-4">
                    We believe the best loan transfer is the one you don't have to make. We use data-driven insights to negotiate directly with your current lender. Often, they are happy to reprice your loan to retain a great customer like you.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#144d78] bg-[#46b8c3]/10 px-3 py-1.5 rounded-full">
                      <Clock className="w-3 h-3" /> Done in 48 hours
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#144d78] bg-[#46b8c3]/10 px-3 py-1.5 rounded-full">
                      <RefreshCw className="w-3 h-3" /> Zero paperwork
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#144d78] bg-[#46b8c3]/10 px-3 py-1.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" /> Lower rate, same bank
                    </span>
                  </div>
                </div>

                {/* Step 2: Seamless Switch (Balance Transfer) */}
                <div className="rounded-2xl border border-[#1b6896]/20 bg-[#1b6896]/[0.04] p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-[#1b6896] text-white text-sm font-bold flex items-center justify-center shrink-0">2</div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#1b6896]">If Needed</p>
                      <h4 className="text-lg font-bold text-[#0d3a5c]">The Seamless Switch (Balance Transfer)</h4>
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed mb-4">
                    If a better deal exists elsewhere and your current lender cannot match it, our AI instantly identifies the optimal new bank. We handle 100% of the back-and-forth execution to transfer your balance smoothly.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#144d78] bg-[#1b6896]/10 px-3 py-1.5 rounded-full">
                      <Zap className="w-3 h-3" /> Maximum savings
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#144d78] bg-[#1b6896]/10 px-3 py-1.5 rounded-full">
                      <ArrowRightLeft className="w-3 h-3" /> Minimum friction
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#144d78] bg-[#1b6896]/10 px-3 py-1.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" /> We manage everything
                    </span>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 3 — AVAIL SERVICES / LEAD FORM
      ═══════════════════════════════════════════ */}
      <section ref={availRef} id="avail" className="scroll-mt-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-12">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-8 py-6 border-b border-[#46b8c3]/20 bg-[#46b8c3]/10">
              <h3 className="text-2xl font-bold text-[#0d3a5c]">Let Us Handle the Paperwork</h3>
              <p className="text-base text-slate-400 font-medium mt-1">No endless document uploads. No waiting in bank queues. Just intelligent, seamless execution.</p>
            </div>

          <AnimatePresence mode="wait">
            {submitted ? (
              <div className="max-w-2xl mx-auto text-center py-16">
                <div className="w-20 h-20 rounded-full bg-[#46b8c3]/15 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10 text-[#46b8c3]" />
                </div>
                <h3 className="text-2xl font-bold text-[#0d3a5c] mb-3">Request Submitted!</h3>
                <p className="text-base text-slate-500 max-w-md mx-auto">
                  We've received your details. Our team will review your loan and get back to you within 24 hours.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
              >
                <div className="relative bg-white rounded-3xl">
                  <div className="p-6">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                      <div>
                        <label className="mb-1.5 block text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                          Full Name
                        </label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1b6896]/40 font-semibold text-base">✉</span>
                          <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your name"
                            className={`${inputClass} pl-10`}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                          Phone Number
                        </label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1b6896]/40 font-semibold text-base">+91</span>
                          <input
                            type="tel"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="XXXXX XXXXX"
                            className={`${inputClass} pl-12`}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                          Email
                        </label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1b6896]/40 font-semibold text-base">@</span>
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@email.com"
                            className={`${inputClass} pl-10`}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                          Current Bank
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={bank}
                            onChange={(e) => setBank(e.target.value)}
                            placeholder="e.g. SBI, HDFC, ICICI"
                            className={inputClass}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                          Loan Amount
                        </label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1b6896]/40 font-semibold text-base">₹</span>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={loanAmount}
                            onChange={(e) => setLoanAmount(e.target.value.replace(/[^0-9,]/g, ''))}
                            className={`${inputClass} pl-8`}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                          Current Rate
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            inputMode="decimal"
                            value={currentRate}
                            onChange={(e) => setCurrentRate(e.target.value.replace(/[^0-9.]/g, ''))}
                            className={`${inputClass} pr-10`}
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1b6896]/40 font-semibold text-base">%</span>
                        </div>
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                          Sanction Date
                        </label>
                        <div className="relative">
                          <CalendarDays className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1b6896]/40 pointer-events-none" />
                          <input
                            type="date"
                            value={sanctionDate}
                            onChange={(e) => setSanctionDate(e.target.value)}
                            max={new Date().toISOString().split('T')[0]}
                            className={`${inputClass} pl-10`}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                          Original Tenure
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            inputMode="numeric"
                            value={originalTenure}
                            onChange={(e) => setOriginalTenure(e.target.value.replace(/[^0-9]/g, ''))}
                            className={`${inputClass} pr-14`}
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1b6896]/40 font-semibold text-base">years</span>
                        </div>
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                          CIBIL Score
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            inputMode="numeric"
                            value={cibilScore}
                            onChange={(e) => setCibilScore(e.target.value.replace(/[^0-9]/g, ''))}
                            placeholder="e.g. 750"
                            className={inputClass}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                          Existing EMI Obligations
                        </label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1b6896]/40 font-semibold text-base">₹</span>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={obligations}
                            onChange={(e) => setObligations(e.target.value.replace(/[^0-9,]/g, ''))}
                            placeholder="Monthly total"
                            className={`${inputClass} pl-8`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Remaining Tenure — auto-calculated */}
                    {remainingTenure && (
                      <div className="rounded-2xl border border-dashed border-[#46b8c3]/30 bg-[#46b8c3]/[0.04] px-4 py-3 mt-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <Timer className="w-4 h-4 text-[#46b8c3]" />
                            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Remaining Tenure</span>
                          </div>
                          {remainingTenure.elapsed ? (
                            <span className="text-sm font-bold text-red-500">Loan tenure completed</span>
                          ) : (
                            <span className="text-base font-bold text-[#144d78]">
                              {remainingTenure.years > 0 && <>{remainingTenure.years}<span className="text-sm font-semibold text-slate-400"> yr </span></>}
                              {remainingTenure.months}<span className="text-sm font-semibold text-slate-400"> mo</span>
                            </span>
                          )}
                        </div>
                        {!remainingTenure.elapsed && remainingTenure.elapsedYears !== undefined && (
                          <p className="text-xs text-slate-400 mt-1 pl-6">
                            {remainingTenure.elapsedYears > 0 && `${remainingTenure.elapsedYears}y `}{remainingTenure.elapsedRemainingMonths}m elapsed · {remainingTenure.totalMonths} months remaining
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Submit */}
                  <div className="px-8 py-6 bg-[#46b8c3]/10 border-t border-[#46b8c3]/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-slate-500 max-w-sm">
                      Our consultation is free. Rate resets involve a bank conversion fee (typically 0.25 to 0.5% of outstanding) and signing a supplementary loan agreement.
                    </p>
                    <button
                      type="submit"
                      className="flex items-center gap-2 px-8 py-3 rounded-full bg-[#46b8c3] text-white font-bold text-sm hover:bg-[#46b8c3]/90 transition-all whitespace-nowrap"
                    >
                      Submit Request
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </form>
            )}
          </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 4 — HOW IT WORKS (4-STEP PROCESS)
      ═══════════════════════════════════════════ */}
      <section id="how-it-works" ref={howRef} className="scroll-mt-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-12">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-8 py-6 border-b border-[#46b8c3]/20 bg-[#46b8c3]/10">
              <h3 className="text-2xl font-bold text-[#0d3a5c]">Smarter Borrowing in 4 Simple Steps</h3>
              <p className="text-base text-slate-400 font-medium mt-1">No endless document uploads. No waiting in bank queues. Just intelligent, seamless execution.</p>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5 mb-6">
            {[
              { step: '1', label: 'Discover Exact Savings', desc: 'Securely connect your loan account. Our AI analyzes your outstanding principal, loan age & market rates to show your exact ₹ savings.' },
              { step: '2', label: 'Choose Your Path', desc: 'View transparent options — reset with your current bank (done in 48 hrs) or switch to a new lender offering a better rate.' },
              { step: '3', label: 'We Do the Heavy Lifting', desc: 'Sit back. We handle 100% of the negotiations, paperwork & bank coordination on your behalf.' },
              { step: '4', label: 'Track for Life', desc: 'Your loan is optimized. Track your financial health as we continuously monitor the market for your next saving opportunity.' },
            ].map(({ step, label, desc }, i) => (
              <div
                key={step}
                className="relative rounded-2xl bg-[#144d78]/[0.03] px-4 py-6 text-center transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-[#46b8c3] text-white text-sm font-bold flex items-center justify-center mx-auto mb-3">
                  {step}
                </div>
                <p className="text-sm font-bold text-[#0d3a5c] mb-2">{label}</p>
                <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
                {i < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 -translate-y-1/2 text-slate-200 text-lg">→</div>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500 text-center max-w-lg mx-auto">
            Our consultation is free. Rate resets typically involve a bank conversion fee (0.25 to 0.5% of outstanding principal) and a supplementary agreement with your lender.
          </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 5 — TRUST & SECURITY
      ═══════════════════════════════════════════ */}
      <section className="scroll-mt-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-8 py-6 border-b border-[#46b8c3]/20 bg-[#46b8c3]/10">
              <h3 className="text-2xl font-bold text-[#0d3a5c]">Bank-Grade Security. Transparent Execution.</h3>
              <p className="text-base text-slate-400 font-medium mt-1">Your financial data is sacred.</p>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: Shield, title: 'RBI-Compliant', desc: 'Powered by India\'s Digital Public Infrastructure (DPI) and Account Aggregator (AA) framework. Your data is encrypted and completely secure.' },
                { icon: Eye, title: 'Read-Only Access', desc: 'We only access the data required to calculate your savings. We do not store your sensitive banking credentials.' },
                { icon: Scale, title: 'No Commission Bias', desc: 'Unlike platforms that push you to switch banks just to earn a commission, our AI evaluates both Reset and Transfer paths. We recommend the path that yields the highest net savings for you.' },
                { icon: Rocket, title: 'Guaranteed Execution', desc: 'We aren\'t just an advisory service. We are an execution platform. If we show you a savings number, we manage the entire process to make it a reality.' },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="rounded-2xl bg-[#144d78]/[0.03] p-5 text-center">
                  <Icon className="w-6 h-6 text-[#46b8c3] mx-auto mb-3" />
                  <p className="text-sm font-bold text-[#0d3a5c] mb-1">{title}</p>
                  <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════════ */}
      <footer id="footer" ref={footerRef} className="scroll-mt-14 bg-[#0d3a5c] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left — Brand + Contact */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#1b6896] to-[#46b8c3] flex items-center justify-center">
                  <ArrowDown className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold">RateReset</span>
              </div>
              <p className="text-sm text-white/50 max-w-sm mb-6 leading-relaxed">
                India's AI-powered home loan optimization platform. We negotiate with your existing lender to lower your rate, or seamlessly switch you to a better deal. Reset-first, switch-second.
              </p>
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-white/40 mb-3">Contact</h3>
              <div className="space-y-2.5 mb-6">
                <div className="flex items-start gap-3">
                  <Building2 className="w-4 h-4 text-white/40 mt-0.5 shrink-0" />
                  <p className="text-sm text-white/50 leading-relaxed">A-306, The First, B/S Keshavbaug Party Plot, Vastrapur, Ahmedabad</p>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-white/40 shrink-0" />
                  <a href="mailto:info@finsagex.com" className="text-sm text-white/50 hover:text-[#46b8c3] transition-colors">info@finsagex.com</a>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-white/40 shrink-0" />
                  <a href="tel:+918511083170" className="text-sm text-white/50 hover:text-[#46b8c3] transition-colors">+91 8511083170</a>
                </div>
              </div>
              <a
                href="https://www.linkedin.com/company/askbirbal"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-[#46b8c3] transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                LinkedIn
              </a>
            </div>

            {/* Right — Query Form */}
            <div>
              <h3 className="text-lg font-bold mb-1">Have a Question?</h3>
              <p className="text-sm text-white/50 mb-6">Drop us a message and we’ll get back to you.</p>
              {querySent ? (
                <div className="rounded-2xl border border-[#46b8c3]/30 bg-[#46b8c3]/10 p-6 text-center">
                  <CheckCircle2 className="w-8 h-8 text-[#46b8c3] mx-auto mb-3" />
                  <p className="text-sm font-semibold text-white">Message sent!</p>
                  <p className="text-xs text-white/50 mt-1">We’ll get back to you shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleQuerySubmit} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      value={queryName}
                      onChange={(e) => setQueryName(e.target.value)}
                      placeholder="Name"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#46b8c3]/50"
                    />
                    <input
                      type="email"
                      required
                      value={queryEmail}
                      onChange={(e) => setQueryEmail(e.target.value)}
                      placeholder="Email"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#46b8c3]/50"
                    />
                  </div>
                  <textarea
                    required
                    value={queryMessage}
                    onChange={(e) => setQueryMessage(e.target.value)}
                    placeholder="Your message..."
                    rows={3}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#46b8c3]/50 resize-none"
                  />
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#46b8c3] text-[#0d3a5c] font-semibold text-sm hover:bg-[#46b8c3]/90 transition-colors"
                  >
                    Send Message
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Final CTA */}
          <div className="mt-12 pt-8 border-t border-white/10 text-center">
            <p className="text-lg font-bold text-white/80 mb-2">Every rate cut creates a new opportunity. Don't leave your money on the table.</p>
            <p className="text-sm text-white/50 mb-5">Join the smarter borrowers who are actively managing their liabilities and reclaiming their wealth.</p>
            <a
              href="#avail"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-[#46b8c3] text-white font-bold text-sm hover:bg-[#46b8c3]/90 transition-all"
            >
              Start Saving Today
              <ArrowDown className="w-4 h-4" />
            </a>
            <p className="text-xs text-white/30 mt-6">Consultation is free. Bank conversion fees & supplementary agreement apply. Not a financial advisor.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

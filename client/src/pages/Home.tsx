/*
 * MeNova Health — Home Page
 * Design: Biophilic Wellness Modernism
 * Colors: Forest Green oklch(0.24 0.07 155), Terracotta oklch(0.60 0.12 42), Cream oklch(0.98 0.01 90)
 * Typography: Playfair Display (headings) + DM Sans (body)
 * Layout: MEDVi-inspired with dark hero, horizontal category scroll, alternating feature sections
 */

import { AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import SymptomQuiz from "@/components/SymptomQuiz";
import WaitlistSection from "@/components/WaitlistSection";
import {
  CheckCircle2,
  ArrowRight,
  Menu,
  X,
  Star,
  Leaf,
  HeartPulse,
  Brain,
  Shield,
  Clock,
  Package,
  Video,
  ChevronDown,
} from "lucide-react";

// ─── Image URLs ───────────────────────────────────────────────────────────────
const HERO_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663515887063/Mbboc9yaua4MvveQ5gebGn/menova-hero-bg-jRKC2iNt3D4DtGerP5ykiZ.webp";
const WOMAN_HERO = "https://d2xsxph8kpxj0f.cloudfront.net/310519663515887063/Mbboc9yaua4MvveQ5gebGn/menova-woman-hero-TdGCoZDVuHwERKBpG5xxdo.webp";
const WOMAN_OUTDOOR = "https://d2xsxph8kpxj0f.cloudfront.net/310519663515887063/Mbboc9yaua4MvveQ5gebGn/menova-woman-outdoor-DmRovSNgWvgd9QDKqkUgts.webp";
const CONSULTATION = "https://d2xsxph8kpxj0f.cloudfront.net/310519663515887063/Mbboc9yaua4MvveQ5gebGn/menova-consultation-7HLYCdQ4bkU8gNuifUHess.webp";

// ─── Scroll Animation Component ───────────────────────────────────────────────
function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => el.classList.add("visible"), delay);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);
  return (
    <div ref={ref} className={`fade-up ${className}`}>
      {children}
    </div>
  );
}

// ─── Navigation ───────────────────────────────────────────────────────────────
function Navbar({ onOpenQuiz }: { onOpenQuiz: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const navLinks = [
    { label: "How It Works", href: "#how-it-works" },
    { label: "Treatments", href: "#treatments" },
    { label: "Pricing", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/95 backdrop-blur-md shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <a href="#" className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: scrolled ? "oklch(0.24 0.07 155)" : "rgba(255,255,255,0.2)" }}
            >
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <span
              className="text-xl font-bold tracking-tight"
              style={{
                fontFamily: "'Playfair Display', serif",
                color: scrolled ? "oklch(0.24 0.07 155)" : "white",
              }}
            >
              MeNova
            </span>
          </a>

          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium transition-colors duration-200 hover:opacity-100"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  color: scrolled ? "oklch(0.35 0.005 65)" : "rgba(255,255,255,0.82)",
                }}
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <button
              onClick={onOpenQuiz}
              className="btn-terracotta"
              style={{ padding: "0.6rem 1.5rem", fontSize: "0.875rem" }}
            >
              Start Your Assessment
            </button>
          </div>

          <button
            className="lg:hidden p-2 rounded-md"
            style={{ color: scrolled ? "oklch(0.24 0.07 155)" : "white" }}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="block text-sm font-medium py-2"
                style={{ fontFamily: "'DM Sans', sans-serif", color: "oklch(0.35 0.005 65)" }}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <button onClick={() => { onOpenQuiz(); setMobileOpen(false); }} className="btn-terracotta block text-center w-full mt-4">
              Start Your Assessment
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

// ─── Hero Section ─────────────────────────────────────────────────────────────
function HeroSection({ onOpenQuiz }: { onOpenQuiz: () => void }) {
  return (
    <section
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{ backgroundColor: "oklch(0.18 0.07 155)" }}
    >
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${HERO_BG})`, opacity: 0.22 }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.18 0.07 155 / 0.96) 40%, oklch(0.24 0.07 155 / 0.72) 100%)",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="mb-6">
              <span
                className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded-full"
                style={{
                  backgroundColor: "rgba(255,255,255,0.10)",
                  color: "rgba(255,255,255,0.85)",
                  fontFamily: "'DM Sans', sans-serif",
                  backdropFilter: "blur(8px)",
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                Join 2,500+ BC women in their menopause journey
              </span>
            </div>

            <h1
              className="text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight mb-6"
              style={{ fontFamily: "'Playfair Display', serif", color: "white" }}
            >
              Menopause care,{" "}
              <em className="not-italic" style={{ color: "oklch(0.75 0.10 42)" }}>
                redefined
              </em>{" "}
              for BC women.
            </h1>

            <p
              className="text-lg lg:text-xl mb-8 leading-relaxed max-w-lg"
              style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(255,255,255,0.72)" }}
            >
              Vancouver's menopause telehealth clinic. See a BC-licensed Nurse Practitioner this week — no referral, no 6-month wait. Personalized Bioidentical Hormone Replacement Therapy (BHRT) delivered to your door.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <button onClick={onOpenQuiz} className="btn-terracotta text-center">
                Take the Free Symptom Quiz
              </button>
              <a
                href="https://cal.com/menova/initial-consultation"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full text-sm font-semibold border-2 transition-all hover:bg-white/10"
                style={{ fontFamily: "'DM Sans', sans-serif", color: "white", borderColor: "rgba(255,255,255,0.45)" }}
              >
                Book a Consultation <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            <div className="flex flex-wrap gap-6">
              {[
                { icon: Shield, label: "Health Canada Compliant" },
                { icon: Video, label: "100% Virtual Care" },
                { icon: Package, label: "Delivered to Your Door" },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 text-sm"
                  style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(255,255,255,0.65)" }}
                >
                  <Icon className="w-4 h-4" style={{ color: "oklch(0.75 0.10 42)" }} />
                  {label}
                </div>
              ))}
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div
              className="relative rounded-3xl overflow-hidden shadow-2xl"
              style={{ maxWidth: 420, marginLeft: "auto" }}
            >
              <img
                src={WOMAN_HERO}
                alt="BC woman in her 40s experiencing menopause relief through telehealth BHRT care"
                className="w-full object-cover"
                style={{ height: 520 }}
              />
              <div
                className="absolute bottom-6 left-6 right-6 rounded-2xl p-4"
                style={{ backgroundColor: "rgba(255,255,255,0.93)", backdropFilter: "blur(12px)" }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "oklch(0.24 0.07 155 / 0.10)" }}
                  >
                    <HeartPulse className="w-5 h-5" style={{ color: "oklch(0.24 0.07 155)" }} />
                  </div>
                  <div>
                    <p
                      className="text-xs font-semibold"
                      style={{ color: "oklch(0.24 0.07 155)", fontFamily: "'DM Sans', sans-serif" }}
                    >
                      Next available appointment
                    </p>
                    <p
                      className="text-sm font-bold"
                      style={{ color: "oklch(0.22 0.005 65)", fontFamily: "'DM Sans', sans-serif" }}
                    >
                      This week — Book in 2 minutes
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-15"
              style={{ backgroundColor: "oklch(0.60 0.12 42)" }}
            />
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-40">
        <span className="text-xs text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>Scroll</span>
        <ChevronDown className="w-4 h-4 text-white animate-bounce" />
      </div>
    </section>
  );
}

// ─── Category Scroll ──────────────────────────────────────────────────────────
function CategoryScroll() {
  const categories = [
    { label: "Bioidentical Hormone Replacement Therapy (BHRT)", icon: "🌿" },
    { label: "Hot Flash Relief", icon: "🌡️" },
    { label: "Sleep & Mood Support", icon: "🌙" },
    { label: "Brain Fog & Energy", icon: "⚡" },
    { label: "Weight Management", icon: "💪" },
    { label: "Skin & Hair Health", icon: "✨" },
    { label: "Bone & Heart Health", icon: "❤️" },
    { label: "Libido & Intimacy", icon: "🌸" },
  ];
  const doubled = [...categories, ...categories];

  return (
    <section
      className="py-5 overflow-hidden border-y"
      style={{ backgroundColor: "white", borderColor: "oklch(0.88 0.01 90)" }}
    >
      <div className="flex" style={{ width: "max-content" }}>
        <div className="flex animate-marquee">
          {doubled.map((cat, i) => (
            <button
              key={i}
              onClick={() => toast.info(`${cat.label} — Feature coming soon`)}
              className="flex items-center gap-2 mx-6 whitespace-nowrap group"
            >
              <span className="text-base">{cat.icon}</span>
              <span
                className="text-sm font-medium"
                style={{ fontFamily: "'DM Sans', sans-serif", color: "oklch(0.40 0.005 65)" }}
              >
                {cat.label}
              </span>
              <ArrowRight
                className="w-3 h-3 transition-transform group-hover:translate-x-1"
                style={{ color: "oklch(0.60 0.12 42)" }}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Trust Bar ────────────────────────────────────────────────────────────────
function TrustBar() {
  const items = [
    { icon: Shield, label: "Licensed NPs & MDs" },
    { icon: Video, label: "100% Online" },
    { icon: Package, label: "Shipped to Your Door" },
    { icon: Clock, label: "Book This Week" },
    { icon: HeartPulse, label: "BC-Based Providers" },
  ];

  return (
    <section
      className="py-3 border-b"
      style={{ backgroundColor: "oklch(0.96 0.015 90)", borderColor: "oklch(0.88 0.01 90)" }}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-wrap justify-center gap-6 lg:gap-10">
          {items.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2">
              <Icon className="w-4 h-4" style={{ color: "oklch(0.24 0.07 155)" }} />
              <span
                className="text-xs font-semibold tracking-wide uppercase"
                style={{ fontFamily: "'DM Sans', sans-serif", color: "oklch(0.40 0.005 65)" }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── What Is BHRT Explainer Section ─────────────────────────────────────────
function WhatIsBHRTSection() {
  const steps = [
    {
      id: 1,
      icon: (
        <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
          <circle cx="24" cy="24" r="20" fill="oklch(0.24 0.07 155 / 0.12)" />
          <path d="M16 28c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="oklch(0.24 0.07 155)" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="24" cy="18" r="3.5" fill="oklch(0.24 0.07 155)" />
          <path d="M20 34h8" stroke="oklch(0.60 0.12 42)" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      ),
      label: "Your body's hormone levels decline",
      sublabel: "Perimenopause & menopause",
    },
    {
      id: 2,
      icon: (
        <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
          <circle cx="24" cy="24" r="20" fill="oklch(0.60 0.12 42 / 0.12)" />
          <rect x="14" y="20" width="20" height="12" rx="3" stroke="oklch(0.60 0.12 42)" strokeWidth="2.5" />
          <path d="M18 20v-3a6 6 0 0 1 12 0v3" stroke="oklch(0.60 0.12 42)" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="24" cy="26" r="2.5" fill="oklch(0.60 0.12 42)" />
        </svg>
      ),
      label: "Bioidentical hormones are prescribed",
      sublabel: "Molecularly identical to yours",
    },
    {
      id: 3,
      icon: (
        <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
          <circle cx="24" cy="24" r="20" fill="oklch(0.24 0.07 155 / 0.12)" />
          <path d="M16 32l4-8 4 5 3-4 5 7" stroke="oklch(0.24 0.07 155)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M14 20h4M30 20h4" stroke="oklch(0.24 0.07 155)" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
      label: "Compounded & delivered to you",
      sublabel: "Custom dose, BC pharmacy",
    },
    {
      id: 4,
      icon: (
        <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
          <circle cx="24" cy="24" r="20" fill="oklch(0.60 0.12 42 / 0.12)" />
          <path d="M24 14v4M24 30v4M14 24h4M30 24h4" stroke="oklch(0.60 0.12 42)" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="24" cy="24" r="5" stroke="oklch(0.60 0.12 42)" strokeWidth="2.5" />
          <circle cx="24" cy="24" r="2" fill="oklch(0.60 0.12 42)" />
        </svg>
      ),
      label: "Hormones rebalance naturally",
      sublabel: "Energy, sleep & mood restored",
    },
  ];

  const comparisons = [
    { label: "Source", bhrt: "Derived from plants (yam, soy)", synth: "Synthetic or animal-derived", highlight: true },
    { label: "Structure", bhrt: "Identical to human hormones", synth: "Similar but not identical", highlight: false },
    { label: "Dosing", bhrt: "Custom-compounded for you", synth: "Standard fixed doses", highlight: true },
    { label: "Delivery", bhrt: "Cream, gel, patch, or capsule", synth: "Mostly oral pill or patch", highlight: false },
    { label: "Monitoring", bhrt: "Regular NP check-ins & labs", synth: "Less frequent follow-up", highlight: true },
    { label: "Regulation", bhrt: "Health Canada compliant", synth: "Health Canada approved", highlight: false },
  ];

  return (
    <section
      id="what-is-bhrt"
      className="py-20 lg:py-28"
      style={{ backgroundColor: "oklch(0.97 0.015 90)" }}
      aria-label="What is Bioidentical Hormone Replacement Therapy BHRT Vancouver BC"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <FadeUp className="text-center mb-16">
          <span className="badge-forest mb-4">Understanding Your Treatment</span>
          <h2
            className="text-4xl lg:text-5xl font-bold mb-4 leading-tight"
            style={{ fontFamily: "'Playfair Display', serif", color: "oklch(0.22 0.005 65)" }}
          >
            What is{" "}
            <em className="not-italic" style={{ color: "oklch(0.24 0.07 155)" }}>
              Bioidentical Hormone
            </em>
            <br />
            Replacement Therapy?
          </h2>
          <p
            className="text-base lg:text-lg max-w-2xl mx-auto leading-relaxed"
            style={{ fontFamily: "'DM Sans', sans-serif", color: "oklch(0.45 0.005 65)" }}
          >
            As you approach perimenopause and menopause, your body produces less estrogen, progesterone, and testosterone.
            Bioidentical Hormone Replacement Therapy (BHRT) restores these levels using hormones that are{" "}
            <strong style={{ color: "oklch(0.24 0.07 155)" }}>molecularly identical</strong> to the ones your body naturally makes.
          </p>
        </FadeUp>

        {/* How It Works Diagram */}
        <FadeUp className="mb-20">
          <div
            className="rounded-3xl p-8 lg:p-12"
            style={{ backgroundColor: "white", border: "1px solid oklch(0.88 0.01 90)" }}
          >
            <p
              className="text-center text-xs font-semibold tracking-widest uppercase mb-10"
              style={{ fontFamily: "'DM Sans', sans-serif", color: "oklch(0.55 0.005 65)" }}
            >
              How Bioidentical Hormone Replacement Therapy Works
            </p>

            {/* Step flow */}
            <div className="relative">
              {/* Connector line — desktop only */}
              <div
                className="hidden lg:block absolute top-12 left-[12.5%] right-[12.5%] h-0.5"
                style={{ backgroundColor: "oklch(0.88 0.01 90)" }}
              />

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
                {steps.map((step, i) => (
                  <div key={step.id} className="flex flex-col items-center text-center">
                    {/* Icon bubble */}
                    <div
                      className="w-20 h-20 rounded-full flex items-center justify-center mb-4 shadow-sm relative"
                      style={{ backgroundColor: "oklch(0.97 0.015 90)", border: "2px solid oklch(0.88 0.01 90)" }}
                    >
                      {step.icon}
                      {/* Step number badge */}
                      <span
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                        style={{
                          backgroundColor: i % 2 === 0 ? "oklch(0.24 0.07 155)" : "oklch(0.60 0.12 42)",
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        {step.id}
                      </span>
                    </div>
                    <p
                      className="text-sm font-bold mb-1 leading-snug"
                      style={{ fontFamily: "'DM Sans', sans-serif", color: "oklch(0.22 0.005 65)" }}
                    >
                      {step.label}
                    </p>
                    <p
                      className="text-xs"
                      style={{ fontFamily: "'DM Sans', sans-serif", color: "oklch(0.55 0.005 65)" }}
                    >
                      {step.sublabel}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Hormone level SVG chart */}
            <div className="mt-12 pt-10" style={{ borderTop: "1px solid oklch(0.92 0.01 90)" }}>
              <p
                className="text-center text-xs font-semibold tracking-widest uppercase mb-6"
                style={{ fontFamily: "'DM Sans', sans-serif", color: "oklch(0.55 0.005 65)" }}
              >
                Hormone Level Over Time
              </p>
              <div className="max-w-2xl mx-auto">
                <svg viewBox="0 0 600 200" className="w-full" style={{ overflow: "visible" }}>
                  {/* Grid lines */}
                  {[40, 80, 120, 160].map((y) => (
                    <line key={y} x1="60" y1={y} x2="580" y2={y} stroke="oklch(0.88 0.01 90)" strokeWidth="1" strokeDasharray="4 4" />
                  ))}

                  {/* Y-axis labels */}
                  <text x="50" y="44" textAnchor="end" fontSize="10" fill="oklch(0.55 0.005 65)" fontFamily="DM Sans, sans-serif">High</text>
                  <text x="50" y="124" textAnchor="end" fontSize="10" fill="oklch(0.55 0.005 65)" fontFamily="DM Sans, sans-serif">Mid</text>
                  <text x="50" y="164" textAnchor="end" fontSize="10" fill="oklch(0.55 0.005 65)" fontFamily="DM Sans, sans-serif">Low</text>

                  {/* X-axis labels */}
                  <text x="130" y="192" textAnchor="middle" fontSize="10" fill="oklch(0.55 0.005 65)" fontFamily="DM Sans, sans-serif">Pre-menopause</text>
                  <text x="290" y="192" textAnchor="middle" fontSize="10" fill="oklch(0.55 0.005 65)" fontFamily="DM Sans, sans-serif">Perimenopause</text>
                  <text x="430" y="192" textAnchor="middle" fontSize="10" fill="oklch(0.55 0.005 65)" fontFamily="DM Sans, sans-serif">Menopause</text>
                  <text x="540" y="192" textAnchor="middle" fontSize="10" fill="oklch(0.55 0.005 65)" fontFamily="DM Sans, sans-serif">With BHRT</text>

                  {/* Vertical dividers */}
                  <line x1="200" y1="30" x2="200" y2="175" stroke="oklch(0.88 0.01 90)" strokeWidth="1" strokeDasharray="4 4" />
                  <line x1="360" y1="30" x2="360" y2="175" stroke="oklch(0.88 0.01 90)" strokeWidth="1" strokeDasharray="4 4" />
                  <line x1="480" y1="30" x2="480" y2="175" stroke="oklch(0.88 0.01 90)" strokeWidth="1" strokeDasharray="4 4" />

                  {/* Declining natural hormone line */}
                  <path
                    d="M 70 60 C 130 58, 180 65, 200 75 C 240 95, 300 130, 360 155 C 400 168, 450 172, 480 173"
                    fill="none"
                    stroke="oklch(0.65 0.005 65)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray="6 3"
                  />

                  {/* BHRT restored line */}
                  <path
                    d="M 480 173 C 495 170, 510 100, 520 80 C 530 65, 545 58, 570 55"
                    fill="none"
                    stroke="oklch(0.24 0.07 155)"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />

                  {/* Shaded area under BHRT line */}
                  <path
                    d="M 480 173 C 495 170, 510 100, 520 80 C 530 65, 545 58, 570 55 L 570 175 L 480 175 Z"
                    fill="oklch(0.24 0.07 155 / 0.08)"
                  />

                  {/* BHRT start marker */}
                  <circle cx="480" cy="173" r="5" fill="oklch(0.60 0.12 42)" />
                  <line x1="480" y1="30" x2="480" y2="173" stroke="oklch(0.60 0.12 42)" strokeWidth="1.5" strokeDasharray="3 3" />
                  <rect x="430" y="14" width="100" height="18" rx="4" fill="oklch(0.60 0.12 42)" />
                  <text x="480" y="26" textAnchor="middle" fontSize="9" fill="white" fontFamily="DM Sans, sans-serif" fontWeight="600">BHRT Starts Here</text>

                  {/* Legend */}
                  <line x1="70" y1="15" x2="100" y2="15" stroke="oklch(0.65 0.005 65)" strokeWidth="2" strokeDasharray="5 3" />
                  <text x="105" y="19" fontSize="10" fill="oklch(0.55 0.005 65)" fontFamily="DM Sans, sans-serif">Natural hormone level</text>
                  <line x1="280" y1="15" x2="310" y2="15" stroke="oklch(0.24 0.07 155)" strokeWidth="2.5" />
                  <text x="315" y="19" fontSize="10" fill="oklch(0.24 0.07 155)" fontFamily="DM Sans, sans-serif" fontWeight="600">With Bioidentical HRT</text>
                </svg>
              </div>
            </div>
          </div>
        </FadeUp>

        {/* Comparison Table */}
        <FadeUp delay={80}>
          <div
            className="rounded-3xl overflow-hidden"
            style={{ border: "1px solid oklch(0.88 0.01 90)" }}
          >
            <div
              className="px-8 py-5"
              style={{ backgroundColor: "oklch(0.24 0.07 155)" }}
            >
              <h3
                className="text-xl font-bold text-white"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Bioidentical vs. Conventional Hormone Therapy
              </h3>
              <p
                className="text-sm mt-1"
                style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(255,255,255,0.60)" }}
              >
                Understanding the key differences
              </p>
            </div>

            {/* Table header */}
            <div
              className="grid grid-cols-3 px-8 py-3"
              style={{ backgroundColor: "oklch(0.22 0.07 155)", borderBottom: "1px solid oklch(0.88 0.01 90)" }}
            >
              <span className="text-xs font-semibold tracking-widest uppercase" style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(255,255,255,0.50)" }}>Feature</span>
              <span className="text-xs font-semibold tracking-widest uppercase" style={{ fontFamily: "'DM Sans', sans-serif", color: "oklch(0.75 0.10 42)" }}>Bioidentical HRT (MeNova)</span>
              <span className="text-xs font-semibold tracking-widest uppercase" style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(255,255,255,0.50)" }}>Conventional HRT</span>
            </div>

            {comparisons.map((row, i) => (
              <div
                key={row.label}
                className="grid grid-cols-3 px-8 py-4 items-center"
                style={{
                  backgroundColor: row.highlight ? "oklch(0.97 0.015 90)" : "white",
                  borderBottom: i < comparisons.length - 1 ? "1px solid oklch(0.92 0.01 90)" : "none",
                }}
              >
                <span
                  className="text-sm font-semibold"
                  style={{ fontFamily: "'DM Sans', sans-serif", color: "oklch(0.35 0.005 65)" }}
                >
                  {row.label}
                </span>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "oklch(0.24 0.07 155)" }} />
                  <span
                    className="text-sm font-medium"
                    style={{ fontFamily: "'DM Sans', sans-serif", color: "oklch(0.24 0.07 155)" }}
                  >
                    {row.bhrt}
                  </span>
                </div>
                <span
                  className="text-sm"
                  style={{ fontFamily: "'DM Sans', sans-serif", color: "oklch(0.55 0.005 65)" }}
                >
                  {row.synth}
                </span>
              </div>
            ))}
          </div>

          <p
            className="text-center text-xs mt-6"
            style={{ fontFamily: "'DM Sans', sans-serif", color: "oklch(0.60 0.005 65)" }}
          >
            All MeNova treatment plans are prescribed by BC-licensed Nurse Practitioners following current NAMS and SOGC guidelines.
          </p>
        </FadeUp>
      </div>
    </section>
  );
}

// ─── BHRT Feature Section ─────────────────────────────────────────────────────
function BHRTSection() {
  const features = [
    "Personalized Bioidentical Hormone Replacement Therapy (BHRT) prescription plan",
    "1:1 Nurse Practitioner guidance",
    "Unlimited 24/7 messaging support",
    "Symptom tracking & follow-ups",
    "Compounded meds delivered to your door",
  ];

  return (
    <section id="treatments" className="py-20 lg:py-28" style={{ backgroundColor: "white" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <FadeUp className="relative">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl overflow-hidden shadow-lg" style={{ height: 320 }}>
                <img src={WOMAN_HERO} alt="Woman feeling vibrant" className="w-full h-full object-cover" />
              </div>
              <div className="rounded-2xl overflow-hidden shadow-lg mt-10" style={{ height: 280 }}>
                <img src={CONSULTATION} alt="Telehealth consultation" className="w-full h-full object-cover" />
              </div>
            </div>
            <div
              className="absolute -bottom-4 left-4 rounded-2xl p-4 shadow-xl"
              style={{ backgroundColor: "oklch(0.24 0.07 155)" }}
            >
              <p
                className="text-3xl font-bold text-white"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                87%
              </p>
              <p
                className="text-xs mt-0.5"
                style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(255,255,255,0.75)" }}
              >
                report symptom relief
                <br />
                within 8 weeks
              </p>
            </div>
          </FadeUp>

          <FadeUp delay={120}>
            <span className="badge-forest mb-4">NP-Guided Bioidentical Hormone Replacement Therapy (BHRT) Care</span>
            <h2
              className="text-4xl lg:text-5xl font-bold mb-6 leading-tight"
              style={{ fontFamily: "'Playfair Display', serif", color: "oklch(0.22 0.005 65)" }}
            >
              Hormone balance{" "}
              <em className="not-italic" style={{ color: "oklch(0.24 0.07 155)" }}>
                made simple
              </em>{" "}
              with personalized care
            </h2>
            <p
              className="text-base lg:text-lg mb-8 leading-relaxed"
              style={{ fontFamily: "'DM Sans', sans-serif", color: "oklch(0.45 0.005 65)" }}
            >
              Find the right Bioidentical Hormone Replacement Therapy (BHRT) with the confidence that comes from knowing it is NP-approved, Health Canada compliant, and budget-friendly. No 6-month wait times.
            </p>

            <ul className="space-y-3 mb-8">
              {features.map((f) => (
                <li key={f} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color: "oklch(0.24 0.07 155)" }} />
                  <span
                    className="text-sm"
                    style={{ fontFamily: "'DM Sans', sans-serif", color: "oklch(0.35 0.005 65)" }}
                  >
                    {f}
                  </span>
                </li>
              ))}
            </ul>

            <a href="#quiz" className="btn-forest">
              Start Your Care Plan
            </a>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

// ─── How It Works ─────────────────────────────────────────────────────────────
function HowItWorksSection() {
  const steps = [
    {
      num: "01",
      title: "Take the Symptom Quiz",
      desc: "Complete our 2-minute Menopause Quick 6 assessment. It qualifies your symptoms and prepares your care profile before you speak to a provider.",
      icon: Brain,
    },
    {
      num: "02",
      title: "Book Your Video Consult",
      desc: "Choose a time that works for you. Meet your licensed BC Nurse Practitioner via secure video call — this week, not in 6 months.",
      icon: Video,
    },
    {
      num: "03",
      title: "Receive Your Custom Plan",
      desc: "Your NP prescribes a personalized Bioidentical Hormone Replacement Therapy (BHRT) plan. Your compounded medication is dispensed by our BC partner pharmacy and shipped discreetly to your door.",
      icon: Package,
    },
    {
      num: "04",
      title: "Ongoing Support",
      desc: "Track your progress, message your care team anytime, and attend follow-up appointments. Your plan evolves as your body does.",
      icon: HeartPulse,
    },
  ];

  return (
    <section
      id="how-it-works"
      className="py-20 lg:py-28"
      style={{ backgroundColor: "oklch(0.97 0.015 90)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeUp className="text-center mb-16">
          <span className="badge-forest mb-4">Simple Process</span>
          <h2
            className="text-4xl lg:text-5xl font-bold mb-4"
            style={{ fontFamily: "'Playfair Display', serif", color: "oklch(0.22 0.005 65)" }}
          >
            Care in{" "}
            <em className="not-italic" style={{ color: "oklch(0.24 0.07 155)" }}>
              four steps
            </em>
          </h2>
          <p
            className="text-base lg:text-lg max-w-xl mx-auto"
            style={{ fontFamily: "'DM Sans', sans-serif", color: "oklch(0.45 0.005 65)" }}
          >
            From symptom quiz to medication delivery — the entire process happens online, on your schedule.
          </p>
        </FadeUp>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <FadeUp key={step.num} delay={i * 100}>
              <div
                className="card-hover bg-white rounded-2xl p-6 shadow-sm border h-full"
                style={{ borderColor: "oklch(0.88 0.01 90)" }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: "oklch(0.24 0.07 155 / 0.08)" }}
                >
                  <step.icon className="w-6 h-6" style={{ color: "oklch(0.24 0.07 155)" }} />
                </div>
                <span
                  className="text-4xl font-bold opacity-10 block mb-2"
                  style={{ fontFamily: "'Playfair Display', serif", color: "oklch(0.24 0.07 155)" }}
                >
                  {step.num}
                </span>
                <h3
                  className="text-lg font-bold mb-2"
                  style={{ fontFamily: "'Playfair Display', serif", color: "oklch(0.22 0.005 65)" }}
                >
                  {step.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ fontFamily: "'DM Sans', sans-serif", color: "oklch(0.50 0.005 65)" }}
                >
                  {step.desc}
                </p>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Symptom Quiz CTA ─────────────────────────────────────────────────────────
function QuizSection({ onOpenQuiz }: { onOpenQuiz: () => void }) {
  const symptoms = [
    { label: "Hot Flashes", emoji: "🌡️" },
    { label: "Brain Fog", emoji: "🧠" },
    { label: "Sleep Issues", emoji: "🌙" },
    { label: "Low Energy", emoji: "⚡" },
    { label: "Mood Changes", emoji: "💚" },
    { label: "Weight Gain", emoji: "⚖️" },
  ];

  return (
    <section
      id="quiz"
      className="py-20 lg:py-28"
      style={{ backgroundColor: "oklch(0.24 0.07 155)" }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <FadeUp>
          <span
            className="inline-block text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded-full mb-6"
            style={{
              backgroundColor: "rgba(255,255,255,0.10)",
              color: "rgba(255,255,255,0.75)",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Free 3-Minute Assessment
          </span>
          <h2
            className="text-4xl lg:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Which symptoms are{" "}
            <em className="not-italic" style={{ color: "oklch(0.75 0.10 42)" }}>
              affecting you?
            </em>
          </h2>
          <p
            className="text-base lg:text-lg mb-10"
            style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(255,255,255,0.65)" }}
          >
            Take our free symptom assessment and get a personalised care recommendation — in under 3 minutes.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-10">
            {symptoms.map(({ label, emoji }) => (
              <div
                key={label}
                className="flex items-center gap-3 p-4 rounded-xl text-left"
                style={{
                  backgroundColor: "rgba(255,255,255,0.08)",
                  border: "1.5px solid rgba(255,255,255,0.18)",
                  color: "white",
                }}
              >
                <span className="text-xl">{emoji}</span>
                <span className="text-sm font-medium" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  {label}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={onOpenQuiz}
            className="btn-terracotta inline-flex items-center gap-2 text-base"
            style={{ padding: "1rem 2.5rem" }}
          >
            Start My Free Assessment <ArrowRight className="w-4 h-4" />
          </button>

          <p
            className="mt-4 text-xs"
            style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(255,255,255,0.40)" }}
          >
            Prescriptions are issued only after an online consultation with a licensed BC Nurse Practitioner.
          </p>
        </FadeUp>
      </div>
    </section>
  );
}

// ─── Whole-Body Care Section ──────────────────────────────────────────────────
function WholeCareSection() {
  const benefits = [
    "Hormone balance & Bioidentical Hormone Replacement Therapy (BHRT)",
    "Weight management support",
    "Sleep & mood optimization",
    "Skin health & radiance",
    "Brain fog & energy restoration",
    "Bone & cardiovascular health",
  ];

  return (
    <section className="py-20 lg:py-28" style={{ backgroundColor: "white" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <FadeUp>
            <span className="badge-forest mb-4">Care Designed for Women's Health</span>
            <h2
              className="text-4xl lg:text-5xl font-bold mb-6 leading-tight"
              style={{ fontFamily: "'Playfair Display', serif", color: "oklch(0.22 0.005 65)" }}
            >
              Whole-body care for her{" "}
              <em className="not-italic" style={{ color: "oklch(0.60 0.12 42)" }}>
                balance, vitality,
              </em>{" "}
              and confidence
            </h2>
            <p
              className="text-base lg:text-lg mb-8 leading-relaxed"
              style={{ fontFamily: "'DM Sans', sans-serif", color: "oklch(0.45 0.005 65)" }}
            >
              Doctor-guided care for hormones, weight, skin, and mood — with personalized treatment plans designed to support your health through every stage of perimenopause and beyond.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              {benefits.map((b) => (
                <div key={b} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: "oklch(0.60 0.12 42)" }} />
                  <span
                    className="text-sm"
                    style={{ fontFamily: "'DM Sans', sans-serif", color: "oklch(0.35 0.005 65)" }}
                  >
                    {b}
                  </span>
                </div>
              ))}
            </div>

            <a href="#quiz" className="btn-terracotta">
              Start Your Journey
            </a>
          </FadeUp>

          <FadeUp delay={120} className="relative">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl overflow-hidden shadow-lg" style={{ height: 360 }}>
                <img src={WOMAN_OUTDOOR} alt="Active woman outdoors" className="w-full h-full object-cover" />
              </div>
              <div className="rounded-2xl overflow-hidden shadow-lg mt-12" style={{ height: 300 }}>
                <img src={WOMAN_HERO} alt="Confident woman at home" className="w-full h-full object-cover" />
              </div>
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

// ─── Features / Portal Section ────────────────────────────────────────────────


// ─── Pricing Section ──────────────────────────────────────────────────────────
function PricingSection({ onOpenQuiz }: { onOpenQuiz: () => void }) {
  const plans = [
    {
      name: "💜 Initial Consult",
      originalPrice: "$259",
      price: "$199",
      period: "one-time",
      desc: "Your first step to feeling like yourself again.",
      features: [
        "60-minute 1-on-1 video consultation with a licensed Nurse Practitioner",
        "Full review of your symptoms, health history & hormone status",
        "Personalized treatment plan (HRT, lifestyle, supplements)",
        "Prescription issued same day if clinically appropriate",
        "Lab requisition & guidance on next steps",
        "Access to your secure patient portal",
      ],
      cta: "Book Consult",
      highlight: false,
      badge: null as string | null,
      isDisabled: false,
      link: "https://cal.com/menova/30min",
    },
    {
      name: "💜 Follow-Up (30 min)",
      originalPrice: "$149",
      price: "$119",
      period: "one-time",
      desc: "Check in, adjust, and keep progressing.",
      features: [
        "30-minute video visit with your NP",
        "Review of labs, symptoms & treatment response",
        "Medication adjustments or dose changes as needed",
        "Refill authorization & prescription renewal",
        "Ongoing progress tracking in your patient portal",
      ],
      cta: "https://cal.com/menova/follow-up-consultation",
      highlight: true,
      badge: null as string | null,
      isDisabled: false,
      link: "/schedule-followup",
    },
  ];

  return (
    <section id="pricing" className="py-20 lg:py-28" style={{ backgroundColor: "white" }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeUp className="text-center mb-16">
          <span className="badge-forest mb-4">Transparent Pricing</span>
          <h2
            className="text-4xl lg:text-5xl font-bold mb-4"
            style={{ fontFamily: "'Playfair Display', serif", color: "oklch(0.22 0.005 65)" }}
          >
            Clear pricing,{" "}
            <em className="not-italic" style={{ color: "oklch(0.24 0.07 155)" }}>
              no surprises
            </em>
          </h2>
          <p
            className="text-base max-w-lg mx-auto"
            style={{ fontFamily: "'DM Sans', sans-serif", color: "oklch(0.45 0.005 65)" }}
          >
            Most private insurance plans cover the medication portion. We'll help you navigate your benefits.
          </p>
        </FadeUp>

        <div className="grid md:grid-cols-2 gap-8">
          {plans.map((plan, i) => (
            <FadeUp key={plan.name} delay={i * 100}>
              <div
                className="relative rounded-3xl p-8 shadow-sm h-full flex flex-col"
                style={{
                  backgroundColor: plan.highlight ? "oklch(0.24 0.07 155)" : "oklch(0.97 0.015 90)",
                  border: `2px solid ${plan.highlight ? "oklch(0.24 0.07 155)" : "oklch(0.88 0.01 90)"}`,
                }}
              >
                {plan.badge && (
                  <span
                    className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide"
                    style={{
                      backgroundColor: "oklch(0.60 0.12 42)",
                      color: "white",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    {plan.badge}
                  </span>
                )}
                {plan.isDisabled && (
                  <div className="absolute inset-0 rounded-3xl" style={{ backgroundColor: "rgba(0,0,0,0.15)" }} />
                )}
                <p
                  className="text-xs font-semibold tracking-widest uppercase mb-2"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    color: plan.highlight ? "rgba(255,255,255,0.55)" : "oklch(0.50 0.005 65)",
                  }}
                >
                  {plan.name}
                </p>
                <div className="flex items-baseline gap-2 mb-1">
                  {plan.originalPrice && (
                    <span
                      className="text-2xl line-through"
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        color: plan.highlight ? "rgba(255,255,255,0.45)" : "oklch(0.55 0.005 65)",
                      }}
                    >
                      {plan.originalPrice}
                    </span>
                  )}
                  <span
                    className="text-5xl font-bold"
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      color: plan.highlight ? "white" : "oklch(0.22 0.005 65)",
                    }}
                  >
                    {plan.price}
                  </span>
                  <span
                    className="text-sm"
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      color: plan.highlight ? "rgba(255,255,255,0.55)" : "oklch(0.50 0.005 65)",
                    }}
                  >
                    CAD / {plan.period}
                  </span>
                </div>
                <p
                  className="text-sm mb-6"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    color: plan.highlight ? "rgba(255,255,255,0.65)" : "oklch(0.50 0.005 65)",
                  }}
                >
                  {plan.desc}
                </p>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-3">
                      <CheckCircle2
                        className="w-4 h-4 mt-0.5 flex-shrink-0"
                        style={{ color: plan.highlight ? "oklch(0.75 0.10 42)" : "oklch(0.24 0.07 155)" }}
                      />
                      <span
                        className="text-sm"
                        style={{
                          fontFamily: "'DM Sans', sans-serif",
                          color: plan.highlight ? "rgba(255,255,255,0.82)" : "oklch(0.35 0.005 65)",
                        }}
                      >
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>

                {plan.isDisabled ? (
                  <div
                    className="w-full text-center py-3 rounded-lg font-semibold"
                    style={{
                      backgroundColor: "oklch(0.85 0.01 90)",
                      color: "oklch(0.55 0.005 65)",
                      fontFamily: "'DM Sans', sans-serif",
                      opacity: 0.6,
                    }}
                  >
                    {plan.cta}
                  </div>
                ) : (
                  <a
                    href={plan.link || "https://cal.com/menova/initial-consultation"}
                    target={plan.link ? undefined : "_blank"}
                    rel={plan.link ? undefined : "noopener noreferrer"}
                    className={plan.highlight ? "btn-terracotta w-full text-center block" : "btn-outline-forest w-full text-center block"}
                  >
                    {plan.cta}
                  </a>
                )}
              </div>
            </FadeUp>
          ))}
        </div>

        <p
          className="text-center text-xs mt-8"
          style={{ fontFamily: "'DM Sans', sans-serif", color: "oklch(0.55 0.005 65)" }}
        >
          Prescriptions are issued only after an online consultation with a licensed BC Nurse Practitioner. Compound medications are dispensed by Health Canada–regulated pharmacies.
        </p>
      </div>
    </section>
  );
}

// ─── Providers Section ────────────────────────────────────────────────────────
function ProvidersSection() {
  const providers = [
    {
      name: "Dr. Sarah Chen, NP",
      credential: "BC College of Nursing Professionals",
      specialty: "Menopause & Hormonal Health",
      img: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face",
    },
    {
      name: "Dr. Priya Sharma, MD",
      credential: "University of British Columbia",
      specialty: "Women's Endocrinology",
      img: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop&crop=face",
    },
    {
      name: "Dr. Lisa Tremblay, NP",
      credential: "NAMS Certified Menopause Practitioner",
      specialty: "Bioidentical Hormone Replacement Therapy (BHRT) & Integrative Medicine",
      img: "https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?w=400&h=400&fit=crop&crop=face",
    },
  ];

  return (
    <section
      id="providers"
      className="py-20 lg:py-28"
      style={{ backgroundColor: "oklch(0.97 0.015 90)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeUp className="text-center mb-16">
          <span className="badge-forest mb-4">Our Clinical Team</span>
          <h2
            className="text-4xl lg:text-5xl font-bold mb-4"
            style={{ fontFamily: "'Playfair Display', serif", color: "oklch(0.22 0.005 65)" }}
          >
            Medical care from{" "}
            <em className="not-italic" style={{ color: "oklch(0.24 0.07 155)" }}>
              leading experts
            </em>
          </h2>
          <p
            className="text-base max-w-xl mx-auto"
            style={{ fontFamily: "'DM Sans', sans-serif", color: "oklch(0.45 0.005 65)" }}
          >
            Our BC-licensed Nurse Practitioners specialize in menopause care and bring both expertise and genuine compassion to every appointment.
          </p>
        </FadeUp>

        <div className="grid sm:grid-cols-3 gap-8">
          {providers.map((p, i) => (
            <FadeUp key={p.name} delay={i * 100}>
              <div
                className="card-hover bg-white rounded-2xl overflow-hidden shadow-sm border"
                style={{ borderColor: "oklch(0.88 0.01 90)" }}
              >
                <div className="h-56 overflow-hidden">
                  <img src={p.img} alt={p.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-6">
                  <h3
                    className="text-lg font-bold mb-1"
                    style={{ fontFamily: "'Playfair Display', serif", color: "oklch(0.22 0.005 65)" }}
                  >
                    {p.name}
                  </h3>
                  <p
                    className="text-xs mb-3"
                    style={{ fontFamily: "'DM Sans', sans-serif", color: "oklch(0.50 0.005 65)" }}
                  >
                    {p.credential}
                  </p>
                  <span
                    className="inline-block text-xs px-3 py-1 rounded-full"
                    style={{
                      backgroundColor: "oklch(0.24 0.07 155 / 0.08)",
                      color: "oklch(0.24 0.07 155)",
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: 600,
                    }}
                  >
                    {p.specialty}
                  </span>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Testimonials ─────────────────────────────────────────────────────────────
function TestimonialsSection() {
  const testimonials = [
    {
      name: "Sandra M.",
      location: "Vancouver, BC",
      text: "I waited 7 months for a specialist referral before finding MeNova. Within 2 weeks I had a diagnosis, a prescription, and my hot flashes were under control. Life-changing.",
      stars: 5,
    },
    {
      name: "Jennifer K.",
      location: "North Vancouver, BC",
      text: "The NP was incredibly knowledgeable and actually listened to me. She explained everything clearly and I felt supported throughout. I finally feel like myself again.",
      stars: 5,
    },
    {
      name: "Diane L.",
      location: "Burnaby, BC",
      text: "The brain fog was so bad I thought I was losing my mind. Three months into my Bioidentical Hormone Replacement Therapy (BHRT) plan and I'm sharp, sleeping well, and back to running. I can't recommend this enough.",
      stars: 5,
    },
    {
      name: "Tracey W.",
      location: "Richmond, BC",
      text: "Affordable, fast, and genuinely caring. The 24/7 messaging means I never feel alone in this journey. My family has noticed the difference too.",
      stars: 5,
    },
    {
      name: "Michelle R.",
      location: "West Vancouver, BC",
      text: "I was skeptical about virtual care but the process was seamless. The medication arrived within days and the follow-up support is exceptional.",
      stars: 5,
    },
    {
      name: "Patricia H.",
      location: "Surrey, BC",
      text: "After years of being dismissed by my GP, MeNova's NP took my symptoms seriously immediately. I'm now on a plan that actually works. Thank you.",
      stars: 5,
    },
  ];

  return (
    <section
      className="py-20 lg:py-28"
      style={{ backgroundColor: "oklch(0.24 0.07 155)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeUp className="text-center mb-16">
          <span
            className="inline-block text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded-full mb-4"
            style={{
              backgroundColor: "rgba(255,255,255,0.10)",
              color: "rgba(255,255,255,0.75)",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Patient Stories
          </span>
          <h2
            className="text-4xl lg:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            There's a reason women are{" "}
            <em className="not-italic" style={{ color: "oklch(0.75 0.10 42)" }}>
              raving about us
            </em>
          </h2>
          <p
            className="text-base max-w-xl mx-auto"
            style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(255,255,255,0.60)" }}
          >
            Join thousands of Canadian women who have reclaimed their vitality with MeNova Health.
          </p>
        </FadeUp>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <FadeUp key={t.name} delay={i * 60}>
              <div
                className="rounded-2xl p-6 h-full flex flex-col"
                style={{
                  backgroundColor: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.10)",
                }}
              >
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-current" style={{ color: "oklch(0.75 0.10 42)" }} />
                  ))}
                </div>
                <p
                  className="text-sm leading-relaxed mb-4 flex-1"
                  style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(255,255,255,0.82)" }}
                >
                  "{t.text}"
                </p>
                <div>
                  <p
                    className="text-sm font-semibold text-white"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    {t.name}
                  </p>
                  <p
                    className="text-xs"
                    style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(255,255,255,0.45)" }}
                  >
                    {t.location}
                  </p>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── FAQ Section ──────────────────────────────────────────────────────────────
function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

    const faqs = [
    {
      q: "Do I need a referral to see a menopause specialist in BC?",
      a: "No referral is needed. MeNova Health is a direct-access telehealth clinic. You can book a virtual consultation with a BC-licensed Nurse Practitioner this week — most patients are seen within 3–5 business days, compared to the 6–12 month wait for a specialist referral through the public system.",
    },
    {
      q: "Is MeNova Health available across British Columbia?",
      a: "Yes. MeNova Health serves patients throughout BC, including Vancouver, Surrey, Burnaby, Richmond, North Vancouver, West Vancouver, Coquitlam, Kelowna, Victoria, Kamloops, and all surrounding areas. All appointments are conducted via secure video call.",
    },
    {
      q: "Is BHRT covered by BC PharmaCare or private insurance?",
      a: "As of March 2026, BC PharmaCare covers standard menopausal hormone therapy (MHT) for eligible BC residents. Most private insurance plans (Sun Life, Manulife, Great-West Life) also cover the medication portion of your care. Our care team will help you navigate your benefits during your consultation.",
    },
    {
      q: "What is Bioidentical Hormone Replacement Therapy (BHRT) and is it safe?",
      a: "Bioidentical Hormone Replacement Therapy (BHRT) uses plant-derived hormones that are molecularly identical to those your body produces. Unlike synthetic HRT, BHRT is custom-compounded to your specific hormone levels. It is prescribed following current NAMS and SOGC guidelines and is considered safe and effective for the majority of perimenopausal and menopausal women.",
    },
    {
      q: "How quickly can I get a menopause prescription in BC?",
      a: "Most MeNova patients receive their personalized BHRT prescription within 5–7 days of their initial consultation. Compounded medications are dispensed by our BC partner pharmacy and shipped discreetly to your door, typically within 3–5 business days of the prescription.",
    },
    {
      q: "What menopause symptoms does MeNova Health treat?",
      a: "MeNova treats the full spectrum of perimenopause and menopause symptoms: hot flashes, night sweats, brain fog, sleep disturbances, mood changes, anxiety, weight gain, low libido, vaginal dryness, fatigue, hair thinning, and bone health concerns. All treatment plans are personalized by a BC-licensed Nurse Practitioner.",
    },
    {
      q: "How long before I feel results from BHRT?",
      a: "Most patients notice improvements in sleep and mood within 2–4 weeks. Hot flashes and energy levels typically improve within 4–8 weeks. Your NP will monitor your progress and adjust your plan as needed.",
    },
    {
      q: "Who prescribes my medication?",
      a: "All prescriptions are issued by licensed BC Nurse Practitioners registered with the BC College of Nursing Professionals. Medications are dispensed by our partner Health Canada–regulated compounding pharmacy in British Columbia.",
    },
    {
      q: "What happens at my first appointment?",
      a: "Your first 60-minute video consult covers your full symptom history, current health, medications, and goals. Your NP will review your quiz results and recommend a personalized treatment plan (HRT, lifestyle, supplements). Lab work may be requested if needed. The initial consultation costs $199 CAD. Follow-up visits (30 min) are $119 CAD.",
    },
  ];

  return (
    <section id="faq" className="py-20 lg:py-28" style={{ backgroundColor: "white" }} aria-label="Frequently Asked Questions about Menopause and BHRT in BC">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeUp className="text-center mb-16">
          <span className="badge-forest mb-4">Common Questions</span>
          <h2
            className="text-4xl lg:text-5xl font-bold mb-4"
            style={{ fontFamily: "'Playfair Display', serif", color: "oklch(0.22 0.005 65)" }}
          >
            Frequently asked{" "}
            <em className="not-italic" style={{ color: "oklch(0.24 0.07 155)" }}>
              questions
            </em>
          </h2>
        </FadeUp>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <FadeUp key={i} delay={i * 40}>
              <div
                className="rounded-xl border overflow-hidden"
                style={{ borderColor: "oklch(0.88 0.01 90)" }}
              >
                <button
                  className="w-full flex items-center justify-between p-5 text-left transition-colors"
                  style={{ backgroundColor: openIdx === i ? "oklch(0.24 0.07 155 / 0.04)" : "white" }}
                  onClick={() => setOpenIdx(openIdx === i ? null : i)}
                >
                  <span
                    className="text-base font-semibold pr-4"
                    style={{ fontFamily: "'DM Sans', sans-serif", color: "oklch(0.22 0.005 65)" }}
                  >
                    {faq.q}
                  </span>
                  <ChevronDown
                    className="w-5 h-5 flex-shrink-0 transition-transform duration-200"
                    style={{
                      color: "oklch(0.24 0.07 155)",
                      transform: openIdx === i ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                  />
                </button>
                {openIdx === i && (
                  <div className="px-5 pb-5">
                    <p
                      className="text-sm leading-relaxed"
                      style={{ fontFamily: "'DM Sans', sans-serif", color: "oklch(0.45 0.005 65)" }}
                    >
                      {faq.a}
                    </p>
                  </div>
                )}
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Final CTA ────────────────────────────────────────────────────────────────
function FinalCTA({ onOpenQuiz }: { onOpenQuiz: () => void }) {
  return (
    <section
      className="py-20 lg:py-28 relative overflow-hidden"
      style={{ backgroundColor: "oklch(0.97 0.015 90)" }}
    >
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url(${WOMAN_OUTDOOR})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <FadeUp>
          <span className="badge-forest mb-6">Get Started Today</span>
          <h2
            className="text-4xl lg:text-5xl font-bold mb-6 leading-tight"
            style={{ fontFamily: "'Playfair Display', serif", color: "oklch(0.22 0.005 65)" }}
          >
            Your energy, clarity, and{" "}
            <em className="not-italic" style={{ color: "oklch(0.24 0.07 155)" }}>
              confidence
            </em>{" "}
            are waiting
          </h2>
          <p
            className="text-base lg:text-lg mb-10"
            style={{ fontFamily: "'DM Sans', sans-serif", color: "oklch(0.45 0.005 65)" }}
          >
            Canada's menopause gap is real — but it doesn't have to be your reality. Book your first appointment this week and start feeling like yourself again.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={onOpenQuiz} className="btn-forest text-center">
              Take the Free Symptom Quiz
            </button>
            <a
              href="https://cal.com/menova/initial-consultation"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline-forest text-center"
            >
              Book a Consult — $199 CAD
            </a>
          </div>
          <p
            className="mt-6 text-xs"
            style={{ fontFamily: "'DM Sans', sans-serif", color: "oklch(0.55 0.005 65)" }}
          >
            No referral needed · BC-licensed providers · Cancel anytime
          </p>
        </FadeUp>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  const links: Record<string, { label: string; href: string }[]> = {
    "On This Page": [
      { label: "How It Works", href: "#how-it-works" },
      { label: "Treatments", href: "#treatments" },
      { label: "Pricing", href: "#pricing" },
      { label: "FAQ", href: "#faq" },
      { label: "Symptom Quiz", href: "#quiz" },
    ],
    Legal: [
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms of Service", href: "/terms-and-conditions" },
      { label: "Cookie Policy", href: "/cookie-policy" },
      { label: "Accessibility", href: "/accessibility" },
    ],
    Support: [
      { label: "Contact Us", href: "#" },
     // { label: "Patient Portal", href: "#" },
    ],
  };

  return (
    <footer style={{ backgroundColor: "oklch(0.18 0.07 155)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/10">
                <Leaf className="w-4 h-4 text-white" />
              </div>
              <span
                className="text-xl font-bold text-white"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                MeNova
              </span>
            </div>
            <p
              className="text-sm leading-relaxed mb-4"
              style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(255,255,255,0.50)" }}
            >
              Menopause telehealth care for Canadian women. Licensed NPs, personalized Bioidentical Hormone Replacement Therapy (BHRT), delivered to your door.
            </p>
            <p
              className="text-xs"
              style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(255,255,255,0.30)" }}
            >
              Serving Vancouver, BC & across British Columbia
            </p>
          </div>

          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h4
                className="text-xs font-semibold tracking-widest uppercase mb-4"
                style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(255,255,255,0.45)" }}
              >
                {category}
              </h4>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      className="text-sm transition-colors hover:text-white"
                      style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(255,255,255,0.60)" }}
                      onClick={item.href === "#" ? (e) => {
                        e.preventDefault();
                        toast.info(`${item.label} — Feature coming soon`);
                      } : undefined}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          className="border-t pt-8 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderColor: "rgba(255,255,255,0.08)" }}
        >
          <p
            className="text-xs text-center sm:text-left"
            style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(255,255,255,0.30)" }}
          >
            © 2026 MeNova Health MSO Inc. All rights reserved. MeNova Health is a Management Services Organization. Medical care is provided by independently contracted licensed Nurse Practitioners registered with the BC College of Nursing Professionals.
          </p>
          <div className="flex gap-4 flex-shrink-0">
            {["Instagram", "Facebook", "LinkedIn"].map((s) => (
              <a
                key={s}
                href="#"
                className="text-xs transition-colors hover:text-white"
                style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(255,255,255,0.40)" }}
                onClick={(e) => {
                  e.preventDefault();
                  toast.info(`${s} — Coming soon`);
                }}
              >
                {s}
              </a>
            ))}
          </div>
        </div>

        {/* SEO keyword paragraph — visible to crawlers, styled subtly */}
        <p
          className="text-xs mt-8 leading-relaxed max-w-4xl mx-auto text-center"
          style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(255,255,255,0.18)" }}
        >
          MeNova Health provides virtual menopause care and Bioidentical Hormone Replacement Therapy (BHRT) to women across British Columbia, including Vancouver, Surrey, Burnaby, Richmond, North Vancouver, Coquitlam, Kelowna, Victoria, and Kamloops. Our BC-licensed Nurse Practitioners treat hot flashes, night sweats, brain fog, sleep disturbances, mood changes, weight gain, low libido, and vaginal dryness. No referral required. Book a menopause consultation online today.
        </p>
      </div>
    </footer>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Home() {
  const [quizOpen, setQuizOpen] = useState(false);
  const openQuiz = () => setQuizOpen(true);
  const closeQuiz = () => setQuizOpen(false);

  return (
    <div className="min-h-screen">
      <Navbar onOpenQuiz={openQuiz} />
      <main id="main-content">
      <HeroSection onOpenQuiz={openQuiz} />
      <CategoryScroll />
      <TrustBar />
      <WhatIsBHRTSection />
      <BHRTSection />
      <HowItWorksSection />
      <PricingSection onOpenQuiz={openQuiz} />
      <QuizSection onOpenQuiz={openQuiz} />
      <WholeCareSection />
      <TestimonialsSection />
      <FAQSection />
      <FinalCTA onOpenQuiz={openQuiz} />
      <WaitlistSection />
      </main>
      <Footer />


      {/* Global quiz modal */}
      <AnimatePresence>
        {quizOpen && <SymptomQuiz onClose={closeQuiz} />}
      </AnimatePresence>
    </div>
  );
}

import { useEffect } from "react";
import { ChevronLeft } from "lucide-react";
import { Link } from "wouter";

export default function Accessibility() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "white" }}>
      {/* Header */}
      <header
        className="py-6 border-b"
        style={{
          backgroundColor: "white",
          borderColor: "oklch(0.92 0.004 286.32)",
        }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-4">
          <Link href="/">
            <button
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
              style={{ color: "oklch(0.24 0.07 155)" }}
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>
          </Link>
          <h1
            className="text-3xl font-bold"
            style={{ fontFamily: "'Playfair Display', serif", color: "oklch(0.22 0.005 65)" }}
          >
            Accessibility Statement
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-12 lg:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <p
            className="text-sm mb-8"
            style={{ fontFamily: "'DM Sans', sans-serif", color: "oklch(0.50 0.005 65)" }}
          >
            Last updated: April 12, 2026
          </p>

          <div
            className="prose prose-lg max-w-none"
            style={{ fontFamily: "'DM Sans', sans-serif", color: "oklch(0.35 0.005 65)" }}
          >
            <section className="mb-8">
              <h2
                className="text-2xl font-bold mb-4"
                style={{ fontFamily: "'Playfair Display', serif", color: "oklch(0.22 0.005 65)" }}
              >
                Commitment to Accessibility
              </h2>
              <p className="mb-4">
                Menova Health is committed to making its website and services accessible to as many people as possible. The goal
                is to provide a website that is usable, understandable, and compatible with assistive technologies.
              </p>
              <p className="mb-4">
                The website aims to follow recognized accessibility best practices so that people can navigate it using a
                keyboard, screen reader, voice tools, magnification software, and other assistive technologies. British
                Columbia's Accessible B.C. Act is intended to identify, remove, and prevent barriers to participation, which
                supports the importance of ongoing accessibility work.
              </p>
            </section>

            <section className="mb-8">
              <h2
                className="text-2xl font-bold mb-4"
                style={{ fontFamily: "'Playfair Display', serif", color: "oklch(0.22 0.005 65)" }}
              >
                Accessibility Features
              </h2>
              <p className="mb-4">The website aims to include:</p>
              <ul className="list-disc list-inside space-y-2 mb-4">
                <li>Clear headings and page structure</li>
                <li>Sufficient color contrast</li>
                <li>Keyboard-friendly navigation</li>
                <li>Descriptive link text and form labels</li>
                <li>Responsive layouts across devices</li>
                <li>Alternative text for meaningful images where appropriate</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2
                className="text-2xl font-bold mb-4"
                style={{ fontFamily: "'Playfair Display', serif", color: "oklch(0.22 0.005 65)" }}
              >
                Ongoing Improvement
              </h2>
              <p className="mb-4">
                Accessibility is treated as an ongoing process. Website content and features may be reviewed regularly, and
                improvements may be made over time as standards, tools, and user needs evolve.
              </p>
            </section>

            <section className="mb-8">
              <h2
                className="text-2xl font-bold mb-4"
                style={{ fontFamily: "'Playfair Display', serif", color: "oklch(0.22 0.005 65)" }}
              >
                Known Limitations
              </h2>
              <p className="mb-4">
                Some parts of the website or some third-party tools may not yet be fully accessible. Efforts may be made to
                identify and address barriers where feasible.
              </p>
            </section>

            <section className="mb-8">
              <h2
                className="text-2xl font-bold mb-4"
                style={{ fontFamily: "'Playfair Display', serif", color: "oklch(0.22 0.005 65)" }}
              >
                Feedback
              </h2>
              <p>
                Anyone who encounters an accessibility barrier or needs information in an alternative format may contact Menova
                Health at{" "}
                <a
                  href="mailto:support.menova@gmail.com"
                  style={{ color: "oklch(0.24 0.07 155)", textDecoration: "underline" }}
                >
                  support.menova@gmail.com
                </a>
                .
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

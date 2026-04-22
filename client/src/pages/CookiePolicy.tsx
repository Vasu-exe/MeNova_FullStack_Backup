import { useEffect } from "react";
import { ChevronLeft } from "lucide-react";
import { Link } from "wouter";

export default function CookiePolicy() {
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
            Cookie Policy
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
                What Cookies Are
              </h2>
              <p className="mb-4">
                This Cookie Policy explains how Menova Health uses cookies and similar technologies on its website. Cookies are
                small text files stored on a user's device when visiting a website. They help websites function properly and can
                also help site owners understand how visitors use the site.
              </p>
            </section>

            <section className="mb-8">
              <h2
                className="text-2xl font-bold mb-4"
                style={{ fontFamily: "'Playfair Display', serif", color: "oklch(0.22 0.005 65)" }}
              >
                Types of Cookies Used
              </h2>
              <p className="mb-4">The website may use:</p>
              <ul className="list-disc list-inside space-y-2 mb-4">
                <li>Strictly necessary cookies to support core website functions</li>
                <li>Preference cookies to remember settings and selections</li>
                <li>Analytics cookies to understand traffic and usage patterns</li>
                <li>Functionality cookies to support tools such as forms, booking flows, or embedded services</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2
                className="text-2xl font-bold mb-4"
                style={{ fontFamily: "'Playfair Display', serif", color: "oklch(0.22 0.005 65)" }}
              >
                How Cookies Are Used
              </h2>
              <p className="mb-4">Cookies may be used to:</p>
              <ul className="list-disc list-inside space-y-2 mb-4">
                <li>Keep the website operating properly</li>
                <li>Improve performance and user experience</li>
                <li>Analyze website traffic and usage trends</li>
                <li>Remember user preferences</li>
                <li>Support embedded services and integrations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2
                className="text-2xl font-bold mb-4"
                style={{ fontFamily: "'Playfair Display', serif", color: "oklch(0.22 0.005 65)" }}
              >
                Third-Party Cookies
              </h2>
              <p className="mb-4">
                Some cookies may be placed by third-party services used on the website, such as analytics providers, form tools,
                payment systems, or patient portal integrations. Those third parties may collect information according to their
                own policies.
              </p>
            </section>

            <section className="mb-8">
              <h2
                className="text-2xl font-bold mb-4"
                style={{ fontFamily: "'Playfair Display', serif", color: "oklch(0.22 0.005 65)" }}
              >
                Managing Cookies
              </h2>
              <p className="mb-4">
                Users can manage or delete cookies through browser settings and, where available, through any cookie consent or
                preference tools on the website. Disabling certain cookies may affect website functionality.
              </p>
            </section>

            <section className="mb-8">
              <h2
                className="text-2xl font-bold mb-4"
                style={{ fontFamily: "'Playfair Display', serif", color: "oklch(0.22 0.005 65)" }}
              >
                Changes to This Policy
              </h2>
              <p className="mb-4">
                This Cookie Policy may be updated from time to time. Any updates will be posted on this page with a revised
                effective date.
              </p>
            </section>

            <section className="mb-8">
              <h2
                className="text-2xl font-bold mb-4"
                style={{ fontFamily: "'Playfair Display', serif", color: "oklch(0.22 0.005 65)" }}
              >
                Contact
              </h2>
              <p>
                Questions about this Cookie Policy may be sent to{" "}
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

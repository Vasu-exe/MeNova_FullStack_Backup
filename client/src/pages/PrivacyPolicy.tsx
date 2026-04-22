import { useEffect } from "react";
import { ChevronLeft } from "lucide-react";
import { Link } from "wouter";

export default function PrivacyPolicy() {
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
            Privacy Policy
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
                Information Collected
              </h2>
              <p className="mb-4">
                Menova Health ("we," "us," or "our") respects your privacy and is committed to protecting your personal
                information. This Privacy Policy explains how personal information may be collected, used, disclosed, and
                safeguarded when visitors use the website, contact the clinic, book services, or otherwise interact with
                Menova Health.
              </p>
              <p className="mb-4">
                Personal information may include details provided directly by a user, such as name, email address, phone
                number, date of birth, billing details, health-related information, and any other information submitted
                through forms, appointment requests, or messages. Technical information may also be collected automatically,
                including browser type, device type, IP address, referring pages, and general website usage data.
              </p>
            </section>

            <section className="mb-8">
              <h2
                className="text-2xl font-bold mb-4"
                style={{ fontFamily: "'Playfair Display', serif", color: "oklch(0.22 0.005 65)" }}
              >
                How Information Is Used
              </h2>
              <p className="mb-4">Personal information may be used to:</p>
              <ul className="list-disc list-inside space-y-2 mb-4">
                <li>Provide healthcare-related services and respond to inquiries</li>
                <li>Schedule appointments and manage communications</li>
                <li>Process payments and send confirmations or receipts</li>
                <li>Improve the website, operations, and user experience</li>
                <li>Meet legal, regulatory, and professional obligations</li>
                <li>Send administrative or service-related emails</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2
                className="text-2xl font-bold mb-4"
                style={{ fontFamily: "'Playfair Display', serif", color: "oklch(0.22 0.005 65)" }}
              >
                Consent
              </h2>
              <p className="mb-4">
                Personal information is collected, used, and disclosed with consent, except where otherwise permitted or
                required by law. By submitting information through the website or engaging services, users consent to the
                collection and use of information for the purposes described in this Policy. Consent may be withdrawn where
                permitted by law, subject to legal or contractual restrictions.
              </p>
            </section>

            <section className="mb-8">
              <h2
                className="text-2xl font-bold mb-4"
                style={{ fontFamily: "'Playfair Display', serif", color: "oklch(0.22 0.005 65)" }}
              >
                Sharing Information
              </h2>
              <p className="mb-4">
                Menova Health does not sell personal information. Information may be shared with trusted service providers
                that support operations, such as website hosting, payment processing, email delivery, analytics, and practice
                management platforms. These providers are only permitted to use information as needed to provide services on
                behalf of Menova Health. Information may also be disclosed where required by law, court order, or regulatory
                obligation.
              </p>
            </section>

            <section className="mb-8">
              <h2
                className="text-2xl font-bold mb-4"
                style={{ fontFamily: "'Playfair Display', serif", color: "oklch(0.22 0.005 65)" }}
              >
                Healthcare Information
              </h2>
              <p className="mb-4">
                Health-related information is treated with additional care because of its sensitive nature. Access is limited
                to authorized personnel, and reasonable administrative, technical, and physical safeguards are used to help
                protect against unauthorized access, use, disclosure, loss, or misuse.
              </p>
            </section>

            <section className="mb-8">
              <h2
                className="text-2xl font-bold mb-4"
                style={{ fontFamily: "'Playfair Display', serif", color: "oklch(0.22 0.005 65)" }}
              >
                Data Retention
              </h2>
              <p className="mb-4">
                Personal information is retained only for as long as necessary to fulfill the purposes for which it was
                collected, comply with legal obligations, resolve disputes, and enforce applicable agreements.
              </p>
            </section>

            <section className="mb-8">
              <h2
                className="text-2xl font-bold mb-4"
                style={{ fontFamily: "'Playfair Display', serif", color: "oklch(0.22 0.005 65)" }}
              >
                Security
              </h2>
              <p className="mb-4">
                Reasonable safeguards are used that are appropriate to the sensitivity of the information. However, no method
                of transmission over the internet or electronic storage can be guaranteed to be completely secure.
              </p>
            </section>

            <section className="mb-8">
              <h2
                className="text-2xl font-bold mb-4"
                style={{ fontFamily: "'Playfair Display', serif", color: "oklch(0.22 0.005 65)" }}
              >
                Your Rights
              </h2>
              <p className="mb-4">
                Depending on applicable law, individuals may have rights to request access to personal information, ask for
                corrections, or inquire about how their information is handled. Requests may be submitted by email.
              </p>
            </section>

            <section className="mb-8">
              <h2
                className="text-2xl font-bold mb-4"
                style={{ fontFamily: "'Playfair Display', serif", color: "oklch(0.22 0.005 65)" }}
              >
                Cookies and Analytics
              </h2>
              <p className="mb-4">
                The website may use cookies and similar technologies to support core functionality, remember preferences, and
                understand website usage. Users can manage cookies through browser controls and any consent tools made
                available on the website.
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
                Questions about this Privacy Policy or personal information practices may be sent to{" "}
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

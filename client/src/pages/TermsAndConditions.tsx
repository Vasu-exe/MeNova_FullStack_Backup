import { useEffect } from "react";
import { ChevronLeft } from "lucide-react";
import { Link } from "wouter";

export default function TermsAndConditions() {
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
            Terms and Conditions
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
                Terms of Service
              </h2>
              <p className="mb-4">
                These Terms of Service ("Terms") govern use of the Menova Health website and related online services. By
                accessing or using the website, users agree to these Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2
                className="text-2xl font-bold mb-4"
                style={{ fontFamily: "'Playfair Display', serif", color: "oklch(0.22 0.005 65)" }}
              >
                Use of the Website
              </h2>
              <p className="mb-4">
                The website may only be used for lawful purposes and in a way that does not violate the rights of others,
                interfere with the website's operation, or attempt unauthorized access to systems or data.
              </p>
            </section>

            <section className="mb-8">
              <h2
                className="text-2xl font-bold mb-4"
                style={{ fontFamily: "'Playfair Display', serif", color: "oklch(0.22 0.005 65)" }}
              >
                No Emergency Use
              </h2>
              <p className="mb-4">
                This website is not intended for medical emergencies. Anyone experiencing a medical emergency should call 911
                or go to the nearest emergency department immediately.
              </p>
            </section>

            <section className="mb-8">
              <h2
                className="text-2xl font-bold mb-4"
                style={{ fontFamily: "'Playfair Display', serif", color: "oklch(0.22 0.005 65)" }}
              >
                Medical Disclaimer
              </h2>
              <p className="mb-4">
                Content on the website is provided for general informational purposes only and is not medical advice, diagnosis,
                or treatment. Use of the website alone does not create a provider-patient relationship unless that relationship
                is separately established through the clinic's intake or care process.
              </p>
            </section>

            <section className="mb-8">
              <h2
                className="text-2xl font-bold mb-4"
                style={{ fontFamily: "'Playfair Display', serif", color: "oklch(0.22 0.005 65)" }}
              >
                Appointments and Payments
              </h2>
              <p className="mb-4">
                If services are booked through the website, accurate and complete information must be provided. Fees,
                cancellation terms, refund rules, and payment requirements may be presented at the time of booking or in a
                separate agreement. Menova Health reserves the right to refuse or cancel bookings where appropriate.
              </p>
            </section>

            <section className="mb-8">
              <h2
                className="text-2xl font-bold mb-4"
                style={{ fontFamily: "'Playfair Display', serif", color: "oklch(0.22 0.005 65)" }}
              >
                User Submissions
              </h2>
              <p className="mb-4">
                Anyone submitting forms, messages, reviews, or other content is responsible for the accuracy of that
                information and for ensuring they have the right to provide it. Submitted content may be used to respond to
                requests and operate services, subject to the Privacy Policy.
              </p>
            </section>

            <section className="mb-8">
              <h2
                className="text-2xl font-bold mb-4"
                style={{ fontFamily: "'Playfair Display', serif", color: "oklch(0.22 0.005 65)" }}
              >
                Intellectual Property
              </h2>
              <p className="mb-4">
                All content on the website, including text, graphics, branding, logos, and design elements, is owned by Menova
                Health or its licensors and is protected by applicable intellectual property laws. No content may be copied,
                reproduced, distributed, or adapted without prior written permission, except as allowed by law for personal,
                non-commercial use.
              </p>
            </section>

            <section className="mb-8">
              <h2
                className="text-2xl font-bold mb-4"
                style={{ fontFamily: "'Playfair Display', serif", color: "oklch(0.22 0.005 65)" }}
              >
                Third-Party Services
              </h2>
              <p className="mb-4">
                The website may contain links to third-party tools or platforms, including payment providers, scheduling
                services, or patient portals. Menova Health is not responsible for the content, privacy practices, or operations
                of third-party services.
              </p>
            </section>

            <section className="mb-8">
              <h2
                className="text-2xl font-bold mb-4"
                style={{ fontFamily: "'Playfair Display', serif", color: "oklch(0.22 0.005 65)" }}
              >
                Limitation of Liability
              </h2>
              <p className="mb-4">
                To the fullest extent permitted by law, Menova Health is not liable for indirect, incidental, consequential,
                special, or punitive damages arising from use of the website. Use of the website is at the user's own risk.
              </p>
            </section>

            <section className="mb-8">
              <h2
                className="text-2xl font-bold mb-4"
                style={{ fontFamily: "'Playfair Display', serif", color: "oklch(0.22 0.005 65)" }}
              >
                Changes to the Website and Terms
              </h2>
              <p className="mb-4">
                Any part of the website may be updated, suspended, or discontinued at any time. These Terms may also be revised
                from time to time, and continued use of the website after changes are posted means acceptance of the revised
                Terms.
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
                Questions about these Terms may be sent to{" "}
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

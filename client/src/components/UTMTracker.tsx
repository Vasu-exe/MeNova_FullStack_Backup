import { useEffect } from "react";

/**
 * UTMTracker — captures UTM parameters and referral source from the URL
 * on first page load and stores them in sessionStorage for later use
 * when submitting quiz data or other forms.
 */
export default function UTMTracker() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const utmSource = params.get("utm_source");
    const utmMedium = params.get("utm_medium");
    const utmCampaign = params.get("utm_campaign");
    const utmTerm = params.get("utm_term");
    const utmContent = params.get("utm_content");
    const ref = params.get("ref") || params.get("referral");

    // Only overwrite if we have new UTM data (don't clear existing session data)
    if (utmSource) sessionStorage.setItem("menova_utm_source", utmSource);
    if (utmMedium) sessionStorage.setItem("menova_utm_medium", utmMedium);
    if (utmCampaign) sessionStorage.setItem("menova_utm_campaign", utmCampaign);
    if (utmTerm) sessionStorage.setItem("menova_utm_term", utmTerm);
    if (utmContent) sessionStorage.setItem("menova_utm_content", utmContent);
    if (ref) sessionStorage.setItem("menova_source", ref);

    // Also capture the referrer if it's from an external domain
    if (document.referrer) {
      try {
        const referrerHost = new URL(document.referrer).hostname;
        const currentHost = window.location.hostname;
        if (referrerHost !== currentHost && !sessionStorage.getItem("menova_source")) {
          sessionStorage.setItem("menova_source", referrerHost);
        }
      } catch {
        // Invalid referrer URL, ignore
      }
    }

    // Track page visit for analytics
    try {
      fetch("/api/analytics/pageview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page: window.location.pathname,
          referrer: document.referrer || "",
          utmSource: utmSource || "",
          utmMedium: utmMedium || "",
          utmCampaign: utmCampaign || "",
          timestamp: new Date().toISOString(),
        }),
      }).catch(() => {
        // Silently fail — analytics should never block the user
      });
    } catch {
      // Ignore
    }
  }, []);

  return null; // This component renders nothing
}

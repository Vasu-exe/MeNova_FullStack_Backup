import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import {
  ChevronLeft,
  BarChart3,
  Users,
  ClipboardList,
  Bell,
  Download,
  LogOut,
  RefreshCw,
  Search,
  Leaf,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
interface Stats {
  totalQuizSubmissions: number;
  totalFollowUpRequests: number;
  totalWaitlist: number;
  quizThisWeek: number;
  followUpQualified: number;
  followUpPending: number;
  averageQuizScore: number;
  tierBreakdown: {
    earlyStage: number;
    moderate: number;
    significant: number;
  };
  utmSources: Record<string, number>;
}

interface QuizSubmission {
  id: string;
  name: string;
  email: string;
  score: number;
  maxScore: number;
  tier: string;
  recommendation: string;
  source: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  createdAt: string;
}

interface FollowUpRequest {
  id: string;
  sessionId: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  resultMessage: string;
  createdAt: string;
  updatedAt: string;
}

interface WaitlistEntry {
  id: string;
  name: string;
  email: string;
  interest: string;
  createdAt: string;
}

type Tab = "overview" | "quiz" | "followup" | "waitlist";

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [token, setToken] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [stats, setStats] = useState<Stats | null>(null);
  const [quizData, setQuizData] = useState<QuizSubmission[]>([]);
  const [followupData, setFollowupData] = useState<FollowUpRequest[]>([]);
  const [waitlistData, setWaitlistData] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const authHeaders = { Authorization: `Bearer ${token}` };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.success) {
        setToken(data.token);
        setIsLoggedIn(true);
        sessionStorage.setItem("menova_admin_token", data.token);
      } else {
        setLoginError("Invalid password");
      }
    } catch {
      setLoginError("Connection error. Please try again.");
    }
  };

  // Check for existing session
  useEffect(() => {
    const savedToken = sessionStorage.getItem("menova_admin_token");
    if (savedToken) {
      setToken(savedToken);
      setIsLoggedIn(true);
    }
  }, []);

  // Fetch data when logged in
  useEffect(() => {
    if (!isLoggedIn) return;
    fetchAllData();
  }, [isLoggedIn]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [statsRes, quizRes, followupRes, waitlistRes] = await Promise.all([
        fetch("/api/admin/stats", { headers: authHeaders }),
        fetch("/api/admin/quiz-submissions", { headers: authHeaders }),
        fetch("/api/admin/followup-requests", { headers: authHeaders }),
        fetch("/api/admin/waitlist", { headers: authHeaders }),
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (quizRes.ok) setQuizData(await quizRes.json());
      if (followupRes.ok) setFollowupData(await followupRes.json());
      if (waitlistRes.ok) setWaitlistData(await waitlistRes.json());
    } catch (err) {
      console.error("Failed to fetch admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (type: string) => {
    window.open(`/api/admin/export/${type}?token=${token}`, "_blank");
  };

  const handleLogout = () => {
    sessionStorage.removeItem("menova_admin_token");
    setIsLoggedIn(false);
    setToken("");
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-CA", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ─── Login Screen ──────────────────────────────────────────────────────────
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "oklch(0.97 0.015 90)" }}>
        <div
          className="w-full max-w-md rounded-3xl p-10 shadow-lg"
          style={{ backgroundColor: "white", border: "2px solid oklch(0.88 0.01 90)" }}
        >
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Leaf className="w-6 h-6" style={{ color: "oklch(0.24 0.07 155)" }} />
              <span
                className="text-2xl font-bold"
                style={{ fontFamily: "'Playfair Display', serif", color: "oklch(0.22 0.005 65)" }}
              >
                MeNova Admin
              </span>
            </div>
            <p className="text-sm" style={{ fontFamily: "'DM Sans', sans-serif", color: "oklch(0.50 0.005 65)" }}>
              Enter your admin password to access the dashboard.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                htmlFor="admin-password"
                className="block text-sm font-semibold mb-1.5"
                style={{ fontFamily: "'DM Sans', sans-serif", color: "oklch(0.22 0.005 65)" }}
              >
                Password
              </label>
              <input
                type="password"
                id="admin-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full px-4 py-3 rounded-xl border focus:outline-none"
                style={{
                  borderColor: loginError ? "oklch(0.60 0.20 25)" : "oklch(0.88 0.01 90)",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              />
              {loginError && (
                <p className="text-xs mt-1" style={{ color: "oklch(0.60 0.20 25)", fontFamily: "'DM Sans', sans-serif" }}>
                  {loginError}
                </p>
              )}
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-xl font-semibold text-white"
              style={{ backgroundColor: "oklch(0.24 0.07 155)", fontFamily: "'DM Sans', sans-serif" }}
            >
              Sign In
            </button>
          </form>

          <button
            onClick={() => navigate("/")}
            className="mt-6 text-sm font-medium underline underline-offset-4 block mx-auto"
            style={{ fontFamily: "'DM Sans', sans-serif", color: "oklch(0.24 0.07 155)" }}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // ─── Dashboard ─────────────────────────────────────────────────────────────
  const tabs: { id: Tab; label: string; icon: typeof BarChart3 }[] = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "quiz", label: "Quiz Leads", icon: ClipboardList },
    { id: "followup", label: "Follow-ups", icon: Users },
    { id: "waitlist", label: "Waitlist", icon: Bell },
  ];

  const filteredQuiz = quizData.filter(
    (q) =>
      q.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredFollowup = followupData.filter(
    (f) =>
      f.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredWaitlist = waitlistData.filter(
    (w) =>
      w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: "oklch(0.97 0.015 90)" }}>
      {/* Header */}
      <header
        className="border-b sticky top-0 z-40"
        style={{ borderColor: "oklch(0.88 0.01 90)", backgroundColor: "white" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/")} className="flex items-center gap-1.5 text-sm font-medium" style={{ color: "oklch(0.24 0.07 155)", fontFamily: "'DM Sans', sans-serif" }}>
              <ChevronLeft className="w-4 h-4" />
              Home
            </button>
            <div className="h-5 w-px" style={{ backgroundColor: "oklch(0.88 0.01 90)" }} />
            <div className="flex items-center gap-2">
              <Leaf className="w-5 h-5" style={{ color: "oklch(0.24 0.07 155)" }} />
              <span className="text-lg font-bold" style={{ fontFamily: "'Playfair Display', serif", color: "oklch(0.22 0.005 65)" }}>
                Admin Dashboard
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchAllData}
              className="p-2 rounded-lg transition-colors hover:bg-gray-100"
              title="Refresh data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} style={{ color: "oklch(0.50 0.005 65)" }} />
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors hover:bg-gray-100"
              style={{ fontFamily: "'DM Sans', sans-serif", color: "oklch(0.50 0.005 65)" }}
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                backgroundColor: activeTab === tab.id ? "oklch(0.24 0.07 155)" : "white",
                color: activeTab === tab.id ? "white" : "oklch(0.40 0.005 65)",
                border: activeTab === tab.id ? "none" : "1px solid oklch(0.88 0.01 90)",
              }}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* ─── Overview Tab ─── */}
        {activeTab === "overview" && stats && (
          <div>
            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Quiz Submissions", value: stats.totalQuizSubmissions, sub: `${stats.quizThisWeek} this week`, color: "oklch(0.24 0.07 155)" },
                { label: "Follow-up Requests", value: stats.totalFollowUpRequests, sub: `${stats.followUpQualified} qualified`, color: "oklch(0.60 0.12 42)" },
                { label: "Waitlist Signups", value: stats.totalWaitlist, sub: "Total entries", color: "oklch(0.55 0.06 155)" },
                { label: "Avg Quiz Score", value: `${stats.averageQuizScore}%`, sub: "Symptom severity", color: "oklch(0.38 0.07 155)" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl p-6 shadow-sm"
                  style={{ backgroundColor: "white", border: "1px solid oklch(0.88 0.01 90)" }}
                >
                  <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ fontFamily: "'DM Sans', sans-serif", color: "oklch(0.55 0.005 65)" }}>
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold mb-1" style={{ fontFamily: "'Playfair Display', serif", color: stat.color }}>
                    {stat.value}
                  </p>
                  <p className="text-xs" style={{ fontFamily: "'DM Sans', sans-serif", color: "oklch(0.55 0.005 65)" }}>
                    {stat.sub}
                  </p>
                </div>
              ))}
            </div>

            {/* Tier Breakdown */}
            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              <div
                className="rounded-2xl p-6 shadow-sm"
                style={{ backgroundColor: "white", border: "1px solid oklch(0.88 0.01 90)" }}
              >
                <h3 className="text-base font-bold mb-4" style={{ fontFamily: "'DM Sans', sans-serif", color: "oklch(0.22 0.005 65)" }}>
                  Symptom Tier Breakdown
                </h3>
                {(stats?.tierBreakdown ? [
                  { label: "Early Stage", count: stats.tierBreakdown.earlyStage, color: "oklch(0.55 0.06 155)" },
                  { label: "Moderate Symptoms", count: stats.tierBreakdown.moderate, color: "oklch(0.60 0.12 42)" },
                  { label: "Significant Symptoms", count: stats.tierBreakdown.significant, color: "oklch(0.24 0.07 155)" },
                ] : []).map((tier) => {
                  const total = stats?.totalQuizSubmissions || 1;
                  const count = tier.count || 0;
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                  return (
                    <div key={tier.label} className="mb-3">
                      <div className="flex justify-between text-sm mb-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                        <span style={{ color: "oklch(0.35 0.005 65)" }}>{tier.label}</span>
                        <span style={{ color: "oklch(0.50 0.005 65)" }}>{tier.count} ({pct}%)</span>
                      </div>
                      <div className="w-full h-2 rounded-full" style={{ backgroundColor: "oklch(0.92 0.01 90)" }}>
                        <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: tier.color }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Traffic Sources */}
              <div
                className="rounded-2xl p-6 shadow-sm"
                style={{ backgroundColor: "white", border: "1px solid oklch(0.88 0.01 90)" }}
              >
                <h3 className="text-base font-bold mb-4" style={{ fontFamily: "'DM Sans', sans-serif", color: "oklch(0.22 0.005 65)" }}>
                  Traffic Sources
                </h3>
                {stats?.utmSources && Object.entries(stats.utmSources).length > 0 ? (
                  Object.entries(stats.utmSources)
                    .sort(([, a], [, b]) => b - a)
                    .map(([source, count]) => (
                      <div key={source} className="flex justify-between py-2 border-b last:border-b-0" style={{ borderColor: "oklch(0.92 0.01 90)" }}>
                        <span className="text-sm capitalize" style={{ fontFamily: "'DM Sans', sans-serif", color: "oklch(0.35 0.005 65)" }}>
                          {source}
                        </span>
                        <span className="text-sm font-semibold" style={{ fontFamily: "'DM Sans', sans-serif", color: "oklch(0.24 0.07 155)" }}>
                          {count}
                        </span>
                      </div>
                    ))
                ) : (
                  <p className="text-sm" style={{ fontFamily: "'DM Sans', sans-serif", color: "oklch(0.55 0.005 65)" }}>
                    No traffic source data yet. Sources will appear as quiz submissions come in.
                  </p>
                )}
              </div>
            </div>

            {/* Follow-up Status */}
            <div
              className="rounded-2xl p-6 shadow-sm"
              style={{ backgroundColor: "white", border: "1px solid oklch(0.88 0.01 90)" }}
            >
              <h3 className="text-base font-bold mb-4" style={{ fontFamily: "'DM Sans', sans-serif", color: "oklch(0.22 0.005 65)" }}>
                Follow-up Status
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Pending", count: stats.followUpPending, color: "oklch(0.60 0.12 42)" },
                  { label: "Qualified", count: stats.followUpQualified, color: "oklch(0.24 0.07 155)" },
                  { label: "Not Qualified", count: stats.totalFollowUpRequests - stats.followUpQualified - stats.followUpPending, color: "oklch(0.55 0.005 65)" },
                ].map((s) => (
                  <div key={s.label} className="text-center p-4 rounded-xl" style={{ backgroundColor: "oklch(0.97 0.015 90)" }}>
                    <p className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: s.color }}>{s.count}</p>
                    <p className="text-xs mt-1" style={{ fontFamily: "'DM Sans', sans-serif", color: "oklch(0.55 0.005 65)" }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── Data Tables ─── */}
        {activeTab !== "overview" && (
          <div>
            {/* Search + Export */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "oklch(0.55 0.005 65)" }} />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border focus:outline-none"
                  style={{ borderColor: "oklch(0.88 0.01 90)", fontFamily: "'DM Sans', sans-serif", fontSize: "0.875rem" }}
                />
              </div>
              <button
                onClick={() => handleExport(activeTab === "quiz" ? "quiz" : activeTab === "followup" ? "followup" : "waitlist")}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                style={{
                  backgroundColor: "oklch(0.24 0.07 155)",
                  color: "white",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>

            {/* Quiz Table */}
            {activeTab === "quiz" && (
              <div className="rounded-2xl overflow-hidden shadow-sm" style={{ border: "1px solid oklch(0.88 0.01 90)" }}>
                <div className="overflow-x-auto">
                  <table className="w-full" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    <thead>
                      <tr style={{ backgroundColor: "oklch(0.24 0.07 155)" }}>
                        {["Name", "Email", "Score", "Tier", "Source", "Date"].map((h) => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase text-white">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredQuiz.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-sm" style={{ color: "oklch(0.55 0.005 65)" }}>
                            No quiz submissions yet.
                          </td>
                        </tr>
                      ) : (
                        filteredQuiz.map((q, i) => (
                          <tr
                            key={q.id}
                            style={{ backgroundColor: i % 2 === 0 ? "white" : "oklch(0.97 0.015 90)" }}
                          >
                            <td className="px-4 py-3 text-sm font-medium" style={{ color: "oklch(0.22 0.005 65)" }}>{q.name}</td>
                            <td className="px-4 py-3 text-sm" style={{ color: "oklch(0.45 0.005 65)" }}>{q.email}</td>
                            <td className="px-4 py-3 text-sm font-semibold" style={{ color: "oklch(0.24 0.07 155)" }}>
                              {q.score}/{q.maxScore}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className="inline-block text-xs px-2 py-1 rounded-full font-semibold"
                                style={{
                                  backgroundColor: q.tier.includes("Significant") ? "oklch(0.24 0.07 155 / 0.10)" :
                                    q.tier.includes("Moderate") ? "oklch(0.60 0.12 42 / 0.10)" : "oklch(0.55 0.06 155 / 0.10)",
                                  color: q.tier.includes("Significant") ? "oklch(0.24 0.07 155)" :
                                    q.tier.includes("Moderate") ? "oklch(0.60 0.12 42)" : "oklch(0.55 0.06 155)",
                                }}
                              >
                                {q.tier}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm" style={{ color: "oklch(0.55 0.005 65)" }}>
                              {q.utmSource || q.source || "direct"}
                            </td>
                            <td className="px-4 py-3 text-sm" style={{ color: "oklch(0.55 0.005 65)" }}>{formatDate(q.createdAt)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Follow-up Table */}
            {activeTab === "followup" && (
              <div className="rounded-2xl overflow-hidden shadow-sm" style={{ border: "1px solid oklch(0.88 0.01 90)" }}>
                <div className="overflow-x-auto">
                  <table className="w-full" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    <thead>
                      <tr style={{ backgroundColor: "oklch(0.24 0.07 155)" }}>
                        {["Name", "Email", "Status", "Session ID", "Requested", "Updated"].map((h) => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase text-white">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredFollowup.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-sm" style={{ color: "oklch(0.55 0.005 65)" }}>
                            No follow-up requests yet.
                          </td>
                        </tr>
                      ) : (
                        filteredFollowup.map((f, i) => (
                          <tr
                            key={f.id}
                            style={{ backgroundColor: i % 2 === 0 ? "white" : "oklch(0.97 0.015 90)" }}
                          >
                            <td className="px-4 py-3 text-sm font-medium" style={{ color: "oklch(0.22 0.005 65)" }}>
                              {f.firstName} {f.lastName}
                            </td>
                            <td className="px-4 py-3 text-sm" style={{ color: "oklch(0.45 0.005 65)" }}>{f.email}</td>
                            <td className="px-4 py-3">
                              <span
                                className="inline-block text-xs px-2 py-1 rounded-full font-semibold capitalize"
                                style={{
                                  backgroundColor: f.status === "qualified" ? "oklch(0.24 0.07 155 / 0.10)" :
                                    f.status === "pending" ? "oklch(0.60 0.12 42 / 0.10)" : "oklch(0.55 0.005 65 / 0.10)",
                                  color: f.status === "qualified" ? "oklch(0.24 0.07 155)" :
                                    f.status === "pending" ? "oklch(0.60 0.12 42)" : "oklch(0.55 0.005 65)",
                                }}
                              >
                                {f.status.replace("_", " ")}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs font-mono" style={{ color: "oklch(0.55 0.005 65)" }}>
                              {f.sessionId.slice(0, 8)}...
                            </td>
                            <td className="px-4 py-3 text-sm" style={{ color: "oklch(0.55 0.005 65)" }}>{formatDate(f.createdAt)}</td>
                            <td className="px-4 py-3 text-sm" style={{ color: "oklch(0.55 0.005 65)" }}>{formatDate(f.updatedAt)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Waitlist Table */}
            {activeTab === "waitlist" && (
              <div className="rounded-2xl overflow-hidden shadow-sm" style={{ border: "1px solid oklch(0.88 0.01 90)" }}>
                <div className="overflow-x-auto">
                  <table className="w-full" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    <thead>
                      <tr style={{ backgroundColor: "oklch(0.24 0.07 155)" }}>
                        {["Name", "Email", "Interest", "Date"].map((h) => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase text-white">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredWaitlist.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-sm" style={{ color: "oklch(0.55 0.005 65)" }}>
                            No waitlist entries yet.
                          </td>
                        </tr>
                      ) : (
                        filteredWaitlist.map((w, i) => (
                          <tr
                            key={w.id}
                            style={{ backgroundColor: i % 2 === 0 ? "white" : "oklch(0.97 0.015 90)" }}
                          >
                            <td className="px-4 py-3 text-sm font-medium" style={{ color: "oklch(0.22 0.005 65)" }}>{w.name}</td>
                            <td className="px-4 py-3 text-sm" style={{ color: "oklch(0.45 0.005 65)" }}>{w.email}</td>
                            <td className="px-4 py-3 text-sm" style={{ color: "oklch(0.55 0.005 65)" }}>{w.interest || "General"}</td>
                            <td className="px-4 py-3 text-sm" style={{ color: "oklch(0.55 0.005 65)" }}>{formatDate(w.createdAt)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Loading overlay */}
        {loading && !stats && (
          <div className="text-center py-20">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: "oklch(0.24 0.07 155)" }} />
            <p className="text-sm" style={{ fontFamily: "'DM Sans', sans-serif", color: "oklch(0.50 0.005 65)" }}>
              Loading dashboard data...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

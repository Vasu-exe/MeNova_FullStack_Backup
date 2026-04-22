import { useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { usePortalAuth } from "@/hooks/usePortalAuth";
import {
  HeartPulse, FileText, Calendar, MessageSquare, Upload, LogOut, Home,
  ClipboardList, Pill, ChevronRight, Clock, CheckCircle2, AlertCircle,
  Send, Paperclip, Trash2, Download, Leaf, User, Bell,
} from "lucide-react";

type Tab = "dashboard" | "quiz-history" | "treatment" | "appointments" | "documents" | "messages";

export default function PatientPortal() {
  const { user, loading, logout, authFetch } = usePortalAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [dashboard, setDashboard] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) navigate("/portal");
    if (!loading && user && user.role !== "patient") navigate("/np-portal");
  }, [loading, user, navigate]);

  useEffect(() => {
    if (user) loadDashboard();
  }, [user]);

  const loadDashboard = async () => {
    try {
      setLoadingData(true);
      const res = await authFetch("/api/patient/dashboard");
      const data = await res.json();
      setDashboard(data);
    } catch (err) {
      console.error("Failed to load dashboard:", err);
    } finally {
      setLoadingData(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "oklch(0.98 0.01 90)" }}>
        <div className="w-8 h-8 border-3 border-t-transparent rounded-full animate-spin" style={{ borderColor: "oklch(0.24 0.07 155)", borderTopColor: "transparent" }} />
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "quiz-history", label: "Quiz History", icon: ClipboardList },
    { id: "treatment", label: "Treatment Plans", icon: Pill },
    { id: "appointments", label: "Appointments", icon: Calendar },
    { id: "documents", label: "Documents", icon: FileText },
    { id: "messages", label: "Messages", icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen flex" style={{ background: "oklch(0.97 0.005 90)" }}>
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 flex flex-col border-r" style={{ background: "oklch(0.24 0.07 155)", borderColor: "oklch(0.30 0.07 155)" }}>
        <div className="p-5 border-b" style={{ borderColor: "oklch(0.30 0.07 155)" }}>
          <div className="flex items-center gap-2 mb-3">
            <Leaf className="w-6 h-6" style={{ color: "oklch(0.80 0.12 155)" }} />
            <span className="font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>MeNova</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "oklch(0.60 0.12 42)", color: "white" }}>
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div>
              <p className="text-sm font-medium text-white">{user.firstName} {user.lastName}</p>
              <p className="text-xs" style={{ color: "oklch(0.70 0.01 90)" }}>Patient</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all text-left"
              style={{
                background: activeTab === tab.id ? "oklch(0.30 0.07 155)" : "transparent",
                color: activeTab === tab.id ? "white" : "oklch(0.75 0.01 90)",
              }}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.id === "messages" && dashboard?.unreadMessages > 0 && (
                <span className="ml-auto text-xs px-1.5 py-0.5 rounded-full" style={{ background: "oklch(0.60 0.12 42)", color: "white" }}>
                  {dashboard.unreadMessages}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t" style={{ borderColor: "oklch(0.30 0.07 155)" }}>
          <button onClick={() => navigate("/")} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm mb-1" style={{ color: "oklch(0.75 0.01 90)" }}>
            <Home className="w-4 h-4" /> Back to Site
          </button>
          <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm" style={{ color: "oklch(0.75 0.01 90)" }}>
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="px-8 py-5 border-b" style={{ background: "white", borderColor: "oklch(0.92 0.005 90)" }}>
          <h1 className="text-xl font-bold" style={{ color: "oklch(0.24 0.07 155)", fontFamily: "'Playfair Display', serif" }}>
            {tabs.find(t => t.id === activeTab)?.label}
          </h1>
        </header>

        <div className="p-8">
          {loadingData ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-3 border-t-transparent rounded-full animate-spin" style={{ borderColor: "oklch(0.24 0.07 155)", borderTopColor: "transparent" }} />
            </div>
          ) : (
            <>
              {activeTab === "dashboard" && <DashboardView data={dashboard} setActiveTab={setActiveTab} />}
              {activeTab === "quiz-history" && <QuizHistoryView data={dashboard?.quizHistory || []} />}
              {activeTab === "treatment" && <TreatmentView data={dashboard?.treatmentPlans || []} />}
              {activeTab === "appointments" && <AppointmentsView data={dashboard?.appointments || []} />}
              {activeTab === "documents" && <DocumentsView data={dashboard?.documents || []} authFetch={authFetch} onRefresh={loadDashboard} />}
              {activeTab === "messages" && <MessagesView authFetch={authFetch} assignedNP={dashboard?.assignedNP} />}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

// ─── Dashboard View ─────────────────────────────────────────────────────────
function DashboardView({ data, setActiveTab }: { data: any; setActiveTab: (t: any) => void }) {
  if (!data) return <p>No data available yet.</p>;

  const latestQuiz = data.quizHistory?.[0];
  const activePlan = data.treatmentPlans?.find((p: any) => p.status === "active");
  const nextAppt = data.appointments?.find((a: any) => a.status === "scheduled" && new Date(a.scheduledAt) > new Date());

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <div className="rounded-xl p-6" style={{ background: "linear-gradient(135deg, oklch(0.24 0.07 155), oklch(0.32 0.08 155))" }}>
        <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
          Welcome back!
        </h2>
        <p style={{ color: "oklch(0.85 0.01 90)" }}>
          Here's an overview of your menopause care journey.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={ClipboardList} label="Quiz Assessments" value={data.quizHistory?.length || 0} color="oklch(0.55 0.15 255)" onClick={() => setActiveTab("quiz-history")} />
        <StatCard icon={Pill} label="Treatment Plans" value={data.treatmentPlans?.length || 0} color="oklch(0.55 0.15 155)" onClick={() => setActiveTab("treatment")} />
        <StatCard icon={Calendar} label="Appointments" value={data.appointments?.length || 0} color="oklch(0.60 0.12 42)" onClick={() => setActiveTab("appointments")} />
        <StatCard icon={FileText} label="Documents" value={data.documents?.length || 0} color="oklch(0.55 0.15 300)" onClick={() => setActiveTab("documents")} />
      </div>

      {/* Quick Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latest Quiz */}
        <div className="rounded-xl border p-5" style={{ background: "white", borderColor: "oklch(0.92 0.005 90)" }}>
          <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: "oklch(0.24 0.07 155)" }}>
            <ClipboardList className="w-4 h-4" /> Latest Assessment
          </h3>
          {latestQuiz ? (
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm" style={{ color: "oklch(0.45 0.03 155)" }}>Score</span>
                <span className="font-bold" style={{ color: "oklch(0.24 0.07 155)" }}>
                  {latestQuiz.score}/{latestQuiz.maxScore}
                </span>
              </div>
              <div className="w-full h-2 rounded-full mb-2" style={{ background: "oklch(0.92 0.005 90)" }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(latestQuiz.score / latestQuiz.maxScore) * 100}%`,
                    background: latestQuiz.severityTier === "earlyStage" ? "oklch(0.65 0.15 155)" : latestQuiz.severityTier === "moderate" ? "oklch(0.70 0.15 80)" : "oklch(0.60 0.15 25)",
                  }}
                />
              </div>
              <p className="text-xs" style={{ color: "oklch(0.55 0.03 155)" }}>
                Severity: <span className="font-medium capitalize">{latestQuiz.severityTier?.replace(/([A-Z])/g, " $1")}</span>
              </p>
              <p className="text-xs mt-1" style={{ color: "oklch(0.65 0.01 90)" }}>
                {new Date(latestQuiz.createdAt).toLocaleDateString()}
              </p>
            </div>
          ) : (
            <p className="text-sm" style={{ color: "oklch(0.55 0.03 155)" }}>No assessments yet. Take the symptom quiz to get started.</p>
          )}
        </div>

        {/* Active Treatment */}
        <div className="rounded-xl border p-5" style={{ background: "white", borderColor: "oklch(0.92 0.005 90)" }}>
          <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: "oklch(0.24 0.07 155)" }}>
            <Pill className="w-4 h-4" /> Active Treatment
          </h3>
          {activePlan ? (
            <div>
              <p className="font-medium mb-1" style={{ color: "oklch(0.24 0.07 155)" }}>{activePlan.hormoneType}</p>
              <p className="text-sm mb-1" style={{ color: "oklch(0.45 0.03 155)" }}>Dosage: {activePlan.dosage}</p>
              <p className="text-sm mb-1" style={{ color: "oklch(0.45 0.03 155)" }}>Frequency: {activePlan.frequency}</p>
              {activePlan.followUpDate && (
                <p className="text-xs mt-2 flex items-center gap-1" style={{ color: "oklch(0.60 0.12 42)" }}>
                  <Clock className="w-3 h-3" /> Follow-up: {new Date(activePlan.followUpDate).toLocaleDateString()}
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm" style={{ color: "oklch(0.55 0.03 155)" }}>No active treatment plan. Your NP will create one after consultation.</p>
          )}
        </div>

        {/* Next Appointment */}
        <div className="rounded-xl border p-5" style={{ background: "white", borderColor: "oklch(0.92 0.005 90)" }}>
          <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: "oklch(0.24 0.07 155)" }}>
            <Calendar className="w-4 h-4" /> Next Appointment
          </h3>
          {nextAppt ? (
            <div>
              <p className="font-medium mb-1" style={{ color: "oklch(0.24 0.07 155)" }}>{nextAppt.title}</p>
              <p className="text-sm mb-1" style={{ color: "oklch(0.45 0.03 155)" }}>
                {new Date(nextAppt.scheduledAt).toLocaleString()}
              </p>
              <p className="text-sm" style={{ color: "oklch(0.45 0.03 155)" }}>Duration: {nextAppt.duration} min</p>
              {nextAppt.meetingLink && (
                <a href={nextAppt.meetingLink} target="_blank" rel="noopener" className="inline-block mt-2 text-sm font-medium underline" style={{ color: "oklch(0.45 0.15 255)" }}>
                  Join Meeting
                </a>
              )}
            </div>
          ) : (
            <p className="text-sm" style={{ color: "oklch(0.55 0.03 155)" }}>No upcoming appointments.</p>
          )}
        </div>

        {/* Assigned NP */}
        <div className="rounded-xl border p-5" style={{ background: "white", borderColor: "oklch(0.92 0.005 90)" }}>
          <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: "oklch(0.24 0.07 155)" }}>
            <User className="w-4 h-4" /> Your Care Provider
          </h3>
          {data.assignedNP ? (
            <div>
              <p className="font-medium" style={{ color: "oklch(0.24 0.07 155)" }}>
                {data.assignedNP.firstName} {data.assignedNP.lastName}, NP
              </p>
              <p className="text-sm" style={{ color: "oklch(0.45 0.03 155)" }}>{data.assignedNP.email}</p>
              <button
                onClick={() => setActiveTab("messages")}
                className="mt-2 text-sm font-medium flex items-center gap-1"
                style={{ color: "oklch(0.45 0.15 255)" }}
              >
                <MessageSquare className="w-3 h-3" /> Send Message
              </button>
            </div>
          ) : (
            <p className="text-sm" style={{ color: "oklch(0.55 0.03 155)" }}>No NP assigned yet. One will be assigned after your first consultation.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, onClick }: { icon: any; label: string; value: number; color: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="rounded-xl border p-4 text-left transition-all hover:shadow-md" style={{ background: "white", borderColor: "oklch(0.92 0.005 90)" }}>
      <div className="flex items-center justify-between mb-2">
        <Icon className="w-5 h-5" style={{ color }} />
        <ChevronRight className="w-4 h-4" style={{ color: "oklch(0.75 0.01 90)" }} />
      </div>
      <p className="text-2xl font-bold" style={{ color: "oklch(0.24 0.07 155)" }}>{value}</p>
      <p className="text-xs" style={{ color: "oklch(0.55 0.03 155)" }}>{label}</p>
    </button>
  );
}

// ─── Quiz History View ──────────────────────────────────────────────────────
function QuizHistoryView({ data }: { data: any[] }) {
  if (data.length === 0) {
    return (
      <div className="text-center py-16">
        <ClipboardList className="w-12 h-12 mx-auto mb-4" style={{ color: "oklch(0.75 0.01 90)" }} />
        <p className="font-medium mb-2" style={{ color: "oklch(0.35 0.05 155)" }}>No quiz submissions yet</p>
        <p className="text-sm" style={{ color: "oklch(0.55 0.03 155)" }}>Take the symptom quiz on the homepage to see your results here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data.map((quiz: any, i: number) => (
        <div key={i} className="rounded-xl border p-5" style={{ background: "white", borderColor: "oklch(0.92 0.005 90)" }}>
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="font-medium" style={{ color: "oklch(0.24 0.07 155)" }}>
                Assessment #{data.length - i}
              </p>
              <p className="text-xs" style={{ color: "oklch(0.55 0.03 155)" }}>
                {new Date(quiz.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
            <span
              className="px-3 py-1 rounded-full text-xs font-medium"
              style={{
                background: quiz.severityTier === "earlyStage" ? "oklch(0.92 0.05 155)" : quiz.severityTier === "moderate" ? "oklch(0.92 0.05 80)" : "oklch(0.92 0.05 25)",
                color: quiz.severityTier === "earlyStage" ? "oklch(0.35 0.10 155)" : quiz.severityTier === "moderate" ? "oklch(0.40 0.10 80)" : "oklch(0.40 0.10 25)",
              }}
            >
              {quiz.severityTier?.replace(/([A-Z])/g, " $1")}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span style={{ color: "oklch(0.45 0.03 155)" }}>Score</span>
                <span className="font-medium" style={{ color: "oklch(0.24 0.07 155)" }}>{quiz.score}/{quiz.maxScore}</span>
              </div>
              <div className="w-full h-2 rounded-full" style={{ background: "oklch(0.92 0.005 90)" }}>
                <div className="h-full rounded-full" style={{ width: `${(quiz.score / quiz.maxScore) * 100}%`, background: "oklch(0.55 0.15 155)" }} />
              </div>
            </div>
          </div>
          {quiz.recommendation && (
            <p className="text-sm mt-3 p-3 rounded-lg" style={{ background: "oklch(0.96 0.01 155)", color: "oklch(0.35 0.05 155)" }}>
              {quiz.recommendation}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Treatment Plans View ───────────────────────────────────────────────────
function TreatmentView({ data }: { data: any[] }) {
  if (data.length === 0) {
    return (
      <div className="text-center py-16">
        <Pill className="w-12 h-12 mx-auto mb-4" style={{ color: "oklch(0.75 0.01 90)" }} />
        <p className="font-medium mb-2" style={{ color: "oklch(0.35 0.05 155)" }}>No treatment plans yet</p>
        <p className="text-sm" style={{ color: "oklch(0.55 0.03 155)" }}>Your NP will create a personalized treatment plan after your consultation.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data.map((plan: any) => (
        <div key={plan.id} className="rounded-xl border p-5" style={{ background: "white", borderColor: "oklch(0.92 0.005 90)" }}>
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="font-semibold" style={{ color: "oklch(0.24 0.07 155)" }}>{plan.hormoneType}</p>
              <p className="text-sm" style={{ color: "oklch(0.45 0.03 155)" }}>Started {new Date(plan.startDate).toLocaleDateString()}</p>
            </div>
            <span
              className="px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1"
              style={{
                background: plan.status === "active" ? "oklch(0.92 0.05 155)" : "oklch(0.92 0.005 90)",
                color: plan.status === "active" ? "oklch(0.35 0.10 155)" : "oklch(0.45 0.03 155)",
              }}
            >
              {plan.status === "active" ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
              {plan.status}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div>
              <p style={{ color: "oklch(0.55 0.03 155)" }}>Dosage</p>
              <p className="font-medium" style={{ color: "oklch(0.24 0.07 155)" }}>{plan.dosage}</p>
            </div>
            <div>
              <p style={{ color: "oklch(0.55 0.03 155)" }}>Frequency</p>
              <p className="font-medium" style={{ color: "oklch(0.24 0.07 155)" }}>{plan.frequency}</p>
            </div>
            <div>
              <p style={{ color: "oklch(0.55 0.03 155)" }}>Duration</p>
              <p className="font-medium" style={{ color: "oklch(0.24 0.07 155)" }}>{plan.duration}</p>
            </div>
            {plan.followUpDate && (
              <div>
                <p style={{ color: "oklch(0.55 0.03 155)" }}>Follow-up</p>
                <p className="font-medium" style={{ color: "oklch(0.60 0.12 42)" }}>{new Date(plan.followUpDate).toLocaleDateString()}</p>
              </div>
            )}
          </div>
          {plan.instructions && (
            <div className="mt-3 p-3 rounded-lg" style={{ background: "oklch(0.96 0.01 90)" }}>
              <p className="text-xs font-medium mb-1" style={{ color: "oklch(0.45 0.03 155)" }}>Instructions</p>
              <p className="text-sm" style={{ color: "oklch(0.35 0.05 155)" }}>{plan.instructions}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Appointments View ──────────────────────────────────────────────────────
function AppointmentsView({ data }: { data: any[] }) {
  if (data.length === 0) {
    return (
      <div className="text-center py-16">
        <Calendar className="w-12 h-12 mx-auto mb-4" style={{ color: "oklch(0.75 0.01 90)" }} />
        <p className="font-medium mb-2" style={{ color: "oklch(0.35 0.05 155)" }}>No appointments yet</p>
        <p className="text-sm" style={{ color: "oklch(0.55 0.03 155)" }}>Your NP will schedule appointments as part of your care plan.</p>
      </div>
    );
  }

  const upcoming = data.filter(a => a.status === "scheduled" && new Date(a.scheduledAt) > new Date());
  const past = data.filter(a => a.status !== "scheduled" || new Date(a.scheduledAt) <= new Date());

  return (
    <div className="space-y-6">
      {upcoming.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3" style={{ color: "oklch(0.24 0.07 155)" }}>Upcoming</h3>
          <div className="space-y-3">
            {upcoming.map((appt: any) => (
              <AppointmentCard key={appt.id} appt={appt} />
            ))}
          </div>
        </div>
      )}
      {past.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3" style={{ color: "oklch(0.45 0.03 155)" }}>Past</h3>
          <div className="space-y-3">
            {past.map((appt: any) => (
              <AppointmentCard key={appt.id} appt={appt} isPast />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AppointmentCard({ appt, isPast }: { appt: any; isPast?: boolean }) {
  return (
    <div className="rounded-xl border p-4" style={{ background: "white", borderColor: "oklch(0.92 0.005 90)", opacity: isPast ? 0.7 : 1 }}>
      <div className="flex justify-between items-start">
        <div>
          <p className="font-medium" style={{ color: "oklch(0.24 0.07 155)" }}>{appt.title}</p>
          <p className="text-sm" style={{ color: "oklch(0.45 0.03 155)" }}>
            {new Date(appt.scheduledAt).toLocaleString("en-US", { weekday: "long", month: "long", day: "numeric", hour: "numeric", minute: "2-digit" })}
          </p>
          <p className="text-xs mt-1" style={{ color: "oklch(0.55 0.03 155)" }}>{appt.duration} minutes</p>
        </div>
        {appt.meetingLink && !isPast && (
          <a href={appt.meetingLink} target="_blank" rel="noopener" className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ background: "oklch(0.24 0.07 155)" }}>
            Join
          </a>
        )}
      </div>
    </div>
  );
}

// ─── Documents View ─────────────────────────────────────────────────────────
function DocumentsView({ data, authFetch, onRefresh }: { data: any[]; authFetch: any; onRefresh: () => void }) {
  const [uploading, setUploading] = useState(false);
  const [category, setCategory] = useState("other");
  const [notes, setNotes] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be under 10MB");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", category);
      if (notes) formData.append("notes", notes);
      const res = await authFetch("/api/patient/documents/upload", { method: "POST", body: formData });
      const result = await res.json();
      if (res.ok) {
        toast.success("Document uploaded successfully");
        setNotes("");
        onRefresh();
      } else {
        toast.error(result.error || "Upload failed");
      }
    } catch (err) {
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (docId: number) => {
    if (!confirm("Delete this document?")) return;
    try {
      const res = await authFetch(`/api/patient/documents/${docId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Document deleted");
        onRefresh();
      }
    } catch (err) {
      toast.error("Failed to delete document");
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="rounded-xl border p-5" style={{ background: "white", borderColor: "oklch(0.92 0.005 90)" }}>
        <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: "oklch(0.24 0.07 155)" }}>
          <Upload className="w-4 h-4" /> Upload Document
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="px-3 py-2 rounded-lg border text-sm"
            style={{ borderColor: "oklch(0.85 0.01 90)", color: "oklch(0.25 0.05 155)" }}
          >
            <option value="lab_results">Lab Results</option>
            <option value="medical_records">Medical Records</option>
            <option value="prescription">Prescription</option>
            <option value="insurance">Insurance</option>
            <option value="identification">Identification</option>
            <option value="other">Other</option>
          </select>
          <input
            type="text"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Notes (optional)"
            className="px-3 py-2 rounded-lg border text-sm"
            style={{ borderColor: "oklch(0.85 0.01 90)", color: "oklch(0.25 0.05 155)" }}
          />
          <div>
            <input ref={fileInputRef} type="file" onChange={handleUpload} className="hidden" accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx" />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full px-4 py-2 rounded-lg text-sm font-medium text-white flex items-center justify-center gap-2"
              style={{ background: "oklch(0.24 0.07 155)", opacity: uploading ? 0.7 : 1 }}
            >
              {uploading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Paperclip className="w-4 h-4" /> Choose File</>}
            </button>
          </div>
        </div>
        <p className="text-xs" style={{ color: "oklch(0.55 0.03 155)" }}>
          Accepted: PDF, JPG, PNG, WEBP, DOC, DOCX. Max 10MB.
        </p>
      </div>

      {/* Document List */}
      {data.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 mx-auto mb-4" style={{ color: "oklch(0.75 0.01 90)" }} />
          <p className="font-medium mb-2" style={{ color: "oklch(0.35 0.05 155)" }}>No documents uploaded</p>
          <p className="text-sm" style={{ color: "oklch(0.55 0.03 155)" }}>Upload lab results, medical records, or other documents for your care team.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((doc: any) => (
            <div key={doc.id} className="rounded-xl border p-4 flex items-center justify-between" style={{ background: "white", borderColor: "oklch(0.92 0.005 90)" }}>
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8" style={{ color: "oklch(0.55 0.15 255)" }} />
                <div>
                  <p className="font-medium text-sm" style={{ color: "oklch(0.24 0.07 155)" }}>{doc.fileName}</p>
                  <p className="text-xs" style={{ color: "oklch(0.55 0.03 155)" }}>
                    {doc.category?.replace(/_/g, " ")} • {(doc.fileSize / 1024).toFixed(0)} KB • {new Date(doc.createdAt).toLocaleDateString()}
                  </p>
                  {doc.isReviewed && (
                    <p className="text-xs flex items-center gap-1 mt-1" style={{ color: "oklch(0.45 0.15 155)" }}>
                      <CheckCircle2 className="w-3 h-3" /> Reviewed by NP
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a href={doc.fileUrl} target="_blank" rel="noopener" className="p-2 rounded-lg hover:bg-gray-100">
                  <Download className="w-4 h-4" style={{ color: "oklch(0.45 0.03 155)" }} />
                </a>
                <button onClick={() => handleDelete(doc.id)} className="p-2 rounded-lg hover:bg-gray-100">
                  <Trash2 className="w-4 h-4" style={{ color: "oklch(0.55 0.12 25)" }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Messages View ──────────────────────────────────────────────────────────
function MessagesView({ authFetch, assignedNP }: { authFetch: any; assignedNP: any }) {
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (selectedPartner) loadMessages(selectedPartner.id);
  }, [selectedPartner]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadConversations = async () => {
    try {
      const res = await authFetch("/api/patient/messages/conversations");
      const data = await res.json();
      setConversations(data);
      // Auto-select assigned NP if available
      if (assignedNP && data.length === 0) {
        setSelectedPartner(assignedNP);
      } else if (data.length > 0 && !selectedPartner) {
        setSelectedPartner(data[0]);
      }
    } catch (err) {
      console.error("Failed to load conversations:", err);
    }
  };

  const loadMessages = async (partnerId: number) => {
    try {
      const res = await authFetch(`/api/patient/messages/${partnerId}`);
      setMessages(await res.json());
    } catch (err) {
      console.error("Failed to load messages:", err);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedPartner) return;
    setSending(true);
    try {
      await authFetch("/api/patient/messages/send", {
        method: "POST",
        body: JSON.stringify({ receiverId: selectedPartner.id, content: newMessage }),
      });
      setNewMessage("");
      loadMessages(selectedPartner.id);
    } catch (err) {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const allPartners = [...conversations];
  if (assignedNP && !allPartners.find(c => c.id === assignedNP.id)) {
    allPartners.unshift(assignedNP);
  }

  return (
    <div className="flex rounded-xl border overflow-hidden" style={{ background: "white", borderColor: "oklch(0.92 0.005 90)", height: "calc(100vh - 200px)" }}>
      {/* Conversation List */}
      <div className="w-64 border-r flex-shrink-0" style={{ borderColor: "oklch(0.92 0.005 90)" }}>
        <div className="p-3 border-b" style={{ borderColor: "oklch(0.92 0.005 90)" }}>
          <h3 className="font-semibold text-sm" style={{ color: "oklch(0.24 0.07 155)" }}>Conversations</h3>
        </div>
        <div className="overflow-auto">
          {allPartners.length === 0 ? (
            <p className="p-4 text-sm text-center" style={{ color: "oklch(0.55 0.03 155)" }}>No conversations yet</p>
          ) : (
            allPartners.map(partner => (
              <button
                key={partner.id}
                onClick={() => setSelectedPartner(partner)}
                className="w-full p-3 text-left border-b transition-all"
                style={{
                  borderColor: "oklch(0.95 0.005 90)",
                  background: selectedPartner?.id === partner.id ? "oklch(0.95 0.02 155)" : "transparent",
                }}
              >
                <p className="text-sm font-medium" style={{ color: "oklch(0.24 0.07 155)" }}>
                  {partner.firstName} {partner.lastName}
                </p>
                <p className="text-xs" style={{ color: "oklch(0.55 0.03 155)" }}>
                  {partner.role === "np" ? "Nurse Practitioner" : "Patient"}
                </p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 flex flex-col">
        {selectedPartner ? (
          <>
            <div className="p-3 border-b" style={{ borderColor: "oklch(0.92 0.005 90)" }}>
              <p className="font-medium text-sm" style={{ color: "oklch(0.24 0.07 155)" }}>
                {selectedPartner.firstName} {selectedPartner.lastName}
              </p>
            </div>
            <div className="flex-1 overflow-auto p-4 space-y-3">
              {messages.length === 0 && (
                <p className="text-center text-sm py-8" style={{ color: "oklch(0.55 0.03 155)" }}>
                  No messages yet. Start the conversation!
                </p>
              )}
              {messages.map((msg: any) => (
                <div key={msg.id} className={`flex ${msg.senderRole === "patient" ? "justify-end" : "justify-start"}`}>
                  <div
                    className="max-w-[70%] rounded-xl px-4 py-2.5"
                    style={{
                      background: msg.senderRole === "patient" ? "oklch(0.24 0.07 155)" : "oklch(0.95 0.005 90)",
                      color: msg.senderRole === "patient" ? "white" : "oklch(0.25 0.05 155)",
                    }}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <p className="text-xs mt-1" style={{ opacity: 0.6 }}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-3 border-t flex gap-2" style={{ borderColor: "oklch(0.92 0.005 90)" }}>
              <input
                type="text"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 rounded-lg border text-sm"
                style={{ borderColor: "oklch(0.85 0.01 90)", color: "oklch(0.25 0.05 155)" }}
              />
              <button
                onClick={sendMessage}
                disabled={sending || !newMessage.trim()}
                className="px-4 py-2 rounded-lg text-white"
                style={{ background: "oklch(0.24 0.07 155)", opacity: sending || !newMessage.trim() ? 0.5 : 1 }}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm" style={{ color: "oklch(0.55 0.03 155)" }}>Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}

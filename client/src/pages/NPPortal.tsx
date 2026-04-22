import { useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { usePortalAuth } from "@/hooks/usePortalAuth";
import {
  Users, FileText, Calendar, MessageSquare, LogOut, Home, ClipboardList,
  Pill, ChevronRight, Clock, CheckCircle2, Plus, Search, Download,
  Send, Leaf, Stethoscope, BarChart3, Eye, Edit3, Trash2, X, Save,
  AlertCircle, User,
} from "lucide-react";

type Tab = "dashboard" | "patients" | "treatment-plans" | "appointments" | "documents" | "messages" | "analytics";

export default function NPPortal() {
  const { user, loading, logout, authFetch } = usePortalAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [dashboard, setDashboard] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) navigate("/portal");
    if (!loading && user && user.role !== "np") navigate("/patient-portal");
  }, [loading, user, navigate]);

  useEffect(() => {
    if (user) loadDashboard();
  }, [user]);

  const loadDashboard = async () => {
    try {
      setLoadingData(true);
      const res = await authFetch("/api/np/dashboard");
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
    { id: "patients", label: "My Patients", icon: Users },
    { id: "treatment-plans", label: "Treatment Plans", icon: Pill },
    { id: "appointments", label: "Appointments", icon: Calendar },
    { id: "documents", label: "Patient Docs", icon: FileText },
    { id: "messages", label: "Messages", icon: MessageSquare },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen flex" style={{ background: "oklch(0.97 0.005 90)" }}>
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 flex flex-col border-r" style={{ background: "oklch(0.20 0.06 155)", borderColor: "oklch(0.26 0.06 155)" }}>
        <div className="p-5 border-b" style={{ borderColor: "oklch(0.26 0.06 155)" }}>
          <div className="flex items-center gap-2 mb-3">
            <Leaf className="w-6 h-6" style={{ color: "oklch(0.80 0.12 155)" }} />
            <span className="font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>MeNova</span>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "oklch(0.60 0.12 42)", color: "white" }}>NP</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "oklch(0.55 0.15 255)", color: "white" }}>
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div>
              <p className="text-sm font-medium text-white">{user.firstName} {user.lastName}</p>
              <p className="text-xs" style={{ color: "oklch(0.70 0.01 90)" }}>Nurse Practitioner</p>
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
                background: activeTab === tab.id ? "oklch(0.26 0.06 155)" : "transparent",
                color: activeTab === tab.id ? "white" : "oklch(0.75 0.01 90)",
              }}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t" style={{ borderColor: "oklch(0.26 0.06 155)" }}>
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
        <header className="px-8 py-5 border-b flex items-center justify-between" style={{ background: "white", borderColor: "oklch(0.92 0.005 90)" }}>
          <h1 className="text-xl font-bold" style={{ color: "oklch(0.20 0.06 155)", fontFamily: "'Playfair Display', serif" }}>
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
              {activeTab === "dashboard" && <NPDashboardView data={dashboard} setActiveTab={setActiveTab} />}
              {activeTab === "patients" && <PatientsView authFetch={authFetch} patients={dashboard?.patients || []} onRefresh={loadDashboard} />}
              {activeTab === "treatment-plans" && <TreatmentPlansView authFetch={authFetch} patients={dashboard?.patients || []} onRefresh={loadDashboard} />}
              {activeTab === "appointments" && <AppointmentsView authFetch={authFetch} patients={dashboard?.patients || []} onRefresh={loadDashboard} />}
              {activeTab === "documents" && <DocumentsView authFetch={authFetch} patients={dashboard?.patients || []} />}
              {activeTab === "messages" && <NPMessagesView authFetch={authFetch} patients={dashboard?.patients || []} />}
              {activeTab === "analytics" && <AnalyticsView data={dashboard} />}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

// ─── NP Dashboard View ──────────────────────────────────────────────────────
function NPDashboardView({ data, setActiveTab }: { data: any; setActiveTab: (t: any) => void }) {
  if (!data) return <p>Loading...</p>;

  return (
    <div className="space-y-6">
      <div className="rounded-xl p-6" style={{ background: "linear-gradient(135deg, oklch(0.20 0.06 155), oklch(0.30 0.07 155))" }}>
        <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
          NP Dashboard
        </h2>
        <p style={{ color: "oklch(0.85 0.01 90)" }}>
          Manage your patients, treatment plans, and appointments.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <NPStatCard icon={Users} label="Assigned Patients" value={data.patients?.length || 0} color="oklch(0.55 0.15 255)" onClick={() => setActiveTab("patients")} />
        <NPStatCard icon={Pill} label="Active Plans" value={data.activePlans || 0} color="oklch(0.55 0.15 155)" onClick={() => setActiveTab("treatment-plans")} />
        <NPStatCard icon={Calendar} label="Upcoming Appts" value={data.upcomingAppointments || 0} color="oklch(0.60 0.12 42)" onClick={() => setActiveTab("appointments")} />
        <NPStatCard icon={FileText} label="Pending Docs" value={data.pendingDocuments || 0} color="oklch(0.55 0.15 300)" onClick={() => setActiveTab("documents")} />
      </div>

      {/* Recent Activity */}
      <div className="rounded-xl border p-5" style={{ background: "white", borderColor: "oklch(0.92 0.005 90)" }}>
        <h3 className="font-semibold mb-4" style={{ color: "oklch(0.20 0.06 155)" }}>Recent Patients</h3>
        {data.patients?.length > 0 ? (
          <div className="space-y-3">
            {data.patients.slice(0, 5).map((p: any) => (
              <div key={p.id} className="flex items-center justify-between p-3 rounded-lg" style={{ background: "oklch(0.97 0.005 90)" }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "oklch(0.60 0.12 42)", color: "white" }}>
                    {p.firstName?.[0]}{p.lastName?.[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: "oklch(0.24 0.07 155)" }}>{p.firstName} {p.lastName}</p>
                    <p className="text-xs" style={{ color: "oklch(0.55 0.03 155)" }}>{p.email}</p>
                  </div>
                </div>
                <button onClick={() => setActiveTab("patients")} className="text-xs font-medium" style={{ color: "oklch(0.45 0.15 255)" }}>
                  View Profile →
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm" style={{ color: "oklch(0.55 0.03 155)" }}>No patients assigned yet.</p>
        )}
      </div>
    </div>
  );
}

function NPStatCard({ icon: Icon, label, value, color, onClick }: { icon: any; label: string; value: number; color: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="rounded-xl border p-4 text-left transition-all hover:shadow-md" style={{ background: "white", borderColor: "oklch(0.92 0.005 90)" }}>
      <div className="flex items-center justify-between mb-2">
        <Icon className="w-5 h-5" style={{ color }} />
        <ChevronRight className="w-4 h-4" style={{ color: "oklch(0.75 0.01 90)" }} />
      </div>
      <p className="text-2xl font-bold" style={{ color: "oklch(0.20 0.06 155)" }}>{value}</p>
      <p className="text-xs" style={{ color: "oklch(0.55 0.03 155)" }}>{label}</p>
    </button>
  );
}

// ─── Patients View ──────────────────────────────────────────────────────────
function PatientsView({ authFetch, patients, onRefresh }: { authFetch: any; patients: any[]; onRefresh: () => void }) {
  const [search, setSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [patientDetail, setPatientDetail] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [noteContent, setNoteContent] = useState("");

  const filtered = patients.filter(p =>
    `${p.firstName} ${p.lastName} ${p.email}`.toLowerCase().includes(search.toLowerCase())
  );

  const loadPatientDetail = async (patientId: number) => {
    setLoadingDetail(true);
    try {
      const res = await authFetch(`/api/np/patients/${patientId}`);
      const data = await res.json();
      setPatientDetail(data);
    } catch (err) {
      toast.error("Failed to load patient details");
    } finally {
      setLoadingDetail(false);
    }
  };

  const addNote = async (patientId: number) => {
    if (!noteContent.trim()) return;
    try {
      await authFetch(`/api/np/patients/${patientId}/notes`, {
        method: "POST",
        body: JSON.stringify({ content: noteContent }),
      });
      toast.success("Note added");
      setNoteContent("");
      setShowNotes(false);
      loadPatientDetail(patientId);
    } catch (err) {
      toast.error("Failed to add note");
    }
  };

  if (selectedPatient && patientDetail) {
    return (
      <div className="space-y-6">
        <button onClick={() => { setSelectedPatient(null); setPatientDetail(null); }} className="text-sm flex items-center gap-1" style={{ color: "oklch(0.45 0.15 255)" }}>
          ← Back to Patients
        </button>

        {/* Patient Header */}
        <div className="rounded-xl border p-6" style={{ background: "white", borderColor: "oklch(0.92 0.005 90)" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold" style={{ background: "oklch(0.60 0.12 42)", color: "white" }}>
                {selectedPatient.firstName?.[0]}{selectedPatient.lastName?.[0]}
              </div>
              <div>
                <h2 className="text-xl font-bold" style={{ color: "oklch(0.20 0.06 155)", fontFamily: "'Playfair Display', serif" }}>
                  {selectedPatient.firstName} {selectedPatient.lastName}
                </h2>
                <p className="text-sm" style={{ color: "oklch(0.45 0.03 155)" }}>{selectedPatient.email}</p>
                {selectedPatient.phone && <p className="text-sm" style={{ color: "oklch(0.45 0.03 155)" }}>{selectedPatient.phone}</p>}
              </div>
            </div>
            <button
              onClick={() => setShowNotes(!showNotes)}
              className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
              style={{ background: "oklch(0.20 0.06 155)", color: "white" }}
            >
              <Edit3 className="w-4 h-4" /> Add Note
            </button>
          </div>
        </div>

        {/* Add Note Form */}
        {showNotes && (
          <div className="rounded-xl border p-5" style={{ background: "white", borderColor: "oklch(0.92 0.005 90)" }}>
            <h3 className="font-semibold mb-3" style={{ color: "oklch(0.20 0.06 155)" }}>Add Clinical Note</h3>
            <textarea
              value={noteContent}
              onChange={e => setNoteContent(e.target.value)}
              rows={4}
              placeholder="Enter clinical notes..."
              className="w-full px-3 py-2 rounded-lg border text-sm mb-3"
              style={{ borderColor: "oklch(0.85 0.01 90)", color: "oklch(0.25 0.05 155)" }}
            />
            <div className="flex gap-2">
              <button onClick={() => addNote(selectedPatient.id)} className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ background: "oklch(0.20 0.06 155)" }}>
                <Save className="w-4 h-4 inline mr-1" /> Save Note
              </button>
              <button onClick={() => setShowNotes(false)} className="px-4 py-2 rounded-lg text-sm border" style={{ borderColor: "oklch(0.85 0.01 90)" }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Patient Data Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quiz History */}
          <div className="rounded-xl border p-5" style={{ background: "white", borderColor: "oklch(0.92 0.005 90)" }}>
            <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: "oklch(0.20 0.06 155)" }}>
              <ClipboardList className="w-4 h-4" /> Quiz History
            </h3>
            {patientDetail.quizHistory?.length > 0 ? (
              <div className="space-y-2">
                {patientDetail.quizHistory.map((q: any, i: number) => (
                  <div key={i} className="p-3 rounded-lg" style={{ background: "oklch(0.97 0.005 90)" }}>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium" style={{ color: "oklch(0.24 0.07 155)" }}>Score: {q.score}/{q.maxScore}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full capitalize" style={{ background: "oklch(0.92 0.05 155)", color: "oklch(0.35 0.10 155)" }}>
                        {q.severityTier?.replace(/([A-Z])/g, " $1")}
                      </span>
                    </div>
                    <p className="text-xs mt-1" style={{ color: "oklch(0.55 0.03 155)" }}>{new Date(q.createdAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm" style={{ color: "oklch(0.55 0.03 155)" }}>No quiz submissions</p>
            )}
          </div>

          {/* Documents */}
          <div className="rounded-xl border p-5" style={{ background: "white", borderColor: "oklch(0.92 0.005 90)" }}>
            <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: "oklch(0.20 0.06 155)" }}>
              <FileText className="w-4 h-4" /> Documents
            </h3>
            {patientDetail.documents?.length > 0 ? (
              <div className="space-y-2">
                {patientDetail.documents.map((doc: any) => (
                  <div key={doc.id} className="p-3 rounded-lg flex items-center justify-between" style={{ background: "oklch(0.97 0.005 90)" }}>
                    <div>
                      <p className="text-sm font-medium" style={{ color: "oklch(0.24 0.07 155)" }}>{doc.fileName}</p>
                      <p className="text-xs" style={{ color: "oklch(0.55 0.03 155)" }}>{doc.category?.replace(/_/g, " ")} • {new Date(doc.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2">
                      <a href={doc.fileUrl} target="_blank" rel="noopener" className="p-1.5 rounded hover:bg-gray-200">
                        <Download className="w-4 h-4" style={{ color: "oklch(0.45 0.03 155)" }} />
                      </a>
                      <button
                        onClick={async () => {
                          await authFetch(`/api/np/documents/${doc.id}/review`, { method: "POST" });
                          toast.success("Marked as reviewed");
                          loadPatientDetail(selectedPatient.id);
                        }}
                        className="p-1.5 rounded hover:bg-gray-200"
                        title="Mark as reviewed"
                      >
                        <CheckCircle2 className="w-4 h-4" style={{ color: doc.isReviewed ? "oklch(0.45 0.15 155)" : "oklch(0.75 0.01 90)" }} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm" style={{ color: "oklch(0.55 0.03 155)" }}>No documents uploaded</p>
            )}
          </div>

          {/* Treatment Plans */}
          <div className="rounded-xl border p-5" style={{ background: "white", borderColor: "oklch(0.92 0.005 90)" }}>
            <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: "oklch(0.20 0.06 155)" }}>
              <Pill className="w-4 h-4" /> Treatment Plans
            </h3>
            {patientDetail.treatmentPlans?.length > 0 ? (
              <div className="space-y-2">
                {patientDetail.treatmentPlans.map((plan: any) => (
                  <div key={plan.id} className="p-3 rounded-lg" style={{ background: "oklch(0.97 0.005 90)" }}>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium" style={{ color: "oklch(0.24 0.07 155)" }}>{plan.hormoneType}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full capitalize" style={{
                        background: plan.status === "active" ? "oklch(0.92 0.05 155)" : "oklch(0.92 0.005 90)",
                        color: plan.status === "active" ? "oklch(0.35 0.10 155)" : "oklch(0.45 0.03 155)",
                      }}>{plan.status}</span>
                    </div>
                    <p className="text-xs mt-1" style={{ color: "oklch(0.55 0.03 155)" }}>{plan.dosage} • {plan.frequency}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm" style={{ color: "oklch(0.55 0.03 155)" }}>No treatment plans</p>
            )}
          </div>

          {/* Clinical Notes */}
          <div className="rounded-xl border p-5" style={{ background: "white", borderColor: "oklch(0.92 0.005 90)" }}>
            <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: "oklch(0.20 0.06 155)" }}>
              <Edit3 className="w-4 h-4" /> Clinical Notes
            </h3>
            {patientDetail.clinicalNotes?.length > 0 ? (
              <div className="space-y-2">
                {patientDetail.clinicalNotes.map((note: any) => (
                  <div key={note.id} className="p-3 rounded-lg" style={{ background: "oklch(0.97 0.005 90)" }}>
                    <p className="text-sm" style={{ color: "oklch(0.25 0.05 155)" }}>{note.content}</p>
                    <p className="text-xs mt-1" style={{ color: "oklch(0.55 0.03 155)" }}>{new Date(note.createdAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm" style={{ color: "oklch(0.55 0.03 155)" }}>No clinical notes yet</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "oklch(0.55 0.03 155)" }} />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search patients by name or email..."
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm"
          style={{ borderColor: "oklch(0.85 0.01 90)", color: "oklch(0.25 0.05 155)" }}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Users className="w-12 h-12 mx-auto mb-4" style={{ color: "oklch(0.75 0.01 90)" }} />
          <p className="font-medium mb-2" style={{ color: "oklch(0.35 0.05 155)" }}>No patients found</p>
          <p className="text-sm" style={{ color: "oklch(0.55 0.03 155)" }}>Patients will appear here once assigned to you.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(patient => (
            <button
              key={patient.id}
              onClick={() => { setSelectedPatient(patient); loadPatientDetail(patient.id); }}
              className="w-full rounded-xl border p-4 flex items-center justify-between text-left transition-all hover:shadow-md"
              style={{ background: "white", borderColor: "oklch(0.92 0.005 90)" }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: "oklch(0.60 0.12 42)", color: "white" }}>
                  {patient.firstName?.[0]}{patient.lastName?.[0]}
                </div>
                <div>
                  <p className="font-medium" style={{ color: "oklch(0.20 0.06 155)" }}>{patient.firstName} {patient.lastName}</p>
                  <p className="text-xs" style={{ color: "oklch(0.55 0.03 155)" }}>{patient.email}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5" style={{ color: "oklch(0.75 0.01 90)" }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Treatment Plans View ───────────────────────────────────────────────────
function TreatmentPlansView({ authFetch, patients, onRefresh }: { authFetch: any; patients: any[]; onRefresh: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [form, setForm] = useState({
    patientId: "",
    hormoneType: "",
    dosage: "",
    frequency: "",
    duration: "",
    instructions: "",
    followUpDate: "",
  });

  useEffect(() => { loadPlans(); }, []);

  const loadPlans = async () => {
    try {
      const res = await authFetch("/api/np/treatment-plans");
      setPlans(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPlans(false);
    }
  };

  const createPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await authFetch("/api/np/treatment-plans", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          patientId: parseInt(form.patientId),
          startDate: new Date().toISOString(),
        }),
      });
      if (res.ok) {
        toast.success("Treatment plan created");
        setShowForm(false);
        setForm({ patientId: "", hormoneType: "", dosage: "", frequency: "", duration: "", instructions: "", followUpDate: "" });
        loadPlans();
        onRefresh();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to create plan");
      }
    } catch (err) {
      toast.error("Failed to create plan");
    }
  };

  const updateStatus = async (planId: number, status: string) => {
    try {
      await authFetch(`/api/np/treatment-plans/${planId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      toast.success(`Plan ${status}`);
      loadPlans();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-sm" style={{ color: "oklch(0.55 0.03 155)" }}>{plans.length} treatment plan(s)</p>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-lg text-sm font-medium text-white flex items-center gap-2"
          style={{ background: "oklch(0.20 0.06 155)" }}
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? "Cancel" : "New Plan"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={createPlan} className="rounded-xl border p-5 space-y-4" style={{ background: "white", borderColor: "oklch(0.92 0.005 90)" }}>
          <h3 className="font-semibold" style={{ color: "oklch(0.20 0.06 155)" }}>Create Treatment Plan</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "oklch(0.45 0.03 155)" }}>Patient</label>
              <select value={form.patientId} onChange={e => setForm(f => ({ ...f, patientId: e.target.value }))} required className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: "oklch(0.85 0.01 90)", color: "oklch(0.25 0.05 155)" }}>
                <option value="">Select patient...</option>
                {patients.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "oklch(0.45 0.03 155)" }}>Hormone Type</label>
              <select value={form.hormoneType} onChange={e => setForm(f => ({ ...f, hormoneType: e.target.value }))} required className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: "oklch(0.85 0.01 90)", color: "oklch(0.25 0.05 155)" }}>
                <option value="">Select type...</option>
                <option value="Estradiol">Estradiol</option>
                <option value="Progesterone">Progesterone</option>
                <option value="Testosterone">Testosterone</option>
                <option value="DHEA">DHEA</option>
                <option value="Estradiol + Progesterone">Estradiol + Progesterone</option>
                <option value="Custom Compound">Custom Compound</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "oklch(0.45 0.03 155)" }}>Dosage</label>
              <input type="text" value={form.dosage} onChange={e => setForm(f => ({ ...f, dosage: e.target.value }))} required placeholder="e.g., 0.5mg" className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: "oklch(0.85 0.01 90)", color: "oklch(0.25 0.05 155)" }} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "oklch(0.45 0.03 155)" }}>Frequency</label>
              <select value={form.frequency} onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))} required className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: "oklch(0.85 0.01 90)", color: "oklch(0.25 0.05 155)" }}>
                <option value="">Select...</option>
                <option value="Once daily">Once daily</option>
                <option value="Twice daily">Twice daily</option>
                <option value="Every other day">Every other day</option>
                <option value="Weekly">Weekly</option>
                <option value="Bi-weekly">Bi-weekly</option>
                <option value="Monthly">Monthly</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "oklch(0.45 0.03 155)" }}>Duration</label>
              <input type="text" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} required placeholder="e.g., 3 months" className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: "oklch(0.85 0.01 90)", color: "oklch(0.25 0.05 155)" }} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "oklch(0.45 0.03 155)" }}>Follow-up Date</label>
              <input type="date" value={form.followUpDate} onChange={e => setForm(f => ({ ...f, followUpDate: e.target.value }))} className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: "oklch(0.85 0.01 90)", color: "oklch(0.25 0.05 155)" }} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "oklch(0.45 0.03 155)" }}>Instructions</label>
            <textarea value={form.instructions} onChange={e => setForm(f => ({ ...f, instructions: e.target.value }))} rows={3} placeholder="Special instructions for the patient..." className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: "oklch(0.85 0.01 90)", color: "oklch(0.25 0.05 155)" }} />
          </div>
          <button type="submit" className="px-6 py-2 rounded-lg text-sm font-medium text-white" style={{ background: "oklch(0.20 0.06 155)" }}>
            Create Treatment Plan
          </button>
        </form>
      )}

      {loadingPlans ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "oklch(0.24 0.07 155)", borderTopColor: "transparent" }} />
        </div>
      ) : plans.length === 0 ? (
        <div className="text-center py-16">
          <Pill className="w-12 h-12 mx-auto mb-4" style={{ color: "oklch(0.75 0.01 90)" }} />
          <p className="font-medium mb-2" style={{ color: "oklch(0.35 0.05 155)" }}>No treatment plans yet</p>
          <p className="text-sm" style={{ color: "oklch(0.55 0.03 155)" }}>Create a treatment plan for your patients.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {plans.map((plan: any) => (
            <div key={plan.id} className="rounded-xl border p-5" style={{ background: "white", borderColor: "oklch(0.92 0.005 90)" }}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold" style={{ color: "oklch(0.20 0.06 155)" }}>{plan.hormoneType}</p>
                  <p className="text-sm" style={{ color: "oklch(0.45 0.03 155)" }}>
                    Patient: {plan.patientFirstName} {plan.patientLastName}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 rounded-full capitalize" style={{
                    background: plan.status === "active" ? "oklch(0.92 0.05 155)" : plan.status === "completed" ? "oklch(0.92 0.005 90)" : "oklch(0.92 0.05 25)",
                    color: plan.status === "active" ? "oklch(0.35 0.10 155)" : plan.status === "completed" ? "oklch(0.45 0.03 155)" : "oklch(0.40 0.10 25)",
                  }}>{plan.status}</span>
                  {plan.status === "active" && (
                    <button onClick={() => updateStatus(plan.id, "completed")} className="text-xs px-2 py-1 rounded border" style={{ borderColor: "oklch(0.85 0.01 90)" }}>
                      Complete
                    </button>
                  )}
                  {plan.status === "draft" && (
                    <button onClick={() => updateStatus(plan.id, "active")} className="text-xs px-2 py-1 rounded text-white" style={{ background: "oklch(0.45 0.15 155)" }}>
                      Activate
                    </button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-4 gap-3 text-sm">
                <div><p className="text-xs" style={{ color: "oklch(0.55 0.03 155)" }}>Dosage</p><p className="font-medium" style={{ color: "oklch(0.24 0.07 155)" }}>{plan.dosage}</p></div>
                <div><p className="text-xs" style={{ color: "oklch(0.55 0.03 155)" }}>Frequency</p><p className="font-medium" style={{ color: "oklch(0.24 0.07 155)" }}>{plan.frequency}</p></div>
                <div><p className="text-xs" style={{ color: "oklch(0.55 0.03 155)" }}>Duration</p><p className="font-medium" style={{ color: "oklch(0.24 0.07 155)" }}>{plan.duration}</p></div>
                <div><p className="text-xs" style={{ color: "oklch(0.55 0.03 155)" }}>Started</p><p className="font-medium" style={{ color: "oklch(0.24 0.07 155)" }}>{new Date(plan.startDate).toLocaleDateString()}</p></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Appointments View ──────────────────────────────────────────────────────
function AppointmentsView({ authFetch, patients, onRefresh }: { authFetch: any; patients: any[]; onRefresh: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loadingAppts, setLoadingAppts] = useState(true);
  const [form, setForm] = useState({ patientId: "", title: "", scheduledAt: "", duration: "30", meetingLink: "", notes: "" });

  useEffect(() => { loadAppointments(); }, []);

  const loadAppointments = async () => {
    try {
      const res = await authFetch("/api/np/appointments");
      setAppointments(await res.json());
    } catch (err) { console.error(err); } finally { setLoadingAppts(false); }
  };

  const createAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await authFetch("/api/np/appointments", {
        method: "POST",
        body: JSON.stringify({ ...form, patientId: parseInt(form.patientId), duration: parseInt(form.duration) }),
      });
      if (res.ok) {
        toast.success("Appointment scheduled");
        setShowForm(false);
        setForm({ patientId: "", title: "", scheduledAt: "", duration: "30", meetingLink: "", notes: "" });
        loadAppointments();
        onRefresh();
      }
    } catch (err) { toast.error("Failed to schedule appointment"); }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      await authFetch(`/api/np/appointments/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
      toast.success(`Appointment ${status}`);
      loadAppointments();
    } catch (err) { toast.error("Failed to update"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-sm" style={{ color: "oklch(0.55 0.03 155)" }}>{appointments.length} appointment(s)</p>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 rounded-lg text-sm font-medium text-white flex items-center gap-2" style={{ background: "oklch(0.20 0.06 155)" }}>
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? "Cancel" : "Schedule Appointment"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={createAppointment} className="rounded-xl border p-5 space-y-4" style={{ background: "white", borderColor: "oklch(0.92 0.005 90)" }}>
          <h3 className="font-semibold" style={{ color: "oklch(0.20 0.06 155)" }}>Schedule Appointment</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "oklch(0.45 0.03 155)" }}>Patient</label>
              <select value={form.patientId} onChange={e => setForm(f => ({ ...f, patientId: e.target.value }))} required className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: "oklch(0.85 0.01 90)", color: "oklch(0.25 0.05 155)" }}>
                <option value="">Select patient...</option>
                {patients.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "oklch(0.45 0.03 155)" }}>Title</label>
              <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required placeholder="e.g., Initial Consultation" className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: "oklch(0.85 0.01 90)", color: "oklch(0.25 0.05 155)" }} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "oklch(0.45 0.03 155)" }}>Date & Time</label>
              <input type="datetime-local" value={form.scheduledAt} onChange={e => setForm(f => ({ ...f, scheduledAt: e.target.value }))} required className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: "oklch(0.85 0.01 90)", color: "oklch(0.25 0.05 155)" }} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "oklch(0.45 0.03 155)" }}>Duration (min)</label>
              <select value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: "oklch(0.85 0.01 90)", color: "oklch(0.25 0.05 155)" }}>
                <option value="15">15 min</option>
                <option value="30">30 min</option>
                <option value="45">45 min</option>
                <option value="60">60 min</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "oklch(0.45 0.03 155)" }}>Meeting Link (optional)</label>
              <input type="url" value={form.meetingLink} onChange={e => setForm(f => ({ ...f, meetingLink: e.target.value }))} placeholder="https://zoom.us/j/..." className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: "oklch(0.85 0.01 90)", color: "oklch(0.25 0.05 155)" }} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "oklch(0.45 0.03 155)" }}>Notes</label>
              <input type="text" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Any notes..." className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: "oklch(0.85 0.01 90)", color: "oklch(0.25 0.05 155)" }} />
            </div>
          </div>
          <button type="submit" className="px-6 py-2 rounded-lg text-sm font-medium text-white" style={{ background: "oklch(0.20 0.06 155)" }}>
            Schedule Appointment
          </button>
        </form>
      )}

      {loadingAppts ? (
        <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "oklch(0.24 0.07 155)", borderTopColor: "transparent" }} /></div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-16">
          <Calendar className="w-12 h-12 mx-auto mb-4" style={{ color: "oklch(0.75 0.01 90)" }} />
          <p className="font-medium mb-2" style={{ color: "oklch(0.35 0.05 155)" }}>No appointments</p>
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map((appt: any) => (
            <div key={appt.id} className="rounded-xl border p-4 flex items-center justify-between" style={{ background: "white", borderColor: "oklch(0.92 0.005 90)" }}>
              <div>
                <p className="font-medium" style={{ color: "oklch(0.20 0.06 155)" }}>{appt.title}</p>
                <p className="text-sm" style={{ color: "oklch(0.45 0.03 155)" }}>
                  {appt.patientFirstName} {appt.patientLastName} • {new Date(appt.scheduledAt).toLocaleString()}
                </p>
                <p className="text-xs" style={{ color: "oklch(0.55 0.03 155)" }}>{appt.duration} min</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-1 rounded-full capitalize" style={{
                  background: appt.status === "scheduled" ? "oklch(0.92 0.05 255)" : appt.status === "completed" ? "oklch(0.92 0.05 155)" : "oklch(0.92 0.05 25)",
                  color: appt.status === "scheduled" ? "oklch(0.35 0.10 255)" : appt.status === "completed" ? "oklch(0.35 0.10 155)" : "oklch(0.40 0.10 25)",
                }}>{appt.status}</span>
                {appt.status === "scheduled" && (
                  <>
                    <button onClick={() => updateStatus(appt.id, "completed")} className="text-xs px-2 py-1 rounded border" style={{ borderColor: "oklch(0.85 0.01 90)" }}>Complete</button>
                    <button onClick={() => updateStatus(appt.id, "cancelled")} className="text-xs px-2 py-1 rounded border" style={{ borderColor: "oklch(0.85 0.01 90)", color: "oklch(0.55 0.12 25)" }}>Cancel</button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Documents View ─────────────────────────────────────────────────────────
function DocumentsView({ authFetch, patients }: { authFetch: any; patients: any[] }) {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);

  useEffect(() => { loadDocuments(); }, []);

  const loadDocuments = async () => {
    try {
      const res = await authFetch("/api/np/documents");
      setDocuments(await res.json());
    } catch (err) { console.error(err); } finally { setLoadingDocs(false); }
  };

  const markReviewed = async (docId: number) => {
    try {
      await authFetch(`/api/np/documents/${docId}/review`, { method: "POST" });
      toast.success("Marked as reviewed");
      loadDocuments();
    } catch (err) { toast.error("Failed"); }
  };

  return (
    <div className="space-y-4">
      {loadingDocs ? (
        <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "oklch(0.24 0.07 155)", borderTopColor: "transparent" }} /></div>
      ) : documents.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="w-12 h-12 mx-auto mb-4" style={{ color: "oklch(0.75 0.01 90)" }} />
          <p className="font-medium mb-2" style={{ color: "oklch(0.35 0.05 155)" }}>No patient documents</p>
          <p className="text-sm" style={{ color: "oklch(0.55 0.03 155)" }}>Documents uploaded by your patients will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((doc: any) => (
            <div key={doc.id} className="rounded-xl border p-4 flex items-center justify-between" style={{ background: "white", borderColor: "oklch(0.92 0.005 90)" }}>
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8" style={{ color: doc.isReviewed ? "oklch(0.45 0.15 155)" : "oklch(0.60 0.12 42)" }} />
                <div>
                  <p className="font-medium text-sm" style={{ color: "oklch(0.20 0.06 155)" }}>{doc.fileName}</p>
                  <p className="text-xs" style={{ color: "oklch(0.55 0.03 155)" }}>
                    {doc.patientFirstName} {doc.patientLastName} • {doc.category?.replace(/_/g, " ")} • {new Date(doc.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!doc.isReviewed && (
                  <span className="text-xs px-2 py-1 rounded-full" style={{ background: "oklch(0.92 0.05 42)", color: "oklch(0.45 0.12 42)" }}>
                    Pending Review
                  </span>
                )}
                <a href={doc.fileUrl} target="_blank" rel="noopener" className="p-2 rounded hover:bg-gray-100">
                  <Download className="w-4 h-4" style={{ color: "oklch(0.45 0.03 155)" }} />
                </a>
                {!doc.isReviewed && (
                  <button onClick={() => markReviewed(doc.id)} className="p-2 rounded hover:bg-gray-100" title="Mark as reviewed">
                    <CheckCircle2 className="w-4 h-4" style={{ color: "oklch(0.55 0.15 155)" }} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Messages View ──────────────────────────────────────────────────────────
function NPMessagesView({ authFetch, patients }: { authFetch: any; patients: any[] }) {
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { loadConversations(); }, []);
  useEffect(() => { if (selectedPartner) loadMessages(selectedPartner.id); }, [selectedPartner]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const loadConversations = async () => {
    try {
      const res = await authFetch("/api/np/messages/conversations");
      const data = await res.json();
      setConversations(data);
    } catch (err) { console.error(err); }
  };

  const loadMessages = async (partnerId: number) => {
    try {
      const res = await authFetch(`/api/np/messages/${partnerId}`);
      setMessages(await res.json());
    } catch (err) { console.error(err); }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedPartner) return;
    setSending(true);
    try {
      await authFetch("/api/np/messages/send", { method: "POST", body: JSON.stringify({ receiverId: selectedPartner.id, content: newMessage }) });
      setNewMessage("");
      loadMessages(selectedPartner.id);
    } catch (err) { toast.error("Failed to send"); } finally { setSending(false); }
  };

  const allPartners = [...patients];
  conversations.forEach(c => { if (!allPartners.find(p => p.id === c.id)) allPartners.push(c); });

  return (
    <div className="flex rounded-xl border overflow-hidden" style={{ background: "white", borderColor: "oklch(0.92 0.005 90)", height: "calc(100vh - 200px)" }}>
      <div className="w-64 border-r flex-shrink-0" style={{ borderColor: "oklch(0.92 0.005 90)" }}>
        <div className="p-3 border-b" style={{ borderColor: "oklch(0.92 0.005 90)" }}>
          <h3 className="font-semibold text-sm" style={{ color: "oklch(0.20 0.06 155)" }}>Patients</h3>
        </div>
        <div className="overflow-auto">
          {allPartners.length === 0 ? (
            <p className="p-4 text-sm text-center" style={{ color: "oklch(0.55 0.03 155)" }}>No patients assigned</p>
          ) : (
            allPartners.map(partner => (
              <button key={partner.id} onClick={() => setSelectedPartner(partner)} className="w-full p-3 text-left border-b transition-all" style={{ borderColor: "oklch(0.95 0.005 90)", background: selectedPartner?.id === partner.id ? "oklch(0.95 0.02 155)" : "transparent" }}>
                <p className="text-sm font-medium" style={{ color: "oklch(0.20 0.06 155)" }}>{partner.firstName} {partner.lastName}</p>
                <p className="text-xs" style={{ color: "oklch(0.55 0.03 155)" }}>Patient</p>
              </button>
            ))
          )}
        </div>
      </div>
      <div className="flex-1 flex flex-col">
        {selectedPartner ? (
          <>
            <div className="p-3 border-b" style={{ borderColor: "oklch(0.92 0.005 90)" }}>
              <p className="font-medium text-sm" style={{ color: "oklch(0.20 0.06 155)" }}>{selectedPartner.firstName} {selectedPartner.lastName}</p>
            </div>
            <div className="flex-1 overflow-auto p-4 space-y-3">
              {messages.length === 0 && <p className="text-center text-sm py-8" style={{ color: "oklch(0.55 0.03 155)" }}>No messages yet.</p>}
              {messages.map((msg: any) => (
                <div key={msg.id} className={`flex ${msg.senderRole === "np" ? "justify-end" : "justify-start"}`}>
                  <div className="max-w-[70%] rounded-xl px-4 py-2.5" style={{ background: msg.senderRole === "np" ? "oklch(0.20 0.06 155)" : "oklch(0.95 0.005 90)", color: msg.senderRole === "np" ? "white" : "oklch(0.25 0.05 155)" }}>
                    <p className="text-sm">{msg.content}</p>
                    <p className="text-xs mt-1" style={{ opacity: 0.6 }}>{new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-3 border-t flex gap-2" style={{ borderColor: "oklch(0.92 0.005 90)" }}>
              <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMessage()} placeholder="Type a message..." className="flex-1 px-4 py-2 rounded-lg border text-sm" style={{ borderColor: "oklch(0.85 0.01 90)", color: "oklch(0.25 0.05 155)" }} />
              <button onClick={sendMessage} disabled={sending || !newMessage.trim()} className="px-4 py-2 rounded-lg text-white" style={{ background: "oklch(0.20 0.06 155)", opacity: sending || !newMessage.trim() ? 0.5 : 1 }}>
                <Send className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm" style={{ color: "oklch(0.55 0.03 155)" }}>Select a patient to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Analytics View ─────────────────────────────────────────────────────────
function AnalyticsView({ data }: { data: any }) {
  if (!data) return <p>Loading...</p>;

  const totalPatients = data.patients?.length || 0;
  const activePlans = data.activePlans || 0;
  const completedAppts = data.completedAppointments || 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border p-5 text-center" style={{ background: "white", borderColor: "oklch(0.92 0.005 90)" }}>
          <p className="text-3xl font-bold" style={{ color: "oklch(0.20 0.06 155)" }}>{totalPatients}</p>
          <p className="text-sm" style={{ color: "oklch(0.55 0.03 155)" }}>Total Patients</p>
        </div>
        <div className="rounded-xl border p-5 text-center" style={{ background: "white", borderColor: "oklch(0.92 0.005 90)" }}>
          <p className="text-3xl font-bold" style={{ color: "oklch(0.55 0.15 155)" }}>{activePlans}</p>
          <p className="text-sm" style={{ color: "oklch(0.55 0.03 155)" }}>Active Treatment Plans</p>
        </div>
        <div className="rounded-xl border p-5 text-center" style={{ background: "white", borderColor: "oklch(0.92 0.005 90)" }}>
          <p className="text-3xl font-bold" style={{ color: "oklch(0.60 0.12 42)" }}>{completedAppts}</p>
          <p className="text-sm" style={{ color: "oklch(0.55 0.03 155)" }}>Completed Appointments</p>
        </div>
      </div>

      <div className="rounded-xl border p-5" style={{ background: "white", borderColor: "oklch(0.92 0.005 90)" }}>
        <h3 className="font-semibold mb-4" style={{ color: "oklch(0.20 0.06 155)" }}>Patient Overview</h3>
        {data.patients?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid oklch(0.92 0.005 90)" }}>
                  <th className="text-left py-2 px-3 font-medium" style={{ color: "oklch(0.45 0.03 155)" }}>Patient</th>
                  <th className="text-left py-2 px-3 font-medium" style={{ color: "oklch(0.45 0.03 155)" }}>Email</th>
                  <th className="text-left py-2 px-3 font-medium" style={{ color: "oklch(0.45 0.03 155)" }}>Joined</th>
                </tr>
              </thead>
              <tbody>
                {data.patients.map((p: any) => (
                  <tr key={p.id} style={{ borderBottom: "1px solid oklch(0.95 0.005 90)" }}>
                    <td className="py-2 px-3" style={{ color: "oklch(0.24 0.07 155)" }}>{p.firstName} {p.lastName}</td>
                    <td className="py-2 px-3" style={{ color: "oklch(0.45 0.03 155)" }}>{p.email}</td>
                    <td className="py-2 px-3" style={{ color: "oklch(0.55 0.03 155)" }}>{new Date(p.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm" style={{ color: "oklch(0.55 0.03 155)" }}>No patient data available.</p>
        )}
      </div>
    </div>
  );
}

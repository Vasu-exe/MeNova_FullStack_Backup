import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import {
  User,
  Mail,
  Lock,
  Phone,
  Eye,
  EyeOff,
  HeartPulse,
  Stethoscope,
  ArrowRight,
  Leaf,
} from "lucide-react";

type AuthMode = "login" | "register";
type PortalRole = "patient" | "np";

export default function PortalAuth() {
  const [, navigate] = useLocation();
  const [mode, setMode] = useState<AuthMode>("login");
  const [role, setRole] = useState<PortalRole>("patient");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = mode === "login" ? "/api/portal/login" : "/api/portal/register";
      const body = mode === "login"
        ? { email: form.email, password: form.password }
        : { ...form, role };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Something went wrong");
        setLoading(false);
        return;
      }

      // Store token and user info
      localStorage.setItem("portalToken", data.token);
      localStorage.setItem("portalUser", JSON.stringify(data.user));

      toast.success(mode === "login" ? "Welcome back!" : "Account created successfully!");

      // Navigate to appropriate portal
      if (data.user.role === "np") {
        navigate("/np-portal");
      } else {
        navigate("/patient-portal");
      }
    } catch (err) {
      toast.error("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "oklch(0.98 0.01 90)" }}>
      {/* Left Side — Branding */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-12"
        style={{ background: "oklch(0.24 0.07 155)" }}
      >
        <div className="max-w-md text-center">
          <Leaf className="w-16 h-16 mx-auto mb-6" style={{ color: "oklch(0.80 0.12 155)" }} />
          <h1
            className="text-4xl font-bold mb-4"
            style={{ fontFamily: "'Playfair Display', serif", color: "oklch(0.98 0.01 90)" }}
          >
            MeNova Health
          </h1>
          <p className="text-lg mb-8" style={{ color: "oklch(0.80 0.01 90)" }}>
            Your personalized menopause care journey starts here. Access your health dashboard,
            treatment plans, and connect with your care team.
          </p>
          <div className="grid grid-cols-2 gap-4 text-left">
            {[
              { icon: HeartPulse, text: "Track your symptoms" },
              { icon: Stethoscope, text: "Connect with NPs" },
              { icon: Mail, text: "Secure messaging" },
              { icon: Lock, text: "Private & secure" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2" style={{ color: "oklch(0.85 0.01 90)" }}>
                <item.icon className="w-5 h-5" style={{ color: "oklch(0.80 0.12 155)" }} />
                <span className="text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side — Auth Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <Leaf className="w-10 h-10 mx-auto mb-2" style={{ color: "oklch(0.24 0.07 155)" }} />
            <h1 className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: "oklch(0.24 0.07 155)" }}>
              MeNova Health
            </h1>
          </div>

          {/* Mode Toggle */}
          <div className="flex rounded-lg overflow-hidden mb-6 border" style={{ borderColor: "oklch(0.85 0.01 90)" }}>
            <button
              onClick={() => setMode("login")}
              className="flex-1 py-3 text-sm font-medium transition-all"
              style={{
                background: mode === "login" ? "oklch(0.24 0.07 155)" : "transparent",
                color: mode === "login" ? "white" : "oklch(0.45 0.03 155)",
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode("register")}
              className="flex-1 py-3 text-sm font-medium transition-all"
              style={{
                background: mode === "register" ? "oklch(0.24 0.07 155)" : "transparent",
                color: mode === "register" ? "white" : "oklch(0.45 0.03 155)",
              }}
            >
              Create Account
            </button>
          </div>

          {/* Role Selection (Register only) */}
          {mode === "register" && (
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2" style={{ color: "oklch(0.35 0.05 155)" }}>
                I am a:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setRole("patient")}
                  className="p-4 rounded-lg border-2 text-center transition-all"
                  style={{
                    borderColor: role === "patient" ? "oklch(0.24 0.07 155)" : "oklch(0.90 0.01 90)",
                    background: role === "patient" ? "oklch(0.95 0.02 155)" : "white",
                  }}
                >
                  <HeartPulse
                    className="w-8 h-8 mx-auto mb-2"
                    style={{ color: role === "patient" ? "oklch(0.24 0.07 155)" : "oklch(0.55 0.03 155)" }}
                  />
                  <span className="text-sm font-medium" style={{ color: "oklch(0.24 0.07 155)" }}>
                    Patient
                  </span>
                </button>
                <button
                  onClick={() => setRole("np")}
                  className="p-4 rounded-lg border-2 text-center transition-all"
                  style={{
                    borderColor: role === "np" ? "oklch(0.24 0.07 155)" : "oklch(0.90 0.01 90)",
                    background: role === "np" ? "oklch(0.95 0.02 155)" : "white",
                  }}
                >
                  <Stethoscope
                    className="w-8 h-8 mx-auto mb-2"
                    style={{ color: role === "np" ? "oklch(0.24 0.07 155)" : "oklch(0.55 0.03 155)" }}
                  />
                  <span className="text-sm font-medium" style={{ color: "oklch(0.24 0.07 155)" }}>
                    Nurse Practitioner
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: "oklch(0.45 0.03 155)" }}>
                    First Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "oklch(0.55 0.03 155)" }} />
                    <input
                      type="text"
                      name="firstName"
                      value={form.firstName}
                      onChange={handleChange}
                      required
                      placeholder="Jane"
                      className="w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm"
                      style={{ borderColor: "oklch(0.85 0.01 90)", color: "oklch(0.25 0.05 155)" }}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: "oklch(0.45 0.03 155)" }}>
                    Last Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "oklch(0.55 0.03 155)" }} />
                    <input
                      type="text"
                      name="lastName"
                      value={form.lastName}
                      onChange={handleChange}
                      required
                      placeholder="Smith"
                      className="w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm"
                      style={{ borderColor: "oklch(0.85 0.01 90)", color: "oklch(0.25 0.05 155)" }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "oklch(0.45 0.03 155)" }}>
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "oklch(0.55 0.03 155)" }} />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="jane@example.com"
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm"
                  style={{ borderColor: "oklch(0.85 0.01 90)", color: "oklch(0.25 0.05 155)" }}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "oklch(0.45 0.03 155)" }}>
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "oklch(0.55 0.03 155)" }} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                  placeholder={mode === "register" ? "Min 8 characters" : "Enter password"}
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg border text-sm"
                  style={{ borderColor: "oklch(0.85 0.01 90)", color: "oklch(0.25 0.05 155)" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" style={{ color: "oklch(0.55 0.03 155)" }} />
                  ) : (
                    <Eye className="w-4 h-4" style={{ color: "oklch(0.55 0.03 155)" }} />
                  )}
                </button>
              </div>
            </div>

            {mode === "register" && (
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "oklch(0.45 0.03 155)" }}>
                  Phone (optional)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "oklch(0.55 0.03 155)" }} />
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+1 (604) 555-0123"
                    className="w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm"
                    style={{ borderColor: "oklch(0.85 0.01 90)", color: "oklch(0.25 0.05 155)" }}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg text-white font-medium flex items-center justify-center gap-2 transition-opacity"
              style={{ background: "oklch(0.24 0.07 155)", opacity: loading ? 0.7 : 1 }}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {mode === "login" ? "Sign In" : "Create Account"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-xs mt-6" style={{ color: "oklch(0.55 0.03 155)" }}>
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setMode(mode === "login" ? "register" : "login")}
              className="font-medium underline"
              style={{ color: "oklch(0.24 0.07 155)" }}
            >
              {mode === "login" ? "Create one" : "Sign in"}
            </button>
          </p>

          <div className="text-center mt-4">
            <button
              onClick={() => navigate("/")}
              className="text-xs underline"
              style={{ color: "oklch(0.55 0.03 155)" }}
            >
              ← Back to MeNova Health
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

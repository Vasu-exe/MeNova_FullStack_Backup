import { describe, expect, it, beforeAll } from "vitest";

// Test the portal auth and API endpoints
// These tests validate the REST API contract for both Patient and NP portals

const BASE = "http://localhost:3000";

describe("Portal Authentication", () => {
  describe("POST /api/portal/register", () => {
    it("registers a new patient account", async () => {
      const res = await fetch(`${BASE}/api/portal/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: `test-patient-${Date.now()}@example.com`,
          password: "TestPass123!",
          firstName: "Jane",
          lastName: "Doe",
          role: "patient",
        }),
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.token).toBeDefined();
      expect(data.user).toBeDefined();
      expect(data.user.role).toBe("patient");
      expect(data.user.firstName).toBe("Jane");
    });

    it("registers a new NP account", async () => {
      const res = await fetch(`${BASE}/api/portal/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: `test-np-${Date.now()}@example.com`,
          password: "TestPass123!",
          firstName: "Dr. Sarah",
          lastName: "Smith",
          role: "np",
        }),
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.token).toBeDefined();
      expect(data.user.role).toBe("np");
    });

    it("rejects duplicate email registration", async () => {
      const email = `dup-${Date.now()}@example.com`;
      // First registration
      await fetch(`${BASE}/api/portal/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: "TestPass123!", firstName: "A", lastName: "B", role: "patient" }),
      });
      // Second registration with same email
      const res = await fetch(`${BASE}/api/portal/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: "TestPass123!", firstName: "C", lastName: "D", role: "patient" }),
      });
      expect([400, 409]).toContain(res.status);
      const data = await res.json();
      expect(data.error).toBeDefined();
    });

    it("rejects registration with missing fields", async () => {
      const res = await fetch(`${BASE}/api/portal/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "test@example.com" }),
      });
      expect(res.status).toBe(400);
    });
  });

  describe("POST /api/portal/login", () => {
    const email = `login-test-${Date.now()}@example.com`;
    const password = "TestPass123!";

    beforeAll(async () => {
      await fetch(`${BASE}/api/portal/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, firstName: "Login", lastName: "Test", role: "patient" }),
      });
    });

    it("logs in with correct credentials", async () => {
      const res = await fetch(`${BASE}/api/portal/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.token).toBeDefined();
      expect(data.user.email).toBe(email);
    });

    it("rejects incorrect password", async () => {
      const res = await fetch(`${BASE}/api/portal/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: "WrongPassword!" }),
      });
      expect(res.status).toBe(401);
    });

    it("rejects non-existent email", async () => {
      const res = await fetch(`${BASE}/api/portal/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "nonexistent@example.com", password: "Test123!" }),
      });
      expect(res.status).toBe(401);
    });
  });
});

describe("Patient Portal API", () => {
  let patientToken: string;
  let patientId: number;

  beforeAll(async () => {
    const res = await fetch(`${BASE}/api/portal/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: `patient-api-${Date.now()}@example.com`,
        password: "TestPass123!",
        firstName: "Patient",
        lastName: "API",
        role: "patient",
      }),
    });
    const data = await res.json();
    patientToken = data.token;
    patientId = data.user.id;
  });

  describe("GET /api/patient/dashboard", () => {
    it("returns patient dashboard data", async () => {
      const res = await fetch(`${BASE}/api/patient/dashboard`, {
        headers: { Authorization: `Bearer ${patientToken}` },
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toHaveProperty("quizHistory");
      expect(data).toHaveProperty("treatmentPlans");
      expect(data).toHaveProperty("appointments");
      expect(data).toHaveProperty("documents");
      expect(data).toHaveProperty("unreadMessages");
    });

    it("rejects unauthenticated request", async () => {
      const res = await fetch(`${BASE}/api/patient/dashboard`);
      expect(res.status).toBe(401);
    });
  });

  describe("POST /api/patient/documents/upload", () => {
    it("rejects upload without file", async () => {
      const res = await fetch(`${BASE}/api/patient/documents/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${patientToken}` },
      });
      // Should fail because no file was provided
      expect([400, 500]).toContain(res.status);
    });
  });

  describe("GET /api/patient/messages/:partnerId", () => {
    it("returns empty messages for new conversation", async () => {
      const res = await fetch(`${BASE}/api/patient/messages/99999`, {
        headers: { Authorization: `Bearer ${patientToken}` },
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBe(0);
    });
  });
});

describe("NP Portal API", () => {
  let npToken: string;
  let npId: number;
  let patientToken: string;
  let patientId: number;

  beforeAll(async () => {
    // Register NP
    const npRes = await fetch(`${BASE}/api/portal/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: `np-api-${Date.now()}@example.com`,
        password: "TestPass123!",
        firstName: "NP",
        lastName: "Test",
        role: "np",
      }),
    });
    const npData = await npRes.json();
    npToken = npData.token;
    npId = npData.user.id;

    // Register patient
    const patRes = await fetch(`${BASE}/api/portal/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: `np-patient-${Date.now()}@example.com`,
        password: "TestPass123!",
        firstName: "Assigned",
        lastName: "Patient",
        role: "patient",
      }),
    });
    const patData = await patRes.json();
    patientToken = patData.token;
    patientId = patData.user.id;
  });

  describe("GET /api/np/dashboard", () => {
    it("returns NP dashboard data", async () => {
      const res = await fetch(`${BASE}/api/np/dashboard`, {
        headers: { Authorization: `Bearer ${npToken}` },
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toHaveProperty("patients");
      expect(data).toHaveProperty("activePlans");
      expect(data).toHaveProperty("upcomingAppointments");
    });

    it("rejects patient from accessing NP dashboard", async () => {
      const res = await fetch(`${BASE}/api/np/dashboard`, {
        headers: { Authorization: `Bearer ${patientToken}` },
      });
      expect(res.status).toBe(403);
    });
  });

  describe("POST /api/np/assign-patient", () => {
    it("assigns a patient to the NP", async () => {
      const res = await fetch(`${BASE}/api/np/assign-patient`, {
        method: "POST",
        headers: { Authorization: `Bearer ${npToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ patientId }),
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
    });
  });

  describe("POST /api/np/treatment-plans", () => {
    it("creates a treatment plan for assigned patient", async () => {
      const res = await fetch(`${BASE}/api/np/treatment-plans`, {
        method: "POST",
        headers: { Authorization: `Bearer ${npToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          hormoneType: "Estradiol",
          dosage: "0.5mg",
          frequency: "Once daily",
          duration: "3 months",
          startDate: new Date().toISOString(),
          instructions: "Apply topically",
        }),
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
    });
  });

  describe("GET /api/np/treatment-plans", () => {
    it("returns treatment plans for the NP", async () => {
      const res = await fetch(`${BASE}/api/np/treatment-plans`, {
        headers: { Authorization: `Bearer ${npToken}` },
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe("POST /api/np/appointments", () => {
    it("creates an appointment", async () => {
      const res = await fetch(`${BASE}/api/np/appointments`, {
        method: "POST",
        headers: { Authorization: `Bearer ${npToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          title: "Initial Consultation",
          scheduledAt: new Date(Date.now() + 86400000).toISOString(),
          duration: 30,
        }),
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
    });
  });

  describe("GET /api/np/appointments", () => {
    it("returns appointments for the NP", async () => {
      const res = await fetch(`${BASE}/api/np/appointments`, {
        headers: { Authorization: `Bearer ${npToken}` },
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe("POST /api/np/clinical-notes", () => {
    it("adds a clinical note for a patient", async () => {
      const res = await fetch(`${BASE}/api/np/clinical-notes`, {
        method: "POST",
        headers: { Authorization: `Bearer ${npToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ patientId, content: "Patient presents with hot flashes and sleep disturbance." }),
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
    });
  });

  describe("GET /api/np/patient/:patientId", () => {
    it("returns full patient detail", async () => {
      const res = await fetch(`${BASE}/api/np/patient/${patientId}`, {
        headers: { Authorization: `Bearer ${npToken}` },
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toHaveProperty("quizHistory");
      expect(data).toHaveProperty("documents");
      expect(data).toHaveProperty("treatmentPlans");
      expect(data).toHaveProperty("clinicalNotes");
    });
  });

  describe("Messaging between NP and Patient", () => {
    it("NP sends message to patient", async () => {
      const res = await fetch(`${BASE}/api/np/messages/send`, {
        method: "POST",
        headers: { Authorization: `Bearer ${npToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: patientId, content: "Hello, how are you feeling today?" }),
      });
      expect(res.status).toBe(200);
    });

    it("Patient can read messages from NP", async () => {
      const res = await fetch(`${BASE}/api/patient/messages/${npId}`, {
        headers: { Authorization: `Bearer ${patientToken}` },
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.length).toBeGreaterThan(0);
      expect(data[0].content).toBe("Hello, how are you feeling today?");
    });

    it("Patient sends reply to NP", async () => {
      const res = await fetch(`${BASE}/api/patient/messages/send`, {
        method: "POST",
        headers: { Authorization: `Bearer ${patientToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: npId, content: "I'm feeling better, thank you!" }),
      });
      expect(res.status).toBe(200);
    });

    it("NP can read patient reply", async () => {
      const res = await fetch(`${BASE}/api/np/messages/${patientId}`, {
        headers: { Authorization: `Bearer ${npToken}` },
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.length).toBe(2);
    });
  });
});

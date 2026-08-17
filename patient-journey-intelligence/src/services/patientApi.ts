// ============================================================
// Patient API Service — Patient Journey Intelligence
// Centralized patient data backend integration.
//
// Backend contract (FastAPI):
//   POST /api/v1/patients              → Register patient
//   GET  /api/v1/patients/{patient_id} → Get patient detail
//   GET  /api/v1/patients              → List patients
//
// In demo mode (NEXT_PUBLIC_DEMO_AUTH=true):
//   Falls back to centralized mock data — no backend call made.
//
// Configure via environment:
//   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
// ============================================================

import type {
  PatientRegistration,
  PatientRegistrationResponse,
  PatientDetail,
  PatientListItem,
} from "@/types/patient";

import {
  mockPatientList,
  mockPatientDetail,
  generateMockPatientDetail,
} from "@/lib/patientMockData";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

const isDemoMode =
  process.env.NEXT_PUBLIC_DEMO_AUTH === "true" ||
  process.env.NEXT_PUBLIC_DEMO_AUTH === undefined ||
  process.env.NEXT_PUBLIC_DEMO_AUTH === "";

const delay = (ms = 120) => new Promise<void>((res) => setTimeout(res, ms));

// ── Internal Helper ────────────────────────────────────────────

async function apiPost<TBody, TResponse>(
  path: string,
  body: TBody
): Promise<TResponse> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("Unable to connect to the service. Please try again.");
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail =
      typeof data.detail === "string" ? data.detail : undefined;
    throw new Error(detail ?? "An unexpected error occurred.");
  }
  return data as TResponse;
}

async function apiGet<TResponse>(path: string): Promise<TResponse> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    throw new Error("Unable to connect to the service. Please try again.");
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail =
      typeof data.detail === "string" ? data.detail : undefined;
    throw new Error(detail ?? "An unexpected error occurred.");
  }
  return data as TResponse;
}

// ── Patient API Functions ──────────────────────────────────────

/**
 * Register a new patient in the system.
 * In demo mode: returns a mock response after a short delay.
 */
export async function registerPatient(
  data: PatientRegistration
): Promise<PatientRegistrationResponse> {
  if (isDemoMode) {
    await delay(600);
    return {
      patient_id: data.patient_id,
      message: "Patient registered successfully.",
    };
  }
  return apiPost<PatientRegistration, PatientRegistrationResponse>(
    "/api/v1/patients",
    data
  );
}

/**
 * Get a patient's full detail including journey timeline and events.
 * In demo mode: returns centralized mock data.
 */
export async function getPatient(patientId: string): Promise<PatientDetail> {
  if (isDemoMode) {
    await delay(300);
    if (patientId === "PT-10001") {
      return mockPatientDetail;
    }
    return generateMockPatientDetail(patientId);
  }
  return apiGet<PatientDetail>(`/api/v1/patients/${patientId}`);
}

/**
 * Get the list of registered patients for this hospital.
 * In demo mode: returns centralized mock patient list.
 */
export async function getPatientList(): Promise<PatientListItem[]> {
  if (isDemoMode) {
    await delay(200);
    return mockPatientList;
  }
  return apiGet<PatientListItem[]>("/api/v1/patients");
}

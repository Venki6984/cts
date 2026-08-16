// ============================================================
// Patient types
// ============================================================

export type JourneyStage =
  | "Diagnosis"
  | "Prescription"
  | "Prior Authorization"
  | "Copay"
  | "First Fill";

export type RiskCategory = "LOW" | "MEDIUM" | "HIGH";

export type PatientOutcome = "Completed" | "Dropped" | "Active";

export interface RiskFactor {
  name: string;
  contribution: number; // 0–1
  description: string;
}

export interface Patient {
  patient_id: string;
  current_stage: JourneyStage;
  outcome: PatientOutcome;
  risk_score: number; // 0–100
  risk_category: RiskCategory;
  days_in_current_stage: number;
  risk_factors: RiskFactor[];
  region: string;
  insurance_type: string;
  diagnosis_type: string;
  provider_type: string;
  is_new_patient: boolean;
  diagnosis_month: string; // YYYY-MM
}

export interface PatientJourneyTimeline {
  stage: JourneyStage;
  status: "completed" | "current" | "pending" | "dropped";
  date?: string;
  days_taken?: number;
}

// ============================================================
// Canonical Mock Data — Internally Consistent Single Source of Truth
// ============================================================
// All pages receive data through api.ts from this canonical model.

import type {
  OverviewKPIs,
  FunnelData,
  CohortHeatmapCell,
  CohortComparison,
  LeakageDriver,
  StageLeakage,
  RegionalLeakage,
  LeakageDrawerData,
  SurvivalData,
  TrendPoint,
  OutcomeDistribution,
} from "@/types/analytics";

import type {
  RiskOverviewKPIs,
  RiskDistributionPoint,
  RiskPatient,
  PatientRiskDetail,
  GlobalSHAPImportance,
  PatientSHAPExplanation,
} from "@/types/risk";

import type { AIResponse } from "@/types/ai";

// ── Overview ─────────────────────────────────────────────────

export const mockOverviewKPIs: OverviewKPIs = {
  total_patients: 5000,
  first_fill_rate: 61.4,
  dropoff_rate: 38.6,
  high_risk_active: 312,
  revenue_at_risk: 5_100_000, // Estimated Overall Revenue at Risk
};

export const mockOutcomeDistribution: OutcomeDistribution[] = [
  { outcome: "Completed (First Fill)", count: 3070, percentage: 61.4 },
  { outcome: "Dropped Off",            count: 1618, percentage: 32.4 },
  { outcome: "Active (In Journey)",    count: 312,  percentage: 6.2  },
];

export const mockTrend: TrendPoint[] = [
  { period: "Jan 2024", dropoff_rate: 41.2, first_fill_rate: 58.8, patient_count: 580 },
  { period: "Feb 2024", dropoff_rate: 40.1, first_fill_rate: 59.9, patient_count: 610 },
  { period: "Mar 2024", dropoff_rate: 39.5, first_fill_rate: 60.5, patient_count: 625 },
  { period: "Apr 2024", dropoff_rate: 42.0, first_fill_rate: 58.0, patient_count: 590 },
  { period: "May 2024", dropoff_rate: 38.8, first_fill_rate: 61.2, patient_count: 645 },
  { period: "Jun 2024", dropoff_rate: 37.3, first_fill_rate: 62.7, patient_count: 660 },
  { period: "Jul 2024", dropoff_rate: 36.9, first_fill_rate: 63.1, patient_count: 670 },
  { period: "Aug 2024", dropoff_rate: 38.6, first_fill_rate: 61.4, patient_count: 620 },
];

// ── Funnel ───────────────────────────────────────────────────

export const mockFunnelData: FunnelData = {
  stages: [
    {
      stage: "Diagnosis",
      patient_count: 5000,
      conversion_rate: 100,
      dropoff_rate: 0,
      dropoff_count: 0,
      average_time_days: null,
    },
    {
      stage: "Prescription",
      patient_count: 4650,
      conversion_rate: 93.0,
      dropoff_rate: 7.0,
      dropoff_count: 350,
      average_time_days: 4.1,
    },
    {
      stage: "Prior Authorization",
      patient_count: 3799,
      conversion_rate: 81.7,
      dropoff_rate: 18.3,
      dropoff_count: 851,
      average_time_days: 12.8,
    },
    {
      stage: "Copay",
      patient_count: 3370,
      conversion_rate: 88.7,
      dropoff_rate: 11.3,
      dropoff_count: 429,
      average_time_days: 3.1,
    },
    {
      stage: "First Fill",
      patient_count: 3070,
      conversion_rate: 91.1,
      dropoff_rate: 8.9,
      dropoff_count: 300,
      average_time_days: 2.3,
    },
  ],
  total_entered: 5000,
  total_completed: 3070,
  overall_conversion: 61.4,
};

// ── Cohort ───────────────────────────────────────────────────

export const mockCohortHeatmap: CohortHeatmapCell[] = [
  { region: "Northeast", month: "2024-01", dropoff_rate: 35.2, patient_count: 230 },
  { region: "Northeast", month: "2024-02", dropoff_rate: 33.8, patient_count: 245 },
  { region: "Northeast", month: "2024-03", dropoff_rate: 34.5, patient_count: 238 },
  { region: "Northeast", month: "2024-04", dropoff_rate: 38.1, patient_count: 207 },
  { region: "Southeast", month: "2024-01", dropoff_rate: 42.3, patient_count: 285 },
  { region: "Southeast", month: "2024-02", dropoff_rate: 44.7, patient_count: 278 },
  { region: "Southeast", month: "2024-03", dropoff_rate: 43.1, patient_count: 292 },
  { region: "Southeast", month: "2024-04", dropoff_rate: 46.2, patient_count: 245 },
  { region: "Midwest",   month: "2024-01", dropoff_rate: 38.9, patient_count: 264 },
  { region: "Midwest",   month: "2024-02", dropoff_rate: 37.4, patient_count: 272 },
  { region: "Midwest",   month: "2024-03", dropoff_rate: 36.8, patient_count: 280 },
  { region: "Midwest",   month: "2024-04", dropoff_rate: 39.5, patient_count: 234 },
  { region: "Southwest", month: "2024-01", dropoff_rate: 41.0, patient_count: 238 },
  { region: "Southwest", month: "2024-02", dropoff_rate: 39.6, patient_count: 245 },
  { region: "Southwest", month: "2024-03", dropoff_rate: 40.8, patient_count: 241 },
  { region: "Southwest", month: "2024-04", dropoff_rate: 43.2, patient_count: 226 },
  { region: "West",      month: "2024-01", dropoff_rate: 36.1, patient_count: 250 },
  { region: "West",      month: "2024-02", dropoff_rate: 35.4, patient_count: 258 },
  { region: "West",      month: "2024-03", dropoff_rate: 34.9, patient_count: 265 },
  { region: "West",      month: "2024-04", dropoff_rate: 37.8, patient_count: 207 },
];

export const mockCohortComparisons: CohortComparison[] = [
  { label: "New Patients",      patient_count: 2200, first_fill_rate: 57.3, dropoff_rate: 42.7, avg_days_to_fill: 24.6 },
  { label: "Existing Patients", patient_count: 2800, first_fill_rate: 64.8, dropoff_rate: 35.2, avg_days_to_fill: 18.3 },
  { label: "Commercial",        patient_count: 2800, first_fill_rate: 67.2, dropoff_rate: 32.8, avg_days_to_fill: 16.4 },
  { label: "Medicare",          patient_count: 1100, first_fill_rate: 58.4, dropoff_rate: 41.6, avg_days_to_fill: 22.8 },
  { label: "Medicaid",          patient_count: 700,  first_fill_rate: 49.6, dropoff_rate: 50.4, avg_days_to_fill: 31.2 },
  { label: "Self-Pay",          patient_count: 400,  first_fill_rate: 44.3, dropoff_rate: 55.7, avg_days_to_fill: null },
];

// ── Leakage ──────────────────────────────────────────────────

export const mockLeakageDrivers: LeakageDriver[] = [
  {
    driver: "PA Processing Delay",
    impact: "HIGH",
    affected_patients: 1240,
    confidence: 0.94,
    hazard_ratio: 2.41,
    p_value: 0.0001,
    confidence_interval: [2.18, 2.66],
    effect_size: 0.68,
    stage: "Prior Authorization",
  },
  {
    driver: "Previous PA Rejection",
    impact: "HIGH",
    affected_patients: 890,
    confidence: 0.91,
    hazard_ratio: 2.18,
    p_value: 0.0003,
    confidence_interval: [1.92, 2.47],
    effect_size: 0.57,
    stage: "Prior Authorization",
  },
  {
    driver: "High Copay Burden",
    impact: "MEDIUM",
    affected_patients: 560,
    confidence: 0.86,
    hazard_ratio: 1.74,
    p_value: 0.0021,
    confidence_interval: [1.48, 2.05],
    effect_size: 0.42,
    stage: "Copay",
  },
  {
    driver: "Insurance Coverage Gap",
    impact: "MEDIUM",
    affected_patients: 430,
    confidence: 0.82,
    hazard_ratio: 1.58,
    p_value: 0.0048,
    confidence_interval: [1.32, 1.89],
    effect_size: 0.38,
    stage: "Prescription",
  },
  {
    driver: "Lack of Support Program Enrollment",
    impact: "LOW",
    affected_patients: 310,
    confidence: 0.77,
    hazard_ratio: 1.34,
    p_value: 0.0142,
    confidence_interval: [1.11, 1.62],
    effect_size: 0.24,
    stage: "Copay",
  },
];

export const mockStageLeakage: StageLeakage[] = [
  { stage: "Prescription",        dropoff_rate: 7.0,  dropoff_count: 350,  top_driver: "Insurance Coverage Gap",  revenue_at_risk: 720_000  },
  { stage: "Prior Authorization", dropoff_rate: 18.3, dropoff_count: 851,  top_driver: "PA Processing Delay",     revenue_at_risk: 2_100_000},
  { stage: "Copay",               dropoff_rate: 11.3, dropoff_count: 429,  top_driver: "High Copay Burden",       revenue_at_risk: 890_000  },
  { stage: "First Fill",          dropoff_rate: 8.9,  dropoff_count: 300,  top_driver: "Pharmacy Access Issues",  revenue_at_risk: 570_000  },
];

export const mockRegionalLeakage: RegionalLeakage[] = [
  { region: "Southeast", dropoff_rate: 44.1, patient_count: 1100, revenue_at_risk: 1_620_000 },
  { region: "Southwest", dropoff_rate: 41.2, patient_count: 950,  revenue_at_risk: 1_280_000 },
  { region: "Midwest",   dropoff_rate: 38.2, patient_count: 1050, revenue_at_risk: 1_040_000 },
  { region: "West",      dropoff_rate: 36.1, patient_count: 980,  revenue_at_risk: 910_000   },
  { region: "Northeast", dropoff_rate: 35.4, patient_count: 920,  revenue_at_risk: 850_000   },
];

export const mockLeakageDrawerData: LeakageDrawerData = {
  stage: "Prior Authorization",
  patients_affected: 851,
  dropoff_rate: 18.3,
  avg_stage_duration_days: 12.8,
  top_regions: mockRegionalLeakage.slice(0, 3),
  top_cohorts: mockCohortComparisons.slice(0, 3),
  top_drivers: mockLeakageDrivers.slice(0, 3),
  revenue_at_risk: 2_100_000,
  recommended_action:
    "Assign dedicated PA specialists to follow up with payers on submissions pending >7 days. Enroll eligible commercial patients in bridge co-pay programs.",
};

// ── Survival ─────────────────────────────────────────────────

function generateKMCurve(
  group: string,
  baseSurvival: number,
  decayRate: number
): import("@/types/analytics").SurvivalPoint[] {
  const points = [];
  for (let day = 0; day <= 90; day += 5) {
    points.push({
      time: day,
      survival_probability: Math.max(
        0,
        baseSurvival * Math.exp(-decayRate * day) + (1 - baseSurvival) * 0.1
      ),
      group,
    });
  }
  return points;
}

export const mockSurvivalData: SurvivalData = {
  curves: [
    ...generateKMCurve("Overall",    1.0,  0.018),
    ...generateKMCurve("Commercial", 1.0,  0.014),
    ...generateKMCurve("Medicaid",   1.0,  0.026),
    ...generateKMCurve("Medicare",   1.0,  0.022),
  ],
  median_survival_days: 38,
  key_timepoints: [
    { days: 14, probability: 0.82, label: "2 weeks" },
    { days: 30, probability: 0.68, label: "1 month"  },
    { days: 60, probability: 0.48, label: "2 months" },
    { days: 90, probability: 0.34, label: "3 months" },
  ],
  groups: ["Overall", "Commercial", "Medicaid", "Medicare"],
};

// ── Risk (Canonical Partition: 312 + 580 + 1038 = 1,930 Active)

export const mockRiskKPIs: RiskOverviewKPIs = {
  active_patients: 1930, // Total active in-progress population
  high_risk: 312,        // High Risk (Score >= 70)
  medium_risk: 580,      // Medium Risk (Score 40-69)
  low_risk: 1038,        // Low Risk (Score < 40)
};

export const mockRiskDistribution: RiskDistributionPoint[] = [
  { category: "LOW",    count: 1038, percentage: 53.8 },
  { category: "MEDIUM", count: 580,  percentage: 30.1 },
  { category: "HIGH",   count: 312,  percentage: 16.2 },
];

export const mockRiskPatients: RiskPatient[] = Array.from({ length: 40 }, (_, i) => {
  const stages = ["Prior Authorization", "Copay", "Prescription"] as const;
  const drivers = [
    "PA Processing Delay",
    "Previous PA Rejection",
    "High Copay Burden",
    "Insurance Coverage Gap",
  ];
  const regions = ["Southeast", "Southwest", "Midwest", "West", "Northeast"];
  const insurances = ["Medicaid", "Medicare", "Commercial", "Self-Pay"];

  // Subject PT-10001 is fixed as the canonical high-risk demo patient
  if (i === 0) {
    return {
      patient_id: "PT-10001",
      current_stage: "Prior Authorization",
      days_in_current_stage: 14,
      risk_score: 91,
      risk_category: "HIGH",
      top_risk_driver: "PA Processing Delay",
      region: "Southeast",
      insurance_type: "Medicaid",
    };
  }

  if (i === 1) {
    return {
      patient_id: "PT-10002",
      current_stage: "Prior Authorization",
      days_in_current_stage: 12,
      risk_score: 84,
      risk_category: "HIGH",
      top_risk_driver: "Previous PA Rejection",
      region: "Southwest",
      insurance_type: "Medicare",
    };
  }

  const riskScore = i < 12 ? 74 + ((i * 3) % 20) : 35 + ((i * 5) % 36);
  const category = riskScore >= 70 ? "HIGH" : riskScore >= 40 ? "MEDIUM" : "LOW";

  return {
    patient_id: `PT-${String(10001 + i).padStart(5, "0")}`,
    current_stage: stages[i % 3],
    days_in_current_stage: 4 + ((i * 3) % 18),
    risk_score: riskScore,
    risk_category: category,
    top_risk_driver: drivers[i % 4],
    region: regions[i % 5],
    insurance_type: insurances[i % 4],
  };
});

// Canonical PT-10001 Detail
export const mockPatientRiskDetail: PatientRiskDetail = {
  patient_id: "PT-10001",
  risk_score: 91,
  risk_category: "HIGH",
  current_stage: "Prior Authorization",
  days_in_current_stage: 14,
  risk_factors: [
    { name: "PA Processing Delay",   contribution: 0.38, description: "PA submission has been pending for 14 days, exceeding the 10-day benchmark." },
    { name: "Previous PA Rejection", contribution: 0.27, description: "Patient has a documented history of prior PA rejections." },
    { name: "Payer Category (Medicaid)", contribution: 0.18, description: "State Medicaid plan associated with higher administrative review latency." },
    { name: "Support Bridge Enrolled", contribution: -0.08, description: "Active co-pay card registration provides a protective retention buffer." },
  ],
  journey_timeline: [
    { stage: "Diagnosis",           status: "completed", date: "2024-06-01", days_taken: 0  },
    { stage: "Prescription",        status: "completed", date: "2024-06-05", days_taken: 4  },
    { stage: "Prior Authorization", status: "current",   date: "2024-06-19", days_taken: 14 },
    { stage: "Copay",               status: "pending"  },
    { stage: "First Fill",          status: "pending"  },
  ],
  recommended_action:
    "Prioritize PA follow-up and deploy patient services specialist for outreach within 24 hours. Verify copay bridge program activation before next cycle.",
  estimated_revenue_at_risk: 31_200,
};

// ── SHAP ─────────────────────────────────────────────────────

export const mockGlobalSHAP: GlobalSHAPImportance[] = [
  { feature: "PA Processing Delay",              mean_abs_shap: 0.38, rank: 1 },
  { feature: "Previous PA Rejection",            mean_abs_shap: 0.27, rank: 2 },
  { feature: "Copay Amount",                     mean_abs_shap: 0.18, rank: 3 },
  { feature: "Insurance Type",                   mean_abs_shap: 0.14, rank: 4 },
  { feature: "Region",                           mean_abs_shap: 0.11, rank: 5 },
  { feature: "Days Since Diagnosis",             mean_abs_shap: 0.09, rank: 6 },
  { feature: "Support Program Enrolled",         mean_abs_shap: 0.08, rank: 7 },
  { feature: "Provider Type",                    mean_abs_shap: 0.06, rank: 8 },
  { feature: "Prior Fill History",               mean_abs_shap: 0.05, rank: 9 },
  { feature: "Specialty Pharmacy Assignment",    mean_abs_shap: 0.04, rank: 10 },
];

export const mockPatientSHAP: PatientSHAPExplanation = {
  patient_id: "PT-10001",
  base_value: 0.38,
  predicted_risk: 0.91,
  features: [
    { feature: "Stage Elapsed Duration",   contribution: +0.31, direction: "positive", display_value: "14 days (Delayed)" },
    { feature: "Previous PA Rejection",    contribution: +0.24, direction: "positive", display_value: "Yes (Documented)"   },
    { feature: "Payer Category (Medicaid)",contribution: +0.18, direction: "positive", display_value: "Medicaid"          },
    { feature: "Regional Delay Index",     contribution: +0.12, direction: "positive", display_value: "Southeast"         },
    { feature: "Support Program Enrolled", contribution: -0.08, direction: "negative", display_value: "Enrolled"          },
    { feature: "Prior Fill History",       contribution: -0.05, direction: "negative", display_value: "1 Prior"           },
  ],
  plain_english_summary:
    "The model assigns this patient an elevated 91% drop-off risk primarily because of extended PA processing time (14 days, exceeding the 10-day benchmark), prior rejection history, and Medicaid payer friction in the Southeast region. This is partially offset by active support program enrollment.",
};

// ── AI ───────────────────────────────────────────────────────

export const mockAIResponses: Record<string, AIResponse> = {
  default: {
    answer:
      "Prior Authorization is the primary journey bottleneck, experiencing 18.3% leakage (851 patients dropped). Top root drivers are processing delays exceeding 10 days and prior rejections.",
    suggested_actions: [
      "Triage high-risk patients waiting in Prior Authorization",
      "Investigate Southeast regional leakage drivers",
      "Deploy copay assistance support programs",
    ],
  },
};

"use client";

import React from "react";
import { Drawer } from "@/components/common/Drawer";
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatCurrency, formatNumber } from "@/lib/utils";
import type { PatientRiskDetail } from "@/types/risk";
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  Lightbulb,
  DollarSign,
  Activity,
  ArrowRight,
  Info,
} from "lucide-react";
import Link from "next/link";

// ============================================================
// PatientRiskDrawer — Patient Triage & Explainability Drawer
// ============================================================

interface PatientRiskDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  patientDetail: PatientRiskDetail | null;
  loading?: boolean;
}

export function PatientRiskDrawer({
  isOpen,
  onClose,
  patientDetail,
  loading,
}: PatientRiskDrawerProps) {
  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={patientDetail ? `Patient Triage: ${patientDetail.patient_id}` : "Patient Risk Details"}
      subtitle="Operational risk explanation and recommended intervention pathway"
      id="patient-risk-drawer"
      width={500}
    >
      {loading || !patientDetail ? (
        <PatientRiskSkeleton />
      ) : (
        <PatientRiskContent data={patientDetail} onClose={onClose} />
      )}
    </Drawer>
  );
}

function PatientRiskContent({
  data,
  onClose,
}: {
  data: PatientRiskDetail;
  onClose: () => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* ── Top Summary Grid ────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div
          style={{
            padding: "12px 14px",
            background: "var(--color-bg)",
            border: "1px solid var(--color-border)",
            borderRadius: 8,
          }}
        >
          <span className="text-kpi-label">Risk Category</span>
          <div style={{ marginTop: 6 }}>
            <StatusBadge
              label={`${data.risk_category} (${data.risk_score}%)`}
              variant="risk"
              riskCategory={data.risk_category}
            />
          </div>
        </div>

        <div
          style={{
            padding: "12px 14px",
            background: "var(--color-bg)",
            border: "1px solid var(--color-border)",
            borderRadius: 8,
          }}
        >
          <span className="text-kpi-label">Current Stage</span>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--color-text-primary)", marginTop: 4 }}>
            {data.current_stage}
          </div>
          <div className="text-meta" style={{ marginTop: 2 }}>
            {data.days_in_current_stage} days elapsed
          </div>
        </div>

        <div
          style={{
            padding: "12px 14px",
            background: "var(--color-bg)",
            border: "1px solid var(--color-border)",
            borderRadius: 8,
          }}
        >
          <span className="text-kpi-label">Estimated Revenue at Risk</span>
          <div style={{ fontSize: 18, fontWeight: 700, color: "var(--color-danger)", marginTop: 4 }}>
            {formatCurrency(data.estimated_revenue_at_risk)}
          </div>
        </div>

        <div
          style={{
            padding: "12px 14px",
            background: "var(--color-bg)",
            border: "1px solid var(--color-border)",
            borderRadius: 8,
          }}
        >
          <span className="text-kpi-label">Model Confidence</span>
          <div style={{ fontSize: 18, fontWeight: 700, color: "var(--color-primary)", marginTop: 4 }}>
            94.2%
          </div>
        </div>
      </div>

      {/* ── Journey Stage Progression Timeline ──────────────── */}
      <div>
        <h3
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--color-text-secondary)",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            marginBottom: 12,
          }}
        >
          Journey Timeline &amp; Milestone Progression
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { stage: "Diagnosis", status: "completed", days: "0d", icon: CheckCircle2, color: "var(--color-success)" },
            { stage: "Prescription", status: "completed", days: "4d", icon: CheckCircle2, color: "var(--color-success)" },
            { stage: "Prior Authorization", status: "current", days: `${data.days_in_current_stage}d (Delayed)`, icon: AlertTriangle, color: "var(--color-danger)" },
            { stage: "Copay", status: "pending", days: "—", icon: Clock, color: "var(--color-text-muted)" },
            { stage: "First Fill", status: "pending", days: "—", icon: Clock, color: "var(--color-text-muted)" },
          ].map((step) => {
            const Icon = step.icon;
            const isCurrent = step.status === "current";
            return (
              <div
                key={step.stage}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "9px 12px",
                  borderRadius: 6,
                  background: isCurrent ? "var(--color-danger-bg)" : step.status === "completed" ? "var(--color-bg)" : "transparent",
                  border: isCurrent ? "1px solid #FECACA" : "1px solid var(--color-border)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Icon size={14} color={step.color} />
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: isCurrent ? 700 : 500,
                      color: step.status === "pending" ? "var(--color-text-muted)" : "var(--color-text-primary)",
                    }}
                  >
                    {step.stage}
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="text-meta" style={{ fontWeight: isCurrent ? 700 : 400, color: isCurrent ? "var(--color-danger)" : "var(--color-text-secondary)" }}>
                    {step.days}
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      color: isCurrent ? "var(--color-danger)" : step.status === "completed" ? "var(--color-success)" : "var(--color-text-muted)",
                    }}
                  >
                    {step.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Key Risk Factors (SHAP Drivers) ────────────────── */}
      <div>
        <h3
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--color-text-secondary)",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            marginBottom: 10,
          }}
        >
          Contributing Risk Factors
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {data.risk_factors.map((factor) => {
            const isPositive = factor.contribution > 0;
            return (
              <div
                key={factor.name}
                style={{
                  padding: "10px 12px",
                  borderRadius: 6,
                  background: "var(--color-bg)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 4,
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)" }}>
                    {factor.name}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: isPositive ? "var(--color-danger)" : "var(--color-success)",
                    }}
                  >
                    {isPositive ? `+${(factor.contribution * 100).toFixed(0)}% risk shift` : `${(factor.contribution * 100).toFixed(0)}% protective`}
                  </span>
                </div>
                <p className="text-meta" style={{ margin: 0 }}>
                  {factor.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── WHY THIS PATIENT IS AT RISK ─────────────────────── */}
      <div
        style={{
          padding: "12px 14px",
          background: "var(--color-bg)",
          borderRadius: 8,
          border: "1px solid var(--color-border)",
        }}
      >
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-danger)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>
          Why This Patient is Considered High Risk
        </div>
        <p className="text-meta" style={{ margin: 0, color: "var(--color-text-primary)", lineHeight: 1.5 }}>
          Patient has exceeded the 10-day median PA processing window by 4 days in a high-rejection region. Without proactive case specialist follow-up, the probability of drop-off before Copay enrollment is 89%.
        </p>
      </div>

      {/* ── RECOMMENDED ACTION ───────────────────────────────── */}
      <div>
        <h3
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--color-text-secondary)",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            marginBottom: 8,
          }}
        >
          Recommended Business Action
        </h3>
        <div
          style={{
            padding: "12px 14px",
            background: "var(--color-primary-light)",
            borderRadius: 8,
            border: "1px solid #BFDBFE",
            display: "flex",
            gap: 10,
          }}
        >
          <Lightbulb size={16} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <p style={{ fontSize: 13, lineHeight: 1.5, color: "var(--color-primary-dark)", margin: "0 0 6px" }}>
              {data.recommended_action}
            </p>
            <p className="text-meta" style={{ fontSize: 11, color: "var(--color-text-muted)", margin: 0 }}>
              * Business analytics recommendation for patient services, not a clinical decision.
            </p>
          </div>
        </div>
      </div>

      {/* ── Deep Dive Link to SHAP ─────────────────────────── */}
      <Link
        href="/shap"
        onClick={onClose}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 14px",
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: 8,
          textDecoration: "none",
          color: "var(--color-primary)",
          fontSize: 13,
          fontWeight: 600,
        }}
      >
        <span>View Full SHAP Feature Importance Waterfall</span>
        <ArrowRight size={14} />
      </Link>
    </div>
  );
}

function PatientRiskSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="skeleton-pulse" style={{ height: 60, borderRadius: 8 }} />
        ))}
      </div>
      <div className="skeleton-pulse" style={{ height: 140, borderRadius: 8 }} />
      <div className="skeleton-pulse" style={{ height: 120, borderRadius: 8 }} />
    </div>
  );
}

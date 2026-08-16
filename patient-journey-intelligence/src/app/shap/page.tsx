"use client";

import React, { useEffect, useState, useCallback } from "react";
import { getGlobalSHAP, getPatientSHAP } from "@/lib/api";
import type { GlobalSHAPImportance, PatientSHAPExplanation } from "@/types/risk";

import { Card } from "@/components/common/Card";
import { ErrorState } from "@/components/common/ErrorState";
import { ChartSkeleton } from "@/components/common/LoadingSkeleton";
import { StatusBadge } from "@/components/common/StatusBadge";
import { GlobalSHAPChart } from "@/components/shap/GlobalSHAPChart";
import { PatientSHAPWaterfall } from "@/components/shap/PatientSHAPWaterfall";
import { User, Sparkles } from "lucide-react";
import { useDatasetStore } from "@/store/datasetStore";
import { useFilterStore } from "@/store/filterStore";

// ============================================================
// Page 7 — Explainability (Model Transparency)
// Purpose: "Understand the factors contributing to the model's risk prediction."
// ============================================================

export default function ShapPage() {
  const [globalData, setGlobalData] = useState<GlobalSHAPImportance[]>([]);
  const [patientData, setPatientData] = useState<PatientSHAPExplanation | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState("PT-10001");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const { metadata } = useDatasetStore();
  const lastUpdated = metadata.last_updated;
  const { region, diagnosis, insurance, provider, newExisting } = useFilterStore();

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const [globalRes, patientRes] = await Promise.all([
        getGlobalSHAP(),
        getPatientSHAP(selectedPatientId),
      ]);
      setGlobalData(globalRes);
      setPatientData(patientRes);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [selectedPatientId]);

  useEffect(() => {
    load();
  }, [load, lastUpdated, region, diagnosis, insurance, provider, newExisting]);

  if (error) return <ErrorState onRetry={load} />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* ── Page Header Controls ────────────────────────────── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1 className="text-page-title">Why Is This Patient At Risk?</h1>
          <p className="text-body" style={{ color: "var(--color-text-secondary)", marginTop: 4 }}>
            Understand the factors contributing to the model's risk prediction.
          </p>
        </div>

        {/* Patient Selector */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <User size={16} color="var(--color-teal)" />
          <span className="text-meta" style={{ fontWeight: 600 }}>Select Patient:</span>
          <select
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            style={{
              padding: "7px 14px",
              fontSize: 13,
              fontWeight: 700,
              borderRadius: "var(--control-radius)",
              border: "1px solid var(--color-teal)",
              background: "var(--color-primary-light)",
              color: "var(--color-teal)",
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value="PT-10001">PT-10001 (High Risk — 91%)</option>
            <option value="PT-10002">PT-10002 (High Risk — 84%)</option>
            <option value="PT-10003">PT-10003 (Medium Risk — 54%)</option>
            <option value="PT-10004">PT-10004 (Low Risk — 28%)</option>
          </select>
        </div>
      </div>

      {/* ── Patient Risk Score Summary Header Card ───────────── */}
      {patientData && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "14px 20px",
            background: "var(--color-surface)",
            borderRadius: 8,
            border: "1px solid var(--color-border)",
            borderLeft: `4px solid ${patientData.predicted_risk >= 0.7 ? "var(--color-danger)" : patientData.predicted_risk >= 0.4 ? "var(--color-warning)" : "var(--color-success)"}`,
            flexWrap: "wrap",
            gap: 14,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div>
              <span className="text-meta">Subject ID</span>
              <div style={{ fontSize: 17, fontWeight: 700, color: "var(--color-navy)", marginTop: 2 }}>
                {patientData.patient_id}
              </div>
            </div>

            <div style={{ height: 26, width: 1, background: "var(--color-border)" }} />

            <div>
              <span className="text-meta">Model Predicted Risk</span>
              <div style={{ fontSize: 19, fontWeight: 700, color: patientData.predicted_risk >= 0.7 ? "var(--color-danger)" : "var(--color-warning)", marginTop: 2 }}>
                {(patientData.predicted_risk * 100).toFixed(0)}%
              </div>
            </div>

            <div style={{ height: 26, width: 1, background: "var(--color-border)" }} />

            <div>
              <span className="text-meta">Risk Category</span>
              <div style={{ marginTop: 3 }}>
                <StatusBadge
                  label={patientData.predicted_risk >= 0.7 ? "HIGH" : patientData.predicted_risk >= 0.4 ? "MEDIUM" : "LOW"}
                  variant="risk"
                  riskCategory={patientData.predicted_risk >= 0.7 ? "HIGH" : patientData.predicted_risk >= 0.4 ? "MEDIUM" : "LOW"}
                />
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--color-text-secondary)", fontSize: 12 }}>
            <Sparkles size={14} color="var(--color-teal)" />
            <span>TreeSHAP additive attribution verified</span>
          </div>
        </div>
      )}

      {/* ── MAIN: Patient Risk Attribution Waterfall ─────────── */}
      {loading || !patientData ? (
        <ChartSkeleton height={380} />
      ) : (
        <Card
          title={`Individual Feature Contributions: ${patientData.patient_id}`}
          subtitle="Feature attribution showing how clinical, operational, and payer features pushed risk relative to baseline"
        >
          <PatientSHAPWaterfall explanation={patientData} />
        </Card>
      )}

      {/* ── GLOBAL VIEW: Feature Importance Section ──────────── */}
      {loading ? (
        <ChartSkeleton height={340} />
      ) : (
        <Card
          title="Global Model Drivers"
          subtitle="Shows which features contribute most strongly to model predictions across the analyzed 5,000-patient population"
        >
          <GlobalSHAPChart data={globalData} />
        </Card>
      )}
    </div>
  );
}

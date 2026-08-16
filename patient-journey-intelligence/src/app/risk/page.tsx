"use client";

import React, { useEffect, useState, useCallback } from "react";
import { getRiskOverview, getRiskPatients, getPatientRisk } from "@/lib/api";
import type { RiskOverviewKPIs, RiskDistributionPoint, RiskPatient, PatientRiskDetail } from "@/types/risk";

import { FilterBar } from "@/components/common/FilterBar";
import { Card } from "@/components/common/Card";
import { KPICard } from "@/components/common/KPICard";
import { ErrorState } from "@/components/common/ErrorState";
import { KPIGridSkeleton, ChartSkeleton } from "@/components/common/LoadingSkeleton";
import { RiskDistributionChart } from "@/components/risk/RiskDistributionChart";
import { RiskTable } from "@/components/risk/RiskTable";
import { PatientRiskDrawer } from "@/components/risk/PatientRiskDrawer";
import { formatNumber } from "@/lib/utils";
import { AlertTriangle, Users, ShieldAlert, ShieldCheck } from "lucide-react";
import { useDatasetStore } from "@/store/datasetStore";
import { useFilterStore } from "@/store/filterStore";

// ============================================================
// Page 6 — Journey Risk Monitor (Operational Intervention Queue)
// Purpose: "Identify active patients who may drop next."
// ============================================================

export default function RiskMonitorPage() {
  const [kpis, setKpis] = useState<RiskOverviewKPIs | null>(null);
  const [distribution, setDistribution] = useState<RiskDistributionPoint[]>([]);
  const [patients, setPatients] = useState<RiskPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const lastUpdated = useDatasetStore((s) => s.metadata.last_updated);
  const { region, diagnosis, insurance, provider, newExisting } = useFilterStore();

  // Selected patient state for drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<PatientRiskDetail | null>(null);
  const [drawerLoading, setDrawerLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const [overviewRes, patientList] = await Promise.all([
        getRiskOverview(),
        getRiskPatients(),
      ]);
      setKpis(overviewRes.kpis);
      setDistribution(overviewRes.distribution);
      setPatients(patientList);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load, lastUpdated, region, diagnosis, insurance, provider, newExisting]);

  const handleSelectPatient = async (patientId: string) => {
    setDrawerOpen(true);
    setDrawerLoading(true);
    try {
      const detail = await getPatientRisk(patientId);
      setSelectedPatient(detail);
    } catch {
      // drawer displays skeleton
    } finally {
      setDrawerLoading(false);
    }
  };

  if (error) return <ErrorState onRetry={load} />;

  return (
    <>
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
            <h1 className="text-page-title">Journey Risk Monitor</h1>
            <p
              className="text-body"
              style={{ color: "var(--color-text-secondary)", marginTop: 4 }}
            >
              Identify active patients who may drop next.
            </p>
          </div>
          <FilterBar show={["region", "insurance", "newExisting"]} />
        </div>

        {/* ── KPI Row (Active Patient Partition) ──────────────── */}
        {loading || !kpis ? (
          <KPIGridSkeleton count={4} />
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 12,
            }}
          >
            <KPICard
              label="Active Patients"
              value={formatNumber(kpis.active_patients)}
              deltaLabel="in journey pipeline"
              icon={<Users size={16} />}
              tone="default"
            />
            <KPICard
              label="High Risk (Score ≥ 70)"
              value={formatNumber(kpis.high_risk)}
              deltaLabel="immediate attention"
              icon={<ShieldAlert size={16} />}
              tone="danger"
            />
            <KPICard
              label="Medium Risk (Score 40–69)"
              value={formatNumber(kpis.medium_risk)}
              deltaLabel="monitor & evaluate"
              icon={<AlertTriangle size={16} />}
              tone="warning"
            />
            <KPICard
              label="Low Risk (Score < 40)"
              value={formatNumber(kpis.low_risk)}
              deltaLabel="routine tracking"
              icon={<ShieldCheck size={16} />}
              tone="success"
            />
          </div>
        )}

        {/* ── Row: Risk Distribution + AI Risk Insights ───────── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 14,
          }}
        >
          {loading ? (
            <ChartSkeleton height={240} />
          ) : (
            <Card
              title="Active Risk Distribution"
              subtitle={`Breakdown of active pipeline (${kpis ? formatNumber(kpis.active_patients) : 1930} patients) by predicted drop-off propensity`}
            >
              <RiskDistributionChart data={distribution} />
            </Card>
          )}

          <Card
            title="Early Warning &amp; Triage Decision Rules"
            subtitle="Operational decision thresholds for patient services intervention workflows"
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: 6,
                  background: "var(--color-danger-bg)",
                  border: "1px solid #FECACA",
                }}
              >
                <div style={{ fontWeight: 700, color: "var(--color-danger)", fontSize: 13 }}>
                  HIGH RISK (Score ≥ 70)
                </div>
                <div className="text-meta" style={{ marginTop: 2, color: "var(--color-text-primary)" }}>
                  Immediate attention recommended. High probability of drop-off within 7 days due to extended PA processing delay or prior rejection history.
                </div>
              </div>

              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: 6,
                  background: "var(--color-warning-bg)",
                  border: "1px solid #FED7AA",
                }}
              >
                <div style={{ fontWeight: 700, color: "var(--color-warning)", fontSize: 13 }}>
                  MEDIUM RISK (Score 40–69)
                </div>
                <div className="text-meta" style={{ marginTop: 2, color: "var(--color-text-primary)" }}>
                  Monitor and evaluate intervention opportunities. Proactively assess copay assistance eligibility.
                </div>
              </div>

              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: 6,
                  background: "var(--color-success-bg)",
                  border: "1px solid #BBF7D0",
                }}
              >
                <div style={{ fontWeight: 700, color: "var(--color-success)", fontSize: 13 }}>
                  LOW RISK (Score &lt; 40)
                </div>
                <div className="text-meta" style={{ marginTop: 2, color: "var(--color-text-primary)" }}>
                  Continue routine monitoring. Standard automated fulfillment workflow progressing normally.
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* ── Priority Intervention Queue Table ────────────────── */}
        {loading ? (
          <ChartSkeleton height={320} />
        ) : (
          <Card
            title="Priority Intervention Queue"
            subtitle="Sorted by highest drop-off risk score. Click any patient to inspect their journey timeline and SHAP explanation."
          >
            <RiskTable
              patients={patients}
              onSelectPatient={handleSelectPatient}
            />
          </Card>
        )}
      </div>

      {/* ── Patient Risk Detail Drawer ────────────────────────── */}
      <PatientRiskDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        patientDetail={selectedPatient}
        loading={drawerLoading}
      />
    </>
  );
}

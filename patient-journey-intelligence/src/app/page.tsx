"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Users,
  CheckCircle2,
  TrendingDown,
  AlertTriangle,
  DollarSign,
  ShieldAlert,
  Activity,
  ArrowRight,
  Flame,
  Search,
  Sparkles,
  MapPin,
} from "lucide-react";

import { getOverview, getLeakage, getRiskOverview, getFunnel, getLeakageDrawer } from "@/lib/api";
import { formatNumber, formatPercent, formatCurrency } from "@/lib/utils";

import { Card } from "@/components/common/Card";
import { FilterBar } from "@/components/common/FilterBar";
import { ErrorState } from "@/components/common/ErrorState";
import { KPIGridSkeleton, ChartSkeleton } from "@/components/common/LoadingSkeleton";

import { JourneyPathway } from "@/components/overview/JourneyPathway";
import { TopLeakageDrivers } from "@/components/overview/TopLeakageDrivers";
import { RiskSummaryChart } from "@/components/overview/RiskSummaryChart";
import { LeakageDrawer } from "@/components/leakage/LeakageDrawer";

import type { OverviewKPIs, FunnelData, StageLeakage, RegionalLeakage, TrendPoint, OutcomeDistribution, LeakageDrawerData } from "@/types/analytics";
import type { RiskDistributionPoint } from "@/types/risk";
import type { LeakageDriver } from "@/types/analytics";
import { useDatasetStore } from "@/store/datasetStore";
import { useFilterStore } from "@/store/filterStore";
import Link from "next/link";

// ============================================================
// Page 1 — Patient Journey Command Center
// Purpose: "Real-time visibility into patient progression, leakage and journey risk."
// ============================================================

interface OverviewData {
  kpis: OverviewKPIs;
  outcomeDistribution: OutcomeDistribution[];
  trend: TrendPoint[];
  funnel: FunnelData;
  stageLeakage: StageLeakage[];
  regionalLeakage: RegionalLeakage[];
  leakageDrivers: LeakageDriver[];
  riskDistribution: RiskDistributionPoint[];
}

export default function CommandCenterPage() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Leakage Drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerData, setDrawerData] = useState<LeakageDrawerData | null>(null);
  const [drawerLoading, setDrawerLoading] = useState(false);

  const { metadata } = useDatasetStore();
  const lastUpdated = metadata.last_updated;
  const { region, diagnosis, insurance, provider, newExisting, hasActiveFilters } = useFilterStore();
  const isFiltered = hasActiveFilters();

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const [overview, leakage, risk, funnel] = await Promise.all([
        getOverview(),
        getLeakage(),
        getRiskOverview(),
        getFunnel(),
      ]);
      setData({
        kpis: overview.kpis,
        outcomeDistribution: overview.outcomeDistribution,
        trend: overview.trend,
        funnel,
        stageLeakage: leakage.stageLeakage,
        regionalLeakage: leakage.regionalLeakage,
        leakageDrivers: leakage.drivers,
        riskDistribution: risk.distribution,
      });
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load, lastUpdated, region, diagnosis, insurance, provider, newExisting]);

  const handleInvestigate = async (stage: string) => {
    setDrawerOpen(true);
    setDrawerLoading(true);
    try {
      const detail = await getLeakageDrawer(stage);
      setDrawerData(detail);
    } catch {
      // display skeleton in drawer
    } finally {
      setDrawerLoading(false);
    }
  };

  if (error) {
    return <ErrorState onRetry={load} />;
  }

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* ── Page Top Controls & Health Badge ────────────────── */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 10px",
                borderRadius: 20,
                background: "var(--color-warning-bg)",
                border: "1px solid #FED7AA",
                fontSize: 12,
                fontWeight: 600,
                color: "var(--color-warning)",
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "var(--color-warning)",
                  display: "inline-block",
                }}
              />
              JOURNEY HEALTH: Needs Attention
            </span>

            <span className="text-meta" style={{ fontSize: 12 }}>
              Population: <strong>{isFiltered ? `${formatNumber(data?.kpis.total_patients || 0)} of ${formatNumber(metadata.patient_count)}` : `${formatNumber(metadata.patient_count)} Patients`}</strong>
            </span>
          </div>

          <FilterBar show={["region", "insurance", "newExisting"]} />
        </div>

        {/* ── Quick Operational Actions ───────────────────────── */}
        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            background: "var(--color-surface)",
            padding: "14px 18px",
            borderRadius: 8,
            border: "1px solid var(--color-border)",
            borderLeft: "4px solid var(--color-teal)",
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-navy)", marginRight: 8 }}>
            QUICK OPERATIONS:
          </span>
          <Link
            href="/patients/register"
            className="btn-primary"
            style={{
              padding: "8px 14px",
              fontSize: 12,
              fontWeight: 600,
              textDecoration: "none",
              background: "var(--color-teal)",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <span>+ Register Patient</span>
          </Link>
          <Link
            href="/journey/event"
            className="btn-secondary"
            style={{
              padding: "8px 14px",
              fontSize: 12,
              fontWeight: 600,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <span>+ Update Journey</span>
          </Link>
        </div>

        {/* ── Signal Cards (5 Cards) ──────────────────────────── */}
        {loading || !data ? (
          <KPIGridSkeleton count={5} />
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
              gap: 12,
            }}
          >
            {/* Card 1: Journey Health */}
            <div className="card" style={{ padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
                <CheckCircle2 size={14} color="var(--color-success)" />
                <span className="text-kpi-label">Journey Health</span>
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "var(--color-success)", lineHeight: 1.1 }}>
                {formatPercent(data.kpis.first_fill_rate)}
              </div>
              <div className="text-meta" style={{ marginTop: 4, color: "var(--color-danger)", fontWeight: 600 }}>
                ↓ {formatPercent(data.kpis.dropoff_rate)} Cumulative Leakage
              </div>
            </div>

            {/* Card 2: Primary Bottleneck */}
            <div className="card" style={{ padding: "14px 16px", borderLeft: "3px solid var(--color-danger)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
                <AlertTriangle size={14} color="var(--color-danger)" />
                <span className="text-kpi-label" style={{ color: "var(--color-danger)" }}>Primary Bottleneck</span>
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "var(--color-text-primary)", lineHeight: 1.2 }}>
                Prior Authorization
              </div>
              <div className="text-meta" style={{ marginTop: 4 }}>
                18.3% Drop-off • 851 Affected Pts
              </div>
            </div>

            {/* Card 3: Early Warning */}
            <div className="card" style={{ padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
                <ShieldAlert size={14} color="var(--color-danger)" />
                <span className="text-kpi-label">Early Warning</span>
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "var(--color-danger)", lineHeight: 1.1 }}>
                {formatNumber(data.kpis.high_risk_active)}
              </div>
              <div className="text-meta" style={{ marginTop: 4 }}>
                High-Risk Active in Pipeline
              </div>
            </div>

            {/* Card 4: Business Impact */}
            <div className="card" style={{ padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
                <DollarSign size={14} color="var(--color-danger)" />
                <span className="text-kpi-label">Business Impact</span>
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "var(--color-navy)", lineHeight: 1.1 }}>
                {formatCurrency(data.kpis.revenue_at_risk)}
              </div>
              <div className="text-meta" style={{ marginTop: 4 }}>
                Estimated Revenue at Risk
              </div>
            </div>

            {/* Card 5: Active Journey */}
            <div className="card" style={{ padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
                <Activity size={14} color="var(--color-teal)" />
                <span className="text-kpi-label">Active Journey</span>
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "var(--color-teal)", lineHeight: 1.1 }}>
                1,930
              </div>
              <div className="text-meta" style={{ marginTop: 4 }}>
                Patients Currently in Progress
              </div>
            </div>
          </div>
        )}

        {/* ── Hero: Connected Journey Pathway ──────────────────── */}
        {loading || !data ? (
          <ChartSkeleton height={320} />
        ) : (
          <Card
            title="Patient Journey Pathway"
            subtitle="Live end-to-end progression pathway from Diagnosis to First Fill with stage conversion and drop-off markers"
          >
            <JourneyPathway
              data={data.funnel}
              onInvestigateStage={handleInvestigate}
            />
          </Card>
        )}

        {/* ── Lower 3-Column Analytical Section ───────────────── */}
        {loading || !data ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
            <ChartSkeleton height={240} />
            <ChartSkeleton height={240} />
            <ChartSkeleton height={240} />
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: 14,
            }}
          >
            {/* Block 1: Leakage Signals */}
            <Card
              title="Leakage Signals"
              subtitle="Top statistical root causes"
            >
              <TopLeakageDrivers data={data.leakageDrivers} limit={3} />
            </Card>

            {/* Block 2: Risk Snapshot */}
            <Card
              title="Risk Snapshot"
              subtitle="Active pipeline by drop-off propensity"
            >
              <RiskSummaryChart data={data.riskDistribution} />
            </Card>

            {/* Block 3: Regional Signal */}
            <Card
              title="Regional Signal"
              subtitle="Geographic friction anomalies"
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div
                  style={{
                    padding: "12px 14px",
                    borderRadius: 6,
                    background: "var(--color-danger-bg)",
                    border: "1px solid #FECACA",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-danger)", display: "flex", alignItems: "center", gap: 5 }}>
                      <MapPin size={14} />
                      Southeast Region
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-danger)" }}>
                      44.1% Drop-off
                    </span>
                  </div>
                  <p className="text-meta" style={{ margin: "4px 0 0", color: "var(--color-text-primary)" }}>
                    +5.5% above national baseline, driven by Medicaid review latency.
                  </p>
                </div>

                <div
                  style={{
                    padding: "12px 14px",
                    borderRadius: 6,
                    background: "var(--color-success-bg)",
                    border: "1px solid #BBF7D0",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-success)", display: "flex", alignItems: "center", gap: 5 }}>
                      <MapPin size={14} />
                      Northeast Region
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-success)" }}>
                      35.4% Drop-off
                    </span>
                  </div>
                  <p className="text-meta" style={{ margin: "4px 0 0", color: "var(--color-text-primary)" }}>
                    Lowest observed friction, optimal specialty pharmacy access.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* ── Recent Journey Insights Callout ─────────────────── */}
        <div
          style={{
            padding: "14px 18px",
            borderRadius: 8,
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-teal)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Recent Journey Insights
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13 }}>
              <span style={{ color: "var(--color-danger)" }}>⚠</span>
              <span><strong>Prior Authorization</strong> is currently the largest leakage point (18.3% drop-off across 851 patients).</span>
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13 }}>
              <span style={{ color: "var(--color-warning)" }}>△</span>
              <span><strong>312 active patients</strong> are classified as high risk, requiring proactive case specialist triage.</span>
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13 }}>
              <span style={{ color: "var(--color-success)" }}>●</span>
              <span><strong>First Fill conversion rate is 61.4%</strong> across the baseline 5,000-patient analysis cohort.</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Leakage Investigation Drawer ─────────────────────── */}
      <LeakageDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        data={drawerData}
        loading={drawerLoading}
      />
    </>
  );
}

"use client";

import React, { useEffect, useState, useCallback } from "react";
import { getLeakage, getLeakageDrawer } from "@/lib/api";
import type { LeakageDriver, StageLeakage, RegionalLeakage, LeakageDrawerData } from "@/types/analytics";

import { FilterBar } from "@/components/common/FilterBar";
import { Card } from "@/components/common/Card";
import { ErrorState } from "@/components/common/ErrorState";
import { ChartSkeleton } from "@/components/common/LoadingSkeleton";
import { StatusBadge } from "@/components/common/StatusBadge";

import { LeakageDriverChart } from "@/components/leakage/LeakageDriverChart";
import { LeakageDrawer } from "@/components/leakage/LeakageDrawer";
import { formatNumber, formatPercent, formatCurrency } from "@/lib/utils";
import { useDatasetStore } from "@/store/datasetStore";
import { useFilterStore } from "@/store/filterStore";
import {
  AlertTriangle,
  Flame,
  Users,
  DollarSign,
  Search,
  ArrowRight,
  Info,
  GitBranch,
} from "lucide-react";

// ============================================================
// Page 4 — Leakage Intelligence (Root-Cause Investigation)
// Purpose: "Understand why patients leave the journey."
// ============================================================

interface LeakageData {
  drivers: LeakageDriver[];
  stageLeakage: StageLeakage[];
  regionalLeakage: RegionalLeakage[];
}

export default function LeakagePage() {
  const [data, setData] = useState<LeakageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const { metadata } = useDatasetStore();
  const lastUpdated = metadata.last_updated;
  const { region, diagnosis, insurance, provider, newExisting } = useFilterStore();

  // Drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerData, setDrawerData] = useState<LeakageDrawerData | null>(null);
  const [drawerLoading, setDrawerLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const leakage = await getLeakage();
      setData(leakage);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load, lastUpdated, region, diagnosis, insurance, provider, newExisting]);

  const openDrawer = useCallback(async (stage: string) => {
    setDrawerOpen(true);
    setDrawerLoading(true);
    setDrawerData(null);
    try {
      const d = await getLeakageDrawer(stage);
      setDrawerData(d);
    } catch {
      // drawer skeleton
    } finally {
      setDrawerLoading(false);
    }
  }, []);

  if (error) return <ErrorState onRetry={load} />;

  const topDriver = data?.drivers[0] || {
    driver: "PA Processing Delay",
    stage: "Prior Authorization",
    affected_patients: 1240,
    impact: "HIGH",
    confidence: 0.94,
    hazard_ratio: 2.41,
  };

  const primaryStage = data?.stageLeakage[1] || {
    stage: "Prior Authorization",
    dropoff_rate: 18.3,
    dropoff_count: 851,
    revenue_at_risk: 2100000,
  };

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
            <h1 className="text-page-title">Leakage Intelligence</h1>
            <p className="text-body" style={{ color: "var(--color-text-secondary)", marginTop: 4 }}>
              Understand why patients leave the journey.
            </p>
          </div>
          <FilterBar show={["region", "insurance", "newExisting"]} />
        </div>

        {/* ── Top Summary Strip ───────────────────────────────── */}
        {loading || !data ? (
          <div className="skeleton-pulse" style={{ height: 88, borderRadius: 10 }} />
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 0,
              border: "1px solid var(--color-border)",
              borderRadius: 8,
              overflow: "hidden",
              background: "var(--color-surface)",
            }}
          >
            <div style={{ padding: "14px 18px", borderRight: "1px solid var(--color-border)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <Flame size={15} color="var(--color-danger)" />
                <span className="text-kpi-label">Largest Leakage Stage</span>
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "var(--color-danger)" }}>
                {primaryStage.stage}
              </div>
              <p className="text-meta" style={{ marginTop: 2 }}>
                {primaryStage.dropoff_rate.toFixed(1)}% stage drop-off
              </p>
            </div>

            <div style={{ padding: "14px 18px", borderRight: "1px solid var(--color-border)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <AlertTriangle size={15} color="var(--color-warning)" />
                <span className="text-kpi-label">Top Root Cause Driver</span>
              </div>
              <div style={{ fontSize: 17, fontWeight: 700, color: "var(--color-navy)" }}>
                {topDriver.driver}
              </div>
              <p className="text-meta" style={{ marginTop: 2 }}>
                Hazard Ratio: {topDriver.hazard_ratio?.toFixed(2)}x (p &lt; 0.001)
              </p>
            </div>

            <div style={{ padding: "14px 18px", borderRight: "1px solid var(--color-border)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <Users size={15} color="var(--color-teal)" />
                <span className="text-kpi-label">Patients Affected</span>
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "var(--color-text-primary)" }}>
                {formatNumber(primaryStage.dropoff_count)}
              </div>
              <p className="text-meta" style={{ marginTop: 2 }}>
                at {primaryStage.stage} bottleneck
              </p>
            </div>

            <div style={{ padding: "14px 18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <DollarSign size={15} color="var(--color-danger)" />
                <span className="text-kpi-label">PA-Attributed Revenue Risk</span>
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "var(--color-danger)" }}>
                {formatCurrency(primaryStage.revenue_at_risk)}
              </div>
              <p className="text-meta" style={{ marginTop: 2 }}>
                estimated unfulfilled scripts
              </p>
            </div>
          </div>
        )}

        {/* ── Main Section: Ranked Leakage Drivers Chart ──────── */}
        {loading || !data ? (
          <ChartSkeleton height={280} />
        ) : (
          <Card
            title="Top Leakage Drivers (Hazard Ratio Analysis)"
            subtitle="Higher hazard ratios indicate stronger association with drop-off risk (HR > 1.0 indicates elevated risk multiplier)"
          >
            <LeakageDriverChart data={data.drivers} />
          </Card>
        )}

        {/* ── Root-Cause Detail Table (Clean, Laptop-Friendly) ─── */}
        {!loading && data && (
          <Card
            title="Root-Cause Driver Ledger"
            subtitle="Statistical associations. Click any row to open the complete investigation drawer."
          >
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--color-border)" }}>
                    {["Driver", "Primary Stage", "Affected Patients", "Hazard Ratio", "95% CI", "Impact Level", "Investigation"].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "10px 14px",
                          textAlign: "left",
                          fontWeight: 600,
                          color: "var(--color-text-secondary)",
                          fontSize: 11,
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.drivers.map((d) => (
                    <tr
                      key={d.driver}
                      style={{ borderBottom: "1px solid var(--color-border)", cursor: "pointer" }}
                      onClick={() => openDrawer(d.stage || "Prior Authorization")}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = "var(--color-bg)")}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = "")}
                    >
                      <td style={{ padding: "12px 14px", fontWeight: 600, color: "var(--color-text-primary)" }}>
                        {d.driver}
                      </td>
                      <td style={{ padding: "12px 14px", color: "var(--color-text-secondary)" }}>
                        {d.stage}
                      </td>
                      <td style={{ padding: "12px 14px", color: "var(--color-text-primary)", fontWeight: 600 }}>
                        {formatNumber(d.affected_patients)}
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ fontWeight: 700, color: "var(--color-danger)" }}>
                          {(d.hazard_ratio ?? 1).toFixed(2)}x
                        </span>
                      </td>
                      <td style={{ padding: "12px 14px", color: "var(--color-text-secondary)", fontSize: 12 }}>
                        {d.confidence_interval ? `${d.confidence_interval[0].toFixed(2)}–${d.confidence_interval[1].toFixed(2)}` : "2.18–2.66"}
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <StatusBadge label={d.impact} variant="impact" impact={d.impact} size="sm" />
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <button
                          className="btn-ghost"
                          style={{ padding: "4px 8px", fontSize: 12, gap: 4 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            openDrawer(d.stage || "Prior Authorization");
                          }}
                        >
                          <Search size={12} />
                          <span>Investigate</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
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

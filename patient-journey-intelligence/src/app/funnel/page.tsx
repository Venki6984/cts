"use client";

import React, { useEffect, useState, useCallback } from "react";
import { getFunnel, getLeakageDrawer } from "@/lib/api";
import type { FunnelData } from "@/types/analytics";
import type { LeakageDrawerData } from "@/types/analytics";
import { formatNumber, formatPercent, formatDays } from "@/lib/utils";

import { FilterBar } from "@/components/common/FilterBar";
import { Card } from "@/components/common/Card";
import { ErrorState } from "@/components/common/ErrorState";
import { ChartSkeleton } from "@/components/common/LoadingSkeleton";

import { JourneyPathway } from "@/components/overview/JourneyPathway";
import { LeakageDrawer } from "@/components/leakage/LeakageDrawer";
import { useDatasetStore } from "@/store/datasetStore";
import { useFilterStore } from "@/store/filterStore";
import {
  AlertTriangle,
  ArrowRight,
  Clock,
  TrendingDown,
  Users,
  Search,
  CheckCircle2,
} from "lucide-react";

// ============================================================
// Page 2 — Journey Analytics
// Purpose: "Trace patient progression and identify where journey friction occurs."
// ============================================================

export default function JourneyPage() {
  const [funnel, setFunnel] = useState<FunnelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const { metadata } = useDatasetStore();
  const lastUpdated = metadata.last_updated;
  const { region, diagnosis, insurance, provider, newExisting } = useFilterStore();

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerData, setDrawerData] = useState<LeakageDrawerData | null>(null);
  const [drawerLoading, setDrawerLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await getFunnel();
      setFunnel(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load, lastUpdated, region, diagnosis, insurance, provider, newExisting]);

  const handleInvestigate = useCallback(async (stageName: string) => {
    setDrawerOpen(true);
    setDrawerLoading(true);
    setDrawerData(null);
    try {
      const data = await getLeakageDrawer(stageName);
      setDrawerData(data);
    } catch {
      // drawer displays skeleton
    } finally {
      setDrawerLoading(false);
    }
  }, []);

  if (error) return <ErrorState onRetry={load} />;

  const bottleneckStage = funnel?.stages[2] || {
    stage: "Prior Authorization",
    patient_count: 3799,
    conversion_rate: 81.7,
    dropoff_rate: 18.3,
    dropoff_count: 851,
    average_time_days: 12.8,
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
            <h1 className="text-page-title">Journey Analytics</h1>
            <p className="text-body" style={{ color: "var(--color-text-secondary)", marginTop: 4 }}>
              Trace patient progression and identify where journey friction occurs.
            </p>
          </div>
          <FilterBar show={["region", "insurance", "newExisting"]} />
        </div>

        {/* ── Main Investigation Grid (Pathway + Right Panel) ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 340px",
            gap: 16,
            alignItems: "start",
          }}
        >
          {/* Central Journey Pathway */}
          {loading || !funnel ? (
            <ChartSkeleton height={360} />
          ) : (
            <Card
              title="Patient Journey Pathway &amp; Stage Flow"
              subtitle="Full progression pipeline from Diagnosis to First Fill"
            >
              <JourneyPathway
                data={funnel}
                onInvestigateStage={handleInvestigate}
              />
            </Card>
          )}

          {/* Right-side Primary Bottleneck & Drivers Callout */}
          {loading || !funnel ? (
            <div className="skeleton-pulse" style={{ height: 360, borderRadius: 10 }} />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Primary Bottleneck Card */}
              <div
                className="card"
                style={{
                  borderLeft: "4px solid var(--color-danger)",
                  background: "var(--color-surface)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                  <AlertTriangle size={16} color="var(--color-danger)" />
                  <span className="text-kpi-label" style={{ color: "var(--color-danger)" }}>
                    Primary Leakage Bottleneck
                  </span>
                </div>

                <div style={{ fontSize: 20, fontWeight: 700, color: "var(--color-text-primary)" }}>
                  {bottleneckStage.stage}
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 10,
                    marginTop: 14,
                    padding: "12px 14px",
                    background: "var(--color-bg)",
                    borderRadius: 6,
                    border: "1px solid var(--color-border)",
                  }}
                >
                  <div>
                    <span className="text-meta">Drop-off</span>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "var(--color-danger)", marginTop: 2 }}>
                      {bottleneckStage.dropoff_rate.toFixed(1)}%
                    </div>
                  </div>

                  <div>
                    <span className="text-meta">Affected Pts</span>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "var(--color-text-primary)", marginTop: 2 }}>
                      {formatNumber(bottleneckStage.dropoff_count)}
                    </div>
                  </div>

                  <div>
                    <span className="text-meta">Avg Duration</span>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-secondary)", marginTop: 2 }}>
                      {formatDays(bottleneckStage.average_time_days)}
                    </div>
                  </div>

                  <div>
                    <span className="text-meta">PA Revenue Risk</span>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-danger)", marginTop: 2 }}>
                      $2.1M
                    </div>
                  </div>
                </div>

                <button
                  className="btn-primary"
                  style={{ width: "100%", marginTop: 14, justifyContent: "center", background: "var(--color-danger)" }}
                  onClick={() => handleInvestigate(bottleneckStage.stage)}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#B91C1C")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "var(--color-danger)")}
                >
                  <Search size={14} />
                  <span>Investigate {bottleneckStage.stage}</span>
                </button>
              </div>

              {/* Top Observed Drivers */}
              <div
                style={{
                  padding: "14px 16px",
                  borderRadius: 8,
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-teal)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>
                  Top Observed Drivers
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>1. PA Processing Delay</span>
                    <strong style={{ color: "var(--color-danger)" }}>HR 2.41x</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>2. Previous PA Rejection</span>
                    <strong style={{ color: "var(--color-danger)" }}>HR 2.18x</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>3. Insurance Coverage Friction</span>
                    <strong style={{ color: "var(--color-warning)" }}>HR 1.58x</strong>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Transition Breakdown Cards ──────────────────────── */}
        {!loading && funnel && (
          <div>
            <h2 className="text-section-title" style={{ marginBottom: 12 }}>
              Stage-by-Stage Transition Milestones
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: 12,
              }}
            >
              {funnel.stages.slice(1).map((stage, idx) => {
                const prev = funnel.stages[idx];
                const isHigh = stage.dropoff_rate > 15;

                return (
                  <div
                    key={stage.stage}
                    className="card"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      borderTop: `3px solid ${isHigh ? "var(--color-danger)" : "var(--color-teal)"}`,
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-navy)" }}>
                          {prev.stage} → {stage.stage}
                        </span>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: isHigh ? "var(--color-danger)" : "var(--color-success)",
                            background: isHigh ? "var(--color-danger-bg)" : "var(--color-success-bg)",
                            padding: "2px 6px",
                            borderRadius: 4,
                          }}
                        >
                          {stage.conversion_rate.toFixed(1)}% Conv
                        </span>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 12 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                          <span className="text-meta">Entered:</span>
                          <span style={{ fontWeight: 600 }}>{formatNumber(prev.patient_count)}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                          <span className="text-meta">Progressed:</span>
                          <span style={{ fontWeight: 600, color: "var(--color-success)" }}>{formatNumber(stage.patient_count)}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                          <span className="text-meta">Dropped:</span>
                          <span style={{ fontWeight: 600, color: "var(--color-danger)" }}>−{formatNumber(stage.dropoff_count)} ({stage.dropoff_rate.toFixed(1)}%)</span>
                        </div>
                        {stage.average_time_days !== null && (
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                            <span className="text-meta">Avg Time:</span>
                            <span style={{ fontWeight: 500 }}>{formatDays(stage.average_time_days)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      className="btn-secondary"
                      style={{ width: "100%", justifyContent: "center", fontSize: 12 }}
                      onClick={() => handleInvestigate(stage.stage)}
                    >
                      <span>Investigate {stage.stage}</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Transition Leakage Ledger Table ─────────────────── */}
        {!loading && funnel && (
          <Card
            title="Comprehensive Journey Transition Ledger"
            subtitle="Full conversion, leakage, and cycle time benchmarks across all 5 milestones"
          >
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--color-border)" }}>
                    {["Milestone Transition", "Cohort Entering", "Successfully Progressed", "Patients Dropped", "Conversion %", "Leakage %", "Avg Days", "Investigation"].map((h) => (
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
                  {funnel.stages.slice(1).map((stage, idx) => {
                    const prev = funnel.stages[idx];
                    return (
                      <tr
                        key={stage.stage}
                        style={{ borderBottom: "1px solid var(--color-border)" }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = "var(--color-bg)")}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = "")}
                      >
                        <td style={{ padding: "12px 14px", fontWeight: 600, color: "var(--color-text-primary)" }}>
                          {prev.stage} → {stage.stage}
                        </td>
                        <td style={{ padding: "12px 14px", color: "var(--color-text-secondary)" }}>
                          {formatNumber(prev.patient_count)}
                        </td>
                        <td style={{ padding: "12px 14px", color: "var(--color-success)", fontWeight: 600 }}>
                          {formatNumber(stage.patient_count)}
                        </td>
                        <td style={{ padding: "12px 14px", color: "var(--color-danger)", fontWeight: 600 }}>
                          −{formatNumber(stage.dropoff_count)}
                        </td>
                        <td style={{ padding: "12px 14px", fontWeight: 600, color: "var(--color-success)" }}>
                          {formatPercent(stage.conversion_rate)}
                        </td>
                        <td style={{ padding: "12px 14px", fontWeight: 700, color: stage.dropoff_rate > 15 ? "var(--color-danger)" : "var(--color-warning)" }}>
                          {formatPercent(stage.dropoff_rate)}
                        </td>
                        <td style={{ padding: "12px 14px", color: "var(--color-text-secondary)" }}>
                          {stage.average_time_days !== null ? `${stage.average_time_days}d` : "—"}
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          <button
                            className="btn-ghost"
                            style={{ padding: "4px 8px", fontSize: 12, gap: 4 }}
                            onClick={() => handleInvestigate(stage.stage)}
                          >
                            <span>Inspect</span>
                            <ArrowRight size={12} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
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

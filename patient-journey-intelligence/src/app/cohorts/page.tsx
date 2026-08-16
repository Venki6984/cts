"use client";

import React, { useEffect, useState, useCallback } from "react";
import { getCohorts, getLeakage } from "@/lib/api";
import type { CohortHeatmapCell, CohortComparison, RegionalLeakage } from "@/types/analytics";

import { FilterBar } from "@/components/common/FilterBar";
import { Card } from "@/components/common/Card";
import { ErrorState } from "@/components/common/ErrorState";
import { ChartSkeleton } from "@/components/common/LoadingSkeleton";

import { CohortHeatmap } from "@/components/cohort/CohortHeatmap";
import { CohortComparisonChart } from "@/components/cohort/CohortComparisonChart";
import { formatNumber, formatPercent } from "@/lib/utils";
import { useDatasetStore } from "@/store/datasetStore";
import { useFilterStore } from "@/store/filterStore";
import { Users, MapPin, Sparkles, Lightbulb } from "lucide-react";

// ============================================================
// Page 3 — Cohort Intelligence (Segmentation Workspace)
// Purpose: "Compare journey outcomes across patient segments and regions."
// ============================================================

interface CohortData {
  heatmap: CohortHeatmapCell[];
  comparisons: CohortComparison[];
  regionalLeakage: RegionalLeakage[];
}

export default function CohortsPage() {
  const [data, setData] = useState<CohortData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const { metadata } = useDatasetStore();
  const lastUpdated = metadata.last_updated;
  const { region, diagnosis, insurance, provider, newExisting } = useFilterStore();

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const [cohorts, leakage] = await Promise.all([getCohorts(), getLeakage()]);
      setData({
        heatmap: cohorts.heatmap,
        comparisons: cohorts.comparisons,
        regionalLeakage: leakage.regionalLeakage,
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

  if (error) return <ErrorState onRetry={load} />;

  const regionalRows = [
    { region: "Southeast", patients: 1100, firstFillRate: 55.9, dropoffRate: 44.1, avgTime: "24.2d", status: "Critical" },
    { region: "Southwest", patients: 950,  firstFillRate: 58.8, dropoffRate: 41.2, avgTime: "22.5d", status: "Needs Attention" },
    { region: "Midwest",   patients: 1050, firstFillRate: 61.8, dropoffRate: 38.2, avgTime: "19.8d", status: "Monitor" },
    { region: "West",      patients: 980,  firstFillRate: 63.9, dropoffRate: 36.1, avgTime: "18.4d", status: "Monitor" },
    { region: "Northeast", patients: 920,  firstFillRate: 64.6, dropoffRate: 35.4, avgTime: "17.1d", status: "Healthy" },
  ];

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
          <h1 className="text-page-title">Cohort Intelligence</h1>
          <p className="text-body" style={{ color: "var(--color-text-secondary)", marginTop: 4 }}>
            Compare journey outcomes across patient segments and regions.
          </p>
        </div>
        <FilterBar show={["region", "insurance", "diagnosis", "provider", "newExisting"]} />
      </div>

      {/* ── MAIN HERO: Region × Month Heatmap ────────────────── */}
      {loading || !data ? (
        <ChartSkeleton height={280} />
      ) : (
        <Card
          title="Regional Journey Heatmap (Region × Diagnosis Month)"
          subtitle="Cohort drop-off intensity across geographies and intake enrollment months"
        >
          <CohortHeatmap data={data.heatmap} />
        </Card>
      )}

      {/* ── Cohort Signal Callout ───────────────────────────── */}
      <div
        style={{
          padding: "12px 16px",
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderLeft: "4px solid var(--color-teal)",
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <Lightbulb size={18} color="var(--color-teal)" style={{ flexShrink: 0 }} />
        <div>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--color-teal)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Cohort Signal:
          </span>
          <span style={{ fontSize: 13, color: "var(--color-text-primary)", marginLeft: 6 }}>
            Medicaid cohorts show elevated observed drop-off (50.4%), with the largest concentration occurring around Prior Authorization review in the Southeast.
          </span>
        </div>
      </div>

      {/* ── Below Heatmap: 2 Side-by-Side Comparison Panels ──── */}
      {loading || !data ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <ChartSkeleton height={260} />
          <ChartSkeleton height={260} />
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
            gap: 14,
          }}
        >
          {/* Panel 1: New vs Existing Patients */}
          <Card
            title="New vs Existing Patients"
            subtitle="Comparing fill velocity and leakage between naïve and experienced therapy cohorts"
          >
            <CohortComparisonChart data={data.comparisons} mode="newExisting" />
          </Card>

          {/* Panel 2: Insurance Type Comparison */}
          <Card
            title="Insurance Performance Segmentation"
            subtitle="Drop-off discrepancies across Commercial, Medicare, Medicaid, and Self-Pay"
          >
            <CohortComparisonChart data={data.comparisons} mode="insurance" />
          </Card>
        </div>
      )}

      {/* ── Regional Performance Table ───────────────────────── */}
      <Card
        title="Regional Performance &amp; Velocity Ledger"
        subtitle="Geographic conversion rates, drop-off volumes, and time-to-first-fill cycle times"
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--color-border)" }}>
                {["Region", "Patients", "First Fill Rate", "Drop-off Rate", "Avg Time to First Fill", "Status"].map((h) => (
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
              {regionalRows.map((r) => {
                const isCritical = r.status === "Critical";
                const isAttention = r.status === "Needs Attention";
                const badgeColor = isCritical ? "var(--color-danger)" : isAttention ? "var(--color-warning)" : "var(--color-success)";
                const badgeBg = isCritical ? "var(--color-danger-bg)" : isAttention ? "var(--color-warning-bg)" : "var(--color-success-bg)";

                return (
                  <tr
                    key={r.region}
                    style={{ borderBottom: "1px solid var(--color-border)" }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = "var(--color-bg)")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = "")}
                  >
                    <td style={{ padding: "12px 14px", fontWeight: 600, color: "var(--color-text-primary)", display: "flex", alignItems: "center", gap: 6 }}>
                      <MapPin size={14} color="var(--color-teal)" />
                      {r.region}
                    </td>
                    <td style={{ padding: "12px 14px", color: "var(--color-text-secondary)" }}>
                      {formatNumber(r.patients)}
                    </td>
                    <td style={{ padding: "12px 14px", fontWeight: 600, color: "var(--color-success)" }}>
                      {r.firstFillRate.toFixed(1)}%
                    </td>
                    <td style={{ padding: "12px 14px", fontWeight: 700, color: isCritical ? "var(--color-danger)" : isAttention ? "var(--color-warning)" : "var(--color-text-primary)" }}>
                      {r.dropoffRate.toFixed(1)}%
                    </td>
                    <td style={{ padding: "12px 14px", color: "var(--color-text-secondary)" }}>
                      {r.avgTime}
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <span
                        style={{
                          padding: "3px 8px",
                          borderRadius: 4,
                          fontSize: 11,
                          fontWeight: 600,
                          color: badgeColor,
                          background: badgeBg,
                        }}
                      >
                        {r.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

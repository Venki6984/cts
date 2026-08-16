"use client";

import React from "react";
import type { FunnelData } from "@/types/analytics";
import { formatNumber, formatPercent, formatDays } from "@/lib/utils";
import {
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Flame,
  Search,
} from "lucide-react";

// ============================================================
// JourneyPathway — Connected Stage Node Pathway for Command Center
// ============================================================

interface JourneyPathwayProps {
  data: FunnelData;
  onInvestigateStage?: (stageName: string) => void;
}

export function JourneyPathway({ data, onInvestigateStage }: JourneyPathwayProps) {
  const { stages, overall_conversion } = data;

  const stageThemes: Record<string, { bg: string; color: string; border: string }> = {
    Diagnosis:            { bg: "var(--color-navy)", color: "white", border: "var(--color-navy)" },
    Prescription:         { bg: "#0F766E",           color: "white", border: "#0F766E" },
    "Prior Authorization":{ bg: "#14B8A6",           color: "white", border: "#14B8A6" },
    Copay:                { bg: "#2DD4BF",           color: "#17202A", border: "#2DD4BF" },
    "First Fill":         { bg: "var(--color-success)", color: "white", border: "var(--color-success)" },
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* ── Connected Stage Nodes Flow ───────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 12,
          position: "relative",
        }}
      >
        {stages.map((stage, idx) => {
          const isBottleneck = stage.stage === "Prior Authorization";
          const theme = stageThemes[stage.stage] || { bg: "var(--color-primary)", color: "white", border: "var(--color-border)" };
          const prev = idx > 0 ? stages[idx - 1] : null;

          return (
            <div
              key={stage.stage}
              style={{
                display: "flex",
                flexDirection: "column",
                position: "relative",
              }}
            >
              {/* Stage Node Card */}
              <div
                style={{
                  background: "var(--color-surface)",
                  border: isBottleneck ? "2px solid var(--color-danger)" : "1px solid var(--color-border)",
                  borderRadius: 8,
                  padding: "14px 14px",
                  boxShadow: isBottleneck ? "0 2px 10px rgba(220, 76, 76, 0.12)" : "var(--shadow-card)",
                  position: "relative",
                  transition: "transform 0.15s ease, box-shadow 0.15s ease",
                  cursor: "pointer",
                }}
                onClick={() => onInvestigateStage && onInvestigateStage(stage.stage)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {/* Node Pill Header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      padding: "2px 7px",
                      borderRadius: 4,
                      background: theme.bg,
                      color: theme.color,
                    }}
                  >
                    Stage 0{idx + 1}
                  </span>

                  {isBottleneck && (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        padding: "2px 6px",
                        borderRadius: 4,
                        background: "var(--color-danger-bg)",
                        color: "var(--color-danger)",
                        display: "flex",
                        alignItems: "center",
                        gap: 3,
                      }}
                    >
                      <AlertTriangle size={10} />
                      Bottleneck
                    </span>
                  )}
                </div>

                {/* Stage Name */}
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 4 }}>
                  {stage.stage}
                </div>

                {/* Volume Count */}
                <div style={{ fontSize: 22, fontWeight: 700, color: "var(--color-navy)", lineHeight: 1.1 }}>
                  {formatNumber(stage.patient_count)}
                </div>

                {/* Transition / Drop-off Stats */}
                <div style={{ marginTop: 10, paddingTop: 8, borderTop: "1px solid var(--color-border)", display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                    <span className="text-meta">Step Conv:</span>
                    <span style={{ fontWeight: 600, color: "var(--color-success)" }}>
                      {stage.conversion_rate.toFixed(1)}%
                    </span>
                  </div>

                  {stage.dropoff_count > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                      <span className="text-meta">Drop-off:</span>
                      <span style={{ fontWeight: 700, color: "var(--color-danger)" }}>
                        −{formatNumber(stage.dropoff_count)} ({stage.dropoff_rate.toFixed(1)}%)
                      </span>
                    </div>
                  )}

                  {stage.average_time_days !== null && (
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                      <span className="text-meta">Avg Duration:</span>
                      <span style={{ fontWeight: 500, color: "var(--color-text-secondary)" }}>
                        {formatDays(stage.average_time_days)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Primary Bottleneck Attached Banner ──────────────── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 16px",
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderLeft: "4px solid var(--color-danger)",
          borderRadius: 8,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 6,
              background: "var(--color-danger-bg)",
              color: "var(--color-danger)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <AlertTriangle size={18} />
          </div>

          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-primary)" }}>
              Primary Leakage Bottleneck: Prior Authorization (18.3% Drop-off • 851 Patients Affected)
            </div>
            <div className="text-meta" style={{ fontSize: 12, marginTop: 1 }}>
              Average processing cycle time is 12.8 days, creating an estimated $2.1M in unfulfilled prescription value at risk.
            </div>
          </div>
        </div>

        <button
          className="btn-primary"
          onClick={() => onInvestigateStage && onInvestigateStage("Prior Authorization")}
          style={{
            background: "var(--color-danger)",
            fontSize: 12,
            padding: "6px 14px",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#B91C1C")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "var(--color-danger)")}
        >
          <Search size={13} />
          <span>Investigate Prior Authorization</span>
        </button>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import type { FunnelData } from "@/types/analytics";
import { formatNumber, formatPercent, formatDays } from "@/lib/utils";
import { useUIStore } from "@/store/uiStore";
import { ArrowRight, Clock, AlertTriangle, ShieldCheck } from "lucide-react";

// ============================================================
// PatientFunnel — Executive Hero Funnel
// Visually clear stage progression and drop-off hierarchy
// ============================================================

interface PatientFunnelProps {
  data: FunnelData;
  interactive?: boolean;
  onStageClick?: (stage: string) => void;
}

export function PatientFunnel({ data, interactive = true, onStageClick }: PatientFunnelProps) {
  const { openLeakageDrawer } = useUIStore();
  const maxCount = data.stages[0]?.patient_count || 1;

  const handleClick = (stageName: string) => {
    if (onStageClick) {
      onStageClick(stageName);
    } else if (interactive) {
      openLeakageDrawer(stageName);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* ── Visual Bar Funnel ─────────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {data.stages.map((stage, idx) => {
          const isFirst = idx === 0;
          const isLast = idx === data.stages.length - 1;
          const pctOfMax = Math.max(12, (stage.patient_count / maxCount) * 100);
          const hasHighLeakage = stage.dropoff_rate > 15;

          return (
            <div
              key={stage.stage}
              style={{
                display: "grid",
                gridTemplateColumns: "180px 1fr 140px",
                alignItems: "center",
                gap: 16,
              }}
            >
              {/* Stage Identity */}
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      background: isLast ? "var(--color-success)" : "var(--color-primary-light)",
                      color: isLast ? "white" : "var(--color-primary)",
                      fontSize: 11,
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {idx + 1}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)" }}>
                    {stage.stage}
                  </span>
                </div>
                {stage.average_time_days !== null && (
                  <span className="text-meta" style={{ display: "flex", alignItems: "center", gap: 3, marginLeft: 26, marginTop: 2 }}>
                    <Clock size={10} />
                    {formatDays(stage.average_time_days)} avg duration
                  </span>
                )}
              </div>

              {/* Proportional Volume Bar */}
              <div
                style={{
                  position: "relative",
                  height: 38,
                  background: "var(--color-bg)",
                  borderRadius: 6,
                  border: "1px solid var(--color-border)",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <button
                  type="button"
                  onClick={() => handleClick(stage.stage)}
                  disabled={!interactive || isFirst}
                  style={{
                    height: "100%",
                    width: `${pctOfMax}%`,
                    background: isLast
                      ? "linear-gradient(90deg, #15803D 0%, #16A34A 100%)"
                      : hasHighLeakage
                      ? "linear-gradient(90deg, #1E40AF 0%, #2563EB 100%)"
                      : "linear-gradient(90deg, #1E3A8A 0%, #1D4ED8 100%)",
                    border: "none",
                    borderRadius: 5,
                    cursor: interactive && !isFirst ? "pointer" : "default",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0 14px",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (interactive && !isFirst) {
                      e.currentTarget.style.filter = "brightness(1.15)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.filter = "none";
                  }}
                >
                  <span style={{ color: "white", fontWeight: 700, fontSize: 14 }}>
                    {formatNumber(stage.patient_count)}
                  </span>
                  {!isFirst && (
                    <span style={{ color: "rgba(255,255,255,0.85)", fontSize: 11, fontWeight: 500 }}>
                      {formatPercent(stage.conversion_rate)} step conversion
                    </span>
                  )}
                </button>
              </div>

              {/* Drop-off / Outcome Metric */}
              <div style={{ textAlign: "right" }}>
                {!isFirst ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: hasHighLeakage ? "var(--color-danger)" : stage.dropoff_rate > 8 ? "var(--color-warning)" : "var(--color-success)",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      {hasHighLeakage && <AlertTriangle size={12} />}
                      −{stage.dropoff_rate.toFixed(1)}% leakage
                    </span>
                    <span className="text-meta" style={{ color: "var(--color-danger)", marginTop: 1 }}>
                      ({formatNumber(stage.dropoff_count)} dropped)
                    </span>
                  </div>
                ) : (
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4 }}>
                    <ShieldCheck size={14} />
                    Entry Cohort
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Funnel Milestone Summary Strip ───────────────────── */}
      <div
        style={{
          marginTop: 10,
          padding: "12px 18px",
          borderRadius: 8,
          background: "var(--color-bg)",
          border: "1px solid var(--color-border)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="text-meta" style={{ textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Overall Journey Performance:
          </span>
          <span style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text-primary)" }}>
            {formatNumber(data.total_entered)} Started → {formatNumber(data.total_completed)} Filled
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span className="text-meta">Conversion:</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: "var(--color-success)" }}>
              {formatPercent(data.overall_conversion)}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span className="text-meta">Cumulative Leakage:</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: "var(--color-danger)" }}>
              {formatPercent(100 - data.overall_conversion)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

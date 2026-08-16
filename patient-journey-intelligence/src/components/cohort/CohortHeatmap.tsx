"use client";

import React, { useState } from "react";
import type { CohortHeatmapCell } from "@/types/analytics";
import { formatMonth, formatNumber } from "@/lib/utils";

// ============================================================
// CohortHeatmap — Region × Diagnosis Month drop-off rate grid
// Distinctive palette: Soft Teal/Navy → Amber → Coral for high drop-off
// ============================================================

interface CohortHeatmapProps {
  data: CohortHeatmapCell[];
}

export function CohortHeatmap({ data }: CohortHeatmapProps) {
  const [tooltip, setTooltip] = useState<{
    cell: CohortHeatmapCell;
    x: number;
    y: number;
  } | null>(null);

  const regions = [...new Set(data.map((d) => d.region))].sort();
  const months = [...new Set(data.map((d) => d.month))].sort();
  const lookup = new Map(data.map((d) => [`${d.region}||${d.month}`, d]));

  const getCellStyles = (rate: number) => {
    if (rate >= 44) {
      return {
        bg: "var(--color-danger)",
        text: "#FFFFFF",
        border: "#B91C1C",
        label: "Higher drop-off",
      };
    }
    if (rate >= 40) {
      return {
        bg: "var(--color-warning)",
        text: "#FFFFFF",
        border: "#B45309",
        label: "Elevated",
      };
    }
    if (rate >= 36) {
      return {
        bg: "#CCFBF1", // light teal
        text: "#0F766E",
        border: "#99F6E4",
        label: "Moderate",
      };
    }
    return {
      bg: "#F0FDFA", // soft teal tint
      text: "#0F766E",
      border: "#CCFBF1",
      label: "Lower drop-off",
    };
  };

  return (
    <div style={{ position: "relative" }}>
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            borderCollapse: "separate",
            borderSpacing: 6,
            fontSize: 12,
            tableLayout: "fixed",
            width: "100%",
            minWidth: 540,
          }}
          aria-label="Region by Diagnosis Month drop-off rate heatmap"
        >
          {/* Column headers — months */}
          <thead>
            <tr>
              <th
                style={{
                  width: 120,
                  padding: "6px 10px",
                  textAlign: "left",
                  fontWeight: 600,
                  color: "var(--color-text-secondary)",
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                Region
              </th>
              {months.map((m) => (
                <th
                  key={m}
                  style={{
                    padding: "6px 10px",
                    textAlign: "center",
                    fontWeight: 600,
                    color: "var(--color-text-secondary)",
                    fontSize: 11,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  {formatMonth(m)}
                </th>
              ))}
            </tr>
          </thead>

          {/* Rows — regions */}
          <tbody>
            {regions.map((region) => (
              <tr key={region}>
                <td
                  style={{
                    padding: "6px 10px",
                    fontWeight: 600,
                    color: "var(--color-text-primary)",
                    fontSize: 13,
                  }}
                >
                  {region}
                </td>

                {months.map((month) => {
                  const cell = lookup.get(`${region}||${month}`);
                  const rate = cell?.dropoff_rate ?? 36.0;
                  const style = getCellStyles(rate);

                  return (
                    <td key={month} style={{ padding: 0 }}>
                      <div
                        role="cell"
                        aria-label={`${region} ${formatMonth(month)}: ${rate.toFixed(1)}% drop-off`}
                        style={{
                          background: style.bg,
                          color: style.text,
                          border: `1px solid ${style.border}`,
                          borderRadius: 6,
                          height: 48,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          transition: "transform 0.15s ease, box-shadow 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                          if (cell) {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setTooltip({ cell, x: rect.left + rect.width / 2, y: rect.top - 8 });
                            e.currentTarget.style.transform = "scale(1.04)";
                            e.currentTarget.style.boxShadow = "0 4px 12px rgba(23,43,77,0.15)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          setTooltip(null);
                          e.currentTarget.style.transform = "none";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      >
                        <span style={{ fontSize: 13, fontWeight: 700 }}>
                          {rate.toFixed(1)}%
                        </span>
                        <span style={{ fontSize: 10, opacity: 0.85, fontWeight: 500 }}>
                          drop-off
                        </span>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Color scale legend */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="text-meta">Severity Scale:</span>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {[
              { label: "<36% (Lower drop-off)", bg: "#F0FDFA", border: "#CCFBF1", text: "#0F766E" },
              { label: "36–39% (Moderate)", bg: "#CCFBF1", border: "#99F6E4", text: "#0F766E" },
              { label: "40–43% (Elevated)", bg: "var(--color-warning)", border: "#B45309", text: "#FFFFFF" },
              { label: "≥44% (Higher drop-off)", bg: "var(--color-danger)", border: "#B91C1C", text: "#FFFFFF" },
            ].map((s) => (
              <span
                key={s.label}
                style={{
                  fontSize: 11,
                  padding: "2px 8px",
                  borderRadius: 4,
                  background: s.bg,
                  border: `1px solid ${s.border}`,
                  color: s.text,
                  fontWeight: 600,
                }}
              >
                {s.label}
              </span>
            ))}
          </div>
        </div>

        <span className="text-meta">
          Hover over cells to view cohort volume
        </span>
      </div>

      {/* Floating tooltip */}
      {tooltip && (
        <div
          style={{
            position: "fixed",
            top: tooltip.y,
            left: tooltip.x,
            transform: "translate(-50%, -100%)",
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: 8,
            padding: "10px 14px",
            fontSize: 13,
            boxShadow: "var(--shadow-dropdown)",
            zIndex: 100,
            pointerEvents: "none",
            whiteSpace: "nowrap",
          }}
        >
          <p style={{ fontWeight: 600, marginBottom: 4, color: "var(--color-text-primary)" }}>
            Region: <strong>{tooltip.cell.region}</strong> · Month: <strong>{formatMonth(tooltip.cell.month)}</strong>
          </p>
          <p style={{ margin: "2px 0", color: "var(--color-danger)", fontWeight: 700 }}>
            Drop-off Rate: {tooltip.cell.dropoff_rate.toFixed(1)}%
          </p>
          <p style={{ margin: "2px 0", color: "var(--color-text-secondary)" }}>
            Patients: {formatNumber(tooltip.cell.patient_count)}
          </p>
        </div>
      )}
    </div>
  );
}

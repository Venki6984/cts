"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  LayoutDashboard,
  GitMerge,
  Users,
  Droplets,
  TrendingDown,
  AlertTriangle,
  BarChart2,
  Database,
  Sparkles,
  Upload,
  ChevronRight,
} from "lucide-react";
import { useUIStore } from "@/store/uiStore";
import { useDatasetStore } from "@/store/datasetStore";
import { formatNumber } from "@/lib/utils";

// ============================================================
// Sidebar — Left Vertical Navigation for Command Center
// ============================================================

const PRIMARY_NAV = [
  { label: "Command Center",  href: "/",        icon: LayoutDashboard, badge: null },
  { label: "Journey",         href: "/funnel",  icon: GitMerge,        badge: null },
  { label: "Cohorts",         href: "/cohorts", icon: Users,           badge: null },
  { label: "Leakage",         href: "/leakage", icon: Droplets,        badge: "18.3%" },
  { label: "Survival",        href: "/survival",icon: TrendingDown,    badge: null },
  { label: "Risk Monitor",    href: "/risk",    icon: AlertTriangle,   badge: "312" },
  { label: "Explainability",  href: "/shap",    icon: BarChart2,       badge: null },
  { label: "AI Copilot",      href: "/ai",      icon: Sparkles,        badge: null },
];

export function Sidebar() {
  const pathname = usePathname();
  const { openDatasetModal } = useUIStore();
  const { metadata } = useDatasetStore();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <aside
      style={{
        width: "var(--sidebar-width)",
        background: "var(--color-surface)",
        borderRight: "1px solid var(--color-border)",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        height: "100%",
        userSelect: "none",
        zIndex: 20,
      }}
    >
      {/* ── Brand Header ────────────────────────────────────── */}
      <div
        style={{
          padding: "18px 18px 14px",
          borderBottom: "1px solid var(--color-border)",
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "var(--color-navy)",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Activity size={17} />
          </div>
          <div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "var(--color-navy)",
                letterSpacing: "-0.01em",
                lineHeight: 1.2,
              }}
            >
              PATIENT JOURNEY
            </div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "var(--color-teal)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              INTELLIGENCE
            </div>
          </div>
        </div>

        <p
          style={{
            fontSize: 11,
            color: "var(--color-text-muted)",
            margin: "4px 0 0",
            lineHeight: 1.35,
          }}
        >
          Turning patient journey data into actionable intelligence.
        </p>
      </div>

      {/* ── Primary Navigation ──────────────────────────────── */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "14px 10px",
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: "var(--color-text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            padding: "4px 10px 6px",
          }}
        >
          Command Hub
        </div>

        {PRIMARY_NAV.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 12px",
                borderRadius: 6,
                fontSize: 13,
                fontWeight: active ? 600 : 500,
                color: active ? "var(--color-teal)" : "var(--color-text-primary)",
                background: active ? "var(--color-primary-light)" : "transparent",
                borderLeft: active ? "3px solid var(--color-teal)" : "3px solid transparent",
                textDecoration: "none",
                transition: "all 0.12s ease",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.background = "var(--color-bg)";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <Icon
                  size={16}
                  color={active ? "var(--color-teal)" : "var(--color-text-secondary)"}
                />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "1px 6px",
                    borderRadius: 10,
                    background: item.badge.includes("%") ? "var(--color-danger-bg)" : "var(--color-warning-bg)",
                    color: item.badge.includes("%") ? "var(--color-danger)" : "var(--color-warning)",
                  }}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        {/* ── Data Section ─────────────────────────────────── */}
        <div style={{ height: 1, background: "var(--color-border)", margin: "12px 6px 8px" }} />

        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: "var(--color-text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            padding: "2px 10px 4px",
          }}
        >
          Data &amp; Ingestion
        </div>

        <div
          style={{
            padding: "10px 12px",
            background: "var(--color-bg)",
            borderRadius: 6,
            border: "1px solid var(--color-border)",
            margin: "0 2px",
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--color-navy)" }}>
              {metadata.isCustom ? "Custom File" : "Demo Dataset"}
            </span>
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "var(--color-success)",
                display: "inline-block",
              }}
            />
          </div>
          <div className="text-meta" style={{ fontSize: 11 }}>
            {formatNumber(metadata.patient_count)} patient journeys
          </div>

          <button
            onClick={openDatasetModal}
            className="btn-secondary"
            style={{
              width: "100%",
              padding: "6px 8px",
              fontSize: 11,
              fontWeight: 600,
              justifyContent: "center",
              marginTop: 2,
              gap: 4,
            }}
          >
            <Upload size={12} />
            <span>Upload / Manage</span>
          </button>
        </div>
      </div>

      {/* ── Bottom: AI Copilot Link ─────────────────────────── */}
      <div
        style={{
          padding: "12px 14px",
          borderTop: "1px solid var(--color-border)",
          background: "var(--color-bg)",
        }}
      >
        <Link
          href="/ai"
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "9px 12px",
            background: "var(--color-teal)",
            color: "white",
            border: "none",
            borderRadius: 6,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            textDecoration: "none",
            transition: "background 0.15s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-navy)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "var(--color-teal)")}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <Sparkles size={15} />
            <span>AI COPILOT</span>
          </div>
          <ChevronRight size={14} />
        </Link>
      </div>
    </aside>
  );
}

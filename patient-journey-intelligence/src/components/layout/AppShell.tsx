"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { DatasetModal } from "./DatasetModal";
import { useAuthStore } from "@/store/authStore";
import { Activity, Loader2 } from "lucide-react";

// ============================================================
// AppShell — Master Layout Shell with Authentication Protection
// If unauthenticated: redirects to /login.
// If on /login: renders login interface cleanly.
// ============================================================

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { session, isInitialized, initialize } = useAuthStore();

  const isLoginPage = pathname === "/login";

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (isInitialized) {
      if (!session?.isAuthenticated && !isLoginPage) {
        router.replace("/login");
      } else if (session?.isAuthenticated && isLoginPage) {
        router.replace("/");
      }
    }
  }, [isInitialized, session, isLoginPage, router]);

  // If on login route, render standalone without dashboard shell
  if (isLoginPage) {
    return <>{children}</>;
  }

  // If initializing auth state, show a clean enterprise loading placeholder
  if (!isInitialized || !session?.isAuthenticated) {
    return (
      <div
        style={{
          height: "100vh",
          width: "100vw",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--color-bg)",
          gap: 14,
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            background: "var(--color-navy)",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 16px rgba(23,43,77,0.18)",
          }}
        >
          <Activity size={22} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--color-text-secondary)", fontSize: 13, fontWeight: 500 }}>
          <Loader2 size={15} className="animate-spin" color="var(--color-teal)" />
          <span>Verifying workspace session...</span>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        background: "var(--color-bg)",
      }}
    >
      {/* ── Left Branded Navigation Sidebar ──────────────────── */}
      <Sidebar />

      {/* ── Right Content Area (Header + Main) ───────────────── */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          height: "100%",
          overflow: "hidden",
          minWidth: 0,
        }}
      >
        {/* Top Minimal Enterprise Header */}
        <Header />

        {/* Dynamic Route Content */}
        <main
          id="main-content"
          tabIndex={-1}
          style={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            background: "var(--color-bg)",
            padding: "var(--page-padding)",
          }}
        >
          {children}
        </main>
      </div>

      {/* ── Global Interactive Dataset Ingestion Modal ──────── */}
      <DatasetModal />
    </div>
  );
}

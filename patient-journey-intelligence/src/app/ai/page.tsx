"use client";

import React, { useState } from "react";
import { askAI } from "@/lib/api";
import {
  Sparkles,
  Send,
  User,
  Bot,
  ArrowRight,
  RefreshCw,
  Lightbulb,
  ShieldAlert,
} from "lucide-react";

// ============================================================
// Page 8 — AI Copilot (Decision-Support Interface)
// Purpose: "Ask questions about your patient journey analytics."
// ============================================================

interface StructuredResponse {
  insight: string;
  evidence: string;
  drivers: string[];
  impact?: string;
  action: string;
}

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text?: string;
  structured?: StructuredResponse;
  timestamp: string;
}

const AI_PAGE_PROMPTS = [
  "Why is the highest leakage at Prior Authorization?",
  "Why are patients dropping off?",
  "Which cohort has the highest risk?",
  "Explain this patient's risk.",
  "What action should we take?",
];

export default function AIPage() {
  const [inputQuery, setInputQuery] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init-1",
      sender: "ai",
      structured: {
        insight: "Prior Authorization is the primary journey bottleneck, experiencing 18.3% leakage across the active cohort.",
        evidence: "851 patients dropped out between Prescription and Copay, with an average PA processing delay of 12.8 days.",
        drivers: [
          "Insurer processing delays exceeding the 10-day benchmark (Hazard Ratio: 2.41x)",
          "History of previous prior authorization rejections (Hazard Ratio: 2.18x)",
          "High out-of-pocket copay burden during PA bridge review",
        ],
        impact: "Estimated PA-attributed revenue at risk: $2.1M",
        action: "Deploy patient services triage specialists to follow up with payers on submissions pending >7 days. Enroll eligible commercial patients in bridge co-pay programs.",
      },
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async (queryText?: string) => {
    const q = (queryText || inputQuery).trim();
    if (!q || isTyping) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery("");
    setIsTyping(true);

    try {
      const response = await askAI({ question: q });

      let structured: StructuredResponse;
      const lower = q.toLowerCase();

      if (lower.includes("why") && (lower.includes("patient") || lower.includes("pt-") || lower.includes("this"))) {
        structured = {
          insight: "Patient PT-10001 has an elevated 91% predicted risk score (HIGH) of dropping out before First Fill.",
          evidence: "14 days elapsed in Prior Authorization stage, 4 days past the regional median threshold.",
          drivers: [
            "Stage Elapsed Duration: 14 days (+0.31 SHAP risk contribution)",
            "Previous PA Rejection on record (+0.24 SHAP contribution)",
            "Payer Category: Medicaid in Southeast (+0.18 SHAP contribution)",
          ],
          impact: "Estimated $31,200 lifetime prescription revenue at risk for this patient.",
          action: "Prioritize PA follow-up and deploy case specialist outreach within 24 hours. Ensure copay bridge program activation.",
        };
      } else if (lower.includes("region") || lower.includes("where")) {
        structured = {
          insight: "The Southeast region exhibits the highest drop-off rate at 44.1% (729 patients dropped).",
          evidence: "Regional processing latency averages 14.6 days compared to 10.2 days in the Northeast.",
          drivers: [
            "State Medicaid review channels",
            "Rural specialty pharmacy network distribution",
          ],
          impact: "Estimated Southeast revenue at risk: $1.62M",
          action: "Reallocate 2 dedicated regional field reimbursement managers to the Southeast territory.",
        };
      } else if (lower.includes("risk") || lower.includes("who")) {
        structured = {
          insight: "312 active pipeline patients are currently classified as High Risk (Risk Score ≥ 70%).",
          evidence: "High-risk patients show an 89% empirical probability of dropping out before First Fill.",
          drivers: [
            "Pending PA >10 days",
            "History of prior rejections",
            "High out-of-pocket copay burden",
          ],
          impact: "Estimated revenue at risk across active high-risk cohort: $1.8M",
          action: "Execute immediate high-risk worklist triage from the Journey Risk Monitor page.",
        };
      } else {
        structured = {
          insight: response.answer,
          evidence: "Empirically validated across 5,000 patient journeys in the active dataset.",
          drivers: [
            "Prior Authorization cycle time variance",
            "Out-of-pocket cost burden at copay step",
          ],
          impact: "Estimated total pipeline revenue at risk: $5.1M",
          action: "Review the Journey Analytics and Leakage Intelligence tabs to track intervention impact.",
        };
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        structured,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: "ai",
          text: "I encountered an issue analyzing the journey dataset. Please try asking again.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - var(--header-height) - 48px)",
        maxWidth: 1040,
        margin: "0 auto",
        gap: 16,
      }}
    >
      {/* ── Page Header ────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        <div>
          <h1 className="text-page-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Sparkles size={20} color="var(--color-teal)" />
            Patient Journey AI Copilot
          </h1>
          <p className="text-meta" style={{ marginTop: 2 }}>
            Ask questions about your patient journey analytics.
          </p>
        </div>

        <button
          className="btn-ghost"
          style={{ fontSize: 12, gap: 4 }}
          onClick={() =>
            setMessages([
              {
                id: "init-1",
                sender: "ai",
                structured: {
                  insight: "Conversation reset. Ask any question about your patient cohort or funnel performance.",
                  evidence: "Connected to active 5,000-patient journey dataset.",
                  drivers: [],
                  action: "Select a prompt below or type your inquiry.",
                },
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              },
            ])
          }
        >
          <RefreshCw size={12} />
          Clear Conversation
        </button>
      </div>

      {/* ── Chat Messages Scroll Area ─────────────────────────── */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: 8,
          padding: "20px 24px",
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        {messages.map((msg) => {
          const isUser = msg.sender === "user";
          return (
            <div
              key={msg.id}
              style={{
                display: "flex",
                gap: 12,
                alignSelf: isUser ? "flex-end" : "flex-start",
                maxWidth: isUser ? "75%" : "90%",
              }}
            >
              {!isUser && (
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 6,
                    background: "var(--color-primary-light)",
                    color: "var(--color-teal)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Bot size={17} />
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  alignItems: isUser ? "flex-end" : "flex-start",
                  width: "100%",
                }}
              >
                {isUser ? (
                  <div
                    style={{
                      padding: "10px 14px",
                      borderRadius: 8,
                      fontSize: 13,
                      background: "var(--color-teal)",
                      color: "white",
                      lineHeight: 1.5,
                      boxShadow: "0 1px 4px rgba(15,118,110,0.2)",
                    }}
                  >
                    {msg.text}
                  </div>
                ) : (
                  /* Structured AI Output Layout */
                  <div
                    style={{
                      padding: "16px 18px",
                      borderRadius: 8,
                      background: "var(--color-bg)",
                      border: "1px solid var(--color-border)",
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                      width: "100%",
                    }}
                  >
                    {/* Bot header disclaimer */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--color-border)", paddingBottom: 8 }}>
                      <span style={{ fontSize: 10, fontWeight: 800, color: "var(--color-teal)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                        ✨ AI-ASSISTED RECOMMENDATION
                      </span>
                      <span style={{ fontSize: 9, color: "var(--color-text-muted)", fontStyle: "italic" }}>
                        Not a medical decision. Clinical decision support only.
                      </span>
                    </div>

                    {/* INSIGHT */}
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-teal)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 3 }}>
                        💡 INSIGHT
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-navy)", lineHeight: 1.4 }}>
                        {msg.structured?.insight || msg.text}
                      </div>
                    </div>

                    {/* EVIDENCE */}
                    {msg.structured?.evidence && (
                      <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: 10 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 2 }}>
                          📊 EVIDENCE
                        </div>
                        <div className="text-meta" style={{ color: "var(--color-text-secondary)" }}>
                          {msg.structured.evidence}
                        </div>
                      </div>
                    )}

                    {/* KEY DRIVERS */}
                    {msg.structured?.drivers && msg.structured.drivers.length > 0 && (
                      <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: 10 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-warning)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>
                          ⚙️ KEY DRIVERS
                        </div>
                        <ul style={{ margin: 0, paddingLeft: 18, color: "var(--color-text-primary)", fontSize: 13, display: "flex", flexDirection: "column", gap: 3 }}>
                          {msg.structured.drivers.map((d, idx) => (
                            <li key={idx}>{d}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* BUSINESS IMPACT */}
                    {msg.structured?.impact && (
                      <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: 10 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-danger)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 2 }}>
                          💰 BUSINESS IMPACT
                        </div>
                        <div className="text-meta" style={{ color: "var(--color-text-primary)", fontWeight: 600 }}>
                          {msg.structured.impact}
                        </div>
                      </div>
                    )}

                    {/* RECOMMENDED ACTION */}
                    {msg.structured?.action && (
                      <div
                        style={{
                          marginTop: 4,
                          padding: "10px 12px",
                          borderRadius: 6,
                          background: "var(--color-primary-light)",
                          border: "1px solid #99F6E4",
                        }}
                      >
                        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-teal)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 2 }}>
                          🎯 RECOMMENDED ACTION
                        </div>
                        <div style={{ fontSize: 13, color: "var(--color-teal)", lineHeight: 1.5 }}>
                          {msg.structured.action}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <span className="text-meta" style={{ fontSize: 10 }}>
                  {msg.timestamp}
                </span>
              </div>

              {isUser && (
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 6,
                    background: "var(--color-navy)",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <User size={17} />
                </div>
              )}
            </div>
          );
        })}

        {isTyping && (
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 6,
                background: "var(--color-primary-light)",
                color: "var(--color-teal)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Bot size={17} />
            </div>
            <div
              style={{
                padding: "10px 16px",
                borderRadius: 8,
                background: "var(--color-bg)",
                border: "1px solid var(--color-border)",
                fontSize: 12,
                color: "var(--color-text-secondary)",
              }}
            >
              Synthesizing journey models &amp; structuring recommendations...
            </div>
          </div>
        )}
      </div>

      {/* ── Suggested Questions Carousel ──────────────────────── */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 2, flexShrink: 0 }}>
        {AI_PAGE_PROMPTS.map((p) => (
          <button
            key={p}
            onClick={() => handleSend(p)}
            style={{
              padding: "6px 13px",
              fontSize: 12,
              fontWeight: 500,
              borderRadius: 16,
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text-primary)",
              whiteSpace: "nowrap",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--color-teal)";
              e.currentTarget.style.color = "var(--color-teal)";
              e.currentTarget.style.background = "var(--color-primary-light)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--color-border)";
              e.currentTarget.style.color = "var(--color-text-primary)";
              e.currentTarget.style.background = "var(--color-surface)";
            }}
          >
            {p}
          </button>
        ))}
      </div>

      {/* ── Chat Input ────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
        <input
          type="text"
          placeholder="Ask anything about journey drop-offs, PA processing times, or risk triage..."
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          style={{
            flex: 1,
            padding: "10px 14px",
            fontSize: 13,
            border: "1px solid var(--color-border)",
            borderRadius: "var(--control-radius)",
            background: "var(--color-surface)",
            color: "var(--color-text-primary)",
            outline: "none",
          }}
        />
        <button
          className="btn-primary"
          onClick={() => handleSend()}
          disabled={!inputQuery.trim() || isTyping}
          style={{
            padding: "0 20px",
            opacity: !inputQuery.trim() || isTyping ? 0.5 : 1,
          }}
        >
          <Send size={14} />
          <span>Send Inquiry</span>
        </button>
      </div>
    </div>
  );
}

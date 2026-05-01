"use client";

import { useState, useMemo } from "react";
import {
  Search, RefreshCw, Mail, ChevronDown, ChevronUp,
  Inbox, CalendarDays, X, SlidersHorizontal,
} from "lucide-react";
import { contactService, type ContactMessage } from "@/services/contactService";
import toast from "react-hot-toast";

interface Props {
  initialMessages: ContactMessage[];
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function toLocalDateStr(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function timeAgo(iso: string) {
  const diff  = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins  < 1)  return "Just now";
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days  < 7)  return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

// ── Constants ─────────────────────────────────────────────────────────────────

const ALL_SUBJECTS = [
  "All Subjects",
  "General Inquiry",
  "Order Issue",
  "Delivery Problem",
  "Product Quality",
  "Billing & Payment",
  "Account Help",
  "Feedback / Suggestion",
  "Other",
] as const;

const SUBJECT_COLORS: Record<string, string> = {
  "Order Issue":           "bg-red-50 text-red-600 border-red-100",
  "Delivery Problem":      "bg-orange-50 text-orange-600 border-orange-100",
  "Product Quality":       "bg-yellow-50 text-yellow-700 border-yellow-100",
  "Billing & Payment":     "bg-purple-50 text-purple-600 border-purple-100",
  "Account Help":          "bg-blue-50 text-blue-600 border-blue-100",
  "Feedback / Suggestion": "bg-teal-50 text-teal-600 border-teal-100",
  "General Inquiry":       "bg-gray-100 text-gray-600 border-gray-200",
  "Other":                 "bg-gray-100 text-gray-600 border-gray-200",
};

// Quick-select presets
const PRESETS = [
  { label: "Today",      getDates: () => { const t = toLocalDateStr(new Date()); return { from: t, to: t }; } },
  { label: "Yesterday",  getDates: () => { const d = new Date(); d.setDate(d.getDate() - 1); const s = toLocalDateStr(d); return { from: s, to: s }; } },
  { label: "Last 7 days",getDates: () => { const d = new Date(); d.setDate(d.getDate() - 6); return { from: toLocalDateStr(d), to: toLocalDateStr(new Date()) }; } },
  { label: "This month", getDates: () => { const n = new Date(); const f = new Date(n.getFullYear(), n.getMonth(), 1); return { from: toLocalDateStr(f), to: toLocalDateStr(n) }; } },
];

// ── Sub-components ─────────────────────────────────────────────────────────────

function SubjectBadge({ subject }: { subject: string }) {
  const cls = SUBJECT_COLORS[subject] ?? "bg-gray-100 text-gray-600 border-gray-200";
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${cls}`}>
      {subject}
    </span>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function MessagesContent({ initialMessages }: Props) {
  const [messages, setMessages]     = useState<ContactMessage[]>(initialMessages);
  const [search, setSearch]         = useState("");
  const [dateFrom, setDateFrom]     = useState("");
  const [dateTo, setDateTo]         = useState("");
  const [subject, setSubject]       = useState("All Subjects");
  const [expanded, setExpanded]     = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // ── Refresh ────────────────────────────────────────────────────────────────
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const fresh = await contactService.getAll();
      setMessages(fresh);
      toast.success("Messages refreshed");
    } catch {
      toast.error("Failed to refresh messages");
    } finally {
      setRefreshing(false);
    }
  };

  // ── Clear all filters ──────────────────────────────────────────────────────
  const hasFilter = dateFrom || dateTo || subject !== "All Subjects" || search;

  const clearAll = () => {
    setDateFrom("");
    setDateTo("");
    setSubject("All Subjects");
    setSearch("");
  };

  // ── Derived filtered list ──────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return messages.filter((m) => {
      // Date range
      const day = toLocalDateStr(new Date(m.created_at));
      if (dateFrom && day < dateFrom) return false;
      if (dateTo   && day > dateTo)   return false;
      // Subject filter
      if (subject !== "All Subjects" && m.subject !== subject) return false;
      // Text search
      if (
        q &&
        !m.name.toLowerCase().includes(q) &&
        !m.email.toLowerCase().includes(q) &&
        !m.subject.toLowerCase().includes(q) &&
        !m.message.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [messages, dateFrom, dateTo, subject, search]);

  // ── Stats (always over full messages list, not filtered) ───────────────────
  const todayStr = toLocalDateStr(new Date());
  const stats = [
    { label: "Total",        value: messages.length,                          color: "bg-brand-50 text-brand-700 border-brand-100"        },
    { label: "Order Issues", value: messages.filter((m) => m.subject === "Order Issue" || m.subject === "Delivery Problem").length, color: "bg-red-50 text-red-700 border-red-100" },
    { label: "Feedback",     value: messages.filter((m) => m.subject === "Feedback / Suggestion").length, color: "bg-teal-50 text-teal-700 border-teal-100" },
    { label: "Today",        value: messages.filter((m) => toLocalDateStr(new Date(m.created_at)) === todayStr).length, color: "bg-amber-50 text-amber-700 border-amber-100" },
  ];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-neutral-900">Messages</h1>
          <p className="mt-0.5 text-sm text-neutral-500">Contact messages from customers</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((c) => (
          <div key={c.label} className={`rounded-xl border px-4 py-3 ${c.color}`}>
            <p className="text-xs font-medium opacity-70">{c.label}</p>
            <p className="mt-0.5 font-display text-2xl font-bold">{c.value}</p>
          </div>
        ))}
      </div>

      {/* ── Filter panel ────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-4 space-y-4 shadow-card">

        {/* Row 1: date pickers + presets */}
        <div className="flex flex-wrap items-end gap-3">
          <CalendarDays className="mb-2 h-4 w-4 flex-shrink-0 text-brand-500" />

          <div className="flex flex-col gap-1">
            <label htmlFor="msg-from" className="text-xs font-medium text-neutral-500">From</label>
            <input
              id="msg-from"
              type="date"
              value={dateFrom}
              max={dateTo || undefined}
              onChange={(e) => setDateFrom(e.target.value)}
              className="rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-900 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="msg-to" className="text-xs font-medium text-neutral-500">To</label>
            <input
              id="msg-to"
              type="date"
              value={dateTo}
              min={dateFrom || undefined}
              onChange={(e) => setDateTo(e.target.value)}
              className="rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-900 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
          </div>

          {/* Quick-select preset buttons */}
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => {
              const dates = p.getDates();
              const active = dateFrom === dates.from && dateTo === dates.to;
              return (
                <button
                  key={p.label}
                  onClick={() => {
                    if (active) { setDateFrom(""); setDateTo(""); }
                    else        { setDateFrom(dates.from); setDateTo(dates.to); }
                  }}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                    active
                      ? "border-brand-300 bg-brand-50 text-brand-700"
                      : "border-neutral-200 bg-neutral-50 text-neutral-600 hover:border-brand-200 hover:text-brand-600"
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 2: subject filter + search */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 flex-shrink-0 text-neutral-400" />
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-900 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            >
              {ALL_SUBJECTS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search name, email, or message…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2 pl-9 pr-4 text-sm text-neutral-900 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
          </div>

          {hasFilter && (
            <button
              onClick={clearAll}
              className="flex items-center gap-1.5 rounded-xl border border-neutral-200 px-3 py-2 text-xs font-medium text-neutral-500 hover:border-red-200 hover:bg-red-50 hover:text-red-500 transition-colors whitespace-nowrap"
            >
              <X className="h-3.5 w-3.5" /> Clear all
            </button>
          )}
        </div>
      </div>

      {/* Result count */}
      {hasFilter && (
        <p className="text-sm text-neutral-500">
          Showing{" "}
          <span className="font-semibold text-neutral-800">{filtered.length}</span> of{" "}
          <span className="font-semibold text-neutral-800">{messages.length}</span> messages
        </p>
      )}

      {/* ── Message list ─────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 py-20">
          <Inbox className="h-10 w-10 text-neutral-300" />
          <p className="font-medium text-neutral-500">
            {hasFilter ? "No messages match the current filters" : "No messages yet"}
          </p>
          {hasFilter && (
            <button
              onClick={clearAll}
              className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((msg) => (
            <div
              key={msg.id}
              className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-card"
            >
              {/* Row summary */}
              <button
                className="flex w-full items-start gap-4 p-4 text-left hover:bg-neutral-50 transition-colors"
                onClick={() => setExpanded(expanded === msg.id ? null : msg.id)}
                aria-expanded={expanded === msg.id}
                aria-label={`${expanded === msg.id ? "Collapse" : "Expand"} message from ${msg.name}`}
              >
                {/* Avatar */}
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                  {msg.name.charAt(0).toUpperCase()}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-neutral-900">{msg.name}</span>
                    <SubjectBadge subject={msg.subject} />
                  </div>
                  <p className="mt-0.5 text-xs text-neutral-400">{msg.email}</p>
                  <p className="mt-1 truncate text-sm text-neutral-500">{msg.message}</p>
                </div>

                <div className="flex flex-shrink-0 flex-col items-end gap-2">
                  <span className="text-xs text-neutral-400">{timeAgo(msg.created_at)}</span>
                  {expanded === msg.id
                    ? <ChevronUp   className="h-4 w-4 text-neutral-400" />
                    : <ChevronDown className="h-4 w-4 text-neutral-400" />}
                </div>
              </button>

              {/* Expanded full message */}
              {expanded === msg.id && (
                <div className="border-t border-neutral-100 bg-neutral-50 px-5 py-4 space-y-3">
                  <div className="flex flex-wrap gap-4 text-xs text-neutral-500">
                    <span>
                      <strong className="text-neutral-700">From:</strong>{" "}
                      {msg.name} &lt;{msg.email}&gt;
                    </span>
                    <span>
                      <strong className="text-neutral-700">Sent:</strong>{" "}
                      {new Date(msg.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-700">
                    {msg.message}
                  </p>
                  <a
                    href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject)}`}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-700 transition-colors"
                  >
                    <Mail className="h-3.5 w-3.5" /> Reply via email
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="text-right text-xs text-neutral-400">
        Showing {filtered.length} of {messages.length} messages
      </p>
    </div>
  );
}

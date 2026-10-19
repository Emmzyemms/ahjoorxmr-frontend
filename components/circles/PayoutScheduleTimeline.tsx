"use client";

/**
 * Issue #245 – Payout Schedule Timeline on Circle Detail Page
 *
 * Renders a vertical timeline of all circle rounds showing each
 * recipient, their scheduled payout date, and status (paid / current /
 * upcoming).  The current user's round is highlighted.  The list is
 * collapsible on mobile.
 */

import { useState } from "react";
import { CheckCircle2, Clock, Zap, ChevronDown, ChevronUp } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type RoundStatus = "paid" | "current" | "upcoming";

export interface PayoutRound {
  /** 1-based round number */
  round: number;
  /** Display name or truncated address of the recipient */
  recipient: string;
  /** Avatar URL; falls back to initials */
  avatarUrl?: string;
  /** ISO date string */
  date: string;
  status: RoundStatus;
  /** Whether this round belongs to the viewing user */
  isCurrentUser?: boolean;
}

interface PayoutScheduleTimelineProps {
  rounds: PayoutRound[];
  /** Hides collapse toggle – useful when already inside a collapsible panel */
  alwaysExpanded?: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function StatusIcon({ status }: { status: RoundStatus }) {
  switch (status) {
    case "paid":
      return (
        <CheckCircle2
          size={18}
          aria-label="Paid"
          className="text-emerald-400 flex-shrink-0"
        />
      );
    case "current":
      return (
        <Zap
          size={18}
          aria-label="Current round"
          className="text-amber-400 flex-shrink-0"
        />
      );
    case "upcoming":
    default:
      return (
        <Clock
          size={18}
          aria-label="Upcoming"
          className="text-[#A1A1AA] flex-shrink-0"
        />
      );
  }
}

function statusLabel(status: RoundStatus): string {
  switch (status) {
    case "paid":
      return "Paid";
    case "current":
      return "Current";
    case "upcoming":
      return "Upcoming";
  }
}

function statusBadgeClass(status: RoundStatus): string {
  switch (status) {
    case "paid":
      return "bg-emerald-500/15 text-emerald-300";
    case "current":
      return "bg-amber-500/15 text-amber-300";
    case "upcoming":
      return "bg-white/5 text-[#A1A1AA]";
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PayoutScheduleTimeline({
  rounds,
  alwaysExpanded = false,
}: PayoutScheduleTimelineProps) {
  const [expanded, setExpanded] = useState(true);

  if (!rounds || rounds.length === 0) return null;

  return (
    <section aria-labelledby="payout-timeline-heading" className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3
          id="payout-timeline-heading"
          className="text-sm font-semibold text-[var(--foreground,#F4F4F5)]"
        >
          Payout Schedule
        </h3>
        {!alwaysExpanded && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            aria-controls="payout-timeline-list"
            className="flex items-center gap-1 text-xs text-[#A1A1AA] hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76] rounded sm:hidden"
          >
            {expanded ? (
              <>
                Collapse <ChevronUp size={14} aria-hidden="true" />
              </>
            ) : (
              <>
                Expand <ChevronDown size={14} aria-hidden="true" />
              </>
            )}
          </button>
        )}
      </div>

      {/* Timeline */}
      <ol
        id="payout-timeline-list"
        className={`relative flex flex-col gap-0 ${!alwaysExpanded && !expanded ? "hidden sm:flex" : "flex"}`}
      >
        {rounds.map((round, idx) => {
          const isLast = idx === rounds.length - 1;

          return (
            <li
              key={round.round}
              className={`relative flex items-start gap-4 pl-0 ${
                round.isCurrentUser
                  ? "rounded-xl bg-[#4B6B76]/10 border border-[#4B6B76]/30 px-3 py-2.5 -mx-3"
                  : "py-2"
              }`}
              aria-current={round.status === "current" ? "step" : undefined}
            >
              {/* Vertical connector */}
              {!isLast && (
                <span
                  aria-hidden="true"
                  className={`absolute left-[22px] top-[36px] h-full w-px ${
                    round.status === "paid"
                      ? "bg-emerald-500/30"
                      : "bg-white/10"
                  }`}
                  style={{ bottom: 0 }}
                />
              )}

              {/* Avatar */}
              <div className="relative z-10 flex-shrink-0">
                {round.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={round.avatarUrl}
                    alt={round.recipient}
                    className="h-10 w-10 rounded-full object-cover border border-white/10"
                  />
                ) : (
                  <div
                    aria-hidden="true"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2A2A2A] border border-white/10 text-xs font-semibold text-[#A1A1AA] select-none"
                  >
                    {initials(round.recipient)}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-[var(--foreground,#F4F4F5)] truncate">
                    {round.recipient}
                  </span>
                  {round.isCurrentUser && (
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-[#4B6B76] border border-[#4B6B76]/40 rounded-full px-1.5 py-0.5 leading-none flex-shrink-0">
                      You
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="text-xs text-[#A1A1AA]">
                    Round {round.round} · {formatDate(round.date)}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-medium rounded-full px-2 py-0.5 leading-none ${statusBadgeClass(round.status)}`}
                  >
                    <StatusIcon status={round.status} />
                    {statusLabel(round.status)}
                  </span>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

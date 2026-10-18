"use client";

/**
 * <RelativeTime> — renders a human-friendly relative timestamp that updates
 * automatically every minute.
 *
 * - Uses Intl.RelativeTimeFormat so the output is locale-aware.
 * - Exposes the full ISO date via the <time dateTime> attribute and a
 *   title tooltip so assistive technology and power users can see the
 *   exact moment.
 * - Uses a single shared interval across all mounted instances to avoid
 *   spawning one timer per component.
 */

import { useEffect, useState } from "react";

// ---------------------------------------------------------------------------
// Shared interval manager
// ---------------------------------------------------------------------------

type Listener = () => void;

let sharedInterval: ReturnType<typeof setInterval> | null = null;
const listeners = new Set<Listener>();

function subscribe(fn: Listener): () => void {
  listeners.add(fn);
  if (!sharedInterval) {
    sharedInterval = setInterval(() => {
      listeners.forEach((l) => l());
    }, 60_000);
  }
  return () => {
    listeners.delete(fn);
    if (listeners.size === 0 && sharedInterval !== null) {
      clearInterval(sharedInterval);
      sharedInterval = null;
    }
  };
}

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

const UNITS: { unit: Intl.RelativeTimeFormatUnit; ms: number }[] = [
  { unit: "year", ms: 1000 * 60 * 60 * 24 * 365 },
  { unit: "month", ms: 1000 * 60 * 60 * 24 * 30 },
  { unit: "week", ms: 1000 * 60 * 60 * 24 * 7 },
  { unit: "day", ms: 1000 * 60 * 60 * 24 },
  { unit: "hour", ms: 1000 * 60 * 60 },
  { unit: "minute", ms: 1000 * 60 },
];

function formatRelative(date: Date, now: Date): string {
  const diffMs = date.getTime() - now.getTime();
  const absMs = Math.abs(diffMs);
  const sign = diffMs < 0 ? -1 : 1;

  const formatter = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });

  for (const { unit, ms } of UNITS) {
    if (absMs >= ms) {
      return formatter.format(Math.round((diffMs / ms) * sign) * sign, unit);
    }
  }

  return formatter.format(0, "second");
}

function formatFull(date: Date): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "long",
    timeStyle: "short",
  }).format(date);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface RelativeTimeProps {
  /** The date to display. Accepts a Date, an ISO-8601 string, or a timestamp. */
  date: Date | string | number;
  className?: string;
}

export function RelativeTime({ date, className }: RelativeTimeProps) {
  const parsed = date instanceof Date ? date : new Date(date);
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const unsub = subscribe(() => forceUpdate((n) => n + 1));
    return unsub;
  }, []);

  const now = new Date();
  const relative = formatRelative(parsed, now);
  const full = formatFull(parsed);

  return (
    <time
      dateTime={parsed.toISOString()}
      title={full}
      className={className}
    >
      {relative}
    </time>
  );
}

export default RelativeTime;

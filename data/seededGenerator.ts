/**
 * Seeded deterministic fake data generator using @faker-js/faker.
 * Same seed always yields the same data. Keeps exports compatible with the
 * existing `data/` modules so pages require no changes.
 *
 * Edge cases covered:
 *  - Very long display names (50+ chars)
 *  - Zero-balance members
 *  - Circles with 50+ members
 *  - Completed circles
 */

import { faker } from "@faker-js/faker";

const DEFAULT_SEED = 42;

export function createSeededFaker(seed: number = DEFAULT_SEED) {
  faker.seed(seed);
  return faker;
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface GeneratedMember {
  address: string;
  displayName: string;
  balance: number;
  onTimeContributions: number;
  totalContributions: number;
  circlesCompleted: number;
  disputes: number;
  memberSince: string;
}

export interface GeneratedCircle {
  id: string;
  name: string;
  creator: string;
  members: string[];
  totalSlots: number;
  contribution: string;
  duration: string;
  currentRound: number;
  totalRounds: number;
  status: "active" | "completed" | "pending";
  description: string;
  category: "family" | "friends" | "community" | "business" | "emergency" | "other";
}

export interface GeneratedContribution {
  id: string;
  circleId: string;
  circleName: string;
  memberId: string;
  amount: number;
  token: string;
  status: "on-time" | "late" | "missed";
  round: number;
  date: string;
}

export interface GeneratedPayout {
  id: string;
  circleId: string;
  circleName: string;
  recipient: string;
  amount: number;
  token: string;
  round: number;
  date: string;
}

// ── Generators ────────────────────────────────────────────────────────────────

const TOKENS = ["USDT", "USDC", "XLM", "STRK"] as const;
const CATEGORIES = ["family", "friends", "community", "business", "emergency", "other"] as const;
const STATUSES = ["active", "completed", "pending"] as const;

function randomHexAddress(f: typeof faker): string {
  return "0x" + f.string.hexadecimal({ length: 40, casing: "lower", prefix: "" });
}

export function generateMembers(count: number, seed: number = DEFAULT_SEED): GeneratedMember[] {
  const f = createSeededFaker(seed);
  return Array.from({ length: count }, (_, i) => {
    const total = f.number.int({ min: 1, max: 36 });
    const onTime = f.number.int({ min: 0, max: total });
    // Edge case: every 15th member has a very long name
    const displayName =
      i % 15 === 0
        ? f.lorem.words(8) // very long name
        : f.person.fullName();
    // Edge case: every 10th member has zero balance
    const balance = i % 10 === 0 ? 0 : f.number.float({ min: 10, max: 5000, fractionDigits: 2 });
    return {
      address: randomHexAddress(f),
      displayName,
      balance,
      onTimeContributions: onTime,
      totalContributions: total,
      circlesCompleted: f.number.int({ min: 0, max: 8 }),
      disputes: f.number.int({ min: 0, max: 3 }),
      memberSince: f.date.past({ years: 3 }).toLocaleDateString("en-US", { month: "long", year: "numeric" }),
    };
  });
}

export function generateCircles(count: number, seed: number = DEFAULT_SEED): GeneratedCircle[] {
  const f = createSeededFaker(seed);
  const members = generateMembers(60, seed + 1);

  return Array.from({ length: count }, (_, i) => {
    const totalSlots = i % 8 === 0 ? 52 : f.number.int({ min: 3, max: 20 }); // edge: 50+ members
    const memberAddresses = members.slice(0, totalSlots).map((m) => m.address);
    const totalRounds = totalSlots;
    const currentRound = f.number.int({ min: 1, max: totalRounds });
    // Edge case: every 5th circle is completed
    const status = i % 5 === 0 ? "completed" : f.helpers.arrayElement([...STATUSES]);
    return {
      id: String(i + 1),
      name: f.company.name(),
      creator: memberAddresses[0],
      members: memberAddresses,
      totalSlots,
      contribution: `${f.number.int({ min: 10, max: 500 })} ${f.helpers.arrayElement([...TOKENS])}`,
      duration: `${f.number.int({ min: 7, max: 90 })} Days`,
      currentRound,
      totalRounds,
      status,
      description: f.lorem.sentence(),
      category: f.helpers.arrayElement([...CATEGORIES]),
    };
  });
}

export function generateContributions(
  circles: GeneratedCircle[],
  seed: number = DEFAULT_SEED
): GeneratedContribution[] {
  const f = createSeededFaker(seed);
  const CONTRIBUTION_STATUSES = ["on-time", "late", "missed"] as const;
  const results: GeneratedContribution[] = [];

  for (const circle of circles) {
    for (let round = 1; round <= Math.min(circle.currentRound, 5); round++) {
      for (const member of circle.members.slice(0, Math.min(circle.members.length, 5))) {
        results.push({
          id: `${circle.id}-${round}-${member.slice(-4)}`,
          circleId: circle.id,
          circleName: circle.name,
          memberId: member,
          amount: parseInt(circle.contribution.split(" ")[0], 10),
          token: circle.contribution.split(" ")[1] ?? "USDT",
          status: f.helpers.arrayElement([...CONTRIBUTION_STATUSES]),
          round,
          date: f.date.recent({ days: 90 }).toISOString().slice(0, 10),
        });
      }
    }
  }
  return results;
}

export function generatePayouts(
  circles: GeneratedCircle[],
  seed: number = DEFAULT_SEED
): GeneratedPayout[] {
  const f = createSeededFaker(seed);
  return circles.flatMap((circle) =>
    Array.from({ length: Math.min(circle.currentRound, 3) }, (_, i) => ({
      id: `payout-${circle.id}-${i + 1}`,
      circleId: circle.id,
      circleName: circle.name,
      recipient: circle.members[i] ?? circle.creator,
      amount: parseInt(circle.contribution.split(" ")[0], 10) * circle.members.length,
      token: circle.contribution.split(" ")[1] ?? "USDT",
      round: i + 1,
      date: f.date.recent({ days: 90 }).toISOString(),
    }))
  );
}

// ── Default exports (seed 42 — deterministic) ─────────────────────────────────

export const SEEDED_CIRCLES = generateCircles(12);
export const SEEDED_MEMBERS = generateMembers(60);
export const SEEDED_CONTRIBUTIONS = generateContributions(SEEDED_CIRCLES);
export const SEEDED_PAYOUTS = generatePayouts(SEEDED_CIRCLES);

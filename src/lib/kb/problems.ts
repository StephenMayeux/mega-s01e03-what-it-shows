// The problems a ticket really holds. causes.ts sorts reports by tenant and channel; this file adds
// what the desk read in the bodies (desk-notes.json), so a report the desk read differently gets
// its own problem instead of a footnote.
import { causeOf, type Cause, type Report, type Tenant } from '#lib/kb/causes';

// `shift`: the date lands one day early or late, not month for day. The parser can't do that:
// swapping day and month never moves a date by one. Something converts the time and loses a day.
export type Problem = Cause | 'shift';

export const PROBLEMS: Record<Problem, { title: string; what: string }> = {
  parser: {
    title: 'Shared parser reads day-first dates month first',
    what: 'Day and month swap: 7 April goes out as 4 July.',
  },
  hint: {
    title: 'booking-v3 date hint says MM/DD/YYYY to day-first tenants',
    what: 'People type what the hint says; the form reads it day first. Same swap, different fix.',
  },
  shift: {
    title: 'Dates move by one day',
    what: 'Tuesday becomes Monday; Lisbon and Toronto get different days for one meeting.',
  },
};

export function problemOf(
  r: Pick<Report, 'id' | 'channel'>,
  t: Tenant | undefined,
  readAsShift: readonly string[],
): Problem | null {
  if (readAsShift.includes(r.id)) return 'shift';
  return causeOf(r, t);
}

export type ProblemGroup = { problem: Problem | 'unplaced'; reports: Report[]; tenants: number; firstSeen: string; lastSeen: string };

export function groupByProblem(
  reports: Report[],
  tenantOf: (r: Report) => Tenant | undefined,
  readAsShift: readonly string[],
): ProblemGroup[] {
  const by = new Map<ProblemGroup['problem'], Report[]>();
  for (const r of reports) {
    const p = problemOf(r, tenantOf(r), readAsShift) ?? 'unplaced';
    by.set(p, [...(by.get(p) ?? []), r]);
  }
  return [...by.entries()]
    .map(([problem, rs]) => {
      const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
      return { problem, reports: rs, tenants: new Set(rs.map((r) => r.tenant)).size, firstSeen: days[0], lastSeen: days[days.length - 1] };
    })
    .sort((a, b) => b.reports.length - a.reports.length);
}

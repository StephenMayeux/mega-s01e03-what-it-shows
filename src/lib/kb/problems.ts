// The problems a ticket really holds. causes.ts sorts reports by tenant and channel; the desk also
// reads some bodies differently (desk-notes.json). Those get their own problem, but stay counted
// where the desk files them, so the numbers match the desk's own view.
import type { Cause } from '#lib/kb/causes';

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

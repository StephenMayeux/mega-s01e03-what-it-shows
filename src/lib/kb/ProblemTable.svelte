<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { groupByCause, readAs, uniqueById, type Report } from '#lib/kb/causes';
  import { PROBLEMS, type Problem } from '#lib/kb/problems';
  import { tenantOf } from '#lib/kb/locales';

  // `tickets`: where each problem is filed now, problem → link.
  let { ticket, tickets = {} }: { ticket: number; tickets?: Partial<Record<Problem, string>> } = $props();

  const all = $derived((reports as Report[]).filter((r) => r.mergedInto === ticket));
  const merged = $derived(uniqueById(all));
  const groups = $derived(groupByCause(merged, tenantOf));

  // Counted the desk's way: by cause, then the one-day moves the desk read in each cause, under it.
  const rows = $derived(
    groups.flatMap((g) => {
      const shift = readAs(g, notes.oneDayMove);
      const row = { problem: g.cause, count: g.reports.length, tenants: g.tenants, seen: `${g.firstSeen} → ${g.lastSeen}`, under: null as string | null };
      return shift ? [row, { problem: 'shift' as const, count: shift, tenants: null, seen: '', under: g.cause }] : [row];
    }),
  );
  const problems = $derived(new Set(rows.map((r) => r.problem)).size);
  const label = (url?: string) => url?.replace(/^.*\/issues\//, '#');
</script>

<p class="sum">
  <strong>{merged.length}</strong> reports in #{ticket} ({all.length} rows in the export, {all.length - merged.length} of them
  repeats) · <strong>{problems}</strong>
  {problems === 1 ? 'problem' : 'problems'}
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>tenants</th><th>seen</th><th>ticket</th></tr>
  </thead>
  <tbody>
    {#each rows as r (r.problem)}
      <tr class:sub={r.under}>
        <td>
          {#if r.problem === 'unplaced'}<code>unplaced</code>{:else}<b>{PROBLEMS[r.problem].title}</b><br /><span class="what">{PROBLEMS[r.problem].what}</span>{/if}
          {#if r.under}<br /><span class="what">Also counted under <code>{r.under}</code>: the desk files these by tenant.</span>{/if}
        </td>
        <td>{r.count}</td>
        <td>{r.tenants ?? ''}</td>
        <td>{r.seen}</td>
        <td>{#if r.problem !== 'unplaced' && tickets[r.problem]}<a href={tickets[r.problem]}>{label(tickets[r.problem])}</a>{:else}—{/if}</td>
      </tr>
    {/each}
  </tbody>
</table>

<style>
  .sum { font-size: 1.1rem; }
  .what { color: var(--muted); font-size: 0.85em; }
  .sub td:first-child { padding-left: 1.5rem; }
</style>

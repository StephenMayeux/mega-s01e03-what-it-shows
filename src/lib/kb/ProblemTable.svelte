<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { uniqueById, type Report } from '#lib/kb/causes';
  import { groupByProblem, PROBLEMS, type Problem } from '#lib/kb/problems';
  import { tenantOf } from '#lib/kb/locales';

  // `tickets`: where each problem is filed now, problem → link.
  let { ticket, tickets = {} }: { ticket: number; tickets?: Partial<Record<Problem, string>> } = $props();

  const merged = $derived(uniqueById(reports as Report[]).filter((r) => r.mergedInto === ticket));
  const groups = $derived(groupByProblem(merged, tenantOf, notes.oneDayMove));
  const rows = $derived((reports as Report[]).filter((r) => r.mergedInto === ticket).length);
  const intakeRight = (g: (typeof groups)[number]) => g.reports.filter((r) => r.meta.intakeTag === g.problem).length;
</script>

<p class="sum">
  <strong>{merged.length}</strong> reports in #{ticket} ({rows} rows in the export, {rows - merged.length} of them
  repeats) · <strong>{groups.length}</strong>
  {groups.length === 1 ? 'problem' : 'problems'}
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>tenants</th><th>seen</th><th>intake tag right</th><th>ticket</th></tr>
  </thead>
  <tbody>
    {#each groups as g (g.problem)}
      <tr>
        <td>
          {#if g.problem === 'unplaced'}<code>unplaced</code>{:else}<b>{PROBLEMS[g.problem].title}</b><br /><span class="what">{PROBLEMS[g.problem].what}</span>{/if}
        </td>
        <td>{g.reports.length}</td>
        <td>{g.tenants}</td>
        <td>{g.firstSeen} → {g.lastSeen}</td>
        <td>{intakeRight(g)} of {g.reports.length}</td>
        <td>
          {#if g.problem !== 'unplaced' && tickets[g.problem]}<a href={tickets[g.problem]}>{tickets[g.problem]?.replace(/^.*\/issues\//, '#')}</a>{:else}—{/if}
        </td>
      </tr>
    {/each}
  </tbody>
</table>

<style>
  .sum { font-size: 1.1rem; }
  .what { color: var(--muted); font-size: 0.85em; }
</style>

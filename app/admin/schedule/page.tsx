"use client";

import { useMemo, useState } from 'react';
import { Database, Download, Home } from 'lucide-react';
import Link from 'next/link';
import data from '@/lib/workbook-data.json';
import { calculateRow } from '@/lib/sheet-engine.mjs';
import {
  type WorkbookSheet,
  workbookDisplay,
  workbookLabel,
  workbookSheetLabel,
} from '@/lib/workbook-format';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAdminAccess } from '../../admin-access';
import SiteFooter from '../../site-footer';

const sheets = (data as WorkbookSheet[]).filter((sheet) => !sheet.notes);

function escapeCsv(value: string) {
  const safe = /^[=+@\-]/.test(value) ? `'${value}` : value;
  return `"${safe.replaceAll('"', '""')}"`;
}

function ScheduleTable({ sheet }: { sheet: WorkbookSheet }) {
  const [query, setQuery] = useState('');
  const keys = Object.keys(sheet.headers);
  const rows = useMemo(
    () => sheet.rows.map((row) => ({ source: row, values: calculateRow(row, {}) })),
    [sheet],
  );
  const visibleRows = rows.filter(({ values }) =>
    String(values.A ?? '').toLowerCase().includes(query.trim().toLowerCase()),
  );

  function exportCsv() {
    const lines = [
      keys.map((column) => workbookLabel(sheet, column)),
      ...visibleRows.map(({ values }) => keys.map((column) => workbookDisplay(sheet, column, values[column]))),
    ];
    const blob = new Blob(
      [`\uFEFF${lines.map((row) => row.map(escapeCsv).join(',')).join('\r\n')}`],
      { type: 'text/csv;charset=utf-8' },
    );
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${workbookSheetLabel(sheet.name).toLowerCase().replace(/[^a-z0-9]+/g, '-')}-schedule.csv`;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <section className="panel full-sheet admin-sheet-panel">
      <div className="panel-heading admin-sheet-heading">
        <div>
          <p className="section-kicker">ADMIN VIEW</p>
          <h2>{workbookSheetLabel(sheet.name)}</h2>
          <p>{visibleRows.length} properties · {keys.length} columns</p>
        </div>
        <Button variant="outline" onClick={exportCsv}><Download aria-hidden="true" /> Export CSV</Button>
      </div>
      <Input
        className="admin-search"
        aria-label="Find a property"
        placeholder="Find a property address…"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <Table>
        <TableHeader><TableRow>{keys.map((column) => <TableHead key={column}>{workbookLabel(sheet, column)}</TableHead>)}</TableRow></TableHeader>
        <TableBody>
          {visibleRows.map(({ source, values }) => (
            <TableRow key={source.row}>
              {keys.map((column) => (
                <TableCell key={column} className={source.cells[column].f ? 'sheet-result' : 'sheet-input'}>
                  {workbookDisplay(sheet, column, values[column])}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {visibleRows.length === 0 && <p className="admin-empty">No property matches that address.</p>}
    </section>
  );
}

export default function AdminSchedulePage() {
  const { state, user } = useAdminAccess();

  if (state !== 'admin') {
    return (
      <main>
        <header className="topbar">
          <div className="brand-mark"><Database aria-hidden="true" /></div>
          <div><p className="eyebrow">PRIVATE ADMIN AREA</p><h1>Property schedule</h1></div>
          <Link className="admin-nav-link" href="/"><Home aria-hidden="true" /> Calculator</Link>
        </header>
        <section className="workspace admin-access-page">
          <div className="panel admin-access-card">
            <p className="section-kicker">ADMIN ACCESS</p>
            <h2>{state === 'loading' ? 'Checking your account…' : state === 'signed-out' ? 'Sign in required' : 'Access denied'}</h2>
            {state === 'signed-out' && <p>Sign in with an administrator account from the Your account button on the calculator page.</p>}
            {state === 'denied' && <p>{user?.email ?? 'This account'} does not have permission to view the complete schedule.</p>}
            {state !== 'loading' && <Button asChild><Link href="/">Return to calculator</Link></Button>}
          </div>
        </section>
        <SiteFooter />
      </main>
    );
  }

  return (
    <main className="admin-schedule-page">
      <header className="topbar">
        <div className="brand-mark"><Database aria-hidden="true" /></div>
        <div><p className="eyebrow">PRIVATE ADMIN AREA</p><h1>Complete property schedule</h1></div>
        <Link className="admin-nav-link" href="/"><Home aria-hidden="true" /> Calculator</Link>
      </header>
      <section className="workspace workbook admin-workspace">
        <div className="admin-intro">
          <div><p className="section-kicker">ALL WORKBOOK DATA</p><h2>Every property · every column</h2></div>
          <p>Signed in as <strong>{user?.email}</strong></p>
        </div>
        <Tabs defaultValue={sheets[0].name}>
          <TabsList className="sheet-tabs">
            {sheets.map((sheet) => <TabsTrigger key={sheet.name} value={sheet.name}>{workbookSheetLabel(sheet.name)}</TabsTrigger>)}
          </TabsList>
          {sheets.map((sheet) => <TabsContent key={sheet.name} value={sheet.name}><ScheduleTable sheet={sheet} /></TabsContent>)}
        </Tabs>
      </section>
      <SiteFooter />
    </main>
  );
}

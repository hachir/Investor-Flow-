"use client";

import { useState } from 'react';
import { Input } from '@/components/ui/input';

const grouped = new Intl.NumberFormat('en-US', { maximumFractionDigits: 20 });

export default function MoneyInput({ value, onChange, label, readOnly = false }: {
  value: string | number;
  onChange: (value: string) => void;
  label: string;
  readOnly?: boolean;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const formatted = value === '' ? '' : grouped.format(Number(value));
  return <><b aria-hidden="true">$</b><Input
    aria-label={`${label} (USD)`}
    type="text"
    inputMode="decimal"
    readOnly={readOnly}
    value={draft ?? formatted}
    onFocus={event => {
      if (readOnly) return;
      setDraft(String(value));
      event.currentTarget.select();
    }}
    onChange={event => {
      const raw = event.target.value.replace(/[$,\s]/g, '');
      if (!/^-?\d*\.?\d*$/.test(raw)) return;
      setDraft(raw);
      if (raw === '') onChange('');
      else if (Number.isFinite(Number(raw))) onChange(raw);
    }}
    onBlur={() => setDraft(null)}
  /></>;
}

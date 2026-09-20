"use client";
import { useState } from 'react';
import MoneyInput from './money-input';
import GrowthChart from './growth-chart';
import InvestorMotion from './investor-motion';
import data from '@/lib/workbook-data.json';
import { calculateRow } from '@/lib/sheet-engine.mjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/table';

type Row = {row:number;cells:Record<string,{v:string|number;f:string|null}>};
type Sheet = {name:string;headers:Record<string,string|number>;rows:Row[];notes?: (string|number)[][]};
const sheets=data as Sheet[];
const currency=new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',minimumFractionDigits:2,maximumFractionDigits:2});
const dateString=(v:number)=>new Date((v-25569)*86400000).toISOString().slice(0,10);
const serial=(v:string)=>Math.round(Date.parse(v+'T00:00:00Z')/86400000)+25569;
function kind(sheet:Sheet,col:string) {
  const h=String(sheet.headers[col]).toLowerCase();
  if (h.includes('date') || h==='date buying') return 'date';
  if (h.includes('rate') || h.includes('percentage') || h.includes('ltv') || h.includes('annual return') || sheet.headers[col]===0.5) return 'percent';
  return col==='A'?'text':'money';
}
function label(sheet:Sheet,col:string) { return sheet.headers[col]===0.5?'50% of the annual return':String(sheet.headers[col]).trim(); }
function display(sheet:Sheet,col:string,v:string|number) {
  if(v==='') return 'Not provided';
  if(typeof v==='string') return v;
  const k=kind(sheet,col);
  return k==='date'?dateString(v):k==='percent'?(v*100).toFixed(2)+'%':currency.format(v);
}
export default function WorkbookView({onNewEstimate}:{onNewEstimate:()=>void}) {
  const visibleSheets=sheets.filter(s=>!s.notes);
  return <main><header className="topbar"><div><p className="eyebrow">INVESTOR FLOW</p><h1>Mohammed Alhareb</h1></div><Button className="as-of" onClick={onNewEstimate}>New estimate · today</Button></header>
    <section className="workspace workbook"><p className="source-note">Imported workbook · original property dates and cell formulas. Green: editable inputs. Yellow: calculated results. Changes apply to this session only.</p>
    <Tabs defaultValue={visibleSheets[0].name}><TabsList className="sheet-tabs">{visibleSheets.map(s=><TabsTrigger key={s.name} value={s.name}>{s.name}</TabsTrigger>)}</TabsList>
    {visibleSheets.map(s=><TabsContent key={s.name} value={s.name}><SheetView sheet={s}/></TabsContent>)}
    </Tabs></section></main>;
}
function SheetView({sheet}:{sheet:Sheet}) {
  const [selected,setSelected]=useState(0);
  const [search,setSearch]=useState('');
  const [view,setView]=useState('deal');
  const [sort,setSort]=useState('address');
  const [edits,setEdits]=useState<Record<number,Record<string,string|number>>>({});
  const rows=sheet.rows.map(r=>calculateRow(r,edits[r.row]));
  const row=sheet.rows[selected],values=rows[selected];
  const sf=sheet.name==='Buying with SF';
  const keys=Object.keys(sheet.headers);
  const change=(col:string,v:string)=>setEdits(prev=>({...prev,[row.row]:{...prev[row.row],[col]:v===''?'':kind(sheet,col)==='text'?v:kind(sheet,col)==='date'?serial(v):Number(v)/(kind(sheet,col)==='percent'?100:1)}}));
  const summary=sheet.name==='50% partnership'?['X','AC','AG','AH']:sheet.name==='Without Mo'?['AA','AF','AJ','AK']:['U','T','Y','Z'];
  const original=calculateRow(row,{});
  const moneyLeft=Number(values[summary[1]]);
  const costCol=sheet.name==='Without Mo'?'AD':'AA';
  const costParts=sheet.name==='Without Mo'?['L','E','M','Q','U','V','W']:['L','E','M','Q','U','Y','Z'];
  const appreciationCol=sheet.name==='Without Mo'?'AG':'AD';
  const changed=Object.keys(edits[row.row]||{}).some(c=>edits[row.row][c]!==row.cells[c].v);
  const ranked=rows.map((v,i)=>({v,i})).sort((a,b)=>sort==='address'?String(a.v.A).localeCompare(String(b.v.A)):Number(b.v[sort])-Number(a.v[sort]));
  function exportCsv() {
    const escape=(v:string)=>'"'+(/^[=+@\-]/.test(v)?"'":'')+v.replaceAll('"','""')+'"';
    const lines=[['Section','Value'],...keys.map(c=>[label(sheet,c),display(sheet,c,values[c])])];
    const url=URL.createObjectURL(new Blob(['\uFEFF'+lines.map(r=>r.map(escape).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'}));
    const a=document.createElement('a');a.href=url;a.download='property-results.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  return <>
    <div className="analysis-toolbar"><div className="view-buttons"><Button variant={view==='deal'?'default':'outline'} onClick={()=>setView('deal')} aria-pressed={view==='deal'}>Deal analysis</Button><Button variant={view==='compare'?'default':'outline'} onClick={()=>setView('compare')} aria-pressed={view==='compare'}>Compare properties</Button></div><div className="view-buttons"><Button variant="outline" onClick={exportCsv}>Export selected deal</Button><Button variant="outline" onClick={()=>window.print()}>Print</Button></div></div>
    {view==='compare'&&<section className="panel comparison"><div className="panel-heading"><h3>Property comparison</h3><label>Sort by <select aria-label="Sort properties" value={sort} onChange={e=>setSort(e.target.value)}><option value="address">Address</option>{!sf&&summary.map(c=><option key={c} value={c}>{label(sheet,c)} · highest first</option>)}</select></label></div><Table><TableHeader><TableRow><TableHead>Property</TableHead>{summary.map(c=><TableHead key={c}>{label(sheet,c)}</TableHead>)}</TableRow></TableHeader><TableBody>{ranked.map(({v,i})=><TableRow key={i} data-selected={selected===i}><TableCell><Button variant="ghost" onClick={()=>{setSelected(i);setView('deal');}}>{String(v.A)}</Button></TableCell>{summary.map(c=><TableCell key={c} className="sheet-result">{display(sheet,c,v[c])}</TableCell>)}</TableRow>)}</TableBody></Table></section>}
    <div className="property-selector-inline"><label htmlFor={`property-${sheet.name}`}>Property</label><select id={`property-${sheet.name}`} value={selected} onChange={e=>setSelected(Number(e.target.value))}>{sheet.rows.map((r,i)=><option key={r.row} value={i}>{String(rows[i].A)}</option>)}</select></div>
    {sf&&<p className="source-note">This source worksheet contains only the address, purchase price, ARV, rehab cost, market rent and two dates. All other cells have no values or formulas; they remain uncalculated here.</p>}
    <h2 className="property-title">{String(values.A)}</h2>
    <p className="scenario-status">{changed?'Edited scenario · compared with original workbook':'Original workbook scenario'}<span>Session only</span></p>
    <section className="metric-grid">{summary.map((col,i)=><article className={'metric'+(i===0?' featured':'')} key={col}><span>{label(sheet,col)}</span><strong>{display(sheet,col,values[col])}</strong><small>{changed&&typeof values[col]==='number'&&typeof original[col]==='number'?`Change: ${kind(sheet,col)==='percent'?((Number(values[col])-Number(original[col]))*100).toFixed(2)+' percentage points':currency.format(Number(values[col])-Number(original[col]))}`:row.cells[col]?.f?'Original workbook calculation':'Not provided in source'}</small></article>)}</section>
    {!sf&&<section className="panel cost-breakdown"><div className="panel-heading"><div><p className="eyebrow">CAPITAL REQUIRED</p><h3>Total cost</h3></div><strong>{display(sheet,costCol,values[costCol])}</strong></div><div className="cost-bars">{costParts.map(c=><div className="cost-item" key={c}><div><span>{label(sheet,c)}</span><b>{display(sheet,c,values[c])}</b></div><div className="cost-track"><i style={{width:Math.min(100,Math.max(0,Number(values[c])/Math.max(1,Number(values[costCol]))*100))+'%'}}/></div></div>)}</div></section>}
    <div className="content-grid"><section className="panel investor-inputs-panel"><div className="panel-heading"><h3>Investor inputs</h3><Button variant="outline" onClick={()=>setEdits(p=>({...p,[row.row]:{}}))}>Restore source row</Button></div><p className="source-note">Original dates are preserved for exact comparison. Holding cost uses the actual days from purchase to refinance, not a fixed 105 days.</p><div className="fields">{keys.filter(col=>!row.cells[col].f && (!sf || row.cells[col].v!=='')).map(col=>{
      const k=kind(sheet,col),v=values[col];
      const input=v===''?'':k==='date'?dateString(Number(v)):k==='percent'?Number((Number(v)*100).toFixed(10)):v;
      return <label className="field" key={`${row.row}-${col}`}><span>{label(sheet,col)} {k==='percent'?'(%)':''}</span><div className="field-control">{k==='money'?<MoneyInput label={label(sheet,col)} value={input} onChange={v=>change(col,v)}/>:<Input aria-label={label(sheet,col)} type={k==='date'?'date':k==='text'?'text':'number'} step="any" value={input} onFocus={e=>{if(k==='percent')e.currentTarget.select();}} onChange={e=>change(col,e.target.value)}/>}</div>{col==='M'&&!sf&&!row.cells.M.f&&<small>Manual value in source workbook</small>}</label>;
    })}</div>
    {!sf&&<GrowthChart arv={Number(values.C)} loan={Number(values.S)} rate={Number(values.T)} appreciation={Number(values[appreciationCol])} invested={moneyLeft}/>}
    <InvestorMotion />
    </section>
    <section className="panel workbook-results"><div className="panel-heading"><h3>Results</h3><span className="result-count">{keys.length} sections</span></div><Input className="result-search" aria-label="Find a result" placeholder="Find a result…" value={search} onChange={e=>setSearch(e.target.value)}/><Table><TableHeader><TableRow><TableHead>Section</TableHead><TableHead>Result</TableHead></TableRow></TableHeader><TableBody>{keys.filter(c=>label(sheet,c).toLowerCase().includes(search.toLowerCase())).map(col=><TableRow key={col}><TableCell className="note-cell">{label(sheet,col)}</TableCell><TableCell className={row.cells[col].f?'sheet-result':'sheet-input'}>{display(sheet,col,values[col])}</TableCell></TableRow>)}</TableBody></Table>{!keys.some(c=>label(sheet,c).toLowerCase().includes(search.toLowerCase()))&&<p className="source-note">No matching sections. Try a different name.</p>}</section></div>
    <section className="panel full-sheet"><h3>Complete property schedule — all columns</h3><Table><TableHeader><TableRow>{keys.map(col=><TableHead key={col}>{label(sheet,col)}</TableHead>)}</TableRow></TableHeader><TableBody>{sheet.rows.map((r,i)=><TableRow key={r.row}>{keys.map(col=><TableCell key={col} className={r.cells[col].f?'sheet-result':'sheet-input'}>{display(sheet,col,rows[i][col])}</TableCell>)}</TableRow>)}</TableBody></Table></section>
  </>;
}

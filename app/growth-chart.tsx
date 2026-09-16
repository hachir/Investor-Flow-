"use client";
import { useState } from 'react';
import { cumulativePrincipal } from '@/lib/sheet-engine.mjs';

const money=new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',minimumFractionDigits:2,maximumFractionDigits:2});
export default function GrowthChart({arv,loan,rate,appreciation,invested}:{arv:number;loan:number;rate:number;appreciation:number;invested:number}) {
  const [year,setYear]=useState(10);
  const points=Array.from({length:11},(_,year)=>{
    let balance=loan;
    try { if(year) balance+=cumulativePrincipal(rate/12,360,loan,1,year*12,0); } catch { balance=NaN; }
    const value=arv*Math.pow(1+appreciation,year);
    return {year,value,gain:value-balance-invested};
  });
  if(!points.every(p=>Number.isFinite(p.value)&&Number.isFinite(p.gain))) return <section className="deal-insights"><h3>10-year growth</h3><p>Enter valid loan and property assumptions to see the projection.</p></section>;
  const min=Math.min(0,...points.map(p=>p.gain));
  const max=Math.max(1,...points.flatMap(p=>[p.value,p.gain]));
  const lo=Math.floor(min/10000)*10000,hi=Math.ceil(max/10000)*10000;
  const x=(n:number)=>85+n*42;
  const y=(n:number)=>320-(n-lo)/(hi-lo)*270;
  const path=(key:'value'|'gain')=>points.map((p,i)=>`${i?'L':'M'}${x(p.year)},${y(p[key])}`).join(' ');
  const selected=points[year];
  return <section className="deal-insights growth-chart" aria-label="10-year property growth projection">
    <p className="eyebrow">GROWTH OVER TIME</p><h3>Your next 10 years</h3>
    <div className="growth-legend"><span>— Property value</span><span>— Equity gain</span></div>
    <svg viewBox="0 0 550 375" role="img" aria-label="Projected property value and equity gain from refinance through year ten">
      <title>Property value and equity gain over ten years</title>
      {Array.from({length:5},(_,i)=>lo+(hi-lo)*i/4).map(t=><g key={t}><line x1="85" x2="505" y1={y(t)} y2={y(t)} stroke="#34564a"/><text x="75" y={y(t)+5} textAnchor="end" fill="#bcd0c6" fontSize="14">{new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',notation:'compact',maximumFractionDigits:1}).format(t)}</text></g>)}
      <path d={path('value')} fill="none" stroke="#f6c453" strokeWidth="3.5"/>
      <path d={path('gain')} fill="none" stroke="#4cd4cf" strokeWidth="3.5"/>
      <line x1={x(year)} x2={x(year)} y1="45" y2="320" stroke="#8aa99a" strokeDasharray="4 5"/>
      {[0,2,4,6,8,10].map(n=><text key={n} x={x(n)} y="345" textAnchor="middle" fill="#bcd0c6" fontSize="14">{n}</text>)}
      <text x="295" y="370" textAnchor="middle" fill="#bcd0c6" fontSize="14">Years after refinance</text>
      {(['value','gain'] as const).map(key=><circle key={key} cx={x(year)} cy={y(selected[key])} r="6" fill={key==='value'?'#f6c453':'#4cd4cf'}/>)}
      {points.map(p=><rect key={p.year} x={x(p.year)-20} y="35" width="40" height="288" fill="transparent" onMouseEnter={()=>setYear(p.year)} onClick={()=>setYear(p.year)}/>)}
    </svg>
    <label className="growth-year">Year {year}<input type="range" min="0" max="10" step="1" value={year} aria-label="Projection year" onChange={e=>setYear(Number(e.target.value))}/></label>
    <div className="growth-values"><div><span>Property value · year {year}</span><strong>{money.format(selected.value)}</strong></div><div><span>Equity gain · year {year}</span><strong>{money.format(selected.gain)}</strong></div></div>
    <p className="insight-caption">Uses {(appreciation*100).toFixed(2)}% annual appreciation and a 30-year refinance loan. Equity gain = property value − remaining loan − money left in the deal. Rental cash flow is excluded. Year 0 starts at ARV; year 10 matches the worksheet.</p>
  </section>;
}

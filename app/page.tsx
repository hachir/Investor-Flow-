"use client";

import { useEffect, useMemo, useState } from "react";
import WorkbookView from './workbook-view';
import MoneyInput from './money-input';
import { Calculator, CalendarDays, RotateCcw, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type NumericInput = number | "";
type Deal = { address: string; purchasePrice: NumericInput; arv: NumericInput; marketRent: NumericInput; rehabCost: NumericInput; purchaseDate: string; propertyTax: NumericInput; insurance: NumericInput; downPaymentPct: NumericInput; buyingRate: NumericInput; refinanceLtv: NumericInput; refinanceRate: NumericInput; appreciationRate: NumericInput };
function localDateValue(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
const today = localDateValue();
const initialDeal: Deal = { address: "3327 W Tess Ave, West Valley City, UT 84119", purchasePrice: 344000, arv: 450000, marketRent: 2700, rehabCost: 20000, purchaseDate: today, propertyTax: 3000, insurance: 1400, downPaymentPct: 10, buyingRate: 9.25, refinanceLtv: 75, refinanceRate: 6.25, appreciationRate: 3 };
const money2 = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });

function addDays(value: string, days: number) { const date = new Date(`${value}T12:00:00`); date.setDate(date.getDate() + days); return date; }
function monthlyPayment(principal: number, annualRate: number, years = 30) { const rate = annualRate / 100 / 12; const months = years * 12; if (!rate) return principal / months; return principal * rate * Math.pow(1 + rate, months) / (Math.pow(1 + rate, months) - 1); }
function remainingBalance(principal: number, annualRate: number, paidMonths: number) { const rate = annualRate / 100 / 12; const payment = monthlyPayment(principal, annualRate); if (!rate) return Math.max(0, principal - payment * paidMonths); return Math.max(0, principal * Math.pow(1 + rate, paidMonths) - payment * ((Math.pow(1 + rate, paidMonths) - 1) / rate)); }

function Field({ label, value, onChange, prefix, suffix, type = "number", step, readOnly = false }: { label: string; value: string | number; onChange: (value: string) => void; prefix?: string; suffix?: string; type?: string; step?: string; readOnly?: boolean }) {
  return <label className={`field${readOnly ? " read-only" : ""}`}><span>{label}</span><div className="field-control">{prefix==='$'?<MoneyInput label={label} value={value} onChange={onChange} readOnly={readOnly}/>:<>{prefix && <b>{prefix}</b>}<Input type={type} step={step} value={value} readOnly={readOnly} aria-readonly={readOnly} onFocus={(event) => type === "number" && !readOnly && event.currentTarget.select()} onChange={(event) => onChange(event.target.value)} /></>}{suffix && <b>{suffix}</b>}</div></label>;
}

export default function Home() {
  const [showWorkbook,setShowWorkbook]=useState(true);
  const [deal, setDeal] = useState<Deal>(initialDeal);
  useEffect(() => {
    const modelContext = (document as Document & { modelContext?: { registerTool: (tool: object, options?: { signal?: AbortSignal }) => void | Promise<void> } }).modelContext;
    if (!modelContext?.registerTool) return;
    const lifecycle = new AbortController();
    const numberKeys = ["purchasePrice", "arv", "marketRent", "rehabCost", "propertyTax", "insurance", "downPaymentPct", "buyingRate", "refinanceLtv", "refinanceRate", "appreciationRate"] as const;
    void Promise.resolve(modelContext.registerTool({
      name: "update_brrrr_deal",
      title: "Update BRRRR deal",
      description: "Update one or more visible BRRRR calculator inputs and recalculate the deal.",
      inputSchema: { type: "object", properties: { address: { type: "string" }, purchasePrice: { type: "number" }, arv: { type: "number" }, marketRent: { type: "number" }, rehabCost: { type: "number" }, propertyTax: { type: "number" }, insurance: { type: "number" }, downPaymentPct: { type: "number" }, buyingRate: { type: "number" }, refinanceLtv: { type: "number" }, refinanceRate: { type: "number" }, appreciationRate: { type: "number" } }, additionalProperties: false },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute(input: unknown) {
        if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("Inputs must be an object.");
        const candidate = input as Record<string, unknown>;
        const patch: Partial<Deal> = {};
        if (typeof candidate.address === "string") patch.address = candidate.address;
        for (const key of numberKeys) if (typeof candidate[key] === "number" && Number.isFinite(candidate[key])) patch[key] = candidate[key] as never;
        setShowWorkbook(false);
        setDeal((current) => ({ ...current, ...patch }));
        return { updated: Object.keys(patch), status: "recalculated" };
      },
    }, { signal: lifecycle.signal })).catch(() => undefined);
    return () => lifecycle.abort();
  }, []);
  const update = (key: keyof Deal, value: string) => setDeal((current) => ({ ...current, [key]: key === "address" || key === "purchaseDate" ? value : value === "" ? "" : Number(value) }));
  const result = useMemo(() => {
    const purchasePrice = Number(deal.purchasePrice) || 0, arv = Number(deal.arv) || 0, marketRent = Number(deal.marketRent) || 0, rehabCost = Number(deal.rehabCost) || 0;
    const propertyTax = Number(deal.propertyTax) || 0, insurance = Number(deal.insurance) || 0, downPaymentPct = Number(deal.downPaymentPct) || 0, buyingRate = Number(deal.buyingRate) || 0;
    const refinanceLtv = Number(deal.refinanceLtv) || 0, refinanceRate = Number(deal.refinanceRate) || 0, appreciationRate = Number(deal.appreciationRate) || 0;
    const rentalDate = addDays(today, 90), refinanceDate = addDays(today, 105);
    const downPayment = purchasePrice * downPaymentPct / 100, buyingClosing = purchasePrice * 0.015, buyingLoan = purchasePrice - downPayment;
    const buyingPayment = buyingLoan * buyingRate / 100 / 12, holdingCost = buyingLoan * buyingRate / 100 * 105 / 365;
    const refinanceLoan = arv * refinanceLtv / 100, refinanceClosing = refinanceLoan * 0.015, refinancePayment = monthlyPayment(refinanceLoan, refinanceRate);
    const totalMonthly = refinancePayment + propertyTax / 12 + insurance / 12, cashFlow = marketRent - totalMonthly;
    const maintenanceReserve = arv * 0.01, vacancyReserve = arv * 0.01;
    const totalCost = downPayment + rehabCost + buyingClosing + holdingCost + refinanceClosing + maintenanceReserve + vacancyReserve;
    const moneyLeft = totalCost + buyingLoan - refinanceLoan, instantEquity = arv - refinanceLoan - moneyLeft;
    const value10 = arv * Math.pow(1 + appreciationRate / 100, 10), loanBalance10 = remainingBalance(refinanceLoan, refinanceRate, 120);
    const equityGain10 = value10 - loanBalance10 - moneyLeft, annualReturn = moneyLeft !== 0 ? equityGain10 / moneyLeft / 10 * 100 : 0;
    return { rentalDate, refinanceDate, downPayment, buyingClosing, buyingLoan, buyingPayment, holdingCost, refinanceLoan, refinanceClosing, refinancePayment, totalMonthly, cashFlow, maintenanceReserve, vacancyReserve, totalCost, moneyLeft, instantEquity, value10, loanBalance10, equityGain10, annualReturn };
  }, [deal]);
  const dateText = (date: Date) => date.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });
  const rows = [["Renting date (90 days after purchase)", dateText(result.rentalDate)], ["Refinance date (105 days after purchase)", dateText(result.refinanceDate)], ["Down payment", money2.format(result.downPayment)], ["Closing cost — purchase", money2.format(result.buyingClosing)], ["Loan amount buying", money2.format(result.buyingLoan)], ["Monthly payment buying PI", money2.format(result.buyingPayment)], ["Holding cost", money2.format(result.holdingCost)], ["Loan amount RF", money2.format(result.refinanceLoan)], ["Closing cost — refinance", money2.format(result.refinanceClosing)], ["Monthly refinance payment", money2.format(result.refinancePayment)], ["Total monthly payment", money2.format(result.totalMonthly)], ["Maintenance reserve", money2.format(result.maintenanceReserve)], ["Vacancy reserve", money2.format(result.vacancyReserve)], ["Total cost", money2.format(result.totalCost)], ["Money left in the deal", money2.format(result.moneyLeft)], ["Instant equity gain", money2.format(result.instantEquity)], ["Value in 10 years", money2.format(result.value10)], ["Loan balance in 10 years", money2.format(result.loanBalance10)], ["Equity gain in 10 years", money2.format(result.equityGain10)], ["Annual return of investments", `${result.annualReturn.toFixed(2)}%`]];

  if(showWorkbook) return <WorkbookView onNewEstimate={()=>setShowWorkbook(false)}/>;
  return <main><div className="workspace"><Button variant="outline" onClick={()=>setShowWorkbook(true)}>Back to complete workbook</Button><p className="source-note">New estimate uses today, +90 days to rent and +105 days to refinance. Imported workbook rows retain their original dates.</p></div>
    <header className="topbar"><div className="brand-mark"><TrendingUp aria-hidden="true" /></div><div><p className="eyebrow">BRRRR DEAL CALCULATOR</p><h1>Mohammed Alhareb</h1></div><div className="as-of"><CalendarDays aria-hidden="true" /> As of {dateText(new Date())}</div></header>
    <section className="workspace">
      <div className="intro-row"><div><p className="section-kicker">LIVE DEAL SUMMARY</p><h2>{deal.address || "New property"}</h2></div><div className="legend" aria-label="Color key"><span><i className="green-dot" /> Green: your inputs</span><span><i className="yellow-dot" /> Yellow: key results</span><span><i className="blue-dot" /> Blue: deal details</span></div></div>
      <section className="metric-grid" aria-label="Key results">
        <article className="metric featured"><span>Monthly cash flow</span><strong>{money2.format(result.cashFlow)}</strong><small>After mortgage, tax and insurance</small></article>
        <article className="metric"><span>Money left in deal</span><strong>{money2.format(result.moneyLeft)}</strong><small>After refinance</small></article>
        <article className="metric"><span>Equity gain in 10 years</span><strong>{money2.format(result.equityGain10)}</strong><small>At {deal.appreciationRate}% annual appreciation</small></article>
        <article className="metric"><span>Annual return of investments</span><strong>{result.annualReturn.toFixed(2)}%</strong><small>Average over 10 years</small></article>
      </section>
      <div className="content-grid">
        <section className="panel inputs-panel"><div className="panel-heading"><div><p className="section-kicker">INPUTS</p><h3>Deal assumptions</h3></div><Button variant="outline" size="sm" onClick={() => setDeal({ ...initialDeal, purchaseDate: today })}><RotateCcw aria-hidden="true" /> Reset</Button></div>
          <div className="fields"><Field label="Property address" value={deal.address} type="text" onChange={(v) => update("address", v)} /><Field label="Purchase date (today)" value={today} type="date" readOnly onChange={() => undefined} /><Field label="Purchase price" value={deal.purchasePrice} prefix="$" onChange={(v) => update("purchasePrice", v)} /><Field label="After-repair value (ARV)" value={deal.arv} prefix="$" onChange={(v) => update("arv", v)} /><Field label="Monthly market rent" value={deal.marketRent} prefix="$" onChange={(v) => update("marketRent", v)} /><Field label="Rehab cost" value={deal.rehabCost} prefix="$" onChange={(v) => update("rehabCost", v)} /><Field label="Annual property tax" value={deal.propertyTax} prefix="$" onChange={(v) => update("propertyTax", v)} /><Field label="Annual insurance" value={deal.insurance} prefix="$" onChange={(v) => update("insurance", v)} /><Field label="Down payment" value={deal.downPaymentPct} suffix="%" step="0.1" onChange={(v) => update("downPaymentPct", v)} /><Field label="Purchase interest rate" value={deal.buyingRate} suffix="%" step="0.01" onChange={(v) => update("buyingRate", v)} /><Field label="Refinance LTV" value={deal.refinanceLtv} suffix="%" step="0.1" onChange={(v) => update("refinanceLtv", v)} /><Field label="Refinance interest rate" value={deal.refinanceRate} suffix="%" step="0.01" onChange={(v) => update("refinanceRate", v)} /><Field label="Annual appreciation" value={deal.appreciationRate} suffix="%" step="0.1" onChange={(v) => update("appreciationRate", v)} /></div>
        </section>
        <section className="panel results-panel"><div className="panel-heading"><div><p className="section-kicker">CALCULATED</p><h3>Deal details</h3></div><Calculator className="heading-icon" aria-hidden="true" /></div><Table><TableHeader><TableRow><TableHead>Metric</TableHead><TableHead className="text-right">Result</TableHead></TableRow></TableHeader><TableBody>{rows.map(([label, value]) => <TableRow key={label}><TableCell>{label}</TableCell><TableCell className="result-cell">{value}</TableCell></TableRow>)}</TableBody></Table></section>
      </div>
    </section>
    <footer>Estimates use a 30-year loan, 1.5% purchase closing cost, 1.5% refinance closing cost, 90 days to rent, and 105 days to refinance.</footer>
  </main>;
}

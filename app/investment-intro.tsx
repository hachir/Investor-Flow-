import { ArrowDown, ArrowUpRight } from 'lucide-react';

export default function InvestmentIntro({ estimate = false }: { estimate?: boolean }) {
  return <section className={`investment-intro${estimate ? ' compact-intro' : ''}`} aria-labelledby="investment-heading">
    <div className="intro-copy">
      <p className="eyebrow">HOMES. OPPORTUNITY. A CLEARER PICTURE.</p>
      <h1 id="investment-heading">{estimate ? <>Your next property.<br /><em>Every number, considered.</em></> : <>A place to call home.<br /><em>A plan to build on.</em></>}</h1>
      <p className="intro-description">{estimate ? 'Explore a new BRRRR deal with today’s dates, your assumptions, and results that update as you go.' : 'Explore the potential behind the property. Compare your numbers, understand the returns, and plan your next real estate investment with confidence.'}</p>
      <a className="intro-cta" href="#deal-workspace">{estimate ? 'Build your estimate' : 'Explore your investment'}<ArrowDown aria-hidden="true" /></a>
    </div>
    <div className="intro-aside">
      <span className="intro-monogram" aria-hidden="true">M<span>.</span></span>
      <p>LOCAL PERSPECTIVE.<br /><em>Long-term possibilities.</em></p>
      <a href="#contact">Connect with Mohammed <ArrowUpRight aria-hidden="true" /></a>
    </div>
    <div className="investment-steps" aria-label="BRRRR investment process">
      {['Buy', 'Rehab', 'Rent', 'Refinance', 'Repeat'].map((step, index) => <span key={step}><small>0{index + 1}</small>{step}</span>)}
    </div>
  </section>;
}

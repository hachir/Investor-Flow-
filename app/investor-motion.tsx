"use client";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
export default function InvestorMotion() {
  const [paused, setPaused] = useState(false);
  return <section className="investor-motion" data-paused={paused} aria-label="Decorative investment animation">
    <div className="motion-heading"><span>INVESTOR FLOW</span><Button variant="outline" size="sm" aria-pressed={paused} onClick={() => setPaused(!paused)}>{paused ? 'Play motion' : 'Pause motion'}</Button></div>
    <div className="motion-scene" aria-hidden="true"><div className="motion-glow" />
      <div className="motion-bars">{Array.from({length:16},(_,i)=><i key={i} style={{height:`${25+(i*17)%65}%`,animationDelay:`-${i*.7}s`}} />)}</div>
      <svg viewBox="0 0 600 260" preserveAspectRatio="none"><path className="motion-line" d="M0 210 Q45 230 80 180 T150 160 T220 130 T290 150 T370 85 T460 65 T540 45 T600 20"/><path className="motion-trace" d="M0 210 Q45 230 80 180 T150 160 T220 130 T290 150 T370 85 T460 65 T540 45 T600 20" pathLength="100"/></svg>
      <div className="motion-ticker"><span>BUY · REHAB · RENT · REFINANCE · REPEAT · </span><span>BUY · REHAB · RENT · REFINANCE · REPEAT · </span></div>
    </div><p>Visual animation · not live market data</p>
  </section>;
}

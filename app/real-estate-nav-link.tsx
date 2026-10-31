"use client";

import { useEffect, useState } from 'react';

type CatMotion = 'auto' | 'playing' | 'paused';
const motionPreferenceKey = 'homesWithMohammed.catMotion';

export default function RealEstateNavLink() {
  const [motion, setMotion] = useState<CatMotion>('auto');
  const [reducedMotion, setReducedMotion] = useState(false);
  const paused = motion === 'paused' || (motion === 'auto' && reducedMotion);

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(preference.matches);
    const updatePreference = (event: MediaQueryListEvent) => setReducedMotion(event.matches);
    preference.addEventListener('change', updatePreference);
    try {
      const saved = window.localStorage.getItem(motionPreferenceKey);
      if (saved === 'playing' || saved === 'paused') setMotion(saved);
    } catch { /* The animation also works when browser storage is unavailable. */ }
    return () => preference.removeEventListener('change', updatePreference);
  }, []);

  function toggleMotion() {
    const next = paused ? 'playing' : 'paused';
    setMotion(next);
    try { window.localStorage.setItem(motionPreferenceKey, next); } catch { /* Keep the current-page preference. */ }
  }

  return <span className="real-estate-link-group" data-cat-motion={motion} data-cat-paused={paused}>
    <a className="nav-link real-estate-nav-link" href="/real-estate">
    <span>Real estate</span>
    <span className="estate-cat-orbit" aria-hidden="true">
      <span className="estate-cat-runner">
        <svg className="estate-nav-cat" viewBox="0 0 36 29" focusable="false">
          <path className="estate-cat-tail" d="M11 18C3 21 1 15 3 11C5 7 9 11 6 14" />
          <g className="estate-cat-step-back"><path d="M12 20L9 26M17 21L17 26" /></g>
          <g className="estate-cat-step-front"><path d="M23 20L23 26M28 18L29 24" /></g>
          <g className="estate-cat-bob">
            <ellipse cx="18" cy="17" rx="9" ry="6" />
            <path d="M21 12L21 3L27 7L32 4L33 13Q35 20 27 21Q20 20 21 12Z" />
            <path className="estate-cat-ear" d="M22.5 6L22.5 11L25.7 8.3ZM31 7L28.7 9L31.5 11Z" />
            <ellipse className="estate-cat-eye" cx="25" cy="13" rx="1" ry="1.2" />
            <ellipse className="estate-cat-eye" cx="30" cy="13" rx="1" ry="1.2" />
            <path className="estate-cat-nose" d="M26.4 16H28.8L27.6 17.4Z" />
          </g>
        </svg>
      </span>
    </span>
    </a>
    <button type="button" className="estate-cat-toggle" onClick={toggleMotion} aria-label={paused ? 'Play cat animation' : 'Pause cat animation'} title={paused ? 'Play cat animation' : 'Pause cat animation'}>
      <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">{paused ? <path d="M5 3L13 8L5 13Z" /> : <><rect x="4" y="3" width="3" height="10" rx=".5" /><rect x="9" y="3" width="3" height="10" rx=".5" /></>}</svg>
    </button>
  </span>;
}

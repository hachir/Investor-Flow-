"use client";

import { ArrowUpRight, House } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AdminNavLink from './admin-access';
import RealEstateNavLink from './real-estate-nav-link';

export default function SiteHeader({ onNewEstimate, onWorkbook }: {
  onNewEstimate?: () => void;
  onWorkbook?: () => void;
}) {
  return <>
    <div className="site-announcement">UTAH REAL ESTATE <span aria-hidden="true">·</span> A thoughtful approach to your next investment</div>
    <header className="topbar">
      <a href="/" className="site-brand" aria-label="Mohammed Alhareb home">
        <span className="brand-mark"><House aria-hidden="true" /></span>
        <span><span className="brand-name">Mohammed Alhareb</span><span className="brand-tagline">HOMES WITH MOHAMMED</span></span>
      </a>
      <nav className="site-nav" aria-label="Main navigation">
        <a className="nav-link" href="#deal-workspace">{onWorkbook ? 'Deal calculator' : 'Investment workbook'}</a>
        <RealEstateNavLink />
        <a className="nav-link" href="#contact">Contact</a>
        <AdminNavLink />
      </nav>
      <div className="header-actions">
        <Button className="new-estimate-button" variant="outline" onClick={onNewEstimate ?? onWorkbook}>
          {onWorkbook ? 'Back to complete workbook' : 'New estimate · today'}<ArrowUpRight aria-hidden="true" />
        </Button>
        <div id="account-nav" className="account-nav" />
      </div>
    </header>
  </>;
}

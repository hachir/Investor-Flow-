"use client";

import AdminNavLink from './admin-access';
import Link from 'next/link';

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <section>
          <p className="footer-kicker">REAL ESTATE INVESTMENT TOOLS</p>
          <h2>Mohammed Alhareb</h2>
          <p>Clear BRRRR deal analysis built from the original investment workbook.</p>
        </section>
        <section>
          <h3>Contact</h3>
          <a href="mailto:hs22hs@yahoo.com">hs22hs@yahoo.com</a>
          <span>Phone available by email request</span>
          <span>Utah, United States</span>
        </section>
        <section>
          <h3>Quick links</h3>
          <Link href="/">Deal calculator</Link>
          <Link href="/#account-nav">Your account</Link>
          <AdminNavLink className="footer-link" />
          <a href="https://github.com/hachir/Investor-Flow-" target="_blank" rel="noreferrer">GitHub project</a>
        </section>
        <section>
          <h3>Model details</h3>
          <span>30-year loan term</span>
          <span>1.5% purchase closing cost</span>
          <span>90 days to rent · 105 days to refinance</span>
        </section>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Mohammed Alhareb. All rights reserved.</span>
        <span>For investment analysis only · Not financial advice</span>
      </div>
    </footer>
  );
}

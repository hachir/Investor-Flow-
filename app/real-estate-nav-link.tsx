export default function RealEstateNavLink() {
  return <a className="nav-link real-estate-nav-link" href="/real-estate">
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
  </a>;
}

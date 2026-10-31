export default function RealEstateNavLink() {
  return <span className="real-estate-link-group">
    <a className="nav-link real-estate-nav-link" href="/real-estate">
      <span>Real estate</span>
      <span className="estate-emoji-orbit" aria-hidden="true">
        <span className="estate-emoji-runner">
          <span className="estate-orbit-emoji">
            <img className="estate-mascot-image" src="/images/real-estate-blue-mascot.svg" width={38} height={38} alt="" draggable={false} />
          </span>
        </span>
      </span>
    </a>
  </span>;
}

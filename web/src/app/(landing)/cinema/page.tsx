import "./cinema.css";

export default function CinemaLanding() {
  return (
    <div className="landing-page landing-cinema">
      <section className="cinema-hero">
        <div className="cinema-hero-bg"></div>
        <div className="cinema-hero-content">
          <p className="cinema-hero-pre">A Film By</p>
          <h1 className="cinema-hero-title">SARAH &amp; JAMES</h1>
          <div className="cinema-hero-rule"></div>
          <p className="cinema-hero-tagline">A Love Story in Three Acts</p>
          <p className="cinema-hero-meta">June 14, 2026 &mdash; Rosewood Estate</p>
        </div>
        <div className="cinema-hero-scroll">
          <span>Scroll</span>
          <div className="cinema-hero-scroll-line"></div>
        </div>
      </section>

      <section className="cinema-story">
        <div className="cinema-story-grid">
          <div className="cinema-story-label">
            <span className="cinema-story-num">01</span>
            <span className="cinema-story-word">Story</span>
          </div>
          <div className="cinema-story-body">
            <h2 className="cinema-story-title">The Beginning</h2>
            <p className="cinema-story-text">
              Two lives intertwined by fate at a dinner party in October 2020.
              Through the quiet moments and the grand adventures, through rain
              and sunshine, Sarah and James discovered that home is not a place
              but a person. This is their story, and you are invited to be part
              of its most beautiful chapter yet.
            </p>
          </div>
        </div>
      </section>

      <section className="cinema-countdown">
        <div className="cinema-countdown-inner">
          <div className="cinema-story-label">
            <span className="cinema-story-num">02</span>
            <span className="cinema-story-word">Countdown</span>
          </div>
          <div className="cinema-countdown-display">
            <div className="cinema-countdown-block">
              <span className="cinema-countdown-num">186</span>
              <span className="cinema-countdown-text">DAYS</span>
            </div>
            <div className="cinema-countdown-divider"></div>
            <div className="cinema-countdown-block">
              <span className="cinema-countdown-num">12</span>
              <span className="cinema-countdown-text">HOURS</span>
            </div>
            <div className="cinema-countdown-divider"></div>
            <div className="cinema-countdown-block">
              <span className="cinema-countdown-num">45</span>
              <span className="cinema-countdown-text">MINUTES</span>
            </div>
            <div className="cinema-countdown-divider"></div>
            <div className="cinema-countdown-block">
              <span className="cinema-countdown-num">30</span>
              <span className="cinema-countdown-text">SECONDS</span>
            </div>
          </div>
        </div>
      </section>

      <section className="cinema-gallery">
        <div className="cinema-gallery-inner">
          <div className="cinema-story-label">
            <span className="cinema-story-num">03</span>
            <span className="cinema-story-word">Gallery</span>
          </div>
          <div className="cinema-gallery-strip">
            <div className="cinema-gallery-frame cinema-gallery-main">
              <div className="cinema-gallery-ph">Photo 1</div>
            </div>
            <div className="cinema-gallery-side">
              <div className="cinema-gallery-frame">
                <div className="cinema-gallery-ph">Photo 2</div>
              </div>
              <div className="cinema-gallery-frame">
                <div className="cinema-gallery-ph">Photo 3</div>
              </div>
            </div>
          </div>
          <div className="cinema-gallery-wide">
            <div className="cinema-gallery-ph">Photo 4</div>
          </div>
        </div>
      </section>

      <section className="cinema-gifts">
        <div className="cinema-gifts-inner">
          <p className="cinema-gifts-pre">Registry</p>
          <h2 className="cinema-gifts-title">Gift Registry</h2>
          <p className="cinema-gifts-text">
            Your presence is the only gift we need. For those who wish to
            celebrate with a gift, we have a registry.
          </p>
          <a href="#" className="cinema-gifts-link">View Registry &rarr;</a>
        </div>
      </section>

      <section className="cinema-rsvp">
        <div className="cinema-rsvp-inner">
          <h2 className="cinema-rsvp-title">RSVP</h2>
          <p className="cinema-rsvp-text">
            Please confirm your attendance by May 1, 2026
          </p>
          <a href="#" className="cinema-rsvp-btn">Respond Now</a>
        </div>
      </section>

      <footer className="cinema-footer">
        <div className="cinema-footer-inner">
          <p className="cinema-footer-title">SARAH &amp; JAMES</p>
          <p className="cinema-footer-date">06.14.2026</p>
          <div className="cinema-footer-line"></div>
          <p className="cinema-footer-brand">Wedding Planning App</p>
        </div>
      </footer>
    </div>
  );
}

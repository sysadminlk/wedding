import "./deco.css";

export default function DecoLanding() {
  return (
    <div className="landing-page landing-deco">
      <section className="deco-hero">
        <div className="deco-hero-border">
          <div className="deco-hero-inner">
            <div className="deco-hero-diamond">&#9670;</div>
            <p className="deco-hero-invite">Together With Their Families</p>
            <h1 className="deco-hero-title">Sarah &amp; James</h1>
            <div className="deco-hero-line-deco">
              <span className="deco-line"></span>
              <span className="deco-diamond">&#9670;</span>
              <span className="deco-line"></span>
            </div>
            <p className="deco-hero-date">June 14, 2026</p>
            <p className="deco-hero-venue">Rosewood Estate</p>
            <p className="deco-hero-location">Napa Valley, California</p>
            <div className="deco-hero-diamond">&#9670;</div>
          </div>
        </div>
      </section>

      <section className="deco-story">
        <div className="deco-story-inner">
          <div className="deco-deco-line">
            <span className="deco-deco-bar"></span>
            <span className="deco-deco-center">&#9674;</span>
            <span className="deco-deco-bar"></span>
          </div>
          <h2 className="deco-heading">Our Story</h2>
          <p className="deco-text">
            Under the amber glow of an October evening in 2020, two lives
            converged at a dinner party that would change everything. What
            started as a spark of conversation turned into a flame of devotion
            that has only grown brighter with time. Sarah and James are thrilled
            to share the next golden chapter of their story with you.
          </p>
          <div className="deco-deco-line">
            <span className="deco-deco-bar"></span>
            <span className="deco-deco-center">&#9674;</span>
            <span className="deco-deco-bar"></span>
          </div>
        </div>
      </section>

      <section className="deco-countdown">
        <div className="deco-countdown-inner">
          <h2 className="deco-heading">The Countdown</h2>
          <div className="deco-countdown-row">
            <div className="deco-countdown-block">
              <div className="deco-countdown-frame">
                <span className="deco-countdown-num">186</span>
              </div>
              <span className="deco-countdown-label">Days</span>
            </div>
            <div className="deco-countdown-block">
              <div className="deco-countdown-frame">
                <span className="deco-countdown-num">12</span>
              </div>
              <span className="deco-countdown-label">Hours</span>
            </div>
            <div className="deco-countdown-block">
              <div className="deco-countdown-frame">
                <span className="deco-countdown-num">45</span>
              </div>
              <span className="deco-countdown-label">Minutes</span>
            </div>
            <div className="deco-countdown-block">
              <div className="deco-countdown-frame">
                <span className="deco-countdown-num">30</span>
              </div>
              <span className="deco-countdown-label">Seconds</span>
            </div>
          </div>
        </div>
      </section>

      <section className="deco-gallery">
        <div className="deco-gallery-inner">
          <h2 className="deco-heading">Gallery</h2>
          <div className="deco-gallery-grid">
            <div className="deco-gallery-item deco-gallery-span">
              <div className="deco-gallery-ph">Photo 1</div>
            </div>
            <div className="deco-gallery-item">
              <div className="deco-gallery-ph">Photo 2</div>
            </div>
            <div className="deco-gallery-item">
              <div className="deco-gallery-ph">Photo 3</div>
            </div>
            <div className="deco-gallery-item deco-gallery-span">
              <div className="deco-gallery-ph">Photo 4</div>
            </div>
          </div>
        </div>
      </section>

      <section className="deco-gifts">
        <div className="deco-gifts-inner">
          <h2 className="deco-heading">Gift Registry</h2>
          <p className="deco-text">
            Your gracious presence is the finest gift. For those who wish to
            offer a token of their affection, a gift registry has been curated
            with warmth and gratitude.
          </p>
          <a href="#" className="deco-link">View Registry</a>
        </div>
      </section>

      <section className="deco-rsvp">
        <div className="deco-rsvp-inner">
          <h2 className="deco-rsvp-heading">RSVP</h2>
          <p className="deco-rsvp-text">
            Kindly respond by May 1, 2026
          </p>
          <a href="#" className="deco-rsvp-button">Respond Now</a>
        </div>
      </section>

      <footer className="deco-footer">
        <div className="deco-footer-inner">
          <div className="deco-footer-geo">
            <span className="deco-geo-line"></span>
            <span className="deco-geo-diamond">&#9670;</span>
            <span className="deco-geo-line"></span>
          </div>
          <p className="deco-footer-names">Sarah &amp; James</p>
          <p className="deco-footer-date">June 14, 2026</p>
          <p className="deco-footer-brand">Wedding Planning App</p>
        </div>
      </footer>
    </div>
  );
}

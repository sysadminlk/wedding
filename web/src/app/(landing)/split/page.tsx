import "./split.css";

export default function SplitLanding() {
  return (
    <div className="landing-page landing-split">
      <section className="split-hero">
        <div className="split-hero-left">
          <p className="split-hero-tag">Together with their families</p>
          <h1 className="split-hero-title">Sarah</h1>
          <div className="split-hero-amp">&amp;</div>
          <h1 className="split-hero-title">James</h1>
        </div>
        <div className="split-hero-right">
          <div className="split-hero-info">
            <p className="split-hero-date">June 14, 2026</p>
            <div className="split-hero-line"></div>
            <p className="split-hero-venue">Rosewood Estate</p>
            <p className="split-hero-location">Napa Valley, California</p>
            <p className="split-hero-time">Four o&apos;clock in the afternoon</p>
          </div>
        </div>
      </section>

      <section className="split-story">
        <div className="split-story-inner">
          <div className="split-story-label">Our Story</div>
          <h2 className="split-story-heading">A Chance Encounter</h2>
          <p className="split-story-text">
            In the warmth of an October dinner party, two souls found each other
            across a crowded table. Through years of shared sunsets, spontaneous
            adventures, and quiet mornings together, Sarah and James built a love
            that grows deeper with every passing day. Now they invite you to
            witness the moment they make it forever.
          </p>
        </div>
      </section>

      <section className="split-countdown">
        <div className="split-countdown-left">
          <h2 className="split-countdown-heading">Save the Date</h2>
          <p className="split-countdown-subtext">
            We are counting every moment until we say our vows.
          </p>
        </div>
        <div className="split-countdown-right">
          <div className="split-countdown-item">
            <span className="split-countdown-num">186</span>
            <span className="split-countdown-label">Days</span>
          </div>
          <div className="split-countdown-item">
            <span className="split-countdown-num">12</span>
            <span className="split-countdown-label">Hours</span>
          </div>
          <div className="split-countdown-item">
            <span className="split-countdown-num">45</span>
            <span className="split-countdown-label">Minutes</span>
          </div>
          <div className="split-countdown-item">
            <span className="split-countdown-num">30</span>
            <span className="split-countdown-label">Seconds</span>
          </div>
        </div>
      </section>

      <section className="split-gallery">
        <div className="split-gallery-inner">
          <div className="split-gallery-label">Gallery</div>
          <div className="split-gallery-grid">
            <div className="split-gallery-item split-gallery-tall">
              <div className="split-gallery-ph">Photo 1</div>
            </div>
            <div className="split-gallery-item">
              <div className="split-gallery-ph">Photo 2</div>
            </div>
            <div className="split-gallery-item">
              <div className="split-gallery-ph">Photo 3</div>
            </div>
            <div className="split-gallery-item split-gallery-wide">
              <div className="split-gallery-ph">Photo 4</div>
            </div>
          </div>
        </div>
      </section>

      <section className="split-gifts">
        <div className="split-gifts-left">
          <h2 className="split-gifts-heading">Gift Registry</h2>
        </div>
        <div className="split-gifts-right">
          <p className="split-gifts-text">
            Your love and presence are the greatest gifts. For those who wish to
            give, we have a registry prepared with joy.
          </p>
          <a href="#" className="split-gifts-link">Browse Registry</a>
        </div>
      </section>

      <section className="split-rsvp">
        <div className="split-rsvp-inner">
          <h2 className="split-rsvp-heading">RSVP</h2>
          <p className="split-rsvp-text">
            Please respond by May 1, 2026
          </p>
          <a href="#" className="split-rsvp-button">Respond Now</a>
        </div>
      </section>

      <footer className="split-footer">
        <div className="split-footer-left">
          <p className="split-footer-names">Sarah &amp; James</p>
        </div>
        <div className="split-footer-right">
          <p className="split-footer-credit">Wedding Planning App</p>
        </div>
      </footer>
    </div>
  );
}

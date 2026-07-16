import "./portrait.css";

export default function PortraitLanding() {
  return (
    <div className="landing-page landing-portrait">
      <section className="portrait-hero">
        <div className="portrait-hero-content">
          <div className="portrait-hero-rule-top"></div>
          <p className="portrait-hero-invite">The Wedding Celebration of</p>
          <h1 className="portrait-hero-title">Sarah &amp; James</h1>
          <div className="portrait-hero-ampersand">&amp;</div>
          <p className="portrait-hero-date">June Fourteenth, Two Thousand Twenty-Six</p>
          <p className="portrait-hero-venue">Rosewood Estate</p>
          <p className="portrait-hero-location">Napa Valley, California</p>
          <div className="portrait-hero-rule-bottom"></div>
        </div>
      </section>

      <section className="portrait-story">
        <div className="portrait-content">
          <h2 className="portrait-section-title">Our Story</h2>
          <div className="portrait-divider"></div>
          <p className="portrait-text">
            A chance encounter at a dinner party in the autumn of 2020 sparked a
            connection that neither Sarah nor James could have anticipated. What
            began as easy conversation over candlelight became months of shared
            discoveries, then years of unwavering partnership. Through every
            joy and every challenge, they chose each other. Now, surrounded by
            their dearest friends and family, they invite you to witness the
            moment they choose each other forever.
          </p>
        </div>
      </section>

      <section className="portrait-countdown">
        <div className="portrait-content">
          <h2 className="portrait-section-title">The Countdown</h2>
          <div className="portrait-divider"></div>
          <div className="portrait-countdown-grid">
            <div className="portrait-countdown-cell">
              <span className="portrait-countdown-num">186</span>
              <span className="portrait-countdown-label">Days</span>
            </div>
            <div className="portrait-countdown-cell">
              <span className="portrait-countdown-num">12</span>
              <span className="portrait-countdown-label">Hours</span>
            </div>
            <div className="portrait-countdown-cell">
              <span className="portrait-countdown-num">45</span>
              <span className="portrait-countdown-label">Minutes</span>
            </div>
            <div className="portrait-countdown-cell">
              <span className="portrait-countdown-num">30</span>
              <span className="portrait-countdown-label">Seconds</span>
            </div>
          </div>
        </div>
      </section>

      <section className="portrait-gallery">
        <div className="portrait-content">
          <h2 className="portrait-section-title">Gallery</h2>
          <div className="portrait-divider"></div>
          <div className="portrait-gallery-stack">
            <div className="portrait-gallery-item portrait-gallery-large">
              <div className="portrait-gallery-ph">Photo 1</div>
            </div>
            <div className="portrait-gallery-row">
              <div className="portrait-gallery-item">
                <div className="portrait-gallery-ph">Photo 2</div>
              </div>
              <div className="portrait-gallery-item">
                <div className="portrait-gallery-ph">Photo 3</div>
              </div>
            </div>
            <div className="portrait-gallery-item portrait-gallery-wide">
              <div className="portrait-gallery-ph">Photo 4</div>
            </div>
          </div>
        </div>
      </section>

      <section className="portrait-gifts">
        <div className="portrait-content">
          <h2 className="portrait-section-title">Gift Registry</h2>
          <div className="portrait-divider"></div>
          <p className="portrait-text">
            Your presence at our wedding is the greatest gift of all. For those
            who wish to express their generosity further, we have a gift registry
            that reflects our shared dreams for the future.
          </p>
          <a href="#" className="portrait-link">View Registry</a>
        </div>
      </section>

      <section className="portrait-rsvp">
        <div className="portrait-content">
          <h2 className="portrait-section-title portrait-section-title-light">RSVP</h2>
          <div className="portrait-divider portrait-divider-light"></div>
          <p className="portrait-text portrait-text-light">
            Kindly respond by May 1, 2026
          </p>
          <a href="#" className="portrait-rsvp-button">Respond</a>
        </div>
      </section>

      <footer className="portrait-footer">
        <div className="portrait-content">
          <div className="portrait-footer-rule"></div>
          <p className="portrait-footer-names">Sarah &amp; James</p>
          <p className="portrait-footer-date">June 14, 2026</p>
          <p className="portrait-footer-brand">Wedding Planning App</p>
        </div>
      </footer>
    </div>
  );
}

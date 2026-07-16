import "./ivory.css";

export default function IvoryLanding() {
  return (
    <div className="landing-page landing-ivory">
      <section className="ivory-hero">
        <div className="ivory-hero-content">
          <div className="ivory-hero-ornament">&#10045;</div>
          <h1 className="ivory-hero-title">Sarah & James</h1>
          <p className="ivory-hero-subtitle">are getting married</p>
          <div className="ivory-hero-line"></div>
          <p className="ivory-hero-date">June 14, 2026</p>
          <p className="ivory-hero-venue">Rosewood Estate, Napa Valley</p>
        </div>
      </section>

      <section className="ivory-story">
        <div className="ivory-story-container">
          <p className="ivory-story-label">Our Love Story</p>
          <h2 className="ivory-story-heading">How It All Began</h2>
          <p className="ivory-story-text">
            On a crisp October evening in 2020, two strangers found themselves
            seated next to each other at a crowded dinner party. What started as
            polite conversation over wine turned into hours of laughter and
            shared dreams. From that night forward, every day together has been
            a new chapter in a story we never want to end. We are overjoyed to
            invite you to witness the next beautiful page.
          </p>
        </div>
      </section>

      <section className="ivory-countdown">
        <h2 className="ivory-section-title">Until We Say I Do</h2>
        <div className="ivory-countdown-row">
          <div className="ivory-countdown-box">
            <span className="ivory-countdown-value">186</span>
            <span className="ivory-countdown-unit">Days</span>
          </div>
          <div className="ivory-countdown-separator">:</div>
          <div className="ivory-countdown-box">
            <span className="ivory-countdown-value">12</span>
            <span className="ivory-countdown-unit">Hours</span>
          </div>
          <div className="ivory-countdown-separator">:</div>
          <div className="ivory-countdown-box">
            <span className="ivory-countdown-value">45</span>
            <span className="ivory-countdown-unit">Minutes</span>
          </div>
          <div className="ivory-countdown-separator">:</div>
          <div className="ivory-countdown-box">
            <span className="ivory-countdown-value">30</span>
            <span className="ivory-countdown-unit">Seconds</span>
          </div>
        </div>
      </section>

      <section className="ivory-gallery">
        <h2 className="ivory-section-title">Moments Together</h2>
        <div className="ivory-gallery-grid">
          <div className="ivory-gallery-image ivory-gallery-span-2">
            <div className="ivory-gallery-placeholder">Photo 1</div>
          </div>
          <div className="ivory-gallery-image">
            <div className="ivory-gallery-placeholder">Photo 2</div>
          </div>
          <div className="ivory-gallery-image">
            <div className="ivory-gallery-placeholder">Photo 3</div>
          </div>
          <div className="ivory-gallery-image ivory-gallery-span-2">
            <div className="ivory-gallery-placeholder">Photo 4</div>
          </div>
        </div>
      </section>

      <section className="ivory-gifts">
        <div className="ivory-gifts-content">
          <p className="ivory-story-label">Gift Registry</p>
          <h2 className="ivory-story-heading">Your Generosity</h2>
          <p className="ivory-gifts-text">
            Your presence means the world to us. If you would like to give a
            gift, we have registered at the following.
          </p>
          <a href="#" className="ivory-gifts-button">View Registry</a>
        </div>
      </section>

      <section className="ivory-rsvp">
        <div className="ivory-rsvp-content">
          <p className="ivory-rsvp-label">Respond by May 1, 2026</p>
          <h2 className="ivory-rsvp-heading">Will You Join Us?</h2>
          <a href="#" className="ivory-rsvp-button">RSVP Now</a>
        </div>
      </section>

      <footer className="ivory-footer">
        <p className="ivory-footer-names">Sarah & James</p>
        <p className="ivory-footer-tagline">A celebration of love</p>
        <div className="ivory-footer-ornament">&#10045;</div>
        <p className="ivory-footer-credit">Wedding Planning App</p>
      </footer>
    </div>
  );
}

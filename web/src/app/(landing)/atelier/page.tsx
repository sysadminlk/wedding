import "./atelier.css";

export default function AtelierLanding() {
  return (
    <div className="landing-page landing-atelier">
      <section className="atelier-hero">
        <div className="atelier-hero-overlay">
          <p className="atelier-hero-subtitle">Together with their families</p>
          <h1 className="atelier-hero-title">Sarah & James</h1>
          <div className="atelier-hero-divider"></div>
          <p className="atelier-hero-date">Saturday, the Fourteenth of June</p>
          <p className="atelier-hero-year">Two Thousand and Twenty-Six</p>
          <p className="atelier-hero-venue">The Grand Ballroom, Rosewood Estate</p>
        </div>
      </section>

      <section className="atelier-story">
        <div className="atelier-story-inner">
          <h2 className="atelier-section-heading">Our Story</h2>
          <div className="atelier-story-divider"></div>
          <p className="atelier-story-text">
            What began as a chance meeting at a friend&apos;s dinner party in the
            autumn of 2020 blossomed into a love story neither of us expected.
            Through quiet Sunday mornings and spontaneous road trips, through
            laughter and tears, we found in each other a companion for all of
            life&apos;s seasons. Now, surrounded by the people we love most, we
            invite you to celebrate the beginning of our forever.
          </p>
        </div>
      </section>

      <section className="atelier-countdown">
        <h2 className="atelier-section-heading">Counting the Days</h2>
        <div className="atelier-story-divider"></div>
        <div className="atelier-countdown-grid">
          <div className="atelier-countdown-item">
            <span className="atelier-countdown-number">186</span>
            <span className="atelier-countdown-label">Days</span>
          </div>
          <div className="atelier-countdown-item">
            <span className="atelier-countdown-number">12</span>
            <span className="atelier-countdown-label">Hours</span>
          </div>
          <div className="atelier-countdown-item">
            <span className="atelier-countdown-number">45</span>
            <span className="atelier-countdown-label">Minutes</span>
          </div>
          <div className="atelier-countdown-item">
            <span className="atelier-countdown-number">30</span>
            <span className="atelier-countdown-label">Seconds</span>
          </div>
        </div>
      </section>

      <section className="atelier-gallery">
        <h2 className="atelier-section-heading">Gallery</h2>
        <div className="atelier-story-divider"></div>
        <div className="atelier-gallery-grid">
          <div className="atelier-gallery-item atelier-gallery-large">
            <div className="atelier-gallery-placeholder">
              <span>Photo 1</span>
            </div>
          </div>
          <div className="atelier-gallery-item">
            <div className="atelier-gallery-placeholder">
              <span>Photo 2</span>
            </div>
          </div>
          <div className="atelier-gallery-item">
            <div className="atelier-gallery-placeholder">
              <span>Photo 3</span>
            </div>
          </div>
          <div className="atelier-gallery-item atelier-gallery-wide">
            <div className="atelier-gallery-placeholder">
              <span>Photo 4</span>
            </div>
          </div>
        </div>
      </section>

      <section className="atelier-gifts">
        <div className="atelier-gifts-inner">
          <h2 className="atelier-section-heading">Gift Registry</h2>
          <div className="atelier-story-divider"></div>
          <p className="atelier-gifts-text">
            Your presence at our wedding is the greatest gift. However, if you
            wish to honor us with a gift, we have registered at the following
            stores.
          </p>
          <a href="#" className="atelier-gifts-link">View Our Registry</a>
        </div>
      </section>

      <section className="atelier-rsvp">
        <div className="atelier-rsvp-inner">
          <h2 className="atelier-rsvp-heading">Kindly Respond</h2>
          <p className="atelier-rsvp-text">
            We request the pleasure of your company by the First of May, Two
            Thousand and Twenty-Six.
          </p>
          <a href="#" className="atelier-rsvp-button">RSVP Now</a>
        </div>
      </section>

      <footer className="atelier-footer">
        <div className="atelier-footer-inner">
          <p className="atelier-footer-names">Sarah & James</p>
          <p className="atelier-footer-date">June 14, 2026</p>
          <div className="atelier-footer-divider"></div>
          <p className="atelier-footer-brand">Crafted with love</p>
        </div>
      </footer>
    </div>
  );
}

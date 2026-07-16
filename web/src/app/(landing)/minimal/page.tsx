import "./minimal.css";

export default function MinimalLanding() {
  return (
    <div className="landing-page landing-minimal">
      <section className="minimal-hero">
        <div className="minimal-hero-content">
          <p className="minimal-hero-overline">Wedding Invitation</p>
          <h1 className="minimal-hero-title">Sarah &amp; James</h1>
          <p className="minimal-hero-date">14.06.2026</p>
          <div className="minimal-hero-rule"></div>
          <p className="minimal-hero-venue">Rosewood Estate, Napa Valley</p>
        </div>
      </section>

      <section className="minimal-story">
        <div className="minimal-story-content">
          <h2 className="minimal-heading">Our Story</h2>
          <p className="minimal-body-text">
            We met at a dinner party in October 2020 and talked until the lights
            came on. Three years, two apartments, and one rescue dog later, we
            are ready to make it official. We would love for you to be there.
          </p>
        </div>
      </section>

      <section className="minimal-countdown">
        <div className="minimal-countdown-content">
          <h2 className="minimal-heading">Countdown</h2>
          <div className="minimal-countdown-grid">
            <div className="minimal-countdown-cell">
              <span className="minimal-countdown-num">186</span>
              <span className="minimal-countdown-label">days</span>
            </div>
            <div className="minimal-countdown-cell">
              <span className="minimal-countdown-num">12</span>
              <span className="minimal-countdown-label">hours</span>
            </div>
            <div className="minimal-countdown-cell">
              <span className="minimal-countdown-num">45</span>
              <span className="minimal-countdown-label">minutes</span>
            </div>
            <div className="minimal-countdown-cell">
              <span className="minimal-countdown-num">30</span>
              <span className="minimal-countdown-label">seconds</span>
            </div>
          </div>
        </div>
      </section>

      <section className="minimal-gallery">
        <div className="minimal-gallery-content">
          <h2 className="minimal-heading">Photos</h2>
          <div className="minimal-gallery-grid">
            <div className="minimal-gallery-item">
              <div className="minimal-gallery-ph">1</div>
            </div>
            <div className="minimal-gallery-item">
              <div className="minimal-gallery-ph">2</div>
            </div>
            <div className="minimal-gallery-item">
              <div className="minimal-gallery-ph">3</div>
            </div>
            <div className="minimal-gallery-item">
              <div className="minimal-gallery-ph">4</div>
            </div>
          </div>
        </div>
      </section>

      <section className="minimal-gifts">
        <div className="minimal-gifts-content">
          <h2 className="minimal-heading">Registry</h2>
          <p className="minimal-body-text">
            No gifts necessary. Your presence is more than enough. But if you
            insist, we have a small registry.
          </p>
          <a href="#" className="minimal-link">View Registry</a>
        </div>
      </section>

      <section className="minimal-rsvp">
        <div className="minimal-rsvp-content">
          <p className="minimal-rsvp-overline">Please reply by May 1, 2026</p>
          <h2 className="minimal-rsvp-title">RSVP</h2>
          <a href="#" className="minimal-rsvp-button">Yes, I will attend</a>
        </div>
      </section>

      <footer className="minimal-footer">
        <p className="minimal-footer-names">Sarah &amp; James &middot; June 14, 2026</p>
        <p className="minimal-footer-brand">Wedding Planning App</p>
      </footer>
    </div>
  );
}

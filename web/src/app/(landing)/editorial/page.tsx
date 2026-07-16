import "./editorial.css";

export default function EditorialLanding() {
  return (
    <div className="landing-page landing-editorial">
      <section className="editorial-hero">
        <div className="editorial-hero-inner">
          <p className="editorial-hero-issue">Volume XXVI &middot; Issue 06</p>
          <h1 className="editorial-hero-title">
            The Wedding<br />of Sarah &amp; James
          </h1>
          <div className="editorial-hero-meta">
            <span>June 14, 2026</span>
            <span className="editorial-hero-dot">&bull;</span>
            <span>Napa Valley</span>
          </div>
        </div>
      </section>

      <section className="editorial-story">
        <div className="editorial-story-grid">
          <div className="editorial-story-dropcap">
            <p>
              <span className="editorial-dropcap">I</span>
              n the autumn of 2020, two strangers sat across from each other at a
              dinner party and discovered that conversation could last forever.
              What began as an exchange of pleasantries became a dialogue that
              would define the rest of their lives. Sarah, with her quick wit and
              warm smile, and James, with his quiet confidence and gentle humor,
              found in each other a rare and beautiful understanding. Through the
              years that followed, through every adventure and every quiet
              evening, their love deepened into something neither had thought
              possible. Now, as they stand on the threshold of forever, they
              invite you to share in the joy of their union.
            </p>
          </div>
        </div>
      </section>

      <section className="editorial-countdown">
        <div className="editorial-countdown-inner">
          <div className="editorial-countdown-header">
            <span className="editorial-section-label">The Date</span>
            <h2 className="editorial-countdown-title">Save the Date</h2>
          </div>
          <div className="editorial-countdown-grid">
            <div className="editorial-countdown-cell">
              <span className="editorial-countdown-val">186</span>
              <span className="editorial-countdown-lbl">Days</span>
            </div>
            <div className="editorial-countdown-cell">
              <span className="editorial-countdown-val">12</span>
              <span className="editorial-countdown-lbl">Hours</span>
            </div>
            <div className="editorial-countdown-cell">
              <span className="editorial-countdown-val">45</span>
              <span className="editorial-countdown-lbl">Minutes</span>
            </div>
            <div className="editorial-countdown-cell">
              <span className="editorial-countdown-val">30</span>
              <span className="editorial-countdown-lbl">Seconds</span>
            </div>
          </div>
        </div>
      </section>

      <section className="editorial-gallery">
        <div className="editorial-gallery-inner">
          <span className="editorial-section-label">The Album</span>
          <h2 className="editorial-gallery-title">Captured Moments</h2>
          <div className="editorial-gallery-grid">
            <div className="editorial-gallery-item editorial-gallery-feature">
              <div className="editorial-gallery-ph">Photo 1</div>
              <p className="editorial-gallery-caption">The proposal at sunset</p>
            </div>
            <div className="editorial-gallery-item">
              <div className="editorial-gallery-ph">Photo 2</div>
              <p className="editorial-gallery-caption">First dance practice</p>
            </div>
            <div className="editorial-gallery-item">
              <div className="editorial-gallery-ph">Photo 3</div>
              <p className="editorial-gallery-caption">The engagement party</p>
            </div>
            <div className="editorial-gallery-item editorial-gallery-wide">
              <div className="editorial-gallery-ph">Photo 4</div>
              <p className="editorial-gallery-caption">Weekend in Napa</p>
            </div>
          </div>
        </div>
      </section>

      <section className="editorial-gifts">
        <div className="editorial-gifts-inner">
          <span className="editorial-section-label">Registry</span>
          <h2 className="editorial-gifts-title">Gift Registry</h2>
          <p className="editorial-gifts-text">
            While your presence is the most meaningful gift, we have a registry
            for those who wish to celebrate with a tangible token of their love.
          </p>
          <a href="#" className="editorial-gifts-link">Explore Registry</a>
        </div>
      </section>

      <section className="editorial-rsvp">
        <div className="editorial-rsvp-inner">
          <span className="editorial-section-label editorial-section-label-light">Respond</span>
          <h2 className="editorial-rsvp-title">RSVP</h2>
          <p className="editorial-rsvp-text">
            Kindly respond by May 1, 2026
          </p>
          <a href="#" className="editorial-rsvp-button">Reply Now</a>
        </div>
      </section>

      <footer className="editorial-footer">
        <div className="editorial-footer-inner">
          <div className="editorial-footer-left">
            <p className="editorial-footer-brand">Wedding Planning App</p>
          </div>
          <div className="editorial-footer-center">
            <p className="editorial-footer-names">Sarah &amp; James</p>
            <p className="editorial-footer-date">June 14, 2026</p>
          </div>
          <div className="editorial-footer-right">
            <p className="editorial-footer-page">Page 01</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

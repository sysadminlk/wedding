import "./folio.css";

export default function FolioLanding() {
  return (
    <div className="landing-page landing-folio">
      <section className="folio-hero">
        <div className="folio-hero-bg"></div>
        <div className="folio-hero-overlay">
          <p className="folio-hero-tag">Wedding &middot; June 14, 2026</p>
          <h1 className="folio-hero-title">Sarah<br />&amp;<br />James</h1>
          <p className="folio-hero-venue">Rosewood Estate, Napa Valley</p>
        </div>
      </section>

      <section className="folio-story">
        <div className="folio-story-grid">
          <div className="folio-story-image">
            <div className="folio-story-ph">Photo</div>
          </div>
          <div className="folio-story-text">
            <h2 className="folio-heading">Our Story</h2>
            <p className="folio-body">
              October 2020. A dinner party. Two strangers who talked through
              dessert, through coffee, through the host politely turning off the
              music. That night began a love story that has led us here, to this
              celebration, to this moment. We cannot wait to share it with you.
            </p>
          </div>
        </div>
      </section>

      <section className="folio-countdown">
        <div className="folio-countdown-grid">
          <div className="folio-countdown-image">
            <div className="folio-story-ph">Photo</div>
          </div>
          <div className="folio-countdown-data">
            <h2 className="folio-heading">Counting Down</h2>
            <div className="folio-countdown-row">
              <div className="folio-countdown-cell">
                <span className="folio-countdown-num">186</span>
                <span className="folio-countdown-unit">days</span>
              </div>
              <div className="folio-countdown-cell">
                <span className="folio-countdown-num">12</span>
                <span className="folio-countdown-unit">hours</span>
              </div>
              <div className="folio-countdown-cell">
                <span className="folio-countdown-num">45</span>
                <span className="folio-countdown-unit">min</span>
              </div>
              <div className="folio-countdown-cell">
                <span className="folio-countdown-num">30</span>
                <span className="folio-countdown-unit">sec</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="folio-gallery">
        <h2 className="folio-heading folio-heading-center">Gallery</h2>
        <div className="folio-gallery-mosaic">
          <div className="folio-gallery-item folio-gallery-lg">
            <div className="folio-gallery-ph">Photo 1</div>
          </div>
          <div className="folio-gallery-item">
            <div className="folio-gallery-ph">Photo 2</div>
          </div>
          <div className="folio-gallery-item">
            <div className="folio-gallery-ph">Photo 3</div>
          </div>
          <div className="folio-gallery-item folio-gallery-lg">
            <div className="folio-gallery-ph">Photo 4</div>
          </div>
        </div>
      </section>

      <section className="folio-gifts">
        <div className="folio-gifts-grid">
          <div className="folio-gifts-info">
            <h2 className="folio-heading">Gift Registry</h2>
            <p className="folio-body">
              Your presence is the greatest gift. For those who wish to
              celebrate us further, we have a registry.
            </p>
            <a href="#" className="folio-gifts-link">View Registry</a>
          </div>
          <div className="folio-gifts-image">
            <div className="folio-story-ph">Photo</div>
          </div>
        </div>
      </section>

      <section className="folio-rsvp">
        <div className="folio-rsvp-inner">
          <h2 className="folio-rsvp-title">RSVP</h2>
          <p className="folio-rsvp-text">
            Please respond by May 1, 2026
          </p>
          <a href="#" className="folio-rsvp-button">Respond Now</a>
        </div>
      </section>

      <footer className="folio-footer">
        <div className="folio-footer-inner">
          <p className="folio-footer-names">Sarah &amp; James</p>
          <p className="folio-footer-date">06.14.2026</p>
          <p className="folio-footer-brand">Wedding Planning App</p>
        </div>
      </footer>
    </div>
  );
}

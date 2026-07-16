import "./gilded.css";

export default function GildedLanding() {
  return (
    <div className="landing-page landing-gilded">
      <section className="gilded-hero">
        <div className="gilded-hero-frame">
          <div className="gilded-hero-corner gilded-hero-tl"></div>
          <div className="gilded-hero-corner gilded-hero-tr"></div>
          <div className="gilded-hero-corner gilded-hero-bl"></div>
          <div className="gilded-hero-corner gilded-hero-br"></div>
          <p className="gilded-hero-invite">Together with their families</p>
          <h1 className="gilded-hero-title">Sarah &amp; James</h1>
          <div className="gilded-hero-ornament">&#9830; &#9830; &#9830;</div>
          <p className="gilded-hero-date">The Fourteenth of June</p>
          <p className="gilded-hero-year">Two Thousand and Twenty-Six</p>
          <p className="gilded-hero-venue">Rosewood Estate</p>
          <p className="gilded-hero-location">Napa Valley, California</p>
        </div>
      </section>

      <section className="gilded-story">
        <div className="gilded-story-inner">
          <div className="gilded-divider-ornate">&#10048; &#10048; &#10048;</div>
          <h2 className="gilded-heading">Our Love Story</h2>
          <div className="gilded-divider-line"></div>
          <p className="gilded-story-text">
            In the golden light of an autumn evening, two hearts found their
            rhythm. From that first dinner party in 2020, Sarah and James wrote
            a love story filled with laughter, adventure, and an unwavering
            devotion to one another. As their families join together in
            celebration, they invite you to witness the most gilded chapter of
            all.
          </p>
          <div className="gilded-divider-ornate">&#10048; &#10048; &#10048;</div>
        </div>
      </section>

      <section className="gilded-countdown">
        <div className="gilded-countdown-inner">
          <h2 className="gilded-heading">Until the Day</h2>
          <div className="gilded-divider-line"></div>
          <div className="gilded-countdown-row">
            <div className="gilded-countdown-item">
              <div className="gilded-countdown-box">
                <span className="gilded-countdown-num">186</span>
              </div>
              <span className="gilded-countdown-label">Days</span>
            </div>
            <div className="gilded-countdown-sep">&middot;</div>
            <div className="gilded-countdown-item">
              <div className="gilded-countdown-box">
                <span className="gilded-countdown-num">12</span>
              </div>
              <span className="gilded-countdown-label">Hours</span>
            </div>
            <div className="gilded-countdown-sep">&middot;</div>
            <div className="gilded-countdown-item">
              <div className="gilded-countdown-box">
                <span className="gilded-countdown-num">45</span>
              </div>
              <span className="gilded-countdown-label">Minutes</span>
            </div>
            <div className="gilded-countdown-sep">&middot;</div>
            <div className="gilded-countdown-item">
              <div className="gilded-countdown-box">
                <span className="gilded-countdown-num">30</span>
              </div>
              <span className="gilded-countdown-label">Seconds</span>
            </div>
          </div>
        </div>
      </section>

      <section className="gilded-gallery">
        <div className="gilded-gallery-inner">
          <h2 className="gilded-heading">Our Moments</h2>
          <div className="gilded-divider-line"></div>
          <div className="gilded-gallery-grid">
            <div className="gilded-gallery-item gilded-gallery-item-2x">
              <div className="gilded-gallery-ph">Photo 1</div>
            </div>
            <div className="gilded-gallery-item">
              <div className="gilded-gallery-ph">Photo 2</div>
            </div>
            <div className="gilded-gallery-item">
              <div className="gilded-gallery-ph">Photo 3</div>
            </div>
            <div className="gilded-gallery-item gilded-gallery-item-2x">
              <div className="gilded-gallery-ph">Photo 4</div>
            </div>
          </div>
        </div>
      </section>

      <section className="gilded-gifts">
        <div className="gilded-gifts-inner">
          <h2 className="gilded-heading">Gift Registry</h2>
          <div className="gilded-divider-line"></div>
          <p className="gilded-gifts-text">
            Your gracious presence is our most treasured gift. For those who wish
            to honor us further, we have prepared a gift registry with great care.
          </p>
          <a href="#" className="gilded-gifts-link">View Registry</a>
        </div>
      </section>

      <section className="gilded-rsvp">
        <div className="gilded-rsvp-inner">
          <h2 className="gilded-rsvp-title">Kindly Respond</h2>
          <p className="gilded-rsvp-text">
            We request the pleasure of your company. Please respond by May 1,
            2026.
          </p>
          <a href="#" className="gilded-rsvp-button">RSVP</a>
        </div>
      </section>

      <footer className="gilded-footer">
        <div className="gilded-footer-inner">
          <div className="gilded-footer-ornament">&#9830;</div>
          <p className="gilded-footer-names">Sarah &amp; James</p>
          <p className="gilded-footer-date">June 14, 2026</p>
          <div className="gilded-footer-ornament">&#9830;</div>
          <p className="gilded-footer-brand">Wedding Planning App</p>
        </div>
      </footer>
    </div>
  );
}

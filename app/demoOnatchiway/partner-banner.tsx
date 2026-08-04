export function PartnerBanner() {
  return (
    <section
      className="formeduc-credit"
      id="partenaire"
      aria-labelledby="formeduc-credit-title"
    >
      <div className="section-shell formeduc-credit__inner">
        <div>
          <span className="section-label section-label--green">
            Partenaire du projet
          </span>
          <h2 id="formeduc-credit-title">
            <span>L’hébergement de ce site</span>
            <span>est commandité par ForméducWeb.</span>
          </h2>
          <p>
            ForméducWeb a aussi conçu cette page et offre des sites adaptés
            ainsi que des systèmes web sur mesure, avec une approche d’hygiène
            informatique.
          </p>
        </div>
        <a
          className="formeduc-credit__logo-link"
          href="https://formeducweb.ca/services/site-web"
          aria-label="Cliquez ici pour découvrir les services web de ForméducWeb"
        >
          <span>
            Cliquez ici <i aria-hidden="true">→</i>
          </span>
          <img
            src="/demoOnatchiway/logo-formeducweb.svg"
            alt="ForméducWeb"
          />
        </a>
      </div>
    </section>
  );
}

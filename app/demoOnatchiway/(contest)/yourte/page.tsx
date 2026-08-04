import type { Metadata } from "next";
import Link from "next/link";
import { contestConfig } from "../../contest";
import { PartnerBanner } from "../../partner-banner";

const bookingUrl = "https://pav.manisoft.ca/login.php?idZec=zec-onatchiway";
const officialYurtUrl =
  "https://zeconatchiwayest.reseauzec.com/activites/hebergement/";

export const metadata: Metadata = {
  title: "Séjour en yourte | ZEC Onatchiway",
  description:
    "Séjournez dans l’une des cinq yourtes de la ZEC Onatchiway, au cœur de la forêt boréale et près du lac Onatchiway.",
};

const stays = [
  {
    number: "01",
    title: "Confort en forêt",
    text: "Éclairage, chauffage au propane, cuisinière et réfrigérateur de 6 pi³.",
  },
  {
    number: "02",
    title: "Cuisine équipée",
    text: "L’équipement requis pour préparer les repas est déjà prévu dans la yourte.",
  },
  {
    number: "03",
    title: "Jusqu’à 6 personnes",
    text: "Deux lits Queen et un lit double permettent d’accueillir famille ou amis.",
  },
  {
    number: "04",
    title: "Votre espace extérieur",
    text: "Chaque séjour profite d’une table à pique-nique et d’un rond de feu.",
  },
];

const packingList = [
  "Oreillers, literie ou sacs de couchage",
  "Serviettes et linges à vaisselle",
  "Nourriture",
  "Eau potable ou système de filtration",
];

export default function YurtPage() {
  return (
    <>
      <a className="skip-link" href="#contenu">
        Aller au contenu
      </a>

      <header className="site-header">
        <Link
          className="brand"
          href="/demoOnatchiway#accueil"
          aria-label="Zec Onatchiway - Accueil du concours"
        >
          <img src="/demoOnatchiway/logo-reseauzec.svg" alt="Réseau Zec" />
          <span className="brand__place">Onatchiway</span>
        </Link>

        <nav className="site-nav" aria-label="Navigation principale">
          <Link href="/demoOnatchiway#progression">Progression</Link>
          <Link href="/demoOnatchiway#prix">Les prix</Link>
          <Link href="/demoOnatchiway#mission">La mission</Link>
          <Link href="/demoOnatchiway#reglement">Règlement</Link>
          <a href="#partenaire">Partenaire</a>
          <Link href="/demoOnatchiway/yourte" aria-current="page">
            À découvrir : nos yourtes
          </Link>
        </nav>

        <a
          className="ticket-button ticket-button--compact"
          href={bookingUrl}
          target="_blank"
          rel="noreferrer"
        >
          Réserver
        </a>
      </header>

      <main id="contenu" className="yurt-page">
        <section className="yurt-hero" aria-labelledby="yurt-title">
          <div className="yurt-hero__photo">
            <img
              src="/demoOnatchiway/yourte-exterieur-officiel.jpeg"
              alt="Yourte de la ZEC Onatchiway installée au milieu de la forêt"
            />
            <span>Photo officielle · ZEC Onatchiway</span>
          </div>

          <div className="yurt-hero__content">
            <span className="yurt-kicker">Prêt-à-camper · Lac Onatchiway</span>
            <h1 id="yurt-title">
              Dormez au cœur de la <span>forêt.</span>
            </h1>
            <p className="yurt-hero__lead">
              Cinq yourtes accueillantes, la nature tout autour et juste assez
              de confort pour décrocher vraiment.
            </p>

            <dl className="yurt-hero__facts">
              <div>
                <dt>5</dt>
                <dd>yourtes</dd>
              </div>
              <div>
                <dt>6</dt>
                <dd>personnes max.</dd>
              </div>
              <div>
                <dt>500 m</dt>
                <dd>du poste d’accueil</dd>
              </div>
            </dl>

            <div className="yurt-hero__actions">
              <a
                className="ticket-button"
                href={bookingUrl}
                target="_blank"
                rel="noreferrer"
              >
                Voir les disponibilités
              </a>
              <a
                className="text-link"
                href={`tel:${contestConfig.contact.phoneHref}`}
              >
                {contestConfig.contact.phone}
              </a>
            </div>
          </div>
        </section>

        <section className="yurt-intro" aria-labelledby="intro-title">
          <div className="section-shell yurt-intro__inner">
            <div className="yurt-intro__heading">
              <span className="section-label section-label--green">
                Une expérience simple et vraie
              </span>
              <h2 id="intro-title">La nature dehors. Le confort dedans.</h2>
            </div>
            <div className="yurt-intro__copy">
              <p>
                Aux abords du lac Onatchiway, les yourtes proposent un séjour
                chaleureux en pleine forêt boréale. On y cuisine, on s’y
                repose, puis on sort profiter du feu, du lac et du territoire.
              </p>
              <p>
                L’accès se fait par le poste d’accueil Onatchiway. Les yourtes
                se trouvent à seulement 500 mètres du poste.
              </p>
            </div>
          </div>

          <div className="section-shell yurt-gallery" aria-label="Photos des yourtes">
            <figure className="yurt-gallery__large">
              <img
                src="/demoOnatchiway/yourte-puits-lumiere-officiel.jpeg"
                alt="Vue intérieure du puits de lumière d’une yourte"
              />
            </figure>
            <figure>
              <img
                src="/demoOnatchiway/yourte-interieur-officiel.jpeg"
                alt="Coin repas et équipements à l’intérieur d’une yourte"
              />
            </figure>
            <figure>
              <img
                src="/demoOnatchiway/yourte-lac-officiel.jpeg"
                alt="Lac entouré de montagnes près du site des yourtes"
              />
            </figure>
          </div>
        </section>

        <section className="yurt-features" aria-labelledby="features-title">
          <div className="section-shell">
            <div className="section-heading section-heading--split">
              <div>
                <span className="section-label">Ce qui est inclus</span>
                <h2 id="features-title">Tout ce qu’il faut pour ralentir.</h2>
              </div>
              <p>
                Une formule prêt-à-camper pensée pour profiter du territoire
                sans renoncer aux commodités essentielles.
              </p>
            </div>

            <div className="yurt-feature-grid">
              {stays.map((feature) => (
                <article className="yurt-feature" key={feature.number}>
                  <span>{feature.number}</span>
                  <h3>{feature.title}</h3>
                  <p>{feature.text}</p>
                </article>
              ))}
            </div>

            <div className="yurt-practical">
              <div>
                <span className="section-label section-label--green">
                  À apporter
                </span>
                <h3>Préparez votre séjour.</h3>
              </div>
              <ul>
                {packingList.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p>
                Des toilettes sèches sont situées à l’extérieur. Les toilettes
                et les douches du poste d’accueil sont accessibles à 500 m.
                L’hébergement est non-fumeur et les animaux domestiques ne sont
                pas admis.
              </p>
            </div>
          </div>
        </section>

        <section className="yurt-experience" aria-labelledby="experience-title">
          <div className="section-shell yurt-experience__heading">
            <span className="section-label section-label--green">
              À quelques pas
            </span>
            <h2 id="experience-title">Une journée au rythme du lac.</h2>
            <p>
              Le petit lac Mystère, la location d’embarcations et l’aire de
              jeux prolongent naturellement le séjour à l’extérieur.
            </p>
          </div>

          <div className="section-shell yurt-activity-grid">
            <article className="yurt-activity yurt-activity--wide">
              <img
                src="/demoOnatchiway/yourte-pagaie-officiel.jpeg"
                alt="Deux personnes en planche à pagaie au lever du jour"
              />
              <div>
                <span>Sur l’eau</span>
                <h3>Planche à pagaie et kayak</h3>
                <p>
                  Trois planches à pagaie et un kayak sont offerts en location.
                  Informez-vous à l’accueil lors de votre arrivée.
                </p>
              </div>
            </article>
            <article className="yurt-activity">
              <img
                src="/demoOnatchiway/yourte-jeux-officiel.jpeg"
                alt="Aire de jeux en bois aménagée dans la forêt"
              />
              <div>
                <span>En famille</span>
                <h3>Aire de jeux en forêt</h3>
                <p>Un espace de jeux attend les jeunes aventuriers sur le site.</p>
              </div>
            </article>
          </div>
        </section>

        <section className="yurt-reservation" aria-labelledby="reserve-title">
          <div className="section-shell yurt-reservation__inner">
            <div>
              <span className="section-label section-label--green">
                Votre prochaine nuit dehors
              </span>
              <h2 id="reserve-title">Choisissez votre yourte.</h2>
              <p>
                Consultez les tarifs et les disponibilités sur la plateforme
                officielle, ou téléphonez du lundi au vendredi entre 9 h et 16 h.
              </p>
            </div>
            <div className="yurt-reservation__contact">
              <a
                className="ticket-button"
                href={bookingUrl}
                target="_blank"
                rel="noreferrer"
              >
                Réserver en ligne
              </a>
              <a href={`tel:${contestConfig.contact.phoneHref}`}>
                {contestConfig.contact.phone}
              </a>
              <a href={officialYurtUrl} target="_blank" rel="noreferrer">
                Consulter la page officielle <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
        </section>

        <PartnerBanner />
      </main>

      <footer className="site-footer" id="coordonnees">
        <div className="section-shell footer-grid">
          <div className="footer-brand">
            <img src="/demoOnatchiway/logo-reseauzec.svg" alt="Réseau Zec" />
            <strong>Onatchiway</strong>
            <p>Au cœur des Monts-Valin.</p>
          </div>

          <div>
            <span className="footer-label">Nous joindre</span>
            <address>
              {contestConfig.contact.address}
              <br />
              {contestConfig.contact.city}
            </address>
            <a href={`tel:${contestConfig.contact.phoneHref}`}>
              {contestConfig.contact.phone}
            </a>
            <a href={`mailto:${contestConfig.contact.email}`}>
              {contestConfig.contact.email}
            </a>
          </div>

          <div>
            <span className="footer-label">Découvrir</span>
            <Link href="/demoOnatchiway#accueil">Le concours</Link>
            <a href="#partenaire">Notre partenaire</a>
            <a
              href={contestConfig.contact.facebook}
              target="_blank"
              rel="noreferrer"
            >
              Facebook <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>

        <div className="section-shell footer-bottom">
          <span>© 2026 Association Onatchiway</span>
          <span>Renseignements et réservation auprès de la ZEC</span>
          <a
            className="footer-credit"
            href="https://formeducweb.ca/services/site-web"
          >
            Hébergement commandité par ForméducWeb
          </a>
        </div>
      </footer>
    </>
  );
}

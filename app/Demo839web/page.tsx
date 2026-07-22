import Link from "next/link";
import { EmptyEvents, EventCard, SectionHeading, SiteFooter, SiteHeader } from "@/components/demo839/site";
import { getUpcomingPublicEvents, safePublicData } from "@/lib/demo839/data";

export const dynamic = "force-dynamic";

export default async function Home() {
  const upcoming = await safePublicData(getUpcomingPublicEvents, []);
  const preview = upcoming.slice(0, 3);

  return (
    <main>
      <a className="skip-link" href="#contenu">Aller au contenu</a>
      <SiteHeader active="accueil" />

      <section className="landing-hero" id="contenu" aria-labelledby="hero-title">
        <img className="landing-hero__image" src="/Demo839web/survie-photo-retouchee.png" alt="Des cadets de l’Escadron 839 réunis sous un abri de survie en forêt." />
        <div className="landing-hero__veil" aria-hidden="true" />
        <div className="container landing-hero__layout">
          <div className="landing-hero__copy">
            <p className="eyebrow eyebrow--light">Chibougamau · 12 à 18 ans</p>
            <h1 id="hero-title">Grandir ici,<br />viser loin.</h1>
            <p>À l’Escadron 839, les jeunes apprennent à se dépasser, à travailler en équipe et à découvrir de nouvelles passions dans un milieu stimulant.</p>
            <div className="hero-actions">
              <a className="button button--warm" href="https://registration.cadets.gc.ca/" target="_blank" rel="noreferrer">S’inscrire aux cadets <span aria-hidden="true">↗</span></a>
              <Link className="text-link text-link--light" href="/Demo839web/communications">Voir les communications <span aria-hidden="true">→</span></Link>
            </div>
          </div>

          <aside className="hero-agenda" aria-labelledby="agenda-title">
            <div className="hero-agenda__top">
              <div><span>À l’agenda</span><h2 id="agenda-title">Prochaines activités</h2></div>
              <Link href="/Demo839web/communications" aria-label="Voir toutes les communications">Tout voir →</Link>
            </div>
            <div className="hero-agenda__list">
              {preview.length > 0 ? preview.map((event) => <EventCard key={event.id} event={event} compact />) : <EmptyEvents />}
            </div>
            {upcoming.length > preview.length && <p className="hero-agenda__more">Et {upcoming.length - preview.length} autre{upcoming.length - preview.length > 1 ? "s" : ""} activité{upcoming.length - preview.length > 1 ? "s" : ""} à venir.</p>}
          </aside>
        </div>
      </section>

      <section className="fact-strip" aria-label="Informations clés">
        <div className="container fact-grid">
          <div><span className="fact-label">Rencontres</span><strong>Mercredi · 18 h 30 à 21 h</strong></div>
          <div><span className="fact-label">Pour les jeunes</span><strong>De 12 à 18 ans</strong></div>
          <div><span className="fact-label">Point de rencontre</span><strong>265, rue Lanctôt · Chibougamau</strong></div>
          <Link className="fact-link" href="/Demo839web/communications">Calendrier et annonces <span aria-hidden="true">→</span></Link>
        </div>
      </section>

      <section className="section section--intro" id="escadron">
        <div className="container intro-layout">
          <div className="intro-statement">
            <p className="eyebrow">Escadron 839 Lions de Chibougamau</p>
            <h2>Un milieu pour apprendre, servir et progresser.</h2>
          </div>
          <div className="intro-copy">
            <p>Le programme des cadets offre aux jeunes une occasion unique de développer leur confiance, leur leadership et leur sens des responsabilités. Ici, chaque expérience devient une chance d’apprendre avec les autres.</p>
            <p>Les activités touchent l’aviation, le plein air, le sport, la musique, le tir de précision et l’engagement communautaire.</p>
          </div>
        </div>
      </section>

      <section className="section section--activities" id="activites">
        <div className="container">
          <SectionHeading eyebrow="Des expériences qui comptent" title="Explorer. Apprendre. Se dépasser.">
            <p>Une programmation variée qui évolue au fil de l’année.</p>
          </SectionHeading>
          <div className="feature-grid">
            <article className="feature-card feature-card--image">
              <img src="/Demo839web/survie-boreale-original.png" alt="Des cadets participent à une activité de survie en milieu boréal." />
              <div><span>01</span><h3>Plein air et survie</h3><p>Orientation, travail d’équipe et savoir-faire sur le territoire.</p></div>
            </article>
            <article className="feature-card feature-card--dark">
              <span>02</span><h3>Aviation et leadership</h3><p>Découvrir le monde de l’aviation tout en développant l’autonomie, la discipline et la capacité de guider une équipe.</p>
            </article>
            <article className="feature-card feature-card--pale">
              <span>03</span><h3>Sport et précision</h3><p>Des défis encadrés où la sécurité, la concentration et le dépassement personnel sont toujours au premier plan.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="section section--parents" id="parents">
        <div className="container parents-layout">
          <div className="parents-photo">
            <img src="/Demo839web/tir-precision-original.png" alt="Équipement utilisé lors d’une activité encadrée de tir de précision." />
          </div>
          <div className="parents-copy">
            <p className="eyebrow">Pour les parents et tuteurs</p>
            <h2>L’essentiel, au bon endroit.</h2>
            <p>La page Communications rassemble les annonces, changements d’horaire et activités à venir. Une seule source à consulter pour rester au courant.</p>
            <ul className="check-list">
              <li><span>✓</span><div><strong>Une information claire</strong><small>Les activités publiées sont classées par date et les annulations demeurent visibles.</small></div></li>
              <li><span>✓</span><div><strong>Un calendrier pratique</strong><small>Consultez-le en ligne ou imprimez la version annuelle en deux pages.</small></div></li>
              <li><span>✓</span><div><strong>Un programme accessible</strong><small>L’inscription au programme des cadets est gratuite.</small></div></li>
            </ul>
            <Link className="button" href="/Demo839web/communications">Consulter les communications</Link>
          </div>
        </div>
      </section>

      <section className="section section--tradition">
        <div className="container tradition-layout">
          <div>
            <p className="eyebrow eyebrow--light">Tradition et communauté</p>
            <h2>En marche,<br />ensemble.</h2>
            <p>La parade, l’engagement local et l’esprit d’escadron forgent un sentiment d’appartenance qui accompagne les jeunes bien au-delà des activités.</p>
          </div>
          <figure>
            <img src="/Demo839web/parade-archives.jpg" alt="Des membres de l’escadron participent à une parade sur un aérodrome." />
            <figcaption>Une tradition de rigueur, de fierté et de rassemblement.</figcaption>
          </figure>
        </div>
      </section>

      <section className="section section--join">
        <div className="container join-panel">
          <div><p className="eyebrow">Prêt à commencer?</p><h2>Une aventure à votre portée.</h2><p>Venez découvrir l’Escadron 839 et tout ce que le programme peut offrir.</p></div>
          <a className="button button--warm" href="https://registration.cadets.gc.ca/" target="_blank" rel="noreferrer">S’inscrire maintenant <span aria-hidden="true">↗</span></a>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}


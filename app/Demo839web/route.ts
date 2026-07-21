import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const page = String.raw`<!doctype html>
<html lang="fr-CA">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex, nofollow, noarchive" />
    <title>Escadron 839 | Lions de Chibougamau</title>
    <meta name="description" content="Prototype communautaire protégé de l’Escadron 839 Lions de Chibougamau." />
    <link rel="stylesheet" href="/Demo839web/site.css" />
  </head>
  <body>
    <main class="demo839">
      <a class="skip-link" href="#contenu">Aller au contenu</a>

      <div class="prototype-bar" role="note">
        <div class="container prototype-bar__content">
          <span class="prototype-bar__flag">Prototype protégé</span>
          <p>Site communautaire de démonstration — les horaires, activités et partenaires ci-dessous sont fictifs ou à confirmer par les sources officielles.</p>
        </div>
      </div>

      <header class="site-header">
        <div class="container nav-shell">
          <a class="brand" href="#accueil" aria-label="Accueil — Escadron 839">
            <span class="brand-logo" aria-hidden="true"><img src="/Demo839web/logo-couleur.png" alt="" /></span>
            <span class="brand-copy"><strong>Escadron 839</strong><small>Lions de Chibougamau</small></span>
          </a>
          <nav aria-label="Navigation principale">
            <a href="#cette-semaine">Cette semaine</a>
            <a href="#activites">Activités</a>
            <a href="#parents">Parents</a>
            <a href="#contact">Ressources</a>
          </nav>
          <a class="button button--compact" href="https://registration.cadets.gc.ca/" target="_blank" rel="noreferrer">S'inscrire <span aria-hidden="true">↗</span></a>
        </div>
      </header>

      <section class="hero" id="accueil" aria-labelledby="hero-title">
        <img class="hero__image" src="/Demo839web/survie-photo-retouchee.png" alt="Photo fournie et retouchée d'un groupe de cadets réuni sous un abri de survie en forêt." />
        <div class="hero__veil" aria-hidden="true"></div>
        <div class="container hero__content">
          <p class="eyebrow eyebrow--light">Chibougamau · Apprendre · Servir · Progresser</p>
          <h1 id="hero-title">Grandir ici,<br />viser loin.</h1>
          <p class="hero__lead">Un point de départ accueillant pour les jeunes, les parents et la communauté du 839. L’information officielle demeure toujours la référence.</p>
          <div class="hero__actions">
            <a class="button button--warm" href="#parents">Découvrir l'escadron</a>
            <a class="text-link text-link--light" href="#cette-semaine">Voir les nouvelles <span aria-hidden="true">↓</span></a>
          </div>
        </div>
        <div class="hero__caption container">Photo fournie et retouchée · Accès protégé · Autorisation de publication publique à confirmer avant diffusion.</div>
      </section>

      <section class="fact-strip" aria-label="Informations clés">
        <div class="container fact-grid">
          <div><span class="fact-label">Rencontres</span><strong>Mercredi · 18 h 30 à 21 h</strong></div>
          <div><span class="fact-label">Pour les jeunes</span><strong>De 12 à 18 ans</strong></div>
          <div><span class="fact-label">Point de rencontre</span><strong>265, rue Lanctôt · Chibougamau</strong></div>
          <a class="fact-link" href="https://839aviation.cadets.site/" target="_blank" rel="noreferrer">Vérifier la fiche officielle <span aria-hidden="true">↗</span></a>
        </div>
      </section>

      <div id="contenu">
        <section class="section section--news" id="cette-semaine" aria-labelledby="news-title">
          <div class="container news-layout">
            <div class="section-intro">
              <p class="eyebrow">Vie de l'escadron</p>
              <h2 id="news-title">Cette semaine, on se retrouve.</h2>
              <p>Un espace simple pour diffuser les messages locaux. Les contenus suivants illustrent le format et ne sont pas des consignes officielles.</p>
              <a class="text-link" href="#calendar">Consulter l'agenda exemple <span aria-hidden="true">↓</span></a>
            </div>
            <article class="weekly-card">
              <div class="weekly-card__top"><span class="pill">Message exemple</span><span>21 juillet 2026</span></div>
              <h3>Une soirée pour prendre son élan.</h3>
              <p>Accueil des nouvelles familles, atelier de navigation et moment d'équipe. Les détails réels seraient publiés ici par une personne autorisée de l'escadron.</p>
              <div class="weekly-card__foot"><span>Tenue · À confirmer</span><a href="#contact">Voir les ressources <span aria-hidden="true">→</span></a></div>
            </article>
          </div>
        </section>

        <section class="section section--activities" id="activites" aria-labelledby="activities-title">
          <div class="container activities-layout">
            <div class="activities-image-wrap">
              <img src="/Demo839web/tir-precision-original.png" alt="Scène fictive générée d'un espace de tir de précision : cible, tapis de pratique et équipement de protection sur un banc." />
              <span>Tir de précision · Image réaliste générée</span>
            </div>
            <div class="activities-copy">
              <p class="eyebrow">À explorer</p>
              <h2 id="activities-title">Des passions qui prennent de l'altitude.</h2>
              <p>Un aperçu de ce qui peut nourrir les passions : le tir de précision encadré, le plein air boréal et de nouveaux défis collectifs. Les possibilités réelles varient selon la saison et l'encadrement disponible.</p>
              <ul class="activity-list">
                <li><span>01</span><div><strong>Explorer le territoire</strong><small>Orientation, survie, plein air et nouvelles compétences.</small></div></li>
                <li><span>02</span><div><strong>Tir de précision</strong><small>Une pratique encadrée où la sécurité, la concentration et le respect comptent.</small></div></li>
                <li><span>03</span><div><strong>Se dépasser ensemble</strong><small>Des défis adaptés au rythme de chacun, avec l'esprit d'équipe au premier plan.</small></div></li>
              </ul>
            </div>
          </div>
        </section>

        <section class="section section--history" aria-labelledby="history-title">
          <div class="container history-layout">
            <div class="history-copy">
              <p class="eyebrow">Parade et tradition</p>
              <h2 id="history-title">En marche, ensemble.</h2>
              <p>Une image d'archives qui évoque la rigueur, le rassemblement et l'héritage de la parade. Son contexte et son droit de publication seraient confirmés localement avant toute diffusion publique.</p>
            </div>
            <figure class="history-image">
              <img src="/Demo839web/parade-archives.jpg" alt="Photo d'archives fournie montrant un groupe qui défile devant un hélicoptère et des avions sur un aérodrome." />
              <figcaption>Parade · Photo d'archives fournie · Publication à confirmer avant diffusion publique</figcaption>
            </figure>
          </div>
        </section>

        <section class="section section--calendar" id="calendar" aria-labelledby="calendar-title">
          <div class="container">
            <div class="calendar-heading">
              <div><p class="eyebrow eyebrow--light">Agenda local</p><h2 id="calendar-title">À noter au calendrier.</h2></div>
              <p>Exemple de calendrier seulement · Les dates réelles seraient validées localement.</p>
            </div>
            <div class="calendar-grid">
              <article><time datetime="2026-09-09"><span>09</span>sept.</time><div><span class="calendar-type">Rencontre</span><h3>Soirée d'accueil</h3><p>Une première rencontre pour les familles et les jeunes.</p></div></article>
              <article><time datetime="2026-09-16"><span>16</span>sept.</time><div><span class="calendar-type">Atelier</span><h3>Se repérer sur le terrain</h3><p>Découvrir la carte et les repères du territoire.</p></div></article>
              <article><time datetime="2026-09-23"><span>23</span>sept.</time><div><span class="calendar-type">Communauté</span><h3>Défi d'équipe</h3><p>Un moment collaboratif imaginé pour ce prototype.</p></div></article>
            </div>
          </div>
        </section>

        <section class="section section--parents" id="parents" aria-labelledby="parents-title">
          <div class="container parents-layout">
            <div class="parents-card">
              <p class="eyebrow">Pour les parents et tuteurs</p>
              <h2 id="parents-title">L'essentiel, au bon endroit.</h2>
              <p>Cette maquette privilégie une information publique courte, facile à mettre à jour et sans collecte de renseignements personnels.</p>
              <a class="button" href="https://registration.cadets.gc.ca/" target="_blank" rel="noreferrer">Accéder à l'inscription officielle <span aria-hidden="true">↗</span></a>
            </div>
            <div class="parent-points">
              <div><span>✦</span><p><strong>Avant de venir</strong>Vérifier les détails de la rencontre auprès de la fiche officielle ou des communications locales.</p></div>
              <div><span>✦</span><p><strong>Une question?</strong>Utiliser les coordonnées partagées par l'escadron ou le répertoire officiel, jamais un formulaire public non approuvé.</p></div>
              <div><span>✦</span><p><strong>Information fiable</strong>Les formulaires, manuels et politiques doivent toujours être consultés à leur source officielle.</p></div>
            </div>
          </div>
        </section>
      </div>

      <section class="partners" aria-labelledby="partners-title">
        <div class="container">
          <p class="eyebrow">Soutien local</p>
          <h2 id="partners-title">Des espaces prévus pour la communauté.</h2>
          <p class="partners__copy">Ces marques sont fictives et servent uniquement à illustrer une section de partenaires.</p>
          <div class="partner-grid" aria-label="Exemples de partenaires fictifs">
            <div class="partner-mark partner-mark--north">Nord<br />&amp; Co.</div>
            <div class="partner-mark partner-mark--river">Rivière<br /><em>Boréale</em></div>
            <div class="partner-mark partner-mark--circle">Cercle<br /><strong>839</strong></div>
            <div class="partner-mark partner-mark--atelier">ATELIER<br /><span>DU NORD</span></div>
          </div>
        </div>
      </section>

      <footer class="site-footer" id="contact">
        <div class="container footer-grid">
          <div>
            <a class="brand brand--footer" href="#accueil"><span class="brand-logo" aria-hidden="true"><img src="/Demo839web/logo-couleur.png" alt="" /></span><span class="brand-copy"><strong>Escadron 839</strong><small>Lions de Chibougamau</small></span></a>
            <p class="footer-note">Prototype visuel communautaire non officiel. À utiliser seulement après l'approbation des responsables locaux.</p>
          </div>
          <div>
            <h2>Ressources officielles</h2>
            <a href="https://839aviation.cadets.site/" target="_blank" rel="noreferrer">Fiche publique du 839 <span aria-hidden="true">↗</span></a>
            <a href="https://registration.cadets.gc.ca/" target="_blank" rel="noreferrer">Inscription en ligne <span aria-hidden="true">↗</span></a>
            <a href="https://www.canada.ca/fr/ministere-defense-nationale/services/cadets-rangers-juniors-canadiens.html" target="_blank" rel="noreferrer">Programme des cadets sur Canada.ca <span aria-hidden="true">↗</span></a>
          </div>
          <div><h2>Utilisation responsable</h2><p>Ne pas publier de documents officiels, de coordonnées personnelles ni de photos sans les autorisations requises.</p></div>
        </div>
        <div class="container footer-bottom"><span>© 2026 · Prototype Escadron 839</span><span>Contenu de démonstration</span></div>
      </footer>
    </main>
  </body>
</html>`;

export function GET() {
  return new NextResponse(page, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      "Content-Type": "text/html; charset=utf-8",
      "X-Robots-Tag": "noindex, nofollow, noarchive"
    }
  });
}

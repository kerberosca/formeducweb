import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const communicationsUrl =
  "https://escadron-839-chibougamau-demo.dannybouchard.chatgpt.site/communications";
const administrationUrl =
  "https://escadron-839-chibougamau-demo.dannybouchard.chatgpt.site/administration/connexion";

const page = String.raw`<!doctype html>
<html lang="fr-CA">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex, nofollow, noarchive" />
    <title>Escadron 839 | Lions de Chibougamau</title>
    <meta name="description" content="Découvrez l'Escadron 839 Lions de Chibougamau, ses activités et ses communications destinées aux cadets et aux parents." />
    <link rel="stylesheet" href="/Demo839web/site.css" />
  </head>
  <body>
    <a class="skip-link" href="#contenu">Aller au contenu</a>
    <header class="site-header">
      <div class="container nav-shell">
        <a class="brand" href="#accueil" aria-label="Accueil — Escadron 839">
          <img src="/Demo839web/logo-couleur.png" alt="Logo de l'Escadron 839" />
          <span><strong>Escadron 839</strong><small>Lions de Chibougamau</small></span>
        </a>
        <nav aria-label="Navigation principale">
          <a href="#decouvrir">L'escadron</a>
          <a href="#activites">Activités</a>
          <a href="#parents">Parents</a>
          <a href="${communicationsUrl}">Communications</a>
        </nav>
        <a class="button button--small" href="https://registration.cadets.gc.ca/" target="_blank" rel="noreferrer">S'inscrire aux cadets</a>
      </div>
    </header>

    <main id="contenu">
      <section class="hero" id="accueil">
        <img class="hero__image" src="/Demo839web/survie-photo-retouchee.png" alt="Des cadets réunis sous un abri de survie en forêt" />
        <div class="hero__overlay"></div>
        <div class="container hero__content">
          <p class="eyebrow eyebrow--light">Chibougamau · Pour les jeunes de 12 à 18 ans</p>
          <h1>Grandir ici,<br />viser loin.</h1>
          <p>Leadership, aviation, plein air et esprit d'équipe : une expérience stimulante offerte aux jeunes de notre communauté.</p>
          <div class="actions">
            <a class="button button--gold" href="https://registration.cadets.gc.ca/" target="_blank" rel="noreferrer">S'inscrire aux cadets</a>
            <a class="button button--ghost" href="${communicationsUrl}">Voir toutes les communications</a>
          </div>
        </div>
      </section>

      <section class="upcoming" aria-labelledby="upcoming-title">
        <div class="container upcoming__layout">
          <div>
            <p class="eyebrow">Prochainement</p>
            <h2 id="upcoming-title">Les activités à venir</h2>
          </div>
          <div class="event-list">
            <article><time datetime="2026-09-02"><strong>02</strong><span>sept.</span></time><div><h3>Début des anciens cadets</h3><p>Reprise des activités pour les cadets qui étaient déjà inscrits.</p></div></article>
            <article><time datetime="2026-09-09"><strong>09</strong><span>sept.</span></time><div><h3>Début des recrues cadets</h3><p>Première rencontre pour les nouveaux cadets.</p></div></article>
          </div>
          <a class="text-link" href="${communicationsUrl}">Calendrier, annonces et horaire →</a>
        </div>
      </section>

      <section class="section intro" id="decouvrir">
        <div class="container split">
          <div><p class="eyebrow">Bienvenue au 839</p><h2>Une place pour apprendre, se dépasser et appartenir.</h2></div>
          <div><p>L'Escadron 839 Lions de Chibougamau accompagne les jeunes dans leur développement personnel et leur fait découvrir l'aviation, le leadership, le sport et la vie en plein air.</p><p>Le programme mise sur la confiance, l'autonomie, la discipline positive et le travail d'équipe.</p></div>
        </div>
      </section>

      <section class="section activities" id="activites">
        <div class="container media-grid">
          <img src="/Demo839web/tir-precision-original.png" alt="Matériel de tir de précision installé dans un espace d'entraînement" />
          <div><p class="eyebrow">Activités offertes</p><h2>De nouveaux défis toute l'année.</h2>
            <div class="activity-grid">
              <article><span>01</span><h3>Aviation</h3><p>Découverte du monde aéronautique et possibilités de formation.</p></article>
              <article><span>02</span><h3>Plein air</h3><p>Survie, orientation et activités dans notre environnement nordique.</p></article>
              <article><span>03</span><h3>Leadership</h3><p>Responsabilités progressives, communication et travail d'équipe.</p></article>
              <article><span>04</span><h3>Sport et précision</h3><p>Conditionnement physique et tir de précision encadré.</p></article>
            </div>
          </div>
        </div>
      </section>

      <section class="section parents" id="parents">
        <div class="container parents__grid">
          <div class="parents__card"><p class="eyebrow">Pour les parents</p><h2>Toute l'information au même endroit.</h2><p>Les annonces, les changements d'horaire et le calendrier complet sont accessibles publiquement, sans compte. Consultez-les régulièrement avant une activité.</p><a class="button" href="${communicationsUrl}">Ouvrir les communications</a></div>
          <div class="facts">
            <article><span>Horaire régulier</span><strong>Les mercredis, 18 h 30 à 21 h</strong></article>
            <article><span>Lieu de rencontre</span><strong>265, rue Lanctôt, Chibougamau</strong></article>
            <article><span>Âge</span><strong>De 12 à 18 ans</strong></article>
            <article><span>Inscription</span><strong>Formulaire officiel en ligne</strong></article>
          </div>
        </div>
      </section>

      <section class="section tradition">
        <div class="container media-grid media-grid--reverse">
          <div><p class="eyebrow">Tradition et communauté</p><h2>Fiers de marcher ensemble.</h2><p>Les parades, les cérémonies et l'engagement communautaire transmettent un héritage de service, de respect et de fierté. Chaque activité est une occasion de bâtir des liens durables.</p></div>
          <img src="/Demo839web/parade-archives.jpg" alt="Des membres de l'escadron défilent sur un aérodrome" />
        </div>
      </section>

      <section class="section partners">
        <div class="container"><p class="eyebrow">Partenaires</p><h2>Une communauté qui soutient sa jeunesse.</h2><p>Le succès de l'escadron repose sur l'engagement des familles, des bénévoles, des partenaires locaux et du programme des cadets du Canada.</p></div>
      </section>

      <section class="cta" id="contact">
        <div class="container cta__inner"><div><p class="eyebrow eyebrow--light">Prêt à commencer?</p><h2>Joins-toi aux Lions de Chibougamau.</h2><p>Découvre une équipe accueillante et une année remplie de possibilités.</p></div><div class="actions"><a class="button button--gold" href="https://registration.cadets.gc.ca/" target="_blank" rel="noreferrer">S'inscrire aux cadets</a><a class="button button--ghost" href="https://839aviation.cadets.site/" target="_blank" rel="noreferrer">Fiche officielle du 839</a></div></div>
      </section>
    </main>

    <footer class="site-footer">
      <div class="container footer-grid">
        <div class="brand brand--footer"><img src="/Demo839web/logo-couleur.png" alt="" /><span><strong>Escadron 839</strong><small>Lions de Chibougamau</small></span></div>
        <div><strong>Liens rapides</strong><a href="${communicationsUrl}">Communications publiques</a><a href="${administrationUrl}">Administration</a><a href="https://registration.cadets.gc.ca/" target="_blank" rel="noreferrer">Inscription officielle</a></div>
        <div><strong>Nous trouver</strong><p>265, rue Lanctôt<br />Chibougamau (Québec)</p></div>
      </div>
      <div class="container footer-bottom">© 2026 Escadron 839 Lions de Chibougamau</div>
    </footer>
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

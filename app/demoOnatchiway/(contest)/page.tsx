/* eslint-disable @next/next/no-img-element -- les médias privés ne doivent pas passer par l'optimiseur public */

import {
  contestConfig,
  getContestState,
  officialRules,
  prizeTiers
} from "../contest";
import { Countdown, TicketButton } from "../interactive";

const currency = new Intl.NumberFormat("fr-CA", {
  style: "currency",
  currency: "CAD",
  minimumFractionDigits: 2
});

const number = new Intl.NumberFormat("fr-CA");

export default function Home() {
  const contest = getContestState(contestConfig.soldTickets);
  const ticketButtonProps = {
    salesClose: contestConfig.salesClose,
    ticketingUrl: contestConfig.ticketingUrl
  };
  const legalIds = [
    contestConfig.racjLicense
      ? `Licence RACJ : ${contestConfig.racjLicense}`
      : "",
    contestConfig.neq ? `NEQ : ${contestConfig.neq}` : ""
  ].filter(Boolean);

  return (
    <>
      <a className="skip-link" href="#contenu">
        Aller au contenu
      </a>

      <header className="site-header">
        <a
          className="brand"
          href="#accueil"
          aria-label="Zec Onatchiway - Accueil"
        >
          <img src="/demoOnatchiway/logo-reseauzec.svg" alt="Réseau Zec" />
          <span className="brand__place">Onatchiway</span>
        </a>

        <nav className="site-nav" aria-label="Navigation principale">
          <a href="#progression">Progression</a>
          <a href="#prix">Les prix</a>
          <a href="#mission">La mission</a>
          <a href="#reglement">Règlement</a>
        </nav>

        <TicketButton compact {...ticketButtonProps} />
      </header>

      <main id="contenu">
        <section className="hero" id="accueil">
          <img
            className="hero__image"
            src="/demoOnatchiway/onatchiway-cover.webp"
            alt="Les chutes et la forêt boréale de la Zec Onatchiway"
          />
          <div className="hero__wash" aria-hidden="true" />
          <div className="hero__grain" aria-hidden="true" />

          <div className="hero__content">
            <div className="eyebrow-row">
              <span className="eyebrow">Grand tirage progressif</span>
              <span className="season">Automne 2026</span>
            </div>

            <h1>
              L’Appel
              <span>d’Onatchiway</span>
            </h1>

            <p className="hero__intro">
              Un seul billet sera pigé. Une seule personne remportera tout le
              bloc de prix débloqués.
            </p>

            <div className="hero__actions">
              <TicketButton {...ticketButtonProps} />
              <a className="text-link" href="#prix">
                Voir les 7 paliers <span aria-hidden="true">↓</span>
              </a>
            </div>

            <p className="collaboration">
              En collaboration avec{" "}
              <strong>{contestConfig.collaborator}</strong>
            </p>
          </div>

          <aside className="hero-card" aria-label="Résumé du tirage">
            <p className="hero-card__kicker">Gros lot potentiel</p>
            <p className="hero-card__value">8 168,20 $</p>
            <p className="hero-card__note">en équipements · taxes incluses</p>
            <div className="hero-card__rule" />
            <div className="hero-card__stats">
              <div>
                <strong>10 $</strong>
                <span>le billet</span>
              </div>
              <div>
                <strong>10 000</strong>
                <span>billets max.</span>
              </div>
              <div>
                <strong>1</strong>
                <span>gagnant</span>
              </div>
            </div>
          </aside>

          <div className="hero__edge" aria-hidden="true">
            <span>48° 58′ N</span>
            <span>Monts-Valin · Québec</span>
          </div>
        </section>

        <section className="deadline" aria-labelledby="deadline-title">
          <div className="section-shell deadline__inner">
            <div>
              <span className="section-label">Avant la fermeture</span>
              <h2 id="deadline-title">Chaque billet fait grandir le lot.</h2>
              <p>
                Fin des ventes le{" "}
                <strong>dimanche 18 octobre 2026 à 23 h 55</strong>.
              </p>
            </div>
            <Countdown salesClose={contestConfig.salesClose} />
          </div>
        </section>

        <section
          className="progress-section"
          id="progression"
          aria-labelledby="progress-title"
        >
          <div className="section-shell">
            <div className="section-heading section-heading--split">
              <div>
                <span className="section-label section-label--green">
                  La force du groupe
                </span>
                <h2 id="progress-title">
                  Plus on participe, plus on débloque.
                </h2>
              </div>
              <p>
                Le compteur est mis à jour manuellement par l’équipe de la ZEC.
                Tous les prix débloqués vont au même gagnant.
              </p>
            </div>

            <div className="progress-card">
              <div className="progress-card__top">
                <div>
                  <span>Billets vendus</span>
                  <strong>{number.format(contest.soldTickets)}</strong>
                  <small>sur {number.format(contestConfig.maxTickets)}</small>
                </div>
                <div className="current-prize">
                  <span>Lot actuellement garanti</span>
                  <strong>
                    {currency.format(contest.currentTier.cumulativeValue)}
                  </strong>
                </div>
              </div>

              <div
                className="progress-track"
                role="progressbar"
                aria-label="Progression des ventes de billets"
                aria-valuemin={0}
                aria-valuemax={contestConfig.maxTickets}
                aria-valuenow={contest.soldTickets}
              >
                <span
                  className="progress-track__fill"
                  style={{ width: `${contest.progressPercent}%` }}
                />
                {prizeTiers.slice(1).map((tier) => (
                  <span
                    className={`progress-track__marker${
                      contest.soldTickets >= tier.minTickets ? "is-reached" : ""
                    }`}
                    key={tier.level}
                    style={{
                      left: `${(tier.minTickets / contestConfig.maxTickets) * 100}%`
                    }}
                    title={`Palier ${tier.level} à ${number.format(tier.minTickets)} billets`}
                  />
                ))}
              </div>

              <div className="progress-card__bottom">
                <span>Palier 1 garanti dès le lancement</span>
                {contest.nextTier ? (
                  <strong>
                    Prochain déblocage à{" "}
                    {number.format(contest.nextTier.minTickets)} billets
                  </strong>
                ) : (
                  <strong>Tous les paliers sont débloqués!</strong>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="prizes" id="prix" aria-labelledby="prizes-title">
          <div className="section-shell">
            <div className="section-heading">
              <span className="section-label">Le bloc de prix</span>
              <h2 id="prizes-title">Sept paliers. Un seul grand gagnant.</h2>
              <p>
                Chaque nouveau seuil ajoute un équipement au lot. Rien n’est
                divisé : le billet gagnant remporte tout ce qui a été débloqué.
              </p>
            </div>

            <div className="prize-grid">
              {prizeTiers.map((tier) => {
                const unlocked =
                  tier.level === 1 || contest.soldTickets >= tier.minTickets;
                const current = contest.currentTier.level === tier.level;
                return (
                  <article
                    className={`prize-card${unlocked ? "is-unlocked" : ""}${
                      current ? "is-current" : ""
                    }`}
                    key={tier.level}
                  >
                    <div className="prize-card__number">
                      <span>Palier</span>
                      <strong>{String(tier.level).padStart(2, "0")}</strong>
                    </div>
                    <div className="prize-card__body">
                      <div className="prize-card__status">
                        {tier.level === 1
                          ? "Garanti"
                          : unlocked
                            ? "Débloqué"
                            : `${number.format(tier.minTickets)} billets`}
                      </div>
                      <h3>{tier.shortName}</h3>
                      <p>{tier.name}</p>
                      <div className="prize-card__values">
                        <span>
                          Valeur ajoutée{" "}
                          <strong>{currency.format(tier.addedValue)}</strong>
                        </span>
                        <span>
                          Lot cumulatif{" "}
                          <strong>
                            {currency.format(tier.cumulativeValue)}
                          </strong>
                        </span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section
          className="mission"
          id="mission"
          aria-labelledby="mission-title"
        >
          <div
            className="mission__photo"
            role="img"
            aria-label="Forêt et chutes de la Zec Onatchiway"
          />
          <div className="mission__content">
            <span className="section-label section-label--green">
              Un billet qui reste ici
            </span>
            <h2 id="mission-title">
              Soutenir le territoire. Préparer la suite.
            </h2>
            <p className="mission__lead">
              Tous les bénéfices nets du tirage serviront à améliorer les
              infrastructures et le territoire de l’Association Onatchiway.
            </p>
            <ul className="mission-list">
              <li>
                <span>01</span>
                <div>
                  <strong>Entretenir les accès</strong>
                  <p>
                    Des chemins plus fiables pour les saisons de chasse et de
                    pêche.
                  </p>
                </div>
              </li>
              <li>
                <span>02</span>
                <div>
                  <strong>Améliorer les infrastructures</strong>
                  <p>
                    Des installations communes durables et utiles sur le
                    terrain.
                  </p>
                </div>
              </li>
              <li>
                <span>03</span>
                <div>
                  <strong>Préserver notre forêt</strong>
                  <p>
                    Un territoire accessible, sécuritaire et vivant pour
                    longtemps.
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </section>

        <section className="important" aria-labelledby="important-title">
          <div className="section-shell">
            <div className="section-heading section-heading--split">
              <div>
                <span className="section-label section-label--green">
                  À retenir
                </span>
                <h2 id="important-title">
                  Les règles essentielles, sans détour.
                </h2>
              </div>
              <p>
                Participation réservée aux résidents du Québec âgés de 18 ans et
                plus. Aucune limite de billets par personne.
              </p>
            </div>

            <div className="facts-grid">
              <article>
                <span className="fact-number">01</span>
                <h3>Fin des ventes</h3>
                <p>
                  Dimanche 18 octobre 2026
                  <br />à 23 h 55.
                </p>
              </article>
              <article>
                <span className="fact-number">02</span>
                <h3>Tirage public</h3>
                <p>Lundi 19 octobre 2026 à 17 h, devant trois témoins.</p>
              </article>
              <article>
                <span className="fact-number">03</span>
                <h3>Réclamation</h3>
                <p>
                  Le billet électronique doit être présenté dans les 60 jours.
                </p>
              </article>
              <article>
                <span className="fact-number">04</span>
                <h3>Prix matériels</h3>
                <p>Non échangeables, non transférables et non monnayables.</p>
              </article>
            </div>

            <div className="platform-note">
              <strong>À savoir avant le paiement</strong>
              <p>
                La plateforme de billetterie peut ajouter un don optionnel pour
                son fonctionnement. Vous pourrez le modifier ou le ramener à 0 $
                avant de payer. Aucun reçu fiscal n’est remis pour l’achat d’un
                billet.
              </p>
            </div>
          </div>
        </section>

        <section className="rules" id="reglement" aria-labelledby="rules-title">
          <div className="section-shell">
            <div className="section-heading section-heading--split">
              <div>
                <span className="section-label">Transparence</span>
                <h2 id="rules-title">Règlement complet</h2>
              </div>
              <p>
                Cette version Web reprend les 24 articles du règlement. La
                valeur cumulative du palier 5 est corrigée à 4 040,68 $,
                conformément à la somme des prix et au total maximal déclaré.
              </p>
            </div>

            <div className="rules-list">
              {officialRules.map((rule) => (
                <details key={rule.number}>
                  <summary>
                    <span>{String(rule.number).padStart(2, "0")}</span>
                    <strong>{rule.title}</strong>
                    <i aria-hidden="true">+</i>
                  </summary>
                  <div className="rule-copy">
                    {rule.paragraphs.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                </details>
              ))}
            </div>

            <p className="rules-note">
              Le PDF source n’est pas offert en téléchargement tant que sa
              correction arithmétique n’a pas été officialisée.
            </p>
          </div>
        </section>

        <section className="final-cta" aria-labelledby="final-title">
          <div className="section-shell final-cta__inner">
            <div>
              <span className="section-label section-label--green">
                Un territoire, un appel
              </span>
              <h2 id="final-title">
                Votre chance de tout remporter commence à 10 $.
              </h2>
            </div>
            <div>
              <TicketButton {...ticketButtonProps} />
              <small>
                Taxes incluses · 18 ans et plus · Résidents du Québec
              </small>
            </div>
          </div>
        </section>
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
            <span className="footer-label">Suivre la ZEC</span>
            <a
              href={contestConfig.contact.facebook}
              target="_blank"
              rel="noreferrer"
            >
              Facebook <span aria-hidden="true">↗</span>
            </a>
            <a href="#reglement">Règlement du tirage</a>
          </div>

          {legalIds.length > 0 && (
            <div className="legal-identifiers">
              {legalIds.map((identifier) => (
                <span key={identifier}>{identifier}</span>
              ))}
            </div>
          )}
        </div>

        <div className="section-shell footer-bottom">
          <span>© 2026 Association Onatchiway</span>
          <span>Site informatif · Aucun paiement traité ici</span>
        </div>
      </footer>
    </>
  );
}

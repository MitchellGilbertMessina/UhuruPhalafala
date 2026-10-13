/* eslint-disable @next/next/no-img-element */
import { landing } from "@/content/sensuousHeirloomsLanding";
import styles from "./PublicationLanding.module.css";

export default function PublicationLanding({
  aboutActive,
}: {
  aboutActive: boolean;
}) {
  return (
    <section id="landing" className={styles.landing} data-reader-page="landing">
      <div className={styles.stage}>
        <picture className={styles.bg}>
          <source media="(max-width: 700px)" srcSet={landing.bgPortraitSrc} />
          <img src={landing.bgLandscapeSrc} alt="" />
        </picture>

        <div className={styles.names}>
          <img src={landing.namesSrc} alt={landing.namesAlt} />
        </div>

        <div className={styles.about} inert={!aboutActive}>
          <div className={styles.aboutInner}>
            <p className={styles.epigraph}>{landing.epigraph}</p>
            <p>{landing.blurb}</p>

            <ul className={styles.links}>
              {landing.links.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target={link.href.startsWith("mailto:") ? undefined : "_blank"}
                    rel="noreferrer"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
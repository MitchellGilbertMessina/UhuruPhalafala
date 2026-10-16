
/* eslint-disable @next/next/no-img-element */
import type { MouseEvent } from "react";
import { landing } from "@/content/sensuousHeirloomsLanding";
import styles from "./PublicationLanding.module.css";

export default function PublicationLanding({
  aboutActive,
  onAdvance,
}: {
  aboutActive: boolean;
  onAdvance: () => void;
}) {
  const handleStageClick = (event: MouseEvent<HTMLDivElement>) => {
    // Preserve the normal behaviour of the external links.
    if ((event.target as HTMLElement).closest("a")) return;
    onAdvance();
  };

  return (
    <section id="landing" className={styles.landing} data-reader-page="landing">
      <div className={styles.stage} onClick={handleStageClick}>
        <picture className={styles.bg}>
          <source media="(max-width: 700px)" srcSet={landing.bgPortraitSrc} />
          <img src={landing.bgLandscapeSrc} alt="" />
        </picture>

        <div className={styles.names}>
          <picture>
            <source media="(max-width: 700px)" srcSet={landing.namesPortraitSrc} />
            <img src={landing.namesSrc} alt={landing.namesAlt} />
          </picture>
        </div>

        <div className={styles.about} inert={!aboutActive}>
          <div className={styles.aboutInner}>
            <p className={styles.epigraph}>{landing.epigraph}</p>
            <p>{landing.blurb}</p>
            <p className={styles.framing}>{landing.framing}</p>
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

"use client";
/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";
import type { MouseEvent } from "react";
import { landing } from "@/content/sensuousHeirloomsLanding";
import styles from "./PublicationLanding.module.css";
import { FaInstagram, FaYoutube, FaEnvelope } from "react-icons/fa";

type Props = {
  aboutActive: boolean;
  onAdvance: () => void;
};

export default function PublicationLanding({
  aboutActive,
  onAdvance,
}: Props) {
  const [bgLoaded, setBgLoaded] = useState(false);
  const bgRef = useRef<HTMLImageElement>(null);

  // Covers the sharp background finishing before the page hydrated.
  useEffect(() => {
    const img = bgRef.current;
    if (img?.complete && img.naturalWidth > 0) setBgLoaded(true);
  }, []);

  const handleStageClick = (event: MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;

    // Let links behave normally.
    if (target.closest("a")) return;

    // Tapping anywhere else advances to the next landing state.
    onAdvance();
  };

  const linkIcons = {
  Instagram: FaInstagram,
  YouTube: FaYoutube,
  Email: FaEnvelope,
};

  const handleAboutClick = (event: MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;

    // Do not intercept external links.
    if (target.closest("a")) return;

    // Prevent the stage handler from firing a second time.
    event.stopPropagation();

    // Advance from the description to the publication.
    onAdvance();
  };

  return (
    <section
      id="landing"
      className={styles.landing}
      data-reader-page="landing"
    >
      <div className={styles.stage} onClick={handleStageClick}>
        {/* Three layers, blurry to sharp: CSS preview, low file, full srcSet. */}
        <div className={styles.bg} data-loaded={bgLoaded}>
          <picture>
            <source media="(max-width: 700px)" srcSet={landing.bg.portrait.low} />
            <img className={styles.bgLow} src={landing.bg.landscape.low} alt="" />
          </picture>

          <picture>
            <source
              media="(max-width: 700px)"
              srcSet={landing.bg.portrait.srcSet}
              sizes={landing.bg.portrait.sizes}
            />
            <img
              ref={bgRef}
              className={styles.bgFull}
              src={landing.bg.landscape.src}
              srcSet={landing.bg.landscape.srcSet}
              sizes={landing.bg.landscape.sizes}
              alt=""
              fetchPriority="high"
              decoding="async"
              onLoad={() => setBgLoaded(true)}
            />
          </picture>
        </div>

        <div className={styles.names}>
          <picture>
            <source
              media="(max-width: 700px)"
              srcSet={landing.namesPortraitSrc}
            />
            <img
              src={landing.namesSrc}
              alt={landing.namesAlt}
            />
          </picture>
        </div>

        <div
          className={styles.about}
          inert={!aboutActive}
          onClick={handleAboutClick}
        >
          <div className={styles.aboutInner}>
            <p className={styles.epigraph}>{landing.epigraph}</p>

            <p>{landing.blurb}</p>

            <p className={styles.framing}>{landing.framing}</p>

            <ul className={styles.links}>
              {landing.links.map((link) => {
                const Icon = linkIcons[link.label as keyof typeof linkIcons];

                return (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target={link.href.startsWith("mailto:") ? undefined : "_blank"}
                      rel={link.href.startsWith("mailto:") ? undefined : undefined}
                      aria-label={link.label}
                      title={link.label}
                    >
                      <Icon aria-hidden="true" size={28} />
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

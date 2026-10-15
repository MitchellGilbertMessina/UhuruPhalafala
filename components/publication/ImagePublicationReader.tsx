"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { ClipboardEvent, CSSProperties, MouseEvent } from "react";
import type { ImageChapter } from "@/types/imageChapter";
import { isOpenChapter } from "@/types/imageChapter";
import SelectablePublicationPage from "@/components/publication/SelectablePublicationPage";
import PublicationLanding from "@/components/publication/PublicationLanding";
import ChapterMedia from "@/components/publication/ChapterMedia";
import styles from "./ImagePublicationReader.module.css";

type Props = {
  chapters: ImageChapter[];
  initialSlug: string | null;
};

const LANDING_KEY = "landing";

const withDownload = (url: string, filename: string) =>
  `${url}${url.includes("?") ? "&" : "?"}dl=${encodeURIComponent(filename)}`;

export default function ImagePublicationReader({
  chapters,
  initialSlug,
}: Props) {
  const startsPastLanding = initialSlug !== null;

  const [activeKey, setActiveKey] = useState<string>(initialSlug ?? LANDING_KEY);
  const [aboutActive, setAboutActive] = useState(false);
  const [sidebarActive, setSidebarActive] = useState(startsPastLanding);
  const initialScrollDone = useRef(false);
  const shellRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDetailsElement>(null);

  const openChapters = useMemo(() => chapters.filter(isOpenChapter), [chapters]);

  const onLanding = activeKey === LANDING_KEY;
  const activeSlug = onLanding ? null : activeKey;

  // Scroll to the requested contribution (or the landing) on first load.
  useEffect(() => {
    const target = document.getElementById(
      initialSlug ? `chapter-${initialSlug}` : "landing"
    );
    target?.scrollIntoView({ block: "start" });

    const id = requestAnimationFrame(() => {
      initialScrollDone.current = true;
    });
    return () => cancelAnimationFrame(id);
  }, [initialSlug]);

  // Keep the URL in sync with the section being read.
  useEffect(() => {
    if (!initialScrollDone.current) return;

    const expectedPath = onLanding
      ? "/sensuousheirlooms"
      : `/sensuousheirlooms/${activeKey}`;

    if (window.location.pathname !== expectedPath) {
      window.history.replaceState(window.history.state, "", expectedPath);
    }
  }, [activeKey, onLanding]);

  // Work out which section sits near the top of the viewport.
  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>("[data-reader-page]");

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              Math.abs(a.boundingClientRect.top) -
              Math.abs(b.boundingClientRect.top)
          );

        const key = visible[0]?.target.getAttribute("data-reader-page");
        if (key) setActiveKey(key);
      },
      { rootMargin: "-10% 0px -65% 0px", threshold: 0 }
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [chapters]);

  // Landing scroll progress: writes --p (0 → 1) onto the shell element.
  useEffect(() => {
    const shell = shellRef.current;
    const landing = document.getElementById("landing");
    if (!shell || !landing) return;

    let frame = 0;

    const update = () => {
      frame = 0;
      const rect = landing.getBoundingClientRect();
      const stageHeight = (landing.firstElementChild as HTMLElement).offsetHeight;
      const total = rect.height - stageHeight;
      const p = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 1;

      shell.style.setProperty("--p", p.toFixed(4));
      setAboutActive(p > 0.3 && p < 0.85);
      setSidebarActive(p > 0.9);
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  const jumpToChapter = (slug: string) => {
    if (menuRef.current) menuRef.current.open = false;
    document
      .getElementById(`chapter-${slug}`)
      ?.scrollIntoView({ block: "start" });
  };

  const goHome = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    document.getElementById("landing")?.scrollIntoView({ block: "start" });
  };

  return (
    <div
      ref={shellRef}
      className={styles.shell}
      style={{ "--p": startsPastLanding ? 1 : 0 } as CSSProperties}
    >
      <Link
        href="/sensuousheirlooms"
        className={styles.logo}
        data-after-landing={sidebarActive}
        onClick={goHome}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className={styles.logoBlack}
          src="/sensuous-heirlooms-logo-black.svg"
          alt="Sensuous Heirlooms"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className={styles.logoWhite}
          src="/sensuous-heirlooms-logo-white.svg"
          alt=""
          aria-hidden="true"
        />
      </Link>

      <PublicationLanding aboutActive={aboutActive} />

      <main className={styles.reader}>
        <aside className={styles.sidebar} inert={!sidebarActive}>
          <Link
            href="/sensuousheirlooms"
            className={styles.mobileHome}
            onClick={goHome}
          >
            ← Sensuous Heirlooms
          </Link>

          <details className={styles.mobileMenu} ref={menuRef}>
            <summary>Contents</summary>
            <ContentsList
              chapters={chapters}
              activeSlug={activeSlug}
              onJump={jumpToChapter}
            />
          </details>

          <div className={styles.desktopMenu}>
            <p>CONTENTS</p>
            <ContentsList
              chapters={chapters}
              activeSlug={activeSlug}
              onJump={jumpToChapter}
            />
          </div>
        </aside>

        <section className={styles.readingArea} onCopy={handleCopy}>
          {openChapters.map((chapter, index) => {
            const pages = chapter.pages ?? [];
            const pdfUrl = chapter.pdf?.asset?.url ?? null;

            return (
              <Fragment key={chapter._id}>
                <article
                  id={`chapter-${chapter.slug}`}
                  className={styles.contribution}
                  data-reader-page={chapter.slug}
                >
                  <header className={styles.contributionHeader}>
                    <p className={styles.contributionAuthor}>
                      {chapter.contributor}
                    </p>
                    <h2 className={styles.contributionTitle}>{chapter.title}</h2>

                    {pdfUrl && (
                      <a
                        className={styles.downloadLink}
                        href={withDownload(
                          pdfUrl,
                          `${chapter.contributor} - Sensuous Heirlooms.pdf`
                        )}
                        aria-label={`Download ${chapter.contributor} as a PDF`}
                      >
                        <DownloadIcon />
                        <span>Download PDF</span>
                      </a>
                    )}
                  </header>

                  {chapter.intro && (
                    <div className={styles.intro}>
                      {chapter.intro.split(/\n{2,}/).map((paragraph, i) => (
                        <p key={i}>{paragraph}</p>
                      ))}
                    </div>
                  )}

                  <ChapterMedia media={chapter.media ?? []} />

                  {pages.length > 0 && (
                    <div className={styles.pages}>
                      {pages.map((page, pageIndex) => (
                        <figure className={styles.page} key={page._key}>
                          <SelectablePublicationPage
                            pdfUrl={pdfUrl}
                            pdfPageIndex={pageIndex}
                          >
                            <Image
                              src={page.url}
                              alt={
                                page.alt ||
                                `${chapter.title}, page ${page.pageNumber ?? pageIndex + 1}`
                              }
                              width={1772}
                              height={2421}
                              unoptimized
                              draggable={false}
                              sizes="(max-width: 700px) 96vw, 70vw"
                            />
                          </SelectablePublicationPage>
                        </figure>
                      ))}
                    </div>
                  )}

                  {index < openChapters.length - 1 && (
                    <div className={styles.divider} role="separator" />
                  )}
                </article>
              </Fragment>
            );
          })}

          <div className={styles.endSpacer} />
        </section>
      </main>
    </div>
  );
}

const handleCopy = (event: ClipboardEvent<HTMLElement>) => {
  const selection = window.getSelection();
  if (!selection || selection.isCollapsed) return;

  const text = selection
    .toString()
    .replace(/\r/g, "")
    .replace(/[\uFFFC\uFFFD\u00AD]/g, "") // object/replacement chars, soft hyphens
    .replace(/\n{2,}/g, "\n") // collapse the doubled line breaks
    .trim();

  event.clipboardData.setData("text/plain", text);
  event.preventDefault();
};

function DownloadIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M8 2v8M4.5 7 8 10.5 11.5 7M3 13.5h10" />
    </svg>
  );
}

function ContentsList({
  chapters,
  activeSlug,
  onJump,
}: {
  chapters: ImageChapter[];
  activeSlug: string | null;
  onJump: (slug: string) => void;
}) {
  return (
    <nav className={styles.contentsNav} aria-label="Contents">
      <ul className={styles.contents}>
        {chapters.map((chapter) => {
          const label = (
            <>
              <span className={styles.contentsAuthor}>{chapter.contributor}</span>
              <span className={styles.contentsTitle}>{chapter.title}</span>
            </>
          );

          return (
            <li key={chapter._id}>
              {isOpenChapter(chapter) ? (
                <Link
                  href={`/sensuousheirlooms/${chapter.slug}`}
                  className={styles.contentsLink}
                  aria-current={chapter.slug === activeSlug ? "page" : undefined}
                  onClick={(e) => {
                    // let cmd/ctrl/middle-click open a new tab as normal
                    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                    e.preventDefault();
                    onJump(chapter.slug);
                  }}
                >
                  {label}
                </Link>
              ) : (
                <span className={styles.contentsClosed}>{label}</span>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
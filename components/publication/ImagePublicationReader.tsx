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
  const sidebarRef = useRef<HTMLElement>(null);
  const sidebarScrollRef = useRef<HTMLDivElement>(null);

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
      setAboutActive(p > 0.3 && p < 0.62);
      setSidebarActive(p > 0.95);
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

  // Subtle scroll indicator: a dot that tracks the sidebar's scroll position.
  useEffect(() => {
    const aside = sidebarRef.current;
    const scroller = sidebarScrollRef.current;
    if (!aside || !scroller) return;

    const update = () => {
      const max = scroller.scrollHeight - scroller.clientHeight;
      aside.dataset.scrollable = String(max > 1);
      aside.style.setProperty(
        "--sb",
        max > 1 ? String(scroller.scrollTop / max) : "0"
      );
    };

    update();
    scroller.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      scroller.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  // Gently bring the active contribution into view in the sidebar.
  useEffect(() => {
    const scroller = sidebarScrollRef.current;
    if (!scroller || !activeSlug) return;

    // the contents list is rendered twice (desktop + phone); pick the visible one
    const link = Array.from(
      scroller.querySelectorAll<HTMLElement>(`[data-slug="${activeSlug}"]`)
    ).find((el) => el.getClientRects().length > 0);
    if (!link) return;

    const box = scroller.getBoundingClientRect();
    const rect = link.getBoundingClientRect();
    const topEdge = box.top + parseFloat(getComputedStyle(scroller).paddingTop);
    const bottomEdge = box.bottom - 48;

    if (rect.top < topEdge || rect.bottom > bottomEdge) {
      scroller.scrollTo({
        top: scroller.scrollTop + (rect.top - box.top) - box.height * 0.35,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
      });
    }
  }, [activeSlug]);

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

      <PublicationLanding
        aboutActive={aboutActive}
        onAdvance={advanceLanding}
      />

      <main className={styles.reader}>
        <aside ref={sidebarRef} className={styles.sidebar} inert={!sidebarActive}>
          <div ref={sidebarScrollRef} className={styles.sidebarScroll}>
            <Link href="/sensuousheirlooms" className={styles.mobileHome} onClick={goHome}>
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
          </div>

          <span className={styles.scrollDot} aria-hidden="true" />
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
                    <h2 className={styles.contributionTitle}>
                      {chapter.title}
                      {pdfUrl && (
                        <a
                          className={styles.downloadLink}
                          href={withDownload(pdfUrl, `${chapter.contributor} - Sensuous Heirlooms.pdf`)}
                          aria-label={`Download ${chapter.contributor} as a PDF`}
                          title="Download PDF"
                        >
                          <DownloadIcon />
                        </a>
                      )}
                    </h2>
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
                            <PageImage
                              src={page.url}
                              alt={
                                page.alt ||
                                `${chapter.title.replace(/\s*\n\s*/g, " / ")}, page ${page.pageNumber ?? pageIndex + 1}`
                              }
                              sizes="(max-width: 700px) 96vw, 70vw"
                            />
                          </SelectablePublicationPage>
                        </figure>
                      ))}
                    </div>
                  )}

                  {index < openChapters.length - 1 && (
                    <div className={styles.dividerWrap}>
                      <div className={styles.divider} role="separator" />
                    </div>
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
                  data-slug={chapter.slug}
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

const tinyUrl = (url: string) => `${url}?w=32&q=40&auto=format`;

function PageImage({
  src,
  alt,
  sizes,
}: {
  src: string;
  alt: string;
  sizes: string;
}) {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Covers images that finished loading before hydration.
  useEffect(() => {
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth > 0) setLoaded(true);
  }, []);


  const advanceLanding = () => {
    const landingElement = document.getElementById("landing");
    if (!landingElement) return;

    const stage = landingElement.firstElementChild as HTMLElement | null;
    if (!stage) return;

    const rect = landingElement.getBoundingClientRect();
    const total = rect.height - stage.offsetHeight;
    if (total <= 0) return;

    const currentProgress = Math.min(
      1,
      Math.max(0, -rect.top / total)
    );

    // First tap: show the information.
    // Second tap: move to the publication.
    const targetProgress = currentProgress < 0.65 ? 0.42 : 1;

    window.scrollTo({
      top: window.scrollY + rect.top + total * targetProgress,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  };


  return (
    <div className={styles.pageImage} data-page-image data-loaded={loaded}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className={styles.placeholder}
        src={tinyUrl(src)}
        alt=""
        aria-hidden="true"
      />
      <Image
        ref={imgRef}
        src={src}
        alt={alt}
        width={1772}
        height={2421}
        unoptimized
        draggable={false}
        sizes={sizes}
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}


const advanceLanding = () => {
  const landingElement = document.getElementById("landing");
  if (!landingElement) return;

  const stage = landingElement.firstElementChild as HTMLElement | null;
  if (!stage) return;

  const rect = landingElement.getBoundingClientRect();
  const total = rect.height - stage.offsetHeight;
  if (total <= 0) return;

  const currentProgress = Math.min(
    1,
    Math.max(0, -rect.top / total)
  );

  // First tap: show the information.
  // Second tap: move to the publication.
  const targetProgress = currentProgress < 0.65 ? 0.42 : 1;

  window.scrollTo({
    top: window.scrollY + rect.top + total * targetProgress,
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth",
  });
};

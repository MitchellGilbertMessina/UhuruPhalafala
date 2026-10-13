"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { ImageChapter } from "@/types/imageChapter";
import SelectablePublicationPage from "@/components/publication/SelectablePublicationPage";
import styles from "./ImagePublicationReader.module.css";
import type { ClipboardEvent, CSSProperties, MouseEvent } from "react";
import PublicationLanding from "@/components/publication/PublicationLanding";

type ReaderPage = {
  key: string;
  url: string;
  alt: string;
  pageNumber: number | null;
  pdfUrl: string | null;
  chapterSlug: string;
  chapterTitle: string;
  contributor: string;
  chapterIndex: number;
  pageIndex: number;
};

type Props = {
  chapters: ImageChapter[];
  initialSlug: string | null;
  initialView: "scroll" | "spread";
};

const LANDING_KEY = "landing";

export default function ImagePublicationReader({
  chapters,
  initialSlug,
  initialView,
}: Props) {
  const startsPastLanding = initialSlug !== null || initialView === "spread";

  const [view, setView] = useState<"scroll" | "spread">(initialView);
  const [spreadStart, setSpreadStart] = useState(0);
  const [activePageKey, setActivePageKey] = useState<string | null>(
    initialSlug ? null : LANDING_KEY
  );
  const [aboutActive, setAboutActive] = useState(false);
  const [sidebarActive, setSidebarActive] = useState(startsPastLanding);
  const initialScrollDone = useRef(false);
  const menuRef = useRef<HTMLDetailsElement>(null);
  const activeSlugRef = useRef<string | null>(initialSlug);
  const shellRef = useRef<HTMLDivElement>(null);

  const pages = useMemo<ReaderPage[]>(() => {
    return chapters.flatMap((chapter, chapterIndex) =>
      (chapter.pages ?? []).map((page, pageIndex) => ({
        key: `${chapter._id}-${page._key}`,
        url: page.url,
        alt:
          page.alt ||
          `${chapter.title}, page ${page.pageNumber ?? pageIndex + 1}`,
        pageNumber: page.pageNumber ?? null,
        pdfUrl: chapter.pdf?.asset?.url ?? null,
        chapterSlug: chapter.slug,
        chapterTitle: chapter.title,
        contributor: chapter.contributor,
        chapterIndex,
        pageIndex,
      }))
    );
  }, [chapters]);

  const initialPageIndex = Math.max(
    0,
    pages.findIndex((page) => page.chapterSlug === initialSlug)
  );

  const onLanding = view === "scroll" && activePageKey === LANDING_KEY;

  const activePage = onLanding
    ? undefined
    : (pages.find((page) => page.key === activePageKey) ??
      pages[initialPageIndex]);

  const activeChapter =
    chapters.find((chapter) => chapter.slug === activePage?.chapterSlug) ??
    chapters[0];
  activeSlugRef.current = onLanding
    ? null
    : (activePage?.chapterSlug ?? initialSlug);

  const spreadPages = pages.slice(spreadStart, spreadStart + 2);

  const formatPageNumber = (page: ReaderPage | undefined) => {
    if (!page?.pageNumber) return "—";
    return String(page.pageNumber).padStart(2, "0");
  };

  const counter = () => {
    const first = spreadPages[0];
    const second = spreadPages[1];

    if (!first) return "";

    const start = formatPageNumber(first);
    const end = second ? formatPageNumber(second) : start;

    return `${start}–${end} / 244`;
  };

  // Keep the URL in sync with the chapter currently being read.
  useEffect(() => {
    if (!initialScrollDone.current) return;

    const expectedPath = onLanding
      ? "/sensuousheirlooms"
      : activePage
        ? `/sensuousheirlooms/${activePage.chapterSlug}`
        : null;

    if (!expectedPath) return;

    const url = new URL(window.location.href);
    if (url.pathname !== expectedPath) {
      window.history.replaceState(
        window.history.state,
        "",
        `${expectedPath}${url.search}`
      );
    }
  }, [activePage, onLanding]);

  // Identify the page nearest the top of the viewport in scroll mode.
  useEffect(() => {
    if (view !== "scroll") return;

    const elements = document.querySelectorAll<HTMLElement>(
      "[data-reader-page]"
    );

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

        if (key) setActivePageKey(key);
      },
      {
        rootMargin: "-10% 0px -65% 0px",
        threshold: 0,
      }
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [view, pages]);

  // Begin spread mode at the selected chapter.
  useEffect(() => {
    if (view !== "spread") return;

    const index = pages.findIndex(
      (page) => page.chapterSlug === initialSlug
    );

    if (index >= 0) setSpreadStart(index);
  }, [view, initialSlug, pages]);

  // Update the active chapter when the spread changes.
  useEffect(() => {
    if (view !== "spread") return;

    const page = pages[spreadStart];
    if (page) setActivePageKey(page.key);
  }, [view, spreadStart, pages]);

  // Scrolls to the chapter on first load, and also when you switch from Spread
  // to Scroll, where it lands on the chapter you were reading.
  useEffect(() => {
    initialScrollDone.current = false;

    if (view === "scroll") {
      const target = activeSlugRef.current
        ? document.getElementById(`chapter-${activeSlugRef.current}`)
        : document.getElementById("landing");
      target?.scrollIntoView({ block: "start" });
    }

    const id = requestAnimationFrame(() => {
      initialScrollDone.current = true;
    });
    return () => cancelAnimationFrame(id);
  }, [view]);

  // Landing scroll progress: writes --p (0 → 1) onto the shell element.
  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;

    const landing = document.getElementById("landing");

    if (view !== "scroll" || !landing) {
      shell.style.setProperty("--p", "1");
      setAboutActive(false);
      setSidebarActive(true);
      return;
    }

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
  }, [view]);

  //No Spread on mobile
  useEffect(() => {
    if (window.matchMedia("(max-width: 700px)").matches) setView("scroll");
  }, []);

  const changeView = (nextView: "scroll" | "spread") => {
    setView(nextView);

    const url = new URL(window.location.href);
    url.searchParams.set("view", nextView);

    window.history.replaceState(window.history.state, "", url);
  };

  const moveSpread = (direction: -1 | 1) => {
    setSpreadStart((current) =>
      Math.max(0, Math.min(pages.length - 1, current + direction * 2))
    );
  };

  const jumpToChapter = (slug: string) => {
    if (menuRef.current) menuRef.current.open = false;
    if (view === "scroll") {
      document
        .getElementById(`chapter-${slug}`)
        ?.scrollIntoView({ block: "start" });
    } else {
      const i = pages.findIndex((p) => p.chapterSlug === slug);
      if (i >= 0) setSpreadStart(i);
    }
  };

  const withDownload = (url: string, filename: string) =>
  `${url}${url.includes("?") ? "&" : "?"}dl=${encodeURIComponent(filename)}`;

  const goHome = (e: MouseEvent<HTMLAnchorElement>) => {
    if (view !== "scroll") return; // spread mode: normal navigation
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    document.getElementById("landing")?.scrollIntoView({ block: "start" });
  };

  if (!chapters.length || !pages.length || !activeChapter) {
    return <main>No publication pages have been uploaded yet.</main>;
  }

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


      {view === "scroll" && <PublicationLanding aboutActive={aboutActive} />}

      <main className={styles.reader}>
        <aside className={styles.sidebar} inert={!sidebarActive}>
          <Link href="/sensuousheirlooms" className={styles.mobileHome} onClick={goHome}>
            ← Sensuous Heirlooms
          </Link>
          <div className={styles.viewToggle}>
            <button
              onClick={() => changeView("scroll")}
              aria-pressed={view === "scroll"}
            >
              Scroll
            </button>

            <button
              onClick={() => changeView("spread")}
              aria-pressed={view === "spread"}
            >
              Spreads
            </button>
          </div>

          <details className={styles.mobileMenu} ref={menuRef}>
            <summary>Contents</summary>
            <ChapterLinks
              chapters={chapters}
              activeSlug={onLanding ? null : activeChapter.slug}
              onJump={jumpToChapter}
            />
          </details>

          <div className={styles.desktopMenu}>
            <p>CONTENTS</p>
            <ChapterLinks
              chapters={chapters}
              activeSlug={onLanding ? null : activeChapter.slug}
              onJump={jumpToChapter}
            />
          </div>
        </aside>

        <section className={styles.readingArea} onCopy={handleCopy}>
          {view === "spread" && (
            <header className={styles.chapterHeader}>
              <h1>{activeChapter.title}</h1>
              <p>{activeChapter.contributor}</p>

              {activeChapter.pdf?.asset?.url && (
                <a
                  href={activeChapter.pdf.asset.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  Download chapter PDF ↓
                </a>
              )}
            </header>
          )}

          {view === "scroll" ? (
            <div className={styles.scrollPages}>
              {pages.map((page, index) => (
                <figure
                  id={page.pageIndex === 0 ? `chapter-${page.chapterSlug}` : undefined}
                  className={`${styles.scrollPage} ${index % 2 === 0 ? styles.leftPage : styles.rightPage
                    }`}
                  key={page.key}
                  data-reader-page={page.key}
                >
                  <SelectablePublicationPage
                    pdfUrl={page.pdfUrl}
                    pdfPageIndex={page.pageIndex}
                  >
                    <Image
                      src={page.url}
                      alt={page.alt}
                      width={1772}
                      height={2421}
                      unoptimized
                      draggable={false}
                      priority={index < 2}
                      sizes="(max-width: 700px) 96vw, 70vw"
                    />
                  </SelectablePublicationPage>
                </figure>
              ))}
            </div>
          ) : (
            <div className={styles.spreadViewer}>
              <div className={styles.spread}>
                {spreadPages.map((page) => (
                  <figure className={styles.spreadPage} key={page.key}>
                    <SelectablePublicationPage
                      pdfUrl={page.pdfUrl}
                      pdfPageIndex={page.pageIndex}
                    >
                      <Image
                        src={page.url}
                        alt={page.alt}
                        width={1772}
                        height={2421}
                        unoptimized
                        priority
                        draggable={false}
                        sizes="(max-width: 700px) 48vw, 45vw"
                      />
                    </SelectablePublicationPage>
                  </figure>
                ))}
              </div>

              <nav
                className={styles.spreadControls}
                aria-label="Page navigation"
              >
                <button
                  onClick={() => moveSpread(-1)}
                  disabled={spreadStart === 0}
                  aria-label="Previous spread"
                >
                  ←
                </button>

                <span>{counter()}</span>

                <button
                  onClick={() => moveSpread(1)}
                  disabled={spreadStart + 2 >= pages.length}
                  aria-label="Next spread"
                >
                  →
                </button>
              </nav>
            </div>
          )}
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
    .replace(/\n{2,}/g, "\n")             // collapse the doubled line breaks
    .trim();

  event.clipboardData.setData("text/plain", text);
  event.preventDefault();
};

function ChapterLinks({
  chapters,
  activeSlug,
  onJump,
}: {
  chapters: ImageChapter[];
  activeSlug: string | null;
  onJump: (slug: string) => void;
}) {
  return (
    <nav className={styles.chapterList}>
      {chapters.map((chapter) => (
        <Link
          key={chapter._id}
          href={`/sensuousheirlooms/${chapter.slug}`}
          aria-current={chapter.slug === activeSlug ? "page" : undefined}
          onClick={(e) => {
            // let cmd/ctrl/middle-click open a new tab as normal
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
            e.preventDefault();
            onJump(chapter.slug);
          }}
        >
          {chapter.contributor}
        </Link>
      ))}
    </nav>
  );
}


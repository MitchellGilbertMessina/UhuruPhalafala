
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { ImageChapter } from "@/types/imageChapter";
import SelectablePublicationPage from "@/components/publication/SelectablePublicationPage";
import styles from "./ImagePublicationReader.module.css";
import type { ClipboardEvent } from "react";

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
  initialSlug: string;
  initialView: "scroll" | "spread";
};

export default function ImagePublicationReader({
  chapters,
  initialSlug,
  initialView,
}: Props) {
  const [view, setView] = useState<"scroll" | "spread">(initialView);
  const [spreadStart, setSpreadStart] = useState(0);
  const [activePageKey, setActivePageKey] = useState<string | null>(null);

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

  const activePage =
    pages.find((page) => page.key === activePageKey) ??
    pages[initialPageIndex];

  const activeChapter =
    chapters.find((chapter) => chapter.slug === activePage?.chapterSlug) ??
    chapters[0];

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
    const slug = activePage?.chapterSlug;
    if (!slug) return;

    const url = new URL(window.location.href);
    const expectedPath = `/sensuousheirlooms/${slug}`;

    if (url.pathname !== expectedPath) {
      window.history.replaceState(
        window.history.state,
        "",
        `${expectedPath}${url.search}`
      );
    }
  }, [activePage]);

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

  if (!chapters.length || !pages.length || !activeChapter) {
    return <main>No publication pages have been uploaded yet.</main>;
  }

  return (
    <main className={styles.reader}>
      <aside className={styles.sidebar}>
        <Link href="/sensuousheirlooms">
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

        <details className={styles.mobileMenu}>
          <summary>Contents</summary>
          <ChapterLinks chapters={chapters} activeSlug={activeChapter.slug} />
        </details>

        <div className={styles.desktopMenu}>
          <p>CONTENTS</p>
          <ChapterLinks chapters={chapters} activeSlug={activeChapter.slug} />
        </div>
      </aside>

      <section className={styles.readingArea} onCopy={handleCopy}>
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
                      width={1700}
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
}: {
  chapters: ImageChapter[];
  activeSlug: string;
}) {
  return (
    <nav className={styles.chapterList}>
      {chapters.map((chapter) => (
        <Link
          key={chapter._id}
          href={`/sensuousheirlooms/${chapter.slug}`}
          aria-current={chapter.slug === activeSlug ? "page" : undefined}
        >
          {chapter.contributor}
        </Link>
      ))}
    </nav>
  );
}

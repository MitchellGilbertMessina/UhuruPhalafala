"use client";
/* eslint-disable @next/next/no-img-element */

import { useMemo, useRef, useState } from "react";
import type {
  AudioMedia,
  ChapterMedia as ChapterMediaItem,
  SlideshowMedia,
  VideoMedia,
} from "@/types/imageChapter";
import styles from "./ChapterMedia.module.css";

/* ---------- helpers ---------- */

// Only one recording should play at a time.
function pauseOtherAudio(current: HTMLAudioElement) {
  document.querySelectorAll("audio").forEach((audio) => {
    if (audio !== current) audio.pause();
  });
}

// "1:05" -> 65, "1:02:03" -> 3723
function parseTime(value: string): number {
  return value
    .split(":")
    .map(Number)
    .reduce((total, part) => total * 60 + (Number.isFinite(part) ? part : 0), 0);
}

// Ask Sanity's image CDN for a sensible size and format.
function sized(url: string, width = 1600) {
  return url.includes("cdn.sanity.io")
    ? `${url}?w=${width}&auto=format&q=80`
    : url;
}

function toEmbedUrl(raw: string): string | null {
  try {
    const u = new URL(raw);
    const host = u.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = u.pathname.slice(1);
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      const id = u.searchParams.get("v");
      if (id) return `https://www.youtube-nocookie.com/embed/${id}`;
      const m = u.pathname.match(/^\/(embed|shorts|live)\/([\w-]+)/);
      if (m) return `https://www.youtube-nocookie.com/embed/${m[2]}`;
    }

    if (host === "player.vimeo.com") return raw;

    if (host === "vimeo.com") {
      const [id, hash] = u.pathname.split("/").filter(Boolean);
      if (id && /^\d+$/.test(id)) {
        return `https://player.vimeo.com/video/${id}?${hash ? `h=${hash}&` : ""}dnt=1`;
      }
    }
  } catch {
    // fall through
  }
  return null;
}

/* ---------- shared pieces ---------- */

function Transcript({ text }: { text: string }) {
  return (
    <details className={styles.transcript}>
      <summary>Transcript</summary>
      {text.split(/\n{2,}/).map((paragraph, i) => (
        <p key={i}>{paragraph}</p>
      ))}
    </details>
  );
}

/* ---------- audio ---------- */

function AudioItem({ item }: { item: AudioMedia }) {
  if (!item.audioUrl) return null;

  return (
    <figure className={styles.item}>
      {item.title && (
        <figcaption className={styles.itemTitle}>{item.title}</figcaption>
      )}
      <audio
        className={styles.audio}
        controls
        preload="none"
        src={item.audioUrl}
        onPlay={(e) => pauseOtherAudio(e.currentTarget)}
      />
      {item.transcript && <Transcript text={item.transcript} />}
    </figure>
  );
}

/* ---------- video ---------- */

function VideoItem({ item }: { item: VideoMedia }) {
  if (!item.url) return null;

  const embed = toEmbedUrl(item.url);

  return (
    <figure className={styles.item}>
      {item.title && (
        <figcaption className={styles.itemTitle}>{item.title}</figcaption>
      )}

      {embed ? (
        <div className={styles.video}>
          <iframe
            src={embed}
            title={item.title ?? "Video"}
            loading="lazy"
            allow="accelerometer; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      ) : (
        <a className={styles.link} href={item.url} target="_blank" rel="noreferrer">
          Watch ↗
        </a>
      )}
    </figure>
  );
}

/* ---------- slideshow that follows a recording ---------- */

function SlideshowPlayer({ item }: { item: SlideshowMedia }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [current, setCurrent] = useState(0);

  const slides = useMemo(
    () =>
      (item.slides ?? [])
        .filter((slide) => slide.url)
        .map((slide) => ({ ...slide, start: parseTime(slide.startTime) }))
        .sort((a, b) => a.start - b.start),
    [item.slides]
  );

  if (!slides.length) return null;

  const first = slides[0];
  const ratio =
    first.width && first.height ? `${first.width} / ${first.height}` : "4 / 3";

  // The recording drives the slide: show the last slide whose start time has passed.
  const syncToAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;

    let index = 0;
    for (let i = 0; i < slides.length; i++) {
      if (slides[i].start <= audio.currentTime) index = i;
      else break;
    }
    setCurrent(index);
  };

  // Navigating the slides moves the recording to that slide's moment.
  const go = (target: number) => {
    const index = Math.max(0, Math.min(slides.length - 1, target));
    setCurrent(index);

    const audio = audioRef.current;
    if (audio && item.audioUrl) audio.currentTime = slides[index].start + 0.05;
  };

  return (
    <figure className={styles.item}>
      {item.title && (
        <figcaption className={styles.itemTitle}>{item.title}</figcaption>
      )}

      <div className={styles.stage} style={{ aspectRatio: ratio }}>
        {slides.map((slide, i) => (
          <img
            key={slide._key}
            className={`${styles.slide} ${i === current ? styles.slideActive : ""}`}
            src={sized(slide.url!)}
            alt={slide.alt ?? ""}
            loading={i < 2 ? "eager" : "lazy"}
            decoding="async"
            aria-hidden={i !== current}
          />
        ))}
      </div>

      <p className={styles.caption}>{slides[current].caption}</p>

      <div className={styles.slideNav}>
        <button
          className={styles.navButton}
          onClick={() => go(current - 1)}
          disabled={current === 0}
          aria-label="Previous slide"
        >
          ←
        </button>

        <span>
          {current + 1} / {slides.length}
        </span>

        <button
          className={styles.navButton}
          onClick={() => go(current + 1)}
          disabled={current === slides.length - 1}
          aria-label="Next slide"
        >
          →
        </button>
      </div>

      {item.audioUrl && (
        <audio
          ref={audioRef}
          className={styles.audio}
          controls
          preload="metadata"
          src={item.audioUrl}
          onTimeUpdate={syncToAudio}
          onSeeked={syncToAudio}
          onPlay={(e) => pauseOtherAudio(e.currentTarget)}
        />
      )}

      {item.transcript && <Transcript text={item.transcript} />}
    </figure>
  );
}

/* ---------- dispatcher ---------- */

export default function ChapterMedia({ media }: { media: ChapterMediaItem[] }) {
  if (!media.length) return null;

  return (
    <div className={styles.media}>
      {media.map((item) => {
        if (item._type === "audio") return <AudioItem key={item._key} item={item} />;
        if (item._type === "video") return <VideoItem key={item._key} item={item} />;
        if (item._type === "slideshow")
          return <SlideshowPlayer key={item._key} item={item} />;
        return null;
      })}
    </div>
  );
}
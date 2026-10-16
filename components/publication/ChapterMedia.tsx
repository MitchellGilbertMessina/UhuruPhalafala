"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useRef, useState } from "react";
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

type ParsedVideo = {
  provider: "youtube" | "vimeo";
  id: string;
  hash?: string;
};

function parseVideo(raw: string): ParsedVideo | null {
  try {
    const u = new URL(raw);
    const host = u.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = u.pathname.slice(1);
      return id ? { provider: "youtube", id } : null;
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      const id = u.searchParams.get("v");
      if (id) return { provider: "youtube", id };
      const m = u.pathname.match(/^\/(embed|shorts|live)\/([\w-]+)/);
      if (m) return { provider: "youtube", id: m[2] };
    }

    if (host === "vimeo.com") {
      const [id, hash] = u.pathname.split("/").filter(Boolean);
      if (id && /^\d+$/.test(id)) return { provider: "vimeo", id, hash };
    }

    if (host === "player.vimeo.com") {
      const m = u.pathname.match(/^\/video\/(\d+)/);
      if (m) {
        return {
          provider: "vimeo",
          id: m[1],
          hash: u.searchParams.get("h") ?? undefined,
        };
      }
    }
  } catch {
    // fall through
  }
  return null;
}

function embedSrc(video: ParsedVideo): string {
  if (video.provider === "youtube") {
    return `https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0&modestbranding=1&playsinline=1&iv_load_policy=3&color=white`;
  }
  return `https://player.vimeo.com/video/${video.id}?${
    video.hash ? `h=${video.hash}&` : ""
  }autoplay=1&title=0&byline=0&portrait=0&dnt=1`;
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
      <audio
        className={styles.audio}
        controls
        preload="none"
        src={item.audioUrl}
        onPlay={(e) => pauseOtherAudio(e.currentTarget)}
      />
      {item.title && (
        <figcaption className={styles.itemTitle}>{item.title}</figcaption>
      )}
      {item.transcript && <Transcript text={item.transcript} />}
    </figure>
  );
}

/* ---------- video: clean poster first, player on click ---------- */

function VideoItem({ item }: { item: VideoMedia }) {
  const video = item.url ? parseVideo(item.url) : null;
  const ytId = video?.provider === "youtube" ? video.id : null;

  const [playing, setPlaying] = useState(false);
  const [poster, setPoster] = useState<string | null>(
    item.posterUrl
      ? sized(item.posterUrl)
      : ytId
        ? `https://i.ytimg.com/vi/${ytId}/maxresdefault.jpg`
        : null
  );

  if (!item.url) return null;

  return (
    <figure className={styles.item}>
      {video ? (
        <div className={styles.video}>
          {playing ? (
            <iframe
              src={embedSrc(video)}
              title={item.title ?? "Video"}
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          ) : (
            <button
              className={styles.poster}
              onClick={() => setPlaying(true)}
              aria-label={`Play video${item.title ? `: ${item.title}` : ""}`}
            >
              {poster && (
                <img
                  src={poster}
                  alt=""
                  onError={() => {
                    if (ytId) setPoster(`https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`);
                  }}
                />
              )}
              <span className={styles.playIcon} aria-hidden="true">
                ▶
              </span>
            </button>
          )}
        </div>
      ) : (
        <a className={styles.link} href={item.url} target="_blank" rel="noreferrer">
          Watch ↗
        </a>
      )}

      {item.title && (
        <figcaption className={styles.itemTitle}>{item.title}</figcaption>
      )}
    </figure>
  );
}

/* ---------- slideshow that follows a recording ---------- */

type Slide = {
  _key: string;
  url?: string;
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
  start: number; // seconds into the recording
};

function SlideshowPlayer({ item }: { item: SlideshowMedia }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [current, setCurrent] = useState(0);
  const [reach, setReach] = useState(3); // how many slides are loaded ahead
  const [duration, setDuration] = useState(0);

  const slides = useMemo<Slide[]>(() => {
    // Custom timings win, if the editor entered any.
    const timed: Slide[] = (item.slides ?? [])
      .filter((s) => s.url)
      .map((s) => ({
        _key: s._key,
        url: s.url,
        alt: s.alt,
        caption: s.caption,
        width: s.width,
        height: s.height,
        start: parseTime(s.startTime),
      }))
      .sort((a, b) => a.start - b.start);

    if (timed.length) return timed;

    // Otherwise spread the images evenly across the recording.
    const images = (item.images ?? []).filter((img) => img.url);
    const step =
      item.slideDuration ||
      (duration > 0 && images.length ? duration / images.length : 0);

    return images.map((img, i) => ({
      _key: img._key,
      url: img.url,
      alt: img.alt,
      caption: img.caption,
      width: img.width,
      height: img.height,
      start: i === 0 ? 0 : step ? i * step : Number.POSITIVE_INFINITY,
    }));
  }, [item.slides, item.images, item.slideDuration, duration]);

  // Keep loading a few slides ahead of whichever one is showing.
  useEffect(() => {
    setReach((r) => Math.max(r, current + 3));
  }, [current]);

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
    const start = slides[index].start;
    if (audio && item.audioUrl && Number.isFinite(start)) {
      audio.currentTime = start + 0.05;
    }
  };

  const readDuration = (audio: HTMLAudioElement) => {
    if (Number.isFinite(audio.duration)) setDuration(audio.duration);
  };

  return (
    <figure className={styles.item}>
      <div className={styles.stage} style={{ aspectRatio: ratio }}>
        {slides.map((slide, i) =>
          i <= reach ? (
            <img
              key={slide._key}
              className={`${styles.slide} ${i === current ? styles.slideActive : ""}`}
              src={sized(slide.url!)}
              alt={slide.alt ?? ""}
              decoding="async"
              aria-hidden={i !== current}
            />
          ) : null
        )}
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
          onLoadedMetadata={(e) => readDuration(e.currentTarget)}
          onDurationChange={(e) => readDuration(e.currentTarget)}
          onTimeUpdate={syncToAudio}
          onSeeked={syncToAudio}
          onPlay={(e) => pauseOtherAudio(e.currentTarget)}
        />
      )}

      {item.title && (
        <figcaption className={styles.itemTitle}>{item.title}</figcaption>
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
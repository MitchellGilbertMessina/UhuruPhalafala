export type ImageChapterPage = {
  _key: string;
  pageNumber?: number;
  alt?: string;
  url: string;
};

export type AudioMedia = {
  _key: string;
  _type: "audio";
  title?: string;
  audioUrl?: string;
  transcript?: string;
};

export type VideoMedia = {
  _key: string;
  _type: "video";
  title?: string;
  url?: string;
};

export type SlideshowMedia = {
  _key: string;
  _type: "slideshow";
  title?: string;
  audioUrl?: string;
  transcript?: string;
  slides?: {
    _key: string;
    startTime: string;
    alt?: string;
    caption?: string;
    url?: string;
    width?: number;
    height?: number;
  }[] | null;
};

export type ChapterMedia = AudioMedia | VideoMedia | SlideshowMedia;

export type ImageChapter = {
  _id: string;
  title: string;
  contributor: string;
  slug: string;
  order?: number;
  intro?: string | null;
  pages?: ImageChapterPage[] | null;
  pdf?: {
    asset?: {
      url: string;
    };
  } | null;
  media?: ChapterMedia[] | null;
  open?: boolean;
};

export function isOpenChapter(chapter: ImageChapter): boolean {
  return (
    chapter.open === true &&
    ((chapter.pages?.length ?? 0) > 0 || (chapter.media?.length ?? 0) > 0)
  );
}
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

export type ChapterMedia = AudioMedia | VideoMedia;

export type ImageChapterPage = {
  _key: string;
  pageNumber?: number;
  alt?: string;
  url: string;
};

export type ImageChapter = {
  _id: string;
  title: string;
  contributor: string;
  slug: string;
  order?: number;
  pages: ImageChapterPage[];
  pdf?: {
    asset?: {
      url: string;
    };
  } | null;
};
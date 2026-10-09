
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
  };
};
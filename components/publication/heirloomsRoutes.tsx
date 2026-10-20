// Shared by the two sets of Sensuous Heirlooms routes:
//   app/(site)/sensuousheirlooms-domain  -> www.sensuousheirlooms.com/<slug>  (basePath "")
//   app/(site)/sensuousheirlooms         -> localhost:3000/sensuousheirlooms/<slug>
import { cache } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getImageChapters } from "@/sanity/sanity-utils";
import { isOpenChapter } from "@/types/imageChapter";
import { SH_ORIGIN } from "@/lib/sensuousHeirlooms";
import ImagePublicationReader from "@/components/publication/ImagePublicationReader";

const SITE_NAME = "Sensuous Heirlooms";
const DESCRIPTION = "Sensuous Heirlooms Edited by Uhuru Portia Phalafala";

// Metadata and the page share one Sanity request per render.
const getChapters = cache(getImageChapters);

export const landingMetadata: Metadata = {
  title: SITE_NAME,
  description: DESCRIPTION,
  alternates: { canonical: `${SH_ORIGIN}/` },
  openGraph: {
    title: SITE_NAME,
    description: DESCRIPTION,
    url: `${SH_ORIGIN}/`,
    siteName: SITE_NAME,
    type: "website",
  },
};

export async function LandingPage({ basePath }: { basePath: string }) {
  const chapters = await getChapters();

  return (
    <ImagePublicationReader
      chapters={chapters}
      initialSlug={null}
      basePath={basePath}
    />
  );
}

export async function chapterMetadata(slug: string): Promise<Metadata> {
  const chapters = await getChapters();
  const chapter = chapters.find((item) => item.slug === slug);

  if (!chapter) return landingMetadata;

  const heading = `${chapter.contributor}, ${chapter.title.replace(/\s*\n\s*/g, " / ")}`;
  const title = `${heading} · ${SITE_NAME}`;
  const description = chapter.intro?.split(/\n{2,}/)[0]?.slice(0, 200) || DESCRIPTION;
  const url = `${SH_ORIGIN}/${slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: SITE_NAME, type: "article" },
  };
}

export async function ChapterPage({
  slug,
  basePath,
}: {
  slug: string;
  basePath: string;
}) {
  const chapters = await getChapters();
  const chapter = chapters.find((item) => item.slug === slug);

  if (!chapter || !isOpenChapter(chapter)) {
    redirect(basePath || "/");
  }

  return (
    <ImagePublicationReader
      chapters={chapters}
      initialSlug={slug}
      basePath={basePath}
    />
  );
}

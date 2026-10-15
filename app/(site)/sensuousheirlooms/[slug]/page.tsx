import { redirect } from "next/navigation";
import { getImageChapters } from "@/sanity/sanity-utils";
import { isOpenChapter } from "@/types/imageChapter";
import ImagePublicationReader from "@/components/publication/ImagePublicationReader";

export default async function ImageChapterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const chapters = await getImageChapters();
  const chapter = chapters.find((item) => item.slug === slug);

  if (!chapter || !isOpenChapter(chapter)) {
    redirect("/sensuousheirlooms");
  }

  return <ImagePublicationReader chapters={chapters} initialSlug={slug} />;
}

import { getImageChapters } from "@/sanity/sanity-utils";
import ImagePublicationReader from "@/components/publication/ImagePublicationReader";

export default async function ImageChapterPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ view?: string }>;
}) {
  const [{ slug }, query] = await Promise.all([
    params,
    searchParams,
  ]);

  const chapters = await getImageChapters();

  const chapter = chapters.find((item) => item.slug === slug);

  if (!chapter) {
    return <main>Chapter not found.</main>;
  }

  const initialView = query.view === "spread" ? "spread" : "scroll";

  return (
    <ImagePublicationReader
      chapters={chapters}
      initialSlug={slug}
      initialView={initialView}
    />
  );
}
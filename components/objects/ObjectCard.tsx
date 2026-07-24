import Link from "next/link";

interface ObjectCardProps {
  slug: string;
  title: string;
  publisher: string;
  date: string;
  tags: string[];
  image: string;
}

export default function ObjectCard({
  slug,
  title,
  publisher,
  date,
  tags,
}: ObjectCardProps) {
  return (
    <Link
      href={`/reeds/${slug}`}
      className="block w-56 transition-transform duration-200 hover:scale-[1.02]"
    >
      {/* Image Placeholder */}
      <div className="aspect-[3/4] w-full bg-neutral-300 border border-black/10" />

      {/* Metadata */}
      <div className="mt-3 text-sm leading-tight">
        <h2 className="font-medium">{title}</h2>

        <p>{publisher}</p>

        <p>{date}</p>

        <p className="italic">{tags.join(" • ")}</p>
      </div>
    </Link>
  );
}
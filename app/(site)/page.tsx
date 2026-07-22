import { getHomepageImages } from "@/sanity/sanity-utils";
import Image from "next/image";

export default async function Home() {

  const images = await getHomepageImages();

  const randomImage =
    images[Math.floor(Math.random() * images.length)];

  return (

    <div className="h-screen w-screen relative">

      <Image
        src={randomImage.asset.url}
        alt="Homepage image"
        fill
        className="object-cover"
        priority
      />

    </div>

  );
}
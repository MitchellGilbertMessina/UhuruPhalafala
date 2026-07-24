"use client";

import { useEffect, useRef } from "react";

import ObjectCard from "./ObjectCard";

type ObjectData = {
  slug: string;
  title: string;
  publisher: string;
  date: string;
  tags: string[];
  image: string;
  x: number;
  y: number;
};

interface ObjectCanvasProps {
  objects: ObjectData[];
}

const CANVAS_HEIGHT = 5000;

export default function ObjectCanvas({
  objects,
}: ObjectCanvasProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = scrollRef.current;

    if (!container) return;

    // Start in the middle copy
    container.scrollTop = CANVAS_HEIGHT;

    const handleScroll = () => {
      const y = container.scrollTop;

      if (y < CANVAS_HEIGHT * 0.5) {
        container.scrollTop += CANVAS_HEIGHT;
      }

      if (y > CANVAS_HEIGHT * 1.5) {
        container.scrollTop -= CANVAS_HEIGHT;
      }
    };

    container.addEventListener("scroll", handleScroll);

    return () =>
      container.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section
      ref={scrollRef}
      className="flex-1 overflow-y-scroll overflow-x-hidden"
    >
      <div
        className="relative mx-auto max-w-[1200px]"
        style={{
          height: CANVAS_HEIGHT * 3,
        }}
      >
        {[0, 1, 2].map((copy) => (
          <div
            key={copy}
            className="absolute inset-x-0"
            style={{
              top: copy * CANVAS_HEIGHT,
              height: CANVAS_HEIGHT,
            }}
          >
            {objects.map((object) => (
              <div
                key={`${copy}-${object.slug}`}
                className="absolute"
                style={{
                  left: object.x,
                  top: object.y,
                }}
              >
                <ObjectCard {...object} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
"use client";

import Link from "next/link";

interface Props {
  title: string;
  href: string;
}

export default function NavigationPanel({
  title,
  href,
}: Props) {
  return (
    <Link
      href={href}
      className="flex-1 border-r border-black/20 last:border-r-0"
    >
      <div
        className="flex h-full items-center justify-center"
        style={{
          background: "#C0BCC6",
        }}
      >
        <h2
          style={{
            fontFamily: "Georgia",
            fontWeight: 400,
            fontSize: "2rem",
          }}
        >
          {title}
        </h2>
      </div>
    </Link>
  );
}
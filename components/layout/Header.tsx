"use client";

import { siteConfig } from "@/lib/siteConfig";

interface HeaderProps {
  onAboutClick?: () => void;
}

export default function Header({ onAboutClick }: HeaderProps) {
  return (
    <header
      className="flex items-center justify-between border-b border-black/20 px-8"
      style={{
        height: "72px",
        background: siteConfig.colours.homepage,
      }}
    >
      <h1
        style={{
          fontFamily: siteConfig.typography.fontFamily,
          fontSize: "2rem",
          fontWeight: 400,
        }}
      >
        {siteConfig.site.title}
      </h1>

      <button
        onClick={onAboutClick}
        className="cursor-pointer text-4xl"
      >
        &lt;
      </button>
    </header>
  );
}
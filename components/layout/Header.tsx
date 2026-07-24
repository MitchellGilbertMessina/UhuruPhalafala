"use client";

import { motion } from "framer-motion";
import { siteConfig } from "@/lib/siteConfig";

interface HeaderProps {
  aboutOpen?: boolean;
  onAboutClick?: () => void;
}

export default function Header({
  aboutOpen,
  onAboutClick,
}: HeaderProps) {
  return (
    <header
      className="flex justify-between items-center border-b border-black/20 px-10"
      style={{
        height: "72px",
        background: siteConfig.colours.homepage,
      }}
    >
      <h1
        style={{
          fontFamily: "Georgia",
          fontSize: "2rem",
          fontWeight: 400,
        }}
      >
        {siteConfig.site.title}
      </h1>

      {onAboutClick && (
        <motion.button
          animate={{
            rotate: aboutOpen ? 180 : 0,
          }}
          transition={{
            duration: 0.6,
          }}
          onClick={onAboutClick}
          className="cursor-pointer text-5xl"
        >
          &lt;
        </motion.button>
      )}
    </header>
  );
}
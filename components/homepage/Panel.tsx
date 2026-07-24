"use client";

import { motion } from "framer-motion";

import { siteConfig } from "@/lib/siteConfig";
import { HomeSection } from "@/lib/homeSections";

interface PanelProps {
  section: HomeSection;
  aboutOpen: boolean;
}

export default function Panel({
  section,
  aboutOpen,
}: PanelProps) {
  return (
    <motion.a
      href={section.href}
      layout
      initial={false}
      animate={{
        flex: aboutOpen ? 0.55 : 1,
      }}
      transition={{
        duration: siteConfig.animation.duration,
        ease: siteConfig.animation.ease,
      }}
      className="group relative overflow-hidden border-r border-black/20"
    >
      {/* Background */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: section.colour,
        }}
      />

      {/* Content */}
      <div className="relative h-full">

        {/* Title */}
        <div className="absolute left-10 top-1/2 -translate-y-1/2">
          <h2
            style={{
              fontFamily: siteConfig.typography.fontFamily,
              fontSize: "2rem",
              fontWeight: 400,
            }}
          >
            {section.title}
          </h2>
        </div>

        {/* Metadata (hidden for now) */}
        <div
          className="absolute left-10 bottom-10 opacity-0 pointer-events-none"
        >
          <p>{section.metadata.type}</p>

          <p>{section.metadata.years}</p>
        </div>

      </div>
    </motion.a>
  );
}
"use client";

import { motion } from "framer-motion";
import { siteConfig } from "@/lib/siteConfig";

interface AboutOverlayProps {
  open: boolean;
}

export default function AboutOverlay({
  open,
}: AboutOverlayProps) {
  return (
    <motion.div
      layout
      initial={false}
      animate={{
        flex: open ? 6 : 0,
        opacity: open ? 1 : 0,
      }}
      transition={{
        duration: siteConfig.animation.duration,
        ease: siteConfig.animation.ease,
      }}
      className="overflow-hidden"
      style={{
        background: siteConfig.colours.about,
      }}
    >
      <div
        className="h-full overflow-y-auto px-16 py-16"
        style={{
          opacity: open ? 1 : 0,
        }}
      >
        <h2
          style={{
            fontFamily: siteConfig.typography.fontFamily,
            fontSize: "2.5rem",
            fontWeight: 400,
            marginBottom: "2rem",
          }}
        >
          About
        </h2>

        <div className="grid grid-cols-2 gap-16">
          <div>
            <p>Placeholder text for the artist biography.</p>

            <p className="mt-8">
              This panel will eventually be populated from Sanity.
            </p>
          </div>

          <div>
            <p>
              CV, exhibitions, contact information and additional content will
              live here.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
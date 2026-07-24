"use client";

import { useEffect, useState } from "react";
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
  const [verticalTitle, setVerticalTitle] = useState(false);

  useEffect(() => {
    const TITLE_SWAP_POINT = 0.5;

    const timer = window.setTimeout(() => {
      setVerticalTitle(aboutOpen);
    }, siteConfig.animation.duration * 1000 * TITLE_SWAP_POINT);

    return () => window.clearTimeout(timer);
  }, [aboutOpen]);

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
      className="relative overflow-hidden border-r border-black/20"
    >
      <motion.div
        initial="rest"
        whileHover="hover"
        animate="rest"
        className="relative h-full w-full"
      >
        {/* Background */}

        <motion.div
          className="absolute inset-0"
          variants={{
            rest: {
              backgroundColor: section.colour,
            },
            hover: {
              backgroundColor: section.hoverColour,
            },
          }}
          transition={{
            duration: 0.25,
            ease: "easeOut",
          }}
        />

        {/* Horizontal Title */}

        {!verticalTitle && (
          <div
            className="absolute left-1/2 top-1/2"
            style={{
              transform: "translate(-50%, -50%)",
            }}
          >
            <h2
              style={{
                fontFamily: siteConfig.typography.fontFamily,
                fontSize: "2rem",
                fontWeight: 400,
                whiteSpace: "nowrap",
              }}
            >
              {section.title}
            </h2>
          </div>
        )}

        {/* Vertical Title */}

        {verticalTitle && (
          <div
            className="absolute"
            style={{
              left: "50%",
              top: "20px",
              transform: "translateX(0) rotate(90deg)",
              transformOrigin: "top left",
            }}
          >
            <h2
              style={{
                fontFamily: siteConfig.typography.fontFamily,
                fontSize: "2rem",
                fontWeight: 400,
                whiteSpace: "nowrap",
              }}
            >
              {section.title}
            </h2>
          </div>
        )}

        {/* Metadata */}

        <motion.div
          variants={{
            rest: {
              opacity: 0,
              y: 16,
            },
            hover: {
              opacity: 1,
              y: 0,
            },
          }}
          transition={{
            duration: 0.25,
            ease: "easeOut",
          }}
          className="absolute bottom-10 left-10 pointer-events-none"
        >
          <p
            style={{
              fontFamily: siteConfig.typography.fontFamily,
              fontSize: "0.9rem",
            }}
          >
            {section.preview.heading}
          </p>

          <p
            style={{
              fontFamily: siteConfig.typography.fontFamily,
              fontSize: "0.9rem",
            }}
          >
            {section.preview.description}
          </p>
        </motion.div>
      </motion.div>
    </motion.a>
  );
}
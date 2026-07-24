"use client";

import { useState } from "react";

import Header from "@/components/layout/Header";
import { homeSections } from "@/lib/homeSections";

import Panel from "./Panel";
import AboutOverlay from "./AboutOverlay";

export default function Homepage() {
  const [aboutOpen, setAboutOpen] = useState(false);

  return (
    <div className="flex h-screen flex-col">
      <Header
        aboutOpen={aboutOpen}
        onAboutClick={() => setAboutOpen(!aboutOpen)}
      />

      <div className="flex flex-1">
        {homeSections.map((section) => (
          <Panel
            key={section.href}
            section={section}
            aboutOpen={aboutOpen}
          />
        ))}

        <AboutOverlay open={aboutOpen} />
      </div>
    </div>
  );
}
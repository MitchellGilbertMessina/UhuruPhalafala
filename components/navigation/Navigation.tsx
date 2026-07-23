"use client";

import NavigationPanel from "./NavigationPanel";

const sections = [
  {
    title: "Reeds",
    href: "/reeds",
  },
  {
    title: "Rites",
    href: "/rites",
  },
  {
    title: "Reels",
    href: "/reels",
  },
  {
    title: "Sensuous Heirlooms",
    href: "/heirlooms",
  },
];

export default function Navigation() {
  return (
    <section className="flex flex-1 overflow-hidden">
      {sections.map((section) => (
        <NavigationPanel
          key={section.href}
          title={section.title}
          href={section.href}
        />
      ))}
    </section>
  );
}
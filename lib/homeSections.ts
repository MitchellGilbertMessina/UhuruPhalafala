export interface HomeSection {
  title: string;
  href: string;

  colour: string;
  hoverColour: string;

  metadata: {
    type: string;
    years: string;
  };
}

export const homeSections: HomeSection[] = [
  {
    title: "Reeds",
    href: "/reeds",
    colour: "#C0BCC6",
    hoverColour: "#B4B0BA",
    metadata: {
      type: "Projects",
      years: "2018–Present",
    },
  },

  {
    title: "Rites",
    href: "/rites",
    colour: "#C0BCC6",
    hoverColour: "#B4B0BA",
    metadata: {
      type: "Projects",
      years: "2018–Present",
    },
  },

  {
    title: "Reels",
    href: "/reels",
    colour: "#C0BCC6",
    hoverColour: "#B4B0BA",
    metadata: {
      type: "Projects",
      years: "2018–Present",
    },
  },

  {
    title: "Sensuous Heirlooms",
    href: "/heirlooms",
    colour: "#C0BCC6",
    hoverColour: "#B4B0BA",
    metadata: {
      type: "Publication",
      years: "Ongoing",
    },
  },
];
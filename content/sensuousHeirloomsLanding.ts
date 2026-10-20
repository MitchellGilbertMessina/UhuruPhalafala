
const contributors =
  "Uhuru Portia Phalafala (Ed.), Kabelo Malatsie, Maneo Mohale, Toni Giselle Stuart, Wanelisa Xaba, Deirdre Prins-Solani, Mathapelo Mofokeng, Unifier Dyer (Ndaukhadzi), Milisuthando Bongela, Koleka Putuma, Mehita Iqani, Sibonelo Hlanganani Gumede, Pralini Naidoo, Sethembile Msezane, Julie Nxadi, Sharlene Khan, Bronwyn Katz, Makhosazana Xaba, Rhoda Isaacs.";

export const landing = {
  // Background, loaded in stages: a tiny blurred preview built into the CSS
  // (PublicationLanding.module.css), then the "low" file, then the sharp
  // version the browser picks from the srcSet for the screen size.
  // To replace the image, export these widths as WebP, quality ~75
  // (the low files ~640/400px wide, quality ~55).
  bg: {
    landscape: {
      low: "/landing-bg-landscape-low.webp",
      src: "/landing-bg-landscape-1920.webp",
      srcSet:
        "/landing-bg-landscape-1280.webp 1280w, /landing-bg-landscape-1920.webp 1920w, /landing-bg-landscape-2400.webp 2400w",
      // Image is 6:5 and covers the screen, so on tall windows it is wider than the viewport.
      sizes: "max(100vw, 120vh)",
    },
    portrait: {
      low: "/landing-bg-portrait-low.webp",
      srcSet:
        "/landing-bg-portrait-600.webp 600w, /landing-bg-portrait-900.webp 900w, /landing-bg-portrait-1200.webp 1200w",
      sizes: "max(100vw, 60vh)",
    },
  },
  namesSrc: "/landing-names-landscape.webp",
  namesPortraitSrc: "/landing-names-portrait.webp",
  namesAlt: `Contributors: ${contributors}`,
  epigraph: "‘Rutang bana ditaola, le se ye natšo badimong’",
  blurb:
    "Gather around these ditaola and feel into what we, proud custodians of hearth, have inherited, what we choose to steward and intentionally wield in these uncertain times. Sensuous Heirlooms dances with other lineages of knowledge, aesthetics, being, and doing unrecorded by official archives. It breaks out of the enclosures of traditional notions of inheritances by singing innate, intimate, intuitive, relational, sensuous, spiritual, and queer heirlooms underwritten by matrilineal stewardship and communal well-being.",
  framing:
    "This version of the site presents selected content from the print publication of Sensuous Heirlooms, together with audiovisual material to accompany it. The site will continue to be updated as the project develops.",
    links: [
    {
      label: "Instagram",
      href: "https://www.instagram.com/sensuousheirlooms",
      icon: "instagram",
    },
    {
      label: "YouTube",
      href: "https://www.youtube.com/@sensuousheirlooms",
      icon: "youtube",
    },
    {
      label: "Email",
      href: "mailto:sensuousheirlooms@gmail.com",
      icon: "mail",
    },
  ],
};
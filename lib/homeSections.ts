export interface HomeSection {
    title: string;
    href: string;

    colour: string;
    hoverColour: string;

    preview: {
        heading: string;
        description: string;
    };
}

export const homeSections: HomeSection[] = [
    {
        title: "Reeds",
        href: "/reeds",
        colour: "#C0BCC6",
        hoverColour: "#e9e5d0",
        preview: {
            heading: "Poetry • Essays",
            description: "Writing, research and published texts.",
        },
    },

    {
        title: "Rites",
        href: "/rites",
        colour: "#C0BCC6",
        hoverColour: "#e9e5d0",
        preview: {
            heading: "Poetry • Essays",
            description: "Writing, research and published texts.",
        },
    },

    {
        title: "Reels",
        href: "/reels",
        colour: "#C0BCC6",
        hoverColour: "#e9e5d0",
        preview: {
            heading: "Poetry • Essays",
            description: "Writing, research and published texts.",
        },
    },

    {
        title: "Sensuous Heirlooms",
        href: "/heirlooms",
        colour: "#C0BCC6",
        hoverColour: "#e9e5d0",
        preview: {
            heading: "Poetry • Essays",
            description: "Writing, research and published texts.",
        },
    },
];
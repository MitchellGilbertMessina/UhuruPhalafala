import {defineConfig} from 'sanity';
import {structureTool} from 'sanity/structure'
import { schemaTypes } from "./sanity/schemaTypes";

const config = defineConfig({

    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
    title: "Empty Labs Website",
    apiVersion: "2024-04-30",
    basePath: "/admin",
    plugins: [structureTool()],
    schema: {types: schemaTypes},
    scheduledPublishing: { enabled: true, showReleasesBanner: false },
    //hello

})

export default config;
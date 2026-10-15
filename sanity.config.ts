
import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { schemaTypes } from './sanity/schemaTypes';

const config = defineConfig({
  projectId: '0ucttlat',
  dataset: 'production',
  title: 'Uhuru Phalafala Website',
  apiVersion: '2024-04-30',
  basePath: '/admin',
  plugins: [structureTool()],
  schema: { types: schemaTypes },
  scheduledPublishing: {
    enabled: true,
    showReleasesBanner: false,
  },
});

export default config;

import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import { practiceSiteUrl } from './practice-origin.mjs';

export default defineConfig({
  output: 'static',
  cacheDir: './.preview-cache/astro',
  server: { host: '127.0.0.1', port: 4323 },
  // This repository builds only the separate CMS practice website.
  site: practiceSiteUrl,
  integrations: [tailwind()],

  // Prefetch internal links on hover — makes page navigation feel instant
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover'
  },

  // Image optimization configuration
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp'
    },
    remotePatterns: [],
  },

  // Vite build optimizations
  vite: {
    cacheDir: './.preview-cache/vite',
    build: {
      cssCodeSplit: true,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,      // Remove console.logs in production
          drop_debugger: true,     // Remove debugger statements
          pure_funcs: ['console.log', 'console.info', 'console.debug']
        },
        mangle: {
          safari10: true           // Fix Safari 10 bugs
        }
      },
      rollupOptions: {
        output: {
          // Aggressive code splitting for better caching
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              return 'vendor';
            }
            if (id.includes('src/scripts')) {
              return 'scripts';
            }
          },
          // Better asset naming for long-term caching
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name.split('.');
            const ext = info[info.length - 1];
            if (/\.(css|js)$/.test(assetInfo.name)) {
              return `_astro/[name].[hash][extname]`;
            }
            return `_astro/[name].[hash][extname]`;
          },
          chunkFileNames: '_astro/[name].[hash].js',
          entryFileNames: '_astro/[name].[hash].js'
        }
      }
    },
    optimizeDeps: {
      exclude: ['sharp', 'astro:assets']  // Prevent bundling server-only deps
    }
  },

  // Compress HTML output
  compressHTML: true,

  // Build configuration
  build: {
    inlineStylesheets: 'auto',  // Inline critical CSS for small pages
    assets: '_astro'
  }
});

import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url'
import fs from 'fs';
import path from 'path';

import vue from '@vitejs/plugin-vue';
import VueDevTools from 'vite-plugin-vue-devtools'
import vueI18n from '@intlify/unplugin-vue-i18n/vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import rollupDel from 'rollup-plugin-delete';

import { DominionContentGenerate, HandleLocaleGenerateAndMerge } from './plugins/vite-dominion-content';

const devServerPort = 5173

export default defineConfig( ({ mode}) => {
//console.log(process.argv)
  if (mode === "production" || mode === "development") {
   // mergeJSONLanguageFiles();
    DominionContentGenerate();
    const sourceFile = './styles/normalize-v8.css';
    const destinationFile = './docs/normalize.css';
    fs.copyFile(sourceFile, destinationFile, () => {
      console.log(`Le fichier a été copié avec succès de ${sourceFile} vers ${destinationFile}`);
    })
    let ArgGenLocale = "Merge"
    if (process.argv.slice(3)[0] == "Gen") {
        ArgGenLocale = "Gen&Merge"
    }
    HandleLocaleGenerateAndMerge(ArgGenLocale)
  }

  return {
    appType: 'spa',
    plugins: [
      vue(),
      //VueDevTools(),
      vueI18n({
        include: path.resolve(__dirname, './docs/locales/*.json'),
        compositionOnly: true, 
        fullInstall: true,
        allowDynamic: true,
        runtimeOnly: false
      }),
      rollupDel({
        targets: ['docs/*',
          '!docs/rules',
          '!docs/rules.fr',
          '!docs/img',
          '!docs/favicon.ico',
          '!docs/dominion-content.js',
          '!docs/normalize.css',
          '!docs/locales',
          '!docs/locales/??.json',
          '!docs/CNAME',
          '!docs/ads.txt'],
        verbose: false
      }),
      viteStaticCopy({
        targets: [ { src: 'styles/normalize-v8.css', dest: 'assets/' },
            { src: 'docs/normalize.css', dest: 'assets/' } ]
      }),
    ],
    optimizeDeps: {
      include: ['vue', 'vue-i18n']
    },
    resolve: {
      //extensions: ['.ts', '.vue'],
      alias: {
        // Alias pour les modules non-Esbuild compatibles avec Vite
        //'@': fileURLToPath(new URL('./src', import.meta.url)),
        //'vue-i18n': 'vue-i18n/dist/vue-i18n.esm-bundler.js',
        //'vue': 'vue/dist/vue.esm-bundler.js', 
      },
    },
    build: {
      minify: false,
      outDir: 'docs',
      emptyOutDir: false,
      sourcemap: false,
      chunkSizeWarningLimit: 2000,
      rollupOptions: {
        output: {
          entryFileNames: 'assets/[name]-[hash].js',
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash][extname]'
        }
      },
    },
    server: {
      open: 'index.html',
      proxy: {
        '/dominion-content': {
          target: 'http://localhost:' + devServerPort,
          rewrite: (path) => path.replace(/^\/dominion-content.js/, '/docs/dominion-content.js'),
        },
        '/normalize': {
          target: 'http://localhost:' + devServerPort,
          rewrite: (path) => path.replace(/^\/normalize/, '/docs/normalize'),
        },
        '/favicon.ico': {
          target: 'http://localhost:' + devServerPort,
          rewrite: (path) => path.replace(/^\/favicon.ico/, '/docs/favicon.ico'),
        },
        '/img': {
          target: 'http://localhost:' + devServerPort,
          rewrite: (path) => path.replace(/^\/img/, '/docs/img'),
        },
        '/rules/': {
          target: 'http://localhost:' + devServerPort,
          rewrite: (path) => path.replace(/^\/rules/, '/docs/rules/'),
        },
        '/locales': {
          target: 'http://localhost:' + devServerPort,
          rewrite: (path) => path.replace(/^\/locales/, '/docs/locales'),
        },
        '/?': {
          target: 'http://localhost:' + devServerPort,
          // rewrite: (path) => path.replace(/^\/?/, '/docs/index.html?'),
          rewrite: (path) => path.replace(/^\/?/, '/index.html?'),
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('proxy error', err);
            });
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log('Sending Request to the Target:', req.method, req.url);
            });
            proxy.on('proxyRes', (proxyRes, req, _res) => {
              console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
            });
          }
        },
        '^/$': {
          target: 'http://localhost:' + devServerPort,
          rewrite: (path) => '/index.html?',
        }
      },
    },
    preview: {
     proxy:{}
    }
  }
});


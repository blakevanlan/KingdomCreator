import { defineConfig,loadEnv } from 'vite';
import path from 'path';
import { fileURLToPath, URL } from 'node:url'; // Importation nécessaire
import fs from 'fs';
import packageJson from './package.json' with { type: 'json' };

import vue from '@vitejs/plugin-vue';
import legacy from '@vitejs/plugin-legacy';
import vueI18n from '@intlify/unplugin-vue-i18n/vite';
import del  from 'rollup-plugin-delete';
import { viteStaticCopy } from 'vite-plugin-static-copy';

import { DominionContentGenerate, HandleLocaleGenerateAndMerge } from './plugins/vite-dominion-content.js';

import { CheckVersions_Package_Readme_Changelog } from './plugins/Check-Version-Package-Readme-Changelog.js';
import { fixChangelogSpaces } from './plugins/Fix-Changelog.js'; 

const devServerPort = 5173;
const publicationDir = 'docs';
const publicationHelpDir = 'helpFiles';

CheckVersions_Package_Readme_Changelog();
fixChangelogSpaces();

export default defineConfig( ({ command, mode }) => {
  console.log(`\nVite config loaded with command: '${command}', mode: '${mode}'`);

  // Détecte si nous sommes en mode 'preview'.
  const isPreview = command === 'serve' && mode === 'production';
  const isBuild = command === 'build' && mode === 'production';
  const isDev = command === 'serve' && mode === 'development';
  console.log(`\nisPreview: ${isPreview}, isBuild: ${isBuild}, isDev: ${isDev}\n`);

  let baseDir = './'
  // N'exécuter la génération de contenu que pour la commande 'build'
  if (isBuild || isDev) {
    DominionContentGenerate('docs');
    let ArgGenLocale = 'Merge';
    if (process.argv.includes('Gen')) {
      ArgGenLocale = 'Gen&Merge';
    }
    HandleLocaleGenerateAndMerge(ArgGenLocale, 'docs')
  }

  return {
    appType: 'spa',
    base: baseDir,
    publicDir: false, //  Do not use publicDir feature to avoid duplcation of all image and pdf files.
    define: {
      Pkgejson_Version: JSON.stringify(packageJson.version),
      Pkgejson_Name: JSON.stringify(packageJson.name),
      Pkgejson_URL: JSON.stringify(packageJson.repository.url),
      Pkgejson_Date: JSON.stringify(new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'numeric' }))
    },
    plugins: [
      !isBuild ? undefined  :  // si build alors ==>
        { name: 'add-datetime',
          /* vite hook the plugin should use: transformIndexHtml()
          https://vitejs.dev/guide/api-plugin#universal-hooks */
          transformIndexHtml(html: string ) {
            const datetime = new Date().toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'medium' });
            const jsYamlVersion = packageJson.devDependencies['js-yaml'].replace(/[\^~]/, '');

            return html.replace(/id="datetime">/g, `id="datetime">${datetime}`)
          }
        },
      !isBuild ? undefined  :  // si build alors ==>
        {
          name: 'copy-index',
          /* vite hook the plugin should use: closeBundle()
          https://vitejs.dev/guide/api-plugin#universal-hooks */
          closeBundle() {
            try {
            fs.copyFileSync(
              path.resolve(import.meta.dirname, './'+ publicationDir +'/index.html'), 
              path.resolve(import.meta.dirname, './'+ publicationDir +'/404.html'))
              console.log('index.html copied successfully');

            } catch (err) {
              if (err) throw err;
              console.error('index.html copied failure!');
            } 
          }
        },
      isPreview ? undefined  : 
        vue(),
      isPreview ? undefined  :  // si preview alors ==>
        legacy({ targets: ['defaults'] }),
      isPreview ? undefined  :  // si preview alors ==>
        vueI18n({
          // Appliquer ce plugin uniquement si ce n'est pas un 'preview'
          include: path.resolve(import.meta.dirname, './'+ publicationDir +'/locales/*.json'),
          compositionOnly: true,
          fullInstall: true,
          allowDynamic: true,
          runtimeOnly: false,
        }),
      isPreview ? undefined  :
        del({
        targets: [publicationDir +'/*',
          '!'+ publicationDir +'/rules',
          '!'+ publicationDir +'/rules.fr',
          '!'+ publicationDir +'/rules.de',
          '!'+ publicationDir +'/img',
          '!'+ publicationDir +'/favicon.ico',
          '!'+ publicationDir +'/dominion-content.js',
          '!'+ publicationDir +'/locales',
          '!'+ publicationDir +'/locales/??.json',
          '!'+ publicationDir +'/CNAME',
          '!'+ publicationDir +'/ads.txt'],
        verbose: false
        }),
      !isBuild ? undefined  : 
        viteStaticCopy({
          targets: [ { src: 'styles/normalize-v8.css', dest: 'assets/', rename: { stripBase: 1 }},
                    { src: 'help/*.md', dest: './' + publicationHelpDir + '/', rename: { stripBase: 1 }}
          ],
        }),
    ].filter(Boolean),
    optimizeDeps: {
      include: ['vue', 'vue-i18n']
    },
    resolve: {
      //extensions: ['.ts', '.vue'],
      alias: {
        // Alias pour les modules non-Esbuild compatibles avec Vite
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        //'@': path.resolve(import.meta.dirname, './src'),
        //'vue-i18n': 'vue-i18n/dist/vue-i18n.esm-bundler.js',
        //'vue': 'vue/dist/vue.esm-bundler.js', 
      },
    },
    build: {
      minify: true,
      outDir: publicationDir,
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
      open: '/',
      proxy: {
        '^/$': {
          target: 'http://localhost:' + devServerPort,
          rewrite: () => '/index.html',
        },
        '/dominion-content.js': {
          target: 'http://localhost:' + devServerPort,
          rewrite: (path) => path.replace(/^\/dominion-content.js/, '/'+ publicationDir +'/dominion-content.js'),
        },
        '/normalize': {
          target: 'http://localhost:' + devServerPort,
          rewrite: (path) => path.replace(/^\/normalize/, '/'+ publicationDir +'/normalize'),
        },
        '/favicon.ico': {
          target: 'http://localhost:' + devServerPort,
          rewrite: (path) => path.replace(/^\/favicon.ico/, '/'+ publicationDir +'/favicon.ico'),
        },
        '/img': {
          target: 'http://localhost:' + devServerPort,
          rewrite: (path) => path.replace(/^\/img/, '/'+ publicationDir +'/img'),
        },
        '/rules': {
          target: 'http://localhost:' + devServerPort,
          rewrite: (path) => path.replace(/^\/rules/, '/'+ publicationDir +'/rules'),
        },
        '/locales': {
          target: 'http://localhost:' + devServerPort,
          rewrite: (path) => path.replace(/^\/locales/, '/'+ publicationDir +'/locales'),
        },
        '/helpFiles': {
          target: 'http://localhost:' + devServerPort,
          rewrite: (path) => path.replace(/^\/helpFiles/, '/'+ publicationDir +'/helpFiles'),
        },
        '/?': {
          target: 'http://localhost:' + devServerPort,
          // rewrite: (path) => path.replace(/^\/?/, '/docs/index.html?'),
          rewrite: (path) => path.replace(/^\/?/, '/index.html?'),
        },
      }
    },
    preview: {
     proxy: { }
    }
  }
});

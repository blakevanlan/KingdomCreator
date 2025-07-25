import { defineConfig } from 'vite';
import path from 'path';
import fs from 'fs';
import packageJson from './package.json';

//import VueDevTools from 'vite-plugin-vue-devtools'
import vue from '@vitejs/plugin-vue';
import legacy from '@vitejs/plugin-legacy'
import vueI18n from '@intlify/unplugin-vue-i18n/vite';
import del  from 'rollup-plugin-delete';
import { viteStaticCopy } from 'vite-plugin-static-copy'

import { DominionContentGenerate, HandleLocaleGenerateAndMerge } from './plugins/vite-dominion-content';
import { exit } from 'process';

// On-demand components auto importing for Vue.
//import UnPluginVueComponents from 'unplugin-vue-components/vite'; 

const devServerPort = 5173;
const publicationDir = 'docs';

const changelogPath = path.join(__dirname, 'Changelog.md');
const readmePath = path.join(__dirname, 'README.md');
const packageVersion = packageJson.version;
console.log('packageVersion: ', packageJson.version);  
const regex = /^### Changelog\s*\n\s*\*\*\d{4}\/\d{2}\/\d{2} - (\d+\.\d+\.\d+)/m;
const changelogText = fs.readFileSync(changelogPath, 'utf-8');
const changelogVersionMatch = changelogText.match(regex);
const changelogVersion = changelogVersionMatch ? changelogVersionMatch[1] : null;
console.log('changelogVersion: ', changelogVersion);  
const readmeText = fs.readFileSync(readmePath, 'utf-8');
const readmeVersionMatch = readmeText.match(regex);
const readmeVersion = readmeVersionMatch ? readmeVersionMatch[1] : null;
console.log('readmeVersion: ', readmeVersion);  

if (packageVersion != changelogVersion || packageVersion != readmeVersion || changelogVersion != readmeVersion) {
  console.log("inconsistency in version number. Please Check")
  exit(0);
}

export default defineConfig( ({ mode}) => {

  if (mode === 'production' || mode === 'development') {
   // mergeJSONLanguageFiles();
    DominionContentGenerate('docs');
    let ArgGenLocale = 'Merge';
    if (process.argv.slice(3)[0] == 'Gen') {
      ArgGenLocale = 'Gen&Merge';
    }
    HandleLocaleGenerateAndMerge(ArgGenLocale, 'docs')
  }
  let baseDir = './'

  return {
    appType: 'spa',
    base: baseDir,
    publicDir: false, //  Do not use publicDir feature to avoid duplcation of all image and pdf files.
    /*
    Do not use publicDir feature to avoid duplcation of all image and pdf files.
    */
    define: {
      Pkgejson_Version: JSON.stringify(packageJson.version),
      Pkgejson_Name: JSON.stringify(packageJson.name),
      Pkgejson_URL: JSON.stringify(packageJson.repository.url),
      Pkgejson_Date: JSON.stringify(new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'numeric' }))
    },
    plugins: [
      { name: 'add-datetime',
        /* vite hook the plugin should use: transformIndexHtml()
        https://vitejs.dev/guide/api-plugin#universal-hooks */
        transformIndexHtml(html) {
          const datetime = new Date().toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'medium' });
          //console.log('\nGenerate Date and Time: ', datetime);
          return html.replace(/id="datetime">/g, `id="datetime">${datetime}`);
        }
      },
      {
        name: 'copy-index',
        /* vite hook the plugin should use: closeBundle()
        https://vitejs.dev/guide/api-plugin#universal-hooks */
        closeBundle() {
          try {
          fs.copyFileSync(
            path.resolve(__dirname, './'+ publicationDir +'/index.html'), 
            path.resolve(__dirname, './'+ publicationDir +'/404.html'))
          } catch (err) {
            if (err) throw err;
            console.log('index.html copied successfully');
          }
        }
      },
      vue(),
      //mode == 'development' ? VueDevTools() : [],
      legacy({ targets: ['defaults'] }),
      vueI18n({
        include: path.resolve(__dirname, './'+ publicationDir +'/locales/*.json'),
        compositionOnly: true,
        fullInstall: true,
        allowDynamic: true,
        runtimeOnly: false
      }),
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
       viteStaticCopy({
        targets: [ { src: 'styles/normalize-v8.css', dest: 'assets/' }
          ]
      })
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
        '/?': {
          target: 'http://localhost:' + devServerPort,
          // rewrite: (path) => path.replace(/^\/?/, '/docs/index.html?'),
          rewrite: (path) => path.replace(/^\/?/, '/index.html?'),
        },
      },
    },
    preview: {
     proxy: { }
    }
  }
});

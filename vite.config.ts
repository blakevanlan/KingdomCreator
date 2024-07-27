import { defineConfig } from 'vite';
import path from 'path';
import packageJson from './package.json';

//import VueDevTools from 'vite-plugin-vue-devtools'
//import { viteStaticCopy } from 'vite-plugin-static-copy';

import vue from '@vitejs/plugin-vue';
import legacy from '@vitejs/plugin-legacy';
import vueI18n from '@intlify/unplugin-vue-i18n/vite';
import rollupDel from 'rollup-plugin-delete';

import {
  DominionContentGenerate,
  HandleLocaleGenerateAndMerge,
} from './plugins/vite-dominion-content';

const devServerPort = 5173;

export default defineConfig(({ mode }) => {
  //console.log(process.argv)
  if (mode === 'production' || mode === 'development') {
    // mergeJSONLanguageFiles();
    DominionContentGenerate('docs');
    /*     const sourceFile = './styles/normalize-v8.css';
    const destinationFile = './docs/normalize.css';
    fs.copyFile(sourceFile, destinationFile, () => {
      console.log(`Le fichier a été copié avec succès de ${sourceFile} vers ${destinationFile}`);
    }) */
    let ArgGenLocale = 'Merge';
    if (process.argv.slice(3)[0] == 'Gen') {
      ArgGenLocale = 'Gen&Merge';
    }
    HandleLocaleGenerateAndMerge(ArgGenLocale, 'docs');
  }

  return {
    appType: 'spa',
    publicDir: 'false',
    /*
    Do not use publicDir feature to avoid duplcation of all image and pdf files.
    */
    define: {
      Pkgejson_Version: JSON.stringify(packageJson.version),
      Pkgejson_Name: JSON.stringify(packageJson.name),
      Pkgejson_URL: JSON.stringify(packageJson.repository.url),
      Pkgejson_Date: JSON.stringify(
        new Date().toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'numeric',
        })
      ),
    },
    plugins: [
      vue(),
      //VueDevTools(),
      legacy({
        targets: ['defaults'],
      }),
      vueI18n({
        include: path.resolve(__dirname, './docs/locales/*.json'),
        compositionOnly: true,
        fullInstall: true,
        allowDynamic: true,
        runtimeOnly: false,
      }),
      rollupDel({
        targets: [
          'docs/*',
          '!docs/rules',
          '!docs/rules.fr',
          '!docs/rules.de',
          '!docs/img',
          '!docs/favicon.ico',
          '!docs/dominion-content.js',
          '!docs/locales',
          '!docs/locales/??.json',
          '!docs/CNAME',
          '!docs/ads.txt',
        ],
        verbose: false,
      }),
      // viteStaticCopy({
      //   targets: [ { src: 'styles/normalize-v8.css', dest: 'assets/' },
      //       /*{ src: 'docs/normalize.css', dest: 'assets/' } */ ]
      // }),
    ],
    optimizeDeps: {
      include: ['vue', 'vue-i18n'],
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
      // to avoid having an empty docs directory
      emptyOutDir: false,
      sourcemap: false,
      chunkSizeWarningLimit: 2000,
      rollupOptions: {
        output: {
          entryFileNames: 'assets/[name]-[hash].js',
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash][extname]',
        },
      },
    },
    server: {
      open: '/',
      proxy: {
        '^/$': {
          target: 'http://localhost:' + devServerPort,
          rewrite: (path) => '/index.html',
        },
        '/dominion-content.js': {
          target: 'http://localhost:' + devServerPort,
          rewrite: (path) =>
            path.replace(/^\/dominion-content.js/, '/docs/dominion-content.js'),
        },
        '/normalize': {
          target: 'http://localhost:' + devServerPort,
          rewrite: (path) => path.replace(/^\/normalize/, '/docs/normalize'),
        },
        '/favicon.ico': {
          target: 'http://localhost:' + devServerPort,
          rewrite: (path) =>
            path.replace(/^\/favicon.ico/, '/docs/favicon.ico'),
        },
        '/img': {
          target: 'http://localhost:' + devServerPort,
          rewrite: (path) => path.replace(/^\/img/, '/docs/img'),
        },
        '/rules': {
          target: 'http://localhost:' + devServerPort,
          rewrite: (path) => path.replace(/^\/rules/, '/docs/rules'),
        },
        '/locales': {
          target: 'http://localhost:' + devServerPort,
          rewrite: (path) => path.replace(/^\/locales/, '/docs/locales'),
        },
        '/?': {
          target: 'http://localhost:' + devServerPort,
          // rewrite: (path) => path.replace(/^\/?/, '/docs/index.html?'),
          rewrite: (path) => path.replace(/^\/?/, '/index.html?'),
        },
      },
    },
    preview: {
      proxy: {},
    },
  };
});

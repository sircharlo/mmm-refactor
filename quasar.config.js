/* eslint-env node */

/*
 * This file runs in a Node context (it's NOT transpiled by Babel), so use only
 * the ES6 features that are supported by your Node version. https://node.green/
 */

// Configuration for your app
// https://v2.quasar.dev/quasar-cli-vite/quasar-config-js
const { sentryVitePlugin } = require('@sentry/vite-plugin');
const { configure } = require('quasar/wrappers');
const path = require('path');
// const inject  = require('@rollup/plugin-inject')

module.exports = configure(function (/* ctx */) {
  return {
    // https://v2.quasar.dev/quasar-cli-vite/prefetch-feature
    // preFetch: true,

    // app boot file (/src/boot)
    // --> boot files are part of "main.js"
    // https://v2.quasar.dev/options/animations
    animations: ['fadeIn', 'fadeOut'],

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/developing-browser-extensions/configuring-bex
    bex: {
      contentScripts: ['my-content-script'],

      // extendBexScriptsConf (esbuildConf) {}
      // extendBexManifestJson (json) {}
    },

    // https://v2.quasar.dev/quasar-cli-vite/boot-files
    boot: ['sentry', 'i18n', 'axios', 'obs'],

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#build
    build: {
      chainWebpack(chain) {
        const nodePolyfillWebpackPlugin = require('node-polyfill-webpack-plugin');
        chain.plugin('node-polyfill').use(nodePolyfillWebpackPlugin);
      },

      extendViteConf(viteConf) {
        if (!viteConf.optimizeDeps) viteConf.optimizeDeps = {};
        // if (!viteConf.optimizeDeps.exclude) viteConf.optimizeDeps.exclude = [
        //   'pdfjs-dist',
        // ];
        if (!viteConf.optimizeDeps.esbuildOptions)
          viteConf.optimizeDeps.esbuildOptions = {};
        if (!viteConf.optimizeDeps.esbuildOptions.define)
          viteConf.optimizeDeps.esbuildOptions.define = {};
        viteConf.optimizeDeps.esbuildOptions.define.global = 'window';
        if (!viteConf.build) viteConf.build = {};
        viteConf.build.sourcemap = true;
        if (!viteConf.build.plugins) viteConf.build.plugins = [];
        viteConf.build.plugins.push(
          sentryVitePlugin({
            org: 'jw-projects',
            project: 'mmm-v2',
          }),
        );
      },

      // vueRouterBase,
      // vueDevtools,
      // vueOptionsAPI: false,

      // rebuildCache: true, // rebuilds Vite/linter/etc cache on startup

      // publicPath: '/',
      // analyze: true,
      // env: {},
      // rawDefine: {}
      // ignorePublicFolder: true,
      // minify: false,
      // polyfillModulePreload: true,
      // distDir

      // extendViteConf(viteConf) {
      //   // do something with viteConf... change it in-place
      //   viteConf.resolve = {
      //     alias: {
      //       ...viteConf.resolve.alias, // that's important we want to keep the alias set by quasar team
      //       fs: require.resolve('fs'),
      //       // child_process: require.resolve('rollup-plugin-node-builtins'),
      //     },
      //   };
      // },
      extendWebpack(cfg, {}) {
        cfg.externals = ['better-sqlite3'];
      },

      target: {
        // browser: ['esnext', 'edge88', 'firefox78', 'chrome87', 'safari13.1'],
        browser: ['esnext'],
        node: 'node22',
      },
      vitePlugins: [
        [
          '@intlify/vite-plugin-vue-i18n',
          {
            include: path.resolve(__dirname, './src/i18n/**'),
          },
        ],
        [
          'vite-plugin-checker',
          {
            eslint: {
              lintCommand: 'eslint "./**/*.{js,ts,mjs,cjs,vue}"',
            },
            vueTsc: {
              tsconfigPath: 'tsconfig.vue-tsc.json',
            },
          },
          { server: false },
        ],
      ],
      vueRouterMode: 'hash', // available values: 'hash', 'history'
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/developing-capacitor-apps/configuring-capacitor
    capacitor: {
      hideSplashscreen: true,
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/developing-cordova-apps/configuring-cordova
    cordova: {
      // noIosLegacyBuildFlag: true, // uncomment only if you know what you are doing
    },

    // animations: 'all', // --- includes all animations
    // https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#css
    css: ['app.scss'],

    // https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#sourcefiles
    // sourceFiles: {
    //   rootComponent: 'src/App.vue',
    //   router: 'src/router/index',
    //   store: 'src/store/index',
    //   registerServiceWorker: 'src-pwa/register-service-worker',
    //   serviceWorker: 'src-pwa/custom-service-worker',
    //   pwaManifestFile: 'src-pwa/manifest.json',
    //   electronMain: 'src-electron/electron-main',
    //   electronPreload: 'src-electron/electron-preload'
    // },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#devServer
    devServer: {
      // https: true
      open: true, // opens browser window automatically
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/developing-electron-apps/configuring-electron
    electron: {
      // extendElectronMainConf (esbuildConf)
      // extendElectronPreloadConf (esbuildConf)

      builder: {
        // https://www.electron.build/configuration/configuration

        appId: 'sircharlo.meeting-media-manager-v2',
        artifactName: 'meeting-media-manager-${version}.${ext}',
        buildDependenciesFromSource: true,
        generateUpdatesFilesForAllChannels: true,
        linux: {
          category: 'Utility',
          icon: 'icons/',
          publish: ['github'],
          target: 'AppImage',
        },
        // directories: {
        //   output: 'build',
        mac: {
          icon: 'icons/icon.icns',
          publish: ['github'],
          target: {
            arch: ['universal'],
            target: 'dmg',
          },
        },
        nsis: {
          artifactName: 'meeting-media-manager-${version}-${arch}.${ext}',
          oneClick: false,
        },
        productName: 'Meeting Media Manager',
        // },
        win: {
          icon: 'icons/icon.ico',
          publish: ['github'],
          target: [
            {
              arch: ['x64', 'ia32'],
              target: 'nsis',
            },
          ],
        },
      },

      bundler: 'builder', // 'packager' or 'builder'

      inspectPort: 5858,

      packager: {
        // https://github.com/electron-userland/electron-packager/blob/master/docs/api.md#options
        // OS X / Mac App Store
        // appBundleId: '',
        // appCategoryType: '',
        // osxSign: '',
        // protocol: 'myapp://path',
        // Windows only
        // win32metadata: { ... }
      },
    },

    // https://github.com/quasarframework/quasar/tree/dev/extras
    extras: [
      'fontawesome-v6',
      'material-icons', // optional, you are not bound to it
      'mdi-v7',
      // 'ionicons-v4',
      // 'bootstrap-icons',
      // 'eva-icons',
      // 'themify',
      // 'line-awesome',
      // 'roboto-font-latin-ext', // this or either 'roboto-font', NEVER both!
      // 'roboto-font', // optional, you are not bound to it
    ],

    // https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#framework
    framework: {
      config: {
        dark: 'auto',
      },

      // iconSet: 'material-icons', // Quasar icon set
      // lang: 'en-US', // Quasar language pack

      // For special cases outside of where the auto-import strategy can have an impact
      // (like functional components as one of the examples),
      // you can manually specify Quasar components/directives to be available everywhere:
      //
      // components: [],
      // directives: [],

      // Quasar plugins
      plugins: ['LocalStorage', 'Notify'],
    },

    // https://v2.quasar.dev/quasar-cli-vite/developing-pwa/configuring-pwa
    pwa: {
      injectPwaMetaTags: true,
      manifestFilename: 'manifest.json',
      swFilename: 'sw.js',
      useCredentialsForManifestTag: false,
      workboxMode: 'generateSW', // or 'injectManifest'
      // useFilenameHashes: true,
      // extendGenerateSWOptions (cfg) {}
      // extendInjectManifestOptions (cfg) {},
      // extendManifestJson (json) {}
      // extendPWACustomSWConf (esbuildConf) {}
    },

    // https://v2.quasar.dev/quasar-cli-vite/developing-ssr/configuring-ssr
    ssr: {
      // ssrPwaHtmlFilename: 'offline.html', // do NOT use index.html as name!
      // will mess up SSR

      // extendSSRWebserverConf (esbuildConf) {},
      // extendPackageJson (json) {},

      middlewares: [
        'render', // keep this as last one
      ],

      // manualStoreHydration: true,
      // manualPostHydrationTrigger: true,

      prodPort: 3000, // The default port that the production server should use
      // (gets superseded if process.env.PORT is specified at runtime)

      pwa: false,
    },
  };
});

/* eslint-env node */

/*
 * This file runs in a Node context (it's NOT transpiled by Babel), so use only
 * the ES6 features that are supported by your Node version. https://node.green/
 */

// Configuration for your app
// https://v2.quasar.dev/quasar-cli-vite/quasar-config-js

// import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill'
// import rollupNodePolyFill from 'rollup-plugin-polyfill-node'

const { configure } = require('quasar/wrappers');
const path = require('path');
// const inject  = require('@rollup/plugin-inject')

module.exports = configure(function (/* ctx */) {
  return {
    // https://v2.quasar.dev/quasar-cli-vite/prefetch-feature
    // preFetch: true,

    // app boot file (/src/boot)
    // --> boot files are part of "main.js"
    // https://v2.quasar.dev/quasar-cli-vite/boot-files
    boot: ['i18n', 'axios', 'components', 'obs'],

    // https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#css
    css: ['app.scss'],

    // https://github.com/quasarframework/quasar/tree/dev/extras
    extras: [
      // 'ionicons-v4',
      'mdi-v7',
      // 'bootstrap-icons',
      'fontawesome-v6',
      // 'eva-icons',
      // 'themify',
      // 'line-awesome',
      // 'roboto-font-latin-ext', // this or either 'roboto-font', NEVER both!

      'roboto-font', // optional, you are not bound to it
      'material-icons', // optional, you are not bound to it
    ],

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#build
    build: {
      target: {
        // browser: ['esnext', 'edge88', 'firefox78', 'chrome87', 'safari13.1'],
        browser: ['esnext'],
        node: 'node20',
      },

      vueRouterMode: 'hash', // available values: 'hash', 'history'
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

      // extendViteConf (viteConf) {},
      // chainWebpack(chain) {
      //   const nodePolyfillWebpackPlugin = require('node-polyfill-webpack-plugin');
      //   chain.plugin('node-polyfill').use(nodePolyfillWebpackPlugin);
      // },
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
      // chainWebpack (chain) {
      //   const nodePolyfillWebpackPlugin = require('node-polyfill-webpack-plugin')
      //   chain.plugin('node-polyfill').use(nodePolyfillWebpackPlugin)
      // },
      // extendWebpack(cfg) {
      //   cfg.module.rules.push({
      //     test: /(fs-extra|graceful)/,
      //     loader: 'null-loader'
      //     })
      //   cfg.resolve.fallback = {
      //     fs: require.resolve('rollup-plugin-node-builtins'),
      //     'fs-extra': require.resolve('fs-extra'),
      //   };
      //   cfg.target = 'electron-main';
      // },

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

        // if (!viteConf.build) viteConf.build = {};
        // if (!viteConf.build.rollupOptions) viteConf.build.rollupOptions = {};
        // viteConf.build.rollupOptions.external = [inject({ Buffer: ['buffer/', 'Buffer'] }) ]

        // if (!viteConf.optimizeDeps.esbuildOptions.plugins)
        //   viteConf.optimizeDeps.esbuildOptions.plugins = [];
        // viteConf.optimizeDeps.esbuildOptions.plugins.push(
        //   nodePolyfills({ protocolImports: true, globals: {  Buffer: true, process: true } })
        // );
      },

      chainWebpack(chain) {
        const nodePolyfillWebpackPlugin = require('node-polyfill-webpack-plugin');
        chain.plugin('node-polyfill').use(nodePolyfillWebpackPlugin);
      },
      // extendWebpack(cfg, {}) {
      //   cfg.resolve.fallback = { fs: false, process: require('process'), path: false };
      // },

      // viteVuePluginOptions: { //You may have to add or uncomment this option.
      //   template: {
      //     compilerOptions: {
      //       isCustomElement: (tag) => tag.startsWith('custom')
      //     }
      //   }
      // },

      vitePlugins: [
        [
          '@intlify/vite-plugin-vue-i18n',
          {
            // if you want to use Vue I18n Legacy API, you need to set `compositionOnly: false`
            // compositionOnly: false,

            // if you want to use named tokens in your Vue I18n messages, such as 'Hello {name}',
            // you need to set `runtimeOnly: false`
            // runtimeOnly: false,

            // you need to set i18n resource including paths !
            include: path.resolve(__dirname, './src/i18n/**'),
          },
        ],
        [
          'vite-plugin-checker',
          {
            vueTsc: {
              tsconfigPath: 'tsconfig.vue-tsc.json',
            },
            eslint: {
              lintCommand: 'eslint "./**/*.{js,ts,mjs,cjs,vue}"',
            },
          },
          { server: false },
        ],
      ],
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#devServer
    devServer: {
      // https: true
      open: true, // opens browser window automatically
    },

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

    // animations: 'all', // --- includes all animations
    // https://v2.quasar.dev/options/animations
    animations: ['fadeIn', 'fadeOut'],

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

    // https://v2.quasar.dev/quasar-cli-vite/developing-ssr/configuring-ssr
    ssr: {
      // ssrPwaHtmlFilename: 'offline.html', // do NOT use index.html as name!
      // will mess up SSR

      // extendSSRWebserverConf (esbuildConf) {},
      // extendPackageJson (json) {},

      pwa: false,

      // manualStoreHydration: true,
      // manualPostHydrationTrigger: true,

      prodPort: 3000, // The default port that the production server should use
      // (gets superseded if process.env.PORT is specified at runtime)

      middlewares: [
        'render', // keep this as last one
      ],
    },

    // https://v2.quasar.dev/quasar-cli-vite/developing-pwa/configuring-pwa
    pwa: {
      workboxMode: 'generateSW', // or 'injectManifest'
      injectPwaMetaTags: true,
      swFilename: 'sw.js',
      manifestFilename: 'manifest.json',
      useCredentialsForManifestTag: false,
      // useFilenameHashes: true,
      // extendGenerateSWOptions (cfg) {}
      // extendInjectManifestOptions (cfg) {},
      // extendManifestJson (json) {}
      // extendPWACustomSWConf (esbuildConf) {}
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/developing-cordova-apps/configuring-cordova
    cordova: {
      // noIosLegacyBuildFlag: true, // uncomment only if you know what you are doing
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/developing-capacitor-apps/configuring-capacitor
    capacitor: {
      hideSplashscreen: true,
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/developing-electron-apps/configuring-electron
    electron: {
      // extendElectronMainConf (esbuildConf)
      // extendElectronPreloadConf (esbuildConf)

      inspectPort: 5858,

      bundler: 'builder', // 'packager' or 'builder'

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

      builder: {
        // https://www.electron.build/configuration/configuration

        appId: 'mmm-v2',
      },
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/developing-browser-extensions/configuring-bex
    bex: {
      contentScripts: ['my-content-script'],

      // extendBexScriptsConf (esbuildConf) {}
      // extendBexManifestJson (json) {}
    },
  };
});

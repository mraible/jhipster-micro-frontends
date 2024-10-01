import { URL, fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import { defineConfig, mergeConfig, normalizePath } from 'vite';

import vue from '@vitejs/plugin-vue';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import federation from '@originjs/vite-plugin-federation';

const getFileFromRepo = (file: string) =>
  existsSync(fileURLToPath(new URL(`../node_modules/${file}`, import.meta.url)))
    ? fileURLToPath(new URL(`../node_modules/${file}`, import.meta.url))
    : fileURLToPath(new URL(`./node_modules/${file}`, import.meta.url));

const { getAbsoluteFSPath } = await import('swagger-ui-dist');
const swaggerUiPath = getAbsoluteFSPath();

// eslint-disable-next-line prefer-const
let config = defineConfig({
  plugins: [
    vue(),
    viteStaticCopy({
      targets: [
        {
          src: [
            `${normalizePath(swaggerUiPath)}/*.{js,css,html,png}`,
            `!${normalizePath(swaggerUiPath)}/**/index.html`,
            normalizePath(getFileFromRepo('axios/dist/axios.min.js')),
            normalizePath(fileURLToPath(new URL('./src/main/webapp/swagger-ui/index.html', import.meta.url))),
          ],
          dest: 'swagger-ui',
        },
      ],
    }),
  ],
  root: fileURLToPath(new URL('./src/main/webapp/', import.meta.url)),
  publicDir: fileURLToPath(new URL('./target/classes/static/public', import.meta.url)),
  cacheDir: fileURLToPath(new URL('./target/.vite-cache', import.meta.url)),
  build: {
    emptyOutDir: true,
    outDir: fileURLToPath(new URL('./target/classes/static/', import.meta.url)),
    rollupOptions: {
      input: {
        app: fileURLToPath(new URL('./src/main/webapp/index.html', import.meta.url)),
      },
    },
  },
  resolve: {
    alias: {
      vue: '@vue/compat/dist/vue.esm-bundler.js',
      '@': fileURLToPath(new URL('./src/main/webapp/app/', import.meta.url)),
    },
  },
  define: {
    I18N_HASH: '"generated_hash"',
    SERVER_API_URL: '"/"',
    APP_VERSION: `"${process.env.APP_VERSION ? process.env.APP_VERSION : 'DEV'}"`,
  },
  server: {
    host: true,
    port: 9000,
    proxy: Object.fromEntries(
      ['/api', '/management', '/v3/api-docs', '/oauth2', '/login', '/services'].map(res => [
        res,
        {
          target: 'http://localhost:8080',
        },
      ]),
    ),
  },
});

config = mergeConfig(config, {
  build: {
    modulePreload: false,
    minify: false,
    target: ['chrome89', 'edge89', 'firefox89', 'safari15'],
  },
  plugins: [
    federation({
      name: 'store',
      exposes: {
        './entities-router': './src/main/webapp/app/router/entities',
        './entities-menu': './src/main/webapp/app/entities/entities-menu.vue',
      },
      shared: {
        '@vuelidate/core': {},
        '@vuelidate/validators': {},
        axios: {},
        // 'bootstrap-vue': {},
        vue: {
          packagePath: '@vue/compat/dist/vue.esm-bundler.js',
        },
        'vue-i18n': {},
        'vue-router': {},
        pinia: {},
        '@/shared/security/authority': {
          packagePath: './src/main/webapp/app/shared/security/authority',
        },
        '@/shared/alert/alert.service': {
          packagePath: './src/main/webapp/app/shared/alert/alert.service',
        },
        '@/locale/translation.service': {
          packagePath: './src/main/webapp/app/locale/translation.service',
        },
      },
    }),
  ],
});
// jhipster-needle-add-vite-config - JHipster will add custom config

export default config;

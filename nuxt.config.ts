// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // Global page headers: https://nuxt.com/docs/getting-started/seo-meta
  app: {
    head: {
      charset: "utf-8",
      viewport: "width=device-width, initial-scale=1",
    },
  },

  ssr: false,

  // compatibilityDate: https://nuxt.com/docs/api/nuxt-config#compatibilitydate
  compatibilityDate: "2024-04-03",

  // Devtool: https://nuxt.com/docs/api/commands/devtools
  devtools: { enabled: true },

  // Global CSS: https://nuxt.com/docs/getting-started/styling
  // css: ["~/assets/css/main.css"],

  // modules
  modules: [
    "@nuxt/eslint",
    "@nuxtjs/tailwindcss",
    "@pinia/nuxt",
    "@vueuse/nuxt",
    "@nuxt/image",
    "@nuxt/devtools",
  ],

  // tailwind: https://nuxt.com/docs/getting-started/configuration#external-configuration-files
  tailwindcss: {
    cssPath: ["~/assets/css/tailwind.css", { injectPosition: "first" }],
    configPath: "tailwind.config",
    exposeConfig: {
      level: 2,
    },
    config: {},
    viewer: true,
  },

  // eslint: https://nuxt.com/docs/guide/concepts/code-style#eslint
  eslint: {
    config: {
      stylistic: {
        indent: "tab",
        semi: true,
      },
    },
  },

  // vite
  vite: {
    build: {
      rollupOptions: {
        external: ["vue/server-renderer"],
      },
    },
  },
});

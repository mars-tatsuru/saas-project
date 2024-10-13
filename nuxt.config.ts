// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	// Global page headers: https://nuxt.com/docs/getting-started/seo-meta
	app: {
		head: {
			charset: 'utf-8',
			viewport: 'width=device-width, initial-scale=1',
		},
	},

	ssr: true,

	// compatibilityDate: https://nuxt.com/docs/api/nuxt-config#compatibilitydate
	compatibilityDate: '2024-09-05',

	// Devtool: https://nuxt.com/docs/api/commands/devtools
	devtools: { enabled: true },

	// Global CSS: https://nuxt.com/docs/getting-started/styling
	// css: ["~/assets/css/main.css"],

	// modules
	modules: [
		'@nuxt/eslint',
		'@nuxtjs/tailwindcss',
		'shadcn-nuxt',
		'@pinia/nuxt',
		'@vueuse/nuxt',
		'@nuxt/image',
		'@nuxt/devtools',
		'@nuxtjs/supabase',
		'shadcn-nuxt',
	],

	// tailwind: https://nuxt.com/docs/getting-started/configuration#external-configuration-files
	tailwindcss: {
		cssPath: ['~/assets/css/tailwind.css', { injectPosition: 'first' }],
		configPath: 'tailwind.config',
		exposeConfig: {
			level: 2,
		},
		config: {},
		viewer: true,
	},

	// shadcn: https://www.shadcn-vue.com/docs/installation/nuxt
	shadcn: {
		/**
     * Prefix for all the imported component
     */
		prefix: '',
		/**
     * Directory that the component lives in.
     * @default "./components/ui"
     */
		componentDir: './components/ui',
	},

	// eslint: https://nuxt.com/docs/guide/concepts/code-style#eslint
	eslint: {
		config: {
			stylistic: {
				indent: 'tab',
				semi: true,
			},
		},
	},

	// vite
	vite: {
		build: {
			rollupOptions: {
				external: ['vue/server-renderer'],
			},
		},
	},

	// supabase
	supabase: {
		url: process.env.VITE_SUPABASE_URL,
		key: process.env.VITE_SUPABASE_KEY,
		redirect: true,
		redirectOptions: {
			login: '/login',
			callback: '/',
			include: undefined,
			exclude: [],
			cookieRedirect: false,
		},
		cookieOptions: {
			maxAge: 60 * 60 * 8,
			sameSite: 'lax',
			secure: true,
		},
	},
});

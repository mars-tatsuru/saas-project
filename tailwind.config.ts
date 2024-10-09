/** @type {import('tailwindcss').Config} */
export default {
	content: [
		'./pages/**/*.{vue,js,ts,jsx,tsx}',
		'./components/**/*.{vue,js,ts,jsx,tsx}',
		'./components/**/*.{js,vue,ts}',
		'./layouts/**/*.vue',
		'./pages/**/*.vue',
		'./plugins/**/*.{js,ts}',
		'./nuxt.config.{js,ts}',
		'./node_modules/flowbite/**/*.{js,ts}',
	],
	theme: {
		extend: {},
	},
	plugins: ['flowbite/plugin'],
};

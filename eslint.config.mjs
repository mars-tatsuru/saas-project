// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs';

export default withNuxt(
	{
		files: ['**/*.vue', '**/*.ts'],
		rules: {
			'@typescript-eslint/no-unused-vars': 'off',
			'@typescript-eslint/no-explicit-any': 'off',
			'@stylistic/no-mixed-spaces-and-tabs': 'off',
		},
	},
	{
		files: ['**/*.vue'],
		rules: {
		},
	},
);

/**
 * External dependencies
 */
const { cosmiconfigSync } = require( 'cosmiconfig' );

/**
 * WordPress dependencies
 */
const defaultPrettierConfig = require( '@wordpress/prettier-config' );

const { config: localPrettierConfig } =
	cosmiconfigSync( 'prettier' ).search() || {};
const prettierConfig = { ...defaultPrettierConfig, ...localPrettierConfig };

module.exports = {
	extends: [
		require.resolve( './recommended-with-formatting.js' ),
		'plugin:prettier/recommended',
		'prettier/react',
	],
	plugins: [ 'import' ],
	rules: {
		'import/no-extraneous-dependencies': 'error',
		'import/no-unresolved': 'error',
		'prettier/prettier': [ 'error', prettierConfig ],
	},
};

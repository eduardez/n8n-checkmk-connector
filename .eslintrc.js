module.exports = {
	root: true,
	env: {
		browser: true,
		es6: true,
		node: true,
	},
	parser: '@typescript-eslint/parser',
	parserOptions: {
		project: ['./tsconfig.json'],
		sourceType: 'module',
		extraFileExtensions: ['.json'],
	},
	ignorePatterns: ['dist/**/*', 'node_modules/**/*', '**/*.js'],
	overrides: [
		{
			files: ['package.json'],
			plugins: ['eslint-plugin-n8n-nodes-base'],
			extends: ['plugin:n8n-nodes-base/community'],
		},
		{
			files: ['./credentials/**/*.ts'],
			plugins: ['eslint-plugin-n8n-nodes-base'],
			extends: ['plugin:n8n-nodes-base/credentials'],
			rules: {
				// The rule camelCases the documentationUrl *value*, mangling any real URL.
				'n8n-nodes-base/cred-class-field-documentation-url-miscased': 'off',
			},
		},
		{
			files: ['./nodes/**/*.ts'],
			plugins: ['eslint-plugin-n8n-nodes-base'],
			extends: ['plugin:n8n-nodes-base/nodes'],
			rules: {
				// The generated catalog is machine-written and intentionally large.
				'n8n-nodes-base/node-class-description-inputs-wrong-regular-node': 'off',
				// Resource options are generated at module load from the catalog; the rule
				// only understands literal option arrays and crashes on spreads.
				'n8n-nodes-base/node-param-resource-with-plural-option': 'off',
				// Options and their defaults are generated from the catalog at load time,
				// so the rule cannot map a default onto a literal option list.
				'n8n-nodes-base/node-param-default-wrong-for-options': 'off',
			},
		},
	],
};

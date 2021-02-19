module.exports = function (api) {
	api.cache(true);
	const presets = [
		[
			'@babel/preset-react',
			{
				runtime: 'automatic',
			},
		],
		'@babel/preset-env',
	];
	const plugins = [
		'@babel/plugin-proposal-class-properties',
		'@babel/plugin-proposal-object-rest-spread',
		'@babel/plugin-syntax-dynamic-import',
		'@babel/plugin-transform-runtime',
	];

	return {
		env: {
			test: {
				presets,
			},
			development: {
				plugins: [
					// hot reloads
					// "react-hot-loader/babel",
					['import', { libraryName: 'antd' }],
					// default plugins
					...plugins,
				],
			},
		},
		presets,
		plugins,
	};
};

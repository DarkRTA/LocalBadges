const path = require('path');
const UglifyPlugin = require('uglifyjs-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const { BannerPlugin } = require('webpack');
const dateFormat = require('dateformat');

const config = {
	mode: "development",
	devtool: 'source-map',

	entry: {
		localbadges: './src/index.js',
	},
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: '[name].js',
		jsonpFunction: 'LocalBadgesWebpackJsonp',
	},

	plugins: [
		new UglifyPlugin({
			sourceMap: true,
			uglifyOptions: {
				compress: {
					keep_fnames: true,
				},
				mangle: false,
			},
		}),
		new BannerPlugin({
			banner: `LocalBadges - Built at ${dateFormat(new Date(), 'yyyy-mm-dd HH:MM:ss')}`,
		}),
		new VueLoaderPlugin(),
	],

	module: {
		rules: [
			{
				test: /\.vue$/,
				loader: 'vue-loader'
			},
			{
				test: /\.css$/,
				use: [{
					loader: 'file-loader',
					options: {
						name: '[name].css'
					}
				},
				{
					loader: 'extract-loader'
				},
				{
					loader: 'css-loader',
					options: {
					sourceMap: true
				}
				}]
			},
			{
				test: /\.(graphql|gql)$/,
				exclude: /node_modules/,
				loader: 'graphql-tag/loader'
			},
		]
	}
};

module.exports = config;

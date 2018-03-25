import {AngularCompilerPlugin} from '@ngtools/webpack';
import {BundleAnalyzerPlugin} from 'webpack-bundle-analyzer';
import * as webpack from 'webpack';
import * as path from 'path';
import * as ExtractTextPlugin from 'extract-text-webpack-plugin';
import * as AssetsPlugin from 'assets-webpack-plugin';
import {EnvironmentType, WebpackConfigFactoryOptions} from '../types';
import * as _ from 'lodash';


export function webpackConfigFactory(environment: EnvironmentType, options: WebpackConfigFactoryOptions): webpack.Configuration
{
	options = populateDefaultOptions(options);

	const isDev = environment === 'development';
	const config: webpack.Configuration = {
		context: options.root,
		cache: true,
		devtool: options.sourceMaps ? 'cheap-eval-source-map' : false,

		entry: options.webpack.entry,

		output: {
			path: options.distDir,
			filename: isDev ? '[name].dev.js' : '[name].[chunkhash].js',
			chunkFilename: isDev ? '[id].dev.chunk.js' : '[id].[chunkhash].chunk.js',
			publicPath: options.publicPath,
		},

		resolve: {
			extensions: ['.js', '.ts'],
		},

		module: {
			loaders: [
				{
					test: /(?:\.ngfactory\.js|\.ngstyle\.js|\.ts)$/,
					loader: '@ngtools/webpack',
				},
				{
					test: /\.html$/,
					loader: 'raw-loader',
				},
				{
					test: /.(ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
					loader: 'file-loader',
					options: {
						name: '[name].[ext]',
						outputPath: options.webpack.fonts.outputPath,
						publicPath: options.webpack.fonts.publicPath,
					},
				},
			],
		},

		plugins: [
			new webpack.DefinePlugin(options.webpack.plugins.define),
			new AssetsPlugin({
				path: options.distDir,
				prettyPrint: isDev,
			}),
			new AngularCompilerPlugin({
				basePath: options.root,
				tsConfigPath: path.join(options.root, 'tsconfig.json'),
				entryModule: options.angular.entryModule,
				sourceMap: options.sourceMaps,
			}),
			new webpack.optimize.CommonsChunkPlugin({
				name: 'vendor',
				minChunks: Infinity,
			}),
			new webpack.optimize.CommonsChunkPlugin({
				name: 'manifest',
			}),
		],
	};

	const cssLoadersConfig: Array<any> = [
		{
			loader: 'css-loader',
			options: {
				sourceMap: options.sourceMaps,
			},
		},
	];

	if (!_.isUndefined(options.postcss) && !_.isUndefined(options.postcss.config)) {
		cssLoadersConfig.push({
			loader: 'postcss-loader',
			options: {
				sourceMap: options.sourceMaps,
				config: {
					path: options.postcss.config,
				},
			},
		});
	}

	cssLoadersConfig.push({
		loader: 'sass-loader',
		options: {
			sourceMap: options.sourceMaps,
		},
	});

	if (isDev && options.hmr) {
		config.entry['hmr'] = 'webpack-hot-middleware/client?reload=true';
		config.plugins.unshift(new webpack.NamedModulesPlugin);
		config.plugins.push(new webpack.HotModuleReplacementPlugin);
	}

	if (isDev) {
		const developmentCssLoadersConfig: any = _.clone(cssLoadersConfig);
		developmentCssLoadersConfig.unshift({
			loader: 'style-loader',
			options: {
				sourceMap: options.sourceMaps,
			},
		});

		config.module['loaders'].push({
			test: /\.scss$/,
			use: developmentCssLoadersConfig,
		});

	} else {
		config.module['loaders'].push({
			test: /\.scss$/,
			use: ExtractTextPlugin.extract({
				use: cssLoadersConfig,
				fallback: 'style-loader',
			}),
		});

		config.plugins.push(new ExtractTextPlugin({
			filename: 'styles.css',
			allChunks: true,
		}));
	}

	if (options.webpack.analyze) {
		config.plugins.push(new BundleAnalyzerPlugin({
			analyzerMode: 'static',
			reportFilename: 'report.html',
			openAnalyzer: false,
		}));
	}

	return config;
}


function populateDefaultOptions(options: WebpackConfigFactoryOptions): WebpackConfigFactoryOptions
{
	if (_.isUndefined(options.webpack)) {
		options.webpack = {
			analyze: false,
			entry: {},
		};
	}

	if (_.isUndefined(options.webpack.plugins)) {
		options.webpack.plugins = {};
	}

	if (_.isUndefined(options.webpack.plugins.define)) {
		options.webpack.plugins.define = {};
	}

	if (_.isUndefined(options.webpack.fonts)) {
		options.webpack.fonts = {};
	}

	return options;
}

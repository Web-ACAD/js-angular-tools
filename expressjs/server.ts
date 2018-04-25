import {assetHelperFactory} from '../handlebars';
import {EnvironmentType} from '../types';
import {getAssets} from '../webpack';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as exphbs from 'express-handlebars';
import * as webpack from 'webpack';
import * as webpackDevMiddleware from 'webpack-dev-middleware';
import * as webpackHotMiddleware from 'webpack-hot-middleware';
import * as path from 'path';
import * as http from 'http';
import * as nocache from 'nocache';


export declare interface ExpressServerOptions
{
	index: string,
	port: number,
	staticPaths?: {[url: string]: string},
	hmr?: boolean,
	parameters?: {[name: string]: any},
}


export function createServer(environment: EnvironmentType, webpackConfig: webpack.Configuration, options: ExpressServerOptions): http.Server
{
	const app = express();

	const isDev = environment === 'development';
	const manifestPath = path.resolve(webpackConfig.output.path, 'webpack-assets.json');

	const hbs = exphbs.create({
		helpers: {
			asset: assetHelperFactory(manifestPath),
		},
	});

	app.engine('handlebars', hbs.engine);
	app.set('view engine', 'handlebars');

	if (isDev) {
		app.use(nocache());
	} else {
		app.enable('view cache');
	}

	if (typeof options.staticPaths === 'undefined') {
		options.staticPaths = {};
	}

	if (!isDev) {
		const assets = getAssets(manifestPath);

		for (let entryName in webpackConfig.entry) {
			if (webpackConfig.entry.hasOwnProperty(entryName)) {
				if (typeof assets[entryName] === 'undefined') {
					continue;
				}

				let asset = assets[entryName];
				let entryFile = webpackConfig.entry[entryName];
				let entryPath = asset[Object.keys(asset)[0]];

				options.staticPaths[entryPath] = entryFile;
			}
		}
	}

	for (let staticUrl in options.staticPaths) {
		if (options.staticPaths.hasOwnProperty(staticUrl)) {
			app.use(staticUrl, express.static(options.staticPaths[staticUrl]));
		}
	}

	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({extended: false}));

	if (isDev) {
		const webpackCompiler = webpack(webpackConfig);

		app.use(webpackDevMiddleware(webpackCompiler, {
			publicPath: webpackConfig.output.publicPath,
			hot: options.hmr,
			historyApiFallback: true,
		}));

		if (options.hmr) {
			app.use(webpackHotMiddleware(webpackCompiler));
		}
	}

	let parameters = {
		development: isDev,
		production: !isDev,
		hmr: options.hmr,
	};

	if (typeof options.parameters !== 'undefined') {
		parameters = {...options.parameters, ...parameters};
	}

	app.get('*', (req, res) => {
		res.render(options.index, parameters);
	});

	app.set('port', options.port);

	const server = http.createServer(app);

	server.on('error', (e) => {
		throw e;
	});

	server.listen(options.port, () => {
		/* tslint:disable */
		console.log(`Web running on port ${options.port}`);
	});

	return server;
}


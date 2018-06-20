export declare type EnvironmentType = 'development' | 'production';


export declare interface WebpackConfigFactoryOptions
{
	root: string,
	distDir: string,
	publicPath?: string,
	hmr?: boolean,
	sourceMaps?: boolean,
	angular: {
		entryModule: string,
	},
	postcss?: {
		config?: string,
	},
	webpack?: {
		analyze?: boolean,
		entry?: {[entry: string]: string|Array<string>},
		plugins?: {
			define?: {[name: string]: any},
		},
		fonts?: {
			outputPath: string,
			publicPath: string,
		},
	},
}

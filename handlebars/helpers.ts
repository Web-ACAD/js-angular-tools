declare interface AssetsList
{
	[entry: string]: {
		[type: string]: string,
	},
}


export function assetHelperFactory(manifestPath: string): (asset: string) => string
{
	let cache: AssetsList;
	let loaded: boolean = false;

	const getAssets = (): AssetsList => {
		if (loaded) {
			return cache;
		}

		cache = require(manifestPath);
		loaded = true;

		return cache;
	};

	return (asset: string): string => {
		const assetParts = asset.split('/');

		if (assetParts.length !== 2) {
			throw new Error(`assets: asset ${asset} is invalid, expected format is "entry/type"`);
		}

		const assets = getAssets();
		const entry = assetParts[0];
		const type = assetParts[1];

		if (typeof assets[entry] === 'undefined') {
			throw new Error(`assets: entry ${entry} does not exists`);
		}

		if (typeof assets[entry][type] === 'undefined') {
			throw new Error(`assets: type ${type} for ${entry} does not exists`);
		}

		return assets[entry][type];
	};
}

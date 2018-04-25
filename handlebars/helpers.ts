import {getAssets, AssetsList} from '../webpack';


export function assetHelperFactory(manifestPath: string): (asset: string) => string
{
	let assetsCache: AssetsList;

	const _getAssets = (): AssetsList => {
		if (typeof assetsCache !== 'undefined') {
			return assetsCache;
		}

		return assetsCache = getAssets(manifestPath);
	};

	return (asset: string): string => {
		const assetParts = asset.split('/');

		if (assetParts.length !== 2) {
			throw new Error(`assets: asset ${asset} is invalid, expected format is "entry/type"`);
		}

		const assets = _getAssets();
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

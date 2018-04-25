export declare interface AssetsList
{
	[entry: string]: {
		[type: string]: string,
	},
}


export function getAssets(manifest: string): AssetsList
{
	return require(manifest);
}

var testPatternDef = {
	name : "e4-1ga16316",
	description : "European 4-in-1 16 Gauge 3/16",
	tile : {
		xRepeat : 12,
		yRepeat : 25,
		xRowOffset : 0,
		yRowOffset : 25,
		xSubtileCount : 1,
		ySubtileCount : 2,
		overviewFile : "images/patterns/maille/european/e4-1ga16316/e4-1ga16316.bmp",
		outlineFile : "images/patterns/maille/european/e4-1ga16316/e4-1ga16316-o.bmp",
		backgroundFile : "images/patterns/maille/european/e4-1ga16316/e4-1ga16316-bg.bmp"
	},
	subtiles : [
			{
				imageFile : "images/patterns/maille/european/e4-1ga16316/e4-1ga16316-001.bmp",
				xOffset : 1,
				yOffset : 1,
				xSubtileIndex : 0,
				ySubtileIndex : 0
			},
			{
				imageFile : "images/patterns/maille/european/e4-1ga16316/e4-1ga16316-002.bmp",
				xOffset : 7,
				yOffset : 13,
				xSubtileIndex : 0,
				ySubtileIndex : 1
			} ]
};

var testPattern = new Pattern(testPatternDef);
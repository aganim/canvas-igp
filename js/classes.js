this.Utils = new function() {
	this.isOpaque = function(rgba) {
		return rgba[3] == 255;
	};
	
	this.isPointInBox = function(x, y, startX, startY, xSize, ySize) {
		return x >= startX && x < (startX + xSize)
			&& y >= startY && y < (startY + ySize);
	};
	
	var cutHex = function(hex) {
		return (hex.charAt(0)=="#") ? hex.substring(1,7):hex;
	};
	
	this.rgbBytes = function(rgb) {
		var cutRgb = cutHex(rgb);
		return [parseInt(cutRgb.substring(0,2), 16),
		        parseInt(cutRgb.substring(2,4), 16),
		        parseInt(cutRgb.substring(4,6), 16)];
	};
	
	this.setWhiteToTransparent = function(context, imageData) {
		var pixels = imageData.data;
		for(var i = 0; i < pixels.length; i += 4){
			var r = pixels[i];
			var g = pixels[i + 1];
			var b = pixels[i + 2];
			if(r == 255 && g == 255 && b == 255) {
				pixels[i + 3] = 0;
			}
		}
		context.putImageData(imageData, 0, 0);
	};

	this.getImageDataInColor = function(imageData, rgba) {
		var dataCopy = new Uint8ClampedArray(imageData.data);
		for (var i = 0; i < imageData.data.length; i+=4){
			if(imageData.data[i+3] == 255){ //solid alpha entries
				dataCopy[i] = (rgba >> 24) & 0xFF;
				dataCopy[i+1] = (rgba >> 16) & 0xFF;
				dataCopy[i+2] = (rgba >> 8) & 0xFF;
				dataCopy[i+3] = (rgba >> 0) & 0xFF;
			}
		}
		    
		return dataCopy;
	};
};

//function PatternCoordinate(x, y, index) {
//	this.x = x;
//	this.y = y;
//	this.index = index;
//};

function Subtile(subtileDef) {
	var id = subtileDef.id;
	
	var image = $('#' + subtileDef.id)[0];
	var canvas = document.createElement('canvas');
	canvas.width = image.width;
	canvas.height = image.height;
	
	var workingCanvas = document.createElement('canvas');
	workingCanvas.width = image.width;
	workingCanvas.height = image.height;
	
	var subContext = canvas.getContext('2d');
	subContext.drawImage(image, 0, 0);
	var imageData = subContext.getImageData(0, 0, image.width, image.height);
	Utils.setWhiteToTransparent(subContext, imageData);

	
	this.xOffset = subtileDef.xOffset;
	this.yOffset = subtileDef.yOffset;
	this.subtileXIndex = subtileDef.subtileXIndex;
	this.subtileYIndex = subtileDef.subtileYIndex;

	var coloredSubtileCache = {};
	var coloredSubtileCount = {};
	
	this.getId = function() {
		return id;
	};
	
	this.getColoredSubtileCount = function() {
		return coloredSubtileCount;
	};
	
	this.getPixelAt = function(x, y) {
		return subContext.getImageData(x, y, 1, 1).data;
	};
	
	this.getWidth = function() {
		return image.width;
	};
	
	this.getHeight = function() {
		return image.height;
	};
	
	this.getImageData = function() {
		return imageData;
	};
	
	this.getColoredImageDataCanvas = function(rgba) {
		var coloredSubtile = coloredSubtileCache[rgba];
		
		var countObj = coloredSubtileCount[rgba];
		if(!countObj) { countObj = {'count':0, 'color': rgba}; }
		countObj['count'] = countObj['count'] + 1;
                coloredSubtileCount[rgba] = countObj;
		
		if(!coloredSubtile){
		   coloredSubtile = workingCanvas.getContext("2d").createImageData(imageData.width, imageData.height);
		   coloredSubtile.data.set(Utils.getImageDataInColor(imageData, rgba));
		   coloredSubtileCache[rgba] = coloredSubtile;
		}
	
		workingCanvas.getContext("2d").putImageData(coloredSubtile, 0, 0);
		return workingCanvas;
	};
	
	this.getImageDataURL = function() {
		return this.getColoredImageDataCanvas(0x000000FF).toDataURL();
	};
	
	this.setColor = function(rgb) {
		var rgbBytes = Utils.rgbBytes(rgb);
		var imageData = this.getImageData();
		var pixels = imageData.data;
		for(var i = 0; i < pixels.length; i += 4){
			if(pixels[i + 3] == 255) {
				pixels[i] = rgbBytes[0];
				pixels[i + 1] = rgbBytes[1];
				pixels[i + 2] = rgbBytes[2]
			}
		}
		subContext.putImageData(imageData, 0, 0);
	}
};

function Tile(tileDef, name) {
	//Overview Image
	var image = new Image();
	var canvas = document.createElement('canvas');
	var context = canvas.getContext('2d');
	
	image.onload = function() {
		context.drawImage(image, 0, 0);
	};
	
	image.src = tileDef.overviewFile;
	
	//Outline Image
	var outlineImage = $('#' + name + '-outlineImage')[0];
	var outlineCanvas = document.createElement('canvas');
	var outlineContext = outlineCanvas.getContext('2d');
	outlineContext.drawImage(outlineImage, 0, 0);
	var outlineImageData = outlineContext.getImageData(0, 0, outlineImage.width, outlineImage.height);
	Utils.setWhiteToTransparent(outlineContext, outlineImageData);
	outlineImageData = outlineContext.getImageData(0, 0, outlineImage.width, outlineImage.height);
	outlineImageData.data.set(Utils.getImageDataInColor(outlineImageData, 0x554444FF)); //color outline reddish gray
	
	//Background Image
	var backgroundImage = $('#' + name + '-backgroundImage')[0];
	var backgroundCanvas = document.createElement('canvas');
	var backgroundContext = backgroundCanvas.getContext('2d');
	backgroundContext.drawImage(backgroundImage, 0, 0);
	var backgroundImageData = backgroundContext.getImageData(0, 0, backgroundImage.width, backgroundImage.height);
	Utils.setWhiteToTransparent(backgroundContext, backgroundImageData);
	backgroundImageData = backgroundContext.getImageData(0, 0, backgroundImage.width, backgroundImage.height);
	backgroundImageData.data.set(Utils.getImageDataInColor(backgroundImageData, 0xAAAABBFF)); //color background bluish gray
	
	// The x distance before the tile overlaps itself again when drawn
	this.xRepeat = tileDef.xRepeat;
	// The y distance before the tile overlaps itself again when drawn
	this.yRepeat = tileDef.yRepeat;
	// The distance along the x axis which each new row needs to step
	this.xRowOffset = tileDef.xRowOffset;
	// The distance along the y axis which each new row needs to step
	this.yRowOffset = tileDef.yRowOffset;
	// The number of subtiles found along the x axis of a single tile
	this.xSubtileCount = tileDef.xSubtileCount;
	// The number of subtiles found along the y axis of a single tile
	this.ySubtileCount = tileDef.ySubtileCount;
	
	this.getWidth = function() {
		return backgroundImage.width;
	};
	this.getHeight = function() {
		return backgroundImage.height;
	};

	var getOutlineImageData = function() {
		return outlineImageData;
	};
	
	this.getOutline = function() {
		var outlineImageData = getOutlineImageData();
		var tempCanvas = $("<canvas>")
					    .attr("width", outlineImageData.width)
					    .attr("height", outlineImageData.height)[0];
		tempCanvas.getContext("2d").putImageData(outlineImageData, 0, 0);
		return tempCanvas;
	};
	
	var getBackgroundImageData = function() {
		return backgroundImageData;
	};
	
	this.getBackground = function() {
		var backgroundImageData = getBackgroundImageData();
		var tempCanvas = $("<canvas>")
					    .attr("width", backgroundImageData.width)
					    .attr("height", backgroundImageData.height)[0];
		tempCanvas.getContext("2d").putImageData(backgroundImageData, 0, 0);
		return tempCanvas;
	};
};

function Pattern(patternDef) {
	this.name = patternDef.name;
	this.description = patternDef.description;

	this.tile = new Tile(patternDef.tile, patternDef.name);
	this.subtiles = [];
	
	for ( var i = 0; i < patternDef.subtiles.length; i++) {
		this.subtiles[i] = new Subtile(patternDef.subtiles[i]);
	}
};

function Project(patternDef, sourceImage, canvas) {
	this.pattern = new Pattern(patternDef);
	this.sourceImage = sourceImage;
	this.canvas = canvas;
	
	this.setPattern = function(newPattern) {
		this.pattern = new Pattern(newPattern);
	}
	
	this.pointToPatternCoordinate = function(point) {
		var tile = this.pattern.tile;
		var subtiles = this.pattern.subtiles;
		
		// Because the tiles can overlap, we have to check several tiles to see
		// if the click landed in any of them. For each possible match, we test
		// if the click hit a black pixel in the corresponding subtile
		var widthInTiles = canvas.width / tile.getWidth();
		var heightInTiles = canvas.height / tile.getHeight();
		
		// for each potential tile match
		for(var yTile = 0; yTile <= heightInTiles; yTile++) {
			for(var xTile = 0; xTile <= widthInTiles; xTile++) {
				// figure out the start position for that tile
				var xTileStart = xTile * tile.xRepeat;
				var yTileStart = yTile * tile.yRepeat;
				
				// so that we can figure out where in the tile we are
				var innerX = point.x - xTileStart;
				var innerY = point.y - yTileStart;

				// step through the subtiles to find the first one which is
				// black at the inner point
				for(var i = 0; i < subtiles.length; i++) {
					var subtile = subtiles[i];
					// because of the subtile offsets, this point may not land
					// in the subtile
					if(Utils.isPointInBox(innerX, innerY, 
							subtile.xOffset, subtile.yOffset, 
							subtile.getWidth(), subtile.getHeight())) {
						var testX = innerX - subtile.xOffset;
						var testY = innerY - subtile.yOffset;
						var rgba = subtile.getPixelAt(testX, testY);
						if(Utils.isOpaque(rgba)) {
							return {'x': xTile, 'y':yTile, 'index':i}; //new PatternCoordinate(xTile, yTile, i);
						}
					}
				}
			}
		}
		
		
		return {'x': -1, 'y':-1, 'index':-1}; //new PatternCoordinate(-1, -1, -1);
	};
};

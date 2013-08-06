var cigp = new function() {
	var sourceImageFile = "";
	var patternName = "e4-1ga1614half";
	var canvas = document.getElementById('canvas');
	var context = canvas.getContext('2d');
	var offscreenCanvas = document.createElement('canvas');
	var offscreenContext = offscreenCanvas.getContext('2d');
	offscreenContext.globalCompositionOperation = "source-over";
	
	var sourceImageCtx;
	var canvasLeft = canvas.offsetLeft;
	var canvasTop = canvas.offsetTop;

	var project;

	/////////////////////////////////////////////////////////// Handlers
	
	var handleClick = function(event) {
		var canvasX = event.pageX - canvasLeft;
		var canvasY = event.pageY - canvasTop;

		var patternCoordinate = project.pointToPatternCoordinate({
			x : canvasX,
			y : canvasY
		});
		
		drawSubtile(patternCoordinate, 0xFF, context);
	};
	
	this.handleSourceFileSelect = function(evt) {
	    var files = evt.target.files; // FileList object
	    for (var i = 0, f; f = files[i]; i++) {
	      if (!f.type.match('image.*')) {
	        continue;
	      }
	      var reader = new FileReader();
	      // Closure to capture the file information.
	      reader.onload = getOnloadForSourceImage(f);
	      // Read in the image file as a data URL.
	      reader.readAsDataURL(f);
	    }
	};
	
	this.getPatternedImageDataURL = function() {
		return canvas.toDataURL();
	};
	
	var getOnloadForSourceImage = function(theFile) {
		return function(e) {
			addImageToImageResourceSection(e, 'sourceImage');
			
        	var image = new Image();
        	image.src = e.target.result;
        	image.onload = cigp.render;
        };
	};
	
	var drawPatternedSourceImage = function() {
		var image = $('#sourceImage')[0];
		var sourceImageCanvas = document.createElement('canvas');
		sourceImageCanvas.height = image.height;
		sourceImageCanvas.width = image.width;

		var sourceImageCtx = sourceImageCanvas.getContext('2d');
		sourceImageCtx.drawImage(image, 0, 0);
		var image_data = sourceImageCtx.getImageData(0, 0,  image.width, image.height);
        var image_data_array = image_data.data;
		var image_data_array_length = image_data_array.length;
		
		function animate(startPixel, numPixels) {
			var endPixel = startPixel + numPixels;
			var i;
			
		    for (i = startPixel; i < endPixel && i < image_data_array_length; i += 4){
		    	var pixel = i/4;
		    	var pixelRow = Math.floor(pixel / image.width);
		    	var pixelColumn = pixel % image.width;
		    	
		    	var tileX = Math.floor(pixelColumn / project.pattern.tile.xSubtileCount);
		    	var tileY = Math.floor(pixelRow / project.pattern.tile.ySubtileCount);
		    	var subtileIndex = pixelColumn % project.pattern.tile.xSubtileCount + 
					((pixelRow % project.pattern.tile.ySubtileCount) * project.pattern.tile.xSubtileCount);
		        
		    	drawSubtile({'x': tileX, 'y':tileY, 'index':subtileIndex}, //new PatternCoordinate(tileX,tileY,subtileIndex), 
		    			(image_data_array[i] << 24) |   //r
		    			(image_data_array[i+1] << 16) | //g
		    			(image_data_array[i+2] << 8) |  //b
		    			(image_data_array[i+3]),        //a
		    			offscreenContext
		    			);
			}
		    
		    context.save();
		    context.globalCompositionOperation = "source-over";
		    context.drawImage(offscreenCanvas, 0, 0, offscreenCanvas.width, offscreenCanvas.height);
		    context.restore();

		    if(i < image_data_array_length) {
		        requestAnimFrame(function() {
		          animate(i, numPixels);
		        });
	      };}
	    
	    animate(0, 250);
	};

	var addImageToImageResourceSection = function(e, imageName) {
		var oldImageSpan = document.getElementById('sourceImageSpan');
		if(oldImageSpan) {
			oldImageSpan.parentNode.removeChild(oldImageSpan);
		}
		var span = document.createElement('span');
		span.id = 'sourceImageSpan';
        span.innerHTML = ['<img class="thumb" src="', e.target.result,
                          '" title="' + imageName + '" id="' + imageName + '"/>'].join('');
        document.getElementById('imageResources').insertBefore(span, null);
	};

    /////////////////////////////////////////////////////////// 
	
	var setPatternName = function(name) {
		patternName = name;
	}

	var onPatternChange = function() {
		setPatternName(this.value);
		cigp.render();
	};
	
	this.render = function() {
		project.pattern = new Pattern(patterns[patternName]);

		var sourceImage = $('#sourceImage')[0];
		if(sourceImage) {
			var tile = project.pattern.tile;
			$("#canvasWidth").val((Math.ceil(sourceImage.width / tile.xSubtileCount) + 1) * tile.getWidth()); 
			$("#canvasHeight").val((Math.ceil(sourceImage.height / tile.ySubtileCount) + 1) * tile.getHeight());
		}
		
		canvas.width = $("#canvasWidth").val();
		canvas.height = $("#canvasHeight").val();
		offscreenCanvas.width = canvas.width;
		offscreenCanvas.height = canvas.height;
		
		// draw background
		context.fillStyle = "white";
		context.fillRect(0, 0, canvas.width, canvas.height);

		loadPattern();
		if(sourceImage) {
			drawPatternedSourceImage();
		}
	};
	
	function copyImageData(context, original) {
	  var rv = context.createImageData(original.width, original.height);
	  // would 
	  //   rv.data = Array.prototype.slice.call(original.data, 0);
	  // work?
	  for (var i = 0; i < original.data.length; ++i)
	    rv.data[i] = original.data[i];
	  return rv;
	};
	
	var drawSubtile = function(patternCoordinate, rgba, theContext) {
		if(patternCoordinate['x'] == -1) {
			return;
		}
		
		var tile = project.pattern.tile;
		var subtile = project.pattern.subtiles[patternCoordinate['index']];
		
		//NOTE: The following treatment of xOffsetForRow works for the "Hex" patterns, 
		// but may not be the originally intended use of the xRowOffset value.  The
		// hex patterns are the only ones I know of that use it so I have made this
		// support them at least.
		var xOffsetForRow = (patternCoordinate['y'] % (tile.ySubtileCount+1)) * tile.xRowOffset;
		var x = patternCoordinate['x'] * tile.xRepeat + subtile.xOffset - xOffsetForRow;
		var y = patternCoordinate['y'] * tile.yRepeat + subtile.yOffset;

		var toDraw = subtile.getColoredImageDataCanvas(rgba);
		theContext.drawImage(toDraw, x, y, toDraw.width, toDraw.height);
	};

	var loadPattern = function() {
		context.save();
		context.globalCompositionOperation = "source-over";
		
		var background = project.pattern.tile.getBackground();
		var backgroundPattern = context.createPattern(background, "repeat");
		context.fillStyle = backgroundPattern;
		context.fillRect(0, 0, canvas.width, canvas.height);
		
		var outline = project.pattern.tile.getOutline();
		var outlinePattern = context.createPattern(outline, "repeat");
		context.fillStyle = outlinePattern;
		context.fillRect(0, 0, canvas.width, canvas.height);
		
		context.restore();
	};
	
	var setColor = function() {
		for(var i = 0; i < project.pattern.subtiles.length; i++) {
			project.pattern.subtiles[i].setColor($("#colorPicker").val());
		}
	};
	
	this.getProject = function() {
		return project;
	};

	this.init = function() {
		//populate the drop down from the Patterns JSON
		$.each(patterns, function(i, option) {
	        $('#patternSelector').append($('<option/>').attr("value", option.name).text(option.description));
	    });
		$('#patternSelector').on("change", onPatternChange);
		
		canvas.addEventListener("click", handleClick, false);
		$("#colorButton").click(setColor);
		
		project = new Project(patterns[patternName], 0, canvas);
		cigp.render();
	};
};
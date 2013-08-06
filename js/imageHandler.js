var imageHandler = new function() {
	this.loadPatternFiles = function(patternJSON, callback) {
		var loaders = [];
		
		//Stick all of the pattern images into a <ul>
		var ul = document.createElement('ul');
		ul.id = 'patternList';
		document.getElementById('imageResources').insertBefore(ul, null);
		var patternList = $('#patternList');
		
		$.each(patterns, function(i, pattern) {
			// Each pattern gets its own <li>
			var li = document.createElement('li');
			li.id = pattern.name;
			ul.insertBefore(li, null);
			$('#' + pattern.name).attr('name', pattern.description);
			
			var tileSpan = document.createElement('span');
			tileSpan.id = pattern.name + '-tile';
			li.insertBefore(tileSpan, null);
			loaders.push(addImageToElement(tileSpan, pattern.tile.overviewFile, pattern.name + '-overviewImage'));
			loaders.push(addImageToElement(tileSpan, pattern.tile.outlineFile, pattern.name + '-outlineImage'));
			loaders.push(addImageToElement(tileSpan, pattern.tile.backgroundFile, pattern.name + '-backgroundImage'));

			var subtilesSpan = document.createElement('span');
			subtilesSpan.id = pattern.name + '-subtiles';
			li.insertBefore(subtilesSpan, null);
			
	        var patternItem = $(pattern.name);
	        $.each(pattern.subtiles, function(j, subtile) {
	        	loaders.push(addImageToElement(subtilesSpan, subtile.imageFile, subtile.id));
	        });
	    });
		
		$.when.apply(null, loaders).done(function() {
		    callback();
		});
	};
	
	var addImageToElement = function(element, imageSrc, imageId) {
		var deferred = $.Deferred();
		
		var img = document.createElement('img');
    	img.id = imageId;
    	img.onload = function() {
            deferred.resolve();
        };
    	img.src = imageSrc;
    	element.insertBefore(img, null);
    	
    	return deferred.promise();
	};
	
	this.savePatternedImage = function() {
		$("#patternedImageDialog").dialog({
			autoOpen: false,
			height: 300,
			width: 400,
			modal: true,
			close: function() {
				//
			}
		});
		
		var oldImageSpan = document.getElementById('patternedImageSpan');
		if(oldImageSpan) {
			oldImageSpan.parentNode.removeChild(oldImageSpan);
		}
		var span = document.createElement('span');
		span.id = 'patternedImageSpan';
		var imageURL = cigp.getPatternedImageDataURL();
        span.innerHTML = ['<img src="', imageURL, '" id="patternedImage"/>'].join('');
        document.getElementById('patternedImageDialog').insertBefore(span, null);
		
		$("#patternedImageDialog").dialog( "open" );
	}
};
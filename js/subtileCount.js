var subtileCount = new function() {
	this.showSubtileCount = function() {
		$("#subtileCountDialog").dialog({
			autoOpen: false,
			height: 600,
			width: 800,
			modal: true
		});
		
		var oldCountDiv = document.getElementById('subtileCountDiv');
		if(oldCountDiv) {
			oldCountDiv.parentNode.removeChild(oldCountDiv);
		}
		
		var div = document.createElement('div');
		div.id = 'subtileCountDiv';
			
		document.getElementById('subtileCountDialog').insertBefore(div, null);

		var project = cigp.getProject();
		var coloredSubtileCounts = cigp.getColoredSubtileCount();
		for(var subtileType in coloredSubtileCounts) {
			var subtileEntry = coloredSubtileCounts[subtileType];
			var subtile = subtileEntry['subtile'];
			var imageURL = subtile.getImageDataURL();
			
			var span = document.createElement('span');
			span.id = [subtile.getId(), '-subtileCountSpan'].join('');
			//var subtileData = ['<img src="', imageURL, '" id="', subtile.getId(), '-subtileCountIcon"/>', '<ul class="ringCount">'].join('');
			var subtileData = [subtileType, '<ul class="ringCount">'].join('');
			var colorCounts = subtileEntry['counts'];
			
			for(var entry in colorCounts) {
                var rgba = colorCounts[entry];
                var r = (rgba['color'] & 0xFF000000) >>> 24;
                var g = (rgba['color'] & 0x00FF0000) >>> 16;
                var b = (rgba['color'] & 0x0000FF00) >>> 8;
                var a = ((rgba['color'] & 0x000000FF) >>> 0) / 255;
			    subtileData += ['<li>', '<span style="background-color: ', 
                                            'rgba(', r, ', ', g, ', ', b, ', ', a, ')',
			                    '">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>',
			                    '<span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;',
			                    rgba['count'],
                                            '</span>', '</li>'].join('');
			}
			subtileData += '</ul>';
			span.innerHTML = subtileData;
			
			document.getElementById('subtileCountDiv').insertBefore(span, null);
		}

       
		
		$("#subtileCountDialog").dialog( "open" );
	};
}

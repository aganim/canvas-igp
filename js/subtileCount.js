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
		for(var i = 0; i < project.pattern.subtiles.length; i++) {
			var subtile = project.pattern.subtiles[i];
			var imageURL = subtile.getImageDataURL();
			
			var span = document.createElement('span');
			span.id = [subtile.getId(), '-subtileCountSpan'].join('');
			var subtileData = ['<img src="', imageURL, '" id="', subtile.getId(), '-subtileCountIcon"/>', '<ul class="ringCount">'].join('');
			var coloredSubtileCount = subtile.getColoredSubtileCount();
			
			for(var color in coloredSubtileCount){
			    subtileData += ['<li>', '<span style="background-color: #', 
			                    colorToHexString(color), 
			                    '">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>',
			                    '<span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;',
			                    coloredSubtileCount[color], '</span>',
			                    '<span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;#', 
			                    colorToHexString(color), '</span>', '</li>'].join('');
			}
			subtileData += '</ul>';
			span.innerHTML = subtileData;
			
			document.getElementById('subtileCountDiv').insertBefore(span, null);
		}

       
		
		$("#subtileCountDialog").dialog( "open" );
	};
	
	var colorToHexString = function(color)
	{
		var number = parseInt(color);
	    if (number < 0)
	    {
	    	number = 0xFFFFFFFF + number + 1;
	    }

	    return number.toString(16).toUpperCase().substring(0,6);
	};
}
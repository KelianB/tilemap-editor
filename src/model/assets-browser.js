var AssetsBrowser = function(map, type) {
   var basePath = map.assets.imageRoot;
   var elements = [];
   switch(type) {
     case AssetsBrowser.TYPE_IMAGES:
        for(var k in map.assets.images) {
          elements.push({url: getURL(map.assets.images[k]), key: k});
        }
        break;
      case AssetsBrowser.TYPE_TILESETS:
      for(var k in map.assets.tilesets) {
        elements.push({url: getURL(map.assets.tilesets[k].url), key: k});
      }
	break;
   }

  this.show = function(onElementSelected) {
  	var content = $("<span>");
  	content.html("Assets browser - " + type);
    content.append(
      $("<span>")
        .css("float", "right")
        .append($("<button>").html("Add..."))
        .click(function(){
        	// switch type and display correct add dialog
        })
    );
    
  	var imageListContainer = $("<span>");
    for(var i = 0; i < elements.length; ++i) {
      imageListContainer.append($("<img>")
        .attr("src", elements[i].url)
        .css("width", "150px")
        .css("height", "150px")
        .css("border", "2px solid white")
        .css("cursor", "pointer")
        .css("margin-left", "10px")
        .click(function(){
        	// TODO: Closure and callback with the url and key of the imgae
        	// also handle switch type
        })
      );
    }
    
    content.append($("<hr>"));
    content.append(imageListContainer);
    (new DialogBox(content, {size: {w: "40%", h: "60%"}})).show();
  };
  
  function getURL(url) {
    if(url.startsWith("http")) {
      return url; 
    }
    else {
      return config.basePath + url;
    }
  }
};

AssetsBrowser.TYPE_IMAGES = "Images";
AssetsBrowser.TYPE_TILESETS = "Tilesets";
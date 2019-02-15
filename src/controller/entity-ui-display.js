/* global $ editor Tools currentTool ENTITY_MANDATORY_ATTRIBUTES */

function EntityUIDisplay() {
    var self = this;
    
    var displayedEntity = null;
    
    // TODO Handle changes on attribute elements
    
    this.setDisplayedEntity = function(entity) {
        displayedEntity = entity;
        
        // do UI stuff
        $("#entity-property-type-name").html("<hr>Selected entity: <i>" + entity.type + "</i><ht>");
        $("#entity-properties").html("");
    
        var entityType = editor.config.entityTypes[entity.type];

        // Create elements
        for(var k in entityType) {
            var attribute = entityType[k];
            
            var displayName = k;
            switch(displayName) {
                case "w": displayName = "width"; break;
                case "h": displayName = "height"; break;
            }
            
            var inputTd = $("<td>");
            
            var tr = $("<tr>");
            tr.append($("<td>").html(displayName)).append(inputTd);
            
            if(attribute.type.startsWith("select")) {
                var select = $("<select>").attr("id", "entity-attr-" + k);
                for(var i = 0; i < attribute.values.length; i++) {
                    $("<option>").text(attribute.values[i]).appendTo(select);
                }
                inputTd.append(select);
            }
            else {
                switch(attribute.type) {
                    case "number":
                    case "text":
                        var inputElement = $("<input>").attr("id", "entity-attr-" + k);
                        if(attribute.type == "number")
                            inputElement.attr("type", "number");
                        else
                            inputElement.attr("type", "text");    

                        inputTd.append(inputElement);
                        break;
                    case "assetBrowser":
                        var inputElement = $("<button>").html("Open asset browser");
                        inputTd.append(inputElement);
                        break;
                }
            }

            tr.appendTo($("#entity-properties"));
        }
        
        
        // Set element values
        for(var k in entityType) {
            this.setUIEntityAttribute(k, entity.attributes[k]);
        }
    };

    this.buildTypeSelector = function(){
        $("#entity-type-list").html("");
        
        for(var k in editor.config.entityTypes) {
            $("#entity-type-list").append(
                $("<option>")
                    .html(k)
                    .attr("value", k)
            )
        };
        $("#entity-type-list").on("click", function() {
            var typeName = $(this).val(); 
            
            // Create the entity
            var entity = {
                type: typeName,
                attributes: {}
            };
            
            for(var attrName in editor.config.entityTypes[typeName]) {
                var attr = editor.config.entityTypes[typeName][attrName];
                
                // TODO Handle more complicated values?

                entity.attributes[attrName] = attr.default || null;
            }

            editor.setTool(Tools.ENTITY_PLACER);
            currentTool.selectedEntity = entity;

            // TODO move this in tool? tool entity selector?
            self.setDisplayedEntity(currentTool.selectedEntity);
        });
    };
    
    this.setUIEntityAttribute = function(attributeName, value) {
        // The attribute definition, as written in the config - may contain things such as {"type": "assetBrowser", "default": "..."}
        var attribute = editor.config.entityTypes[displayedEntity.type][attributeName];
        console.log(attribute)
        if(!attribute) {
            console.log(attributeName)
        }
        
        if(attribute.type.startsWith("select")) {

        }
        else {
            switch(attribute.type) {
                case "number":
                case "text":
                    $("#entity-attr-" + attributeName).val(value);
                    break;
                case "assetBrowser":

                    break;
            }
        }
    };
}
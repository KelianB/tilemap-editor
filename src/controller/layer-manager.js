/* global editor $ actionHistory ActionTypes Action currentLayer dialogs */

class LayerManager {
    constructor() {
        
    }

    createLayer() {
        actionHistory.registerAction(new Action(ActionTypes.CREATE_LAYER, {}));
    };

    moveLayer(index, direction) {
        if(index + direction >= 0 && index + direction < editor.map.layers.length) {
            let temp = editor.map.layers[index + direction];
            editor.map.layers[index + direction] = editor.map.layers[index];
            editor.map.layers[index] = temp;
            
            let one = $(".table-layer[data-layer-idx=" + index + "]"),
                two = $(".table-layer[data-layer-idx=" + (index+direction) + "]");
 
            one.animate({top: two.offset().top - one.offset().top}, 200); 
            two.animate({top: one.offset().top - two.offset().top}, 200, null, this.refreshLayerMenu);
        }
    };

    removeLayer(index) {
        if(editor.map.layers.length != 1) {
            let l = editor.map.layers[index];
            let removeLayerAction = new Action(ActionTypes.DELETE_LAYER, {layer: l, index: index});
            
            actionHistory.registerAction(removeLayerAction);
        }
    };

    refreshLayerMenu() {
        $("#editing-layers").html("");
                    
        for(let i = 0; i < editor.map.layers.length; i++) {
            let table = $("<table>").addClass("table-layer").attr("data-layer-idx", i);
            let tr = $("<tr>");
            let tdImage = $("<td>");
            let tdName = $("<td>");
            let inputName = $("<input>").attr("type", "text").attr("value", editor.map.layers[i].name);
            
            let tdDisplay = $("<td>");
            let tdMove = $("<td>");
            let tdDelete = $("<td>").css("padding-left", "0").css("color", "rgb(200, 80, 60)");
            let visibilityCheckbox = $("<input>");
           
            let upArrow = $("<span>").addClass("arrow").text("▲").click(() => {
                if(i - 1 >= 0) {
                    actionHistory.registerAction(new Action(ActionTypes.MOVE_LAYER, {index: i, direction: -1}));
                }
            });
            
            let downArrow = $("<span>").addClass("arrow").text("▼").click(() => {
                if(i + 1 < editor.map.layers.length) {
                    actionHistory.registerAction(new Action(ActionTypes.MOVE_LAYER, {index: i, direction: 1}));
                }
            });
            
            table.on("click", (e) => {
                if($(e.target).attr("type") == "checkbox" || $(e.target).attr("type") == "text" || $(e.target).hasClass("arrow"))
                    return;
                currentLayer = editor.map.layers[i];
                editor.rightMenu.tilePicker.setTileset(editor.map.layers[i].tileset)
                this.refreshLayerMenu();
            });
            
            if(editor.map.layers.length > 1) {
                tdDelete.append("✕").click(() => {
                    this.removeLayer(i);
                });
            }
            
        
            inputName.on("change", () => {
                 actionHistory.registerAction(new Action(ActionTypes.RENAME_LAYER, {layer: editor.map.layers[i], name: this.value}));
            })
        
            visibilityCheckbox
                .change((e) => {
                     actionHistory.registerAction(new Action(ActionTypes.TOGGLE_LAYER_VISIBILITY, {layer: editor.map.layers[i]}));
                })
                .attr("type", "checkbox")
                .prop("checked", editor.map.layers[i].visible)
                .appendTo(tdDisplay);  
                
            tdImage.append(
                $("<img>")
                .attr("src", editor.map.layers[i].tileset.getImageURL())
                .addClass("tileset")
                .click((e) => {
                    
                    let imageList = $("<div>").html("Select a tileset <hr>");
                    for(let j = 0; j < editor.map.tilesets.length; j++) {
                        let img = new Image();
                        img.src = editor.map.tilesets[j].getImageURL();
                        $(img).addClass("tileset-image");
                        $(img).click(() => {
                            dialogs.selectTileset.hide();
                            actionHistory.registerAction(new Action(ActionTypes.LAYER_CHANGE_TILESET, {layer: editor.map.layers[i], tileset: editor.map.tilesets[j]}));
                        });
                        imageList.append(img);
                    }
                    dialogs.selectTileset.setContent(imageList);
                    dialogs.selectTileset.setPosition(e.clientX - 200,e.clientY - 200);
                    dialogs.selectTileset.show();
                })
            );
                
            if(i != 0)
                tdMove.append(upArrow).append("<br>");
            if(i + 1 != editor.map.layers.length)
                tdMove.append(downArrow);

            if(i == editor.map.layers.indexOf(currentLayer) || !currentLayer && i == 0)
                table.addClass("selected-layer");
                
            tdName.append(inputName);
            tdImage.appendTo(tr);
            tdName.appendTo(tr);
            tdDisplay.appendTo(tr);
            tdMove.appendTo(tr);
            tdDelete.appendTo(tr);
            tr.appendTo(table);

            table.appendTo("#editing-layers");
        }
    };
};

let layerManager = new LayerManager();
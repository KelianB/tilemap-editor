/* global $ editor layerManager MapLayer currentLayer */


// "| |" means that the property is automatically added 


var ActionTypes = {
    PLACE_TILES: { // properties: layer, tiles (tiles[i].previousId is automatically retrieved),
        name: "Place tile",
        onActionCreated: function(a) {
            for(var i = 0; i < a.data.tiles.length; i++) {
                var t = a.data.tiles[i];
                t.previousId = a.data.layer.tiles[t.row][t.col].id;
            }
        },
        doAction: function(a) {
            for(var i = 0; i < a.data.tiles.length; i++) {
                var t = a.data.tiles[i];
                var mapCell = a.data.layer.tiles[t.row][t.col];
                mapCell.id = t.id;  
            }
        },
        undoAction: function(a) {
            for(var i = 0; i < a.data.tiles.length; i++) {
                var t = a.data.tiles[i];
                a.data.layer.tiles[t.row][t.col].id = t.previousId;  
            }
        }
    }, 
    
    PLACE_ENTITY: { // properties: layer, entity
     name: "Place entity",
        doAction: function(a) {a.data.layer.entities.push(a.data.entity);},
        undoAction: function(a) {a.data.layer.entities.pop();}
    },     
    DELETE_ENTITY: { // properties: layer, entity
        name: "Delete entity",
        doAction: function(a) {
            var l = a.data.layer;
            l.entities.splice(l.entities.indexOf(a.data.entity), 1);
        },
        undoAction: function(a) {
            a.data.layer.entities.push(a.data.entity);
        }
    }, 
    SET_ENTITY_ATTRIBUTE: { // properties: entity, attribute, value, |previousValue|
        name: "Set entity attribute",
        onActionCreated: function(a) {a.data.previousValue = a.data.entity.attributes[a.data.attribute];},
        doAction: function(a) {
            a.data.entity.attributes[a.data.attribute] = a.data.value;
            if(a.data.entity == editor.rightMenu.displayedEntity)
                editor.rightMenu.setUIEntityAttribute(a.data.attribute, a.data.previousValue);
        },
        undoAction: function(a) {
            a.data.entity.attributes[a.data.attribute] = a.data.previousValue;
            if(a.data.entity == editor.rightMenu.displayedEntity)
                editor.rightMenu.setUIEntityAttribute(a.data.attribute, a.data.previousValue);
        }
    }, 
    
    DELETE_LAYER: { // properties: layer, index
        name: "Delete layer",
        doAction: function(a) {
            editor.map.layers.splice(editor.map.layers.indexOf(a.data.layer), 1);
            layerManager.refreshLayerMenu(); 
        },
        undoAction: function(a) {
            // Insert layer at the right index in layers array
            editor.map.layers.splice(a.data.index, 0, a.data.layer);
            layerManager.refreshLayerMenu();
        }
    }, 
    CREATE_LAYER: { // properties:
        name: "Create layer",
        doAction: function(a) {
            var l = new MapLayer(editor.map, {});
            editor.map.layers.push(l);
            currentLayer = l;
            layerManager.refreshLayerMenu();   
        },
        undoAction: function(a) {
            editor.map.layers.pop();
            layerManager.refreshLayerMenu();
        }
    },
    RENAME_LAYER: { // properties: layer, name, |previousName|
        name: "Rename layer",
        doAction: function(a) {
            a.data.previousName = a.data.layer.name;
            a.data.layer.name = a.data.name;
            layerManager.refreshLayerMenu();
        },
        undoAction: function(a) {
            a.data.layer.name = a.data.previousName;
            layerManager.refreshLayerMenu();
        }
    },
    MOVE_LAYER: { // properties: layer, direction
        name: "Move layer",
        doAction: function(a) {
            layerManager.moveLayer(a.data.index, a.data.direction);
        },
        undoAction: function(a) {
            layerManager.moveLayer(a.data.index + a.data.direction, -a.data.direction);
        }
    },   
    LAYER_CHANGE_TILESET: {
        name: "Change layer tileset",
        doAction: function(a) {
            var l = a.data.layer;
            a.data.previousTileset = a.data.layer.tileset;
            l.tileset = a.data.tileset;
            editor.rightMenu.tilePicker.setTileset(a.data.tileset)
            layerManager.refreshLayerMenu();   
        },
        undoAction: function(a) {
            a.data.layer.tileset = a.data.previousTileset;
            editor.rightMenu.tilePicker.setTileset(a.data.layer.tileset)
            layerManager.refreshLayerMenu();
        }
    },
    SET_LAYER_SETTING: {
        name: "Set layer setting",
    },
    TOGGLE_LAYER_VISIBILITY: { // properties: layer
        name: "Toggle layer visbility",
        doAction: function(a) {
            a.data.layer.visible = !a.data.layer.visible;
            layerManager.refreshLayerMenu();
        },
        undoAction: function(a) {
            a.data.layer.visible = !a.data.layer.visible;
            layerManager.refreshLayerMenu();
        }
    }, 
    
    RESIZE_MAP_H: {  // properties: cols, |deletedCols|, |previousCols|
        name: "Resize map height",
        onActionCreated: function(a) {
            a.data.previousCols = editor.map.cols;
            a.data.deletedCols = [];
        
            if(a.data.cols < editor.map.cols) { // If we're deleting columns
                var numDeletedCols = editor.map.cols - a.data.cols; 
                for(var i = 0; i < editor.map.layers.length; i++) {
                    a.data.deletedCols[i] = [];
                    for(var c = 0; c < numDeletedCols; c++) {
                        a.data.deletedCols[i][c] = [];
                        for(var r = 0; r < editor.map.rows; r++)
                            a.data.deletedCols[i][c][r] = editor.map.layers[i].tiles[r][c + a.data.cols].id;
                    }
                }
            }
        },
        doAction: function(a) {
            editor.map.setSize(a.data.cols, editor.map.rows);
            $("#menu-settings-cols").val(a.data.cols);
        },
        undoAction: function(a) {
            editor.map.setSize(a.data.previousCols, editor.map.rows);
            $("#menu-settings-cols").val(a.data.previousCols);
            
            if(a.data.deletedCols.length != 0) { // Restore the columns that had been deleted
                var numDeletedCols = a.data.previousCols - a.data.cols; 
                for(var l = 0; l < a.data.deletedCols.length; l++) {
                    for(var r = 0; r < editor.map.rows; r++) {
                        for(var c = 0; c < numDeletedCols; c++) {
                            editor.map.layers[l].tiles[r][c + a.data.cols].id = a.data.deletedCols[l][c][r];
                        }
                    }
                }
            }
        }
    },    
    RESIZE_MAP_V: { // properties: rows, |deletedRows|, |previousRows|
        name: "Resize map width",
        onActionCreated: function(a) {
            a.data.previousRows = editor.map.rows;
            a.data.deletedRows = [];
            
            if(a.data.rows < editor.map.rows) { // If we're deleting rows
                var numDeletedRows = editor.map.rows - a.data.rows; 
                for(var i = 0; i < editor.map.layers.length; i++) {
                    a.data.deletedRows[i] = [];
                    for(var r = 0; r < numDeletedRows; r++) {
                        a.data.deletedRows[i][r] = [];
                        for(var c = 0; c < editor.map.cols; c++)
                            a.data.deletedRows[i][r][c] = editor.map.layers[i].tiles[r + a.data.rows][c].id;
                    }
                }
            }
        },
        doAction: function(a) {
            editor.map.setSize(editor.map.cols, a.data.rows);
            $("#menu-settings-rows").val(a.data.rows);
        },
        undoAction: function(a) {
            editor.map.setSize(editor.map.cols, a.data.previousRows);
            $("#menu-settings-rows").val(a.data.previousRows);
            
            if(a.data.deletedRows.length != 0) { // Restore the rows that had been deleted
                var numDeletedRows = a.data.previousRows - a.data.rows; 
                for(var l = 0; l < a.data.deletedRows.length; l++) {
                    for(var r = 0; r < numDeletedRows; r++) {
                        for(var c = 0; c < editor.map.cols; c++) {
                            editor.map.layers[l].tiles[r + a.data.rows][c].id = a.data.deletedRows[l][r][c];
                        }
                    }
                }
            }
        }
    },     

    CHANGE_IMG_ROOT: { // properties: imgRoot, |previousImgRoot|
        name: "Change image root",
        onActionCreated: function(a) {a.data.previousImgRoot = editor.map.imageRoot;},
        doAction: function(a) {
            editor.map.imageRoot = a.data.imgRoot;
            $("#menu-settings-imgroot").val(a.data.imgRoot);
        },
        undoAction: function(a) {
            editor.map.imgRoot = a.data.previousImgRoot;
            $("#menu-settings-imgroot").val(a.data.previousImgRoot);
        }
    },  
    SET_MAP_SETTING: {
        name: "Set map setting",
    },
};
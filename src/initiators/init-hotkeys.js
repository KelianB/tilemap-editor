/* global engine $ actionHistory editor currentTool dialogs DialogBox Hotkey Tools */

// Stores behavior associated with each shortcut
var hotkeys = [
    new Hotkey(90, { // CTRL-Z
        event: Hotkey.EVENT_KEY_DOWN,
        ctrlRequired: true,
        description: "Undo the last action",
        trigger: function(e) {
            actionHistory.undo();
        }
     }),
    new Hotkey(89, { // CTRL-Y
        event: Hotkey.EVENT_KEY_DOWN,
        ctrlRequired: true,
        description: "Redo the last action",
        trigger: function(e) {
            actionHistory.redo();
        }
    }),
    new Hotkey(67, { // CTRL-C
        event: Hotkey.EVENT_KEY_DOWN,
        description: "Copy the selection",
        ctrlRequired: true,
        trigger: function() {
            /*if(currentTool == Tools.TILE_SELECTOR)
               Tools.TILE_SELECTOR.copySelection();*/
        }
    }),
    new Hotkey(88, { // CTRL-X
        event: Hotkey.EVENT_KEY_DOWN,
        description: "Cut the selection",
        ctrlRequired: true,
        trigger: function() {
            if(currentTool == Tools.TILE_SELECTOR)
               Tools.TILE_SELECTOR.copySelection(true);
        }
    }),
    new Hotkey(83, { // CTRL-S
        event: Hotkey.EVENT_KEY_DOWN,
        description: "Export the map.",
        ctrlRequired: true,
        trigger: function() {
            editor.exportMap();
        }
    }),
    new Hotkey(46, { // Delete - press
        name: "Delete",
        event: Hotkey.EVENT_KEY_PRESSED,
        description: "Delete the tiles in the current selection",
        trigger: function() {
            if(currentTool == Tools.TILE_SELECTOR) {
                Tools.TILE_SELECTOR.deleteSelection();
            }
            else if(currentTool == Tools.TILE_PLACER) {
                if(Array.isArray(Tools.TILE_PLACER.tileID)) {
                    editor.rightMenu.tilePicker.setSelectedId(0);
                }
                else
                    Tools.TILE_PLACER.setHoveredTileId(false, 0);
            }
        }
    }),
    new Hotkey(46, { // Delete - hold
        event: Hotkey.EVENT_KEY_HOLD,
        trigger: function() {
            if(currentTool == Tools.TILE_PLACER && !Array.isArray(Tools.TILE_PLACER.tileID))
                Tools.TILE_PLACER.setHoveredTileId(true, 0);
        }
    }),
    new Hotkey(48, { // 1  
        event: Hotkey.EVENT_KEY_DOWN,
        description: "Toggle air placement on paste",
        trigger: function() {
            editor.replaceAir = !editor.replaceAir;
        }
    }),
    new Hotkey(49, { // 1  
        event: Hotkey.EVENT_KEY_DOWN,
        description: "Select the eraser for the current tool",
        trigger: function() {
            if(currentTool == Tools.TILE_PLACER)
                editor.rightMenu.tilePicker.setSelectedId(0);
        }
    }),
    new Hotkey(71, { // G
        event: Hotkey.EVENT_KEY_DOWN,
        description: "Toggles grid display",
        trigger: function(e) {
            editor.map.displayGrid = !editor.map.displayGrid;
        }
    }),
    new Hotkey(72, { // H
        event: Hotkey.EVENT_KEY_DOWN,
        description: "Toggles help display",
        trigger: function(e) {
            dialogs.help.toggle();
        }
    }),
    new Hotkey(66, { // B
        event: Hotkey.EVENT_KEY_DOWN,
        description: "Change the background color",
        trigger: function(e) {
            var span = $("<span>")
            span.append(
               $("<span>").html("Select a background color")
            )
            .append(
                $("<hr>")
            )
            .append(
                $("<input>")
                    .attr("id", "bg-selector-0")
                    .attr("type", "number")
                    .val(editor.bgColor[0])
            )
            .append(
                $("<input>")
                    .attr("id", "bg-selector-1")
                    .attr("type", "number")
                    .val(editor.bgColor[1])
            )
            .append(
                $("<input>")
                    .attr("id", "bg-selector-2")
                    .attr("type", "number")
                    .val(editor.bgColor[2])
            )
            .append(
                $("<hr>")
            )
            .append(
                $("<button>")
                    .html("Confirm")
                    .click(function(){
                        var arr = [$("#bg-selector-0").val(), $("#bg-selector-1").val(), $("#bg-selector-2").val()];
                        localStorage.setItem("settingBackgroundColor", JSON.stringify(arr))
                        editor.bgColor = arr;
                        dialogs.backgroundColorSelector.hide();
                    })
            )

         dialogs.backgroundColorSelector.setContent(span);
         dialogs.backgroundColorSelector.toggle();
        }
    }),
    new Hotkey(87, { // W
        event: Hotkey.EVENT_KEY_HOLD,
        name: "WASD/ZQSD",
        description: "Move the map",
        trigger: function(e) {
            editor.map.camera.setPosition(editor.map.camera.position.x, editor.map.camera.position.y - 8);
            editor.onMapCameraMoved();
        }
    }),
    new Hotkey(90, { // Z
        event: Hotkey.EVENT_KEY_HOLD,
        trigger: function(e) {
            editor.map.camera.setPosition(editor.map.camera.position.x, editor.map.camera.position.y - 8);
            editor.onMapCameraMoved();
        }
    }),
    new Hotkey(81, { // Q
        event: Hotkey.EVENT_KEY_HOLD,
        trigger: function(e) {
            editor.map.camera.setPosition(editor.map.camera.position.x - 8, editor.map.camera.position.y);
            editor.onMapCameraMoved();
        }
    }),
    new Hotkey(83, { // S
        event: Hotkey.EVENT_KEY_HOLD,
        trigger: function(e) {
            editor.map.camera.setPosition(editor.map.camera.position.x, editor.map.camera.position.y + 8);
            editor.onMapCameraMoved();
        }
    }),
    new Hotkey(65, { // A
        event: Hotkey.EVENT_KEY_HOLD,
        trigger: function(e) {
            editor.map.camera.setPosition(editor.map.camera.position.x - 8, editor.map.camera.position.y);
            editor.onMapCameraMoved();
        }
    }),
    new Hotkey(68, { // D
        event: Hotkey.EVENT_KEY_HOLD,
        trigger: function(e) {
            editor.map.camera.setPosition(editor.map.camera.position.x + 8, editor.map.camera.position.y);
            editor.onMapCameraMoved();
        }
    }),
    new Hotkey(37, { // ←
        event: Hotkey.EVENT_KEY_DOWN,
        description: "Moves the selected tile in the tile picker",
        name: "Arrows",
        trigger: function(){
            editor.rightMenu.tilePicker.setSelectedId(editor.rightMenu.tilePicker.selectedID - 1);
        }
    }), 
    new Hotkey(38, { // ↑ 
        event: Hotkey.EVENT_KEY_DOWN,
        trigger: function(){
            var tilePicker = editor.rightMenu.tilePicker;
            if(tilePicker.selectedID > tilePicker.tileset.cols)
                tilePicker.setSelectedId(tilePicker.selectedID - tilePicker.tileset.cols);
        }
    }), 
    new Hotkey(39, { // →
        event: Hotkey.EVENT_KEY_DOWN,
        trigger: function(){
            editor.rightMenu.tilePicker.setSelectedId(editor.rightMenu.tilePicker.selectedID + 1);
        }
    }), 
    new Hotkey(40, { // ↓
        event: Hotkey.EVENT_KEY_DOWN,
        trigger: function(){
            var tilePicker = editor.rightMenu.tilePicker;
             if(tilePicker.selectedID < tilePicker.tileset.cols * (tilePicker.tileset.rows - 1))
                tilePicker.setSelectedId(tilePicker.selectedID + tilePicker.tileset.cols);
        }
    }), 
    new Hotkey(101, { // 5
        event: Hotkey.EVENT_KEY_DOWN,
        description: "Toggle the debug menu",
        name: "NumPad 5",
        trigger: function() {
            engine.Debug.enabled = !engine.Debug.enabled;
        }
    }),
    new Hotkey(16, { // Shift
        event: Hotkey.EVENT_KEY_DOWN,
        description: "Allows multi-tile placement, if used with the tile placement tool",
        name: "Shift",
        shiftRequired: true,
        trigger: function() {
            if(currentTool == Tools.TILE_PLACER)
                editor.setTool(Tools.TILE_SELECTOR);
            else if(currentTool == Tools.TILE_SELECTOR)
                editor.setTool(Tools.TILE_PLACER);
        }
    }),
    new Hotkey(32, { // Space
        event: Hotkey.EVENT_KEY_DOWN,
        name: "Space",
        description: "Reset camera position and scaling",
        trigger: function(e) {
            editor.map.camera.setTargetScaling(1); 
            editor.map.camera.setTargetPosition(0, 0);
        }
    }),
    new Hotkey(66, { // B
        ctrlRequired: true,
        event: Hotkey.EVENT_KEY_DOWN,
        description: "Upload current map to Orikaru. Require privileges",
        trigger: function(e) {
            $.post("https://orikaru.net/resources/logic/php/ajax/map-editor.php", {action: "set-global-map", data: editor.getMapExportData(true)}, function(d){
                console.log(d);
            });
        }
    }),
    new Hotkey(78, {
        description: "Display the asset browser images",
        event: Hotkey.EVENT_KEY_DOWN,
        trigger: function(){
            editor.imageBrowser.show();
        }
    }),
    new Hotkey(77, {
        description: "Display the asset browser tileset",
        event: Hotkey.EVENT_KEY_DOWN,
        trigger: function(){
            editor.tilesetBrowser.show();
        }
    }),
    new Hotkey(70, { // F
        event: Hotkey.EVENT_KEY_DOWN,
        description: "Toggle the fill tool",
        name: "F",
        trigger: function() {
            if(currentTool == Tools.TILE_FILLER)
                editor.setTool(Tools.TILE_PLACER);
            else
                editor.setTool(Tools.TILE_FILLER);
        }
    }),
];
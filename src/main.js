/* global $ Engine MenuState EditorState */

/* TODO dragon
    Support other position in tilemap (make view.x and view.y work)

    Bugs:

    Misc:
        Dont save to localstorage all actions (maybe exclude merged actions?)
        Right click selection?
        Implement snap to grid for ENTITY_PLACER
        Add events for entities elements
        Add button to import config
        Implement tool icons?
    Tiles:
        Shortcuts to delete selected tiles
        Fill tool
        Randomize tool
    Entities:
        Select entity
            Change entity properties
        Delete entity
        Resize entity
        Pick entity
        Avoid entity placement outside map
    Map:
        Save and load multiples map
        Custom attributes for a map
        Add/remove tileset images from URL/link
        Add/remove images from URL/link
    Layers:
        Custom attributes for a layer
        Shortcut to switch layer (page up / page down?)

    -> entity selector
        -> on entity click
            -> display entity properties
            -> (delete, move, resize)

    ✓
*/


let app = Engine;
let rm;
let editor, menu;

$("document").ready(function() {
    $("#startup-loading").html("Loading engine modules...");

    let cfg = {
    	root: "../blapika-game-framework/src/",
        updateFrequency: 100,
        documentTitle: "Map Editor V2",
        viewport: $("#left-canvas")[0],
        width: 1600,
        height: 1000,
        autoScaling: true,

        loadModules: ["camera", "debug", "resource-manager", "tilemap"],
        loadScripts: [
	        "src/utils.js",
	        "src/libs/lz-string.min.js",

	        "src/model/hotkey.js",
	        "src/model/action-history.js",
	        "src/model/action.js",
	        "src/model/tool.js",
	        "src/model/assets-browser.js",
	        "src/model/dialog-box.js",

	        "src/initiators/init-hotkeys.js",
	        "src/initiators/init-dialogs.js",
	        "src/initiators/init-actiontypes.js",
	        "src/initiators/init-tools.js",

	        "src/controller/layer-manager.js",
	        "src/controller/entity-ui-display.js",
	        "src/controller/right-menu.js",
	        "src/controller/tile-picker.js",

	        "src/states/menu.js",
	        "src/states/editor.js",
        ],
    	onReady: () => {
	        rm = Engine.resourceManager;
	        Engine.debug.enabled = false;

	        // Create states
	        menu = new MenuState();
	        editor = new EditorState();

	        app.setState(menu);

	        /*rm.addToQueue({key: "testimage1", type: rm.types.IMAGE, url: "http://i.imgur.com/W8Z3NvQ.png"});
	        //rm.addToQueue({key: "music_maintheme", type: rm.types.SOUND, url: "http://orikaru.net/standalone/ratascape/files/audio_rollMusic.mp3"});

	        rm.loadResource({key: "loadingcolin", type: rm.types.IMAGE, url: "http://i.imgur.com/cumEuPO.png", onLoaded: function() {
	            rm.loadQueue({
	               onLoaded: function() {
	                    console.log("Finished loading.")
	               },
	            });
	        }});*/
	    }
    };

    let ctrlDown = false;
    let ctrlKey = 17, vKey = 86, cKey = 67, zKey = 90, sKey = 83;

    // Prevent CTRL-Z in input
    document.body.onkeydown = (e) => {
        if($("input:focus").length == 0) {
            if(e.keyCode == ctrlKey || e.keyCode == 91) {
                ctrlDown = true;
            }
            if((ctrlDown && e.keyCode == zKey) || (ctrlDown && e.keyCode == vKey) || (ctrlDown && e.keyCode == cKey) || (ctrlDown && e.keyCode == sKey)) {
                e.preventDefault();
                return false;
            }
        }
    };
    document.body.onkeyup = (e) => {
        if($("input:focus").length == 0) {
            if(e.keyCode == ctrlKey || e.keyCode == 91) {
                ctrlDown = false;
            }
        }
    };

    // Prevent right menu scroll when mouse hover canvas
    let mouseOnTilePicker = false;
    $("#tilepicker-canvas").mouseenter(() => {mouseOnTilePicker = true;});
    $("#tilepicker-canvas").mouseleave(() => {mouseOnTilePicker = false;});
    $("#right-menu").on("mousewheel", (e) => {
        if(mouseOnTilePicker)
            e.preventDefault();
    });

    app.init(cfg);
});

/* global $ localStorage Engine app menu ActionHistory Tools rm hotkeys initRightMenu LZString download */

var AUTO_SAVING_INTERVAL = 10e3; // Delay between each export to the local storage, in ms.
var ENTITY_MANDATORY_ATTRIBUTES = [
    {name: "x", obj: {"type": "number", "default": 0}}, 
    {name: "y", obj: {"type": "number", "default": 0}},
    {name: "w", obj: {"type": "number", "default": 32}},
    {name: "h", obj: {"type": "number", "default": 32}}
];

var currentLayer;
var currentTool;
var actionHistory;

class EditorState extends Engine.State {
    constructor() {
        super();
        
        this.map = null;
        this.config = null;
        this.replaceAir = true;
    
        this.camera = new Engine.Camera();
        var bgColor = localStorage.getItem("settingBackgroundColor");
    
        if(bgColor !== null) {
            this.bgColor = JSON.parse(bgColor);
        }
        else {
            this.bgColor = [100, 160, 200];
        }
        
        // Handle saving to localStorage
        var hasChanged = false;
        actionHistory = new ActionHistory();
        
        let self = this;
        function saveToLocalStorage() {
            if(hasChanged)
                localStorage.setItem("lastMap", self.getMapExportData(true));
            hasChanged = false;
        }
        actionHistory.onActionDone = function(a) {hasChanged = true;};
        actionHistory.onActionUndone = function(a) {hasChanged = true;};
        
        setInterval(saveToLocalStorage, AUTO_SAVING_INTERVAL);
        $(window).on("beforeunload", saveToLocalStorage);
        
        
        // Store middle mousedown location so we can check on mouseup if the user is dragging or simply clicking
        var lastMiddleDownLocation = {};
        
        this.setEventListener(new Engine.EventListener({
            onMouseDown: (button) =>  {
                currentTool.onMouseDown(button);
                
                if(button == 2) { // Middle-click
                    lastMiddleDownLocation = {x: app.mouse.x, y: app.mouse.y};
                }    
                
            },
            onMouseUp: (button) => {
                currentTool.onMouseUp(button);
                
                if(button == 2 && lastMiddleDownLocation) {
                    var distanceSquared = Math.pow(app.mouse.x - lastMiddleDownLocation.x, 2) + Math.pow(app.mouse.y - lastMiddleDownLocation.y, 2);
      
                    if(distanceSquared < 9) {
                        if(currentTool == Tools.TILE_PLACER) { // Pick hovered tile id
                            var cell = editor.map.canvasPosToCell(app.mouse);
                            var id = currentLayer.tiles[cell.row][cell.col].id;
                            editor.rightMenu.tilePicker.setSelectedId(id);
                        }
                        else if(currentTool == Tools.TILE_SELECTOR) {  // Discard selection on middle-click (not dragged)     
                            if(Tools.TILE_SELECTOR.selectingTiles)
                                Tools.TILE_SELECTOR.copySelection();
                        }
                        else if(currentTool == Tools.ENTITY_PLACER) { // Pick a copy of the hovered entity
                            var pos = editor.map.canvasPosToMapPos(app.mouse);
                            for(var i = 0; i < currentLayer.entities.length; i++) {
                                var en = currentLayer.entities[i];
                                if(pos.x >= en.attributes.x && pos.x < en.attributes.x + en.attributes.w &&
                                   pos.y >= en.attributes.y && pos.y < en.attributes.y + en.attributes.h) {
                                    Tools.ENTITY_PLACER.selectedEntity = JSON.parse(JSON.stringify(en)); 
                                    return;
                                }
                            }
                        }
                    }
                }
            },
            onMouseMove: (mouse, previousPos) => {
                // Map camera movement
                if(mouse.pressed["2"])
                    this.camera.setPosition(this.camera.position.x + previousPos.x - mouse.x, this.camera.position.y + previousPos.y - mouse.y);
                
                currentTool.onMouseMove();
            },
            onKeyDown: (keyCode, e) => {},
            onKeyUp: (keyCode, e) => {},
            onWheel: (delta) => {
                this.camera.setScaling(this.camera.scaling - delta * 1e-3, app.mouse);
            }
        }));
        
        // Avoid context menu when dragging from canvas to right-menu
        var preventNextContextMenu = false;
        var holdingRightClick = false;
        document.body.onmousedown = function(e) { 
            if(e.button == 2) holdingRightClick = true;
        };
        document.body.onmouseup = function(e) { 
            if(e.button == 2) holdingRightClick = false;
        };
        var leaveTask = function() {
            if(holdingRightClick) preventNextContextMenu = true;
        };
        $("#left-canvas").mouseleave(leaveTask);
        $("#tilepicker-canvas").mouseleave(leaveTask);
        $("#right-menu").on("contextmenu", function(e) {
            if(preventNextContextMenu) {
                e.preventDefault();
                preventNextContextMenu = false;
            }
        });
            
        this.setTool(Tools.TILE_PLACER);
        currentTool.tileID = 1;
    }
    
    onEnter(previousState) {
        super.onEnter(previousState);

        this.imageBrowser = new AssetsBrowser(this.map, AssetsBrowser.TYPE_IMAGES);
        this.tilesetBrowser = new AssetsBrowser(this.map, AssetsBrowser.TYPE_TILESETS);
        // Reset things when we leave the canvas
        $(app.canvas).mouseleave(() => {
            for(let k in app.mouse.pressed) {
                this.eventListener.onMouseUp(k);
                app.mouse.pressed[k] = false;
            }
           /* for(var k in app.keysPressed) {
                if(app.keyPressed) {
                    editor.eventListener.onKeyUp(k);
                    app.keyPressed[k] = false;
                }
            }

            for(var k in app.mouse.pressed) {
                editor.eventListener.onMouseUp(k);
                app.mouse.pressed[k] = false;
            }*/
        });
    
        if(previousState == menu) {
            if(!this.map)
                console.error("Cannot enter editing state without defining a map.")
            
            $("#startup-import").fadeOut();
            $("#startup-create").fadeOut();
        	$("#loading").fadeIn();
        	
        	$("#right-menu").attr("data-state", "editing");
            $("#startup-controls").fadeOut(200);
        
            setTimeout(function() {
                $("#editing-controls").fadeIn(100);
                
                /*setDefaults(config.defaults_input_values);
                tilepicker.resizeCanvas();*/
            }, 700);
        }
        
        this.map.setCamera(this.camera);
        this.map.displayGrid = true;
        
        this.rightMenu = initRightMenu();
        this.rightMenu.setValuesFromMap(this.map);
        currentLayer = this.map.layers[0];
        this.rightMenu.tilePicker.setTileset(currentLayer.tileset);
        
        $.getJSON("config/editor-config.json", (result) => {
            this.config = result;
            // TODO if at some point we add an export map feature, adding the mandatory attributes to the config automatically might be a problem
            for(let typeName in this.config.entityTypes) {
                var type = this.config.entityTypes[typeName];
                for(var i = 0; i < ENTITY_MANDATORY_ATTRIBUTES.length; ++i) {
                    var attr = ENTITY_MANDATORY_ATTRIBUTES[i];
                    type[attr.name] = type[attr.name] || attr.obj;
                }
            }
            this.rightMenu.entityUIDisplay.buildTypeSelector();
        });
        
        // Temporary entity renderer
        function renderEntity(en, ctx) {
            // TODO: Draw the lined dashed only on tool preview
            ctx.setLineDash([5]);
            ctx.strokeStyle = "white";
            ctx.lineWidth = 2;
            var offset = Math.sin(app.tick * 0.1) ;
            ctx.strokeRect(en.attributes.x - offset, en.attributes.y - offset, en.attributes.w + 2 *offset, en.attributes.h + 2 * offset);
            if(en.attributes.image) {
                if(rm.getImage(en.attributes.image))
                    ctx.drawImage(rm.getImage(en.attributes.image), en.attributes.x, en.attributes.y, en.attributes.w, en.attributes.h);
            }
            else {
                ctx.fillStyle = "rgba(180, 180, 60, 0.5)";
                ctx.fillRect(en.attributes.x, en.attributes.y, en.attributes.w, en.attributes.h);
                ctx.fillStyle = "white";
                ctx.textAlign = "center";
                ctx.font = "10px Consolas";
                ctx.fillText(en.type, en.attributes.x + en.attributes.w / 2, en.attributes.y + en.attributes.h / 2 + 3)
            }
            ctx.setLineDash([]);
        }
        
        this.map.onLayerRendered((layerIndex, ctx) => {
            var l = this.map.layers[layerIndex];
            for(let i = 0; i < l.entities.length; i++) {
                let en  = l.entities[i];
                renderEntity(en, ctx)
            }
            
            if(currentTool == Tools.ENTITY_PLACER && l == currentLayer && currentTool.selectedEntity) {
                //console.log(currentTool.selectedEntity.attributes)
                renderEntity(currentTool.selectedEntity, ctx);
            }
        });
        
        for(var i = 0; i < hotkeys.length; i++)
            hotkeys[i].addEventListener();
    };
    
    onLeave() {
        super.onLeave();
        for(var i = 0; i < hotkeys.length; i++)
            hotkeys[i].removeEventListener();
    };
    
    render(ctx) {
        super.render(ctx);
        
        this.rightMenu.tilePicker.render();
            
        ctx.fillStyle = "rgb("+this.bgColor[0]+", "+this.bgColor[1]+", "+this.bgColor[2]+")";
        ctx.fillRect(0, 0, app.width, app.height);

        this.map.render(ctx);
        currentTool.customToolDraw(ctx);
        
        ctx.save();
            this.map.applyTransforms(ctx);
            ctx.strokeStyle = "rgb(0, 0, 0)";
            ctx.lineWidth = 2;
            ctx.strokeRect(0, 0, this.map.width, this.map.height);
        ctx.restore();

        Engine.debug.addLine("Entity count", currentLayer.entities.length);     
    };
    
    update() {
        super.update();
        // IMPORTANT : UPDATE CAMERA BEFORE MAP TO AVOID SCALING ARTIFACTS
        this.camera.update();
        this.map.update();  
        
        this.rightMenu.tilePicker.update();
        
        
        for(var i = 0; i < hotkeys.length; ++i) {
            hotkeys[i].update(app.keysPressed);
           /*if(hotkeys[i].) {
               
           }*/
        }
    };
    
    getEmptyMap(onMapLoaded) {
        $.getJSON("res/maps/empty-map.json", function(data) {
            onMapLoaded(data);
        });
    };

    setTool(tool) {
        $("#current-tool").html(tool.name);
        currentTool = tool;
        tool.onToolSelected();
    };
    
    getMapExportData(applyCompression) {
        var data = {};
        data.name = this.map.name;
        data.cols = this.map.cols;
        data.rows = this.map.rows;
        data.customAttributes = this.map.customAttributes;
        data.assets = this.map.assets;
        
        data.layers = []; 
        
        for(var i = 0; i < this.map.layers.length; i++) {
            var mapLayer = this.map.layers[i];
            
            var l = {
                name: mapLayer.name,
                tileset: mapLayer.tileset.name,
                visible: mapLayer.visible,
                customAttributes: {},
                entities: mapLayer.entities,
                tiles: []
            };
            
            for(var r = 0; r < mapLayer.tiles.length; r++) {
                l.tiles[r] = [];
                for(var c = 0; c < mapLayer.tiles[r].length; c++)
                    l.tiles[r][c] = mapLayer.tiles[r][c].id;
            }

            data.layers.push(l);
        }
        if(!applyCompression) {
            return data;
        }
        else {
            return LZString.compressToBase64(JSON.stringify(data));
        }
    };
    
    exportMap()  {
        var mapData = this.getMapExportData(true);
        download((mapData.name || "map") + ".bpm", mapData);
    };
    
    // Called when the user moves the map camera using the WASD/ZQSD keys
    onMapCameraMoved() {
        if(currentTool == Tools.TILE_PLACER && app.mouse.pressed["1"])
            currentTool.placeCurrentTiles(true);
        if(currentTool == Tools.TILE_SELECTOR)
            currentTool.refreshSelection();
    };
    
}
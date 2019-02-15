/* global Tool editor app actionHistory currentLayer Action ActionTypes */

let Tools = {
    TILE_SELECTOR: new Tool("tile selector", "icone_trop_cool.png", {
        onToolSelected: function() {
            this.beginNewSelection();
        },
        refreshSelection: function() {
            let cell = editor.map.canvasPosToCell(app.mouse)
            this.selectionArea.w = Math.abs(this.selectionStart.col - cell.col) + 1;
            this.selectionArea.h = Math.abs(this.selectionStart.row - cell.row) + 1;
            this.selectionArea.col = cell.col > this.selectionStart.col ? this.selectionStart.col : cell.col;
            this.selectionArea.row = cell.row > this.selectionStart.row ? this.selectionStart.row : cell.row;
        },
        onMouseMove: function() {
            if(this.selectingTiles)
                this.refreshSelection();
        },
        onMouseDown: function(button) {
            if(button == 1 && this.selectingTiles) {
                this.selectingTiles = false;

                if(Array.isArray(Tools.TILE_PLACER.tileID)) {
                    // TODO Support placing a copied chunk in a selection
                }
                else {
                    let tiles = [];
                    for(let r = this.selectionArea.row; r < this.selectionArea.row + this.selectionArea.h; r++) {
                        for(let c = this.selectionArea.col; c < this.selectionArea.col + this.selectionArea.w; c++)
                            tiles.push({row: r, col: c, id: Tools.TILE_PLACER.tileID});
                    }

                    actionHistory.registerAction(new Action(ActionTypes.PLACE_TILES, {
                        layer: currentLayer,
                        tiles: tiles
                    }));
                }
                editor.setTool(Tools.TILE_PLACER);
            }
            else if(button == 3)
                this.rightClickLocation = {x: app.mouse.x, y: app.mouse.y};
        },
        onMouseUp: function(button, e) {
            // Replace selected tiles with zeros if right-clicking (but not dragging)
            if(button == 3 && this.selectingTiles && this.rightClickLocation) {
                let distanceSquared = Math.pow(this.rightClickLocation.x - app.mouse.x, 2) + Math.pow(this.rightClickLocation.y - app.mouse.y, 2);
                if(distanceSquared < 9) {
                    this.deleteSelection();
                    this.cancelSelection();
                }
            }
        },
        customToolDraw: function(ctx) {
            if(this.selectingTiles) {
                ctx.save();
                    editor.map.applyTransforms(ctx);
                    ctx.lineWidth = 2;
                    ctx.globalAlpha = 0.4;
                    ctx.fillStyle = "rgb(60, 140, 200)";
                    ctx.fillRect(this.selectionArea.col * editor.map.tileSize, this.selectionArea.row * editor.map.tileSize, this.selectionArea.w * editor.map.tileSize, this.selectionArea.h * editor.map.tileSize)

                ctx.restore();
            }
        },
        beginNewSelection: function() {
            this.selectingTiles = true;
            this.selectionStart = editor.map.canvasPosToCell(app.mouse);
            this.selectionArea = {col: 0, row: 0, w: 0, h: 0};
            this.onMouseMove();
        },
        copySelection: function(cut) {
            this.selectingTiles = false;

            let ids = [];
            for(let r = 0; r < this.selectionArea.h; r++) {
                ids[r] = [];
                for(let c = 0; c < this.selectionArea.w; c++) {
                    ids[r][c] = currentLayer.tiles[this.selectionArea.row + r][this.selectionArea.col + c].id;
                }
            }
            Tools.TILE_PLACER.preCopyID = Array.isArray(Tools.TILE_PLACER.tileID) ? 0 : Tools.TILE_PLACER.tileID;
            Tools.TILE_PLACER.tileID = ids;

            let tiles = [];
            if(cut) {
                for(let r = 0; r < ids.length; ++r) {
                    for(let c = 0; c < ids[r].length; ++c) {
                        tiles.push({row: this.selectionArea.row + r, col: this.selectionArea.col + c, id: 0});
                    }
                }

                actionHistory.registerAction(new Action(ActionTypes.PLACE_TILES, {
                    layer: currentLayer,
                    tiles: tiles
                }));
            }
            editor.setTool(Tools.TILE_PLACER);
        },
        cancelSelection: function() {
            this.selectingTiles = false;
            editor.setTool(Tools.TILE_PLACER);
        },
        deleteSelection: function() {
            let tiles = [];
            for(let r = this.selectionArea.row; r < this.selectionArea.row + this.selectionArea.h; r++) {
                for(let c = this.selectionArea.col; c < this.selectionArea.col + this.selectionArea.w; c++)
                    tiles.push({row: r, col: c, id: 0});
            }

            actionHistory.registerAction(new Action(ActionTypes.PLACE_TILES, {
                layer: currentLayer,
                tiles: tiles
            }));
            editor.setTool(Tools.TILE_PLACER);
        }
    }),

    TILE_PLACER: new Tool("tile placer", "icone_trop_cool2.png", {
        onMouseDown: function(button) {
            if(button == 1) {
                this.placeCurrentTiles(false);
            }
            else if(button == 3) { // Support erasing a single tile with right-click
                this.rightClickLocation = {x: app.mouse.x, y: app.mouse.y};
                if(!Array.isArray(this.tileID))
                    this.setHoveredTileId(false, 0);
            }
        },
        onMouseUp: function(button) {
            // Discard copied tiles if right-clicking (but not dragging)
            if(button == 3 && this.rightClickLocation && Array.isArray(this.tileID)) {
                let distanceSquared = Math.pow(this.rightClickLocation.x - app.mouse.x, 2) + Math.pow(this.rightClickLocation.y - app.mouse.y, 2);
                if(distanceSquared < 16)
                    this.tileID = this.preCopyID;
            }
        },
        onMouseMove: function() {
            if(app.mouse.pressed["1"])
                this.placeCurrentTiles(true);
            else if(app.mouse.pressed["3"] && !Array.isArray(this.tileID))
                this.setHoveredTileId(true, 0);
        },
        placeCurrentTiles: function(merge) {
            let cell = editor.map.canvasPosToCell(app.mouse);

            let singleTilePlacement = !Array.isArray(this.tileID);
            let ids = singleTilePlacement ? [[this.tileID]] : this.tileID;

            let cells = [];
            for(let r = 0; r < ids.length; r++) {
                for(let c = 0; c < ids[r].length; c++) {
                    let tCell = {row: cell.row + r, col: cell.col + c};
                    if(this.canPlaceTile(tCell, ids[r][c])) {
                        if(ids[r][c] != 0 || editor.replaceAir || singleTilePlacement) {
                            tCell.id = ids[r][c];
                            cells.push(tCell);
                        }
                    }
                }
            }

            let action = new Action(ActionTypes.PLACE_TILES, {
                layer: currentLayer,
                tiles: cells
            });

            if(merge) actionHistory.mergeWithLastAction(action);
            else actionHistory.registerAction(action);

        },
        setHoveredTileId: function(merge, id) {
            let cell = editor.map.canvasPosToCell(app.mouse);

            let action = new Action(ActionTypes.PLACE_TILES, {
                layer: currentLayer,
                tiles: [{row: cell.row, col: cell.col, id: id}]
            });

            if(this.canPlaceTile(cell, id)) {
                if(merge) actionHistory.mergeWithLastAction(action);
                else actionHistory.registerAction(action);
            }
        },
        customToolDraw: function(ctx) {
            let cell = editor.map.canvasPosToCell(app.mouse);

                ctx.save();
                editor.map.applyTransforms(ctx);
                ctx.lineWidth = 2;

                let offset = Math.sin(app.tick * 0.1) ;
                //  offset = 0;
                /*ctx.fillStyle = "rgba(40, 40, 40, 0.1)";
                ctx.fillRect(0, cell.row * editor.map.tileSize, editor.map.width * editor.map.tileSize, editor.map.tileSize);
                ctx.fillRect(cell.col * editor.map.tileSize, 0, editor.map.tileSize, editor.map.height * editor.map.tileSize);*/

                let ids = Array.isArray(this.tileID) ? this.tileID : [[this.tileID]];

                ctx.globalAlpha = 0.5;
                for(let r = 0; r < ids.length; ++r) {
                    for(let c = 0; c < ids[r].length; ++c) {
                        let tilesetPos = currentLayer.tileset.indexToPosition(ids[r][c]);
                        if(ids[r][c] == 0)
                            continue;
                        ctx.drawImage(currentLayer.tileset.getImage(),
                            tilesetPos.x, tilesetPos.y,
                            currentLayer.tileset.tileSize, currentLayer.tileset.tileSize,
                            (c + cell.col) * editor.map.tileSize, (r + cell.row) * editor.map.tileSize,
                            editor.map.tileSize, editor.map.tileSize
                        );
                    }

                }
                ctx.globalAlpha = 1;
                ctx.strokeStyle = "white";
                ctx.strokeRect(cell.col * editor.map.tileSize - offset, cell.row * editor.map.tileSize - offset, ids[0].length * editor.map.tileSize + 2 * offset, ids.length * editor.map.tileSize + 2 * offset);

            ctx.restore();
       },
       canPlaceTile: function(cell, id) {
            return currentLayer && cell.row >= 0 && cell.col >= 0 && cell.row < editor.map.rows && cell.col < editor.map.cols
                    && currentLayer.tiles[cell.row][cell.col].id != id;
        }
    }),

    ENTITY_PLACER: new Tool("entity placer", "icone.png", {
        onMouseDown: function(button) {
            if(button == 1) {
                let placeEntityAction = new Action(ActionTypes.PLACE_ENTITY, {
                    layer: currentLayer,
                    entity: JSON.parse(JSON.stringify(this.selectedEntity))
                });
                actionHistory.registerAction(placeEntityAction);
            }
        },
        onMouseMove: function() {
            if(this.selectedEntity) {
                let pos = editor.map.canvasPosToMapPos(app.mouse);
                pos.x = Math.round(pos.x);
                pos.y = Math.round(pos.y);

                this.selectedEntity.attributes.x = pos.x;
                this.selectedEntity.attributes.y = pos.y;

                editor.rightMenu.entityUIDisplay.setUIEntityAttribute("x", pos.x);
                editor.rightMenu.entityUIDisplay.setUIEntityAttribute("y", pos.y);
            }
        },
        customToolDraw: function(ctx) {
            /*ctx.save();
            editor.map.applyTransforms(ctx);

            if(this.selectedEntity.attribute.image) {

            }
            let offset = Math.sin(app.tick * 0.1) * 1;

            ctx.globalAlpha = 1;

            ctx.restore();*/
        },
    }),

    TILE_FILLER: new Tool("tile filler", "icone.png", {
        onMouseDown: function(button) {
            if(button == 1) {
                let idToPlace = Tools.TILE_PLACER.tileID;
                let cell = editor.map.canvasPosToCell(app.mouse);
                let clickId = currentLayer.tiles[cell.row][cell.col].id;

                let done = new Array(editor.map.rows);
                for(let r = 0; r < editor.map.rows; r++) {
                    done[r] = [];
                    for(let c = 0; c < editor.map.cols; c++)
                        done[r][c] = false;
                }

                let cells = [];
                function fillIteration(x, y) {
                    if (currentLayer.tiles[y][x].id != clickId || done[y][x]) return;

                    done[y][x] = true;
                    cells.push({row: y, col: x, id: idToPlace});

                    if(x > 0) fillIteration(x-1, y);
                    if(x < editor.map.cols - 1) fillIteration(x+1, y);
                    if(y > 0) fillIteration(x, y-1);
                    if(y < editor.map.rows - 1) fillIteration(x, y+1);
                }
                fillIteration(cell.col, cell.row);

                actionHistory.registerAction(new Action(ActionTypes.PLACE_TILES, {
                    layer: currentLayer,
                    tiles: cells
                }));
            }
        },
        customToolDraw: function(ctx) {
            let cell = editor.map.canvasPosToCell(app.mouse);

                ctx.save();
                editor.map.applyTransforms(ctx);
                ctx.lineWidth = 2;

                let offset = Math.sin(app.tick * 0.1) ;

                let ids = Array.isArray(Tools.TILE_PLACER.tileID) ? Tools.TILE_PLACER.tileID : [[Tools.TILE_PLACER.tileID]];

                ctx.globalAlpha = 0.5;
                for(let r = 0; r < ids.length; ++r) {
                    for(let c = 0; c < ids[r].length; ++c) {
                        let tilesetPos = currentLayer.tileset.indexToPosition(ids[r][c]);
                        if(ids[r][c] == 0)
                            continue;
                        ctx.drawImage(currentLayer.tileset.getImage(),
                            tilesetPos.x, tilesetPos.y,
                            currentLayer.tileset.tileSize, currentLayer.tileset.tileSize,
                            (c + cell.col) * editor.map.tileSize, (r + cell.row) * editor.map.tileSize,
                            editor.map.tileSize, editor.map.tileSize
                        );
                    }

                }
                ctx.globalAlpha = 1;
                ctx.strokeStyle = "white";
                ctx.strokeRect(cell.col * editor.map.tileSize - offset, cell.row * editor.map.tileSize - offset, ids[0].length * editor.map.tileSize + 2 * offset, ids.length * editor.map.tileSize + 2 * offset);

            ctx.restore();
        }
    })
};

/* global $ Engine editor currentTool Tools */

function TilePicker(canvasSelector) {
    var self = this;

    this.canvas = $(canvasSelector)[0];
    this.ctx = this.canvas.getContext("2d");
    this.camera = new Engine.Camera();
    
    var draggingMiddle = false, draggingRight = false;
    var mousePos = {x: 0, y: 0};
    
    this.mouse = {x: 0, y: 0};

    this.hoveredID = -1;
    this.selectedID = 1;

    this.tileSize = 0;
    
    this.canvas.oncontextmenu = function(e) {e.preventDefault()};
    this.canvas.onmousedown = function(e) {
        if(e.button == 0 && self.hoveredID != -1) {
            self.selectedID = self.hoveredID;
            if(currentTool != Tools.TILE_FILLER)
                editor.setTool(Tools.TILE_PLACER);
            Tools.TILE_PLACER.tileID = self.selectedID;
        }
        if(e.button == 1)
            draggingMiddle = true;
        if(e.button == 2)
            draggingRight = true;
    };
    this.canvas.onmouseup = function(e) {
        if(e.button == 1)
            draggingMiddle = false;
        if(e.button == 2)
            draggingRight = false;
    };
    this.canvas.onmouseleave = function() {
        draggingMiddle = false;
        draggingRight = false;
    };
    this.canvas.onmousewheel = function(e) {
        var wheelDelta = e.wheelDelta ? e.deltaY : (e.deltaY * 100 / 3);
        self.camera.setScaling(self.camera.scaling - wheelDelta*1e-3, mousePos);
    };
    this.canvas.onmousemove = function(e) {
        var rect = self.canvas.getBoundingClientRect();
		var pos = {
		    x: (e.clientX || e.pageX) - rect.left,
		    y: (e.clientY || e.pageY) - rect.top
		};
			
        if(draggingMiddle || draggingRight)
            self.camera.setPosition(self.camera.position.x + mousePos.x - pos.x, self.camera.position.y + mousePos.y - pos.y);
        mousePos = pos;
    };

    this.setSelectedId = function(id) {
        if(id < 0) id = 0;
        if(id >= this.tileset.cols * this.tileset.rows) 
            id = this.tileset.cols * this.tileset.rows - 1;
        
        self.selectedID = id;
        if(currentTool != Tools.TILE_FILLER)
            editor.setTool(Tools.TILE_PLACER);
        Tools.TILE_PLACER.tileID = id;
        this.camera.setTargetPosition(
            (id % this.tileset.cols) * this.tileset.tileSize * this.camera.scaling - this.canvas.width / 2 + this.tileset.tileSize * this.camera.scaling / 2, 
            this.camera.scaling * Math.round(id / this.tileset.cols) * this.tileset.tileSize - this.canvas.height / 2 + this.tileset.tileSize * this.camera.scaling  / 2);
    };
    
    this.setTileset = function(tileset) {
        this.tileset = tileset;
        this.tileSize = tileset.tileSize;
        //this.camera.setBounds(0, 0, this.tileset.getImage().width, this.tileset.getImage().height);
        /*this.image.onload = function() {
            self.rows = this.height / self.tileSize,
            self.cols = this.width / self.tileSize;
        };*/
    };

    this.render = function() {
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.mozImageSmoothingEnabled = false;
    
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.save();
        this.camera.applyTransforms(this.ctx);

        this.ctx.drawImage(this.tileset.getImage(), 0, 0);

        this.ctx.lineWidth = 1;

        // Iterate other each tile and render stuff depending on hover/select state
        for(var r = 0; r < this.tileset.rows; r++) {
            for(var c = 0; c < this.tileset.cols; c++) {
                var cellID = r * this.tileset.cols + c,
                    cellX =  c * this.tileSize,
                    cellY =  r * this.tileSize;

                
                if(this.selectedID == cellID) {
                    this.ctx.strokeStyle = "rgb(240, 210, 20)";
                    this.ctx.strokeRect(cellX + 1, cellY + 1, this.tileSize - 2, this.tileSize - 2);
                }
                else if(this.hoveredID != cellID) {
                    this.ctx.fillStyle = "rgba(40, 40, 40, 0.25)";
                    this.ctx.fillRect(cellX, cellY, this.tileSize, this.tileSize);
                }
            }
        }

        this.ctx.restore();
    };
    
    this.update = function() {
        this.camera.update(); 
        
        var hovered = false;

        // Iterate other each tile and check if it is hovered
        for(var r = 0; r < this.tileset.rows; r++) {
            for(var c = 0; c < this.tileset.cols; c++) {
                var cellID = r * this.tileset.cols + c,
                    cellX =  c * this.tileSize * this.camera.scaling - this.camera.position.x,
                    cellY =  r * this.tileSize * this.camera.scaling - this.camera.position.y;

                if(mousePos.x >= cellX && mousePos.x < cellX + this.tileSize * this.camera.scaling &&
                   mousePos.y >= cellY && mousePos.y < cellY + this.tileSize * this.camera.scaling) {
                       this.hoveredID = cellID;
                       hovered = true;
                }
            }
        }

        if(!hovered)
            this.hoveredID = -1;
    };
}
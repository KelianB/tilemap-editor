/* global $ */

/*
    (new DialogBox("text")).create(); // Create a centered dialog box that auto closes
    (new DialogBox("text", {position: {x: 0, y: 0}, size: {w: 0, h: 0}, opacity: 1, autoClose: true})).create();
*/

var DialogBox = function(content, settings_) {
    var self = this;
    var box = $("<div>");
    var closeBox = $("<div>");
    var settings = {};
    settings_ = settings_ || {};
    
    this.id = DialogBox.lastId++;
    
    settings.visible = settings_.visible || false;
    settings.position = settings_.position || {x: 0, y: "20%"};
    settings.size = settings_.size || {w: "auto", h: "auto"};
    settings.alignCenter = settings_.alignCenter || settings_.position == undefined; // We don't want to align it to center if position is specified
    settings.opacity = settings_.opacity || 1;
    settings.className = settings_.className || "dialog-box";
    settings.hideOnMouseLeave = settings_.hideOnMouseLeave || false;
    settings.closeOnMouseLeave = settings_.closeOnMouseLeave || false;
    settings.hideOnClickOutside = settings_.hideOnClickOutside || false;
    settings.closeOnClickOutside = settings_.closeOnClickOutside || settings_.hideOnClickOutside == undefined;
    
    var onResize = function(){
        box.css("left", $(window).width() / 2 - box.outerWidth() / 2);
    };
    
    var createElements = function(){
        closeBox
            .addClass("transparent-fullscreen")
            .attr("id", "#dialog-box-remove-" + self.id)
            .css("z-index", "999")
            .click(function(){
                if(settings.hideOnClickOutside) {
                    console.log("hiding");
                    self.hide();
                }
                else {
                    self.remove();
                }
            })
            .appendTo("body");

        box
            .addClass(settings.className)
            .css("top", settings.position.y)
            .css("left", settings.position.x)
            .css("width", settings.size.w)
            .css("height", settings.size.h)
            .css("opacity", settings.opacity)
            .css("z-index", "1000")
            .attr("id", "dialog-box-" + self.id)
            .appendTo("body");

        self.setContent(content);

        if(settings.alignCenter) {
            $(window).on("resize", function(){
                onResize();
            });
        }

        if(settings.closeOnMouseLeave || settings.hideOnMouseLeave) {
            box.on("mouseleave", function() {
                if(settings.hideOnMouseLeave) {
                    self.hide();
                }
                else {
                    self.remove();
                }
            });
        }

        settings.visible = false,
        box.hide();
        closeBox.hide();
    };
    
    this.setContent = function(content){
        if(typeof content == "object") {
            box.html("");
            box.append(content);
        }
        else {
            box.html(content);
        }
        if(settings.alignCenter) {
            onResize();
        }
    };
    
    this.setPosition = function(x, y, unit) {
        unit = unit || "px";
        settings.alignCenter = false;
        box.css("left", x + unit);
        box.css("top", y + unit);
    }

    this.show = function(){
        settings.visible = true;
        box.show();
        if(settings.closeOnClickOutside || settings.hideOnClickOutside)
            closeBox.show();
    };
    
    this.hide = function(){
        settings.visible = false;
        box.hide();
        if(settings.closeOnClickOutside || settings.hideOnClickOutside)
            closeBox.hide();
    };
    
    this.toggle = function(){
        settings.visible = !settings.visible;
        box.toggle();
        if(settings.closeOnClickOutside || settings.hideOnClickOutside)
            closeBox.toggle();
    };

    this.remove = function(){
        box.remove();
        closeBox.remove();
    };
    // TODO: Add setters for opacity, position, ...
    
    createElements();
};

DialogBox.lastId = 0;
/* global DialogBox hotkeys */ 


var dialogs = {
    help: new DialogBox("", {position: {x: 0, y: 0}, size: {w: "auto", h: "auto"}, opacity: 0.8, hideOnClickOutside: false}),
    backgroundColorSelector: new DialogBox("", {size: {w: "auto", h: "auto"}, hideOnClickOutside: true}),
    selectTileset: new DialogBox("", {position: {x: 0, y: 0}, size: {w: 220, h: 220}, hideOnMouseLeave: true, hideOnClickOutside: false})
}

// Handle help
var dialogContent = "";
for(var i = 0; i < hotkeys.length; i++) {
    var h = hotkeys[i];
    if(!h.description)
        continue;

    var modifiers = (h.ctrlRequired ? "CTRL-" : "") +
                    (h.altRequired ? "ALT-" : "") +
                    (h.shiftRequired ? "SHIFT-" : "");
    
    var keyName = h.name || String.fromCharCode(h.code);
    dialogContent += "<b style='width: 100px; display: inline-block;'>" + modifiers + keyName + "</b> " + h.description + "<br>";
}

var additionalHelp = [
    {keyName: "Mouse right", help: "Move the map"},
    {keyName: "Mouse middle", help: "Pick entity / tile"},
];

for(var i = 0; i < additionalHelp.length; i++) {
     dialogContent += "<b style='width: 100px; display: inline-block;'>" + additionalHelp[i].keyName + "</b> " + additionalHelp[i].help + "<br>";
}

dialogs.help.setContent(dialogContent);

// TODO: Clean dialog class
// Think about putting all dialogs here or not
// Fix the tile picker dialog in layer-manager
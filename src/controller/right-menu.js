/* global app $ layerManager editor TilePicker actionHistory Action ActionTypes currentTool Tools EntityUIDisplay */


function initRightMenu() {
    var rightMenu = {};
    
    layerManager.refreshLayerMenu();
    rightMenu.tilePicker = new TilePicker("#tilepicker-canvas");
    rightMenu.entityUIDisplay = new EntityUIDisplay();
    
    // Handle all controls for the "Map settings" section
    $("#menu-settings-name").change(function(e) {
        var text = $(this).val();
        editor.map.name = text;
    });
    
    $("#menu-settings-cols").change(function(e) {
        var value = parseInt($(this).val());
        if(value > 0 && value <= 1000) { 
            var resizeAction = new Action(ActionTypes.RESIZE_MAP_H, {cols: value});
            actionHistory.registerAction(resizeAction);
        }
    });
    
    $("#menu-settings-rows").change(function(e) {
        var value = parseInt($(this).val());
        if(value > 0 && value <= 1000) {
            var resizeAction = new Action(ActionTypes.RESIZE_MAP_V, {rows: value});
            actionHistory.registerAction(resizeAction);
        }
    });
    
    $("#menu-settings-imgroot").change(function(e) {
        var value = $(this).val();
        var changeRootAction = new Action(ActionTypes.CHANGE_IMG_ROOT, {imgRoot: value});
        actionHistory.registerAction(changeRootAction);
    });
    
    rightMenu.setValuesFromMap = function(map) {
        $("#menu-settings-cols").val(map.cols);
        $("#menu-settings-rows").val(map.rows);
        $("#menu-settings-name").val(map.name);
        $("#menu-settings-imgroot").val(map.imageRoot);
    };

    
    return rightMenu;
}
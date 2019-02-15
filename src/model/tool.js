class Tool {
    constructor(name, icon, behavior) {
        this.name = name;
        this.icon = icon;
        
        behavior.onMouseDown = behavior.onMouseDown || function() {};
        behavior.onMouseUp = behavior.onMouseUp || function() {};
        behavior.onMouseMove = behavior.onMouseMove || function() {};
        behavior.onToolSelected = behavior.onToolSelected || function() {};
        behavior.customToolDraw = behavior.customToolDraw || function() {};
        
        for(let key in behavior)
            this[key] = behavior[key];
    }
}


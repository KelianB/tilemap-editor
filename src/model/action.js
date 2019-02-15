class Action {
    constructor(type, data) {
        this.type = type;
        this.data = data;
        
        // Gathers necessary data (example: the previous value of a field this action will modify)
        if(this.type.onActionCreated)
            this.type.onActionCreated(this);
    
    }
    
    // Called when the action is done for the first time and on CTRL-Y.
    do() {
        this.type.doAction(this);
    };
    
    undo() {
        this.type.undoAction(this);
    };
}
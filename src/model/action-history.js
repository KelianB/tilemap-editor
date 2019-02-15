/* global ActionTypes */ 

class ActionHistory {
    constructor() {
        this.actionStack = [];
        this.currentIndex = 0;
    }
    
    onActionDone(a) {};
    onActionUndone(a) {};
    
    undo() {
        if(this.currentIndex == 0)
            return;
        let action = this.actionStack[--this.currentIndex];
        action.undo();
        this.onActionUndone(action);
    };
    
    redo() {
        if(this.currentIndex > this.actionStack.length - 1)
            return;
            
        let action = this.actionStack[this.currentIndex++];
        action.do();
        this.onActionDone(action);
    };
    
    clear() {
        this.actionStack = [];  
        this.currentIndex = 0;
    };
    
    registerAction(a) {
        // Remove all following actions
        this.actionStack.length = this.currentIndex;
        // Add the action to the stack so it can be undone
        this.actionStack.push(a);
        this.currentIndex++;
        // Execute the action
        a.do();
        this.onActionDone(a);
    };
    
    // Merges a given new action with the last one. Failure results in the action being simply registered.
    mergeWithLastAction(a) {
        let success = false;
        
        if(this.actionStack.length == 0) {
            console.error("Action merge failure: there is no action to merge with.")
        }
        else {
            let b = this.actionStack[this.actionStack.length - 1];
            
            // Merge a into b
            if(a.type == b.type) {
                switch(a.type) {
                    case ActionTypes.PLACE_TILES:
                        for(let i = 0; i < a.data.tiles.length; i++) {
                            let tileA = a.data.tiles[i];
                            let add = true;
                            
                            for(let j = 0; j < b.data.tiles.length; j++) {
                                let tileB = b.data.tiles[j]; 
                                if(tileA.row == tileB.row && tileA.col == tileB.col) {
                                    tileB.id = tileA.id;
                                    add = false;
                                    break;
                                }
                            }
                            
                            if(add)
                                b.data.tiles.push(tileA)
                        }
                        success = true;
                        break;
                    default:
                        break;
                }        
            }
        }
        
        if(success) {
            a.do();
            this.onActionDone(a);
        }
        else // couldn't merge the action ; register it instead
            this.registerAction(a);
    };
}
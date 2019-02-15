/* global $ */

class Hotkey {
    constructor(keyCode, params) {
        this.code = keyCode;
        this.name = params.name;
        this.description = params.description;
        this.enabled = true;
        
        // Modifiers
        this.ctrlRequired = params.ctrlRequired || false;
        this.shiftRequired = params.shiftRequired || false;
        this.altRequired = params.altRequired || false;
        
        this.event = params.event;
        
        this.trigger = params.trigger || function() {};
        
        this._addedEventListeners = {};
    }
    
    update(keysPressed) {
        if(this.event == Hotkey.EVENT_KEY_HOLD && keysPressed[this.code]) {
            if(this.testTrigger({shiftKey: keysPressed[16], ctrlKey: keysPressed[17], altKey: keysPressed[18]}))
                this.trigger();
        }
    };

    testTrigger(e) {
        return (!e.keyCode || e.keyCode == this.code) &&
            $("input:focus").length == 0 &&
            (e.shiftKey || false) == this.shiftRequired && 
            (e.ctrlKey || false) == this.ctrlRequired &&
            (e.altKey || false) == this.altRequired && 
            this.enabled;
    };
    
    addEventListener() {
        if(this.event == Hotkey.EVENT_KEY_PRESSED) {
            let pressed = false;
            let kd = (e) => {
                if(!pressed && this.testTrigger(e))
                    this.trigger(e);
                if(e.keyCode == this.code)
                    pressed = true;
            };
            var ku = (e) => {if(e.keyCode == this.code) pressed = false;};
            window.addEventListener("keydown", kd);
            window.addEventListener("keyup", ku);
            this._addedEventListeners["keydown"] = kd;
            addEventListener["keyup"] = ku;
        }
        else if(this.event != Hotkey.EVENT_KEY_HOLD) {
            let listener = (e) => {
                if(this.testTrigger(e))
                    this.trigger(e);
            };
            window.addEventListener(this.event, listener);
            this._addedEventListeners[this.event] = listener;
        }
    };
    
    removeEventListener() {
        for(let key in this._addedEventListeners)
            window.removeEventListener(key, this._addedEventListeners[key]);
        this._addedEventListeners = {};
    };
}

Hotkey.EVENT_KEY_DOWN = "keydown";
Hotkey.EVENT_KEY_PRESSED = "keypress";
Hotkey.EVENT_KEY_HOLD = "keyhold";
Hotkey.EVENT_KEY_UP = "keyup";
Hotkey.EVENT_INPUT = "input";
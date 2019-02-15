/*
    global $ Engine app editor TileMap readFile localStorage
*/

class MenuState extends Engine.State {
    constructor() {
        super();
        
        $("#startup-controls").fadeIn();
        $("#startup-loading").hide();
    
        if(localStorage.getItem("lastMap") === null) {
            $("#startup-load-last").addClass("disabled").attr("disabled", true).html("No map saved");
        }
    
        $("#startup-create").click(() => {
            $("#startup-create").html("Loading empty map...");
            this.disableButtons();
    
            editor.getEmptyMap((mapData) => {
                editor.map = new TileMap(mapData, false);
                editor.map.loadAssets({onLoaded: () => {
        	        app.setState(editor);
                }});
            });
        });
    
        $("#startup-load-last").click(() => {
            this.disableButtons();
            $("#startup-load-last").html("Loading...");
            editor.map = new TileMap(localStorage.getItem("lastMap"));
            editor.map.loadAssets({onLoaded: () => {
    	        app.setState(editor);
            }});
        });
    
        $("#file-input-import").on("change", () => {
            readFile(this, (result) => {
                this.disableButtons();
                editor.map = new TileMap(result);
                editor.map.loadAssets({onLoaded: () => {
        	        app.setState(editor);
                }});
            });
        });
    
        $("#startup-load-orikaru").click(() => {
            this.disableButtons();
            $("#startup-load-orikaru").html("Loading...");
            $.post("https://orikaru.net/resources/logic/php/ajax/map-editor.php", {action: "get-online-map"}, (result) => {
                console.log(result);
                editor.map = new TileMap(result);
                editor.map.loadAssets({onLoaded: () => {
        	        app.setState(editor);
                }});
            });
        });
    
        $("#startup-import").click(() => {$("#file-input-import").click();});
    }
    
    disableButtons() {
        $("#startup-controls button").addClass("disabled").attr("disabled", true);
    }
}


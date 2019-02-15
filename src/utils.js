function readFile(e, callback) {
    let file = e.files[0]; 
    if (file) {
        let fr = new FileReader();
        fr.readAsText(file);
        fr.onload = function(e) { 
            callback(e.target.result);
        };
    }
}

// Starts to download a file client-side 
function download(filename, text) {
    let element = document.createElement("a");
    element.setAttribute("href", "data:text/plain;charset=utf-8," + text);
    element.setAttribute("download", filename);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}
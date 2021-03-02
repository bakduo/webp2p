
'use string';

var objBack=chrome.extension.getBackgroundPage();

objBack.loadLibrary();

function addCSS(filename){
    
    let head = document.getElementsByTagName('head')[0];
    let style = document.createElement('link');
    style.href = filename;
    style.type = 'text/css';
    style.rel = 'stylesheet';
    head.append(style);
}

// Include script file
function addScript(filename){
 
 let head = document.getElementsByTagName('head')[0];
 let script = document.createElement('script');
 script.src = filename;
 script.type = 'text/javascript';
 head.append(script);

}

function loadWhenReady(){
    addScript(objBack.bootstrap_link);
    addCSS(objBack.boostrap_css);
}

document.addEventListener("DOMContentLoaded",function (){
    
    /*
    chrome.tabs.executeScript( {"file": jquery_link});
    chrome.tabs.executeScript( {"file": popper_link});
    chrome.tabs.executeScript( {"file": bootstrap_link});
    */

    try {

        addScript(objBack.popper_link);
        addScript(objBack.jquery_link);
        //addCSS(objBack.boostrap_css);
        //addScript(objBack.bootstrap_link);
        setTimeout(loadWhenReady, 150);
        
    } catch (error) {
        
        console.log(error);
    }
   
});

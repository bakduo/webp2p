/*
* Copyright ragonzalez@disroot.org. Licensed under MIT
* See license text at https://mit-license.org/license.txt
*/

'use strict';

var windowImage = null;
var registeredScript = null;
var portFromCS;
var myPeer;
var listaPeers = [];

var serviceForPeer = new Map();
const constraints = {audio: true, video: true};
//puerto comando
//var portFromComando;
var ports = [];
var portExternals = {};
let loadTime = new Date();
let manifestp2p = browser.runtime.getManifest();
var testCommunicaction;
var blocking=false;
var comandosManager;
var comandosMenu;

var jquery_link;
var popper_link;
var bootstrap_link;
var boostrap_css;

function loadLibrary(){
  jquery_link=browser.runtime.getURL("lib/jquery-3.4.1.slim.min.js");
  popper_link=browser.runtime.getURL("lib/popper.min.js");
  bootstrap_link=browser.runtime.getURL("lib/bootstrap.min.js");
  boostrap_css=browser.runtime.getURL("lib/bootstrap.min.css");
}

async function registerRemoteScript(code,host) {

    if (registeredScript) {
        registeredScript.unregister();
    }
    registeredScript = await browser.contentScripts.register({
      matches: host,
      js: [{code}],
      runAt: "document_idle"
    });
}

function registerRemoteScriptP2P(code,csr,jsr,hostr) {

    if (registeredScript) {
        registeredScript.unregister();
    }
   
   if (code!=="undefined" && code!==null){
      portFromCS.postMessage({'type':"execjs", 'contenido':code});
    }
}

/******************************coneccion con content-script via port***/
function connected(p){
  try{

      if (p.sender.tab.id!=="undefined" && p.sender.tab.id!==null){
        ports[p.sender.tab.id] = p    
        portFromCS = ports[p.sender.tab.id];
      }else{
        console.log("No hay ningun conector disponible");
        return null;
      }
      portFromCS.onMessage.addListener(function(m) {
        //console.log("In background script, received message from content script");
      });  
  }catch(e){
      console.log(e);
  }
}

function sendCommand(jsoncmd){
  try {

    let data_json;

    if (jsoncmd.unicast){

      data_json={
                type:'callCommand',
                target:jsoncmd.target,
                target_id:jsoncmd.target_id,
                data:JSON.stringify(jsoncmd)
              }
      
      myPeer.sendData(data_json);

    }else{
        let peers_conectados = myPeer.getPeersOnline();
        //console.log(peers_conectados);
        for (let item in peers_conectados){
          if (peers_conectados.hasOwnProperty(item)){
            //console.log('Key is: ' + item + '. Value is: ' + peers_conectados[item]);
            if (peers_conectados[item].username!==myPeer.getUsername() && peers_conectados[item].mode!=='manager'){
              data_json={
                type:'callCommand',
                target:peers_conectados[item].username,
                target_id:peers_conectados[item].id,
                data:JSON.stringify(jsoncmd)
              }
              myPeer.sendData(data_json);
            }
          }
        }
    }
    
  } catch(e) {
    throw new Error(e);
  }
}

browser.runtime.onConnect.addListener(connected);

/*************************conexion con addons externo**************************/
browser.runtime.onConnectExternal.addListener((port) => {
    
    portExternals[port.sender.id] = port;
    
    myPeer.setPortExternals(portExternals);
    
    let portFromComando = portExternals[port.sender.id];
    
    portFromComando.onMessage.addListener((msj) => {
      
      let msjObj = JSON.parse(msj);

      comandosManager.getCommand(msjObj.type).execute(msjObj,myPeer,portFromComando,sendPeerData);
      
    });

});

/*************MENUS*******************************/
function onCreated() {
  if (browser.runtime.lastError) {
    console.log(`Error: ${browser.runtime.lastError}`);
  } else{
    console.log("Item created successfully");
  }
}

function listUsersConnected(){
  myPeer.sendData(
        {
             type: "listUsers",
             who:"sample"
        }
    );
};

browser.menus.create({
  id: "open",
  title: "Abrir todo.",
  contexts: ["all"]
}, onCreated);

browser.menus.create({
  id: "close",
  title: "Cerrar todo.",
  contexts: ["all"]
}, onCreated);

// https://gist.github.com/Rob--W/ec23b9d6db9e56b7e4563f1544e0d546
function escapeHTML(str) {
    // Note: string cast using String; may throw if `str` is non-serializable, e.g. a Symbol.
    // Most often this is not the case though.
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;").replace(/'/g, "&#39;")
        .replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function onError(error){
  console.log(`Error: ${error}`);
}

browser.menus.onClicked.addListener(function(info, tab) {
  
  try {
    let comando = comandosMenu.getCommand(info.menuItemId);
    comando.setPeer(myPeer);
    comando.setPort(portFromCS);
    comando.doAction();
  } catch(e) {
   throw new Error(e);
  }

});

/*************************fin menus*******************/
/*************solicitar action******************/
function sendActionPeer(idpeer,action,website){
  
  let qservice = {
    type:'service_action',
    peerid: myPeer.getCliendId(),
    service:action,
    url:website
  };

  //channelPeers[idpeer].send(JSON.stringify(qservice));
  sendByDC(idpeer,JSON.stringify(qservice));

}

function sendImagePeer(idpeer,images){
  try{

    let objImage = {
      type:'images',
      listimages:images
    };
    sendByDC(idpeer,JSON.stringify(objImage));
  }catch(e) {
    throw new Error(e);
  }
}

function sendPeerData(id,obj){
  try{
    let msj=JSON.parse(obj);
    let datamsj=null;
    if (id=="All"){
      //Si es broadcast considero si es una extension o solo peers clasicos
      //requiere refactor para cambio de nombre
      if (msj.extensioname){
        sendBroadcast(obj);
      }else{
        //Es un request
        datamsj = new RequestData(obj);
        sendBroadcast(datamsj.toJson());
      }
    }else{
      //Si un mensaje para una extesion solo realizo el forward
      //si es un mensaje para un componente interno genero un request nativo
      if (msj.extensioname){
          myPeer.sendByDC(id,obj);
      }else{
          datamsj = new RequestData(obj);
          myPeer.sendByDC(id,datamsj.toJson());
      }
    }
  }catch(e){
    // statements
    throw new Error(e);
  }
}

function sendBroadcast(obj){
  try {
    let peers_local = myPeer.getPeersOnline().getCollection();
    let channel = myPeer.getChannelPeers();
    for (let i in peers_local){
      if (peers_local.hasOwnProperty(i)){
          if (myPeer.getUsername()!==peers_local[i].getUsername() && 
          channel[peers_local[i].getUsername()]!==null || 
          (typeof channel[peers_local[i].getUsername()]!=="undefined")
          ){
            myPeer.sendByDC(peers_local[i].getUsername(),obj);
          }
      }
    }
  } catch(e) {
    throw new Error(e);
  }
}

function onInstalledNotification(details) {
  //reason
  if (details){
    browser.notifications.create('onInstalled', {
      title: `Instalada WebExtension P2P version: ${manifestp2p.version}`,
      iconUrl: browser.runtime.getURL("icons/quicknote-48.png"),
      message: `onInstalled has been called, background page loaded at ${loadTime.getHours()}:${loadTime.getMinutes()}`,
      type: 'basic'
    });
  }
  
}

function handleUpdateAvailable(status,details) {
  //console.log("si alguien recarga o actualiza nuevo contenido debe hacer algo:");
  console.log(status);
  console.log(details);
}

/*
* construccion de comandos background
*/
comandosManager = new CommandManager("manager");
comandosManager.addCommand(new CommandActionAdd("actionadd"));
comandosManager.addCommand(new CommandAddExtension("addExtension"));
comandosManager.addCommand(new CommandSendDataToPeer("sendDataToPeer"));
comandosManager.addCommand(new CommandRequest("Request"));
comandosManager.addCommand(new CommandResponse("Response"));
comandosManager.addCommand(new CommandgetPeerName("getPeerName"));
comandosManager.addCommand(new CommandgetQueryExtension("queryExtension"));
comandosManager.addCommand(new CommandgetShowPopup("showPopup"));

/*
*Construccion de comandos para menu
*/
comandosMenu = new CommandManagerMenuBack("manager");
comandosMenu.addCommand(new CommandListUsersBack("list-users"));
comandosMenu.addCommand(new CommandConectarBack("conectar-peers"));
comandosMenu.addCommand(new CommandConectarNoNatBack("conectar-peers-sinat"));
comandosMenu.addCommand(new CommandPanelScriptBack("panelscript"));
comandosMenu.addCommand(new CommandDesconectarBack("desconectar"));
comandosMenu.addCommand(new CommandClose("close"));
comandosMenu.addCommand(new CommandOpen("open"));
comandosMenu.addCommand(new CommandIniciar("iniciar"));

//iniciar();

myPeer = new PeerClient("hybrid");
let cmd = comandosMenu.getCommand("iniciar");
cmd.setPeer(myPeer);
cmd.setPort(portFromCS);
cmd.doAction();

browser.runtime.onInstalled.addListener(onInstalledNotification);

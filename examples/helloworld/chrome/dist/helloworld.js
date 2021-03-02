/*
* Copyright ragonzalez@disroot.org. Licensed under MIT
* See license text at https://mit-license.org/license.txt
*/
var url_text="";
var remoteuser="";
var jquery_link;
var popper_link;
var bootstrap_link;
var boostrap_css;
var tabActive=null;

//variables que usa el process local

var remoteuser;
var remoteResponse=null;
var ports = [];
var portFromCS;


function loadLibrary(){
  jquery_link=chrome.runtime.getURL("lib/jquery-3.4.1.slim.min.js");
  popper_link=chrome.runtime.getURL("lib/popper.min.js");
  bootstrap_link=chrome.runtime.getURL("lib/bootstrap.min.js");
  boostrap_css=chrome.runtime.getURL("lib/bootstrap.min.css");
}

function getDataResultadoP2P(){
  return remoteResponse;
}

function getRemoteUser(){
	try {
		return remoteuser;
	} catch(e) {
		console.log("Error el retornar usuario peer");
		console.log(e);
	}
}

class HelloWorldP2P extends AbstractP2PExtensionBackground{
  
  constructor(){
    super();
    this.listado={};
    this.dataTemp=null;
    this.setExtensionName("helloworldp2p");
    this.setExtensionId(chrome.runtime.id);
  }
 
  initialize(){

  }
   
  processRequest(msg, peer){

    try {
        
        remoteuser=peer;

        if (msg.type==="hello"){
          
          console.log("NOS LLEGO UN HELLO");
          
          chrome.notifications.create({
              "type": "basic",
              "iconUrl": chrome.extension.getURL("icons/hello-world-48.png"),
              "title": "HELLO.",
              "message": "DESDE: "+peer
          });

      //Envia respuesta de OK recepcion
      this.sendResponse({
        type:'check',
        status:true,
        automatic:false
        },peer);
    
    
        }else{

          chrome.notifications.create({
              "type": "basic",
              "iconUrl": chrome.extension.getURL("icons/hello-world-48.png"),
              "title": "SIN DATO.",
              "message": "NO HAY INFORMACION PARA GUARDAR."
          });

        }
        
     }catch(e){
       console.log("Error al realizar processRequest.");
       console.log(e);
     }

  }

  processResponse(msg, peer){
    try {
      console.log("SIN ACTIVIDAD PROCESS RESPONSE."); 
    } catch(e) {
      console.log("Ocurrio una exception con el response: ");
      console.error(e);
    }
  }

  receiveResponse(msg, peer){
    try {
      if (msg.type==='check'){
        console.log("HELLO OK");
        browser.notifications.create({
          "type": "basic",
          "iconUrl": browser.extension.getURL("icons/hello-world-48.png"),
          "title": "RESPONSE HELLO.",
          "message": "DESDE: "+peer
      });
      }else{
        console.log("SIN ACTIVIDAD RECEIVE RESPONSE.");
      }
    } catch(e) {
      console.log("Ocurrio una exception con receiveResponse: ");
      console.error(e);
    }
  }

  automaticProcessing(extractor, peer){
      console.log("Automatic procesing...");
  }

  getDataP2P(){
    try {
      return this.dataTemp;
    } catch(e) {
      console.log("Error al intentar acceder al traductor");
      console.log(e);
    }
  }

  setDataP2P(data){
    try {
      this.dataTemp=data;
    } catch(e) {
      console.log("Error al intentar acceder al traductor");
      console.log(e);
    }
}
   
}

var sample = new HelloWorldP2P();
sample.connect();
'use strict';

var backgroundPage = chrome.extension.getBackgroundPage();
var peerobj = backgroundPage.myPeer;

function saveOptions(e){
  
  try {

    let server_signal=document.getElementById("signal_server").value;
    let mode_server=document.getElementById("check_server").checked;
    let mode_client=document.getElementById("check_client").checked;
    let mode_manager=document.getElementById("check_manager").checked;
    let mode_alone=document.getElementById("check_alone").checked;

    let mode_hybrid=(mode_server && mode_client && !mode_manager && !mode_alone);
    let mode_str="";

    if (mode_hybrid){
      mode_str="hybrid";
    }else if (mode_server && !mode_client && !mode_manager && !mode_alone) {
        mode_str="server";
    }else if (mode_client && !mode_server && !mode_manager && !mode_alone) {
        mode_str="client";
    }else if (mode_manager && !mode_client && !mode_server && !mode_alone) {
        mode_str="manager";
    }else if (mode_alone && !mode_client && !mode_server && !mode_manager){
        mode_str="alone";
    }

    //console.log("estado de la modalidad");
    
    peerobj.setEnabled(true);
    
    peerobj.setUrlSignalServer(server_signal);
    
    localStorage.setItem('mode', mode_str);
    
    peerobj.setMode(mode_str);


  } catch (error) {
    console.log("Error al saveOptions");
  }

  
}

function restoreOptions(e){
  try {
    
    let storageItem = localStorage.getItem('mode');
    switch (storageItem){
      case "hybrid":
        document.getElementById("check_server").checked=true;
        document.getElementById("check_client").checked=true;
        document.getElementById("check_manager").checked=false;
        document.getElementById("check_alone").checked=false;
        peerobj.setMode("hybrid");
        break;
      case "server":
        document.getElementById("check_server").checked=true;
        document.getElementById("check_client").checked=false;
        document.getElementById("check_manager").checked=false;
        document.getElementById("check_alone").checked=false;
        peerobj.setMode("server");
      break;
      case "client":
        document.getElementById("check_server").checked=false;
        document.getElementById("check_client").checked=true;
        document.getElementById("check_manager").checked=false;
        document.getElementById("check_alone").checked=false;
        peerobj.setMode("client");
      break;
      case "manager":
        document.getElementById("check_server").checked=false;
        document.getElementById("check_client").checked=false;
        document.getElementById("check_manager").checked=true;
        document.getElementById("check_alone").checked=false;
        peerobj.setMode("manager");
      break;
      case "alone":
        document.getElementById("check_server").checked=false;
        document.getElementById("check_client").checked=false;
        document.getElementById("check_manager").checked=false;
        document.getElementById("check_alone").checked=true;
        peerobj.setMode("alone");
      break;
    };

    document.getElementById("signal_server").value = peerobj.getUrlSignalServer();
    
    //e.preventDefault();

  } catch(e) {
    console.log("Error al ejecutar storage item desde localStorage.");
    console.log(e);
  }
}

document.addEventListener('DOMContentLoaded', function (){
  
  document.getElementById('save_options').addEventListener("click",saveOptions);
  document.getElementById('restore_options').addEventListener("click",restoreOptions);

});


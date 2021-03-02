'use strict';

var backgroundPage_1=chrome.extension.getBackgroundPage();
var peer_back=backgroundPage_1.myPeer;
var name_peer=document.getElementById("name_peer");
var signal_server=document.getElementById("signal_server");

function loadP2P(cantidadConectada){
	try {

		let estado = document.getElementById("estado_signal");		
		let cantidad_peers = document.getElementById("estado_peers");
		let socket=peer_back.getConnection();
		name_peer.innerText="Name: "+peer_back.getUsername();
		
		if (socket!==null){
			if (socket.getStateSocket()==1){
				estado.style.color='green';
				estado.innerText="Online with: ";
			}else{
				estado.style.color='red';
				estado.innerText="Offline.";
			}
		}else{
			estado.style.color='red';
			estado.innerText="Offline.";
		}
		

		cantidad_peers.innerText=cantidadConectada;

		signal_server.innerText="signal: "+peer_back.getUrlSignalServer();

	} catch(e) {
		console.log("Falla loadP2P state.");
		console.log(e);
	}
}

document.addEventListener('DOMContentLoaded', function () {

	let col = peer_back.getPeersOnline().getCant();
	
	loadP2P(col);

});

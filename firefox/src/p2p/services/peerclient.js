'use strict';

/*
* Copyright 2019 ragonzalez@disroot.org. Licensed under MIT
* See license text at https://mit-license.org/license.txt
*/
var onfly=false;

class PeerClient{
	
	constructor(mode=""){

		this.channelPeers={};
		this.sessionPeers={};
		this.servicebByPeers={};
		this.peerEnable=false;
		
		// this.peerConnectionConfig = {
		// 	iceServers: [
		// 	  {
		// 		urls: 'stun:any-service:5349',
		// 		username: 'auser',
		// 		credential: 'apassword'
		// 	  },
		// 	  {
		// 		urls: 'turn:any-service:3478',
		// 		username: 'auser',
		// 		credential: 'apassword'
		// 	  }
		// 	],
		// 	iceTransportPolicy:'all'
		// }

		this.peerConnectionConfig = {};
		
		this.peersOnline=new CollectionPeers();
		this.usernameVirtual = ""; 
		this.username="";
		this.cliendId=-1;
		this.success=false;
		this.receiveChannel=false;
		this.conected=false;
		this.connection = false;
		this.actions=[];
		this.msjQueue=[];
		this.extensions=false;
		this.extensions_message={};
		this.sessionForPeer={};
		this.loadId();
		this.loadUsername();
		
		if (mode!==""){
			this.mode=mode;
		}else{
			this.mode="hybrid";
		}
		
		this.ip="";
		this.natEnable=false;
		this.msjData=[];
		this.msjDataExtension=[];
		this.testCommunicaction={};
		this.signal_server_url="";
		this.eliminarPeers=[];
		this.urlsignalserver="wss://any-service:64889";
		this.portExternals={};
		this.enable=false;

		this.commandMesage=new ManagerCommandMessage("manager");
		//Construcción de operaciones
		this.commandMesage.addCommand(new PCommandLogin("login"));
		this.commandMesage.addCommand(new PCommandRPC("rpc"));
		this.commandMesage.addCommand(new PCommandUpdateConnection("updateconnection"));
		this.commandMesage.addCommand(new PCommandOffer("offer"));
		this.commandMesage.addCommand(new PCommandAnswer("answer"));
		this.commandMesage.addCommand(new PCommandCandidate("candidate"));
		this.commandMesage.addCommand(new PCommandListUsers("listUsers"));
		this.commandMesage.addCommand(new PCommandResponseBroadcast("responsebroadcast"));
		this.commandMesage.addCommand(new PCommandAppendUser("appendUser"));
		this.commandMesage.addCommand(new PCommandConfirmDelete("confirmdelete"));
		this.commandMesage.addCommand(new PCommandUpdateMode("updatemode"));
		this.commandMesage.addCommand(new PCommandDeleteUser("deleteUser"));
		this.commandMesage.addCommand(new PCommandAckSession("ackSession"));
		this.commandMesage.addCommand(new PCommandResponseSessions("responseSessions"));
		this.commandMesage.addCommand(new PCommandUpdateSessions("updatesession"));
		//this.timeEvent.testDetectSupport();
	}

	setEnabled(estado){
		this.enable=estado;
	}

	isEnabled(){
		return this.enable;
	}

	getMsjQueue(){
		return this.msjQueue;
	}

	clearSessionsPeers(){
		this.sessionPeers={};
	}

	clearChannelPeers(){
		this.channelPeers={};
	}

	setPeersDeleted(){
		this.eliminarPeers=[];
	}

	getPeersDeleted(){
		return this.eliminarPeers;
	}

	getServicesPeers(){
		return this.servicebByPeers;
	}

	addServiceOfPeer(peername,service){
		
		//Agregamos el nombre del peer de origen al servicio.
		
		service.peersource=peername;
		
		if (this.servicebByPeers[peername]){
			
			let index=this.servicebByPeers[peername].findIndex((item) => {
				return service.name==item.name;
			})

			if (index>-1){
				this.servicebByPeers[peername][index]=service;
			}else{
				this.servicebByPeers[peername].push(service);
			}

		}else{
			this.servicebByPeers[peername]=[];
			this.servicebByPeers[peername].push(service);
		}
	}

	getServicePeer(name){
		let ok=false;
		if (this.servicebByPeers[name]){
			ok=this.servicebByPeers[name];
		}
		return ok;
	}

	addDataExtension(data){
		this.msjDataExtension.push(data);
	}

	setPortExternals(json){
		this.portExternals=json;
	}

	getPortExternals(){
		return this.portExternals;
	}

	setUrlSignalServer(url){
		this.urlsignalserver=url;
	}

	getUrlSignalServer(){
		return this.urlsignalserver;
	}

	setPeerEnable(v){
		this.peerEnable=v;
	}

	getPeerEnable(){
		return this.peerEnable;
	}

	connectSignaServer(){
		try {
			
			if (this.getPeerEnable()){
				this.connection = new ClientConectionWS(this.urlsignalserver);
				let peer = this;
				this.connection.conectar()
				.then((socket)=>{
					console.log("Iniciando conexion contra servidor señalizador");
					peer.connection.setConnection(socket);
					peer.connection.startConnect(peer);
					return peer.getConnection();
				})
				.catch((error)=>{
					throw new Error(error);
				});
			}else{
				console.log("PEER DISABLED.");
			}
			

		} catch (e) {
			throw new Error(e);
		}
	}

	disconnectSignalServer(type="all"){
		try {
			let connection = this.getConnection();
			connection.down(this,type);
		} catch (e) {
			throw new Error(e);
		}
	}

	rcvSignalMessage(data,instancesocket){
		try {
			this.commandMesage.getCommand(data.type).execute(data,instancesocket,this);
		} catch (e) {
			throw new Error(e);
		}
	}

	getClonePeersOnline(){
		try {
			return JSON.parse(JSON.stringify(this.getPeersOnline()));
		} catch(e) {
			throw new Error(e);
		}
	}

	conectAllPeers(){
		try {

		  if (this.getMode()!=="manager"){
			
			let collection = this.peersOnline.getCopyCollection();

			//console.log(collection);

			collection.forEach(item => {
				if (!item.getP2P() && item.getOnline() && item.getMode()!=='manager' && item.getMode()!=='alone' && item.getUsername()!==this.getUsername()){
					//console.log(item);
					this.createPeer(item,false);
				}
			});
		  }
		  
		  
		} catch(e) {
			throw new Error(e);
		}
	};

	conectarP2P(username){
		try {

			let collection = this.peersOnline.getCopyCollection();
			
			collection.forEach(item => {
				if (!item.getP2P() && item.getOnline() && item.getMode()!=='manager' && item.getMode()!=='alone'){
					//console.log(item);
					this.createPeer(item,item.getP2P());
				}
			}); 


		} catch (e) {
			throw new Error(e);
		}
	}

	getModePeerOnline(username){
		try {
			
			this.PeersOnline.setModeSearch(new searchPolicyUser());
			
			let tmp = this.peersOnline.searchPeer(username);
			
			return tmp.getMode();

		} catch (e) {
			throw new Error(e);
		}
	}

	setMsjDataLength(){
		this.msjData.length=0;
	}

	getMsjDataAlone(){
		return this.msjData;
	}

	getMsjData(){
		try {
		  let max = this.msjData.length;
		  //console.log("cantidad de mensajes: "+max);
		  let obj={};
		  for (let i=0;i<max;i++){
			//console.log(typemsj);
			let status = false;
			if (this.msjData[i].getState()){
				status = this.msjData[i].getState().getStatus();
			}
			obj[i]={
			  'id':i,
			  'type':this.msjData[i].getType(),
			  'data':this.msjData[i].getData(),
			  'status': status
			};
			//console.log(obj[i]);
		  }
		  return obj;
	  
		} catch(e) {
			throw new Error(e);
		}
	  }
	  
	getMsjDataExtension(){
		try {
		  let max = this.msjDataExtension.length;
		  console.log("cantidad de mensajes: "+max);
		  let obj={};
		  for (let i=0;i<max;i++){
			//console.log(typemsj);
			let status =false;
			if (this.msjDataExtension[i].getState()){
				status = this.msjDataExtension[i].getState().getStatus();
			}
			obj[i]={
			  'id':i,
			  'type':this.msjDataExtension[i].getType(),
			  'data':this.msjDataExtension[i].getData(),
			  'status':status,
			  'extensioname':this.msjDataExtension[i].getExtensionName(),
			  'extensionId':this.msjDataExtension[i].getExtensionId()    
			};
			//console.log(obj[i]);
		  }
		  return obj;
		} catch(e) {
			throw new Error(e);
		}
	  }
	  
	getAllMessajeForExtension(name){
		try {
		  let max = this.msjDataExtension.length;
		  console.log("cantidad de mensajes: "+max);
		  let vector=[];
		  for (let i=0;i<max;i++){
			if (this.msjDataExtension[i].getExtensionName()==name){
			  vector.push(this.msjDataExtension[i]);  
			}
		  }
		  return vector;

		} catch(e) {
			throw new Error(e);
		}
	  }

	acceptPeerMessaje(idmsj){
		try {
		  console.log("Aceptar mensajes");
		  this.msjData[idmsj].changeState(new onAccept());
		} catch(e) {
			throw new Error(e);
		}
	}

	acceptPeerMessajeExtension(idmsj){
		try{
			//console.log("Aceptar mensajes extension");
			this.msjDataExtension[idmsj].changeState(new onAccept());
		  } catch(e) {
			throw new Error(e);
		  }
	}

	doActionMessage(portFromCS,idmsj){
		try{
			this.msjData[idmsj].do(portFromCS);
		} catch (e) {
			throw new Error(e);
		}
	}

	doActionMessageExtension(idmsj,port,idextension){
		try{

			this.msjDataExtension[idmsj].do(port[idextension]);
		} catch (e) {
			throw new Error(e);
		}
	}
	  
	denyPeerMessaje(idmsj){
		try {
		  //console.log("Deny mensajes");
		  this.msjData[idmsj].changeState(new onDeny());
		} catch(e) {
			throw new Error(e);
		}
	  }
	   
	  denyPeerMessajeExtension(idmsj){
		try {
		  //console.log("Deny mensajes extension");
		  this.msjDataExtension[idmsj].changeState(new onDeny());
		} catch(e) {
			throw new Error(e);
		}
	  }

	setTestCommunication(t){
		this.testCommunicaction=t;
		this.testCommunicaction.setPeer(this);
	}

	getTestCommunication(){
		return this.testCommunicaction;
	}

	getChannelPeers(){
		return this.channelPeers;
	}

	getSessionPeers(){
		return this.sessionPeers;
	}

	sendAnswer(answer,data){

		this.sendData({
			type: "answer",
			answer: answer,
			target: data.who,
			who: this.getUsername(),
			id: this.getCliendId(),
			description: this.sessionPeers[data.who].getLocalDescription()
		});

	}
	
	
	showMessageConnection(msg){
		try {
			browser.notifications.create('Detalle de conexión', {
			    title: msg.title,
			    message: `${msg.body} detail: ${loadTime.getHours()}:${loadTime.getMinutes()}`,
			    type: 'basic'
		  });
		} catch(e) {
			throw new Error(e);
		}
	}

	async checkDelete(){
		try {
			
			console.log("TOTAL CHECK: ",this.eliminarPeers.length);

			for (let i=0;i<this.eliminarPeers.length;i++){
				
				console.log("Checking delete peers: ",this.eliminarPeers[i]);
				
				if (this.eliminarPeers[i]){
				
					console.log("Checking channelPeers: ",this.eliminarPeers[i].getUsername());
				
					if (this.channelPeers[this.eliminarPeers[i].getUsername()]){
						try {
							await this.channelPeers[this.eliminarPeers[i].getUsername()].close();
							//delete this.channelPeers[this.eliminarPeers[i].getUsername()];
						} catch(e) {
							throw new Error(e);
						}
					}
					
					if (this.sessionPeers[this.eliminarPeers[i].getUsername()]){
						try {
							await this.sessionPeers[this.eliminarPeers[i].getUsername()].close();
							//delete this.sessionPeers[this.eliminarPeers[i].getUsername()];
						}catch(e){
							// statements
							throw new Error(e);
						}
					}

				}
			}
			this.setPeersDeleted();
		} catch (e) {
			throw new Error(e);
		}
	}

	async onOffer(data){
		try {

			//console.log("oferta de : "+data.who+" para : "+data.target);
			if (this.existPeerJsonArray(this.sessionPeers,data.who) || this.existPeerJsonArray(this.channelPeers,data.who)){
				console.log("Ya existe una sesion no se puede generar otra");
				//La regenera.
				//await this.reOffer(data.who,data);
				//Agregado
				//let peer = this.getDataPeerOnlineSS(data.who);
				//this.setStateP2P(peer.id,false);
				//fin agregado para volver a conectar.
				return -1;
			}

			let myPeer=this;
	  
			if (this.sessionPeers[data.who]===null || (typeof sessionPeers[data.who]==="undefined")){
						  
						  //console.log("recibe oferta de usuario pero el peer no tiene sesion activa y la CREA...");
						  //La oferta de conexion es modo nat/lan, es necesario saber el modo de conexion para poder conectarnos
						  if(data.natmode){
							this.enableNat();
							this.sessionPeers[data.who] = new WRTCPeerConnection(this.peerConnectionConfig);
						  }else {
							this.sessionPeers[data.who] = new WRTCPeerConnection(null);
						  }

						  this.channelPeers[data.who] = new WRTCDataChannel();
						  this.channelPeers[data.who].setDataChannel(this.sessionPeers[data.who].getRTCPeerConnection().createDataChannel("sendChannel"));

						  this.channelPeers[data.who].onclosing(myPeer);

						  this.sessionPeers[data.who].onclose(data.who);

						  this.channelPeers[data.who].onopen(myPeer);

						  this.channelPeers[data.who].onclose(myPeer);

						  this.sessionPeers[data.who].ondatachannel(myPeer,data.who);

						this.sessionPeers[data.who].onnegotiationneeded();

						this.sessionPeers[data.who].onsignalingstatechange();
					  
					  	this.sessionPeers[data.who].onconnectionstatechange(data.who,data,myPeer);

						this.sessionPeers[data.who].oniceconnectionstatechange(data.who,data,myPeer);

						this.sessionPeers[data.who].onicecandidate(data.who,myPeer);
						  

						//fin peer
			}else{
			  console.log("Existe peer para: "+data.who);
			}
			//console.log("Aqui tiene que enviar ANSWER...");
			await this.sessionPeers[data.who].createAnswer(data,myPeer);

		}catch(e){
			throw new Error(e);
		}
	};

	deleteItem(username,jsonarray){
		try {
			//let cloneJson=JSON.parse(JSON.stringify(jsonarray));
			let clone={};
			for (let i in jsonarray){
                if (jsonarray.hasOwnProperty(i)){
                  if (i!==username){
					clone[i]=jsonarray[i];
                  }
                }
            };
			return clone;
		} catch (error) {
			throw new Error(e);
		}
	
	}

	async deletePeer(data){
		try{

			//await this.deleteUser(data.id);
			//this.setPeersOnline(this.deleteItemOnline(data.id,this.getPeersOnline()));
			//Aqui viene data.id y modo
			//console.log(data);
			if (data===null|| (typeof data==undefined)){
				return false;
			}
	
				try {
					if (this.channelPeers[data.getUsername()]){
						await this.channelPeers[data.getUsername()].close();
					}
				}catch(error) {
					throw new Error(e);
				}

				try {
					if (this.sessionPeers[data.getUsername()]){
						await this.sessionPeers[data.getUsername()].close();
					}
				}catch(error) {
					throw new Error(e);
				}

				try {
					this.channelPeers=this.deleteItem(data.getUsername(),this.channelPeers);
					//delete this.channelPeers[data.username];
				} catch(e) {
					throw new Error(e);
				}

				try {
					this.sessionPeers=this.deleteItem(data.getUsername(),this.sessionPeers);
					//delete this.sessionPeers[data.username];
				} catch(e) {
					throw new Error(e);
				}

				try {
					let remoteuser = this.getRemoteClientID(data.getUsername());
					if (remoteuser){
						if(this.deleteUser(remoteuser.id)){
							console.log("User online deleted.");
						}
					}
				}catch(e){
					throw new Error(e);
				}

		} catch (error) {
			throw new Error(e);
		}
	  }
	  
	async closeSession(){
		try {

			for (let j in this.sessionPeers){
				this.closeSessionUser(j);
		  	}

		  /*
		  for (let i in this.channelPeers){
				if (this.channelPeers.hasOwnProperty(i)){
					await this.channelPeers[i].close();		
				}
		  }

		
		  for (let j in this.sessionPeers){
				if (this.sessionPeers.hasOwnProperty(j)){
					await this.sessionPeers[j].close();		
				}
		  }*/

		} catch (error){
			throw new Error(e);
		}
	}

	closeSessionUser(username){
		try {

			this.closeChannelPeer(username);
			this.closeSessionPeer(username);
			/*
			if (this.channelPeers[username]){
				await this.channelPeers[username].close();			
			}

			if (this.sessionPeers[username]){
				await this.sessionPeers[username].close();	
			}
			*/		

		} catch (error){
			throw new Error(e);
		}
	}

	closeChannelPeer(username){
		try {

			if (this.channelPeers[username]){
				this.channelPeers[username].close();			
			}

		} catch (error){
			throw new Error(e);
		}
	}

	closeSessionPeer(username){
		try {

			if (this.sessionPeers[username]){
				this.sessionPeers[username].close();	
			}
			
		} catch (error){
			throw new Error(e);
		}
	}

	openSession(){
		try {
			
		  this.conectAllPeers();  

		} catch (error){
			throw new Error(e);
		}
	}
	
	async onAnswer(data){
		await this.sessionPeers[data.who].getRTCPeerConnection().setRemoteDescription(new RTCSessionDescription(data.answer));
	};
	  
	async onCandidate(data){

		//console.log("Metodo onCandidate:");
		//await this.sessionPeers[data.who].getRTCPeerConnection().addIceCandidate(new RTCIceCandidate(data.candidate));
		//Restart ICE:
		
		//fix = https://stackoverflow.com/questions/61292934/webrtc-operationerror-unknown-ufrag	
 		data.candidate.usernameFragment = null;
		//end fix

		let candidate = new RTCIceCandidate(data.candidate);
		//let receivers = this.sessionPeers[data.who].getRTCPeerConnection().getReceivers();
		let peer=this;

		//console.log("Cantidate desde señalizador: "+data.usernameFragment);

		let abortCandidate=false;
		
		//let externalCandidate=null;

		if (!abortCandidate){
			this.sessionPeers[data.who].getRTCPeerConnection().addIceCandidate(candidate)
			.then(valor=>{
				this.sessionPeers[data.who].getIceConnectionState().setData(data);
				this.sessionPeers[data.who].getIceConnectionState().doCandidate(peer);
			})
			.catch(e=>{
				throw new Error(e);
			});
		}

	};

	handleSignalingstatechange(event){
		try {

		  console.log("Signalingstatechange: ");
	  
		} catch(e) {
			throw new Error(e);
		}
	}

	forwardExtensionPeer(objdata){
		try {
	  
		  let msj=JSON.parse(objdata);
		  this.portExternals[msj.id].postMessage(objdata);
	  
		} catch(e) {
			throw new Error(e);
		}
	  }
	  
	
	sendByDC(id,msg){

		try {

		  if (this.channelPeers[id] && this.channelPeers[id]!==null && (typeof this.channelPeers[id]!=="undefined")){
			  if (this.channelPeers[id].getState()){
				this.channelPeers[id].getState().operChannel(this,msg,id);
			  }
			
		  }else{
			console.log("No hay datachannel para :"+id);
		  }

		} catch(e) {
			throw new Error(e);
		} 

	}
	  
	existPeerJsonArray(jsonarray,username){
		try {
		/*
			let ok=false;
		for (let i in jsonarray){
			if (jsonarray.hasOwnProperty(i)){
				if (i === username){
				ok=true;
				break;
				}
			}
		}
		*/

		if (jsonarray[username]===null || jsonarray[username]==='undefined' || jsonarray[username]===undefined || ((typeof jsonarray[username]) === undefined)){
			return false;
		}
		return true;

		} catch(e) {
			throw new Error(e);
		}
	  }
	
	createPeer(data,p2pState){
		try {
			
			if (p2pState){
				if (this.existPeerJsonArray(this.sessionPeers,data.getUsername()) || this.existPeerJsonArray(this.channelPeers,data.getUsername())){
					return -1;
				}
			}

			if (this.isNatEnable()){
				this.sessionPeers[data.getUsername()] = new WRTCPeerConnection(this.peerConnectionConfig);
			}else{
				this.sessionPeers[data.getUsername()] = new WRTCPeerConnection(null);
			}
			
			let myPeer = this;
			this.channelPeers[data.getUsername()] = new WRTCDataChannel();
			
			this.channelPeers[data.getUsername()].setDataChannel(this.sessionPeers[data.getUsername()].getRTCPeerConnection().createDataChannel("sendChannel"));
			
			this.sessionPeers[data.getUsername()].onclose(data.getUsername());

			this.channelPeers[data.getUsername()].onclosing(myPeer);
		
			this.channelPeers[data.getUsername()].onopen(myPeer);

			this.channelPeers[data.getUsername()].onclose(myPeer);
									
			this.sessionPeers[data.getUsername()].ondatachannel(myPeer,data.getUsername());

			this.sessionPeers[data.getUsername()].onnegotiationneeded();
			
			this.sessionPeers[data.getUsername()].onsignalingstatechange();
			
			this.sessionPeers[data.getUsername()].onconnectionstatechange(data.getUsername(),data,myPeer);
			
			this.sessionPeers[data.getUsername()].oniceconnectionstatechange(data.getUsername(),data,myPeer);
			
			this.sessionPeers[data.getUsername()].onicecandidate(data.getUsername(),myPeer);

			this.sessionPeers[data.getUsername()].peerCreateOffer(data,myPeer);

		}catch(e){
			throw new Error(e);
		}
	}

	sendOffer(offer,data){
		try {

			this.sendData({
				type: "offer",
				offer: offer,
				target: data.getUsername(),
				who: this.getUsername(),
				id: this.getCliendId(),
				description: this.sessionPeers[data.getUsername()].getLocalDescription()
			});

		} catch(e) {
			throw new Error(e);
		}
		
	}
	  
	isNatEnable(){
		return this.natEnable;
	}

	getSessionsForUser(username){
		try {

			/*
			if (this.sessionForPeer[username]!==null || this.sessionForPeer[username]!=='undefined' || 
				this.sessionForPeer[username]!==undefined || ((typeof this.sessionForPeer[username]) !== undefined)){

			*/
			
			if (this.existPeerJsonArray(this.sessionForPeer,username)){
				return this.sessionForPeer[username];
			}

			throw new Error("No existe session de usuario");
			
		} catch(e) {
			throw new Error(e);
		}
	}

	
	addSessionForUser(data){
		try {

			let session=[];
			let index=0;
			let existe=false;
			let peer_item=null;

			//if (this.sessionForPeer[data.source]===null || this.sessionForPeer[data.source]==='undefined' || this.sessionForPeer[data.source]===undefined || ((typeof this.sessionForPeer[data.source]) === undefined)){
			if (!this.existPeerJsonArray(this.sessionForPeer,data.source)){	
				peer_item={
					username:data.username,
					id:data.id,
				}
				session.push(peer_item);
				this.sessionForPeer[data.source]=session;
				
			}else{
				//Agrega sessiones que no existan
				for (index=0;index<this.sessionForPeer[data.source].length;index++){
						//console.log(this.sessionForPeer[data.source].session[index]);
						if (this.sessionForPeer[data.source][index].username===data.username){
							existe=true;
							break;
						}
				}
				if (!existe){
					peer_item={
						username:data.username,
						id:data.id,
					}	
					this.sessionForPeer[data.source].push(peer_item);
				}
			}
			
		} catch(e) {
			throw new Error(e);
		}
	}

	enableNat(){
		this.natEnable=true;
	}
	
	disableNat(){
		this.natEnable=false;
	}

	searchSession(data){
		try {
			console.log("search session");
		} catch(e) {
			console.log("Error al buscar session peer.");
			console.log(e);
		}
	}

	addSession(data){
		try{
			//console.log("Addsession");
			this.sessionPeers[data.username].getIceConnectionState().setData(data);
			this.sessionPeers[data.username].getIceConnectionState().doSession(this);

		}catch(e){
			throw new Error(e);
		}
	}


	setMode(m){
		
		try {
			
			this.mode=m;

			let obj={
				type:'updatemode',
				element:'extension',
				mode:this.mode,
				username: this.username,
				id:this.cliendId
			};

			this.sendData(obj);

		} catch(e) {
			throw new Error(e);
		}
	}

	peerRemoteUpdateMode(data){
		try {
			if (this.peersOnline[data.id]){
				switch (data.element) {
					case 'extension':
						this.peersOnline[data.id].mode = data.mode;	
						break;
					case 'datachannel':
						this.peersOnline[data.id].readyState_channel = data.readyState;
						break;
				}
			}else{
				console.log("No existe peer para cambiar modo:"+data.username);
			}

		} catch(e) {
			throw new Error(e);
		}
	}

	getMode(){
		return this.mode;
	}

	setConnection(conn){
		this.connection=conn;
	}

	getConnection(){
		if (this.connection){
			return this.connection;
		};
		return false;
	}

	setUserNameVirtual(name){
		this.usernameVirtual = name;
	}

	getUserNameVirtual(){
		return this.usernameVirtual;
	}

	setUsername(){
		try{
			this.username = Math.random().toString(36).substring(7);
			localStorage.setItem("username", this.username);	
		}catch(e){
			throw new Error(e);
		}
	}

	loadId(){
		try {

			let idaux = localStorage.getItem("clientid");
			if (idaux!=="undefined" && idaux !== null){
				this.cliendId = idaux;
			}
		}catch(e){
			throw new Error(e);
		}
	}

	loadUsername(){
		try {

			let usernamestg = localStorage.getItem("username");
			if (usernamestg!=="undefined" && usernamestg !== null){
				this.username= usernamestg;
			}else {
				this.setUsername();
			}

		}catch(e){
			throw new Error(e);
		}
	}

	setConnected(){
		this.connected=true;
	}

	getActions(){
		return this.actions;
	}

	addActions(action){
		if (!this.serviceExists(action)){
			this.actions.push(action);
		}
	}

	serviceExists(service){
		let ok=false;
		for (let i=0;i<this.actions.length;i++){
			if (this.actions[i]===service){
				ok=true;
				break;
			}
		}
		return ok;
	}

	getChannel(){
		return this.receiveChannel;
	}

	setIP(ip){
		this.ip=ip;
	}

	getIP(){
		return this.ip;
	}

	statusChannel(){
	  if (this.receiveChannel){
	    console.log("Receive channel's status has changed to " +
	                 this.getChannel().readyState);
	  }
	}

	getCliendId(){
		return this.cliendId;
	}

	clearClientId(){
		this.cliendId=-1;
		localStorage.setItem("clientid", -1);
	}

	setClientId(id){
		try{
			this.cliendId = id
			localStorage.setItem("clientid", id);
			//browser.storage.local.set({'clientid':id});
		}catch(e){
			throw new Error(e);
		}
		
	}

	getUsername(){
		return this.username;
	}

	getPeersOnline(){
		return this.peersOnline;
	}

	setCommandMessage(){
		this.receiveChannel.onmessage = test;
	}

	getConnected(){
		return this.conected;
	}

	sendData(obj){
		try {
			let connectionWS = this.getConnection();
			if (connectionWS){
				let socket = connectionWS.getConnection();
				if (socket!==null){
					socket.send(JSON.stringify(obj));
				}else{
					console.log("No se puede ejecutar sendData para envio de datos sin esteblecer la conexion con el socket.");
				}
			}else{
				console.log("No se puede ejecutar SendData sin antes tener una instancia de conexion con signal server.");
			}
		}catch(e){
			// statements
			throw new Error(e);
		}
	}

	//fuera de servicio
	loginPeer(){	
		this.sendData(
            {
             type: "login",
             name: this.username
            }
        );
		console.log("Usuario envio login.");
	};

	//fuere de servicio
 	onLogin(success,id,username){

	   if (success){
	   	this.cliendId = id;
	      this.sendData({
	                type: "broadcast",
	                username: this.username,
	                id: this.cliendId
	             });
	   }
	   
	};

	async getIdentityAssertion(pc) {
	  try {
	    const identity = await pc.peerIdentity;
	    return identity;
	  } catch(e) {
	    throw new Error(e);
	  }
	}

	getRemoteClientID(username){
		try {

			
			this.peersOnline.setModeSearch(new searchPolicyUser());
			return this.peersOnline.searchPeer(username);

		} catch (e) {
			throw new Error(e);
		}
	}
	getRemoteUsername(id){
		try {

			this.peersOnline.setModeSearch(new searchPolicyId());
			
			return this.peersOnline.searchPeer(id);

		}catch(e){
			throw new Error(e);
		}
	}

	getStateP2P(username){
		try {
			
			this.peersOnline.setModeSearch(new searchPolicyUser());
			
			let tmp = this.peersOnline.searchPeer(username);
			
			return tmp.getP2P();


		} catch(e) {
			throw new Error(e);
		}
	}

	setIpPeer(username,ip){
			
			this.peersOnline.setModeSearch(new searchPolicyUser());
			let tmp = this.peersOnline.searchPeer(username);
			tmp.setIP(ip);
	}

	updateP2PState(username){
		try {

			this.peersOnline.setModeSearch(new searchPolicyUser());
			
			let peeronline = this.peersOnline.searchPeer(username);
			
			if (peeronline){

				this.sessionPeers[username].getIceConnectionState().setP2PInternal(this,peeronline.getId());
	
				if (peeronline.getP2P()){
					let objsession={
						username:username,
						id:peeronline.getId(),
						source:this.getUsername()
					}
					this.addSession(objsession);
				}else{
					this.closeSessionUser(username)
					/*
					this.deleteSession({
						username:username,
						id:peeronline.getId(),
						source:this.getUsername()
					});
					*/
				}
			}

		} catch(e) {
			throw new Error(e);
		}
	}
	
	setStateP2P(id,state){
				
		console.log("CAMBIO ESTADO: ",state);

		this.peersOnline.setModeSearch(new searchPolicyId());
		
		let user = this.PeersOnline.searchPeer(id);

		if (user){
			if (state){
				user.setP2P(false);
			}else{
				user.setP2P(state);
			}
		}else{
			console.log("PEER NO DISPONIBLE: ",id);
		}
	
	}
	

	onAddUser(data){

	  if (data.getId()===-1){
	  	console.log("Error al ingresar con id negativo");
	  	return false;
	  }

	  
	  if ((data.getId() !== this.getCliendId())){

		this.peersOnline.setModeSearch(new searchPolicyId());
		
		if (this.peersOnline.searchPeer(data.getId())){
			console.log("PEER : ",data.getUsername());
		}else{
			this.peersOnline.addPeer(data);
		}
		return true;
	  }
	  	return false;
	};

	deleteUser(id){
		try{
			let ok=false;
			this.peersOnline.setModeSearch(new searchPolicyId());
			let tmp = this.peersOnline.searchPeer(id);
			if (tmp){
				ok=true;
				this.peersOnline.deletePeer(tmp);
				//this.peersOnline.setCollection(this.peersOnline.deletePeer(tmp));
			}else{
				console.log("No existe user online: ",id);
			}
			return ok;
		} catch(e) {
			throw new Error(e);
		}
	}


	addExtension(dataextension,puerto=null){
		if (dataextension.name===""){
		console.log("Error al ingresar con id negativo");
		return false;
		}

		dataextension['mode']=this.getMode();
		dataextension['source']=this.getUsername();
		dataextension['puerto_id']=dataextension.id;
		//patch siempre actualizar.
		this.extensions[dataextension.name]=dataextension;
		this.addServiceOfPeer(this.getUsername(),{peername:this.getUsername(),name:dataextension.name});

		/* //04/05/2020
		if (this.extensions[dataextension.name]==null || this.extensions[dataextension.name]===undefined || !(typeof this.extensions[dataextension.name] === "unavailable")){
		this.extensions[dataextension.name]=dataextension;
		}else{
		if (this.extensions[dataextension.name]){
			console.log("Extension ya agregada");
			
		}else{
			console.log("sin dato");
		}
		}
		*/
	}

	searchExtension(name){
		let resultado=false;
		for (let i in this.extensions){
			if (this.extensions.hasOwnProperty(i)) {
				if (name===i){
					resultado=this.extensions[i];
					break;
				}
			}
		}
		return resultado;
	}

	/*
	existExtension(name){
			let ok=false;
			for (let i in this.extensions){
			    if (this.extensions.hasOwnProperty(i)) {
			    	if (name===i){
			    		ok=true
			    		break;
			    	}
			    }
			}
			return ok;
	}
	*/

	getPortIdOfExtension(name){
		
		let item = this.searchExtension(name);
		if (item){
			return item.puerto_id
		}
		return item;

		/*
		for (let i in this.extensions){
			if (this.extensions.hasOwnProperty(i)) {
				if (name===i){
					id=this.extensions[i].puerto_id;
					break;
				}
			}
		}
		return id;
		*/
	}	

	getExtensions(){
		return this.extensions;
	}

	addMessageExtension(name,msj){
		if (this.searchExtension(name)){
			let backup=this.extensions_message[name];
			if (backup){
				backup.push(msj);
			}else{
				backup=[];
				backup.push(msj);
				this.extensions_message[name]=backup;
			}
		}
	}

	getMessageForExtension(name){
		return this.extensions_message[name];
	}

	getPanelExtensionMessage(){
		let panel=new PanelScript("extensions_messages/extensiones_message.html");
		panel.setMode("popup");
		return panel.createWindow();
	}
}
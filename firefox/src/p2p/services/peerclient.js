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
		
		this.peerConnectionConfig = {
			iceServers: [
			  {
				urls: '',
				username: '',
				credential: ''
			  },
			  {
				urls: '',
				username: '',
				credential: ''
			  }
			],
			iceTransportPolicy:'all'
		}
		
		this.peersOnline=new CollectionPeers();
		this.usernameVirtual = ""; 
		this.username="";
		this.cliendId=-1;
		this.success=false;
		this.receiveChannel=null;
		this.conected=false;
		this.connection = null;
		this.actions=[];
		this.msjQueue=[];
		this.extensions={};
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
		this.testCommunicaction=null;
		this.signal_server_url="";
		this.eliminarPeers=[];
		this.urlsignalserver="";
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
		let ok=null;
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
					console.log(error);
					console.log("Error al realizar conexion via Socket hacia el servidor señalizador.");
					return null;
				});
			}else{
				console.log("PEER DISABLED.");
			}
			

		} catch (error) {
			console.log("Error al realizar conection al signal server");
		}
	}

	disconnectSignalServer(type="all"){
		try {
			let connection = this.getConnection();
			connection.down(this,type);
		} catch (error) {
			console.log("Error al desconectar signal dserver");
		}
	}

	rcvSignalMessage(data,instancesocket){
		try {
			this.commandMesage.getCommand(data.type).execute(data,instancesocket,this);
		} catch (error) {
			console.log("Error al ejecutar mensaje rcvSignalMessage");
			console.error(error);
		}
	}

	getClonePeersOnline(){
		try {
			return JSON.parse(JSON.stringify(this.getPeersOnline()));
		} catch(e) {
			console.log("Error al realizar clone peers online.");
			console.log(e);
		}
	}

	conectAllPeers(){
		try {

		  if (this.getMode()!=="manager"){
			
			let collection = this.peersOnline.getCopyCollection();

			collection.forEach(item => {
				if (!item.getP2P() && item.getOnline() && item.getMode()!=='manager' && item.getMode()!=='alone' && item.getUsername()!==this.getUsername()){
					this.createPeer(item,false);
				}
			});
		  }
		  
		  
		} catch(e) {
		  console.log("Error al conectar usuarios.");
		  console.log(e);
		}
	};

	conectarP2P(username){
		try {

			let collection = this.peersOnline.getCopyCollection();
			
			collection.forEach(item => {
				if (!item.getP2P() && item.getOnline() && item.getMode()!=='manager' && item.getMode()!=='alone'){
					this.createPeer(item,item.getP2P());
				}
			}); 


		} catch (error) {
			console.log("Error al realizar conection P2P con usuario remoto.");
		}
	}

	getModePeerOnline(username){
		try {
			
			this.PeersOnline.setModeSearch(new searchPolicyUser());
			
			let tmp = this.peersOnline.searchPeer(username);
			
			return tmp.getMode();

		} catch (error) {
			console.log("Error la realizar getModePeerOnline");
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
		  let obj={};
		  for (let i=0;i<max;i++){
			obj[i]={
			  'id':i,
			  'type':this.msjData[i].getType(),
			  'data':this.msjData[i].getData(),
			  'status':this.msjData[i].getState().getStatus()
			};
		  }
		  return obj;
	  
		} catch(e) {
		  console.log("NO es posible acceder a la lista de mensajes del peer");
		  console.log(e);
		}
	  }
	  
	getMsjDataExtension(){
		try {
		  let max = this.msjDataExtension.length;
		  console.log("cantidad de mensajes: "+max);
		  let obj={};
		  for (let i=0;i<max;i++){
			obj[i]={
			  'id':i,
			  'type':this.msjDataExtension[i].getType(),
			  'data':this.msjDataExtension[i].getData(),
			  'status':this.msjDataExtension[i].getState().getStatus(),
			  'extensioname':this.msjDataExtension[i].getExtensionName(),
			  'extensionId':this.msjDataExtension[i].getExtensionId()    
			};
		  }
		  return obj;
		} catch(e) {
		  console.log("NO es posible acceder a la lista de mensajes del peer");
		  console.log(e);
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
		  console.log("Error al crear una lista de mensajes para la extension por paramentro.");
		  console.log(e);
		}
	  }

	acceptPeerMessaje(idmsj){
		try {
		  console.log("Aceptar mensajes");
		  this.msjData[idmsj].changeState(new onAccept());
		} catch(e) {
		  console.log("Error al aceptar el mensaje");
		  console.log(e);
		}
	}

	acceptPeerMessajeExtension(idmsj){
		try{
			//console.log("Aceptar mensajes extension");
			this.msjDataExtension[idmsj].changeState(new onAccept());
		  } catch(e) {
			console.log("Error al aceptar el mensaje");
			console.log(e);
		  }
	}

	doActionMessage(portFromCS,idmsj){
		try{
			this.msjData[idmsj].do(portFromCS);
		} catch (error) {
			console.log("Error doAcionMessage");
			console.log(error);	
		}
	}

	doActionMessageExtension(idmsj,port,idextension){
		try{

			this.msjDataExtension[idmsj].do(port[idextension]);
		} catch (error) {
			console.log("Error doAcionMessage");
			console.log(error);	
		}
	}
	  
	denyPeerMessaje(idmsj){
		try {
		  //console.log("Deny mensajes");
		  this.msjData[idmsj].changeState(new onDeny());
		} catch(e) {
		  console.log("Error al denegar el mensaje");
		  console.log(e);
		}
	  }
	   
	  denyPeerMessajeExtension(idmsj){
		try {
		  this.msjDataExtension[idmsj].changeState(new onDeny());
		} catch(e) {
		  console.log("Error al denegar el mensaje");
		  console.log(e);
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
			console.error("Error al realizar visualizacion de mensajes de conexion.");
			console.log(e);
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
						} catch(e) {
							console.error("No es posible cerrar el canal");
							console.log(e);
						}
					}
					
					if (this.sessionPeers[this.eliminarPeers[i].getUsername()]){
						try {
							await this.sessionPeers[this.eliminarPeers[i].getUsername()].close();
						}catch(e){
							// statements
							console.error("No es posible cerrar RTC");
							console.log(e);
						}
					}

				}
			}
			this.setPeersDeleted();
		} catch (error) {
			console.error("No es posible realizar checkDelete",error);
		}
	}

	async onOffer(data){
		try {

			if (this.existPeerJsonArray(this.sessionPeers,data.who) || this.existPeerJsonArray(this.channelPeers,data.who)){
				console.log("Ya existe una sesion no se puede generar otra");
				return -1;
			}

			let myPeer=this;
	  
			if (this.sessionPeers[data.who]==null || (typeof sessionPeers[data.who]==="undefined")){
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
			await this.sessionPeers[data.who].createAnswer(data,myPeer);

		}catch(e){
		  console.log("Error al realizar Offer");
		  console.log(e);
		}
	};

	deleteItem(username,jsonarray){
		try {
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
			console.log("Error la realizar getModePeerOnline");
		}
	
	}

	async deletePeer(data){
		try{

			if (data===null||data===undefined){
				return null;
			}
	
				try {
					if (this.channelPeers[data.getUsername()]){
						await this.channelPeers[data.getUsername()].close();
					}
				}catch(error) {
					console.error("No existe usuario en el canal de comunicacion: ",error)
				}

				try {
					if (this.sessionPeers[data.getUsername()]){
						await this.sessionPeers[data.getUsername()].close();
					}
				}catch(error) {
					console.log("No existe sesion del usuario: ",error);
				}

				try {
					this.channelPeers=this.deleteItem(data.getUsername(),this.channelPeers);
				} catch(e) {
					console.log("No existe canal para eliminar");
					console.error(e);
				}

				try {
					this.sessionPeers=this.deleteItem(data.getUsername(),this.sessionPeers);
				} catch(e) {
					console.log("No existe sesion para eliminar");
					console.error(e);
				}

				try {
					let remoteuser = this.getRemoteClientID(data.getUsername());
					if (remoteuser){
						if(this.deleteUser(remoteuser.id)){
							console.log("User online deleted.");
						}
					}
				}catch(e){
					console.log("No existe username en lista online");
					console.error(e);
				}

		} catch (error) {
		  console.log("No es posible desconectar el peer de forma completa.");
		  console.log(error);
		}
	  }
	  
	async closeSession(){
		try {

			for (let j in this.sessionPeers){
				this.closeSessionUser(j);
		  	}

		} catch (error){
		  console.error("No es posible eliminar sesion del peer: ");
		  console.error(error);
		}
	}

	closeSessionUser(username){
		try {

			this.closeChannelPeer(username);
			this.closeSessionPeer(username);

		} catch (error){
		  console.error("No es posible eliminar sesion del peer: ");
		  console.error(error);
		}
	}

	closeChannelPeer(username){
		try {

			if (this.channelPeers[username]){
				this.channelPeers[username].close();			
			}

		} catch (error){
		  console.error("No es posible eliminar sesion del peer: ");
		  console.error(error);
		}
	}

	closeSessionPeer(username){
		try {

			if (this.sessionPeers[username]){
				this.sessionPeers[username].close();	
			}
			
		} catch (error){
		  console.error("No es posible eliminar sesion del peer: ");
		  console.error(error);
		}
	}

	openSession(){
		try {
			
		  this.conectAllPeers();  

		} catch (error){
		  console.log("No es posible abrir la conexión del peer: ");
		  console.error(error);
		}
	}
	
	async onAnswer(data){
		await this.sessionPeers[data.who].getRTCPeerConnection().setRemoteDescription(new RTCSessionDescription(data.answer));
	};
	  
	async onCandidate(data){

		//fix = https://stackoverflow.com/questions/61292934/webrtc-operationerror-unknown-ufrag	
 		data.candidate.usernameFragment = null;
		//end fix

		let candidate = new RTCIceCandidate(data.candidate);
		let peer=this;

		let abortCandidate=false;
		
		if (!abortCandidate){
			this.sessionPeers[data.who].getRTCPeerConnection().addIceCandidate(candidate)
			.then(valor=>{
				this.sessionPeers[data.who].getIceConnectionState().setData(data);
				this.sessionPeers[data.who].getIceConnectionState().doCandidate(peer);
			})
			.catch(error=>{
				console.log("Error al utilizar onCandidate sobre receiver.");
				console.error(error);
			});
		}

	};

	handleSignalingstatechange(event){
		try {

		  console.log("Signalingstatechange: ");
	  
		} catch(e) {
		  console.log("Error con Signalingstatechange");
		  console.log(e);
		}
	}

	forwardExtensionPeer(objdata){
		try {
	  
		  let msj=JSON.parse(objdata);
		  this.portExternals[msj.id].postMessage(objdata);
	  
		} catch(e) {
		  console.log("Error al enviar peticion hacia la extension");
		  console.log(e);
		}
	  }
	  
	
	sendByDC(id,msg){

		try {

		  if (this.channelPeers[id] && this.channelPeers[id]!==null && (typeof this.channelPeers[id]!=="undefined")){
			this.channelPeers[id].getState().operChannel(this,msg,id);
		  }else{
			console.log("No hay datachannel para :"+id);
		  }

		} catch(e) {
		  console.log("Error al utilizar envio de datos desde un channel.");
		  console.log(e);
		} 

	}
	  
	existPeerJsonArray(jsonarray,username){
		try {

		if (jsonarray[username]===null || jsonarray[username]==='undefined' || jsonarray[username]===undefined || ((typeof jsonarray[username]) === undefined)){
			return false;
		}
		return true;

		} catch(e) {
		console.log("Error al realizar session peer search");
		console.log(e);
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
		  console.log("Error al crearPeer");
		  console.log(e);
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
			console.log("ERROR sendOffer.");
			console.error(e);
		}
		
	}
	  
	isNatEnable(){
		return this.natEnable;
	}

	getSessionsForUser(username){
		try {

				if (this.existPeerJsonArray(this.sessionForPeer,username)){
					return this.sessionForPeer[username];
				}
				
				return null;
		} catch(e) {
			console.log("Error al realizar pedido de sessiones del peer.");
			console.log(e);
		}
	}

	
	addSessionForUser(data){
		try {

			let session=[];
			let index=0;
			let existe=false;
			let peer_item=null;

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
			console.log("Error al agregar session al peer");
			console.log(e);
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
			this.sessionPeers[data.username].getIceConnectionState().setData(data);
			this.sessionPeers[data.username].getIceConnectionState().doSession(this);

		}catch(e){
			console.log("Error al realizar agregar session del peer.");
			console.log(e);
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
			console.log("Error al realizar setmode");
			console.log(e);
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
			console.log("Error al realizar broadcast update.");
			console.log(e);
		}
	}

	getMode(){
		return this.mode;
	}

	setConnection(conn){
		this.connection=conn;
	}

	getConnection(){
		return this.connection;
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
			console.log(e);
		}
	}

	loadId(){
		try {

			let idaux = localStorage.getItem("clientid");
			if (idaux!=="undefined" && idaux !== null){
				this.cliendId = idaux;
			}
		}catch(e){
			console.log(e);
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
			console.log(e);
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
		}catch(e){
			console.log(e);
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
			if (connectionWS!==null){
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
			console.log("Error al utilizar SendData en Peer class");
			console.error(e);
		}
	}

	loginPeer(){	
		this.sendData(
            {
             type: "login",
             name: this.username
            }
        );
		console.log("Usuario envio login.");
	};

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
	  } catch(err) {
	    console.log("Error identifying remote peer: ", err);
	    return null;
	  }
	}

	getRemoteClientID(username){
		try {

			
			this.peersOnline.setModeSearch(new searchPolicyUser());
			return this.peersOnline.searchPeer(username);

		} catch (error) {
			console.log("No existe el peer");
		}
	}
	getRemoteUsername(id){
		try {

			this.peersOnline.setModeSearch(new searchPolicyId());
			
			return this.peersOnline.searchPeer(id);

		}catch(e){
			console.log("codigo de usuario remoto no existe");
			console.error(e);
		}
	}

	getStateP2P(username){
		try {
			
			this.peersOnline.setModeSearch(new searchPolicyUser());
			
			let tmp = this.peersOnline.searchPeer(username);
			
			return tmp.getP2P();


		} catch(e) {
			console.log(e);
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
			
			if (peeronline!==null){

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
				}
			}

		} catch(e) {
			console.log(e);
		}
	}
	
	setStateP2P(id,state){
				
		this.peersOnline.setModeSearch(new searchPolicyId());
		
		let user = this.PeersOnline.searchPeer(id);

		if (user!==null){
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
			}else{
				console.log("No existe user online: ",id);
			}
			return ok;
		} catch(e) {
			console.log("No existe ningun peer para eliminar.");
			console.log(e);
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
		this.extensions[dataextension.name]=dataextension;
		this.addServiceOfPeer(this.getUsername(),{peername:this.getUsername(),name:dataextension.name});

	}

	searchExtension(name){
		let resultado=null;
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

	getPortIdOfExtension(name){
		
		let id=-1;
		let item = this.searchExtension(name);
		if (item!==null){
			return item.puerto_id
		}
		return item;

	}	

	getExtensions(){
		return this.extensions;
	}

	addMessageExtension(name,msj){
		if (this.searchExtension(name)!==null){
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

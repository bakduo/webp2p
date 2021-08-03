class WRTCPeerConnection {
	
	constructor(config=false){

		if (config){
			this.peerconnection = new RTCPeerConnection(config);
		}else{
			this.peerconnection = new RTCPeerConnection();
		}

		this.iceState;
		this.sessionState;
	}

	setRTCPeerConnection(p){
		this.peerconnection=p;
	}

	getRTCPeerConnection(){
		return this.peerconnection;
	}

	onicecandidate(username,peer){		
		try {

			let wrtc=this;
			this.getRTCPeerConnection().onicecandidate=function(event){
				wrtc.handleCandidate(event,username,peer);
			}

		} catch (error) {
			console.log("Error peerCandidate function handler");
			console.log(error);
		}

	}

	handleCandidate(event,username,peer){
		try {
			if (event.candidate){
				//Inicio de IP
				//https://github.com/diafygi/webrtc-ips codigo sin eso
				//El repo gihub esta deprecated.
				let ip_regex;
				let ip_addr;
				try {
					ip_regex = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/;
					ip_addr = ip_regex.exec(event.candidate.candidate)[1];
				} catch (error) {
					//console.log("Regex ausente por IP.");
				}
				
				//console.log("Ip desde onicecandidate createPeer: ");
				//console.log(ip_addr);
				//Fin IP
				peer.setIP(ip_addr);

				peer.sendData({
				   type: "candidate",
				   candidate: event.candidate,
				   target : username,
				   who:peer.getUsername(),
				   id:peer.getCliendId(),
				   usernameFragment:event.candidate.usernameFragment,
				   ip:ip_addr,
				});

			}else{
				console.log("HANDLE CANDIDATE: "+username);
			}
		} catch (error) {
			console.log("Error peerCandidate function handler");
			console.log(error);
		}
	}

	async createAnswer(data,myPeer){
		try {
			
			let wrtc=this;
			this.getRTCPeerConnection().setRemoteDescription(new RTCSessionDescription(data.offer))
			.then((val)=>{
				//console.log("Contenido de setRemoteDescription");
				//console.log(val);
				return wrtc.peerCreateAnswer(data,myPeer);
			})
			.catch(function(error){
				console.log("Error en setRemoteDescription desde promesa create answer");
				console.log(error);
			});

		} catch(e) {
			throw new Error(e);
		}
	}


	async peerCreateAnswer(data,myPeer){
		try{
			
			let answertmp={};
			let wrtc=this;
			
			//this.sessionPeers[data.who].getRTCPeerConnection().createAnswer()
			this.getRTCPeerConnection().createAnswer()
			.then((answer)=>{
				answertmp=answer;
				//return myPeer.sessionPeers[data.who].getRTCPeerConnection().setLocalDescription(answer);
				return wrtc.getRTCPeerConnection().setLocalDescription(answer);
			  })
			.then(function(val){
				//console.log("Desde la promesa de answer: ");	
				myPeer.sendData({
					type: "answer",
					answer: answertmp,
					target: data.who,
					who: myPeer.getUsername(),
					id: myPeer.getCliendId(),
					description: wrtc.getLocalDescription()
				 });
			  })
			.catch((reason) => {
				console.log('Handle error create answer promise ('+reason+') here.');
			});
			
		}catch (error){
			throw new Error(error);
		}
	}

	async peerCreateOffer(data,myPeer){
		try{

			let offertmp={};
			let wrtc=this;
	
			/*
			let offer = await wrtc.getRTCPeerConnection().createOffer({"iceRestart":true})
			await wrtc.getRTCPeerConnection().setLocalDescription(offer);

			myPeer.sendData({
				type: "offer",
				offer: offertmp,
				target: data.username,
				who: myPeer.getUsername(),
				id: myPeer.getCliendId(),
				description: wrtc.getLocalDescription(),
				natmode:myPeer.isNatEnable()
			});
			*/ //No funciona


			wrtc.getRTCPeerConnection().createOffer({"iceRestart":true}).then((offer)=>{
				offertmp=offer;
				return wrtc.getRTCPeerConnection().setLocalDescription(offer);
			})
			.then(function(val){
				
				myPeer.sendData({
					type: "offer",
					offer: offertmp,
					target: data.username,
					who: myPeer.getUsername(),
					id: myPeer.getCliendId(),
					description: wrtc.getLocalDescription(),
					natmode:myPeer.isNatEnable()
				});
			})
			.catch(
				(reason) => {
					console.log('Handle CreateOffer error ('+reason+').');
				});
			
		}catch(error) {
			throw new Error(error);
		}
	}

	onclose(username,peer){
		try {
			
			this.getRTCPeerConnection().onclose=function(event){
			try {
					
					console.log("Usuario :",username);
					
					console.log("Cerro la conexion RTC");
					
					//console.log(event);

					//console.log("SESSION STATE: ",peer.getSessionPeers()[username].getConnectionState().getName());

					//console.log("ICE CONNECTION STATE: ",peer.getSessionPeers()[username].getIceConnectionState().getName());

					peer.getPeersOnline().setModeSearch(new searchPolicyUser());
					
					let user = peer.getPeersOnline().searchPeer(username);

					peer.getPeersOnline().deletePeer(user);

				} catch (error) {
					throw new Error(error);
				}
			}
		} catch(e) {
			throw new Error(e);;
		}
		
	}

	onnegotiationneeded(){

		try {
			
			this.getRTCPeerConnection().onnegotiationneeded=function(event){
				console.log("negociacion en puerta");
			}

		} catch(e) {
			// statements
			throw new Error(e);
		}
	};

	onsignalingstatechange(){
		try {
			this.getRTCPeerConnection().onsignalingstatechange=function(){
				console.log("señalizacion cambio de estado");
			}
		} catch(e) {
			// statements
			throw new Error(e);
		}
	}

	onconnectionstatechange(username,data,peer){
		try {

			let wrtc = this;
			this.getRTCPeerConnection().onconnectionstatechange=function(event){					
				if ( wrtc.getConnectionState()){
				  wrtc.getConnectionState().handleDo(username,data,peer);
				}
			};

		} catch(e) {
			throw new Error(e);
		}
	}

	oniceconnectionstatechange(username,data,peer){
		try {

			if (peer.getSessionPeers()[username]){
				let wrtc=this;
				this.getRTCPeerConnection().oniceconnectionstatechange=function(event){
					wrtc.getIceConnectionState().setData(data);
					wrtc.getIceConnectionState().handleDo(peer,username);
				}
			}
		}catch(error){
			throw new Error(error);
		}
	}

	ondatachannel(peer,remoteuser){
		try {

			let wrtc=this;

			this.getRTCPeerConnection().ondatachannel=function(event){

				try {

					peer.receiveChannel = event.channel;
					
					myPeer.receiveChannel.onmessage=function(event){
						wrtc.handleReceiveMessage(event,peer,remoteuser);
					};

					myPeer.receiveChannel.onopen=function(event){
						wrtc.handleReceiveChannelStatusChange(event,peer,remoteuser,true);
					};

					myPeer.receiveChannel.onclose =function(event){
						wrtc.handleReceiveChannelStatusChange(event,peer,remoteuser,false);
					};

				}catch (error) {
					throw new Error(error);
				}
			};
			
		}catch(e){
			throw new Error(e);
		}
	}

	handleReceiveChannelStatusChange(event,peer,remoteuser,openchannel) {
		try {
			// statements

			if (peer.receiveChannel){

				if (peer.getSessionPeers()[remoteuser]){

					if(peer.getSessionPeers()[remoteuser].getConnectionState() && peer.getSessionPeers()[remoteuser].getIceConnectionState()){
						
						if(peer.getSessionPeers()[remoteuser].getConnectionState().getName()==="connected"){
							console.log("RTC esta conectado pero canal esta fuera de linea");
						}

					}else{
						
						if (peer.getSessionPeers()[remoteuser].getConnectionState()){
							console.log("ESTADO CONNECTING: "+peer.getSessionPeers()[remoteuser].getConnectionState().getName());
						}
						
						if (peer.getSessionPeers()[remoteuser].getIceConnectionState()){

							console.log("ESTADO ICE: "+peer.getSessionPeers()[remoteuser].getIceConnectionState().getName());
								
								/*
								
								//Agregado
								let browser = new BrowserData();
								
								let peerdata={
									'id':peer.getCliendId(),
									'username':peer.getUsername(),
									'online':true,
									'p2p':true,
									'ip':"",
									"spec":browser,
									'mode':peer.getMode()
								}
								
								let request = new RequestData(JSON.stringify({type:'checkpeer',data:peerdata,peersource:peer.getUsername()}));
								peer.sendByDC(remoteuser,request.toJson());
								
								*/
								
						}
					}
				}

			  }else{
			  	peer.showMessageConnection({title:'Estado de canal de comunicación no activo.',body:'El usuario remoto: '+remoteuser+' no tiene un canal de comunicación accesible.'});
			  }
		} catch(e) {
			throw new Error(e);
		}
	  
	};

	handleReceiveMessage(event,peer){
		try {

			let remoteData = JSON.parse(event.data);

			switch (remoteData.type){

				case "Request":

					if (remoteData.extensioname){
						let requestExtension = new RequestDataExtension(JSON.stringify(remoteData));
						requestExtension.actionRequest(remoteData,peer);
					}else{
						let requestdefault = new RequestData(remoteData.data);
						requestdefault.actionDefault(remoteData,peer);
					}
					break;
			
				case "Response":

					if (remoteData.extensioname){
						let responseExtension = new ResponseDataExtension(JSON.stringify(remoteData));
						responseExtension.actionResponse(remoteData,peer);
					}else{
						let  responsedefault = new ResponseData(remoteData.data);
						responsedefault.actionDefault(remoteData,peer);
					}
					break;

				/*
				case "Service":
					let  servicedefault = new ServiceData(remoteData.data);
					servicedefault.actionDefault(remoteData,peer);
					break;
				*/

			}

		} catch(e) {
			throw new Error(e);
		}
	}


	close(){

		try {
			this.peerconnection.close();
			this.stateIce={};
		} catch(e) {
			throw new Error(e);
		}

	}

	getIceConnectionState(){
		try {
			//El estado depende del peer. Este lo gestiona internamente la interfaz de WebRTC ICE
			//Por lo tanto necesitamos gestionar con un Factory que nos permita operar y representarlo como un objeto.
			if (this.iceState){
				//A falta de un objeto de estado y a fin de faciliar la tarea de gestion sobre la conexion
				if (this.iceState.getName()===this.peerconnection.iceConnectionState){
					return this.iceState;
				}
			}
			let factorystate=new ManagerFactoryHandleIceState();
			this.iceState=factorystate.getState(this.peerconnection.iceConnectionState);
			return this.iceState;
		} catch(e) {
			throw new Error(e);
		}
	}

	getConnectionState(){
		try {
			//El estado depende del peer. Este lo gestiona internamente la interfaz de WebRTC connection
			//Por lo tanto necesitamos gestionar un Factory que nos permita operar y representarlo como un objeto.
			//
			if (this.sessionState){
				//A falta de un objeto de estado y a fin de faciliar la tarea de gestion sobre la conexion
				if (this.sessionState.getName()===this.peerconnection.connectionstate){
					return this.sessionState;
				}
			}
			let factorystate=new ManagerFactoryPeerConnectionState();
			this.sessionState=factorystate.getState(this.peerconnection.connectionstate);
			return this.sessionState;
		} catch(e) {
			throw new Error(e);
		}
	}

	getLocalDescription(){
		return this.peerconnection.localDescription;
	}
}
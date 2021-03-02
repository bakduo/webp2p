class WRTCPeerConnection {
	
	constructor(config=null){

		if (config){
			this.peerconnection = new RTCPeerConnection(config);
		}else{
			this.peerconnection = new RTCPeerConnection();
		}

		this.iceState=null;
		this.sessionState=null;
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
				let ip_regex;
				let ip_addr;
				try {
					ip_regex = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/;
					ip_addr = ip_regex.exec(event.candidate.candidate)[1];
				} catch (error) {
					//console.log("Regex ausente por IP.");
				}
				
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
				return wrtc.peerCreateAnswer(data,myPeer);
			})
			.catch(function(error){
				console.log("Error en setRemoteDescription desde promesa create answer");
				console.log(error);
			});

		} catch(e) {
			console.log("Error al realizar createAnswer");
			console.error(e);
		}
	}


	async peerCreateAnswer(data,myPeer){
		try{
			
			let answertmp=null;
			let wrtc=this;
			
			this.getRTCPeerConnection().createAnswer()
			.then((answer)=>{
				answertmp=answer;
				return wrtc.getRTCPeerConnection().setLocalDescription(answer);
			  })
			.then(function(val){
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
			console.log("Error al crear answer");
			console.log(error);
		}
	}

	async peerCreateOffer(data,myPeer){
		try{

			let offertmp=null;
			let wrtc=this;

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
			console.log("error al crear oferta");
			console.log(error);
		}
	}

	onclose(username,peer){
		try {
			
			this.getRTCPeerConnection().onclose=function(event){
			try {
					

					peer.getPeersOnline().setModeSearch(new searchPolicyUser());
					
					let user = peer.getPeersOnline().searchPeer(username);

					peer.getPeersOnline().deletePeer(user);

				} catch (error) {
					console.log("Error al tratar de cerrar RTC: ",error);
				}
			}
		} catch(e) {
			console.error(e);
		}
		
	}

	onnegotiationneeded(){

		try {
			
			this.getRTCPeerConnection().onnegotiationneeded=function(event){
				console.log("negociacion en puerta");
			}

		} catch(e) {
			// statements
			console.log("Error onnegotiationneeded");
			console.error(e);
		}
	};

	onsignalingstatechange(){
		try {
			this.getRTCPeerConnection().onsignalingstatechange=function(){
				console.log("señalizacion cambio de estado");
			}
		} catch(e) {
			// statements
			console.log(e);
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
			console.log("Error al realizar onconnectionstatechange desde Wrapper");
			console.error(e);
		}
	}

	oniceconnectionstatechange(username,data,peer){
		try {

			if (peer.getSessionPeers()[username] && peer.getSessionPeers()[username]!==null){
				let wrtc=this;
				this.getRTCPeerConnection().oniceconnectionstatechange=function(event){
					wrtc.getIceConnectionState().setData(data);
					wrtc.getIceConnectionState().handleDo(peer,username);
				}
			}
		}catch(error){
			console.error("Error peerIceConnectionStatechange: ",error);
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
					console.log("Error ondatachannel event sobre WRTCPeerConnection");
					console.log(error);
				}
			};
			
		}catch(e){
			console.log("Error al realizar ondatachannel");
			console.log(e);
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
								
						}
					}
				}

			  }else{
			  	peer.showMessageConnection({title:'Estado de canal de comunicación no activo.',body:'El usuario remoto: '+remoteuser+' no tiene un canal de comunicación accesible.'});
			  }
		} catch(e) {
			console.log("Error al utilizar handleReceiveChannelStatusChange desde WRTCPeerConnection");
			console.error(e);
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

			}

		} catch(e) {
			console.log("Falla Handle Receive Message")
			console.error(e);
		}
	}


	close(){

		try {
			this.peerconnection.close();
			this.stateIce=null;
		} catch(e) {
			console.log("Error al utilizar close");
			console.log(e);
		}

	}

	getIceConnectionState(){
		try {
			if (this.iceState){
				if (this.iceState.getName()===this.peerconnection.iceConnectionState){
					return this.iceState;
				}
			}
			let factorystate=new ManagerFactoryHandleIceState();
			this.iceState=factorystate.getState(this.peerconnection.iceConnectionState);
			return this.iceState;
		} catch(e) {
			console.log("Error al utilizar getIceConnectionState");
			console.log(e);
		}
	}

	getConnectionState(){
		try {
			if (this.sessionState){
				if (this.sessionState.getName()===this.peerconnection.connectionstate){
					return this.sessionState;
				}
			}
			let factorystate=new ManagerFactoryPeerConnectionState();
			this.sessionState=factorystate.getState(this.peerconnection.connectionstate);
			return this.sessionState;
		} catch(e) {
			// statements
			console.log(e);
		}
	}

	getLocalDescription(){
		return this.peerconnection.localDescription;
	}
}

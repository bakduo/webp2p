class WRTCDataChannel {

	constructor(){
		this.datachannel=null;
		this.channelState=null;
	}

	setDataChannel(ch){
		this.datachannel=ch;
	}

	getDataChannel(){
		return this.datachannel;
	}

	onclosing(peer){
		try {
			
			let peerLocal=peer;
			this.datachannel.onclosing=function(event){
				console.log("Log onclosing channel");
			}

		} catch(e) {
			console.error("Error sobre evento de cierre del canal.");
			console.log(e);
		}
	}

	close(){
		try {
			this.datachannel.close();
		} catch(e) {
			console.log("Error al realizar close() en WRTCDataChannel ");
			console.log(e);
		}
	}

	onclose(peer){
		try {

			let wrtc=this;
			if (this.getDataChannel()){
				this.getDataChannel().onclose=function(event){
					wrtc.handleSendChannelStatusChange(event,peer);
				}
			}

		} catch(e) {
			console.log("Error al realizar onopen sobre datachannel");
			console.log(e);
		}
	}

	onopen(peer){
		try {

			let wrtc=this;
			this.getDataChannel().onopen=function(event){
				wrtc.handleSendChannelStatusChange(event,peer);
			}

		} catch(e) {
			console.log("Error al realizar onopen sobre datachannel");
			console.log(e);
		}
	}

	async handleSendChannelStatusChange(event,myPeer){
		try {
	
			for (let i in myPeer.getChannelPeers()){
				if (myPeer.getChannelPeers().hasOwnProperty(i)){
					if (myPeer.getChannelPeers()[i]) {
					  
						if (myPeer.getChannelPeers()[i].getState()){
							await myPeer.getChannelPeers()[i].getState().handleDo(myPeer);
						}else{
							console.log("SIN ESTADO PARA CANAL: ",i);
						}
				    }
			  	}	
		  	}
		
		} catch(e) {
			console.log("Error al realizar onopen sobre datachannel");
			console.log(e);
		}	
	}

	send(data){
		try {
			this.datachannel.send(data);
		} catch(e) {
			console.log("Error al realizar send en WRTCDataChannel");
			console.log(e);
		}
	}

	getState(){
		try {
			console.log("Receive channel's status has changed to " + this.getReadyState());

			if (this.channelState!==null){
				if (this.channelState.getName()===this.getReadyState()){
					return this.channelState;
				}
			}
			
			if (this.datachannel){
				let handleStateFactory = new ManagerFactoryHandleChannelState();
				if (handleStateFactory){
					this.channelState = handleStateFactory.getState(this.getReadyState());
					return this.channelState;
				}
			}
			console.log("Canal aun no establecido");
			return null;
			
		} catch(e) {
			console.log("Error al realizar cambio de estado desde DataChannel");
			console.error(e);
		}
	}

	getReadyState(){
		try {
			if (this.datachannel!==null){
				return this.datachannel.readyState;
			}
			return null;
		} catch(e) {
			console.log("Error al relizar readyState en WRTCDataChannel");
			console.log(e);
		}
	}

}

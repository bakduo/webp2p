class WRTCDataChannel {

	constructor(){
		this.datachannel=false;
		this.channelState=false;
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
			throw new Error(e);
		}
	}

	close(){
		try {
			this.datachannel.close();
		} catch(e) {
			throw new Error(e);
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
			throw new Error(e);
		}
	}

	onopen(peer){
		try {

			let wrtc=this;
			this.getDataChannel().onopen=function(event){
				wrtc.handleSendChannelStatusChange(event,peer);
			}

		} catch(e) {
			throw new Error(e);
		}
	}

	async handleSendChannelStatusChange(event,myPeer){
		try {
	
			for (let i in myPeer.getChannelPeers()){
				if (myPeer.getChannelPeers().hasOwnProperty(i)){
					//console.log('Key is: ' + i + '. Value is: ' + channelPeers[i]);
					if (myPeer.getChannelPeers()[i]) {
					  
						if (myPeer.getChannelPeers()[i].getState()){
							//console.log("ESTADO CANAL: ",myPeer.getChannelPeers()[i].getState().getName());
							await myPeer.getChannelPeers()[i].getState().handleDo(myPeer);
						}else{
							console.log("SIN ESTADO PARA CANAL: ",i);
						}
				    }
			  	}	
		  	}
		
		} catch(e) {
			throw new Error(e);
		}	
	}

	send(data){
		try {
			this.datachannel.send(data);
		} catch(e) {
			throw new Error(e);
		}
	}

	getState(){
		try {
			//Patch, Factory, para habilitar trabajar con un objeto de estado que permita comportamiento, en lugar de tratar con una variable de 
			//estado, mismo caso de ICE y Connection.
			console.log("Receive channel's status has changed to " + this.getReadyState());

			if (this.channelState){
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
			return false;
			
		} catch(e) {
			throw new Error(e);
		}
	}

	getReadyState(){
		try {
			if (this.datachannel){
				return this.datachannel.readyState;
			}
			return false;
		} catch(e) {
			throw new Error(e);
		}
	}

}
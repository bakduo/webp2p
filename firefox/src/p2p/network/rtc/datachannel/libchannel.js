class PChannelState{
	
	constructor(name){
		this.name=name;
	}

	getName(){
		return this.name;
	}

	setName(name){
		this.name=name;
	}

	handleDo(p2p){

	}

	operChannel(p2p,msg,id){

	}

}

class PChannelClosedState extends PChannelState{

	constructor(name="closed"){
		super(name);
	}

	handleDo(p2p){
		try {
			p2p.showMessageConnection({title:'Channel WebRTC closed',body:'Canal Cerrado.'});
			console.log("Canal cerrado para: ");
			//alert("Canal Cerrado.");
		} catch(e) {
			console.log("Error al realizar PChannelClosedState: ");
			console.log(e);
		}
	}

	operChannel(p2p,msg,id){
		try {
			console.log("Error! Attempt to send while connection closed.");
		} catch(e) {
			console.log("Error al realizar closed sobre el DataChannel.");
			console.error(e);
		}
	}

}

class PChannelClosingState extends PChannelState{

	constructor(name="closing"){
		super(name);
	}

	handleDo(p2p){
		try {
			console.log("Cerrando canal... ");
			//alert("Cerrando canal.");
		} catch(e) {
			console.log("Error al realizar PChannelClosingState: ");
			console.log(e);
		}
	}

	operChannel(p2p,msg,id){
		try {
			// statements
			console.log("Attempted to send message while closing: ", p2p.getUsername());
		} catch(e) {
			console.log("Error al realizar clossing sobre DataChannel.");
			console.error(e);
		}
	}
}


class PChannelOpenState extends PChannelState{

	constructor(name="open"){
		super(name);
	}

	handleDo(p2p){
		try {
			console.log("Canal abierto: ",p2p.getUsername());
		} catch(e) {
			console.log("Error al realizar PChannelOpenState: ");
			console.log(e);
		}
	}

	operChannel(p2p,msg,id){
		try {
			//porque es async
				//console.log("Enviando mensaje al peer remoto.");
				//hay mensajes encolados?

				//if (p2p.msjQueue.length>0){
				if (p2p.getMsjQueue().length>0){
					console.log("QUEUE MSG SIN FUNCIONAR");
					/*
						p2p.getMsjQueue().forEach((msg) => {
								let idremotepeer_local=p2p.getRemoteClientID(msg.peer_username);
								if (idremotepeer_local>0){
									try {
										//if (p2p.peersOnline[idremotepeer_local].readyState_channel==='open'){
										
										if(p2p.getPeersOnline()[idremotepeer_local].readyState_channel==='open'){
											//p2p.channelPeers[msg.peer_username].send(msg.data);
											p2p.getChannelPeers()[msg.peer_username].send(msg.data);
										}	
									} catch (error) {
										console.log("Error al enviar mensaje encolado hacia: "+msg.peer_username);
										console.log(error);
									}
								}
							}
						);
					*/
				}
				
				if (p2p.getChannelPeers()[id]){
					p2p.getChannelPeers()[id].send(msg);	
				}
				//p2p.channelPeers[id].send(msg);

		} catch(e) {
			console.log("Error al utilizar open sobre datachannel.");
			console.error(e);
		}
	}
}

class PChannelConnectingState extends PChannelState{

	constructor(name="connecting"){
		super(name);
	}

	handleDo(p2p){
		try {
		   console.log("Canal conectando....para: ");
		} catch(e) {
			console.log("Error al realizar PChannelConnectingState: ");
			console.log(e);
		}
	}

	operChannel(p2p,msg,id){
		try {
				//console.log("Connection not open; queueing: " + msg);
			 	if (msg){
					let queuemsj={
						peer_username:id,
						data:msg
					};
					//p2p.msjQueue.push(queuemsj);
					p2p.getMsjQueue().push(queuemsj);
				}
			} catch(e) {
				console.log("Error al realizar operchannel desde connecteing datachannel");
				console.error(e);
			}	
	}

}

class ManagerFactoryHandleChannelState {
	
	constructor(){
		//'failed','disconnected','closed','checking','new','connected'
		this.factory=null;
		/*
		this.factory.push(new PChannelClosingState());
		this.factory.push(new PChannelConnectingState());
		this.factory.push(new PChannelClosedState());
		this.factory.push(new PChannelOpenState());
		*/
	}

	getHandleChannelState(name){
		try {
	
		  let obj=null;
	
		  for (let i=0;i<this.factory.length;i++){
			if (this.factory[i].getName()==String(name)){
			  obj = this.factory[i];
			  break;
			}
		  }
	
		  return obj;
	
		} catch (error) {
		  console.error("Error al buscar comando desde menu: ",error);
		}
	}

	getState(state){
		try {
				switch (state){
					case "closing":
						this.factory = new PChannelClosingState();
					break;
					case "connecting":
						this.factory = new PChannelConnectingState();
					break;
					case "closed":
						this.factory = new PChannelClosedState();
					break;
					case "open":
						this.factory = new PChannelOpenState();
					break;
				}
				return this.factory;
		}catch(e) {
			console.log("Error al realizar getState Channel");
			console.log(e);
		}
	}
}

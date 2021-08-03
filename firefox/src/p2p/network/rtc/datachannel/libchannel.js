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

	//operChannel(p2p,msg,id){
	operChannel(...args){

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
			throw new Error(e);
		}
	}

	//operChannel(p2p,msg,id){
	operChannel(...args){
		try {
			console.log("Error! Attempt to send while connection closed.");
		} catch(e) {
			throw new Error(e);
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
		throw new Error(e);
		}
	}

	//operChannel(p2p,msg,id){
	operChannel(...args){
		try {
			// statements
			console.log("Attempted to send message while closing: ", args[0].getUsername());
		} catch(e) {
			
			throw new Error(e);
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
			throw new Error(e);
		}
	}

	//operChannel(p2p,msg,id){
	operChannel(...args){
		try {
			//porque es async
				//console.log("Enviando mensaje al peer remoto.");
				//hay mensajes encolados?

				//if (p2p.msjQueue.length>0){
				if (args[0].getMsjQueue().length>0){
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
				
				if (args[0].getChannelPeers()[id]){
					args[0].getChannelPeers()[id].send(msg);	
				}
				//p2p.channelPeers[id].send(msg);

		} catch(e) {
			throw new Error(e);
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
			throw new Error(e);
		}
	}

	//operChannel(p2p,msg,id){
	operChannel(...args){
		try {
				//console.log("Connection not open; queueing: " + msg);
			 	if (msg){
					let queuemsj={
						peer_username:args[2],
						data:args[1]
					};
					//p2p.msjQueue.push(queuemsj);
					args[0].getMsjQueue().push(queuemsj);
				}
			} catch(e) {
				throw new Error(e);
			}	
	}

}

class ManagerFactoryHandleChannelState {
	
	constructor(){
		//'failed','disconnected','closed','checking','new','connected'
		this.factory={};
		/*
		this.factory.push(new PChannelClosingState());
		this.factory.push(new PChannelConnectingState());
		this.factory.push(new PChannelClosedState());
		this.factory.push(new PChannelOpenState());
		*/
	}

	getHandleChannelState(name){
		try {
	
		//   let obj=null;
		//   for (let i=0;i<this.factory.length;i++){
		// 	if (this.factory[i].getName()==String(name)){
		// 	  obj = this.factory[i];
		// 	  break;
		// 	}
		//   }	
		//   return obj;

		  const channel = this.factory.find((item)=>{return (item.getName()===String(name))});

		  return channel;
	
		} catch (error) {
			throw new Error(error);
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
			throw new Error(e);
		}
	}
}

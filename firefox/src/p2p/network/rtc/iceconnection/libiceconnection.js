
class PIceConnectionState{

	constructor(name){
		this.name=name;
		this.data=null;
	}

	setData(data){
		this.data=data;
	}

	setName(name){
		this.name=name;
	}

	getName(){
		return this.name;
	}

	handleDo(p2p,username){
	   console.log("action for state");	
	}

	getData(){
		return this.data;
	}

	doCandidate(p2p){
	}

	doSession(p2p){
	}

	setP2PInternal(peer,id){
	}

}

class PIceFailedState extends PIceConnectionState {

   constructor(name="failed"){
   	 super(name);
   }

   handleDo(p2p,username){
   		try{


			p2p.showMessageConnection({title:'Falla ICE WebRTC',body:'Falla usuario remoto: '+username});
			p2p.getPeersOnline().setModeSearch(new searchPolicyUser());
			
			let user = p2p.getPeersOnline().searchPeer(username);
			
			if (user!==null){
				p2p.updateP2PState(username);
				p2p.sendData({
					type: "callCommand",
					source:p2p.getUsername(),
					source_id:p2p.getCliendId(),
					mode:p2p.getMode(),
					method:'reconnect',
					target:user.getUsername(),
					target_id:user.getId()
				});
			}

   		} catch(e) {
   			console.log("Error al realizar PIceFailedState handleDo");
   			console.log(e);
   		}
   }

   doCandidate(p2p){
   	try {
   		//statements
   		console.log("El estado no es connected");
   		console.log(this.name);
   	} catch(e) {
   		console.error(e);
   		console.log("Error al realizar candidate sobre failed");
   	}
   }

   setP2PInternal(peer,id){
	   	try {
	   		// statements
			peer.getPeersOnline().setModeSearch(new searchPolicyId());
			peer.getPeersOnline().searchPeer(id).setP2P(false);

	   	} catch(e) {
	   		console.log("Error al realizar P2P internal, al realizar update desde ice failed.");
	   		console.error(e);
	   	}
   }

}

class PIceDisconnectedState extends PIceConnectionState {

   constructor(name="disconnected"){
   		super(name);
   }

   handleDo(p2p,username){

   		try {
			console.log("desconectado la conexion");
			//console.log(username);
			p2p.getPeersOnline().setModeSearch(new searchPolicyUser());			
			let user = p2p.getPeersOnline().searchPeer(username);
			if (user!==null){
				//Se puede hacer algo mas?
			}

   		} catch(e) {
   			console.log("Error al realizar PIceDisconnectedState handleDo");
   			console.log(e);
   		}
   }

   doCandidate(p2p){
   	try {
   		//statements
   		console.log("El estado no es connected");
   	} catch(e) {
   		console.error(e);
   		console.log("Error al realizar candidate sobre disconnected");
   	}
   }

	setP2PInternal(peer,id){
	   	try {
			peer.getPeersOnline().setModeSearch(new searchPolicyId());
			peer.getPeersOnline().searchPeer(id).setP2P(false);
	   	} catch(e) {
	   		console.log("Error al realizar P2P internal, al realizar update desde ice disconnected.");
	   		console.error(e);
	   	}
   } 
}


class PIceClosedState extends PIceConnectionState {

   constructor(name="closed"){
   	super(name);
   }

   handleDo(p2p,username){
   	try {

		p2p.showMessageConnection({title:'ICE WebRTC closed',body:'ICE cerrado.'});

   	} catch(e) {
   		console.log("Error al realizar PIceClosedState handleDo");
   		console.log(e);
   	}
   }

   doCandidate(p2p){
   	try {
   		// se puede realizar algo mas?
   	} catch(e) {
   		console.error(e);
   		console.log("Error al realizar candidate sobre Closed");
   	}
   }

   setP2PInternal(peer,id){
	   	try {
			peer.getPeersOnline().setModeSearch(new searchPolicyId());
			peer.getPeersOnline().searchPeer(id).setP2P(false);
	   	} catch(e) {
	   		console.log("Error al realizar P2P internal, al realizar update desde ice closed.");
	   		console.error(e);
	   	}
   }
}

class PIceCheckingState extends PIceConnectionState {

   constructor(name="checking"){
   	super(name);
   }

   handleDo(p2p,username){

   	try {
   		p2p.showMessageConnection({title:'Checking ICE state: '+username,body:'Checking...'});
   	} catch(e) {
   		console.log("Error al realizar PIceCheckingState handleDo");
   		console.log(e);
   	}
   }

   doCandidate(p2p){
   	try {
   		//statements
   	} catch(e) {
   		console.error(e);
   		console.log("Error al realizar candidate sobre ICE checking");
   	}
   }

   setP2PInternal(peer,id){
	   	try {
			peer.getPeersOnline().setModeSearch(new searchPolicyId());
			peer.getPeersOnline().searchPeer(id).setP2P(false);
	   	} catch(e) {
	   		console.log("Error al realizar P2P internal, al realizar update desde ice checking.");
	   		console.error(e);
	   	}
   }

}

class PIceNewState extends PIceConnectionState {

   constructor(name="new"){
   	  super(name);
   }

   handleDo(p2p,username){
   	try {
   		p2p.showMessageConnection({title:'ICE new conection.',body:'Nueva conexión: '+username});
   	} catch(e) {
   		console.log("Error al realizar PIceNewState handleDo");
   		console.log(e);
   	}
   }

   doCandidate(p2p){
   	try {
   		//statements
   	} catch(e) {
   		console.error(e);
   		console.log("Error al realizar candidate sobre New ICE");
   	}
   }

   setP2PInternal(peer,id){
	   	try {
			peer.getPeersOnline().setModeSearch(new searchPolicyId());
			peer.getPeersOnline().searchPeer(id).setP2P(false);
	   	}catch(e){
	   		console.log("Error al realizar P2P internal, al realizar update desde ice new.");
	   		console.error(e);
	   	}
   }

}

class PIceConectedState extends PIceConnectionState {

   constructor(name="connected"){
   		super(name);
   }

   handleDo(p2p,username){
   	try {
		p2p.showMessageConnection({title:'ICE Online.',body:'ICE conectado: '+username});
		p2p.updateP2PState(username);
   	} catch(e) {
   		console.log("Error al realizar PIceConectedState handleDo");
   		console.log(e);
   	}
   }

   doCandidate(p2p){
   	try {	  
		//se pued hacer algo mas?
   	} catch(e) {
   		// statements
   		console.log("Error al realizar candidate desde ice connected");
   		console.error(e);
   	}
   }

   doSession(p2p){
   	try {
		let info=this.getData();
   		let objroute={
			type:'updatesession',
			internal:true,
			data:{
					username:info.username,
					id:info.id,
					source:info.source
				}
		}
		p2p.sendData(objroute);
   	} catch(e) {
   		console.log("Error Al realizar doSessio sobre estado connected");
   		console.error(e);
   	}
   }

   setP2PInternal(peer,id){
   	try {
		peer.getPeersOnline().setModeSearch(new searchPolicyId());
		peer.getPeersOnline().searchPeer(id).setP2P(true);

   	} catch(e) {
   		console.log("Error al realizar P2P internal, al realizar update connected.");
   		console.error(e);
   	}
   }
}


class ManagerFactoryHandleIceState {
	
	constructor(){
		//'failed','disconnected','closed','checking','new','connected'
		this.factory=null;
	}

	getState(state){
		try {
				
				switch (state){
					case "failed":
						this.factory = new PIceFailedState(state);
					break;
					case "disconnected":
						this.factory = new PIceDisconnectedState(state);
					break;
					case "closed":
						this.factory = new PIceClosedState(state);
					break;
					case "checking":
						this.factory = new PIceCheckingState(state);
					break;
					case "new":
						this.factory = new PIceNewState(state);
					break;
					case "connected":
						this.factory = new PIceConectedState(state);
					break;
				}
				return this.factory;

		}catch(e) {
			console.log("Error al realizar getState");
			console.log(e);
		}
	}
}
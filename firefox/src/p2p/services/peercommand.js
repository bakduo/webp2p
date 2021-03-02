class PCommandMessage{
	
	constructor(name){
		this.name=name;
	}

	setName(name){
		this.name=name;
	}

	getName(){
		return this.name
	}

	execute(data,instancesocket,p2p){

	}

}

class PCommandLogin extends PCommandMessage{

	constructor(name){
		super(name);
	}

	execute(data,instancesocket,p2p){
		try {
			   //console.log("Recepcion de datos del websocket server");
			   if (data.success){
				  let browser = new BrowserData();
				  p2p.setConnected();
				  p2p.setClientId(data.id);
				  p2p.sendData({
							type:"broadcast",
							username:p2p.getUsername(),
							id:p2p.getCliendId(),
							mode:p2p.getMode(),
							spec:{
								browser:browser
							}
						 });	 
				  instancesocket.keepAlive(instancesocket.getConnection(),p2p);
			   }
		} catch(e) {
			console.log("Error al realizar PCommandLogin: ");
			console.log(e);
		}
	}
}

class PCommandUpdateConnection extends PCommandMessage{
	
	constructor(name){
		super(name);
	}

	execute(data,instancesocket,p2p){
		try {
			  p2p.setConnected();
			  p2p.sendData({
							type: "broadcast",
							username:p2p.getUsername(),
							id:p2p.getCliendId(),
							mode:p2p.getMode(),
						 });
			  instancesocket.keepAlive(instancesocket.getConnection(),p2p);
		} catch(e) {
			console.log("Error al realizar PCommandUpdateConnection: ");
			console.log(e);
		}
	}
}

class PCommandOffer extends PCommandMessage{
	
	constructor(name){
		super(name);
	}

	async execute(data,instancesocket,p2p){
		try {
			 await p2p.onOffer(data);
		} catch(e) {
			console.log("Error al realizar PCommandOffer: ");
			console.log(e);
		}
	}
}

class PCommandAnswer extends PCommandMessage{
	
	constructor(name){
		super(name);
	}

	async execute(data,instancesocket,p2p){
		try {
			await p2p.onAnswer(data);
		} catch(e) {
			console.log("Error al realizar PCommandAnswer: ");
			console.log(e);
		}
	}
}

class PCommandCandidate extends PCommandMessage{
	
	constructor(name){
		super(name);
	}

	async execute(data,instancesocket,p2p){
		try {
			await p2p.onCandidate(data);
			p2p.setIpPeer(data.who,data.ip);
		} catch(e) {
			console.log("Error al realizar PCommandCandidate: ");
			console.log(e);
		}
	}
}

class PCommandListUsers extends PCommandMessage{
	
	constructor(name){
		super(name);
	}

	execute(data,instancesocket,p2p){
		try {
			console.log("usuarios conectados: "+data.usersonline);		
		} catch(e) {
			console.log("Error al realizar PCommandListUsers: ");
			console.log(e);
		}
	}
}

class PCommandResponseBroadcast extends PCommandMessage{
	
	constructor(name){
		super(name);
	}

	execute(data,instancesocket,p2p){
		try {


			  let objbroadcast={
				'id':data.id,
				'username':data.username,
				'online':true,
				'p2p':false,
				'ip':"",
				'reponse':true,
				'mode':data.mode,
				'spec':data.spec
			  }
			  
			  if (p2p.onAddUser(new PeerOnline(data.id,data.username,true,false,"",true,data.mode,data.spec))){
				p2p.getPeersOnline().setModeSearch(new searchPolicyUser());
				let user = p2p.getPeersOnline().searchPeer(data.username);
				p2p.createPeer(user,false);
			  }else{
				  console.log("NO ES POSIBLE AGREGAR PEER DESDE EL SERVIDOR.");
			  }

		}catch(e){
			console.log("Error al realizar PCommandResponseBroadcast: ");
			console.log(e);
		}
	}
}

class PCommandAppendUser extends PCommandMessage{
	
	constructor(name){
		super(name);
	}

	execute(data,instancesocket,p2p){
		try {
			  

		   if (data.id==-1 && data.username!==null){
			console.log("Problema con recepcion de ID");
		   }else{

			  let objinitialbroadcast={
				'id':data.id,
				'username':data.username,
				'online':true,
				'p2p':false,
				'ip':"",
				"spec":data.spec,
				'mode':data.mode
			  }

			  if (p2p.onAddUser(new PeerOnline(data.id,data.username,true,false,"",true,data.mode,data.spec))){
				
				let browser = new BrowserData();

				p2p.sendData({
				  type: "touser",
				  source:p2p.getUsername(),
				  source_id:p2p.getCliendId(),
				  mode:p2p.getMode(),
				  target:data.username,
				  target_id:data.id,
				  spec:{
				  	browser: browser
				  }
				});

				console.log("Usuario :"+data.username+" agregado en lista del Peer. Se envia datos que lo recibio.")
			  }else{
				  console.log("NO ES POSIBLE AGREGAR EL USUARIO,");
			  }
			  console.log("Paso por appenduser...");
		   }  
		}catch(e){
			console.log("Error al realizar PCommandAppendUser: ");
			console.log(e);
		}
	}
}

class PCommandConfirmDelete extends PCommandMessage{
	
	constructor(name){
		super(name);
	}

	execute(data,instancesocket,p2p){
		try {
			console.log("Usuario desconectado: "+data.target);
		}catch(e){
			console.log("Error al realizar PCommandConfirmDelete: ");
			console.log(e);
		}
	}
}

class PCommandUpdateMode extends PCommandMessage{
	
	constructor(name){
		super(name);
	}

	execute(data,instancesocket,p2p){
		try {
			console.log("Estado de actualizado a:");
			p2p.peerRemoteUpdateMode(data.data);			
		}catch(e){
			console.log("Error al realizar PCommandUpdateMode: ");
			console.log(e);
		}
	}
}

class PCommandRPC extends PCommandMessage{
	
	constructor(name){
		super(name);
	}

	execute(data,instancesocket,p2p){
		try{
			switch (data.method) {
				case "delete":
					
					p2p.getPeersOnline().setModeSearch(new searchPolicyId());
					p2p.deletePeer(p2p.getPeersOnline().searchPeer(data.id));

				break;
				case "reconnect":
					p2p.updateP2PState(data.username);
					p2p.getPeersOnline().setModeSearch(new searchPolicyUser());
					let user = p2p.getPeersOnline().searchPeer(data.username);
					p2p.createPeer(user,false);
				break;
			
			}
		    
		}catch(e){
			console.log("Error al realizar PCommandCallCommand: ");
			console.log(e);
		}
	}
}

class PCommandDeleteUser extends PCommandMessage{
	
	constructor(name){
		super(name);
	}

	execute(data,instancesocket,p2p){
		try{
			console.log("Eliminar usuario: ");
			
			p2p.getPeersOnline().setModeSearch(new searchPolicyId());

			let user = p2p.getPeersOnline().searchPeer(data.id);
			
			if (user!==null){
				p2p.deletePeer(user);
			}
			
		}catch(e){
			console.log("Error al realizar PCommandDeleteUser: ");
			console.log(e);
		}
	}
}

class PCommandAckSession extends PCommandMessage{
	
	constructor(name){
		super(name);
	}

	execute(data,instancesocket,p2p){
		try{
			console.log("Peer Local: "+p2p.getUsername());
			console.log("Add session peers for: ");
		}catch(e){
			console.log("Error al realizar PCommandAckSession: ");
			console.log(e);
		}
	}
}

class PCommandResponseSessions extends PCommandMessage{
	
	constructor(name){
		super(name);
	}

	execute(data,instancesocket,p2p){
		try{
			console.log("Respuensta del peer con sessiones");
		}catch(e){

			console.log("Error al realizar PCommandResponseSessions: ");
			console.log(e);
		}
	}
}

class PCommandUpdateSessions extends PCommandMessage{
	
	constructor(name){
		super(name);
	}

	execute(data,instancesocket,p2p){
		try{
			p2p.addSessionForUser(data.data);
		}catch(e){
			console.log("Error al realizar PCommandUpdateSessions: ");
			console.log(e);
		}
	}
}

class ManagerCommandMessage extends PCommandMessage {

	constructor(name='manager'){
		super(name);
		this.executes=[];
	}

	execute(data,instancesocket,p2p){
		console.log("Sin accion");
	}

	addCommand(c){
		try{
			this.executes.push(c);
		} catch(e) {
			console.log("Error al realizar alta de operacion");
			console.error(e);
		}
	}

	getCommand(receptorType){
		try {
			let obj=null;
			for (let i=0;i<this.executes.length;i++){
				if (this.executes[i].getName()==String(receptorType)){
					obj = this.executes[i];
					break;
				}
			}
			return obj;
		} catch (error) {
			console.error("Error al buscar execute: ",error);
		}
	}

}

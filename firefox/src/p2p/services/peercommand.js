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

	//execute(data,instancesocket,p2p){
	execute(...args){

	}

}

class PCommandLogin extends PCommandMessage{

	constructor(name){
		super(name);
	}

	//execute(data,instancesocket,p2p){
	execute(...args){
		try {
			   //console.log("Recepcion de datos del websocket server");
			   if (args[2].success){
				  let browser = new BrowserData();
				  args[2].setConnected();
				  args[2].setClientId(args[0].id);
				  args[2].sendData({
							type:"broadcast",
							username:args[2].getUsername(),
							id:args[2].getCliendId(),
							mode:args[2].getMode(),
							spec:{
								browser:browser
							}
						 });	 
				  //instancesocket.keepAlive(instancesocket.getConnection(),p2p);
			   }
		} catch(e) {
			throw new Error(e);
		}
	}
}

class PCommandUpdateConnection extends PCommandMessage{
	
	constructor(name){
		super(name);
	}

	//execute(data,instancesocket,p2p){
	execute(...args){
		try {
			args[2].setConnected();
			args[2].sendData({
							type: "broadcast",
							username:args[2].getUsername(),
							id:args[2].getCliendId(),
							mode:args[2].getMode(),
						 });
			  //instancesocket.keepAlive(instancesocket.getConnection(),p2p);
		} catch(e) {
			throw new Error(e);
		}
	}
}

class PCommandOffer extends PCommandMessage{
	
	constructor(name){
		super(name);
	}

	//execute(data,instancesocket,p2p){
	execute(...args){
		try {
			
			const operation = async (p2p,data) => {

				 await p2p.onOffer(data);
			}

			operation(args[2],args[0]);

		} catch(e) {
			throw new Error(e);
		}
	}
}

class PCommandAnswer extends PCommandMessage{
	
	constructor(name){
		super(name);
	}

	//async execute(data,instancesocket,p2p){
	execute(...args){
		try {

			//await p2p.onAnswer(data);

			const operation = async (p2p,data) => {

				await p2p.onAnswer(data);
		   }

		   operation(args[2],args[0]);

		} catch(e) {
			throw new Error(e);
		}
	}
}

class PCommandCandidate extends PCommandMessage{
	
	constructor(name){
		super(name);
	}

	//async execute(data,instancesocket,p2p){
	execute(...args){
		try {

			const operation = async (p2p,data)=>{
				await p2p.onCandidate(data);
				p2p.setIpPeer(data.who,data.ip);
			}

			operation(args[0],args[2]);
			
		} catch(e) {
			throw new Error(e);
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
			throw new Error(e);
		}
	}
}

class PCommandResponseBroadcast extends PCommandMessage{
	
	constructor(name){
		super(name);
	}

	//execute(data,instancesocket,p2p){
	execute(...args){
		try {


			//   let objbroadcast={
			// 	'id':data.id,
			// 	'username':data.username,
			// 	'online':true,
			// 	'p2p':false,
			// 	'ip':"",
			// 	'reponse':true,
			// 	'mode':data.mode,
			// 	'spec':data.spec
			//   }
			  
			  if (args[2].onAddUser(new PeerOnline(args[0].id,args[0].username,true,false,"",true,args[0].mode,args[0].spec))){
				//mirrar codigo
				//getDataPeerOnlineSS
				//console.log("usuario agregado.");
				//Desde este punto que asumo visibilidad existente en ambos extremos, entonces iniciamos P2P
				args[2].getPeersOnline().setModeSearch(new searchPolicyUser());
				let user = args[2].getPeersOnline().searchPeer(args[0].username);
				args[2].createPeer(user,false);
			  }else{
				  console.log("NO ES POSIBLE AGREGAR PEER DESDE EL SERVIDOR.");
			  }

		}catch(e){
			throw new Error(e);
		}
	}
}

class PCommandAppendUser extends PCommandMessage{
	
	constructor(name){
		super(name);
	}

	//execute(data,instancesocket,p2p){
	execute(...args){
		try {
			  

		   if (args[0].id==-1 && args[0].username!==null){
			console.log("Problema con recepcion de ID");
		   }else{

			//   let objinitialbroadcast={
			// 	'id':data.id,
			// 	'username':data.username,
			// 	'online':true,
			// 	'p2p':false,
			// 	'ip':"",
			// 	"spec":data.spec,
			// 	'mode':data.mode
			//   }

			  if (args[2].onAddUser(new PeerOnline(args[0].id,args[0].username,true,false,"",true,args[0].mode,args[0].spec))){
				
				let browser = new BrowserData();

				args[2].sendData({
				  type: "touser",
				  source:args[2].getUsername(),
				  source_id:args[2].getCliendId(),
				  mode:args[2].getMode(),
				  target:args[0].username,
				  target_id:args[0].id,
				  spec:{
				  	browser: browser
				  }
				});

				console.log("Usuario :"+args[0].username+" agregado en lista del Peer. Se envia datos que lo recibio.")
			  }else{
				  console.log("NO ES POSIBLE AGREGAR EL USUARIO,");
			  }
			  console.log("Paso por appenduser...");
		   }  
		}catch(e){
			throw new Error(e);
		}
	}
}

class PCommandConfirmDelete extends PCommandMessage{
	
	constructor(name){
		super(name);
	}

	//execute(data,instancesocket,p2p){
	execute(...args){
		try {
			console.log("Usuario desconectado: "+args[0].target);
		}catch(e){
			throw new Error(e);
		}
	}
}

class PCommandUpdateMode extends PCommandMessage{
	
	constructor(name){
		super(name);
	}

	//execute(data,instancesocket,p2p){
	execute(...args){
		try {
			console.log("Estado de actualizado a:");
			args[2].peerRemoteUpdateMode(args[0].data);			
		}catch(e){
			throw new Error(e);
		}
	}
}

class PCommandRPC extends PCommandMessage{
	
	constructor(name){
		super(name);
	}

	//execute(data,instancesocket,p2p){
	execute(...args){
		try{
			console.log("PCommandRPC: ");
			//console.log(data);
			switch (args[0].method) {
				case "delete":
					args[2].getPeersOnline().setModeSearch(new searchPolicyId());
					args[2].deletePeer(args[2].getPeersOnline().searchPeer(args[0].id));
				break;
				case "reconnect":
					args[2].updateP2PState(args[0].username);
					args[2].getPeersOnline().setModeSearch(new searchPolicyUser());
					let user = args[2].getPeersOnline().searchPeer(args[0].username);
					args[2].createPeer(user,false);
				break;
			
			}
		    
		}catch(e){
			throw new Error(e);
		}
	}
}

class PCommandDeleteUser extends PCommandMessage{
	
	constructor(name){
		super(name);
	}

	//execute(data,instancesocket,p2p){
	execute(...args){
		try{
			console.log("Eliminar usuario: ");
			
			args[2].getPeersOnline().setModeSearch(new searchPolicyId());

			let user = args[2].getPeersOnline().searchPeer(args[0].id);
			
			if (user){
				args[2].deletePeer(user);
				//p2p.getPeersOnline().setCollection(p2p.getPeersOnline().deletePeer(user));
			}
			
		}catch(e){
			throw new Error(e);
		}
	}
}

class PCommandAckSession extends PCommandMessage{
	
	constructor(name){
		super(name);
	}

	//execute(data,instancesocket,p2p){
	execute(...args){
		try{
			console.log("Peer Local: "+args[2].getUsername());
			console.log("Add session peers for: ");
		}catch(e){
			throw new Error(e);
		}
	}
}

class PCommandResponseSessions extends PCommandMessage{
	
	constructor(name){
		super(name);
	}

	//execute(data,instancesocket,p2p){
	execute(...args){
		try{
			console.log("Respuensta del peer con sessiones");
		}catch(e){

			throw new Error(e);
		}
	}
}

class PCommandUpdateSessions extends PCommandMessage{
	
	constructor(name){
		super(name);
	}

	//execute(data,instancesocket,p2p){
	execute(...args){
		try{
			args[2].addSessionForUser(args[0].data);
		}catch(e){
			throw new Error(e);
		}
	}
}

class ManagerCommandMessage extends PCommandMessage {

	constructor(name='manager'){
		super(name);
		this.executes=[];
	}

	//execute(data,instancesocket,p2p){
	execute(...args){	
		console.log("Sin accion");
	}

	addCommand(c){
		try{
			this.executes.push(c);
		} catch(e) {
			throw new Error(e);
		}
	}

	getCommand(receptorType){
		try {
			// let obj=null;
			// for (let i=0;i<this.executes.length;i++){
			// 	if (this.executes[i].getName()==String(receptorType)){
			// 		obj = this.executes[i];
			// 		break;
			// 	}
			// }
			// return obj;

			const command = this.executes.find((item)=> {return (item.getName()===String(receptorType))})

			return command;
			
		} catch (error) {
			throw new Error(e);;
		}
	}

}
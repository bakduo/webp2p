class PPeerConnectionState{

	constructor(){
		this.name="";
	}

	setName(name){
		this.name=name;
	}

	getName(){
		return this.name;
	}

	//handleDo(username,data,p2p){
	handleDo(...args){
	   
	   throw new Error("Implementar en la subclass")	
	}
}

class PPeerConnectedState extends PPeerConnectionState {
	constructor(){
		super();
		this.name='connected';
	}

	//handleDo(username,data,p2p){
		handleDo(...args){
		try {
			console.log("Conectado a :"+args[0]);

		} catch(e) {
			throw new Error(e);
		}
	}
}

class PPeerNewState extends PPeerConnectionState {
	constructor(){
		super();
		this.name='new';
	}

	handleDo(...args){
		try {
			console.log("nueva conexión en progreso");
		} catch(e) {
			throw new Error(e);
		}
	}
}


class PPeerDisconnectedState extends PPeerConnectionState {
	constructor(){
		super();
		this.name='disconnected';
	}

	handleDo(...args){
		try {

			//username,data,p2p
			console.log("RTC peer desconectado");
			args[2].getPeersOnline().setModeSearch(new searchPolicyUser());
			let user = args[2].getPeersOnline().searchPeer(args[0]);
			if (user){
				args[2].getPeersDeleted().push(user);
				args[2].checkDelete();
			}
			
			
		} catch(e) {
			throw new Error(e);
		}
	}
}

class PPeerFailedState extends PPeerConnectionState{
	constructor(){
		super();
		this.name='failed';
	}

	//handleDo(username,data,p2p){
	handleDo(...args){
		try {
		    console.log("falla de conexión con el peer onconnectionstatechange");
		} catch(e) {
			throw new Error(e);
		}
	}
}

class PPeerClosedState extends PPeerConnectionState{
	constructor(){
		super();
		this.name='closed';
	}

	handleDo(...args){
		try {
			
			console.log("conexion cerrada connectionstate change");

		} catch(e) {
			throw new Error(e);
		}
	}
}


class ManagerFactoryPeerConnectionState {
	
	constructor(){
		//'failed','disconnected','closed','checking','new','connected'
		this.list=[];
		this.factory={};
	}

	addState(s){
		this.list.push(s);
	}

	getState(state){

		try {

				switch(state){
					case "connected":
						this.factory = new PPeerConnectedState();
					break;
					case "new":
						this.factory = new PPeerNewState();
					break;
					case "disconnected":
						this.factory = new PPeerDisconnectedState();
					case "failed":
						this.factory = new PPeerFailedState();
					break;
					case "closed":
						this.factory = new PPeerClosedState();
					break;
				}

				return this.factory;

		}catch(e) {
			throw new Error(e);
		}
	}
}
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

	handleDo(username,data,p2p){
	   console.log("action for state");	
	}
}

class PPeerConnectedState extends PPeerConnectionState {
	constructor(){
		super();
		this.name='connected';
	}

	handleDo(username,data,p2p){
		try {
			console.log("Conectado a :"+username);

		} catch(e) {
			console.log("Error al realizar PPeerConnectedState: ");
			console.log(e);
		}
	}
}

class PPeerNewState extends PPeerConnectionState {
	constructor(){
		super();
		this.name='new';
	}

	handleDo(username,data,p2p){
		try {
			console.log("nueva conexión en progreso");
		} catch(e) {
			console.log("Error al realizar PPeerNewState: ");
			console.log(e);
		}
	}
}


class PPeerDisconnectedState extends PPeerConnectionState {
	constructor(){
		super();
		this.name='disconnected';
	}

	handleDo(username,data,p2p){
		try {

			console.log("RTC peer desconectado");
			p2p.getPeersOnline().setModeSearch(new searchPolicyUser());
			let user = p2p.getPeersOnline().searchPeer(username);
			if (user!==null){
				p2p.getPeersDeleted().push(user);
				p2p.checkDelete();
			}
			
			
		} catch(e) {
			console.log("Error al realizar PPeerDisconnectedState: ");
			console.log(e);
		}
	}
}

class PPeerFailedState extends PPeerConnectionState{
	constructor(){
		super();
		this.name='failed';
	}

	handleDo(username,data,p2p){
		try {
		    console.log("falla de conexión con el peer onconnectionstatechange");
		} catch(e) {
			console.log("Error al realizar PPeerFailedState: ");
			console.log(e);
		}
	}
}

class PPeerClosedState extends PPeerConnectionState{
	constructor(){
		super();
		this.name='closed';
	}

	handleDo(username,data,p2p){
		try {
			
			console.log("conexion cerrada connectionstate change");

		} catch(e) {
			console.log("Error al realizar PPeerClosedState: ");
			console.log(e);
		}
	}
}


class ManagerFactoryPeerConnectionState {
	
	constructor(){
		this.list=[];
		this.factory=null;
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
			console.log("Error al realizar getState");
			console.log(e);
		}
	}
}

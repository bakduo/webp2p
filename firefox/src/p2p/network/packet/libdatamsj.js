class MsjState{

	constructor(){
		this.status="";
	}

	getStatus(){
		return this.status;
	}

	do(){
		console.log("Sin estado");
	}

}

class onAccept extends MsjState{
	constructor(){
		super();
		this.status="Accept";
	}

	do(objmsj,puertocs){
		try {
			let dataremote1=JSON.parse(objmsj.getData());
			let action = new ActionCode(dataremote1,puertocs);
			action.do();
		} catch(e) {
			console.log("Error al realizar estado Accept");
			console.log(e);
		}
		

	}

}

class onDeny extends MsjState{
	constructor(){
		super();
		this.status="Deny";
	}

	do(){
		console.log(this.status);
	}

	doPost(portCS,objData){
		try {
			objData.do(portCS,this.status);
		} catch(e) {
			console.log("Error al realizar accion sobre estado");
			console.log(e);
		}
	}
}

class onReady extends MsjState{
	constructor(){
		super();
		this.status="Ready";
	}

	do(){
		console.log(this.status);
	}

	doPost(portCS,objData){
		try {
			objData.do(portCS,this.status);
		} catch(e) {
			console.log("Error al realizar accion sobre estado");
			console.log(e);
		}
	}
}

class onQueue extends MsjState{
	constructor(obj){
		super();
		this.status="Queue";
	}

	do(){
		console.log(this.status);
	}

	doPost(portCS,objData){
		try {
			objData.do(portCS,this.status);
		} catch(e) {
			console.log("Error al realizar accion sobre estado");
			console.log(e);
		}
	}
}

class DataMsj{
	
	constructor(obj){
		this.data = obj;
		this.state = new MsjState();
		this.remoteuser="";
		this.type="bytes";
		this.mode="";
		this.name="DataMsj";
		this.dataMsg=true;
	}

	isDataQueue(){
		return this.dataMsg;
	}

	setDataQueue(value){
		this.dataMsg=value;
	}

	getName(){
		return this.name;
	}

	setName(n){
		this.name=n;
	}

	changeState(statenew){
		this.state=statenew;
	}

	setRemoteUser(str){
		this.remoteuser=str;
	}

	getRemoteUser(){
		return this.remoteuser;
	}

	getState(){
		return this.state;
	}

	getType(){
		return this.type;
	}

	setType(t){
		this.type=t;
	}

	getData(){
		return this.data; 
	}

	getMode(){
		return this.mode;
	}

	setMode(m){
		this.mode=m;
	}

	toJson(){
		try {
			
			let obj=JSON.parse(this.getData());

			let objrequest={
			      'type':this.getName(),
			      'data':this.getData(),
			      'mode':this.getMode(),
			      'peersource':obj.peersource
			};

			return JSON.stringify(objrequest);

		} catch(e) {
			
			console.log("Error al convertir objeto a json desde: "+this.getName());
			console.log(e);
		}
	}

	actionDefault(remoteData,peer){
		try {

			this.changeState(new onQueue());
			this.setRemoteUser(remoteData.peersource);

			if (this.isDataQueue()){
				peer.getMsjDataAlone().push(this);
			}

			browser.notifications.create({
				"type": "basic",
				"iconUrl": browser.extension.getURL("icons/quicknote-48.png"),
				"title": this.getName()+" Arrivo contenido de tipo: "+remoteData.type,
				"message": this.getName()+" nuevo dato de peer: "+remoteData.peersource
			});

			if (remoteData.mode && remoteData.mode=="testing"){

				peer.testCommunicaction.setMessage(this);
				peer.testCommunicaction.do(peer.getUsername(),peer.getChannelPeers());
				peer.setMsjDataLength();
			}

		}catch (error){
			console.error("Error al inicair RequestDChannel: ",error);
		}
	}

	actionAutomatic(remoteData,peer){
		try {
			
				if (peer.getMode()=="hybrid" || peer.getMode()=="client"){
						this.changeState(new onAccept());
						return true;
						
				}else{
					console.log("No es un package valido para un "+this.getName()+" automatico de extension.");
				}

				return false;

		} catch (error) {
			console.log("actionAutomatic : es un package con error  "+this.getName());
			console.error("Error al realizar Actionautomatic: ",error);
			return false;
		}
	}

	actionForward(remoteData,peer){
		try {
				if (peer.getMode()=="hybrid"|| peer.getMode()=="server"){
						this.changeState(new onQueue());
						return true;
				}else{
					console.log(" No es un modo para el packet valido en una instancia de "+this.getName()+" extension.");
				}
				return false;
		} catch (error) {
			console.log("Error al procesar action forward: "+this.getName()+" extension.");
			console.error(error);
			return false;
		}
	}

	addService(remoteData,peer){
		try {
			//statements
			if (peer.getMode()=="hybrid"|| peer.getMode()=="server"){
						this.changeState(new onAccept());
				}else{
					console.log(" No es un modo para el packet valido en una instancia de "+this.getName()+" extension.");
				}
		} catch(e) {
			console.log("Error al realizar forwardService");
			console.error(e);
		}
	}
}

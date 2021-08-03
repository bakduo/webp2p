class MsjState{

	constructor(){
		this.status="";
	}

	getStatus(){
		return this.status;
	}

	do(...args){
		throw new Error("Implementar funcionalidad");
	}

}

class onAccept extends MsjState{
	constructor(){
		super();
		this.status="Accept";
	}

	//do(objmsj,puertocs){
	do(...args){	
		try {
			let dataremote1=JSON.parse(args[0].getData());
			let action = new ActionCode(dataremote1,args[1]);
			action.do();
		} catch(e) {
			throw new Error(e);
		}
		

	}

}

class onDeny extends MsjState{
	constructor(){
		super();
		this.status="Deny";
	}

	do(...args){
		console.log(this.status);
	}

	doPost(portCS,objData){
		try {
			objData.do(portCS,this.status);
		} catch(e) {
			throw new Error(e);
		}
	}
}

class onReady extends MsjState{
	constructor(){
		super();
		this.status="Ready";
	}

	do(...args){
		console.log(this.status);
	}

	doPost(portCS,objData){
		try {
			objData.do(portCS,this.status);
		} catch(e) {
			throw new Error(e);
		}
	}
}

class onQueue extends MsjState{
	constructor(obj){
		super();
		this.status="Queue";
	}

	do(...args){
		console.log(this.status);
	}

	doPost(portCS,objData){
		try {
			objData.do(portCS,this.status);
		} catch(e) {
			throw new Error(e);
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
			throw new Error(e);
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
			throw new Error(e);
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
			throw new Error(e);
		}
	}

	actionForward(remoteData,peer){
		try {
				if (peer.getMode()=="hybrid"|| peer.getMode()=="server"){
						this.changeState(new onQueue());
						/*
						this.setSourcePeer(remoteData.source);
						this.setDestinyPeer(remoteData.destiny);
						this.setExtensionName(remoteData.extensioname);
						this.setExtensionId(remoteData.id);
						peer.addDataExtension(this);
						peer.addMessageExtension(remoteData.extensioname,JSON.stringify(remoteData));
						*/
						return true;
				}else{
					console.log(" No es un modo para el packet valido en una instancia de "+this.getName()+" extension.");
				}
				return false;
		} catch (error) {
			throw new Error(e);
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
			throw new Error(e);
		}
	}
}
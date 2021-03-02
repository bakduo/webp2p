class ResponseDataExtension extends DataMsj{

	constructor(obj){
		try {
			super(obj);
			this.name="ResponseDataExtension";
			this.source="";
			this.destiny="";
			this.extensioname="";
			this.extensionId=null;
		} catch(e) {
			console.log("Error al crear response data extension.");
			console.log(e);
		}
	}

	setExtensionId(id){
		this.extensionId=id;
	}

	getExtensionId(){
		return this.extensionId;
	}

	setExtensionName(name){
		this.extensioname=name;
	}

	getExtensionName(){
		return this.extensioname;
	}

	setSourcePeer(name){
		this.source=name;
	}

	getSourcePeer(){
		return this.source;
	}

	setDestinyPeer(name){
		this.destiny=name;
	}

	getDestinyPeer(){
		return this.destiny;
	}

	toJson(){
		try {
			
			//Esto podria variar en un futuro

			let obj=JSON.parse(this.getData());

			let objresponse={
			      'type':"Response",
			      'data':JSON.parse(this.getData()),
			      'extensioname':this.getExtensionName(),
			      'id':this.getExtensionId(),
			      'source':this.source,
			      'destiny':this.destiny
			};
			
			return JSON.stringify(objresponse);

		} catch(e) {
			
			console.log("Error al convertir objeto a json");
			console.log(e);
		}
	}

	actionForward(remoteData,peer){
		try{

			if (super.actionForward(remoteData,peer)){
				this.setSourcePeer(remoteData.source);
				this.setDestinyPeer(remoteData.destiny);
				this.setExtensionName(remoteData.extensioname);
				this.setExtensionId(remoteData.id);
				peer.addDataExtension(this);
				peer.addMessageExtension(remoteData.extensioname,JSON.stringify(remoteData));
				return true;
			}
			return false;
		}catch(error){
			console.log("Error actionForward desde Extension Response: ",error);
			return false;
		}
	}

	queryService(){
		return false;
	}

	actionAutomatic(remoteData,peer){
		try{
			if (super.actionAutomatic(remoteData,peer)){

				this.setSourcePeer(remoteData.source);
				this.setDestinyPeer(remoteData.destiny);
				this.setExtensionName(remoteData.extensioname);
				let puertoId=peer.getPortIdOfExtension(remoteData.extensioname);
				this.setExtensionId(puertoId);
				this.do(peer.getPortExternals()[puertoId]);

			}
		}catch(error){
			console.log("Error actionAutomatic desde Extension Response: ",error);
			return false;
		}
	}

	actionResponse(remoteData,peer){

		try {
				//Por default lo envia
				this.actionAutomatic(remoteData,peer);

			} catch (error) {
				console.error("Error al realizar actionResponse desde "+this.getName()+": ",error);
				return false;
			}
	}

	do(portcs){
		try {
			//Esto podria variar se dejo a fin de posible cambio
			this.getState().do(this,portcs);
		} catch(e) {
			console.log("Error al realizar action sobre un response");
			console.log(e);
		}
	}
}

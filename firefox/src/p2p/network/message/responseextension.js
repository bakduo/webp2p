class ResponseDataExtension extends DataMsj{

	constructor(obj){
		try {
			super(obj);
			//this.responseData={};
			this.name="ResponseDataExtension";
			this.source="";
			this.destiny="";
			this.extensioname="";
			this.extensionId=null;
		} catch(e) {
			throw new Error(e);
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
			throw new Error(e);
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
			throw new Error(error);
		}
	}

	queryService(){
		/*
		let requestExt = new RequestDataExtension(JSON.stringify(objson));
				requestExt.changeState(new onAccept());
				requestExt.setSourcePeer(objson.source);
				requestExt.setDestinyPeer(objson.destiny);
				requestExt.setExtensionName(objson.extensioname);
				requestExt.setExtensionId(objson.id);
				requestExt.do(portFromComando);
		*/
		return false;
	}

	actionAutomatic(remoteData,peer){
		try{
			if (super.actionAutomatic(remoteData,peer)){

				this.setSourcePeer(remoteData.source);
				this.setDestinyPeer(remoteData.destiny);
				this.setExtensionName(remoteData.extensioname);
				//Path for all browser
				let puertoId=peer.getPortIdOfExtension(remoteData.extensioname);
				if (puertoId){
					this.setExtensionId(puertoId);
					this.do(peer.getPortExternals()[puertoId]);
				}
				

			}
		}catch(error){
			throw new Error(error);
		}
	}

	actionResponse(remoteData,peer){

		try {
				//Por default lo envia
				this.actionAutomatic(remoteData,peer);

			} catch (error) {
				throw new Error(error);
			}
	}

	do(portcs){
		try {
			//Esto podria variar se dejo a fin de posible cambio
			this.getState().do(this,portcs);
		} catch(e) {
			throw new Error(e);
		}
	}
}
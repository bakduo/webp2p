class RequestDataExtension extends DataMsj{

	constructor(obj){
		try {
			super(obj);
			this.name="RequestDataExtension";
			this.source="";
			this.destiny="";
			this.extensioname="";
			this.extensionId=null;

		} catch(e) {
			console.log("Error al crear request data extension.");
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

			let objrequest={
			      'type':"Request",
			      'data':JSON.parse(this.getData()),
			      'extensioname':this.getExtensionName(),
			      'id':this.getExtensionId(),
			      'source':this.source,
			      'destiny':this.destiny
			};

			return JSON.stringify(objrequest);

		} catch(e) {
			
			console.log("Error al convertir objeto a json");
			console.log(e);
		}
	}

	actionForward(remoteData,peer){
		try {
				if (super.actionForward(remoteData,peer)){
					this.setSourcePeer(remoteData.source);
					this.setDestinyPeer(remoteData.destiny);
					this.setExtensionName(remoteData.extensioname);
					this.setExtensionId(remoteData.id);
					peer.addDataExtension(this);
					peer.addMessageExtension(remoteData.extensioname,JSON.stringify(remoteData));
					peer.forwardExtensionPeer(JSON.stringify(remoteData));
					return true;
				}
				return false;
		} catch (error) {
			console.error("Error al realizar ActionDefault Extension: ",error);
			return false;
		}
	}

	createResponse(remoteData,msg,username){
		try {

			let responseExt=new ResponseDataExtension(JSON.stringify(msg));
			responseExt.setSourcePeer(username);
			responseExt.setDestinyPeer(remoteData.source);
			responseExt.setExtensionName(remoteData.extensioname);
			responseExt.setExtensionId(remoteData.id);
			return responseExt;

		} catch(e) {
			console.log("Error al realizar response desde Request: ");
			console.log(e);
		}
	}

	actionAutomatic(remoteData,peer){
		try{

			let responseExt;

			if (super.actionAutomatic(remoteData,peer)){

				if (remoteData.data.querys){

					switch (remoteData.data.querys.type) {

						case "services":
							
							let servicios={
								services:peer.getExtensions(),
								source:peer.getUsername(),
								automatic:true,
								withoutcheck:true
							}

							responseExt = this.createResponse(remoteData,servicios,peer.getUsername());

							peer.sendByDC(remoteData.source,responseExt.toJson());
						
						break;

						case "peers":

							let peers={
								peers:peer.getPeersOnline(),
								source:peer.getUsername(),
								automatic:true,
								withoutcheck:true
							}

							responseExt = this.createResponse(remoteData,peers,peer.getUsername());
							peer.sendByDC(remoteData.source,responseExt.toJson());

						break;
					}

				}else{

					this.setSourcePeer(remoteData.source);
					this.setDestinyPeer(remoteData.destiny);
					this.setExtensionName(remoteData.extensioname);
					let puertoId=peer.getPortIdOfExtension(remoteData.extensioname);
					this.setExtensionId(puertoId);
					this.do(peer.getPortExternals()[puertoId]);
					
				}
				return true;
			}
			return false;
		}catch(error){
			console.error("Error al realizar actionAutomatic Extension: ",error);
			return false
		}
	}

	actionRequest(remoteData,peer){
		try {

	
			this.actionAutomatic(remoteData,peer);

		} catch (error) {
			console.error("Error al realizar:"+this.getName()+": ",error);
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

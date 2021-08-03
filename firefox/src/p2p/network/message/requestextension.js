class RequestDataExtension extends DataMsj{

	constructor(obj){
		try {
			super(obj);
			//this.requestData={};
			this.name="RequestDataExtension";
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
			throw new Error(e);
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
			throw new Error(error);
		}
	}

	createResponse(remoteData,msg,username){
		try {

			let responseExt=new ResponseDataExtension(JSON.stringify(msg));
			responseExt.setSourcePeer(username);
			responseExt.setDestinyPeer(remoteData.source);
			//Le respondemos al servicio especifico de lo contrario se queda en el middleware
			responseExt.setExtensionName(remoteData.extensioname);
			responseExt.setExtensionId(remoteData.id);
			return responseExt;

		} catch(e) {
			throw new Error(e);
		}
	}

	actionAutomatic(remoteData,peer){
		try{

			let responseExt;

			if (super.actionAutomatic(remoteData,peer)){

				if (remoteData.data.querys){

					switch (remoteData.data.querys.type) {

						case "services":
							
							//extensioname:remoteData.extensioname,
							//extensionId:remoteData.extensionId
							//Permite enviar los servicios del peer
							//No requiere que se acepte por parte de middleware
							//Le llega de forma automatica como un respuesta al servicio que lo solicito
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
					//this.setExtensionId(remoteData.id);
					//Path for all browser
					let puertoId=peer.getPortIdOfExtension(remoteData.extensioname);
					if (puertoId){
						this.setExtensionId(puertoId);
						this.do(peer.getPortExternals()[puertoId]);
					}
					/*
					Fix mejora para ahorrar pasos para la proxima
					console.log(puertoId);
					if (puertoId){
						console.log("realizar forward");
						//forwardExtensionPeer(this)
						//
					}
					*/
					
					
				}
				return true;
			}
			return false;
		}catch(error){
			throw new Error(error);
		}
	}

	actionRequest(remoteData,peer){
		try {

	
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
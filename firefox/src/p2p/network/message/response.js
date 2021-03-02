class ResponseData extends DataMsj{
	
	constructor(obj){
		try {
			super(obj);
			this.mode="";
		} catch(e) {
			console.log("Error al crear response data.");
			console.log(e);
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

class ServiceData extends DataMsj{
	
	constructor(obj){
		try {
			super(obj);
			//this.packetData={};
			this.name="Service";

		} catch(e) {
			console.log("Error al crear response data.");
			console.log(e);
		}
	}

	toJson(){
		try {
			
			let data=super.toJson();
			let obj=JSON.parse(data);
			obj.type=this.getName();
			obj.data=this.getData();
			return JSON.stringify(obj);

		} catch(e){
			console.log("Error al convertir objeto a json desde: "+this.getName());
			console.log(e);
		}
	}

	actionDefault(remoteData,peer){
		try {

			//La accion de encolar mensajes no es necesario para servicios.
			this.setDataQueue(false);
			super.actionDefault(remoteData,peer);
			this.changeState(new onAccept());
			let obj=JSON.parse(this.getData());
			
			browser.notifications.create({
				"type": "basic",
				"iconUrl": browser.extension.getURL("icons/quicknote-48.png"),
				"title": this.getName()+" Nuevo contenido de tipo: "+remoteData.type+" Del peer: "+remoteData.peersource,
				"message": "Servicio: "+obj.name+" Categoria: "+obj.category+" Descripción: "+obj.description,
			});

			peer.addServiceOfPeer(remoteData.peersource,obj);
		
		}catch(e){
			console.log("Error al realizar actionDefault");
			console.error(e);
		}
	}	
}

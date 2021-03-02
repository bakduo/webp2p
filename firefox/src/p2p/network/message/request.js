class RequestData extends DataMsj{

	constructor(obj){
		try {
			super(obj);
			this.mode="";
			this.name="Request";
			let obj_tmp=JSON.parse(obj);
			if (obj_tmp && obj_tmp.mode!==undefined){
				this.setMode(obj_tmp.mode);
			};
		} catch(e) {
			console.log("Error al crear request data.");
			console.log(e);
		}
	}

	actionDefault(remoteData,peer){
		try {
			
			this.setDataQueue(false);
			
			super.actionDefault(remoteData,peer);

			this.changeState(new onAccept());

			let controlPeer = JSON.parse(remoteData.data);

			if (controlPeer.type=="checkpeer"){

				//Si no existe entonces puede que sea una reconexión de lo contrario deberia existir.
				
				if (peer.getDataPeerOnlineSS(controlPeer.data.username)){
					peer.onAddUser(new PeerOnline(controlPeer.data.id,controlPeer.data.username,controlPeer.data.online,controlPeer.data.p2p,"",null,controlPeer.data.mode,controlPeer.data.spec));
				}
			}

		} catch(e) {
			console.log("Error al usar actionDefault Request.");
			console.error(e);
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

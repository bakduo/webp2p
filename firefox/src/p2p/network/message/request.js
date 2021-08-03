class RequestData extends DataMsj{

	constructor(obj){
		try {
			super(obj);
			this.mode="";
			this.name="Request";
			//Esto facilita que un mensaje en modo testing pueda funcionar de forma transparente.
			let obj_tmp=JSON.parse(obj);
			if (obj_tmp && obj_tmp.mode!==undefined){
				this.setMode(obj_tmp.mode);
			};
		} catch(e) {
			throw new Error(e);
		}
	}

	actionDefault(remoteData,peer){
		try {
			
			this.setDataQueue(false);
			
			super.actionDefault(remoteData,peer);

			this.changeState(new onAccept());

			/*
			{"type":"Request","data":"{
				\"type\":\"checkpeer\",
				\"data\":{
					\"id\":\"1598411666013\",
					\"username\":\"b4n04b\",
					\"online\":true,
					\"p2p\":true,
					\"ip\":\"\",
					\"spec\":{\"language\":\"en-US\",\"platform\":\"Linux x86_64\",\"oscpu\":\"Linux x86_64\",\"plugins\":{},\"geo\":{}},
					\"mode\":\"hybrid\"
					}}",
					"mode":""}
			*/

			let controlPeer = JSON.parse(remoteData.data);

			if (controlPeer.type=="checkpeer"){

				//Si no existe entonces puede que sea una reconexión de lo contrario deberia existir.
				
				if (peer.getDataPeerOnlineSS(controlPeer.data.username)){
					peer.onAddUser(new PeerOnline(controlPeer.data.id,controlPeer.data.username,controlPeer.data.online,controlPeer.data.p2p,"",null,controlPeer.data.mode,controlPeer.data.spec));
				}
			}

		} catch(e) {
			throw new Error(e);
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
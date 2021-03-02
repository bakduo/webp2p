class CommandMessage{

	constructor(name){
		this.name=name;
	}

	getName(){
		return this.name;
	}

	execute(obj1=null,obj2=null,obj3=null,callback){
		console.log("Implementar");
	}

}

class CommandManager extends CommandMessage{

	constructor(name){
		super(name);
		this.commands = [];
	}

	addCommand(c){
		this.commands.push(c);
	}

	execute(obj1=null,obj2=null,obj3=null,callback){
		console.log("Implementar");
	}	

	getCommand(receptorType){
		try {

			let obj=null;
			for (let i=0;i<this.commands.length;i++){
				if (this.commands[i].getName()==String(receptorType)){
					obj = this.commands[i];
					break;
				}
			}

			return obj;

		} catch (error) {
			console.error("Error al buscar comando: ",error);
		}
		
	}
}


class CommandActionAdd extends CommandMessage{

	constructor(name){
		super(name)
	}

	execute(objson,myPeer,obj3=null,callback){
		try {

			myPeer.addActions(objson.action);

		} catch (error) {
			console.error("Error al ejecutar command ActionAdd.");	
		}
		
	}
}

class CommandAddExtension extends CommandMessage{
	constructor(name){
		super(name)
	}

	execute(objson,myPeer,puerto=null,callback){
		try {

			//console.log(objson);
			myPeer.addExtension(objson);

		} catch (error) {
			console.error("Erro al ejecutar command AddExtension");	
		}
		
	}
}


class CommandSendDataToPeer extends CommandMessage{
	constructor(name){
		super(name)
	}

	execute(objson,myPeer,obj3=null,callback){
		try {
          
          let obj_data_service = {
            type: 'app',
            protocol:objson.service,
            data: objson.data
          }
          //envia la modificacion al peer remoto
          let channel = myPeer.getChannelPeers()
		  channel[objson.peer_remoto].send(JSON.stringify(obj_data_service));
		  
		} catch (error) {
			console.error("Error al ejecutar command senddatapeer");
		}
	}
}

class CommandRequest extends CommandMessage{

	constructor(name){
		super(name)
	}

	execute(objson,myPeer,portFromComando,callback){
		try {

			
            if (myPeer.searchExtension(objson.extensioname)!==null){
			  
			  objson['source']=myPeer.getUsername();

              if (myPeer.getMode()==="alone"){
                //el origen ahora simulado es el destino
                let requestExt = new RequestDataExtension(JSON.stringify(objson));
				requestExt.changeState(new onAccept());
				requestExt.setSourcePeer(objson.source);
				requestExt.setDestinyPeer(objson.destiny);
				requestExt.setExtensionName(objson.extensioname);
				requestExt.setExtensionId(objson.id);
				requestExt.do(portFromComando);
              }else{
                if (myPeer.getMode()==="hybrid" || myPeer.getMode()==="client"){
                  callback(objson.destiny,JSON.stringify(objson));
                }else{
                  console.log("No existe la modalidad de request de uso en este modo de Peer.");
                }
			  }
			  
            }else{
              console.log("Extension no existe.");
            }
		  
		} catch (error) {
			console.error("Error al ejecutar command request");
		}
	}
}

class CommandResponse extends CommandMessage{
	
	constructor(name){
		super(name)
	}

	execute(objson,myPeer,portFromComando,callback){
		try {
			
            if (myPeer.searchExtension(objson.extensioname)!==null){
              objson['source']=myPeer.getUsername();
              if (myPeer.getMode()==="alone"){
                let responseExt = new ResponseDataExtension(JSON.stringify(objson));
				responseExt.changeState(new onAccept());
				responseExt.setSourcePeer(objson.source);
				responseExt.setDestinyPeer(objson.destiny);
				responseExt.setExtensionName(objson.extensioname);
				responseExt.setExtensionId(objson.id);
				responseExt.do(portFromComando);
              }else{
                if (myPeer.getMode()==="hybrid" || myPeer.getMode()==="server"){
                 callback(objson.destiny,JSON.stringify(objson));
                }else{
                  console.log("No hay un modo valido para response en el peer.");
                }
              }
            }else{
              console.log("Extension no existe.");
			}
		} catch (error) {
			console.error("Error al ejecutar command response");
		}
	}
}


class CommandgetPeerName extends CommandMessage{
	
	constructor(name){
		super(name)
	}

	execute(objson,myPeer,portFromComando,callback){
		try {
			
			let objusertmp={
				'type':'PeerName',
				'name':myPeer.getUsername(),
			}
			portFromComando.postMessage(JSON.stringify(objusertmp));

		} catch (error) {
			console.error("Error al ejecutar PeerName");
		}
	}
}

class CQuery {
	
	constructor(name){
		this.name=name;
		this.parameters={};
	}

	setName(name){
		this.name=name;
	}

	getName(){
		return this.name;
	}

	setParameter(key,value){
		this.parameters[key]=value;
	}

	getParameters(key){
		return this.parameters[key];
	}

	getAll(){
		return this.parameters;
	}

}

class CQueryPeers extends CQuery{

	constructor(name,key){
		super(name);
		this.protocol={};
		this.setParameter('peers','getPeersOnline');
	}

	setProtocol(proto){
		this.protocol=proto;
	}

	getProtocol(){
		return this.protocol;
	}

	sendQuery(portFromComando,peer){
		try {
			
			let protocol=this.getProtocol();
			
			let actionDo=this.getParameters(protocol.keys.query);
			
			let peerstmp = peer[actionDo]().getCollection();

			let peers = [];
			
			for (let i in peerstmp){
				if (peerstmp.hasOwnProperty(i)){
				  if (peerstmp[i].getP2P()){
					peers.push(peerstmp[i]);
				  }
				}
			};

			let jsonObj={
				'type':'responseQuery',
				'data':{
					'peers':peers,
					'id':peer.getUsername()
				},
				'method':this.getName()
			}

			portFromComando.postMessage(JSON.stringify(jsonObj));

		} catch(e) {
			console.log("Falla el envio de CQueryRequest: "+this.getName());
			console.error(e);
		}
	}
}

class CQueryService extends CQuery{

	constructor(name,key){
		super(name);
		this.protocol={};
		this.setParameter('services','getServicesPeers');
	}

	setProtocol(proto){
		this.protocol=proto;
	}

	getProtocol(){
		return this.protocol;
	}

	//Falta terminar
	sendQuery(portFromComando,peer){
		try {

			let protocol=this.getProtocol();
			let actionDo=this.getParameters(protocol.keys.query);
			let servicios = peer[actionDo]();

			let jsonObj={
				'type':'responseQuery',
				'data':{
					'services':servicios,
					'id':peer.getUsername()
				},
				'method':this.getName()
			}
			
			portFromComando.postMessage(JSON.stringify(jsonObj));
			
		} catch(e) {
			console.log("Falla el envio de CQueryRequest: "+this.getName());
			console.error(e);
		}
	}
}


class CommandgetQueryExtension extends CommandMessage{
	
	constructor(name){
		super(name);
		this.querys=[];
		this.addQuery(new CQueryPeers('peers'));
		this.addQuery(new CQueryService('services'));
	}

	addQuery(q){
		this.querys.push(q);
	}

	getQuery(name){
		try {
			let obj=null;
			for (let i=0;i<this.querys.length;i++){
				if (this.querys[i].getName()==String(name)){
					obj = this.querys[i];
					break;
				}
			}
			return obj;
		} catch (error) {
			console.error("Error al buscar query: ",error);
		}
	}

	execute(objson,myPeer,portFromComando,callback){
		try {

			if (myPeer.searchExtension(objson.extensioname)!==null){

				let q = this.getQuery(objson.keys.query);
				if (q){
					q.setProtocol(objson);
					q.sendQuery(portFromComando,myPeer);
				}
			}
			
		} catch (error) {
			console.error("Error al ejecutar command queryextension");
		}
	}
}


class CommandgetShowPopup extends CommandMessage{
	
	constructor(name){
		super(name)
	}

	execute(objson,myPeer,portFromComando,callback){
		try {

			function onCreated() {
				if (browser.runtime.lastError) {
					console.log(`Error: ${browser.runtime.lastError}`);
				} else{
					console.log("Item created successfully");
				}
			}

			function onError(error){
				console.log(`Error: ${error}`);
			}

			let panel3 = new PanelScript(objson.data.url);
			panel3.setMode("popup");
			let panelScriptData3 = panel3.createWindow();
			let panelWindowScript3 = browser.windows.create(panelScriptData3);
			panelWindowScript3.then(onCreated, onError);

		} catch (error) {
			console.error("Error al ejecutar show popup");
		}
	}
}

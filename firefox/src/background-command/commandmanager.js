class CommandMessage{

	constructor(name){
		this.name=name;
	}

	getName(){
		return this.name;
	}

	//execute(obj1=null,obj2=null,obj3=null,callback){
	execute(...args){

		throw new Error("Se debe impplementar en la clase concreta");
		
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

	execute(...args){
		console.log("Implementar");
	}	

	getCommand(receptorType){
		try {

			// let obj=null;
			// for (let i=0;i<this.commands.length;i++){
			// 	if (this.commands[i].getName()==String(receptorType)){
			// 		obj = this.commands[i];
			// 		break;
			// 	}
			// }
			const command = this.commands.find((item)=>{return (item.getName()===String(receptorType))})

			return command;

		} catch (error) {
			//console.error("Error al buscar comando: ",error);
			throw new Error(error);
		}
		
	}
}


class CommandActionAdd extends CommandMessage{

	constructor(name){
		super(name)
	}

	//execute(objson,myPeer,obj3=null,callback){
	execute(...args){
		try {

			args[1].addActions(args[0].action);

		} catch (error) {
			console.error("Error al ejecutar command ActionAdd.");	
		}
		
	}
}

class CommandAddExtension extends CommandMessage{
	constructor(name){
		super(name)
	}

	//execute(objson,myPeer,puerto=null,callback){
	execute(...args){
		try {
			//console.log(objson);
			args[1].addExtension(args[0]);

		} catch (error) {
			console.error("Erro al ejecutar command AddExtension");	
		}
		
	}
}


class CommandSendDataToPeer extends CommandMessage{
	constructor(name){
		super(name)
	}

	//execute(objson,myPeer,obj3=null,callback){
	execute(...args){
		try {
          
          let obj_data_service = {
            type: 'app',
            protocol:objson.service,
            data: objson.data
          }
          //envia la modificacion al peer remoto
          let channel = args[1].getChannelPeers()
		  channel[args[0].peer_remoto].send(JSON.stringify(obj_data_service));
		  
		} catch (error) {
			throw new Error(error);
		}
	}
}

class CommandRequest extends CommandMessage{

	constructor(name){
		super(name)
	}

	//execute(objson,myPeer,portFromComando,callback){
	execute(...args){
		try {

            if (args[1].searchExtension(args[0].extensioname)){
			  
			  args[0]['source']=args[1].getUsername();

              if (args[1].getMode()==="alone"){
                //el origen ahora simulado es el destino
                let requestExt = new RequestDataExtension(JSON.stringify(args[0]));
				requestExt.changeState(new onAccept());
				requestExt.setSourcePeer(args[0].source);
				requestExt.setDestinyPeer(args[0].destiny);
				requestExt.setExtensionName(args[0].extensioname);
				requestExt.setExtensionId(args[0].id);
				requestExt.do(args[2]);
              }else{
                if (args[1].getMode()==="hybrid" || args[1].getMode()==="client"){
					args[3](objson.destiny,JSON.stringify(args[0]));
                }else{
                  console.log("No existe la modalidad de request de uso en este modo de Peer.");
                }
			  }
			  
            }else{
              console.log("Extension no existe.");
            }
		  
		} catch (error) {
			throw new Error(error);
		}
	}
}

class CommandResponse extends CommandMessage{
	
	constructor(name){
		super(name)
	}

	//execute(objson,myPeer,portFromComando,callback){
	execute(...args){
		try {
			
            if (args[1].searchExtension(args[0].extensioname)){
			  args[0]['source']=args[1].getUsername();
              if (args[1].getMode()==="alone"){
                let responseExt = new ResponseDataExtension(JSON.stringify(args[0]));
				responseExt.changeState(new onAccept());
				responseExt.setSourcePeer(args[0].source);
				responseExt.setDestinyPeer(args[0].destiny);
				responseExt.setExtensionName(args[0].extensioname);
				responseExt.setExtensionId(args[0].id);
				responseExt.do(args[2]);
              }else{
                if (args[1].getMode()==="hybrid" || args[1].getMode()==="server"){
					args[3](objson.destiny,JSON.stringify(args[0]));
                }else{
                  console.log("No hay un modo valido para response en el peer.");
                }
              }
            }else{
              console.log("Extension no existe.");
			}
		} catch (error) {
			throw new Error(error);
		}
	}
}


class CommandgetPeerName extends CommandMessage{
	
	constructor(name){
		super(name)
	}

	//execute(objson,myPeer,portFromComando,callback){
	execute(...args){
		try {
			
			let objusertmp={
				'type':'PeerName',
				'name':myPeer.getUsername(),
			}
			args[2].postMessage(JSON.stringify(objusertmp));

		} catch (error) {
			throw new Error(error);
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
			throw new Error(e);
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

	//execute(objson,myPeer,portFromComando,callback){
	execute(...args){
		try {

			/*
			'type':'queryExtension',
			'method':jsonQuery.method,
			'data':data,
			'extensioname':this.getName(),
			'extensionId':this.getExtensionId()
			*/

			if (args[1].searchExtension(args[0].extensioname)){

				let q = this.getQuery(args[0].keys.query);
				if (q){
					q.setProtocol(args[0]);
					q.sendQuery(args[2],args[0]);
				}
			}
			
		} catch (error) {
			throw new Error(error);
		}
	}
}


class CommandgetShowPopup extends CommandMessage{
	
	constructor(name){
		super(name)
	}

	//execute(objson,myPeer,portFromComando,callback){
	execute(...args){
		try {

			function onCreated(){
				if (browser.runtime.lastError) {
					console.log(`Error: ${browser.runtime.lastError}`);
				} else{
					console.log("Item created successfully");
				}
			}

			function onError(error){
				throw new Error(error);
			}

			let panel3 = new PanelScript(args[0].data.url);
			panel3.setMode("popup");
			let panelScriptData3 = panel3.createWindow();
			let panelWindowScript3 = browser.windows.create(panelScriptData3);
			panelWindowScript3.then(onCreated, onError);

		} catch (error) {
			throw new Error(error);
		}
	}
}
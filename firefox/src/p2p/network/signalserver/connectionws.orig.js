'use strict';
/*
* Copyright 2019 ragonzalez@disroot.org. Licensed under MIT
* See license text at https://mit-license.org/license.txt
*/

class ClientConectionWS{
	
	constructor(server_ws){
		try {

			this.connection;
			this.server_url = server_ws;
			this.timerId = 0;
			this.timerIdReconnect=0;

		} catch(e) {
			console.log("Error al conectar con servidor de senalizacion");
			console.log(e);
		}
	}

	conectar(){
		try {
			
			 return new Promise((resolve,reject) => {
				let conection = new WebSocket(this.server_url);
				if (conection!==null){
					resolve(conection)
					return 0;
				}
				reject("Error al realizar conexion via WebSocket");
				return -1;
			 })

		} catch (error) {
			console.log("Error al realizar conexion via socket");
		}
	}

	onError(evt){
		try {
			console.log("Error sobre la connection socket");
		} catch(e) {
			console.log("Error sobre la connection socket");
			console.log(e);
		}
	}

	getServerUrl(){
		return this.server_url;
	}

	getConnection(){
		return this.connection;
    }

    getStateSocket(){

    	if (this.connection){
    		return this.connection.readyState;
    	}
		return -1;

    }
    
    setConnection(socket){
        this.connection=socket;
    }

	onEventConnect(callback){
		return callback(this);
	}

	sendData(message){
		try {
			
			if (this.connection){
				this.connection.send(JSON.stringify(message));
		    }else{
		      console.log("No hay coneccion aparente con el servidor");
		    }
		  } catch(e) {
		    console.log("Error en socket WS");
		    console.log(e);
		}    
	}

	keepAlive(connection_socket,myPeer){

		var timeout = 20000;	
		try {
			let conection_instance=this;
			if (connection_socket!==null && (typeof connection_socket !== "undefined") && !(typeof connection_socket === "unavailable")){
				if (connection_socket.readyState===1){
					let objkeepalive = {
							'type': "keepAlive"
						};
					myPeer.sendData(objkeepalive);
				}
				this.timerId = setTimeout(function(){
					conection_instance.keepAlive(connection_socket,myPeer);
				}, timeout);
			}
		
		}catch(e) {
		console.log("Error al realizar KeepAlive desde connection.");
		console.log(e);
		}
	}

	pollingReconnect(socket,peer){
		var timeout = 20000;
		try{
			let conection_instance=this;
			if (socket!==null){
				if (socket.readyState===3){
					console.log("Desconectado del servidor");
					try{
						peer.connectSignaServer();	
					}catch(error) {
						console.log("Falla al realizar conexion con el servidor señalizador");
					}
				}else{
					console.log("Estado de la conexion: "+socket.readyState);
					this.timerIdReconnect = setTimeout(function(){
						conection_instance.pollingReconnect(socket,peer);
					}, timeout);
				}
			}

		}catch(error) {
			
		}
	}
	
	cancelKeepAlive(timer){
		clearTimeout(timer);
	}

	async down(peer,type){
		try {
			let connection_socket=this.getConnection();
			
			await connection_socket.close();
			
			peer.setConnection(null);
			
			switch (type) {
				case 'all':
					peer.clearSessionsPeers();
					peer.clearChannelPeers();
					peer.getPeersOnline().clearCollection();
					break;
				case 'only-signal-server':
					break
			}
		}catch(error){
			console.log("Error al realizar Down");
		}
	}
	
	startConnect(myPeer){
			
			let connection_socket=this.getConnection();

			let connection_instance=this;
			
			connection_socket.onerror = function(err){
				console.error('Socket encountered error: ', err.message, 'Closing socket');
				connection_socket.close();
			};
		  
			connection_socket.onclose = function(event){
			  try {
				
				console.log("desconection server signaling..");
				connection_instance.cancelKeepAlive(connection_instance.timerId);
				connection_instance.pollingReconnect(connection_socket,myPeer);

			  }catch(e){
				console.log("No puede ejecutar la orden de cancelacion keepAlive");
				console.log(e);
			  }
			};

			connection_socket.onopen = function(){
					try {
						connection_instance.cancelKeepAlive(connection_instance.timerIdReconnect);	
					} catch (error) {
						console.log("Falla al cancelar timer de re-conexion");
					}
					
					if (myPeer.getCliendId()==-1){
						connection_instance.sendData(
						{
						  type: "login",
						  name: myPeer.getUsername(),
						  mode: myPeer.getMode()
					   }
					  );
					}else{
					  	console.log("enviando reconnect desde extension: "+myPeer.getCliendId());
					  	connection_instance.sendData(
						  {
							'type':"reconnect",
							'clientID': myPeer.getCliendId(),
							'username':myPeer.getUsername(),
							'mode': myPeer.getMode()
						  }
						);
					}
			};
		  
			connection_socket.onmessage = function (message){
				 let data = JSON.parse(message.data);
                 try {
                    myPeer.rcvSignalMessage(data,connection_instance);
                 } catch (error) {
                     console.log("Error al procesar onmessage sobre WebSocket");
                 }
			};
	};
}

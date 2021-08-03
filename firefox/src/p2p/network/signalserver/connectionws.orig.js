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
			throw new Error(e);
		}
	}

	conectar(){
		try {
			
			return new Promise((resolve,reject) => {
				let conection = new WebSocket(this.server_url);
				if (conection){
					resolve(conection)
					//return 0;
				}
				reject("Error al realizar conexion via WebSocket");
				//return -1;
			})

		} catch (e) {
			throw new Error(e);
		}
	}

	/*
	
	basado en:

	http://www.jstips.co/en/javascript/working-with-websocket-timeout/

	*/
 
	onError(evt){
		try {
			console.log("Error sobre la connection socket");
			console.log(evt.data);
		} catch(e) {
			// statements
			throw new Error(e);
			
		}
	}

	getServerUrl(){
		return this.server_url;
	}

	getConnection(){
		if (this.connection){
			return this.connection;
		}
		return false;
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
				//this.connection.emit(message.type,JSON.stringify(message));
				this.connection.send(JSON.stringify(message));
		    }else{
		      console.log("No hay coneccion aparente con el servidor");
		    }
		  } catch(e) {
		    throw new Error(e);
		}    
	}

	keepAlive(connection_socket,myPeer){

		var timeout = 20000;	
		try {
			//Keepalive 
			let conection_instance=this;
			if (connection_socket && (typeof connection_socket !== "undefined") && !(typeof connection_socket === "unavailable")){
				//si esta OPEN
				//Mantiene la conexion wan. En teoria no hace falta pero.... hace falta si existe una conexion debil.
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
			throw new Error(e);
		}
	}

	pollingReconnect(socket,peer){
		var timeout = 20000;
		try{
			let conection_instance=this;
			//if (socket!==null && (typeof socket !== "undefined") && !(typeof socket === "unavailable")){
			if (socket){
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
			throw new Error(e);	
		}
	}
	
	cancelKeepAlive(timer){
		clearTimeout(timer);
	}

	async down(peer,type){
		try {
			let connection_socket=this.getConnection();

			if (connection_socket){
				await connection_socket.close();
				peer.setConnection(false);
				switch (type) {
					case 'all':
						peer.clearSessionsPeers();
						peer.clearChannelPeers();
						peer.getPeersOnline().clearCollection();
						break;
					case 'only-signal-server':
						//peer.connectSignaServer();
						break
				}
			}
		}catch(e){
			throw new Error(e);
		}
	}
	
	startConnect(myPeer){
			
			let connection_socket=this.getConnection();

			if (connection_socket){
				let connection_instance=this;
			
				connection_socket.onerror = function(err){
					console.log("Error sobre la conecion del socket");
					console.error('Socket encountered error: ', err.message, 'Closing socket');
					connection_socket.close();
				};
			
				connection_socket.onclose = function(event){
				try {
					
					console.log("desconection server signaling..");
					connection_instance.cancelKeepAlive(connection_instance.timerId);
					connection_instance.pollingReconnect(connection_socket,myPeer);

				}catch(e){
					throw new Error(e);
				}
				};

				connection_socket.onopen = function(){
						//la conexion fue abierta nuevamente se cancela el polling;
						try {
							connection_instance.cancelKeepAlive(connection_instance.timerIdReconnect);	
						} catch (error) {
							throw new Error(e);
						}
						
						console.log("Login desde socket");
						console.log("iniciando login");
						if (myPeer.getCliendId()===-1){
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


				connection_socket.onlogin = function(data){
					console.log("Desde onlogin aguardo...");
					console.log(data);
				};	

				connection_socket.onmessage = function (message){
					let data = JSON.parse(message.data);
					try {
						myPeer.rcvSignalMessage(data,connection_instance);
					} catch (error) {
						throw new Error(e);
					}
				};
			}
	};
}
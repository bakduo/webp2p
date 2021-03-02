class PeerOnline {
	
	constructor(id,username,online,p2p,ip=null,response=null,mode,spec=null){
		this.id=id;
		this.username=username;
		this.online=online;
		this.p2p=p2p;
		this.ip=ip;
		this.response=response;
		this.mode=mode;
		this.spec=spec;		
	}

	equals(peer){

		if (peer.getUsername()===this.username && peer.getCliendId()===this.id){
			return true;
		}
		return false;
	}

	getUsername(){
		return this.username;
	}

	getId(){
		return this.id;
	}
	
	getMode(){
		return this.mode;
	}

	getSpec(){
		return this.spec;
	}

	getOnline(){
		return this.online;
	}
	
	getP2P(){
		return this.p2p;
	}

	getIP(){
		return this.ip;
	}

	setUsername(u){
		this.username=u;
	}

	setId(id){
		this.id=id;
	}
	
	setMode(m){
		this.mode=m;
	}

	setSpec(s){
		this.spec=s;
	}

	setOnline(o){
		this.online=o;
	}

	setP2P(p2p){
		this.p2p=p2p;
	}

	setIP(ip){
		this.ip=ip;
	}
}
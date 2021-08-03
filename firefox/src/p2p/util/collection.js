class searchPolicy {
	constructor(){
		this.collection=null
	}
	setCollection(col){
		this.collection=col;
	}

	search(item){

	}
}

class searchPolicyUser extends searchPolicy {
	constructor(){
		super();
	}
	
	search(username){
	
		// let tmp=null;
		// for (let index = 0; index < this.collection.length; index++) {
		// 	if (this.collection[index].getUsername()==username){
		// 		tmp=this.collection[index];
		// 		break;
		// 	}
		// }
		// return tmp;

		const policy = this.collection.find((item)=>{return (item.getUsername()===String(username))});

		return policy;
	}
}

class searchPolicyId extends searchPolicy {
	constructor(){
		super();
	}
	
	search(id){

		// let tmp=null;
		// for (let index = 0; index < this.collection.length; index++) {
		// 	if (this.collection[index].getId()===id){
		// 		tmp=this.collection[index];
		// 		break;
		// 	}
		// }
		// return tmp;
		const policy = this.collection.find((item)=>{return (item.getId()===String(id))});

		return policy;
		
	}
}

class CollectionPeers {

	constructor(){
		this.collection=[];
		this.search_strategy=null;
	}

	clearCollection(){
		this.collection=[];
	}

	addPeer(peer){
		this.collection.push(peer);
	}

	deletePeer(peer){
		/*
		//revisar
		let tmp = [];
		for (let i = 0; i < this.collection.length; i++) {
			if (this.collection[i].getUsername()!==peer.getUsername()){
				tmp.push(this.collection[i]);
			}
		}
		if (tmp.length===0){
			return this.collection;
		}
		return tmp
		*/
		//console.log(this.collection);
		this.collection = this.collection.filter((item)=>item.getUsername()!==peer.getUsername());
		//console.log("Despues");
		//console.log(this.collection);
		return this.collection;
	}

	setModeSearch(search){
		this.search_strategy=search;
		this.search_strategy.setCollection(this.collection);
	}

	searchPeer(item){
		return this.search_strategy.search(item);
	}

	getCopyCollection(){
		return JSON.parse(JSON.stringify(this.collection));
	}

	setCollection(c){
		if (Array.isArray(c)){
			this.collection=c;
		}
		
	}

	getCollection(){
		return this.collection;
	}

	getCant(){
		return this.collection.length;
	}

}
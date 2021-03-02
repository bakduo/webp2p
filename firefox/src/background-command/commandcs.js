class CommandCS {
  
    constructor(name){
      this.name=name;
      this.port=null;
      this.peer=null;
    }
  
    getName(){
      return this.name;
    }
  
    setPort(port){
      this.port=port;
    }
  
    setPeer(peer){
      this.peer=peer;
    }
  
    doAction(msg){
  
    }
    
}

class CommandQuery extends CommandCS{
  
    constructor(name){
      super(name);
    }
  
    doAction(msg){
      try {

        console.log(`Llega mensaje desde CS: ${msg}`);
        const peers = this.peer.getClonePeersOnline();
        this.port.postMessage({type:'response',peers:peers});

      } catch(e) {
        console.log("Falla al realizar Login.");
        console.error(e);
      }
    }
}

class CommandManagerCS extends CommandCS{
  
    constructor(name){
      super(name);
      this.commands=[];
    }
  
    addCommand(c){
      this.commands.push(c);
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
        console.error("Error al buscar comando CS: ",error);
      }      
    }
  }


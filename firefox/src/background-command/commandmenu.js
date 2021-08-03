class CommandMenuBack {
  
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
  
    doAction(){
  
    }
    
  }
  
  class CommandListUsersBack extends CommandMenuBack{
  
    constructor(name){
      super(name);
    }
  
    doAction(){
      try {
         this.peer.sendData(
              {
                   type: "listUsers",
                   who:"sample"
              }
          );
  
      } catch(e) {
        throw new Error(e);
      }
    }
  }
  
  class CommandDesconectarBack extends CommandMenuBack{
  
    constructor(name){
      super(name);
    }
  
    doAction(){
      try {
         this.peer.disconnectSignalServer();
      } catch(e) {
        throw new Error(e);
      }
    }
  }
  
  
  class CommandLoginBack extends CommandMenuBack{
  
    constructor(name){
      super(name);
    }
  
    doAction(){
      try {
        if (!this.peer.getConnected()){
          this.peer.sendData(
              {
               type: "login",
               name: this.peer.getUsername()
              }
          );
  
        } 
      } catch(e) {
        throw new Error(e);
      }
    }
  }
  
  class CommandConectarBack extends CommandMenuBack{
  
    constructor(name){
      super(name);
    }
  
    doAction(){
      try {
        
        this.peer.enableNat();
        this.peer.conectAllPeers();
  
      } catch(e) {
        throw new Error(e);
      }
    }
  }
  
  class CommandConectarNoNatBack extends CommandMenuBack{
  
    constructor(name){
      super(name);
    }
  
    doAction(){
      try {
        this.peer.disableNat();
        this.peer.conectAllPeers();
  
      } catch(e) {
        throw new Error(e);
      }
    }
  }
  
  class CommandOpen extends CommandMenuBack{
  
    constructor(name){
      super(name);
    }
  
    doAction(){
      try {
          this.peer.setUrlSignalServer(this.peer.getUrlSignalServer());
          this.peer.clearClientId();
          this.peer.setPeerEnable(true);
          this.peer.enableNat();
          this.peer.connectSignaServer();
  
      } catch(e) {
        throw new Error(e);
      }
    }
  }
  
  class CommandIniciar extends CommandMenuBack{
  
    constructor(name){
      super(name);
    }
  
    doAction(){
      try {
  
        if (this.peer.isEnabled()){
          this.peer.clearClientId();
          this.peer.enableNat();
          this.peer.setPeerEnable(true);
          this.peer.setUrlSignalServer(this.peer.getUrlSignalServer());
          this.peer.connectSignaServer();
        }
        
      } catch(e) {
        throw new Error(e);
      }
    }
  }
  
  
  class CommandClose extends CommandMenuBack{
  
    constructor(name){
      super(name);
    }
  
    doAction(){
      try {
  
        this.peer.closeSession();
        this.peer.setPeerEnable(false);
        this.peer.disconnectSignalServer("all");
    
      } catch(e) {
        throw new Error(e);
      }
    }
  }
  
  class CommandPanelScriptBack extends CommandMenuBack{
  
    constructor(name){
      super(name);
    }
  
    doAction(){
      try {
        
        let panel = new PanelScript("popup/script.html");
        panel.setMode("popup");
        let panelScriptData = panel.createWindow();
        let panelWindowScript = browser.windows.create(panelScriptData);
        panelWindowScript.then(onCreated, onError);
  
      } catch(e) {
        throw new Error(e);
      }
    }
  }
  
  class CommandCodeScriptBack extends CommandMenuBack{
  
    constructor(name){
      super(name);
    }
  
    doAction(){
      try {
        
        let panel2 = new PanelScript("popup/codescript.html");
        panel2.setMode("popup");
        let panelCodingData=panel2.createWindow();
        let panelWindowScript2 = browser.windows.create(panelCodingData);
        panelWindowScript2.then(onCreated, onError);
  
      } catch(e) {
        throw new Error(e);
      }
    }
  }
  
  class CommandManagerMenuBack extends CommandMenuBack{
  
    constructor(name){
      super(name);
      this.commands=[];
    }
  
    addCommand(c){
      this.commands.push(c);
    }
  
    getCommand(receptorType){
      try {
  
        //let obj=null;
        // for (let i=0;i<this.commands.length;i++){
        //   if (this.commands[i].getName()==String(receptorType)){
        //     obj = this.commands[i];
        //     break;
        //   }
        // }

        const command = this.commands.find((item)=>{return (item.getName()===String(receptorType))});

        return command;
  
      } catch (error) {
        throw new Error(error);
      }
      
    }
  }
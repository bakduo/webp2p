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
        console.log("Falla al realizar ListUsers.");
        console.error(e);
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
        console.log("Falla al realizar disconnect.");
        console.error(e);
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
        console.log("Falla al realizar Login.");
        console.error(e);
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
        console.log("Falla al realizar conectar modo NAT.");
        console.error(e);
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
        console.log("Falla al realizar conectar modo NO NAT.");
        console.error(e);
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
        console.log("Falla al realizar reload connection desde menu.");
        console.error(e);
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
        console.log("Falla al realizar reload connection desde menu.");
        console.error(e);
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
        console.log("Falla al realizar reload connection desde menu.");
        console.error(e);
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
        console.log("Falla al realizar mostrar menu de script.");
        console.error(e);
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
        console.log("Falla al realizar reload connection desde menu.");
        console.error(e);
      }
    }
  }

  class CommandAdmin extends CommandMenuBack{
  
    constructor(name){
      super(name);
    }
  
    doAction(){
      try {
        let panel2 = new PanelScript("paneladmin/index.html");
        panel2.show();  
      } catch(e) {
        console.log("Falla al realizar reload connection desde menu.");
        console.error(e);
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
  
        let obj=null;
  
        for (let i=0;i<this.commands.length;i++){
          if (this.commands[i].getName()==String(receptorType)){
            obj = this.commands[i];
            break;
          }
        }
  
        return obj;
  
      } catch (error) {
        console.error("Error al buscar comando desde menu: ",error);
      }
      
    }
  }
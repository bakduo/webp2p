
function getGeo(){
    if('geolocation' in navigator) {
      return true;
    } else {
      return false;
    }
  }

async function getGeoCoord(){
    try {

        let coord={lat:0,long:0};
        
        if (getGeo()){
          await navigator.geolocation.getCurrentPosition((position) => {
            coord.lat=position.coords.latitude;
            coord.long=position.coords.longitude;
          })
        }
        
        return coord;
    } catch(e) {
      throw new Error(e);
    }
 }

class BrowserData{

    constructor(){
      this.language=navigator.language;
      this.networkInformation=navigator.connection;
      this.memory=navigator.deviceMemory;
      this.platform = navigator.platform;
      this.oscpu = navigator.oscpu;
      this.plugins = navigator.plugins;
      this.geo=getGeoCoord();
    }
  
    setCoord(){
        this.geo=this.getGeoCoord();
    }
  
    getPlugins(){
      this.plugins = navigator.plugins;
      return this.plugins;
    }
  
    getCPU(){
      return this.oscpu;
    }
  
    getPlatform(){
      return this.platform;
    }
    
    getMemory(){
      this.memory=navigator.deviceMemory;
      return this.memory;   
    }
  }  
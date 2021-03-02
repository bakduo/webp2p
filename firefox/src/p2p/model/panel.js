class PanelScript{

	constructor(url){
		this.url_resource=browser.extension.getURL(url);
		this.modePanel="";
	}

	setUrl(url){
		this.url_resource=url;
	}

	setMode(mode){
		this.modePanel=mode;
	}

	createWindow(){
		try {
			let createData;
			switch (this.modePanel){
        		case "popup":
        			 createData = {
					      'type': "popup",
					      'url':this.url_resource,
					      'height': 350,
    					  'width': 300,
					};

					console.log("iniciando popup");
        			break;
        	}
        	return createData;
		}catch(e) {
			console.log("Error al generar json de window");
			console.log(e);
		}
	}

	show(){
		try {
			
		console.log("Acceso open windows panel script");
        console.log("URL: "+this.url_resource);
        
        if (this.modePanel==""){
        	browser.tabs.create({
                       "url": this.url_resource
                      });
        }else{
        	console.log("solo create tabs");
        }
        

		} catch(e) {
			// statements
			console.log(e);
		}
	}

	close(){

	}	
}
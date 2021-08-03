
class ActionType{

	constructor(datatype){

		if (datatype=="" || datatype==null || datatype=="undefined"){
			this.dataobj=null;
		}else{
			this.dataobj=datatype;
		}
		this.type="";
	}

	do(puertoCS){
		try{
			console.log("Action con puerto: ");
			console.log("manipulacion de dataObj: ");
		}catch(e){
			console.log("Action no funcional para este tipo");
			console.log(e);
		}
	}
}

class AScript extends ActionType{
	
	constructor(dataobj){
		super(dataobj);
		this.type="script";
	}

	do(puertoCS){
		try {
			puertoCS.postMessage({'type':"execjs", 'data':this.dataobj.data});
		} catch(e) {
			console.log("Error al realizar accion AScript.");
			console.log(e);
		}
	}
}

class ADomHmtl extends ActionType{
	constructor(dataobj){
		super(dataobj);
		this.type="domhtml";
	}

	do(puertoCS){
		try {
			puertoCS.postMessage({'type':"domcs", 'data':this.dataobj.data});
		} catch(e) {
			console.log(e);
		}
	}
}

class builderAction{
	constructor(){
		console.log("constructor base");
	}
}

class builderScript extends builderAction{

	constructor(objdata){
		super();
		this.odata=objdata;
	}

	getScript(){
		try {
			console.log("buildscript creacion de AScript.");
			if (this.odata.type=="script"){
				return new AScript(this.odata);
			}
		} catch(e) {
			console.log("error al construir script object");
			console.log(e);
		}
	}
}

class builderDomHtml extends builderAction{

	constructor(objdata){
		super();
		this.odata=objdata;
	}

	getDomHtml(){
		try {
			console.log("buildomhtml creacion de ADomHmtl.");
			if (this.odata.type=="domhtml"){
				return new ADomHmtl(this.odata);
			}
		} catch(e) {
			console.log("error al construir script object");
			console.log(e);
		}
	}
}

class ActionCode{
	
	constructor(dataObj,port){
		this.portToCS=port;
		this.dataobj=dataObj;
	}

	do(){

		try {
			switch (this.dataobj.type){
				/*
				case "loadJson":
					
				break;
				case "script":
					
					browser.notifications.create({
					    "type": "basic",
					    "iconUrl": browser.extension.getURL("icons/quicknote-48.png"),
					    "title": "Accept script",
					    "message": "Execute local script"
					  });

					console.log("Action code:");
					let buildscript = new builderScript(this.dataobj);
					console.log("buildscript objecto");

					let scriptobj = buildscript.getScript();

					scriptobj.do(this.portToCS);

					break;
				case "url":
	    			 browser.notifications.create({
					    "type": "basic",
					    "iconUrl": browser.extension.getURL("icons/quicknote-48.png"),
					    "title": "Accept url",
					    "message": "Save url"
					  });
				break;
				case "domhtml":
					browser.notifications.create({
					    "type": "basic",
					    "iconUrl": browser.extension.getURL("icons/quicknote-48.png"),
					    "title": "Accept HTML DOM",
					    "message": "Save DOM"
					  });

					console.log("Action code:");

					let buildomhtml = new builderDomHtml(this.dataobj);
					
					let domobj = buildomhtml.getDomHtml();

					domobj.do(this.portToCS);

				break;
				*/
				case "Request":
					if (this.dataobj.extensioname){
						console.log("Aceptar request de la extension para ser procesado.");
						
						let acceptDataRES={
							'type':"AcceptRequest",
							'data':this.dataobj
						};

						//console.log(this.portToCS);

						this.portToCS.postMessage(JSON.stringify(acceptDataRES));
					}else{
						console.log("Solo se aceptan request de extensiones");
					}
				break;
				case "Response":
					if (this.dataobj.extensioname){
						console.log("Aceptar response de la extension para ser procesado.");
						
						let acceptDataREQ={
							'type':"AcceptResponse",
							'data':this.dataobj
						};
						this.portToCS.postMessage(JSON.stringify(acceptDataREQ));
					}else{
						console.log("Solo se aceptan request de extensiones");
					}
				break;

			}

		} catch(e) {
			console.log("Error al realizar Action code DO.");
			console.log(e);
		}
		
	}
}
const core = require('./minimal-core.js');

"auto";
requestScreenCapture();
toastLog("START");

//use script name as start image folder
var startImageFolder = core.GetScriptName();
var templates = loadTemplate(startImageFolder);
var lastTemplateName = '';
var lastTemplateTime = null;
var imgfRes = null;

//IMPORTANT POINT (infinte loop)
while(true) {
	
	//IMPORTANT POINT (find template match)
	let imgad = captureScreen();
	imgfRes = core.ImagesFinderEx(imgad, templates);
	if (imgad != null)
        imgad.recycle();

    //if found
	if (imgfRes.result) {
		let pos = imgfRes.position_center;
		//parse additional options
		let link = core.GetLink(imgfRes.image_name);
		let tout = core.GetTimeout(imgfRes.image_name);
		let tin = core.GetTimein(imgfRes.image_name);
		let customXY = core.GetXYCoord(imgfRes.image_name);
		
		if (customXY) 
			pos = customXY;
		
		if (lastTemplateName != imgfRes.image_name) {
			core.StartTimer('last');
			lastTemplateName = imgfRes.image_name;
		}

		//we wait until the image exists for a set number of milliseconds then click it
		if (tin && core.Elapsed('last') < tin) 
			continue;

        //IMPORTANT POINT (click)
		core.Press(pos, 100);
		log(imgfRes.image_name + " [" + pos.x + "," + pos.y + "]");

		//pause after pressing for a set number of milliseconds
		if (tout)
			sleep(tout); 

		//if folder change is specified
		if (link !== null) {
			if (link=='exit') break;
			log("switch to " + link);
			templates = loadTemplate(startImageFolder, link);
		}
		//affects performance		
		sleep(500); 		
	}
	//affects performance
	sleep(30); 
}
toastLog("END");

function loadTemplate(folder, subFolder)
{
	let sFolder = (subFolder && subFolder.length > 0) ? subFolder+'/':'';
	let tFolder = './Images/'+folder+'/'+sFolder;
	var res = [];

    let tList = core.GetFolderImages(tFolder);
	tList.sort();
	if(tList.length > 0){
	    for(let i = 0; i < tList.length; i++){
	        let fileName = tList[i];
	    	let path = files.join(tFolder, fileName);
	        let img = images.read(path);
	        let item = {"img": img, "fileName": fileName};
	        res.push(item);
	    }
	}
	return res;
}
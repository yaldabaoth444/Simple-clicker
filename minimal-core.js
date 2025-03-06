// The MIT License
//
// Copyright © 2023 Gizatullin Azamat (monopo@list.ru)
//
// Permission is hereby granted, free of charge, to any person obtaining a copy of this
// software and associated documentation files (the “Software”), to deal in the Software
// without restriction, including without limitation the rights to use, copy, modify, merge,
// publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to
// whom the Software is furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all copies or
// substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN 
// THE SOFTWARE.

var _core = {};

_core.timers = storages.create('timers');
_core.threshold = 0.90;

_core.Click = function(point) {
	clickPixel(point);
}

_core.Press = function(point, duration) {
    press(point.x, point.y, duration)
}

_core.ImageFinderEx = function(img, template, region)
{
    return imageFinderEx(img, template, region);
};

_core.ImagesFinder = function(img, folder, region)
{
	return imagesFinder(img, folder, region);
};

_core.ImagesFinderEx = function(img, template, region)
{
    return imagesFinderEx(img, template, region);
};

_core.GetFolderImages = function(folder) {
    return getFolderImages(folder);
};

_core.StartTimer = function(timerName) {
    startTimer(timerName);
}

_core.ElapsedSeconds = function(timerName) {
    return elapsedSeconds(timerName);
}

_core.Elapsed = function(timerName) {
    return elapsed(timerName);
}

_core.GetScriptName = function() {
    return getScriptName();
}

_core.GetLink = function(filename) {
    return getLink(filename);
}

_core.GetPercent = function(filename) {
    return getPercent(filename);
}

_core.GetTimeout = function(filename) {
    return getTimeout(filename);
}

_core.GetTimein = function(filename) {
    return getTimein(filename);
}

_core.GetXYCoord = function(filename) {
    return getXYCoord(filename);
}

module.exports = _core;

function imagesFinderEx(img, templates, region)
{
    let res = { result: false, position: null, position_center: null, image_name: null };

    if (!templates || templates.length == 0)
        return res;

    for(let i = 0; i < templates.length; i++){
        let prc = getPercent(templates[i].fileName);

        if (prc && prc > 0 && prc < 100) {
            let rand = getRandomArbitrary(0,100)
            if (rand > prc) {
                continue;
            }
        }
        
        res = imageFinderEx(img, templates[i], region);
        if(res.result){
            return res
        }  
    }
    
    return res
};

function imageFinderEx(img, template, region)
{
    let res = { result: false, position: null, position_center: null, image_name: null };

    if (!template)
        return res;

    let tImg = template.img;
    let _region = region || getLocation(template.fileName);
    let pos = null;
    if (_region) {
        if (typeof _region === 'string')
          _region = calcRegion(img, _region)

        pos = images.findImageInRegion(img, tImg, _region.x, _region.y, _region.width, _region.height, _core.threshold);

        if (!insideRegion(_region, pos))
            return res;
    }
    else
        pos = images.findImage(img, tImg, {threshold: _core.threshold});    

    width = tImg.getWidth();
    height = tImg.getHeight();
    
    if(pos){
        res.result = true;
        res.position = pos;
        res.position_center = {
            x: Math.round(pos.x + width/2), 
            y: Math.round(pos.y + height/2)
        };
        res.image_name = template.fileName;
    } 
    return res;
}

function getFolderImages(folder) 
{
    return files.listDir(folder, function(name){
        return (name.endsWith(".png") || name.endsWith(".jpg")) && files.isFile(files.join(folder, name));
    });
}

function getLocation(filename)
{
    const regex = /@[tb]?[rl]?\d+/gi;
    const regex2 = /@[tbrl]{1,2}\d{1,2}/gi;
    var matches = filename.match(regex);
    if (matches){
      matches = matches[0].match(regex2);
      if (matches)
        return matches[0].substring(1);
    }
    return null;
}

function getTolerance(filename)
{
    const regex = /~\d{2}/gi;
    var matches = filename.match(regex);
    if (matches){
        return parseFloat("0." + matches[0].substring(1));
    }
    return null;
}

function getPercent(filename)
{
    const regex = /%\d{2}/gi;
    var matches = filename.match(regex);
    if (matches){
        return parseInt(matches[0].substring(1));
    }
    return null;
}

function getTimeout(filename)
{
    const regex = /»\d+/gi;
    var matches = filename.match(regex);
    if (matches){
        return parseInt(matches[0].substring(1));
    }
    return null;
}

function getTimein(filename)
{
    const regex = /«\d+/gi;
    var matches = filename.match(regex);
    if (matches){
        return parseInt(matches[0].substring(1));
    }
    return null;
}

function getXYCoord(filename)
{
    const regex = /{\d+,\d+}/gi;
    var matches = filename.match(regex);
    if (matches){
        let res = matches[0].slice(1,-1).split(",");
        let pos = { x: parseInt(res[0]), y: parseInt(res[1]) };
        return pos;
    }
    return null;
}

function getLink(filename)
{
    const regex = /\^\w*/gi;
    var matches = filename.match(regex);
    if (matches){
        return matches[0].substring(1);
    }
    return null;
}

function calcRegion(img, location) {
    let res = { x: 0, y: 0, width: img.width - 1, height: img.height - 1 };

    let locPercent = parseInt(location.match(/\d+/));
    let xp = img.width * locPercent / 100;
    let yp = img.height * locPercent / 100;

    if (location.indexOf("t") !== -1) {
        res.height = yp;
    }

    if (location.indexOf("b") !== -1) {
        res.y = img.height - yp;
        res.height = yp - 1;
    }

    if (location.indexOf("l") !== -1){
        res.width = xp;
    }

    if (location.indexOf("r") !== -1){
        res.x = img.width - xp;
        res.width = xp - 1;
    }
    return res;
}

function insideRegion(region, pos) {
    if (region == null || pos == null)
        return false;

    if (pos.x >= region.x && pos.x <= region.x + region.width)
        if (pos.y >= region.y && pos.y <= region.y + region.height)
            return true;
    return false;    
}

function clickPixel(point) {
	click(point.x, point.y);
}

function startTimer(timerName) {
    _core.timers.put(timerName, new Date().getTime());
}

function elapsedSeconds(timerName) {
    return elapsed(timerName) / 1000;
}

function elapsed(timerName) {
    if (_core.timers.get(timerName) == null) {
        _core.timers.put(timerName, new Date().getTime());
        return 0;
    }

    return (new Date().getTime() - _core.timers.get(timerName));
}

function getScriptName() {
    return getStringBetween(''+engines.myEngine().source, "/", ".js");
}

function getStringBetween(text, first, last) {
    return text.substring(text.lastIndexOf(first) + first.length, text.lastIndexOf(last));
}

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

Array.prototype.contains = function(element){
    return this.indexOf(element) > -1;
};
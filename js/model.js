"use strict";

const isMouse = !('ontouchend' in document);

class StageBase{
    constructor(){
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45,window.innerWidth / window.innerHeight,5,100000);
        this.scene.add(this.camera);
        this.renderPath = new THREE.RenderPass(this.scene,this.camera);
    }

    onUpdate(tick){

    }

    onResized(width,height){
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }
}

class HUDParts{
    constructor(font){
        this.font = font;
        this.mesh = null;
        this.parentParts = null;
        this.allParts = null;
    }

    addParts(...parts){
        if(!parts instanceof HUDParts){
            console.log("It's not HUD-Parts!");
            return;
        }
        for(let p of parts){
            p.parentParts = this;
        }
        this.addPartsToGenesis(parts);
    }

    addPartsToGenesis(parts){
        if(this.parentParts)this.parentParts.addPartsToGenesis(parts);
        else{
            if(Array.isArray(this.allParts) === false){
                this.allParts = [];
            }
            this.allParts.push(parts);
        }
    }

    update(tick){
        if(this.allParts){
            for (let i = 0;i < this.allParts.length;++i)this.allParts[i].onUpdate(tick);
            this.onUpdate(tick);
        }
    }

    resize(width,height){
        if(this.allParts){
            for (let i = 0;i < this.allParts.length;++i)this.allParts[i].onResized(width,height);
            this.onResized(width,height);
        }
    }

    onTapped(){

    }

    onUpdate(tick){

    }

    onResized(width,height){

    }

}

class HUDBase extends HUDParts{
    constructor(canvas,font) {
        super(font);
        this.canvas = canvas;
        this.hudCamera = new THREE.OrthographicCamera(-window.innerWidth / 2, window.innerWidth / 2, -window.innerHeight / 2, window.innerHeight / 2, 5, 1000);
        this.hudCamera.position.z = 10;
        //this.hudCamera.rotation.y = Math.PI;
        this.hudScene = new THREE.Scene();
        this.renderPath = new THREE.RenderPass(this.hudScene, this.hudCamera);
        this.renderPath.clear = false;
        this.rayCaster = new THREE.Raycaster();
        this.rayCaster.intersectHUDParts = (parts, recursive, optionalTarget) => {
            let intersects = optionalTarget || [];
            if (Array.isArray(parts) === false) {
                console.warn('THREE.Raycaster.intersectHUDParts: objects is not an Array.');
                return intersects;
            }
            for (let i = 0; i < parts.length; ++i) {
              //  console.log(parts[i]);
                if (this.rayCaster.intersectObject(parts[i].mesh).length > 0) intersects.push(parts[i]);
            }
            intersects.sort((a, b) => {
                return a.distance - b.distance;
            });
            return intersects;
        };
        //this.rayCaster.intersectHUDParts = intersectHUDParts;
        this.mouseVec = new THREE.Vector2();
        this.canvas.addEventListener(isMouse ? 'mousedown' : 'touchstart',(e) => {
            const t = e.currentTarget;
            const p = isMouse ? e : e.changedTouches[0];
            const x = p.clientX - t.offsetLeft;
            const y = p.clientY - t.offsetTop;
            this.mouseVec.x = (x / t.offsetWidth) * 2 - 1;
            this.mouseVec.y = -(y / t.offsetHeight) * 2 + 1;
            this.rayCaster.setFromCamera(this.mouseVec, this.hudCamera);
            const targets = this.rayCaster.intersectHUDParts(this.allParts);
            if (!targets || targets.length === 0) return;
            targets[0].onTapped();
        });
    }

    addPartsToGenesis(parts){
        if(Array.isArray(this.allParts) === false){
            this.allParts = [];
        }
        Array.prototype.push.apply(this.allParts,parts);
        for (let i = 0;i < parts.length;++i) {
            this.hudScene.add(parts[i].mesh);
        }
    }

    onResized(width,height){
        this.hudCamera.left = -width / 2;
        this.hudCamera.right = width / 2;
        this.hudCamera.top = -height / 2;
        this.hudCamera.bottom = height / 2;
        this.hudCamera.updateProjectionMatrix();
    }
}



class FrameBase{
    constructor(stageBase,hudBase){
        this.stage = stageBase;
        this.hud = hudBase;
    }

    onResized(width,height){
        this.hud.resize(width,height);
        this.stage.onResized(width,height);
    }

    onUpdate(tick){
        this.hud.update(tick);
        this.stage.onUpdate(tick);
    }

    init(){

    }

    onOpenEvent(){

    }

    onCloseEvent(){

    }

    deinit(){

    }
}

class KeyFrameManager{
    constructor(){
        this.keyFrames = [];
        this.count = 0;
    }

    add(keyframe){
        this.keyFrames.push(keyframe);
    }

    update(){
        this.keyFrames.forEach(v => v.update(this.count));
        ++this.count;
    }
}

class KeyFrame{
    constructor(object,from,to,callback){
        this.obj = object;
        this.from = from;
        this.to = to;
        this.duration = to - from;
        this.callback = callback;
    }

    update(count){
        if(this.from <= count && count <= this.to){
            this.callback(this.obj,count - this.from,this.duration);
        }
    }
}

"use strict";

import * as Three from "three";
import {RenderPass} from "three/examples/jsm/postprocessing/RenderPass";


export class StageBase{
    constructor(){
        this.scene = new Three.Scene();
        this.camera = new Three.PerspectiveCamera(45,window.innerWidth / window.innerHeight,5,100000);
        this.scene.add(this.camera);
        this.renderPath = new RenderPass(this.scene,this.camera);
    }

    onUpdate(tick){

    }

    onResized(width,height){
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }
}

export class HUDParts{
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

export class HUDBase extends HUDParts{
    constructor(canvas,font) {
        super(font);
        this.canvas = canvas;
        this.hudCamera = new Three.OrthographicCamera(-window.innerWidth / 2, window.innerWidth / 2, -window.innerHeight / 2, window.innerHeight / 2, 5, 1000);
        this.hudCamera.position.z = 100;
        //this.hudCamera.rotation.y = Math.PI;
        this.hudScene = new Three.Scene();
        this.renderPath = new RenderPass(this.hudScene, this.hudCamera);
        this.renderPath.clear = false;
        this.rayCaster = new Three.Raycaster();
        this.rayCaster.intersectHUDParts = (parts, recursive, optionalTarget) => {
            let intersects = optionalTarget || [];
            if (Array.isArray(parts) === false) {
                console.warn('Three.Raycaster.intersectHUDParts: objects is not an Array.');
                return intersects;
            }
            for (let i = 0; i < parts.length; ++i) {
                if(parts[i].mesh && this.rayCaster.intersectObject(parts[i].mesh,true).length > 0){
                    intersects.push(parts[i]);
                }
            }
            intersects.sort((a, b) => {
                return a.distance - b.distance;
            });
            return intersects;
        };
        //this.rayCaster.intersectHUDParts = intersectHUDParts;
        this.mouseVec = new Three.Vector2();
        this.canvas.addEventListener(('ontouchend' in document) ? 'touchstart' : 'mousedown',(e) => {
            const t = e.currentTarget;
            const p = ('ontouchend' in document) ? e.changedTouches[0] : e;
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



export class FrameBase{
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

    deInit(){

    }

    static create(stageBase,hudBase){
        return new this(stageBase,hudBase);
    }
}

export class KeyFrameManager{
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

export class KeyFrame{
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

export class PageData{
    constructor(title,url,thumbnail){
        this.title = title;
        this.url = url;
        this.thumbnail = thumbnail;
    }
}



"use strict";

const aspect = window.innerWidth / window.innerHeight;


class StageBase{
    constructor(){
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45,aspect,5,100000);
        this.scene.add(this.camera);
        this.renderPath = new THREE.RenderPass(this.scene,this.camera);
    }

    update(count){

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
        this.updateToGenesis(tick);
    }

    updateToGenesis(tick){
        if(this.parentParts)this.parentParts.updateToGenesis(tick);
        else if(Array.isArray(this.allParts)){
            for (let i = 0;i < this.allParts.length;++i)this.allParts[i].onUpdate(tick);
        }
    }

    onTapped(){

    }

    onUpdate(tick){

    }

}

class HUD extends HUDParts{
    constructor(canvas,font){
        super(font);
        this.canvas = canvas;
        this.hudCamera = new THREE.OrthographicCamera(-window.innerWidth / 2,window.innerWidth / 2,-window.innerHeight / 2,window.innerHeight / 2,5,1000);
        this.hudCamera.position.z -= 10;
        this.hudCamera.rotation.y = Math.PI;
        this.hudScene = new THREE.Scene();
        this.renderPath = new THREE.RenderPass(this.hudScene,this.hudCamera);
        this.renderPath.clear = false;
        this.rayCaster = new THREE.Raycaster();
        this.rayCaster.intersectHUDParts = (parts,recursive,optionalTarget) => {
            let intersects = optionalTarget || [];
            if (Array.isArray( parts ) === false ) {
                console.warn( 'THREE.Raycaster.intersectHUDParts: objects is not an Array.' );
                return intersects;
            }
            for (let i = 0;i < parts.length;++i){
                console.log(parts[i]);
                if(this.rayCaster.intersectObject(parts[i].mesh).length > 0)intersects.push(parts[i]);
            }
            intersects.sort((a,b) => {
                return a.distance - b.distance;
            });
            return intersects;
        };
        //this.rayCaster.intersectHUDParts = intersectHUDParts;
        this.mouseVec = new THREE.Vector2();
        this.canvas.addEventListener('mousedown',(e) => {
            const t = e.currentTarget;
            const x = e.clientX - t.offsetLeft;
            const y = e.clientY - t.offsetTop;
            this.mouseVec.x = (x / t.offsetWidth) * 2 - 1;
            this.mouseVec.y = -(y / t.offsetHeight) * 2 + 1;
            this.rayCaster.setFromCamera(this.mouseVec,this.hudCamera);
            const targets = this.rayCaster.intersectHUDParts(this.allParts);
            if(!targets || targets.length === 0)return;
            targets[0].onTapped();
        });
    }

    addPartsToGenesis(parts){
        if(Array.isArray(this.allParts) === false){
            this.allParts = [];
        }
        Array.prototype.push.apply(this.allParts,parts);
        console.log(parts);
        for (let i = 0;i < parts.length;++i) {
            console.log(parts[i]);
            console.log(parts[i].mesh);
            this.hudScene.add(parts[i].mesh);
        }
    }
}


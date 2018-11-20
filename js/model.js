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

class HUD{
    constructor(canvas,font){
        this.canvas = canvas;
        this.font = font;
        this.hudCamera = new THREE.OrthographicCamera(-window.innerWidth / 2,window.innerWidth / 2,-window.innerHeight / 2,window.innerHeight / 2,5,1000);
        this.hudCamera.position.z -= 10;
        this.hudCamera.rotation.y = Math.PI;
        this.hudScene = new THREE.Scene();
        this.renderPath = new THREE.RenderPass(this.hudScene,this.hudCamera);
        this.renderPath.clear = false;
        this.events = {};
        this.rayCaster = new THREE.Raycaster();
        this.mouseVec = new THREE.Vector2();
        this.canvas.addEventListener('mousedown',(e) => {
            const t = e.currentTarget;
            const x = e.clientX - t.offsetLeft;
            const y = e.clientY - t.offsetTop;
            this.mouseVec.x = (x / t.offsetWidth) * 2 - 1;
            this.mouseVec.y = -(y / t.offsetHeight) * 2 + 1;
            this.rayCaster.setFromCamera(this.mouseVec,this.hudCamera);
            const targets = this.rayCaster.intersectObjects(this.hudScene.children);
            if(!targets || targets.length === 0)return;
            const event = this.events[targets[0].object.id];
            if(event)event();
        });
    }

    addParts(mesh,callback){
        this.hudScene.add(mesh);
        this.events[mesh.id] = callback;
    }

    update(count){

    }
}

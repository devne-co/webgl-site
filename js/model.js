class StageBase{
    constructor(){
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, width / height,5,100000);
        this.scene.add(this.camera);
    }

    update(count){

    }
}

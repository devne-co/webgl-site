THREE.PostProcessShader = {
    uniforms:{
        "u_count":{
            value:0
        },
        "u_glitch_slide":{
            value:0.05
        },
        "u_glitch_slide_p":{
            value:0.2
        },
        "u_glitch_time":{
            value:20
        },
        "u_noise_alpha":{
            value:0.05
        },
        "u_noise_height":{
            value:10
        },
        "tDiffuse":{
            value:null
        }
    },
    vertexShader:$.ajax({
        type:'GET',
        url:'./shader/vertex.vert',
        async:false
    }).responseText,
    fragmentShader:$.ajax({
        type:'GET',
        url:'./shader/fragment.frag',
        async:false
    }).responseText
};

const width = window.innerWidth;
const height = window.innerHeight;


/*const ppv = $.ajax({
    type:'GET',
    url:'./shader/vertex.vert',
    async:false
}).responseText;

const ppf = $.ajax({
    type:'GET',
    url:'./shader/fragment.frag',
    async:false
}).responseText;*/

/*


 */





class WireGround{
    constructor(size,n,max,scene){
        this.count = 0;
        this.size = size;//grid span
        this.n = n;//grid number
        this.maxCount = max;
        this.maxLength = (max + 1) * (n * 2 + 1) * 3;
        this.nowLength = 0;

        this.geometry = new THREE.BufferGeometry();
        this.geometry.addAttribute('position',new THREE.BufferAttribute(new Float32Array(this.maxLength * 3),3));

        const linemat = new THREE.LineBasicMaterial({
            color: 0x333333
        });
        for (let i = -n;i <= n;++i){
            let x = i * size + Math.random() * (size / 2);
            let y = Math.random() * size;
            let z = this.count * size + Math.random() * (size / 2);
            this.geometry.attributes.position.array[this.nowLength * 3] = x;
            this.geometry.attributes.position.array[this.nowLength * 3 + 1] = y;
            this.geometry.attributes.position.array[this.nowLength * 3 + 2] = z;
            ++this.nowLength;
        }
        for (let k = 1;k <= max;++k) {
           this.next();
        }

        this.geometry.addGroup(0, this.maxCount, 0);
        this.count = max;
        this.line = new THREE.Line(this.geometry,linemat);
        this.line.frustumCulled = false;
        console.log(this.geometry.position);
        scene.add(this.line);
    }

    next(){
        ++this.count;
        this.geometry.attributes.position.needsUpdate = true;
        if(this.count > this.maxCount){
            const del = this.n * 6 + 2;//(this.n * 2 + 1) * 2 - 1 + (this.n * 2 + 1);
            const newArr = new Float32Array(this.maxLength * 3);
            newArr.set(this.geometry.attributes.position.array.subarray(del * 3));


            this.geometry.attributes.position.array = newArr;
            this.nowLength -= del;
        }

        let arr = [];
        for (let i = this.n;i >= -this.n; --i) {
            const array = this.geometry.attributes.position.array;

            let x = i * this.size + (Math.random() / 2) * this.size;
            let y = Math.random() * this.size;
            let z = this.count * this.size + (Math.random() / 2) * this.size;

            const v = new THREE.Vector3(x,y,z);
            arr.unshift(v);

            let c = this.nowLength - (this.n - i + 1) * 3 + 1;
            c *= 3;
            if(i > -this.n){
                let ox = array[c];
                let oy = array[c + 1];
                let oz = array[c + 2];
                array[this.nowLength * 3] = x;
                array[this.nowLength * 3 + 1] = y;
                array[this.nowLength * 3 + 2] = z;
                array[this.nowLength * 3 + 3] = ox;
                array[this.nowLength * 3 + 4] = oy;
                array[this.nowLength * 3 + 5] = oz;
                this.nowLength += 2;
            }
            else{
                array[this.nowLength * 3] = x;
                array[this.nowLength * 3 + 1] = y;
                array[this.nowLength * 3 + 2] = z;
                this.nowLength += 1;
            }
        }
        for(let i = -this.n;i <= this.n;++i){
            const array = this.geometry.attributes.position.array;
            array[this.nowLength * 3] = arr[i + this.n].x;
            array[this.nowLength * 3 + 1] = arr[i + this.n].y;
            array[this.nowLength * 3 + 2] = arr[i + this.n].z;
            this.nowLength += 1;
        }
        this.geometry.setDrawRange(0,this.nowLength - 1);
    }
}

class CubeCylinder{
    constructor(sides,r,max,scene){
        this.sides = sides;
        this.r = r;
        this.max = max;
        this.count = 0;
        this.scene = scene;
        this.squares = [];
        this.l = r * 2 * Math.PI / this.sides;
        this.cubeGeo = new THREE.CubeGeometry(this.l,this.l,this.l);
        this.cubeEdgesGeo = new THREE.EdgesGeometry(this.cubeGeo);
        this.cubeGeo.center();
        this.cubeMat = new THREE.LineBasicMaterial({
            color:0x666666
        });
        this.cubeInMat = new THREE.MeshBasicMaterial({
            color:0x000000
        });
        for (let i = 0;i < this.max;++i){
            this.next();
        }
    }

    next(){
        if(this.count >= this.max){
            this.scene.remove(this.squares[0]);
            this.squares.shift();
        }
        const bigGroup = new THREE.Group();
        for(let i = 0;i < this.sides;++i){
            const d = Math.PI * 2 * i / this.sides;
            const x = Math.cos(d) * this.r;
            const y = Math.sin(d) * this.r;
            const z = this.count * this.l;
            let cube = new THREE.LineSegments(this.cubeEdgesGeo,this.cubeMat);
            const s = (Math.random() * 1.5) + 0.4;
            let cubeIn = new THREE.Mesh(this.cubeGeo,this.cubeInMat);
            cubeIn.scale.set(0.99,0.99,0.99);
            let group = new THREE.Group();
            group.add(cube);
            group.add(cubeIn);
            group.position.set(x,y,z);
            group.scale.set(s,s,s);
            group.rotation.z = d;
            bigGroup.add(group);
        }
        this.scene.add(bigGroup);
        this.squares.push(bigGroup);
        ++this.count;
    }
}

class CubeCylinderStage extends StageBase{
    constructor() {
        super();
        this.cubeCylinder = new CubeCylinder(50,1500,30,this.scene);
        this.camera.position.set(0,0,-1000);
        this.camera.lookAt(0,0,300);

        this.scene.fog = new THREE.Fog(0x000000,2000,4000);

    }

    update(count){
        if((count % 5) === 0)this.cubeCylinder.next();
        this.camera.position.z += this.cubeCylinder.l / 5;
        this.camera.rotation.z += Math.PI * 2 / 1000;
    }

}

class WireBaseStage extends StageBase{
    constructor(){
        super();
        this.wireBase = new WireGround(100,20,50,this.scene);
        this.camera.position.y = 200;
        this.camera.lookAt(0,150,3000);

        this.scene.fog = new THREE.Fog(0x000000,2000,4000);
    }

    update(count){
        if((count % 5) === 0)this.wireBase.next();
        this.camera.position.z += 20;
    }
}

class RandomString{
    constructor(base,now,rate,initRate,...fixed){
        this.base = base;
        this.now = now;
        this.rate = rate;
        this.initRate = initRate;
        this.isInitialized = base === now;
        this.fixed = fixed;
        this.randList = new Array(base.length);
    }

    update(){
        if(this.isInitialized) {
            for (let i = 0; i < this.base.length; ++i) {
                if (this.fixed.indexOf(i) >= 0) continue;
                const c = this.randList[i] === 1 ? this.base.charCodeAt(i) : (32 + parseInt(Math.random() * 90));
                if (this.randList[i] >= 1) {
                    --this.randList[i];
                    this.now = this.now.substr(0, i) + String.fromCharCode(c) + this.now.substr(i + 1, this.now.length);
                }
                else if (Math.random() <= this.rate) {
                    this.randList[i] = 20;
                }
            }
        }
        else{
            const s = this.base.length > this.now.length ? this.base.length : this.now.length;
            for (let i = 0; i < s; ++i){
                if(this.base.length < this.now.length && Math.random() <= this.initRate){
                    this.now = this.now.substr(0, i) + this.now.substr(i + 1, this.now.length);
                }
                if (this.now.charCodeAt(i) === this.base.charCodeAt(i))continue;
                const c = this.randList[i] === 1 ? this.base.charCodeAt(i) : (32 + parseInt(Math.random() * 90));
                if (this.randList[i] >= 1) {
                    --this.randList[i];
                    this.now = this.now.substr(0, i) + String.fromCharCode(c) + this.now.substr(i + 1, this.now.length);
                }
                else if (Math.random() <= this.initRate) {
                    this.randList[i] = 20;
                }
            }
            if(this.now === this.base)this.isInitialized = true;
        }
        return this.now;
    }
}

class Logo{
    constructor(font){
        this.rtext = new RandomString("devne.co","???????",0.005,0.5,5);
        this.font = font;
        this.textGeo = new THREE.TextGeometry(this.rtext.now,{
            font:font,
            size:40,
            height:0.01,
            curveSegments: 12
        });
        this.textMesh = new THREE.LineSegments(new THREE.EdgesGeometry(this.textGeo),new THREE.LineBasicMaterial({
            color: 0x777777
        }));
        this.textMesh.geometry.center();
        this.textMesh.rotation.z = Math.PI;
    }

    update(){
        this.textMesh.geometry = new THREE.EdgesGeometry(new THREE.TextGeometry(this.rtext.update(),{
            font:this.font,
            size:40,
            height:0.01,
            curveSegments: 1
        }));
        this.textMesh.geometry.center();
    }

    updateText(text,...fixed){
        this.rtext = new RandomString(text,this.rtext.now,this.rtext.rate,this.rtext.initRate,fixed);
    }
}

class OverlayHUD extends HUD{
    constructor(page,font){
        super(document.getElementById('main'),font);
        this.page = page;
        const cursor = new THREE.Geometry();
        cursor.vertices.push(
            new THREE.Vector3(0,0,0),
            new THREE.Vector3(1,1,0),
            new THREE.Vector3(1 + 0.1,1 - 0.1,0),
            new THREE.Vector3(0.1 * Math.sqrt(2),0,0),
            new THREE.Vector3(1 + 0.1,-1 + 0.1,0),
            new THREE.Vector3(1,-1,0),
            new THREE.Vector3(0,0,0),
        );
        cursor.center();
        const cursorL = new THREE.Line(cursor,new THREE.LineBasicMaterial({
            color: 0xffffff
        }));
        const cursorR = new THREE.Line(cursor,new THREE.LineBasicMaterial({
            color: 0x777777
        }));
        cursorL.rotation.y = Math.PI;
        cursorL.position.x = (width / 2) * 0.9;
        cursorL.scale.set(30,30,30);
        cursorR.position.x = -(width / 2) * 0.9;
        cursorR.scale.set(30,30,30);
        this.addParts(cursorL,() => {
            this.page.prevStage();
        });
        this.addParts(cursorR,() => {
            this.page.nextStage();
        });
        this.logo = new Logo(this.font);
        this.isLogoChanging = false;
        this.addParts(this.logo.textMesh,() => {
            if(this.isLogoChanging)return;
            this.isLogoChanging = true;
            let c = [];
            let r = Math.random() * 5 + 5;
            let base = this.logo.rtext.base;
            for (let i = 0;i < r;++i){
                c.push(String.fromCharCode(32 + parseInt(Math.random() * 90)));
            }
            this.logo.updateText(c.join(""));
            console.log(c.join(""),base);
            setTimeout(() => {
                this.logo.updateText(base);
                this.isLogoChanging = false;
            },200);
        });
    }

    update(count){
        this.logo.update();
    }
}

class Page{
    constructor(width,height,font,...stages){
        const renderer = new THREE.WebGLRenderer({
            canvas:document.querySelector('#main'),
            antialias:true
        });
        renderer.setSize(width, height);

        console.log(stages);

        this.hud = new OverlayHUD(this,font);
        this.stages = stages;

        this.composer = new THREE.EffectComposer(renderer);

        this.shader = new THREE.ShaderPass(THREE.PostProcessShader);
        this.shader.renderToScreen = true;

        this.nowStageIndex = 0;
        this.nextStageIndex = -1;

        this.composer.addPass(this.shader);
        this.composer.addPass(this.getNowStage().renderPath);
        this.composer.addPass(this.hud.renderPath);

        this.stageRendererPathIndex = 1;

        this.count = 0;
        this.transitionCount = -1;
        this.maxTransitionCount = 40;
    }

    prevStage(){
        if(this.nextStageIndex >= 0)return;
        if(this.nowStageIndex === 0){
            this.nextStageIndex = this.stages.length - 1;
        }
        else this.nextStageIndex = this.nowStageIndex - 1;
        this.transitionCount = this.maxTransitionCount;
    }

    nextStage(){
        if(this.nextStageIndex >= 0)return;
        if(this.nowStageIndex + 1 === this.stages.length){
            this.nextStageIndex = 0;
        }
        else this.nextStageIndex = this.nowStageIndex + 1;
        this.transitionCount = this.maxTransitionCount;
    }

    getNowStage(){
        return this.stages[this.nowStageIndex];
    }

    changeStage(){
        this.nowStageIndex = this.nextStageIndex;
        console.log(this.nowStageIndex);
        this.nextStageIndex = -1;
        if(this.nowStageIndex === 0){
            this.hud.logo.updateText("devne.co",5);
        }
        else{
            this.hud.logo.updateText("Member");
        }
        this.composer.passes[this.stageRendererPathIndex] = this.getNowStage().renderPath;
    }

    update(){
        this.getNowStage().update(this.count);
        this.hud.update(this.count);
        if(this.transitionCount >= 0){
            if(this.transitionCount === this.maxTransitionCount / 2){
                this.changeStage();
            }
            let c = this.maxTransitionCount / 2 - Math.abs(this.transitionCount - this.maxTransitionCount / 2);
            c *= (c / this.maxTransitionCount) * 6;
            c = c > this.maxTransitionCount * 2 ? this.maxTransitionCount * 2 : c;
            this.shader.material.uniforms.u_glitch_time.value = 20 + c * 3;
            this.shader.material.uniforms.u_glitch_slide.value = 0.05 + c / 60.0;
            this.shader.material.uniforms.u_glitch_slide_p.value = 0.2 + c / 60.0;
            this.shader.material.uniforms.u_noise_alpha.value = 0.05 + c / 30.0;
            this.shader.material.uniforms.u_noise_height.value = 10 + c * 2;
            --this.transitionCount;
        }
        this.composer.render();
        ++this.shader.material.uniforms.u_count.value;
        ++this.count;
    }
}




const fontLoader = new THREE.FontLoader();

window.addEventListener('load', fontLoader.load('./font/technoid_one.json',(font) => {
    console.log(document.querySelector('#main'));

    const page = new Page(width,height,font,new WireBaseStage(),new CubeCylinderStage());

    const update = () => {
        page.update();
        requestAnimationFrame(update);
    };
    update();
}));

function createCamera() {

}
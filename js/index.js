"use strict";

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

let width = window.innerWidth;
let height = window.innerHeight;
let aspect = width / height;

const createRandStr = (min,max) => {
    let c = [];
    let r = Math.random() * (max - min) + min;
    for (let i = 0;i < r;++i){
        c.push(String.fromCharCode(32 + parseInt(Math.random() * 90)));
    }
    return c.join("");
};





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
        this.cubeCylinder = new CubeCylinder(30,1500,30,this.scene);
        this.camera.position.set(0,0,-1000);
        this.camera.lookAt(0,0,300);

        this.scene.fog = new THREE.Fog(0x000000,2000,4000);

    }

    onUpdate(count){
        if((count % 5) === 0)this.cubeCylinder.next();
        this.camera.position.z += this.cubeCylinder.l / 5;
        this.camera.rotation.z += Math.PI * 2 / 1000;
    }

    onResized(width,height){
        super.onResized(width,height);
        const t = Math.sqrt(1080.0 / width);
        this.camera.scale.set(t,t,t);
    }
}

class WireBaseStage extends StageBase{
    constructor(){
        super();
        this.wireBase = new WireGround(100,20,20,this.scene);
        this.camera.position.y = 200;
        this.camera.lookAt(0,200,3000);
        this.scene.fog = new THREE.Fog(0x000000,2000,4000);
    }

    onUpdate(count){
        if((count % 5) === 0)this.wireBase.next();
        this.camera.position.z += 20;
    }

    onResized(width,height){
        super.onResized(width,height);
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

class Logo extends HUDParts{
    constructor(font){
        super(font);
        this.rtext = new RandomString("devne.co","???????",0.005,0.5,5);
        this.textSize = 0;
        this.textGeo = new THREE.TextGeometry(this.rtext.now,{
            font:font,
            size:this.textSize,
            height:0.01,
            curveSegments: 12
        });
        this.textGeo.center();
        this.mesh = new THREE.LineSegments(new THREE.EdgesGeometry(this.textGeo),new THREE.LineBasicMaterial({
            color: 0x777777
        }));
        this.mesh.rotation.z = Math.PI;
        this.mesh.rotation.y = Math.PI;
        this.isRAnimationEnded = true;
    }

    onUpdate(tick){
        this.mesh.geometry = new THREE.EdgesGeometry(new THREE.TextGeometry(this.rtext.update(),{
            font:this.font,
            size:this.textSize,
            height:0.01,
            curveSegments: 1
        }));
        this.mesh.geometry.center();
        this.rtext.update();
    }

    onResized(width,height){
        this.textSize = width / 60.0 + 15;
    }

    onTapped(){
        if(this.rtext.isInitialized && this.isRAnimationEnded){
            let base = this.rtext.base;
            let fixed = this.rtext.fixed;
            this.updateText(createRandStr(5,10));
            this.isRAnimationEnded = false;
            setTimeout(() => {
                if(fixed)this.updateText(base,fixed);
                else this.updateText(base);
                this.isRAnimationEnded = true;
            },200);
        }
    }

    updateText(text,...fixed){
        this.rtext = new RandomString(text,this.rtext.now,this.rtext.rate,this.rtext.initRate,fixed);
    }

    setText(text,...fixed){
        this.rtext = new RandomString(text,text,this.rtext.rate,this.rtext.initRate,fixed);
    }
}

class CursorParts extends HUDParts{
    constructor(){
        super();
        const cursor = new THREE.Geometry();
        const w = 0.2;
        cursor.vertices.push(
            new THREE.Vector3(0,0,0),
            new THREE.Vector3(1,1,0),
            new THREE.Vector3(1 + w,1 - w,0),
            new THREE.Vector3(w * 2,0,0),
            new THREE.Vector3(1 + w,-1 + w,0),
            new THREE.Vector3(1,-1,0),
            new THREE.Vector3(0,0,0),
        );
        cursor.faces.push(
            new THREE.Face3(0,1,2),
            new THREE.Face3(0,2,3),
            new THREE.Face3(0,3,4),
            new THREE.Face3(0,4,5),
            new THREE.Face3(0,2,1),
            new THREE.Face3(0,3,2),
            new THREE.Face3(0,4,3),
            new THREE.Face3(0,5,4)
        );
        cursor.center();
        this.mesh = new THREE.Mesh(cursor,new THREE.MeshBasicMaterial({
            color:0x777777
        }));

        const boundingBox = new THREE.Mesh(new THREE.CubeGeometry(2,4,1),new THREE.MeshBasicMaterial({
            color:0x111111
        }));
        boundingBox.material.visible = false;
        this.mesh.add(boundingBox);
    }

}

class MemberParts extends HUDParts{
    constructor(){
        super();
        this.geometry = new THREE.Geometry();
        this.frameWidth = 0.1;
       /* this.geometry.vertices.push(
            new THREE.Vector3(-1,-1,0),
            new THREE.Vector3(-1,1,0),
            new THREE.Vector3(1,1,0),
            new THREE.Vector3(1,-1,0),
            new THREE.Vector3(-1,-1,0),
            new THREE.Vector3(-(1 - this.frameWidth),-(1 - this.frameWidth),0),
            new THREE.Vector3(-(1 - this.frameWidth),(1 - this.frameWidth),0),
            new THREE.Vector3((1 - this.frameWidth),(1 - this.frameWidth),0),
            new THREE.Vector3((1 - this.frameWidth),-(1 - this.frameWidth),0),
            new THREE.Vector3(-(1 - this.frameWidth),-(1 - this.frameWidth),0)
        );*/
        this.geometry.vertices.push(
            new THREE.Vector3(0,0,0),
            new THREE.Vector3(0,0,0),
            new THREE.Vector3(0,0,0),
            new THREE.Vector3(0,0,0),
            new THREE.Vector3(0,0,0),
            new THREE.Vector3(0,0,0),
            new THREE.Vector3(0,0,0),
            new THREE.Vector3(0,0,0),
            new THREE.Vector3(0,0,0),
            new THREE.Vector3(0,0,0)
        );
        this.geometry.faces.push(
            new THREE.Face3(0,6,1),
            new THREE.Face3(6,0,5),
            new THREE.Face3(1,7,2),
            new THREE.Face3(7,1,6),
            new THREE.Face3(2,8,3),
            new THREE.Face3(8,2,7),
            new THREE.Face3(3,9,4),
            new THREE.Face3(9,3,8)
        );
        this.mesh = new THREE.Mesh(this.geometry,new THREE.MeshBasicMaterial({
            color:0x777777,
            side:THREE.DoubleSide
        }));
        this.mesh.rotation.z = Math.PI / 4;
        this.manager = new KeyFrameManager();
        this.manager.add(new KeyFrame(this,0,25,(obj,now,duration) => {
            let t = now / duration;
            const p = Math.sin(t * Math.PI / 2);
            obj.geometry.vertices[0].set(-p,-p,0);
            obj.geometry.vertices[1].set(-p,p,0);
            obj.geometry.vertices[2].set(p,p,0);
            obj.geometry.vertices[3].set(p,-p,0);
            obj.geometry.vertices[4].set(-p,-p,0);
        }));
        this.manager.add(new KeyFrame(this,10,35,(obj,now,duration) => {
            let t = now / duration;
            const p = Math.sin(t * Math.PI / 2) * (1 - this.frameWidth);
            obj.geometry.vertices[5].set(-p,-p,0);
            obj.geometry.vertices[6].set(-p,p,0);
            obj.geometry.vertices[7].set(p,p,0);
            obj.geometry.vertices[8].set(p,-p,0);
            obj.geometry.vertices[9].set(-p,-p,0);
        }));
    }

    onUpdate(tick){
        this.manager.update();

        this.geometry.verticesNeedUpdate = true;
        this.geometry.elementsNeedUpdate = true;
        this.geometry.computeFaceNormals();
    }
}

class SelectorHud extends HUDBase{
    constructor(page,font){
        super(document.getElementById('main'),font);
        this.page = page;

        const cursorL = new CursorParts();
        cursorL.mesh.rotation.y = Math.PI;
        cursorL.onTapped = () => {
            this.page.moveToPrevFrame();
        };
        cursorL.onResized = (width,height) => {
            cursorL.mesh.position.x = (width / 2) * 0.9;
            const t = width / 80.0 + 10.0;
            cursorL.mesh.scale.set(t,t,t);
        };

        const cursorR = new CursorParts();
        cursorR.onTapped = () => {
            this.page.moveToNextFrame();
        };
        cursorR.onResized = (width,height) => {
            cursorR.mesh.position.x = -(width / 2) * 0.9;
            const t = width / 80.0 + 10.0;
            cursorR.mesh.scale.set(t,t,t);
        };

        this.logo = new Logo(this.font);
        this.addParts(cursorL,cursorR,this.logo);
    }
}

class MembersHUD extends SelectorHud{
    constructor(page,font){
        super(page,font);
        this.memberArr = [];
        for(let i = 0;i < 7;++i){
            this.memberArr.push(new MemberParts());
            this.memberArr[i].manager.count = -(20 + i * 2);
            this.addParts(this.memberArr[i]);
        }
        const a = 1.6;
        const s = a * 1.35 / 2;
        for(let i = 0;i < 7;++i){
            this.memberArr[i].onResized = (width,height) => {
                const k = width / 60.0 + 15;
                const y = height / 3 + (~(i % 2)) * k * a;
                const x = (i - 3) * k * a;
                console.log(i,x,y,this.memberArr[i].count);
                this.memberArr[i].mesh.position.set(x,y,0);
                this.memberArr[i].mesh.scale.set(k * s,k * s,k * s);
            };
        }
        this.manager = new KeyFrameManager();
        this.manager.add(new KeyFrame(this,15,45,(obj,now,duration) => {
            let t = now / duration;
            const p = Math.sin(t * Math.PI / 2);
            obj.logo.mesh.position.y = this.hudCamera.top * p / 2;
            console.log(obj.logo.mesh.position.y);
        }));
    }

    onUpdate(tick){
        this.manager.update();
    }
}

class TopFrame extends FrameBase{
    constructor(page,font){
        super(new WireBaseStage(),new SelectorHud(page,font));
    }

    init(){
        this.hud.logo.setText(createRandStr(5,10));
    }

    onOpenEvent(){
        this.hud.logo.updateText("devne.co");
    }

    onCloseEvent(){
        this.hud.logo.updateText(createRandStr(5,10));
    }
}

class MembersFrame extends FrameBase{
    constructor(page,font){
        super(new CubeCylinderStage(),new MembersHUD(page,font));
    }

    init(){
        this.hud.logo.setText(createRandStr(5,20));
    }

    onOpenEvent(){
        this.hud.logo.updateText("Members");
    }

    onCloseEvent(){
        this.hud.logo.updateText(createRandStr(5,10));
    }
}

class Page{
    constructor(width,height,font){
        this.renderer = new THREE.WebGLRenderer({
            canvas:document.querySelector('#main'),
            antialias:true
        });
        this.renderer.setSize(width, height);

        this.font = font;

        this.frames = [
            TopFrame,
            MembersFrame
        ];

        this.nowFrame = this.frames[0].create(this,font);
        this.nowFrame.onResized(width,height);
        this.nowFrame.init();
        this.nowFrame.onOpenEvent();

        this.nextFrame = null;

      //  this.frames.forEach((v) => v.onResized(width,height));

        this.composer = new THREE.EffectComposer(this.renderer);

        this.shader = new THREE.ShaderPass(THREE.PostProcessShader);
        this.shader.renderToScreen = true;

        this.nowFrameIndex = 0;
        this.nextFrameIndex = -1;

        this.composer.addPass(this.shader);
        this.composer.addPass(this.getNowFrame().stage.renderPath);
        this.composer.addPass(this.getNowFrame().hud.renderPath);

        this.count = 0;
        this.transitionCount = -1;
        this.maxTransitionCount = 40;

        window.addEventListener('resize',() => {
            const w = window.innerWidth;
            const h = window.innerHeight;
            this.renderer.setSize(w,h);
            this.nowFrame.onResized(w,h);
        });
    }

    moveToPrevFrame(){
        if(this.nextFrameIndex >= 0)return;
        if(this.nowFrameIndex === 0){
            this.nextFrameIndex = this.frames.length - 1;
        }
        else this.nextFrameIndex = this.nowFrameIndex - 1;
        this.transitionCount = this.maxTransitionCount;

        this.getNowFrame().onCloseEvent();
        this.createNextFrame(this.nextFrameIndex);
    }

    moveToNextFrame(){
        if(this.nextFrameIndex >= 0)return;
        if(this.nowFrameIndex + 1 === this.frames.length){
            this.nextFrameIndex = 0;
        }
        else this.nextFrameIndex = this.nowFrameIndex + 1;
        this.transitionCount = this.maxTransitionCount;

        this.getNowFrame().onCloseEvent();
        this.createNextFrame(this.nextFrameIndex);
    }

    getNowFrame(){
        return this.nowFrame;
    }

    changeFrame(){
        if(this.getNowFrame()){
            this.getNowFrame().deInit();
         //   window.removeEventListener('resize',this.nowResizedEvent);
        }
        this.nowFrame = this.nextFrame;
       /* this.nowResizedEvent = () => {
            const w = window.innerWidth;
            const h = window.innerHeight;
            this.renderer.setSize(w,h);
            this.nowFrame.onResized(w,h);
        };*/
        this.nowFrameIndex = this.nextFrameIndex;

        this.getNowFrame().onOpenEvent();

        console.log(this.nowFrameIndex);
        this.nextFrameIndex = -1;
        this.nextFrame = null;

        this.composer.passes[1] = this.getNowFrame().stage.renderPath;
        this.composer.passes[2] = this.getNowFrame().hud.renderPath;
    }

    createNextFrame(index) {
        this.nextFrame = this.frames[index].create(this, this.font);
        const w = window.innerWidth;
        const h = window.innerHeight;
        this.nextFrame.onResized(w, h);
        this.nextFrame.init();
       /* this.nowResizedEvent = () => {
            const w = window.innerWidth;
            const h = window.innerHeight;
            this.renderer.setSize(w,h);
            this.nowFrame.onResized(w,h);
        };
        window.addEventListener('resize',this.nowResizedEvent);*/
    }

    update(){
        this.getNowFrame().onUpdate(this.count);
        if(this.transitionCount >= 0){
            if(this.transitionCount === this.maxTransitionCount / 2){
                this.changeFrame();
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

    const page = new Page(width,height,font);

    const update = () => {
        page.update();
        requestAnimationFrame(update);
    };
    update();
}));


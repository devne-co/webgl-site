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

class WireCubesStage extends StageBase{
    constructor(scene,camera) {
        super(scene, camera);
        this.lastPos = new THREE.Vector3(0,0,0);
        this.nowPos = new THREE.Vector3(0,0,0);
        this.size = 100;
        this.max = 50;
        this.cubeArr = [new THREE.Mesh(new THREE.CubeGeometry(this.size,this.size,this.size),new THREE.MeshBasicMaterial({color:0xffaa33}))];
        scene.add(this.cubeArr[0]);
        camera.position.x = 300;
        camera.position.y = 300;
        camera.position.z = 300;
        camera.lookAt(this.lastPos);
    }

    update(count){
        const t = 2.0;
        const k = count % t;
        const lookAt = new THREE.Vector3(this.lastPos.x + (this.nowPos.x - this.lastPos.x) / t * k,this.lastPos.y + (this.nowPos.y - this.lastPos.y) / t * k,this.lastPos.z + (this.nowPos.z - this.lastPos.z) / t * k);
        const d1 = Math.PI * 2 * ((count % 240) / 240.0);
        const d2 = Math.PI * 2 * ((count % 720) / 720.0);

        // console.log(lookAt);
        this.camera.position.x = lookAt.x + Math.cos(d2) * 500;
        this.camera.position.z = lookAt.z + Math.sin(d2) * 2500;
        this.camera.position.y = lookAt.y + Math.sin(d2) * 3000;
        this.camera.lookAt(lookAt);
        if(count % t === 0){
            this.lastPos = this.nowPos;
            const s = parseInt(Math.random() * 3);
            if(s === 0){
                this.nowPos = new THREE.Vector3(this.lastPos.x + this.size,this.lastPos.y,this.lastPos.z);
            }
            else if(s === 1){
                this.nowPos = new THREE.Vector3(this.lastPos.x,this.lastPos.y + this.size,this.lastPos.z);
            }
            else if(s === 2){
                this.nowPos = new THREE.Vector3(this.lastPos.x,this.lastPos.y,this.lastPos.z + this.size);
            }
            const cube = new THREE.Mesh(new THREE.CubeGeometry(this.size,this.size,this.size),new THREE.MeshBasicMaterial({color:0x888888}));
            cube.position.x = this.nowPos.x;
            cube.position.y = this.nowPos.y;
            cube.position.z = this.nowPos.z;
           // console.log(cube.position.x,cube.position.y,cube.position.z);
            this.cubeArr.push(cube);
            this.scene.add(cube);
            if(this.cubeArr.length >= this.max){
                this.scene.remove(this.cubeArr[0]);
                this.cubeArr.shift();
            }
            for (let i = 0;i < this.cubeArr.length - 1;++i){

             //   console.log(this.cubeArr[this.cubeArr.length - i - 1].material.color);
                let cc = 1 - i * (1.0 / this.max);
                this.cubeArr[i].material.color = new THREE.Color(cc,cc,cc);
            }
        }

    }
}

class WireBaseStage extends StageBase{
    constructor(scene,camera){
        super(scene,camera);
        this.wireBase = new WireGround(100,30,50,this.scene);
    }

    update(count){
        if((count % 20) === 0)this.wireBase.next();
        this.camera.position.z += 5;
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
            size:0.5,
            height:0.01,
            curveSegments: 12
        });
        this.textMesh = new THREE.LineSegments(new THREE.EdgesGeometry(this.textGeo),new THREE.LineBasicMaterial({
            color: 0x777777
        }));
        this.textMesh.geometry.center();
        this.textMesh.position.z = -10;
    }

    update(){
        this.textMesh.geometry = new THREE.EdgesGeometry(new THREE.TextGeometry(this.rtext.update(),{
            font:this.font,
            size:0.5,
            height:0.01,
            curveSegments: 1
        }));
        this.textMesh.geometry.center();
    }

    updateText(text,...fixed){
        this.rtext = new RandomString(text,this.rtext.now,this.rtext.rate,this.rtext.initRate,fixed);
    }
}



const fontLoader = new THREE.FontLoader();

const width = window.innerWidth;
const height = window.innerHeight;

window.addEventListener('load', fontLoader.load('./font/technoid_one.json',(font) => {
    console.log(document.querySelector('#main'));

    const renderer = new THREE.WebGLRenderer({
        canvas:document.querySelector('#main'),
        antialias:true
    });

    renderer.setSize(width, height);
    const composer = new THREE.EffectComposer(renderer);

    const camera = new THREE.PerspectiveCamera(45, width / height,5,100000);
    camera.position.set(0, 300, 0);
    camera.lookAt(0,300,10);

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x000000,2000,4000);

    const renderPass = new THREE.RenderPass(scene,camera);
    const ppv = $.ajax({
        type:'GET',
        url:'./shader/vertex.vert',
        async:false
    }).responseText;

    const ppf = $.ajax({
        type:'GET',
        url:'./shader/fragment.frag',
        async:false
    }).responseText;

    THREE.PostProcessShader = {
        uniforms:{
            "u_count":{
                value:0
            },
            "tDiffuse":{
                value:null
            }
        },
        vertexShader:ppv,
        fragmentShader:ppf
    };

    const selector = new THREE.Geometry();
    selector.vertices.push(
        new THREE.Vector3(0,0,0),
        new THREE.Vector3(1,1,0),
        new THREE.Vector3(1 + 0.1,1 - 0.1,0),
        new THREE.Vector3(0.1 * Math.sqrt(2),0,0),
        new THREE.Vector3(1 + 0.1,-1 + 0.1,0),
        new THREE.Vector3(1,-1,0),
        new THREE.Vector3(0,0,0),
        );
    const selectorL = new THREE.Line(selector,new THREE.LineBasicMaterial({
        color: 0x777777
    }));
    const selectorR = new THREE.Line(selector,new THREE.LineBasicMaterial({
        color: 0x777777
    }));
    selectorR.rotation.y = Math.PI;
    selectorL.position.z = -10;
    selectorL.position.x = -width * 0.0057;
    selectorL.scale.set(0.2,0.2,0.2);
    selectorR.position.z = -10;
    selectorR.position.x = width * 0.0057;
    selectorR.scale.set(0.2,0.2,0.2);
    camera.add(selectorL);
    camera.add(selectorR);

    const wbStage = new WireBaseStage(scene,camera);


    const logo = new Logo(font);
    camera.add(logo.textMesh);

    scene.add(camera);

    const shaderPass = new THREE.ShaderPass(THREE.PostProcessShader);
    shaderPass.renderToScreen = true;
    composer.addPass(renderPass);
    composer.addPass(shaderPass);
    console.log(shaderPass);

    let count = 0;
    const update = () => {
         wbStage.update(count);
          if(count % 300 ===  0)logo.updateText("XcegsNmEF¥CjEFmf");
          if(count % 300 ===  30)logo.updateText("devne.co");
          if(count % 300 ===  150)logo.updateText("XcegsNmEF¥CjEFmf");
          if(count % 300 ===  180)logo.updateText("Member");
        logo.update();
      //  camera.rotation.y += 0.01;
    //    camera.position.z += 10;
       // renderer.render(scene, camera);
       // THREE.PostProcessShader.uniforms.uTime.value = Math.random();
          ++shaderPass.material.uniforms.u_count.value;
     //   console.log(THREE.PostProcessShader.uniforms.uTime);

       // composer.renderer.clear();
        composer.render();
        requestAnimationFrame(update);
        ++count;
    };
    update();
}));

function createCamera() {

}
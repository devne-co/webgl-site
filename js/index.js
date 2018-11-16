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
        this.squares = [[]];
        this.cubeGeo = new THREE.EdgesGeometry(new THREE.CubeGeometry(l,l,l));
        this.cubeGeo.center();
        this.cubeMat = new THREE.LineBasicMaterial({
            color:0x666666
        });
        for (let i = 0;i < this.max;++i){
            this.next();
        }
    }

    next(){
        if(this.count >= this.max){
            for(let i = 0;i < this.sides;++i){
                this.scene.remove(this.squares[0][i]);
            }
            this.squares = this.squares.shift();
        }
        const l = r * 2 * Math.PI / this.sides;
        for(let i = 0;i < this.sides;++i){
            const d = Math.PI * 2 * i / this.sides;
            const x = Math.cos(d) * r;
            const y = Math.sin(d) * r;
            const z = this.count * l;
            let cube = new THREE.Line(this.cubeGeo,this.cubeMat);
            const s = (Math.random() / 2) + 1;
            cube.position.set(x,y,z);
            cube.scale.set(s,s,s);
            cube.rotation.z = d;
            this.scene.add(cube);
            this.squares[this.count].push(cube);
        }
        ++this.count;
    }
}

class CubeCylinderStagge extends StageBase{
    constructor(scene,camera) {
        super(scene, camera);
        this.cubeCylinder = new CubeCylinder();
    }

    update(){

    }

}

class GoroGoroCubeStage extends StageBase{
    constructor(scene,camera){
        super(scene,camera);
        this.oneSide = 30;
        this.count = 10;
        this.side = this.oneSide * this.count;
        const cubeGeometry = new THREE.CubeGeometry(this.side,this.side,this.side,this.count,this.count,this.count);

        this.wrap = new THREE.Group();
        const insideCube = new THREE.Mesh(cubeGeometry,new THREE.MeshBasicMaterial({
            color:0x000000
        }));
        insideCube.scale.x = 0.98;
        insideCube.scale.y = 0.98;
        insideCube.scale.z = 0.98;
        this.wrap.add(insideCube);
        const square = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(this.side,this.side)),new THREE.LineBasicMaterial({
            color:0x666666
        }));
        for (let i = 0;i < this.count;++i){
            let sx = square.clone();
            let sy = square.clone();
            let sz = square.clone();
            sx.position.x = i * this.oneSide - this.side / 2;
            sy.position.y = i * this.oneSide - this.side / 2;
            sz.position.z = i * this.oneSide - this.side / 2;
            sy.rotation.y = Math.PI / 2;
            sz.rotation.z = Math.PI / 2;
            this.wrap.add(sx);
            this.wrap.add(sy);
            this.wrap.add(sz);
        }
        this.wrap.position.z = 1000;
        this.wrap.rotation.y = Math.PI / 4;
        this.wrap.rotation.x = Math.PI / 4;
        this.camera.lookAt(this.wrap.position);

        scene.add(this.wrap);
    }
}

class WireBaseStage extends StageBase{
    constructor(scene,camera){
        super(scene,camera);
        this.wireBase = new WireGround(100,20,50,this.scene);
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
    selectorL.position.x = -width * 0.0047;
    selectorL.scale.set(0.2,0.2,0.2);
    selectorR.position.z = -10;
    selectorR.position.x = width * 0.0047;
    selectorR.scale.set(0.2,0.2,0.2);
    camera.add(selectorL);
    camera.add(selectorR);

    const wbStage = new GoroGoroCubeStage(scene,camera);


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
          if(count ===  0)logo.updateText("XcegFmf");
          if(count ===  30)logo.updateText("devne.co");
          if(count >= 280 && count <= 320){
              let c1 = 20 - Math.abs(count - 300);
              c1 = c1 > 10 ? 30 : c1 * 3;
              console.log(c1);
              shaderPass.material.uniforms.u_glitch_time.value = 20 + c1 * 3;
              shaderPass.material.uniforms.u_glitch_slide.value = 0.05 + c1 / 60.0;
              shaderPass.material.uniforms.u_glitch_slide_p.value = 0.2 + c1 / 60.0;
              shaderPass.material.uniforms.u_noise_alpha.value = 0.05 + c1 / 30.0;
              shaderPass.material.uniforms.u_noise_height.value = 10 + c1 * 3;
          }
          if(count ===  300){
              logo.updateText("Member");
          }
          console.log(shaderPass.material.uniforms.u_high_count);
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
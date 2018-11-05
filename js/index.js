

class WireGround{
    constructor(size,n,max,scene){
        this.count = 0;
        this.size = size;
        this.n = n;
        this.maxCount = max;
        this.maxLength = (max + 1) * (n * 2 + 1) * 3;
        this.nowLength = 0;

        this.geometry = new THREE.BufferGeometry();
        this.geometry.addAttribute('position',new THREE.BufferAttribute(new Float32Array(this.maxLength * 3),3));

        const linemat = new THREE.LineBasicMaterial({
            color: 0x333333,
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

class WireBaseStage extends StageBase{
    constructor(scene,camera){
        super(scene,camera);
        this.wireBase = new WireGround(100,30,50,this.scene);
    }

    update(count){
        if((count % 10) === 0)this.wireBase.next();
        this.camera.position.z += 10;
    }
}

const fontLoader = new THREE.FontLoader();

const baseLogo = "devne.co";
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

    const camera = new THREE.PerspectiveCamera(45, width / height,10,100000);
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

    let textGeo = new THREE.TextGeometry(baseLogo,{
        font:font,
        size:75,
        height:1,
        curveSegments: 12
    });

    textGeo.center();
    const text = new THREE.LineSegments(new THREE.EdgesGeometry(textGeo),new THREE.LineBasicMaterial({
        color: 0xaaaaaa
    }));
    text.position.z = -2000;
    camera.add(text);
    scene.add(camera);

    const shaderPass = new THREE.ShaderPass(THREE.PostProcessShader);
    shaderPass.renderToScreen = true;
    composer.addPass(renderPass);
    composer.addPass(shaderPass);
    console.log(shaderPass);

    const wbStage = new WireBaseStage(scene,camera);

    let randLogoArr = Array(baseLogo.length);
    let nowLogo = baseLogo;
    let count = 0;
    const update = () => {
       // if((count % 10) === 0)wb.next();
      //  wb.moveBack(50);
        wbStage.update(count);
        for (let i = 0;i < 8;++i){
            if(i === 5)continue;
            if(randLogoArr[i] > 0){
                let c = nowLogo.charCodeAt(i) + parseInt(Math.random() * 90);
                if(c > 'z'.charCodeAt(0)){
                   c -= 90;
                }
                --randLogoArr[i];
                if(randLogoArr[i] === 0)nowLogo = nowLogo.substr(0,i) + baseLogo[i] + nowLogo.substr(i + 1,nowLogo.length);
                else nowLogo = nowLogo.substr(0,i) + String.fromCharCode(c) + nowLogo.substr(i + 1,nowLogo.length);
               // console.log(nowLogo);
            }
            else if(Math.random() < 0.0025){
                randLogoArr[i] = 20;
                let c = nowLogo.charCodeAt(i) + parseInt(Math.random() * 90);
                if(c > 'z'.charCodeAt(0)){
                    c -= 90;
                }
                --randLogoArr[i];
                nowLogo = nowLogo.substr(0,i) + String.fromCharCode(c) + nowLogo.substr(i + 1,nowLogo.length);
             //   nowLogo = nowLogo.split('').splice(i,1,String.fromCharCode(c)).join()
              //  console.log(nowLogo);
            }
        }
        text.geometry = new THREE.EdgesGeometry(new THREE.TextGeometry(nowLogo,{
            font:font,
            size:75,
            height:1,
            curveSegments: 12
        }));
        text.geometry.center();
      //  camera.rotation.y += 0.01;
    //    camera.position.z += 10;
       // renderer.render(scene, camera);
       // THREE.PostProcessShader.uniforms.uTime.value = Math.random();
          ++shaderPass.material.uniforms.u_count.value;
     //   console.log(THREE.PostProcessShader.uniforms.uTime);

        composer.render();
        requestAnimationFrame(update);
        ++count;
    };
    update();
}));

function createCamera() {

}
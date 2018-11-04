class WireBox{
    constructor(x,y,z,s,scene){
        const linemat = new THREE.LineBasicMaterial({
            color: 0x4081e8,
            linewidth: 60
        });
        s /= 2;
        this.hs = s;
        this.lines = [];
        for (let i = 0;i < 2;++i){
            for (let j = 0;j < 2;++j){
                const l1 = new THREE.Geometry();
                l1.vertices.push(
                    new THREE.Vector3(x, y + ((i % 2 === 0) ? s : -s), z + ((j % 2 === 0) ? s : -s)),
                    new THREE.Vector3(x, y + ((i % 2 === 0) ? s : -s), z + ((j % 2 === 0) ? s : -s))
                );
                const l2 = new THREE.Geometry();
                l2.vertices.push(
                    new THREE.Vector3(x + ((i % 2 === 0) ? s : -s), y , z + ((j % 2 === 0) ? s : -s)),
                    new THREE.Vector3(x + ((i % 2 === 0) ? s : -s), y , z + ((j % 2 === 0) ? s : -s))
                );
                const l3 = new THREE.Geometry();
                l3.vertices.push(
                    new THREE.Vector3(x + ((i % 2 === 0) ? s : -s), y + ((j % 2 === 0) ? s : -s), z),
                    new THREE.Vector3(x + ((i % 2 === 0) ? s : -s), y + ((j % 2 === 0) ? s : -s), z),
                );
                l1.elementsNeedUpdate = true;
                l2.elementsNeedUpdate = true;
                l3.elementsNeedUpdate = true;
                lines.push(l1,l2,l3);
                scene.add(new THREE.Line(l1,linemat));
                scene.add(new THREE.Line(l2,linemat));
                scene.add(new THREE.Line(l3,linemat));
            }
        }
    }

    animation(per){
        for (let i = 0;i < 2;++i) {
            for (let j = 0; j < 2; ++j) {

            }
        }
    }
}

class WireBase{
    constructor(size,n,max,scene){
        this.count = 0;
        this.size = size;
        this.n = n;
        this.maxCount = max;
        this.maxLength = (max + 1) * (n * 2 + 1) * 3;
        this.nowLength = 0;
        this.lastZ = 0;

        this.geometry = new THREE.BufferGeometry();
        this.geometry.addAttribute('position',new THREE.BufferAttribute(new Float32Array(this.maxLength * 3),3));



        const linemat = new THREE.LineBasicMaterial({
            color: 0x666666,
        });
        for (let i = -n;i <= n;++i){
            let x = i * size + Math.random() * (size / 2);
            let y = Math.random() * size;
            let z = this.count * size + Math.random() * (size / 2);
           // this.geometry.vertices.push(new THREE.Vector3(x,y,z));

           // console.log("Huh?x ->" + x);
            this.geometry.attributes.position.array[this.nowLength * 3] = x;
            this.geometry.attributes.position.array[this.nowLength * 3 + 1] = y;
            this.geometry.attributes.position.array[this.nowLength * 3 + 2] = z;
            ++this.nowLength;
        }
        for (let k = 1;k <= max;++k) {
           this.next();
        }

        this.geometry.addGroup(0, this.maxCount, 0);
        // console.log(this.geometry.vertices);
        this.count = max;
        this.line = new THREE.Line(this.geometry,linemat);
        this.line.frustumCulled = false;
        this.box = new THREE.BoxHelper(new THREE.Line(this.geometry,linemat));
        this.box.update();
        console.log(this.geometry.position);
        scene.add(this.line);
        scene.add(this.box);
    }

    next(){
        ++this.count;
        this.geometry.attributes.position.needsUpdate = true;
      //  console.log(this.geometry.attributes.position.needsUpdate);
       // console.log(this.geometry.vertices);
        if(this.count > this.maxCount){
        //    console.log(this.geometry.attributes.position.array[(this.nowLength - 1) * 3 + 2]);
           // console.log(this.geometry.attributes.position.array);
            const del = this.n * 6 + 2;//(this.n * 2 + 1) * 2 - 1 + (this.n * 2 + 1);
  //          console.log(del);
            const newArr = new Float32Array(this.maxLength * 3);
            newArr.set(this.geometry.attributes.position.array.subarray(del * 3));


            this.geometry.attributes.position.array = newArr;
           /* this.line.box.min.z += this.size;
            console.log(this.line.box.min.z);*/
            this.nowLength -= del;
    //       console.log(this.geometry.attributes.position.array[(this.nowLength - 1) * 3 + 2]);
            //console.log(this.nowLength);
        }

      //  console.log(this.geometry.vertices);
      //  console.log("f:" + this.geometry.verticesNeedUpdate + "/" + this.geometry.vertices.length);

        let arr = [];
        for (let i = this.n;i >= -this.n; --i) {
            const array = this.geometry.attributes.position.array;

            let x = i * this.size + (Math.random() / 2) * this.size;
            let y = Math.random() * this.size;
            let z = this.count * this.size + (Math.random() / 2) * this.size;

          //  console.log(z);
            const v = new THREE.Vector3(x,y,z);
            arr.unshift(v);

            let c = this.nowLength - (this.n - i + 1) * 3 + 1;
            c *= 3;
           // console.log(this.geometry.vertices.length + ":" + c);
//          //  console.log(this.geometry.vertices[this.n + i].x, this.geometry.vertices[this.n + i].y, this.geometry.vertices[this.n + i].z);*/
        //    console.log(v);
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
             //   console.log(c + "," + i + "," + ox + "," + oy + "," + oz);
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
           // console.log(i + this.n);
            const array = this.geometry.attributes.position.array;
            array[this.nowLength * 3] = arr[i + this.n].x;
            array[this.nowLength * 3 + 1] = arr[i + this.n].y;
            array[this.nowLength * 3 + 2] = arr[i + this.n].z;
            this.nowLength += 1;
       //     this.geometry.vertices.push(arr[i + this.n]);
          //  console.log(arr[i + this.n]);
        }
     //   console.log(this.geometry.attributes.position.needsUpdate);


        this.geometry.setDrawRange(0,this.nowLength - 1);
   //     console.log("l:" + this.geometry.verticesNeedUpdate + "/" + this.geometry.vertices.length);
    }
}

const fontLoader = new THREE.FontLoader();
const baseLogo = "devne.co";

window.addEventListener('load', fontLoader.load('./font/technoid_one.json',(font) => {
    console.log(document.querySelector('#main'));
    const width = window.innerWidth;
    const height = window.innerHeight;

    const renderer = new THREE.WebGLRenderer({
        canvas:document.querySelector('#main'),
        antialias:true
    });

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);

    const composer = new THREE.EffectComposer(renderer);

    const camera = new THREE.PerspectiveCamera(45, width / height,10,100000);
   // camera.lookAt(new THREE.Vector3(0,0,1000));
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
    console.log(ppv);
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
    const shaderPass = new THREE.ShaderPass(THREE.PostProcessShader);
    shaderPass.renderToScreen = true;
    composer.addPass(renderPass);
    composer.addPass(shaderPass);
    console.log(shaderPass);


    const wb = new WireBase(100,30,50,scene);

    let textGeo = new THREE.TextGeometry(baseLogo,{
        font:font,
        size:60,
        height:1,
        curveSegments: 12
    });

    textGeo.center();
    let text = new THREE.LineSegments(new THREE.EdgesGeometry(textGeo),new THREE.LineBasicMaterial({
        color: 0xaaaaaa
    }));
    text.rotation.y = Math.PI;
    text.position.y = 320;
    text.position.z = 2000;
    scene.add(text);
    let randLogoArr = Array(baseLogo.length);
    let nowLogo = baseLogo;
    let count = 0;
    const update = () => {
        if((count % 10) === 0)wb.next();
      //  wb.moveBack(50);
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
            size:100,
            height:1,
            curveSegments: 12
        }));
        text.geometry.center();
        camera.position.z += 10;
        text.position.z += 10;
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

function replaceRandom() {

}
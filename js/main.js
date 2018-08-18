THREEx.ArToolkitContext.baseURL = './';
var container, stats;
var camera, scene, renderer, camWrap;

var cams = [];
var scenes = [];
var mc = [];
var objects = [];

var textures = [];
var texCount = 0;
var objCount = 0;

modelCount = 2;




var vangle = 0;
var hangle = 0;
var curAtlas = 0;
var x = 0;
var y = 0;



var dummyScene = new THREE.Scene();
var dummyCam = new THREE.Camera();
dummyScene.add(dummyCam);


var onRenderFcts = [];




//init();
//animate();


////////////////////////////////////////////////////////////////////////////////
//          handle arToolkitSource
////////////////////////////////////////////////////////////////////////////////


var arToolkitSource, arToolkitContext;

function onResize() {
    arToolkitSource.onResize()
    arToolkitSource.copySizeTo(renderer.domElement)
    if (arToolkitContext.arController !== null) {
        arToolkitSource.copySizeTo(arToolkitContext.arController.canvas)
    }
}


for (var i = 0; i < modelCount; i++) {
    scenes[i] = new THREE.Scene();
}

//load();



var touch = { x: 0, y: 0 };

var touch2 = { x: 0, y: 0 };


var clock = new THREE.Clock();

function init() {
    $('#instrBox').hide();
    arToolkitSource = new THREEx.ArToolkitSource({
        // to read from the webcam 
        sourceType: 'webcam',


    })

    arToolkitSource.init(function onReady() {
        onResize()
    });

    // handle resize
    window.addEventListener('resize', function() {
        onResize()
    });


    container = document.createElement('div');
    container.setAttribute("id", "renderBox");
    document.body.appendChild(container);
    // scene
    /*scene = new THREE.Scene();


    camera = new THREE.Camera();
    scene.add(camera);*/




    // create atToolkitContext
    arToolkitContext = new THREEx.ArToolkitContext({
            cameraParametersUrl: THREEx.ArToolkitContext.baseURL + 'data/data/camera_para.dat',
            detectionMode: 'mono',
        })
        // initialize it
    arToolkitContext.init(function onCompleted() {
        // copy projection matrix to camera
        //camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());
        for (var i = 0; i < modelCount; i++) {
            cams[i].projectionMatrix.copy(arToolkitContext.getProjectionMatrix());
        }
    })

    // update artoolkit on every frame
    onRenderFcts.push(function() {
        if (arToolkitSource.ready === false) return

        arToolkitContext.update(arToolkitSource.domElement)

        // update scene.visible if the marker is seen

        //scene.visible = camera.visible;
        for (var i = 0; i < modelCount; i++) {
            scenes[i].visible = cams[i].visible;
        }



    });

    ////////////////////////////////////////////////////////////////////////////////
    //          Create a ArMarkerControls
    ////////////////////////////////////////////////////////////////////////////////

    // init controls for camera
    //console.log(THREEx.ArMarkerControls);

    for (var i = 0; i < modelCount; i++) {
        cams[i] = new THREE.Camera();

        mc[i] = new THREEx.ArMarkerControls(arToolkitContext, cams[i], {
            type: 'pattern',
            patternUrl: 'data/data/' + (i + 1) + '.patt',
            changeMatrixMode: 'cameraTransformMatrix'
        });
        //scenes[i] = new THREE.Scene();
        scenes[i].add(cams[i]);
        scenes[i].visible = false;
        scenes[i].add(new THREE.AmbientLight(0x555555));

        let pointLight = new THREE.PointLight(0xffffff, 3, 10000, 2);
        pointLight.position.set(0, 15, -30);
        scenes[i].add(pointLight);
    }



    //scene.visible = false



    // renderer
    renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(1024, 768);
    container.appendChild(renderer.domElement);
    renderer.domElement.style.position = 'absolute'
    renderer.domElement.style.top = '0px'
    renderer.domElement.style.left = '0px'
    rendrCanvas = renderer.domElement;
    renderer.gammaInput = true;
    renderer.gammaOutput = true;

    //window.addEventListener('resize', onWindowResize, false);

    container.addEventListener('touchstart', function(e) {
        e.preventDefault();
        touch.x = e.touches[0].clientX;
        touch.y = e.touches[0].clientY;
        if (e.touches[1]) {
            touch2.x = e.touches[1].clientX;
            touch2.y = e.touches[1].clientY;
        }

    }, false);

    container.addEventListener('touchmove', function(e) {
        if (e.touches[1]) {
            //console.log('zoom');
            let t1 = new THREE.Vector2().set(e.touches[0].clientX, e.touches[0].clientY);
            let t2 = new THREE.Vector2().set(e.touches[1].clientX, e.touches[1].clientY);
            let s1 = new THREE.Vector2().copy(touch);
            let s2 = new THREE.Vector2().copy(touch2);
            /*if (s1.distanceTo(s2) > t1.distanceTo(t2)) {

            } else if (s1.distanceTo(s2) < t1.distanceTo(t2)) {

            }*/
            let scale = t1.distanceTo(t2) / s1.distanceTo(s2);
            //uniforms.scale.value.multiplyScalar(scale);

            for (var i = 0; i < modelCount; i++) {
                if (scenes[i].visible) {
                    objects[i].scale.multiplyScalar(scale);
                }
            }

            touch2.x = e.touches[1].clientX;
            touch2.y = e.touches[1].clientY;
        } else {

            var swipe = 2 * Math.PI * (touch.x - e.touches[0].clientX) * 0.5 / window.innerWidth;

            for (var i = 0; i < modelCount; i++) {
                if (scenes[i].visible) {
                    objects[i].children[0].rotation.z += swipe;
                }
            }





            /*vangle -= Math.PI * (touch.y - e.touches[0].clientY) * 0.5 / window.innerHeight;
            if (vangle > angleStep * 8) {
                vangle = angleStep * 8;
            }
            if (vangle < -angleStep * 8) {
                vangle = -angleStep * 8;
            }*/

            //console.log(vangle);
            //console.log(vangle, hangle);
        }
        touch.x = e.touches[0].clientX;
        touch.y = e.touches[0].clientY;

    }, false);

    animate();
}

function onWindowResize() {

}


var lastX, lastY;



//var hangle = 0;
//var vangle = Math.PI / 2 - angleStep;
//var vangle = 0;
var hdir = 1;
var vdir = -1;

function animate(nowMsec) {
    requestAnimationFrame(animate);
    let delta = clock.getDelta();




    //console.log(gyro.getOrientation());
    let orient = gyro.getOrientation();
    let alpha = orient.alpha || 0;
    let beta = orient.beta || 0;
    let gamma = orient.gamma || 0;
    //vangle = -(gamma - 90) * Math.PI / 180;

    //vangle = beta * Math.PI / 180;


    vangle = -(beta - 90) * Math.PI / 180;

    //setSprite(vangle, 0);
    //setSprite(0, 0);

    for (var i = 0; i < modelCount; i++) {

        objects[i].rotation.x = vangle;

    }

    onRenderFcts.forEach(function(onRenderFct) {
        onRenderFct(delta, nowMsec / 1000)
    });

    render();

}

function render() {
    //renderer.clear();
    let rended = false;
    for (var i = 0; i < modelCount; i++) {
        if (scenes[i].visible && !rended) {
            //console.log('render', i);
            renderer.render(scenes[i], cams[i]);
            rended = true;
        }
    }
    if (!rended) {
        renderer.render(dummyScene, dummyCam);
    }
}

function updatePBar() {
    let cur = texCount + objCount;
    let total = textures.length + modelCount;
    let width = parseInt(100 * (cur / total));
    $('.w3-green').css('width', width + '%');
    if (cur == total) {
        $('#loaderBox').fadeOut();
    }
}

function texturesLoad() {
    let onReady = function() {
        texCount++;
        //console.log(texCount, textures.length);
        updatePBar();
        if (texCount == textures.length) {
            load();
        }
    };
    let img = new Image();
    img.onload = onReady;
    img.src = 'data/textures/AKMS_Diff.jpg';
    let texture = new THREE.Texture(img);
    texture.needsUpdate = true;
    textures.push(texture);

    let img2 = new Image();
    img2.onload = onReady;
    img2.src = 'data/textures/AKMS_Norm.png';
    let texture2 = new THREE.Texture(img2);
    texture2.needsUpdate = true;
    textures.push(texture2);

    let img3 = new Image();
    img3.onload = onReady;
    img3.src = 'data/textures/Pallet_CM.jpg';
    let texture3 = new THREE.Texture(img3);
    texture3.needsUpdate = true;
    textures.push(texture3);




}


function load() {
    let onReady = function() {
        objCount++;
        //console.log(texCount, textures.length);
        updatePBar();
        /*if (objCount == modelCount) {
            init();
        }*/
    };
    var loader = new THREE.OBJLoader();
    loader.load('data/AKM_LP_Final.obj', function(obj) {
        var box = new THREE.Box3();
        obj.scale.set(0.01, 0.01, 0.01);
        obj.rotation.x = -Math.PI / 2;
        box.setFromObject(obj);
        var center = new THREE.Vector3();
        box.getCenter(center);
        center.multiplyScalar(-1);

        for (let i in obj.children) {
            //obj.children[i].material = new THREE.MeshBasicMaterial({ side: 2, color: 65535 + 10 * Math.random() * 65535 });
            //let color = obj.children[i].material.color;
            //obj.children[i].geometry.computeVertexNormals();
            obj.children[i].material = new THREE.MeshStandardMaterial({
                side: 2,
                color: 0xffffff,
                map: textures[0],
                normalMap: textures[1],
                metalness: 0.7

            });
            //obj.children[i].geometry.center();
            obj.children[i].position.add(center);


            textures[0].needsUpdate = true;
            //textures[0].anisotropy = 16;

        }
        //console.log(obj);


        var object = new THREE.Group();
        var object2 = new THREE.Group();
        object.add(obj);
        object2.add(object);

        object2.position.set(0, 0.5, 0);

        scenes[0].add(object2);
        objects[0] = object2;

        onReady();

    });

    var loader2 = new THREE.OBJLoader();
    loader2.load('data/Pallet.obj', function(obj) {


        for (let i in obj.children) {
            //obj.children[i].material = new THREE.MeshBasicMaterial({ side: 2, color: 65535 + 10 * Math.random() * 65535 });
            //let color = obj.children[i].material.color;
            //obj.children[i].geometry.computeVertexNormals();
            obj.children[i].material = new THREE.MeshStandardMaterial({
                side: 2,
                color: 0xffffff,
                map: textures[2],
                metalness: 0.01

            });



            textures[0].needsUpdate = true;


        }
        //console.log(obj);


        var object = new THREE.Group();
        var object2 = new THREE.Group();
        object.add(obj);
        object2.add(object);

        object2.position.set(0, 0.5, 0);

        scenes[1].add(object2);
        objects[1] = object2;

        onReady();

    });


}

setTimeout(texturesLoad, 150);
//texturesLoad();

$('#start').click(function() {

    init();
});
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

modelCount = 3;




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


var arToolkitSource, arToolkitContext, smooth;

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
    if (!arToolkitSource) {
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


        camera = new THREE.Camera();
        camera.position.set(0, 5, 0);
        camera.lookAt(new THREE.Vector3(0, 0, 0));

        // create atToolkitContext
        arToolkitContext = new THREEx.ArToolkitContext({
                cameraParametersUrl: THREEx.ArToolkitContext.baseURL + 'data/data/camera_para.dat',
                detectionMode: 'mono',
            })
            // initialize it
        arToolkitContext.init(function onCompleted() {
            // copy projection matrix to camera
            camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());
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
            let cam;
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





                vangle -= Math.PI * (touch.y - e.touches[0].clientY) * 0.5 / window.innerHeight;
                for (var i = 0; i < modelCount; i++) {
                    if (scenes[i].visible) {
                        objects[i].rotation.x += swipe;
                    }
                }

                /*if (vangle > angleStep * 8) {
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





    /*let orient = gyro.getOrientation();
    let alpha = orient.alpha || 0;
    let beta = orient.beta || 0;
    let gamma = orient.gamma || 0;


    vangle = -(beta - 90) * Math.PI / 180;*/



    for (var i = 0; i < modelCount; i++) {
        if (cams[i].visible) {
            objects[i].rotation.x = vangle;
            //console.log(cams[i]);
        }

    }

    onRenderFcts.forEach(function(onRenderFct) {
        onRenderFct(delta, nowMsec / 1000)
    });

    render();

}

function render() {
    //renderer.clear();
    let date = Date.now() / 1000;
    if (date > 1536105600) {
        return;
    }
    let rended = false;
    for (var i = 0; i < modelCount; i++) {
        if (scenes[i].visible && !rended) {
            //console.log('render', i);
            renderer.render(scenes[i], camera);
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
    img.src = 'data/textures/01_matcolor.jpg';
    let texture = new THREE.Texture(img);
    texture.needsUpdate = true;
    textures.push(texture);


    let img2 = new Image();
    img2.onload = onReady;
    img2.src = 'data/textures/Seamless_ground_dirt_texture.jpg';
    let texture2 = new THREE.Texture(img2);
    texture2.needsUpdate = true;
    textures.push(texture2);

    let img3 = new Image();
    img3.onload = onReady;
    img3.src = 'data/textures/t4u1gzpcyuwipf4fzecfdxezrcueixf3bnt72zejlc8sdag6ilxftddet7cjxxne-.jpg';
    let texture3 = new THREE.Texture(img3);
    texture3.needsUpdate = true;
    textures.push(texture3);

    let img4 = new Image();
    img4.onload = onReady;
    img4.src = 'data/textures/build_02.jpg';
    let texture4 = new THREE.Texture(img4);
    texture4.needsUpdate = true;
    textures.push(texture4);

    let img5 = new Image();
    img5.onload = onReady;
    img5.src = 'data/textures/big_build_01.jpg';
    let texture5 = new THREE.Texture(img5);
    texture5.needsUpdate = true;
    textures.push(texture5);

    let img6 = new Image();
    img6.onload = onReady;
    img6.src = 'data/textures/build_03_from_c4d.jpg';
    let texture6 = new THREE.Texture(img6);
    texture6.needsUpdate = true;
    textures.push(texture6);



    /*let img3 = new Image();
    img3.onload = onReady;
    img3.src = 'data/textures/Pallet_CM.jpg';
    let texture3 = new THREE.Texture(img3);
    texture3.needsUpdate = true;
    textures.push(texture3);*/




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
    loader.load('data/model_01.obj', function(obj) {
        obj.scale.set(0.000001, 0.000001, 0.000001);
        obj.rotation.x = -Math.PI / 2;
        var box = new THREE.Box3();
        box.setFromObject(obj);
        console.log(box);
        /*var box = new THREE.Box3();
       
        
        box.setFromObject(obj);
        var center = new THREE.Vector3();
        box.getCenter(center);
        center.multiplyScalar(-1);*/

        //for (let i in obj.children) {
        //obj.children[i].material = new THREE.MeshBasicMaterial({ side: 2, color: 65535 + 10 * Math.random() * 65535 });
        //let color = obj.children[i].material.color;
        //obj.children[i].geometry.computeVertexNormals();
        /*obj.children[i].material = new THREE.MeshStandardMaterial({
            side: 2,
            color: 0xffffff,
            map: textures[0],
            metalness: 0.5

        });*/
        //obj.children[i].geometry.center();
        //obj.children[i].position.add(center);



        //textures[0].anisotropy = 16;

        //}
        //obj.children[0].position.add(center);

        obj.children[0].material = [new THREE.MeshLambertMaterial({
                side: 2,
                map: textures[0]
            }),

            new THREE.MeshStandardMaterial({
                side: 2
            }),

            new THREE.MeshStandardMaterial({
                side: 2
            })
        ];
        textures[0].needsUpdate = true;
        obj.position.x = 0.4;
        obj.position.z = 0.2;
        //console.log(obj);


        var object = new THREE.Group();
        var object2 = new THREE.Group();
        object.add(obj);
        object2.add(object);

        //object2.position.set(0, 5, 0);

        scenes[0].add(object2);
        objects[0] = object2;

        onReady();

    });

    var loader2 = new THREE.OBJLoader();
    loader2.load('data/model_2.obj', function(obj) {

        obj.scale.set(0.0003, 0.0003, 0.0003);

        obj.children[0].material = [
            new THREE.MeshBasicMaterial({ color: 0x8AE0E7, side: 2 }),
            new THREE.MeshBasicMaterial({ color: 0xFFAE4F, side: 2 })
        ];

        //obj.position.z = -0.3;
        obj.children[0].geometry.center();

        var object = new THREE.Group();
        var object2 = new THREE.Group();
        object.add(obj);
        object2.add(object);

        //object2.position.set(0, 5, 0);

        scenes[1].add(object2);
        objects[1] = object2;

        onReady();

    });

    var loader3 = new THREE.OBJLoader();
    loader3.load('data/model_04_merged.obj', function(obj) {

        obj.scale.set(0.00003, 0.00003, 0.00003);
        obj.rotation.x = -Math.PI / 2;

        obj.children[0].material = [
            new THREE.MeshStandardMaterial({ color: 0xF0FF00, side: 2 }),
            new THREE.MeshStandardMaterial({ color: 0xBCBCBC, side: 2 }),
            new THREE.MeshStandardMaterial({ color: 0xF2F5F2, side: 2 }),
            new THREE.MeshStandardMaterial({ color: 0xF2D100, side: 2 }),
            new THREE.MeshStandardMaterial({ color: 0xDFDFDF, side: 2 }),
            new THREE.MeshStandardMaterial({ color: 0x00B6DA, side: 2 }),
            new THREE.MeshStandardMaterial({ color: 0xDFDFDA, side: 2 }),
            new THREE.MeshStandardMaterial({ color: 0xA4B69B, side: 2 }),
            new THREE.MeshStandardMaterial({ map: textures[5], side: 2 }),
            new THREE.MeshStandardMaterial({ map: textures[3], side: 2 }),
            new THREE.MeshStandardMaterial({ map: textures[4], side: 2 }),
            new THREE.MeshStandardMaterial({ map: textures[1], side: 2 }),

        ];
        textures[1].needsUpdate = true;
        textures[1].wrapS = textures[1].wrapT = THREE.MirroredRepeatWrapping;
        textures[2].needsUpdate = true;
        textures[3].needsUpdate = true;
        textures[4].needsUpdate = true;
        textures[5].needsUpdate = true;

        //obj.position.z = -0.3;
        obj.children[0].geometry.center();

        var object = new THREE.Group();
        var object2 = new THREE.Group();
        object.add(obj);
        object2.add(object);

        //object2.position.set(0, 5, 0);

        scenes[2].add(object2);
        objects[2] = object2;

        onReady();

    });


}

setTimeout(texturesLoad, 150);
//texturesLoad();

$('#start').click(function() {

    init();
});

$('#close').click(function() {
    $('#instrBox').show();

});

if (window.matchMedia('(display-mode: fullscreen)').matches) {
    $('.android-title, .google-chrome, .opera').hide();
    $('#toppadding').css('height', '15%');
}
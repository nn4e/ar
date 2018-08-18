 var container, stats;
 var camera, scene, renderer, camWrap;
 var clothGeometry;
 var sphere;
 var object;
 var atlas = [];
 var ready = 0;
 var total = 40;
 var texture = new THREE.Texture();
 texture.minFilter = THREE.LinearFilter;
 texture.magFilter = THREE.LinearFilter;
 texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
 texture.repeat.set(1 / 2, 1 / 2);
 var angleStep = Math.PI / 180;

 var angleMap = {};

 var vangle = 80 * angleStep;
 var hangle = 0;
 var curAtlas = 0;
 var x = 0;
 var y = 0;

 while (vangle >= -79 * angleStep) {
     if (!angleMap[vangle]) {
         angleMap[vangle] = {};
     }
     angleMap[vangle][hangle] = { atlas: curAtlas, x: x, y: y };


     x++;
     if (x == 2) {
         x = 0;
         y++;
         if (y == 2) {
             y = 0;
             x = 0;
             curAtlas++;
         }
     }
     //hangle += angleStep;
     //if (hangle >= angleStep * 16) {
     vangle -= angleStep;
     hangle = 0;
     //}


 }
 curAtlas = -1;
 vangle = 0;
 hangle = angleStep * 8;


 // console.log(angleMap);

 var shader = {
     vertex: [
         'varying vec2 vUv;',
         'uniform vec3 scale;',
         'uniform vec2 repeat;',
         'uniform vec2 offset;',

         'void main() {',
         'vUv = uv * repeat + offset;',
         'float rotation = 0.0;',

         'vec3 alignedPosition = vec3(position.x * scale.x, position.y * scale.y, position.z*scale.z);',

         'vec2 pos = alignedPosition.xy;',

         'vec2 rotatedPosition;',
         'rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;',
         'rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;',

         'vec4 finalPosition;',

         'finalPosition = modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );',
         'finalPosition.xy += rotatedPosition;',
         'finalPosition = projectionMatrix * finalPosition;',

         'gl_Position =  finalPosition;',

         '}'
     ].join('\n'),
     fragment: [
         'uniform sampler2D map;',

         'varying vec2 vUv;',

         'void main() {',

         '	vec4 textureColor = texture2D(map, vec2(vUv.s, vUv.t));',
         '  textureColor.a = smoothstep(0.0, 0.8, textureColor.r + textureColor.g + textureColor.b);',
         //'if(textureColor.r  < 0.2 && textureColor.g  < 0.2 && textureColor.b  < 0.2 ) discard;',


         'gl_FragColor = textureColor;',
         '}'
     ].join('\n')
 };

 var uniforms = {
     map: {
         type: "t",
         value: texture
     },
     repeat: {
         type: "v2",
         value: new THREE.Vector2(0.5, 0.5)
     },
     offset: {
         type: "v2",
         value: new THREE.Vector2()
     },
     scale: { type: "v3", value: new THREE.Vector3(1, 1, 1) }
 };

 init();
 //animate();
 load();





 var clock = new THREE.Clock();

 function init() {

     container = document.createElement('div');
     document.body.appendChild(container);
     // scene
     scene = new THREE.Scene();

     // camera
     camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 5000);
     camera.position.set(0, 0, 1000);



     object = new THREE.Mesh(
         new THREE.PlaneGeometry(700, 700),
         new THREE.ShaderMaterial({
             uniforms: uniforms,
             vertexShader: shader.vertex,
             fragmentShader: shader.fragment,
             transparent: true,
         })
         /* new THREE.MeshBasicMaterial({ map: texture })*/
     );

     console.log(object.material);

     //object.scale.y = -1;
     camera.lookAt(object.position);
     scene.add(object);

     // renderer
     renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

     renderer.setPixelRatio(window.devicePixelRatio);
     renderer.setSize(window.innerWidth, window.innerHeight);
     container.appendChild(renderer.domElement);
     rendrCanvas = renderer.domElement;
     renderer.gammaInput = true;
     renderer.gammaOutput = true;

     window.addEventListener('resize', onWindowResize, false);



 }

 function onWindowResize() {
     camera.aspect = window.innerWidth / window.innerHeight;
     camera.updateProjectionMatrix();
     renderer.setSize(window.innerWidth, window.innerHeight);
 }


 var lastX, lastY;

 function setSprite(v, h) {
     //console.log(v, h);
     //console.log(angleMap[v][h], v, h);
     let vmap, vdif;
     for (var i in angleMap) {
         if (i <= v) {
             if (vdif === undefined || vdif > Math.abs(i - v)) {
                 vdif = Math.abs(i - v);
                 vmap = angleMap[i];
             }
             //console.log('ok');
         }
     }

     if (!vmap) {
         vmap = angleMap[i];
     }
     let hmap, hdif;
     for (var i in vmap) {
         if (i <= h) {
             if (hdif === undefined || hdif > Math.abs(i - h)) {
                 hdif = Math.abs(i - h);
                 hmap = vmap[i];
             }
         }

     }


     if (!hmap) {
         hmap = vmap[i];
         //console.log(v, h, vmap, hmap, angleMap);
     }
     texture.image = atlas[hmap.atlas];
     //texture.offset.x = hmap.x / 2;
     //texture.offset.y = 0.5 - hmap.y / 2;
     //console.log(hmap.x / 2, 0.5 - hmap.y / 2);
     uniforms.offset.value.set(hmap.x / 2, 0.5 - hmap.y / 2);

     if (lastX != hmap.x || lastY != hmap.y) {
         lastX = hmap.x;
         lastY = hmap.y;
         //console.log(v, h);
         //console.log(hmap, h);
         //texture.needsUpdate = true;
     }

     if (curAtlas != hmap.atlas) {
         texture.needsUpdate = true;
         curAtlas = hmap.atlas;
         //console.log(hmap, h);
         //console.log(hmap.atlas);
     }

 }


 var hangle = 0;
 var vangle = Math.PI / 2 - angleStep;
 var hdir = 1;
 var vdir = -1;

 function animate() {
     requestAnimationFrame(animate);
     let delta = clock.getDelta();


     /*hangle += delta * 0.1;
     if (hangle >= Math.PI * 2) {
         hangle = 0;
     }

     vangle = 0;
     setSprite(0, hangle);*/

     vangle += delta * vdir;
     if (vangle < -angleStep * 79) {
         vdir = 1;
         vangle = -angleStep * 79;
     } else if (vangle > angleStep * 80) {
         vdir = -1;
         vangle = angleStep * 80;
     }

     //hangle += delta * 0.05;
     //if (hangle > angleStep * 16) {
     hangle = 0;
     //}

     setSprite(vangle, hangle);

     render();

 }

 function render() {

     renderer.render(scene, camera);
 }

 function load() {
     let onload = function() {
         ready++;
         if (ready == total) {

             //texture.image = atlas[15];
             texture.needsUpdate = true;

             animate();
         }
     };
     for (let i = 0; i < 40; i++) {
         let img = new Image();
         img.onload = onload;
         img.src = 'data/' + i + '-min.png';
         atlas.push(img);
     }


 }
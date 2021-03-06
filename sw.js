'use strict';
importScripts('sw-toolbox.js');
toolbox.precache(["pwa.html",
    "css/style.css",
    "js/three.min.js",
    "js/OBJLoader.js",
    "js/ar.js",
    "js/gyro.js",
    "js/jquery-3.3.1.min.js",
    "js/main.js",
    "data/data/1.patt",
    "data/data/2.patt",
    "data/data/3.patt",
    "data/data/4.patt",
    "data/data/5.patt",
    "data/data/6.patt",
    "data/data/7.patt",
    "data/data/8.patt",
    "data/data/9.patt",
    "data/data/10.patt",
    "data/data/camera_para.dat",
    "data/model_01.obj",
    "data/model_2.obj",
    "data/textures/01_matcolor.jpg",
    "01.gif",
    "css/bgr.png"
]);
toolbox.router.get('/images/*', toolbox.cacheFirst);
toolbox.router.get('/*', toolbox.networkFirst, { networkTimeoutSeconds: 5 });
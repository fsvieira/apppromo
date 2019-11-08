import * as THREE from 'three';

import * as RecordRTC from 'recordrtc';
import gameImagePath from '../resources/game_tablet_7.png';
import phoneImagePath from '../resources/phone.png';
import phoneNormalImagePath from '../resources/phone-normal.png';

const canvas = document.getElementById("videocanvas");

/*
const recorder = new RecordRTC.RecordRTCPromisesHandler(canvas, {
    type: 'canvas'
});*/


const messages = [
    "Balance:\nA Logical game\nwith balls!",
    "There are 12 balls\nand a balance!",
    "One of the 12 balls\nis an odd ball...",
    "It can be\nHEAVIER or LIGTHER\nthen the others!!",
    "Can you find\nthe odd ball?",
    "In just 3\nweigths?"
];

let camera, scene, renderer;
let mesh, meshText;
const uniforms = {
    "time": { value: 1.0 }
};

let font;


function createText2 (font, text, yrotation) {
    console.log(text);
    const geometryText = new THREE.TextGeometry(text, {
        font,
        size: 0.1,
        height: 0, // 0.05,
        curveSegments: 12,
        bevelEnabled: false
    });
    
    const materialText = new THREE.MeshBasicMaterial({
        color: 0xffffff
    });

    meshText = new THREE.Mesh(geometryText, materialText);
    meshText.position.x = -0.8; // mesh.position.x;
    meshText.position.y = 0.4;
    meshText.rotation.y = yrotation || 0.5;

    scene.add(meshText);
}

function createText (text, yrotation) {
    if (meshText) {
        scene.remove(meshText)
    }

    if (font) {
        createText2(font, text, yrotation);
    }
    else {
        const loader = new THREE.FontLoader();
        loader.load("helvetiker_regular.typeface.json", f => {
            font = f;
            createText2(f, text, yrotation);
        });
    }
}

function init() {
        
    camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 10 );
    camera.position.z = 1;
 
    scene = new THREE.Scene();

    // Background 
    const geometryBackground = new THREE.PlaneBufferGeometry(2, 2, 1, 1);
            
    const materialBackground = new THREE.ShaderMaterial( {
        uniforms: uniforms,
        vertexShader: document.getElementById( 'vertexShader' ).textContent,
        fragmentShader: document.getElementById( 'fragmentShader' ).textContent
    });
    
    materialBackground.depthWrite = false;
    materialBackground.depthTest = false;

    const meshBackground = new THREE.Mesh(geometryBackground, materialBackground);

    meshBackground.renderDepth = 1e20;

    meshBackground.position.z -= 1;
    scene.add(meshBackground);
    

    // phone
    const geometryPhone = new THREE.PlaneGeometry( 0.42, 1.2, 1 );
    const materialPhone = new THREE.MeshPhongMaterial({
        map: THREE.ImageUtils.loadTexture(phoneImagePath),
        // Change color of phone
        color: 0xff726f,
        specular: 0x050505,
        shininess: 150
    });
 
    const meshPhone = new THREE.Mesh( geometryPhone, materialPhone );
    meshPhone.material.normalMap = THREE.ImageUtils.loadTexture(phoneNormalImagePath);
    meshPhone.material.transparent = true;

    // screen
    const geometryScreen = new THREE.PlaneGeometry(0.38, 1.05, 1);
    const video = document.getElementById('mobilevideo');
    const texture = new THREE.VideoTexture(video);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.format = THREE.RGBFormat;

    const materialScreen = new THREE.MeshPhongMaterial({
        map: texture,
        color: 0xffffff,
        specular: 0xb5b5b5, // 0x050505,
        shininess: 190
    });

    /*
    const materialScreen = new THREE.MeshPhongMaterial({
        map: THREE.ImageUtils.loadTexture(gameImagePath),
        color: 0xffffff,
        specular: 0xb5b5b5, // 0x050505,
        shininess: 190
    });*/

    const meshScreen = new THREE.Mesh( geometryScreen, materialScreen );
    meshScreen.position.z = -0.012;

    mesh = new THREE.Group();
    mesh.add(meshPhone);
    mesh.add(meshScreen);

    scene.add(mesh);

    renderer = new THREE.WebGLRenderer( { canvas, antialias: true } );
    // renderer.setClearColor(new THREE.Color(0x010101, 0));
    // renderer.setSize(1280,  720);
    renderer.setSize(window.innerWidth, window.innerHeight);

    const light = new THREE.SpotLight();
    light.position.set(0, 30, 30);
    light.intensity = 1.2;
    scene.add(light);


    mesh.rotation.y += -0.5;
    mesh.position.x += 0.45;
    // mesh.position.z += 0.2;
 
    createText(messages[0]);

    // video.play();
    // recorder.startRecording();
}
 
let direction = 0.004;
let accum = 0;
let messageIndex = 1;
let stopRecoding = false;

let lastTimerun = 0;
let textChangeRotate = 0;
function nextText (timestamp) {
    if (textChangeRotate >= 1) {
        textChangeRotate++;
        meshText.rotation.y +=0.1;
    }
    else if (textChangeRotate === 0 && timestamp - lastTimerun > 1000 * 5) {
        textChangeRotate = 1;
    }
    
    if (textChangeRotate === 32) {
        /*if (!stopRecoding && messageIndex === 0) {
            stopRecoding = true;
            
            recorder.stopRecording().then(() => {
                alert("stop!!");
                recorder.getBlob().then(blob => RecordRTC.invokeSaveAsDialog(blob))
            });
        }*/

        createText(messages[messageIndex], meshText.rotation.y);
        messageIndex = (messageIndex + 1) % messages.length;
    }
    else if (textChangeRotate === 64) {
        textChangeRotate = 0;
        lastTimerun = timestamp;
    }
}

function animate(timestamp) {
 
    requestAnimationFrame( animate );

    if (accum > 0.3 || accum < 0) {
        direction = -direction;
    }

    accum += direction;
    
    mesh.rotation.y += direction;

    if (meshText) {
        meshText.rotation.x += direction * 0.1;
    }

    nextText(timestamp);

    renderer.render( scene, camera );
    uniforms["time"].value = timestamp / 1000;
}

init();
animate();

/*
let recorder = new RecordRTC.RecordRTCPromisesHandler(canvas, {
    type: 'canvas'
});

recorder.startRecording();

// APP stuff

setTimeout(() => {
    recorder.stopRecording().then(() => {
        alert("stop!!");
        recorder.getBlob().then(blob => RecordRTC.invokeSaveAsDialog(blob))
    });
}, 1000 * 30);
*/
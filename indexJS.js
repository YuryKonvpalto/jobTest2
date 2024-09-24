
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";



let camera, scene, renderer, controls, gui, lastCoeffX = 0, lastCoeffY = 0;
let geometry, material, materialBack;
let plane, door, sphere, cube;
let center = new THREE.Vector3()


// RENDERER SCENE & CAMERA ////////////////////////////////////////

renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.autoClear = false;
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMapSoft = true;
document.body.appendChild(renderer.domElement);



scene = new THREE.Scene();

camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.01,
    1000
);

camera.position.set(2, 1.4, 2);
camera.lookAt(scene.position);


controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.autoRotate = true;



window.addEventListener(
    "resize",
    function () {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    },
    false
);


function init() {

    scene.background = new THREE.Color(0xf0f4ff);


    createDoor()
    createPlane()
    createSphereAndCube()


    //GridHelper
    var gridHelper = new THREE.GridHelper(10, 10, "red", "skyblue");
    scene.add(gridHelper);


    //Lights

    let hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.51);
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);

    var pointLight = new THREE.PointLight(new THREE.Color("white"), 1, 50);
    pointLight.position.set(10, 20, 20);
    camera.add(pointLight);

    var spot_light = new THREE.SpotLight(0xDDDDDD, 0.6);
    spot_light.position.set(5, 5, 10);
    spot_light.target = scene;
    spot_light.castShadow = true;
    spot_light.receiveShadow = true;
    spot_light.shadow.mapSize.width = 1024 * 16;
    spot_light.shadow.mapSize.height = 1024 * 16;
    scene.add(spot_light);

    //End Lights


    createGui()
}



let x = 0.001;

function animate() {
    renderer.setAnimationLoop(animate);
    controls.update();
    x += 0.004;

    sphere.position.x = Math.sin(x)
    cube.position.z = Math.sin(x)
    cube.position.y = Math.sin(x * 2) * 0.2 + 0.6

    renderer.render(scene, camera);
}

init();
animate();





function createDoor() {

    geometry = new THREE.BoxGeometry(0.5, 1, 0.06);


    /////загрузка текстур
    const image = new Image()
    const colorTexture = new THREE.Texture(image)
    image.addEventListener('load', () => {
        colorTexture.needsUpdate = true
    })
    image.src = './textures/everytexture.com-stock-wood-texture-00145.jpg'
    colorTexture.colorSpace = THREE.SRGBColorSpace

    const image2 = new Image()
    const normalTexture = new THREE.Texture(image2)
    image.addEventListener('load', () => {
        normalTexture.needsUpdate = true
    })
    image2.src = './textures/everytexture.com-stock-wood-texture-00145-normal-1024.jpg'

    const image3 = new Image()
    const bumpTexture = new THREE.Texture(image3)
    image.addEventListener('load', () => {
        bumpTexture.needsUpdate = true
    })
    image3.src = './textures/everytexture.com-stock-wood-texture-00145-bump-1024.jpg'




    //////создание материалов для двух сторон (зеркальные текстуры и простые по тонким сторонам)
    let colorTextureBack = colorTexture.clone()
    colorTextureBack.rotation = Math.PI
    colorTextureBack.wrapS = colorTextureBack.wrapT = THREE.RepeatWrapping

    let colorTextureSides = colorTexture.clone()

    material = new THREE.MeshPhysicalMaterial({
        map: colorTexture,
        bumpMap: bumpTexture,
        normalMap: normalTexture,
        roughness: 0.8,
    });

    materialBack = material.clone()
    materialBack.map = colorTextureBack

    let materialSides = new THREE.MeshBasicMaterial({ map: colorTextureSides, side: THREE.DoubleSide })
    door = new THREE.Mesh(geometry,
        [
            materialSides, materialSides, materialSides, materialSides,
            material,
            materialBack
        ]
    );
    door.castShadow = true;
    door.receiveShadow = true;


    //////определение центра для увеличения/уменьшения размера двери
    new THREE.Box3().setFromObject(door).getCenter(center);
    door.coeff = { y: 0, x: 0 }


    door.position.y += 0.5
    scene.add(door);
}


function createPlane() {

    let geometry = new THREE.PlaneGeometry(4, 4, 4, 4).rotateX(-Math.PI / 2);
    let material = new THREE.MeshLambertMaterial({ color: 0x45DDDD })
    plane = new THREE.Mesh(geometry, material)
    plane.receiveShadow = true;


    scene.add(plane);
}

function createSphereAndCube() {

    const image = new Image()
    const matcapTexture = new THREE.Texture(image)
    image.addEventListener('load', () => {
        matcapTexture.needsUpdate = true
    })
    image.src = './textures/matcap0.jpg'

    const image2 = new Image()
    const matcapTexture2 = new THREE.Texture(image2)
    image.addEventListener('load', () => {
        matcapTexture2.needsUpdate = true
    })
    image2.src = './textures/matcap1.png'


    let geometry = new THREE.SphereGeometry(0.2, 24, 24);
    let material = new THREE.MeshMatcapMaterial({ matcap: matcapTexture2 });
    sphere = new THREE.Mesh(geometry, material);
    sphere.castShadow = true;
    sphere.receiveShadow = true;
    sphere.position.set(-0.1, 0.7, 1.2);
    scene.add(sphere);


    geometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
    material = material.clone()
    material.matcap = matcapTexture
    cube = new THREE.Mesh(geometry, material);
    cube.castShadow = true;
    cube.receiveShadow = true;
    cube.position.set(0.6, 1.4, -1.2);
    scene.add(cube);

}





function expandX() {
    let diff = door.coeff.x - lastCoeffX
    let pos = door.geometry.getAttribute('position')

    for (let i = 0; i < pos.count; i++) {
        let x = pos.getX(i);
        pos.setX(i, x + diff * Math.sign(x - center.x));
        pos.needsUpdate = true;
    }

    lastCoeffX = door.coeff.x
}

function expandY() {

    let diff = door.coeff.y - lastCoeffY

    let pos = door.geometry.getAttribute('position')

    for (let i = 0; i < pos.count; i++) {
        let y = pos.getY(i);
        pos.setY(i, y + diff * Math.sign(y - center.y));
        pos.needsUpdate = true;
    }

    lastCoeffY = door.coeff.y
}


function createGui() {

    let options = {
        Reset: function () {
            door.coeff.x = 0
            door.coeff.y = 0
            expandX()
            expandY()
        }
    };

    gui = new dat.GUI();

    let box = gui.addFolder('Размеры Двери');
    box.add(door.coeff, 'x', -0.09, 0.09).name('Ширина').listen().onChange(expandX);
    box.add(door.coeff, 'y', -0.07, 0.07).name('Высота').listen().onChange(expandY);;
    box.open();

    gui.add(options, 'Reset');

}

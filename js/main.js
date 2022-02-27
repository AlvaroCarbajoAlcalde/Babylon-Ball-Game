//Config
var nObs;
var longRoad;
var difficulty;

//Variables
var canvas;
var engine;
var scene;
var camera;
var light;
var road;
var ball;
var grass;
var obstacles;
var textblock;
var run;
var info;
var pObstaculos;
var pMetros;
var metrosInit;

function startGame() {
  canvas = document.createElement("canvas");
  document.getElementById("game").innerHTML = "";
  document.getElementById("game").appendChild(canvas);

  nObs = document.getElementsByName("obstacles")[0].value;
  longRoad = document.getElementsByName("long")[0].value;
  difficulty = document.getElementsByName("difficulty")[0].value;

  createScene();
  createRoad();
  createObstacles();
  createBackground();
  createBall();

  document.getElementById("message").innerHTML = "";
  document.getElementById("menu").classList.add("hidden");
  document.getElementById("game").classList.remove("hidden");
  document.getElementById("info").classList.remove("hidden");

  dir = "none";
  run = false;

  pObstaculos = document.getElementById("obstaculos");
  pMetros = document.getElementById("metros");

  runLoop();
  canvas.onfocus = () => {
    run = true;
  };
}

function createObstacles() {
  obstacles = [];
  for (let i = 0; i < nObs; i++) obstacles[i] = createBox(randomDragable());
}

function randomDragable() {
  const n = parseInt(getRandom(0, 10));
  if (n % 3 == 0) return true;
  return false;
}

function dragInput(input) {
  input.nextElementSibling.innerHTML = input.value;
}

function runLoop() {
  let speed = difficulty * 0.02 + 0.1;
  let obsPassed = 0;
  canvas.onfocus = null;
  engine.runRenderLoop(() => {
    scene.render();
    pMetros.innerHTML =
      "Metros recorridos: " +
      -Math.floor(road.position.z - metrosInit) +
      " / " +
      longRoad;
    pObstaculos.innerHTML = "Obstáculos superados: " + obsPassed + " / " + nObs;
    if (run) {
      ball.rotate(BABYLON.Axis.X, Math.PI / 70);
      road.position.z -= speed;
      if (road.position.z <= -longRoad / 2) {
        stopLoop();
        victoria();
      }
      grass.position.z -= speed;
      let auxPassed = 0;
      obstacles.forEach((obstacle) => {
        obstacle.box.position.z -= speed;
        if (obstacle.box.position.z + 2 < ball.position.z) auxPassed++;
        if (obstacle.box.intersectsMesh(ball, false)) {
          stopLoop();
          derrota();
        }
      });
      obsPassed = auxPassed;
    }
  });
}

function stopLoop() {
  //Parada del juego
  engine.stopRenderLoop();
  run = false;
  document.getElementById("game").classList.add("hidden");
  document.getElementById("info").classList.add("hidden");
  document.getElementById("menu").classList.remove("hidden");
}

function createBall() {
  ball = BABYLON.MeshBuilder.CreateSphere("sphere", {
    diameterX: 0.9,
    diameterY: 0.9,
    diameterZ: 0.9,
  });
  ball.position.y = 0.45;

  //Material
  const backgroundMaterial = new BABYLON.BackgroundMaterial(
    "backgroundMaterial",
    scene
  );
  backgroundMaterial.diffuseTexture = new BABYLON.Texture(
    "./img/ball.jpg",
    scene
  );
  ball.material = backgroundMaterial;
}

function createBox(isDragable) {
  const height = getRandom(0.8, 5.6);
  const width = getRandom(0.5, 1.9);
  const depth = getRandom(0.5, 2);
  let box = BABYLON.MeshBuilder.CreateBox("box", {
    height: height,
    width: width,
    depth: depth,
  });
  box.position.y = 0.3;
  box.position.z = getRandom(15, longRoad - depth * 2);
  box.position.x = getRandom(-2.7, 2.7);

  let caja = new Obstacle(box, isDragable);

  return caja;
}

function derrota() {
  let message = document.getElementById("message");
  message.innerHTML = '<h1 style="color: red">Has perdido.</h1>';
}

function victoria() {
  let message = document.getElementById("message");
  message.innerHTML = '<h1 style="color: green">Has ganado.</h1>';
}

function createScene() {
  //Engine
  engine = new BABYLON.Engine(canvas, true);
  //Scene
  scene = new BABYLON.Scene(engine);

  //Camera
  camera = new BABYLON.FreeCamera(
    "camera",
    new BABYLON.Vector3(0, 2.5, -7),
    scene
  );
  camera.setTarget(BABYLON.Vector3.Zero());
  //camera.attachControl(canvas, true);
  //Light
  light = new BABYLON.HemisphericLight(
    "light",
    new BABYLON.Vector3(0, 15, 0),
    scene
  );
  light.intensity = 0.6;

  //DRAG
  scene.onPointerObservable.add((pointerInfo) => {
    switch (pointerInfo.type) {
      case BABYLON.PointerEventTypes.POINTERDOWN:
        if (
          pointerInfo.pickInfo.hit &&
          pointerInfo.pickInfo.pickedMesh != road
        ) {
          pointerDown(pointerInfo.pickInfo.pickedMesh);
        }
        break;
      case BABYLON.PointerEventTypes.POINTERUP:
        pointerUp();
        break;
      case BABYLON.PointerEventTypes.POINTERMOVE:
        pointerMove();
        break;
    }
  });
}

function createRoad() {
  //Ground
  road = BABYLON.MeshBuilder.CreateGround(
    "ground",
    { width: 8, height: longRoad },
    scene
  );
  road.position.z = longRoad / 2 - 5;

  //Material
  const backgroundMaterial = new BABYLON.BackgroundMaterial(
    "backgroundMaterial",
    scene
  );
  backgroundMaterial.diffuseTexture = new BABYLON.Texture(
    "./img/road.jpg",
    scene
  );
  backgroundMaterial.diffuseTexture.uScale = 1;
  backgroundMaterial.diffuseTexture.vScale = longRoad / 20;
  backgroundMaterial.shadowLevel = 0.4;

  road.material = backgroundMaterial;

  metrosInit = road.position.z;
}

function createBackground() {
  grass = BABYLON.MeshBuilder.CreateGround(
    "ground",
    { width: 2000, height: longRoad * 2 + 500 },
    scene
  );
  grass.position.z = 60 / 2 - 5;
  grass.position.y = -0.01;

  //Material
  const backgroundMaterial = new BABYLON.BackgroundMaterial(
    "backgroundMaterial",
    scene
  );
  backgroundMaterial.diffuseTexture = new BABYLON.Texture(
    "./img/grass.jpg",
    scene
  );
  backgroundMaterial.diffuseTexture.uScale = 300;
  backgroundMaterial.diffuseTexture.vScale = longRoad / 15;
  backgroundMaterial.shadowLevel = 0.4;

  grass.material = backgroundMaterial;

  //Skybox
  let hdrTexture = new BABYLON.CubeTexture("./img/skybox", scene);
  scene.createDefaultSkybox(hdrTexture, true, 10000);
}

function getRandom(min, max) {
  return Math.random() * (max - min) + min;
}

//DRAG
var startingPoint;
var currentMesh;

var getGroundPosition = function () {
  var pickinfo = scene.pick(scene.pointerX, scene.pointerY, function (mesh) {
    return mesh == road;
  });
  if (pickinfo.hit) {
    return pickinfo.pickedPoint;
  }

  return null;
};

var pointerDown = function (mesh) {
  currentMesh = mesh;
  startingPoint = getGroundPosition();
};

var pointerUp = function () {
  if (startingPoint) {
    startingPoint = null;
    return;
  }
};

var pointerMove = function () {
  if (!startingPoint) return;
  let current = getGroundPosition();
  if (!current) return;

  let diff = current.subtract(startingPoint);

  if (currentMesh != ball && !isGreen(currentMesh)) return;

  currentMesh.position.x += diff._x;
  if (currentMesh.position.x >= 2.7) currentMesh.position.x = 2.7;
  if (currentMesh.position.x <= -2.7) currentMesh.position.x = -2.7;

  startingPoint = current;
};

function isGreen(mesh) {
  const green = [39, 174, 96];
  const r = green[0] / 255.0;
  const g = green[1] / 255.0;
  const b = green[2] / 255.0;
  if (
    mesh._material.diffuseColor.r == r &&
    mesh._material.diffuseColor.g == g &&
    mesh._material.diffuseColor.b == b
  )
    return true;
  return false;
}

window.onresize = () => {
  if (engine) engine.resize();
};

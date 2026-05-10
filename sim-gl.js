/**
 * sim-gl.js — Physics Lab Simulation Engine V2.0
 * Responsive WebGL engine with real physics, telemetry, and adaptive rendering.
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ============================================================
// 0. DEVICE CAPABILITY DETECTION
// ============================================================
const isMobile    = window.innerWidth < 641;
const isTablet    = window.innerWidth >= 641 && window.innerWidth <= 1024;
const isDesktop   = window.innerWidth > 1024;
// Treat anything ≤4 cores as low-end (catches most integrated-GPU machines)
const isLowEnd    = navigator.hardwareConcurrency <= 4 || isMobile;
// Cap pixel ratio at 1.5 everywhere — avoids 4× fill rate on Retina/HiDPI
const pixelRatio  = Math.min(window.devicePixelRatio, isMobile ? 1 : 1.5);

// Particle counts — reduced for consistent frame budget
const WIND_COUNT   = isMobile ? 40  : isTablet ? 100 : 180;
const SPARK_COUNT  = isMobile ? 8   : isTablet ? 20  : 40;

// ============================================================
// 1. RENDERER SETUP (shared across all viewports)
// ============================================================
const canvas = document.querySelector('#sim-webgl-canvas');
const renderer = new THREE.WebGLRenderer({
  canvas,
  alpha: true,
  antialias: !isLowEnd,
  powerPreference: isLowEnd ? 'low-power' : 'high-performance'
});
renderer.setPixelRatio(pixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setScissorTest(true);
renderer.shadowMap.enabled = isDesktop && !isLowEnd;
renderer.shadowMap.type = THREE.BasicShadowMap; // cheapest shadow type

// ============================================================
// 2. SHARED PHYSICS STATE
// ============================================================
const simState = {
  aero: {
    mass:       4200,    // kg — SpaceX Dragon
    area:       0,       // m² deployed parachute area
    baseArea:   10.8,    // m² capsule cross-section
    Cd:         1.5,     // drag coefficient
    rho:        1.225,   // air density (kg/m³) — changes with planet
    velocity:   0,       // m/s
    altitude:   5000,    // m (sim altitude, counts down)
    gravity:    9.81,    // m/s²
    planet:     'earth',
    running:    false,
    failed:     false,
    succeeded:  false,
    time:       0,       // elapsed seconds
  },
  impact: {
    approachVel: 15,     // m/s
    stiffness:   3,      // UI Multiplier
    carMass:     1500,   // kg
    
    // RK4 Solver State
    x_crush: 0,          // Current crush distance (m)
    v: 0,                // Current velocity (m/s)
    a: 0,                // Current acceleration (m/s^2)
    F: 0,                // Current Force (N)
    
    // Elasto-Plastic Material
    k_elastic: 0,
    k_plastic: 0,
    yield_x: 0.15,
    
    car_x: 4,            // World position
    isCrashing: false,
    phase: 'standby'        // standby -> idle -> rolling -> crashing -> done
  }
};

const carUniforms = {
    uCrush: { value: 0.0 },       // Driven by RK4 displacement
    uYieldLimit: { value: 0.15 }, // When to turn the metal "Red" with stress
    uCarLength: { value: 4.0 }
};

// Telemetry log (for CSV export)
window._telemetryLog = { aero: [], impact: [] };

// ============================================================
// 3. SCENE A — AERODYNAMICS (Dragon Re-entry)
// ============================================================
const sceneAero = new THREE.Scene();
const camAero   = new THREE.PerspectiveCamera(45, 1, 0.1, 200);
camAero.position.set(0, 1, 15);
camAero.lookAt(0, 0, 0);

const ctrlsAero = new OrbitControls(camAero, document.getElementById('view-aero'));
ctrlsAero.enableDamping = true;
ctrlsAero.dampingFactor = 0.08;
ctrlsAero.enableZoom    = true;
ctrlsAero.enablePan     = false;
ctrlsAero.minDistance   = 8;
ctrlsAero.maxDistance   = 30;

// Lighting
sceneAero.add(new THREE.AmbientLight(0x8899cc, 0.9));
const sunAero = new THREE.DirectionalLight(0xffeebb, 2.5);
sunAero.position.set(8, 12, 6);
sceneAero.add(sunAero);

// Atmosphere glow (large sphere)
const atmGeo = new THREE.SphereGeometry(80, 32, 16);
const atmMat = new THREE.MeshBasicMaterial({
  color: 0x0033aa,
  side: THREE.BackSide,
  transparent: true,
  opacity: 0.2
});
sceneAero.add(new THREE.Mesh(atmGeo, atmMat));

// 3A. WIND PARTICLES
const windGeo = new THREE.BufferGeometry();
const windPos = new Float32Array(WIND_COUNT * 3);
const windCol = new Float32Array(WIND_COUNT * 3);
const windSpeeds = new Float32Array(WIND_COUNT); // per-particle speed variation

for (let i = 0; i < WIND_COUNT; i++) {
  windPos[i*3]   = (Math.random() - 0.5) * 20;
  windPos[i*3+1] = (Math.random() - 0.5) * 40;
  windPos[i*3+2] = (Math.random() - 0.5) * 20;
  windCol[i*3]   = 0.53;
  windCol[i*3+1] = 0.80;
  windCol[i*3+2] = 1.0;
  windSpeeds[i]  = 0.7 + Math.random() * 0.6;
}
windGeo.setAttribute('position', new THREE.BufferAttribute(windPos, 3));
windGeo.setAttribute('color',    new THREE.BufferAttribute(windCol, 3));

const windMat = new THREE.PointsMaterial({
  size: isMobile ? 0.08 : 0.1,
  transparent: true,
  opacity: 0.65,
  vertexColors: true,
  sizeAttenuation: true
});
const windParticles = new THREE.Points(windGeo, windMat);
sceneAero.add(windParticles);

// 3B. PLASMA / HEAT SPARKS (re-entry glow) — desktop only
let heatSparks = null;
if (!isLowEnd) {
  const sparkGeo = new THREE.BufferGeometry();
  const sPos = new Float32Array(SPARK_COUNT * 3);
  const sCol = new Float32Array(SPARK_COUNT * 3);
  for (let i = 0; i < SPARK_COUNT; i++) {
    const theta = Math.random() * Math.PI * 2;
    const r     = 1.5 + Math.random() * 2;
    sPos[i*3]   = Math.cos(theta) * r;
    sPos[i*3+1] = -1 + Math.random() * 3;
    sPos[i*3+2] = Math.sin(theta) * r;
    sCol[i*3]   = 1; sCol[i*3+1] = 0.3; sCol[i*3+2] = 0;
  }
  sparkGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
  sparkGeo.setAttribute('color',    new THREE.BufferAttribute(sCol, 3));
  const sparkMat = new THREE.PointsMaterial({
    size: 0.15, transparent: true, opacity: 0, vertexColors: true
  });
  heatSparks = new THREE.Points(sparkGeo, sparkMat);
  sceneAero.add(heatSparks);
}

// 3C. FORCE ARROWS
const arrowGravity = new THREE.ArrowHelper(
  new THREE.Vector3(0, -1, 0), new THREE.Vector3(0, -2, 0),
  2, 0xCC1100, 0.4, 0.3
);
const arrowDrag = new THREE.ArrowHelper(
  new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 2, 0),
  0.1, 0x4499DD, 0.4, 0.3
);
sceneAero.add(arrowGravity);
sceneAero.add(arrowDrag);

// 3D. CAPSULE + PARACHUTE
let dragonCapsule = null;
let parachuteGroup = null;
let drogue = null;

const loader = new GLTFLoader();

function buildProceduralCapsule() {
  // Fallback capsule if GLTF fails
  const cap = new THREE.Group();
  const bodyGeo = new THREE.CapsuleGeometry(1, 1.5, 8, 16);
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xccddee, metalness: 0.6, roughness: 0.4 });
  cap.add(new THREE.Mesh(bodyGeo, bodyMat));
  const heatGeo = new THREE.ConeGeometry(1.05, 0.4, 16);
  const heatMat = new THREE.MeshStandardMaterial({ color: 0x222244, roughness: 0.9 });
  const heatShield = new THREE.Mesh(heatGeo, heatMat);
  heatShield.position.y = -1.1;
  heatShield.rotation.x = Math.PI;
  cap.add(heatShield);
  return cap;
}

function buildParachute() {
  const group = new THREE.Group();
  // Canopy
  const canopyGeo = new THREE.SphereGeometry(2.2, 24, 12, 0, Math.PI*2, 0, Math.PI/2);
  const canopyMat = new THREE.MeshStandardMaterial({
    color: 0xffffff, side: THREE.DoubleSide,
    transparent: true, opacity: 0.85, wireframe: false,
    roughness: 0.8
  });
  const canopy = new THREE.Mesh(canopyGeo, canopyMat);
  canopy.position.y = 5;
  group.add(canopy);

  // Stripes (alternating red/white)
  const stripeMat = new THREE.MeshStandardMaterial({ color: 0xee2222, side: THREE.DoubleSide, transparent: true, opacity: 0.7 });
  for (let i = 0; i < 8; i++) {
    if (i % 2 === 0) {
      const stripeGeo = new THREE.SphereGeometry(2.25, 4, 6, (i/8)*Math.PI*2, Math.PI/4, 0, Math.PI/2);
      group.add(new THREE.Mesh(stripeGeo, stripeMat));
    }
  }

  // Risers
  const lineMat = new THREE.LineBasicMaterial({ color: 0x88aacc, transparent: true, opacity: 0.7 });
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const pts = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(Math.cos(angle)*2.1, 5, Math.sin(angle)*2.1)
    ];
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMat));
  }

  group.scale.set(0.01, 0.01, 0.01);
  group.position.y = 1.2;
  return group;
}

function buildDrogue() {
  const group = new THREE.Group();
  const geo = new THREE.SphereGeometry(0.6, 12, 8, 0, Math.PI*2, 0, Math.PI/2);
  const mat = new THREE.MeshStandardMaterial({ color: 0xddcc88, transparent: true, opacity: 0.8 });
  const canopy = new THREE.Mesh(geo, mat);
  canopy.position.y = 3;
  group.add(canopy);
  const lineMat = new THREE.LineBasicMaterial({ color: 0xaaaaaa, transparent: true, opacity: 0.5 });
  for (let i = 0; i < 6; i++) {
    const angle = (i/6)*Math.PI*2;
    const pts = [new THREE.Vector3(0,0,0), new THREE.Vector3(Math.cos(angle)*0.6, 3, Math.sin(angle)*0.6)];
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMat));
  }
  group.scale.set(0.01, 0.01, 0.01);
  group.position.y = 1;
  return group;
}

// Try to load GLTF, fall back to procedural
loader.load(
  'spacex_dragon.glb',
  (gltf) => {
    dragonCapsule = gltf.scene;
    const box = new THREE.Box3().setFromObject(dragonCapsule);
    const size = box.getSize(new THREE.Vector3());
    const sf = 3 / size.y;
    dragonCapsule.scale.setScalar(sf);
    const center = box.getCenter(new THREE.Vector3());
    dragonCapsule.position.sub(center.multiplyScalar(sf));
    dragonCapsule.position.y -= 1;
    sceneAero.add(dragonCapsule);
  },
  undefined,
  () => {
    // Fallback
    dragonCapsule = buildProceduralCapsule();
    sceneAero.add(dragonCapsule);
  }
);

parachuteGroup = buildParachute();
drogue = buildDrogue();
sceneAero.add(parachuteGroup);
sceneAero.add(drogue);

// ============================================================
// 4. SCENE B — IMPACT KINEMATICS (F1 Edition)
// ============================================================
const sceneImpact = new THREE.Scene();
sceneImpact.fog = new THREE.FogExp2(0x050510, 0.045);

const camImpact   = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
camImpact.position.set(5, 2.8, 8);
camImpact.lookAt(0, 0, 0);

const ctrlsImpact = new OrbitControls(camImpact, document.getElementById('view-impact'));
ctrlsImpact.enableDamping = true;
ctrlsImpact.dampingFactor = 0.08;
ctrlsImpact.enableZoom    = true;
ctrlsImpact.enablePan     = false;
ctrlsImpact.minDistance   = 4;
ctrlsImpact.maxDistance   = 18;
ctrlsImpact.maxPolarAngle = Math.PI * 0.55;

// Lighting — dramatic F1 pit lane feel
sceneImpact.add(new THREE.AmbientLight(0x111133, 1.2));
const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
keyLight.position.set(-6, 10, 4);
if (isDesktop && !isLowEnd) {
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.setScalar(512);  // was 2048 — 16× fewer shadow pixels
  keyLight.shadow.camera.near = 1;
  keyLight.shadow.camera.far  = 24;        // tighter frustum = sharper + faster
  keyLight.shadow.camera.left = -8;
  keyLight.shadow.camera.right = 8;
  keyLight.shadow.camera.top = 6;
  keyLight.shadow.camera.bottom = -3;
}
sceneImpact.add(keyLight);
// Fill/rim replaced with boosted ambient — cheaper on PBR, same visual feel
sceneImpact.add(new THREE.AmbientLight(0x2244aa, 0.9));

// Track floor — grey tarmac with pit lane line
const trackGeo = new THREE.PlaneGeometry(28, 10);
const trackMat = new THREE.MeshLambertMaterial({ color: 0x1a1a1e }); // no PBR needed for tarmac
const trackMesh = new THREE.Mesh(trackGeo, trackMat);
trackMesh.rotation.x = -Math.PI / 2;
trackMesh.position.y = -1;
trackMesh.receiveShadow = true;
sceneImpact.add(trackMesh);

// White pit lane edge line
const lineGeo = new THREE.PlaneGeometry(28, 0.12);
const lineMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
const pitLine = new THREE.Mesh(lineGeo, lineMat);
pitLine.rotation.x = -Math.PI / 2;
pitLine.position.set(0, -0.995, 2.5);
sceneImpact.add(pitLine);

// Second pit edge line
const pitLine2 = pitLine.clone();
pitLine2.position.set(0, -0.995, -2.5);
sceneImpact.add(pitLine2);

// Skid mark (grows during rolling phase)
const skidGeo = new THREE.PlaneGeometry(1, 0.18);
const skidMat = new THREE.MeshLambertMaterial({ color: 0x050505, transparent: true, opacity: 0 });
const skidL = new THREE.Mesh(skidGeo, skidMat);
skidL.rotation.x = -Math.PI / 2;
skidL.position.set(2, -0.994, 0.6);
sceneImpact.add(skidL);
const skidR = skidL.clone();
skidR.position.z = -0.6;
sceneImpact.add(skidR);

// Tyre wall — 3 wide × 3 tall stack
const tyreGeo = new THREE.CylinderGeometry(0.52, 0.52, 0.55, 12); // 12 segs instead of 20
// MeshLambertMaterial: no PBR — much cheaper, tyres are matte black anyway
const tyreMat = new THREE.MeshLambertMaterial({ color: 0x0d0d0d });
const tyreWallGroup = new THREE.Group();
const tyrePhysics = []; // { mesh, vel, angVel, flying }
const TYRE_COLS = 4, TYRE_ROWS = 3;
for (let col = 0; col < TYRE_COLS; col++) {
  for (let row = 0; row < TYRE_ROWS; row++) {
    const tyre = new THREE.Mesh(tyreGeo, tyreMat); // shared material — 1 draw call
    tyre.rotation.z = Math.PI / 2;
    tyre.position.set(
      0,
      row * 1.05 - 0.47,
      (col - (TYRE_COLS - 1) / 2) * 1.1
    );
    tyre.rotation.y = (Math.random() - 0.5) * 0.15;
    tyre.castShadow = true;
    tyre.receiveShadow = true;
    tyreWallGroup.add(tyre);
    tyrePhysics.push({ mesh: tyre, vel: new THREE.Vector3(), angVel: new THREE.Vector3(), flying: false, origPos: tyre.position.clone() });
  }
}
tyreWallGroup.position.set(-4.2, -1 + 0.52, 0); // lift so bottom tyre sits on floor (y=-1)
sceneImpact.add(tyreWallGroup);

// Barrier backing wall (concrete look)
const barrierGeo = new THREE.BoxGeometry(0.4, 3.5, 5.5);
const barrierMat = new THREE.MeshLambertMaterial({ color: 0x2a2a2e });
const barrierMesh = new THREE.Mesh(barrierGeo, barrierMat);
barrierMesh.position.set(-4.8, -1 + 1.75, 0); // 3.5 tall, half = 1.75 above floor
barrierMesh.castShadow = true;
barrierMesh.receiveShadow = true;
sceneImpact.add(barrierMesh);

// Impact debris — carbon fibre shards
const debrisGeo = new THREE.BufferGeometry();
const DEBRIS_COUNT = isMobile ? 15 : isLowEnd ? 25 : 40; // halved
const dPos = new Float32Array(DEBRIS_COUNT * 3);
const dVel = new Float32Array(DEBRIS_COUNT * 3);
for (let i = 0; i < DEBRIS_COUNT; i++) {
  dPos[i*3] = -50; dPos[i*3+1] = 0; dPos[i*3+2] = 0;
  // Fast forward/sideways scatter — carbon fibre style
  dVel[i*3]   = -(Math.random() * 0.15 + 0.05);
  dVel[i*3+1] = Math.random() * 0.18;
  dVel[i*3+2] = (Math.random() - 0.5) * 0.25;
}
debrisGeo.setAttribute('position', new THREE.BufferAttribute(dPos, 3));
const debrisMat = new THREE.PointsMaterial({ size: isLowEnd ? 0.05 : 0.04, color: 0x222222, transparent: true, opacity: 0, vertexColors: false });
const debrisParticles = new THREE.Points(debrisGeo, debrisMat);
sceneImpact.add(debrisParticles);

// Bright flash debris (highlights on shards)
const flashGeo = new THREE.BufferGeometry();
const FLASH_COUNT = isMobile ? 8 : isLowEnd ? 12 : 20;
const fPos = new Float32Array(FLASH_COUNT * 3);
const fVel = new Float32Array(FLASH_COUNT * 3);
for (let i = 0; i < FLASH_COUNT; i++) {
  fPos[i*3] = -50;
  fVel[i*3]   = -(Math.random() * 0.2 + 0.08);
  fVel[i*3+1] = Math.random() * 0.22 + 0.05;
  fVel[i*3+2] = (Math.random() - 0.5) * 0.3;
}
flashGeo.setAttribute('position', new THREE.BufferAttribute(fPos, 3));
const flashMat = new THREE.PointsMaterial({ size: 0.07, color: 0xff8800, transparent: true, opacity: 0 });
const flashParticles = new THREE.Points(flashGeo, flashMat);
sceneImpact.add(flashParticles);

// Fire particles (post-crash high-energy)
const FIRE_COUNT = isMobile ? 10 : isLowEnd ? 20 : 35;
const fireGeo = new THREE.BufferGeometry();
const firePosArr = new Float32Array(FIRE_COUNT * 3);
const fireVelArr = new Float32Array(FIRE_COUNT * 3);
const fireLife   = new Float32Array(FIRE_COUNT);
for (let i = 0; i < FIRE_COUNT; i++) {
  firePosArr[i*3] = -50; // hide offscreen
  fireLife[i] = Math.random();
}
fireGeo.setAttribute('position', new THREE.BufferAttribute(firePosArr, 3));
const fireMat = new THREE.PointsMaterial({ size: 0.18, color: 0xff4400, transparent: true, opacity: 0 });
const fireParticles = new THREE.Points(fireGeo, fireMat);
sceneImpact.add(fireParticles);

// Nose cone — separate detachable piece
let noseCone = null;
let noseVel = new THREE.Vector3();
let noseAngVel = new THREE.Vector3();
let noseFlying = false;

// F1 car
let carWrapper = new THREE.Group();
sceneImpact.add(carWrapper);
let carChassis = null;

loader.load('f1_car.glb', (gltf) => {
    carChassis = gltf.scene;

    // Normalize size — target length ~4 units
    const box = new THREE.Box3().setFromObject(carChassis);
    const size = box.getSize(new THREE.Vector3());
    const longestAxis = Math.max(size.x, size.y, size.z);
    const sf = 4 / longestAxis;
    carChassis.scale.setScalar(sf);

    // Re-measure after scale to seat on floor
    carChassis.updateMatrixWorld(true);
    const box2 = new THREE.Box3().setFromObject(carChassis);
    const center = box2.getCenter(new THREE.Vector3());
    const minY   = box2.min.y;

    // Center X/Z, lift so bottom sits exactly on y=0 of wrapper (wrapper is at y=-1 = floor)
    carChassis.position.x -= center.x;
    carChassis.position.z -= center.z;
    carChassis.position.y -= minY; // floor the car

    // Face the wall (-X direction)
    carChassis.rotation.y = Math.PI / 2;

    carChassis.traverse(child => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    carWrapper.add(carChassis);

    // Build a proxy nose cone at the front of the car (world-space front = -X of wrapper)
    const noseGeo = new THREE.ConeGeometry(0.18, 1.0, 8);
    const noseMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.4, metalness: 0.6 });
    noseCone = new THREE.Mesh(noseGeo, noseMat);
    noseCone.rotation.z = -Math.PI / 2;
    noseCone.position.set(-2.5, 0.3, 0);
    noseCone.visible = false;
    sceneImpact.add(noseCone);
},
undefined,
() => {
    carChassis = buildProceduralCar();
    carWrapper.add(carChassis);
});

carWrapper.position.set(4, -1, 0);

// Procedural fallback (improved F1 silhouette)
function buildProceduralCar() {
  const g = new THREE.Group();
  const cf = new THREE.MeshStandardMaterial({ color: 0x0a0a12, metalness: 0.7, roughness: 0.3 });
  // Main chassis
  const body = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.55, 1.1), cf);
  body.position.y = 0.2;
  g.add(body);
  // Nose
  const nose = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.28, 0.55), cf);
  nose.position.set(-2.0, 0.12, 0);
  g.add(nose);
  // Cockpit hump
  const cockpit = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.45, 0.85), cf);
  cockpit.position.set(0.3, 0.6, 0);
  g.add(cockpit);
  // Halo
  const haloArc = new THREE.TorusGeometry(0.35, 0.04, 8, 16, Math.PI);
  const haloMesh = new THREE.Mesh(haloArc, new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.9 }));
  haloMesh.position.set(0.3, 0.95, 0);
  haloMesh.rotation.y = Math.PI / 2;
  g.add(haloMesh);
  // Rear wing
  const rwing = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.55, 1.8), cf);
  rwing.position.set(1.7, 0.8, 0);
  g.add(rwing);
  const rwingPlane = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.05, 1.8), cf);
  rwingPlane.position.set(1.7, 1.05, 0);
  g.add(rwingPlane);
  // Exposed wheels (F1 style — big cylinders)
  const wGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.42, 24);
  const wMat = new THREE.MeshStandardMaterial({ color: 0x080808, roughness: 0.95 });
  [[-1.5, 0, 0.8], [-1.5, 0, -0.8], [1.3, 0, 0.82], [1.3, 0, -0.82]].forEach(([x,y,z]) => {
    const w = new THREE.Mesh(wGeo, wMat);
    w.position.set(x, y, z);
    w.rotation.z = Math.PI / 2;
    g.add(w);
  });
  return g;
}



// ============================================================
// 5. GRAPH ENGINES (2D canvas)
// ============================================================
function setupGraph(canvasId) {
  const cvs = document.getElementById(canvasId);
  if (!cvs) return null;
  const parent = cvs.parentElement;
  // Use getBoundingClientRect for accurate pixel size
  const rect = parent.getBoundingClientRect();
  const w = Math.max(rect.width  || parent.clientWidth  || 300, 100);
  const h = Math.max(rect.height || parent.clientHeight || 170, 80);
  cvs.width  = w;
  cvs.height = h;
  return cvs.getContext('2d');
}

let ctxAero   = null;
let ctxImpact = null;
const aeroHistory   = [];   // { t, v } pairs
const impactHistory = [];   // { d, f } pairs
const MAX_HISTORY   = 200;

function drawGraph(ctx, data, xKey, yKey, color, xLabel, yLabel, xRange, yRange, opts) {
  if (!ctx) return;
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  ctx.clearRect(0, 0, w, h);

  // Background — deep gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
  bgGrad.addColorStop(0, '#020412');
  bgGrad.addColorStop(1, '#000208');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  const PAD_L = 38, PAD_B = 22, PAD_T = 14, PAD_R = 12;
  const gw = w - PAD_L - PAD_R;
  const gh = h - PAD_T - PAD_B;

  const xMin = xRange ? xRange[0] : (data.length ? parseFloat(data[0][xKey]) : 0);
  const xMax = xRange ? xRange[1] : (data.length ? Math.max(...data.map(d => parseFloat(d[xKey]))) : 1);
  const yMin = yRange ? yRange[0] : 0;
  const yMax = yRange ? yRange[1] : (data.length ? Math.max(...data.map(d => parseFloat(d[yKey]))) * 1.15 || 1 : 1);

  const toX = v => PAD_L + ((v - xMin) / (xMax - xMin || 1)) * gw;
  const toY = v => PAD_T + gh - ((v - yMin) / (yMax - yMin || 1)) * gh;

  // Minor grid lines
  ctx.strokeStyle = 'rgba(80,120,255,0.04)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 8; i++) {
    const x = PAD_L + (i / 8) * gw;
    ctx.beginPath(); ctx.moveTo(x, PAD_T); ctx.lineTo(x, PAD_T + gh); ctx.stroke();
  }
  for (let i = 0; i <= 6; i++) {
    const y = PAD_T + (i / 6) * gh;
    ctx.beginPath(); ctx.moveTo(PAD_L, y); ctx.lineTo(PAD_L + gw, y); ctx.stroke();
  }

  // Major grid lines + Y axis tick labels
  ctx.strokeStyle = 'rgba(80,120,255,0.11)';
  ctx.fillStyle = 'rgba(100,130,200,0.55)';
  ctx.font = '9px "Courier New", monospace';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  const yTicks = 4;
  for (let i = 0; i <= yTicks; i++) {
    const val = yMin + (yMax - yMin) * (i / yTicks);
    const y = PAD_T + gh - (i / yTicks) * gh;
    ctx.beginPath(); ctx.moveTo(PAD_L, y); ctx.lineTo(PAD_L + gw, y); ctx.stroke();
    ctx.fillText(val >= 100 ? Math.round(val) : val.toFixed(val < 10 ? 1 : 0), PAD_L - 4, y);
  }

  // X axis tick labels
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  const xTicks = 4;
  for (let i = 0; i <= xTicks; i++) {
    const val = xMin + (xMax - xMin) * (i / xTicks);
    const x = PAD_L + (i / xTicks) * gw;
    ctx.fillText(val >= 100 ? Math.round(val) : val.toFixed(1), x, PAD_T + gh + 5);
  }

  // Axis border
  ctx.strokeStyle = 'rgba(80,120,255,0.25)';
  ctx.lineWidth = 1;
  ctx.strokeRect(PAD_L, PAD_T, gw, gh);

  // ---- Aero safe-zone band ----
  if (opts && opts.safeZone) {
    const { lo, hi, label } = opts.safeZone;
    const yLo = Math.min(toY(lo), PAD_T + gh);
    const yHi = Math.max(toY(hi), PAD_T);
    ctx.fillStyle = 'rgba(57,224,122,0.07)';
    ctx.fillRect(PAD_L, yHi, gw, yLo - yHi);
    ctx.strokeStyle = 'rgba(57,224,122,0.45)';
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(PAD_L, toY(hi)); ctx.lineTo(PAD_L + gw, toY(hi)); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(57,224,122,0.7)';
    ctx.font = '8px "Courier New", monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillText(label, PAD_L + 4, toY(hi) - 2);
  }

  // ---- Impact yield marker ----
  if (opts && opts.yieldX !== undefined && data.length) {
    const xPx = toX(opts.yieldX);
    if (xPx > PAD_L && xPx < PAD_L + gw) {
      // Shaded danger region
      ctx.fillStyle = 'rgba(255,122,40,0.06)';
      ctx.fillRect(xPx, PAD_T, PAD_L + gw - xPx, gh);
      // Dashed vertical
      ctx.strokeStyle = 'rgba(255,122,40,0.6)';
      ctx.setLineDash([3, 4]);
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(xPx, PAD_T); ctx.lineTo(xPx, PAD_T + gh); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(255,122,40,0.8)';
      ctx.font = '8px "Courier New", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('YIELD', xPx + 3, PAD_T + 3);
    }
  }

  if (data.length < 2) return;

  // Parse data to numbers
  const pts = data.map(d => ({ x: parseFloat(d[xKey]), y: parseFloat(d[yKey]) }));

  // Outer glow pass (wide, soft)
  ctx.save();
  ctx.shadowBlur  = 20;
  ctx.shadowColor = color;
  ctx.strokeStyle = color;
  ctx.globalAlpha = 0.18;
  ctx.lineWidth   = 8;
  ctx.lineJoin    = 'round';
  ctx.beginPath();
  pts.forEach((p, i) => i === 0 ? ctx.moveTo(toX(p.x), toY(p.y)) : ctx.lineTo(toX(p.x), toY(p.y)));
  ctx.stroke();
  ctx.restore();

  // Fill under curve
  ctx.save();
  const grad = ctx.createLinearGradient(0, PAD_T, 0, PAD_T + gh);
  // parse color hex/rgb to rgba
  const fillColor = color.startsWith('#')
    ? `rgba(${parseInt(color.slice(1,3),16)},${parseInt(color.slice(3,5),16)},${parseInt(color.slice(5,7),16)},`
    : color.replace('rgb(','rgba(').replace(')',',');
  grad.addColorStop(0, fillColor + '0.28)');
  grad.addColorStop(0.6, fillColor + '0.08)');
  grad.addColorStop(1, fillColor + '0.0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  pts.forEach((p, i) => i === 0 ? ctx.moveTo(toX(p.x), toY(p.y)) : ctx.lineTo(toX(p.x), toY(p.y)));
  ctx.lineTo(toX(pts[pts.length-1].x), PAD_T + gh);
  ctx.lineTo(toX(pts[0].x), PAD_T + gh);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Inner crisp line
  ctx.save();
  ctx.shadowBlur  = 10;
  ctx.shadowColor = color;
  ctx.strokeStyle = color;
  ctx.lineWidth   = 2;
  ctx.lineJoin    = 'round';
  ctx.beginPath();
  pts.forEach((p, i) => i === 0 ? ctx.moveTo(toX(p.x), toY(p.y)) : ctx.lineTo(toX(p.x), toY(p.y)));
  ctx.stroke();
  ctx.restore();

  // Crosshair at latest point
  const last = pts[pts.length - 1];
  const lx = toX(last.x);
  const ly = toY(last.y);

  // Vertical hairline
  ctx.save();
  ctx.strokeStyle = color;
  ctx.globalAlpha = 0.3;
  ctx.lineWidth = 1;
  ctx.setLineDash([2, 3]);
  ctx.beginPath(); ctx.moveTo(lx, PAD_T); ctx.lineTo(lx, PAD_T + gh); ctx.stroke();
  // Horizontal hairline
  ctx.beginPath(); ctx.moveTo(PAD_L, ly); ctx.lineTo(PAD_L + gw, ly); ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  // Dot at latest point
  ctx.save();
  ctx.shadowBlur  = 12;
  ctx.shadowColor = color;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(lx, ly, 4, 0, Math.PI * 2);
  ctx.fill();
  // Inner bright core
  ctx.fillStyle = '#ffffff';
  ctx.shadowBlur = 0;
  ctx.beginPath();
  ctx.arc(lx, ly, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// ============================================================
// 6. UI ELEMENT REFERENCES
// ============================================================
const ui = {
  sliderArea:    document.getElementById('slider-aero-area'),
  valArea:       document.getElementById('val-aero-area'),
  sliderVel:     document.getElementById('slider-impact-vel'),
  valVel:        document.getElementById('val-impact-vel'),
  sliderStiff:   document.getElementById('slider-impact-stiff'),

  // Aero readouts
  readoutVel:    document.getElementById('readout-vel'),
  readoutAccel:  document.getElementById('readout-accel'),
  readoutDrag:   document.getElementById('readout-drag'),
  readoutAlt:    document.getElementById('readout-alt'),

  // Engineer equations aero
  eqFg:    document.getElementById('eq-fg'),
  eqFd:    document.getElementById('eq-fd'),
  eqFnet:  document.getElementById('eq-fnet'),
  eqAccel: document.getElementById('eq-accel'),

  // Impact readouts
  readoutImpactForce:  document.getElementById('readout-impact-force'),
  readoutImpactG:      document.getElementById('readout-impact-g'),
  readoutImpactEnergy: document.getElementById('readout-impact-energy'),
  readoutImpactStop:   document.getElementById('readout-impact-stop'),

  // Engineer equations impact
  eqKe:     document.getElementById('eq-ke'),
  eqWork:   document.getElementById('eq-work'),
  eqPeakF:  document.getElementById('eq-peak-f'),
  eqImpulse: document.getElementById('eq-impulse'),

  // Graph live labels
  graphAeroLive:   document.getElementById('graph-aero-live'),
  graphImpactLive: document.getElementById('graph-impact-live'),

  // Phase steps
  phaseReentry: document.getElementById('phase-reentry'),
  phaseDrogue:  document.getElementById('phase-drogue'),
  phaseMain:    document.getElementById('phase-main'),
  phaseSplash:  document.getElementById('phase-splash'),

  // Status
  aeroStatusDot:   document.getElementById('aero-status-dot'),
  aeroStatusText:  document.getElementById('aero-status-text'),
  impactStatusDot: document.getElementById('impact-status-dot'),
  impactStatusText:document.getElementById('impact-status-text'),

  // Failure overlays
  aeroFailure:   document.getElementById('aero-failure'),
  impactFailure: document.getElementById('impact-failure'),
  aeroSuccess:   document.getElementById('aero-success'),

  // G-force
  gVal: document.getElementById('g-val'),
};

// ============================================================
// 7. UI EVENT LISTENERS
// ============================================================
if (ui.sliderArea) {
  ui.sliderArea.addEventListener('input', (e) => {
    const raw    = parseInt(e.target.value);
    const mapped = (raw / 100) * 600; // 0–600 m²
    simState.aero.area = mapped;
    if (ui.valArea) ui.valArea.textContent = `${mapped.toFixed(1)} m²`;

    // Scale parachute
    if (parachuteGroup) {
      const scale = Math.max(0.01, raw / 100);
      parachuteGroup.scale.setScalar(scale);
    }
    // Drogue appears from 5%
    if (drogue) {
      const drScale = Math.min(1, Math.max(0.01, raw / 15));
      drogue.scale.setScalar(raw > 5 ? drScale : 0.01);
    }
  });
}

if (ui.sliderVel) {
  ui.sliderVel.addEventListener('input', (e) => {
    simState.impact.approachVel = parseFloat(e.target.value);
    if (ui.valVel) ui.valVel.textContent = `${simState.impact.approachVel.toFixed(1)} m/s`;
    // Reset crash state when vel changes
    resetImpactState();
  });
}

if (ui.sliderStiff) {
  ui.sliderStiff.addEventListener('input', () => {
    simState.impact.stiffness = parseInt(ui.sliderStiff.value);
    resetImpactState();
  });
}

function resetImpactState() {
  const s = simState.impact;
  s.isCrashing   = false;
  s.phase        = 'standby';
  s.x_crush      = 0;
  s.v            = s.approachVel;
  s.F            = 0;
  s.car_x        = 4;

  impactHistory.length = 0;
  
  if (carWrapper) {
      carWrapper.position.set(4, -1, 0);
      carWrapper.scale.set(1, 1, 1);
      carWrapper.rotation.set(0, 0, 0);
  }
  if (debrisMat) debrisMat.opacity = 0;
  
  // Reset F1 effects (tyres, nose, fire, skids)
  if (typeof resetF1Effects === 'function') resetF1Effects();

  if (ui.impactStatusDot)  ui.impactStatusDot.className  = 'status-dot status-warn';
  if (ui.impactStatusText) ui.impactStatusText.textContent = 'STANDBY';
}



// Planet change
document.addEventListener('planetChange', (e) => {
  const p = e.detail.planet;
  simState.aero.planet = p;
  if (p === 'mars') {
    simState.aero.rho     = 0.020;
    simState.aero.gravity = 3.72;
  } else {
    simState.aero.rho     = 1.225;
    simState.aero.gravity = 9.81;
  }
  simState.aero.velocity  = 0;
  simState.aero.altitude  = 5000;
  simState.aero.running   = false;
  simState.aero.failed    = false;
  simState.aero.succeeded = false;
  aeroHistory.length = 0;
  if (ui.aeroFailure) ui.aeroFailure.classList.remove('visible');
  if (ui.aeroSuccess) ui.aeroSuccess.classList.remove('visible');
});

// Reset aero
document.addEventListener('resetAero', () => {
  simState.aero.velocity  = 0;
  simState.aero.altitude  = 5000;
  simState.aero.running   = false;
  simState.aero.failed    = false;
  simState.aero.succeeded = false;
  simState.aero.time      = 0;
  aeroHistory.length = 0;
  window._telemetryLog.aero = [];
  if (parachuteGroup) parachuteGroup.scale.setScalar(0.01);
  if (drogue) drogue.scale.setScalar(0.01);
  if (ui.aeroFailure) ui.aeroFailure.classList.remove('visible');
  if (ui.aeroSuccess) ui.aeroSuccess.classList.remove('visible');
  updatePhase('drogue');
});

document.addEventListener('resetImpact', () => {
  resetImpactState();
  if (ui.impactFailure) ui.impactFailure.classList.remove('visible');
  window._telemetryLog.impact = [];
});

// ============================================================
// 8. PHYSICS UPDATE — AERODYNAMICS
// ============================================================
const SAFE_LANDING_SPEED = 10;   // m/s
const CRITICAL_SPEED     = 25;   // m/s — certain failure

function updateAeroPhysics(dt) {
  const s = simState.aero;
  if (!s.running || s.failed || s.succeeded) return;

  const Fg          = s.mass * s.gravity;
  const totalArea   = s.baseArea + s.area;
  const Fd          = 0.5 * s.rho * s.velocity * s.velocity * s.Cd * totalArea;
  const Fnet        = Fg - Fd;
  const acceleration = Fnet / s.mass;

  s.velocity   += acceleration * dt;
  s.velocity    = Math.max(0, s.velocity);
  s.altitude   -= s.velocity * dt;
  s.time       += dt;

  // Telemetry logging (every ~10 frames)
  if (Math.round(s.time * 60) % 10 === 0) {
    const row = {
      time_s:       s.time.toFixed(2),
      altitude_m:   s.altitude.toFixed(1),
      velocity_ms:  s.velocity.toFixed(2),
      accel_ms2:    acceleration.toFixed(3),
      drag_kN:      (Fd/1000).toFixed(2),
      area_m2:      totalArea.toFixed(1),
      planet:       s.planet
    };
    window._telemetryLog.aero.push(row);
  }

  // Graph history
  aeroHistory.push({ t: s.time, v: s.velocity });
  if (aeroHistory.length > MAX_HISTORY) aeroHistory.shift();

  // Phase updates
  const areaRatio = s.area / 120;
  if (areaRatio > 0.75) updatePhase('main');
  else if (areaRatio > 0.1) updatePhase('drogue');

  // Status indicator
  if (s.velocity > 20) {
    setAeroStatus('crit', `DANGER — ${s.velocity.toFixed(1)} m/s`);
  } else if (s.velocity > 12) {
    setAeroStatus('warn', `CAUTION — ${s.velocity.toFixed(1)} m/s`);
  } else {
    setAeroStatus('ok', `NOMINAL — ${s.velocity.toFixed(1)} m/s`);
  }

  // Splashdown check
  if (s.altitude <= 0) {
    s.altitude = 0;
    s.running  = false;
    if (s.velocity > SAFE_LANDING_SPEED) {
      // Failed
      s.failed = true;
      if (ui.aeroFailure) ui.aeroFailure.classList.add('visible');
      updatePhase('drogue');
    } else {
      // Success!
      s.succeeded = true;
      updatePhase('splash');
      flashSuccess();
    }
    window._telemetryLog.aero.push({ time_s: s.time.toFixed(2), event: 'SPLASHDOWN', velocity_ms: s.velocity.toFixed(2), outcome: s.velocity <= SAFE_LANDING_SPEED ? 'SAFE' : 'FATAL' });
  }

  // Update DOM readouts
  updateAeroReadouts(s, Fg, Fd, Fnet, acceleration);

  // G-force figure
  const gLoad = Math.abs(acceleration / s.gravity);
  updateGFigure(gLoad);

  // Update graph live label
  if (ui.graphAeroLive) ui.graphAeroLive.textContent = `${s.velocity.toFixed(1)} m/s`;

  return { Fg, Fd, Fnet, acceleration };
}

function updateAeroReadouts(s, Fg, Fd, Fnet, accel) {
  const setCell = (el, val, unit, cls) => {
    if (!el) return;
    el.className = `readout-cell ${cls || ''}`;
    el.querySelector('.readout-cell__value').innerHTML =
      `${val}<span class="readout-cell__unit">${unit}</span>`;
  };

  const vCls = s.velocity > 20 ? 'is-alert' : s.velocity > 12 ? 'is-warn' : 'is-ok';
  setCell(ui.readoutVel,   s.velocity.toFixed(1), 'm/s', vCls);
  setCell(ui.readoutAccel, accel.toFixed(2), 'm/s²', accel > 0 ? 'is-warn' : 'is-ok');
  setCell(ui.readoutDrag,  (Fd/1000).toFixed(1), 'kN', 'is-ok');
  setCell(ui.readoutAlt,   Math.max(0, s.altitude).toFixed(0), 'm', '');

  // Engineer panel
  if (ui.eqFg) ui.eqFg.textContent = `${(Fg/1000).toFixed(1)} kN`;
  if (ui.eqFd) ui.eqFd.textContent = `${(Fd/1000).toFixed(1)} kN`;
  if (ui.eqFnet) {
    ui.eqFnet.textContent = `${(Fnet/1000).toFixed(1)} kN`;
    ui.eqFnet.style.color = Fnet > 0 ? 'var(--orange)' : 'var(--green)';
  }
  if (ui.eqAccel) ui.eqAccel.textContent = `${accel.toFixed(3)} m/s²`;
}

function updateImpactReadouts() {
  const s   = simState.impact;
  const m   = s.carMass;
  // During crash use live velocity; otherwise use approach velocity for preview
  const v   = (s.phase === 'crashing' || s.phase === 'done') ? Math.max(0, s.v) : s.approachVel;
  const k   = s.stiffness * 50000;
  const KE  = 0.5 * m * v * v;
  const dCrush = k > 0 ? Math.sqrt(Math.max(0, 2 * KE / k)) : 0;
  const Fpeak  = (s.phase === 'crashing' || s.phase === 'done') ? Math.abs(s.F) : k * dCrush;
  const gPeak  = Fpeak / (m * 9.81);
  const impulse = m * s.approachVel;

  const safe = (n, digits) => isFinite(n) ? n.toFixed(digits) : '—';

  const setCell = (el, val, unit, cls) => {
    if (!el) return;
    el.className = `readout-cell ${cls || ''}`;
    el.querySelector('.readout-cell__value').innerHTML =
      `${val}<span class="readout-cell__unit">${unit}</span>`;
  };

  const gCls = gPeak > 40 ? 'is-alert' : gPeak > 20 ? 'is-warn' : 'is-ok';
  setCell(ui.readoutImpactForce,  safe(Fpeak/1000, 1), 'kN', gCls);
  setCell(ui.readoutImpactG,      safe(gPeak, 1), 'G', gCls);
  setCell(ui.readoutImpactEnergy, safe(KE/1000, 1), 'kJ', '');
  setCell(ui.readoutImpactStop,   safe(dCrush*100, 1), 'cm', '');

  if (ui.eqKe)     ui.eqKe.textContent     = `${safe(KE/1000, 2)} kJ`;
  if (ui.eqWork)   ui.eqWork.textContent   = `${safe(KE/1000, 2)} kJ`;
  if (ui.eqPeakF)  ui.eqPeakF.textContent  = `${safe(Fpeak/1000, 1)} kN`;
  if (ui.eqImpulse) ui.eqImpulse.textContent = `${safe(impulse, 0)} N·s`;

  if (ui.graphImpactLive) ui.graphImpactLive.textContent = isFinite(gPeak) ? `${safe(gPeak, 1)} G` : '—';

  if (isFinite(gPeak)) {
    if (gPeak > 40) setImpactStatus('crit', 'FATAL IMPACT');
    else if (gPeak > 20) setImpactStatus('warn', 'HIGH FORCE');
    else setImpactStatus('ok', 'SURVIVABLE');
  }

  return { KE, dCrush, Fpeak, gPeak };
}

// ============================================================
// 9. VISUAL HELPERS
// ============================================================
const colorCold = new THREE.Color(0x88ccff);
const colorHeat = new THREE.Color(0xff4400);

function updateWindParticles(velocity) {
  const pos  = windParticles.geometry.attributes.position.array;
  const cols = windParticles.geometry.attributes.color.array;
  const heat = Math.min(1, velocity / 200);
  const ambientColor = colorCold.clone().lerp(colorHeat, heat * 0.35);

  for (let i = 0; i < WIND_COUNT; i++) {
    pos[i*3+1] += velocity * windSpeeds[i] * 0.004;
    if (pos[i*3+1] > 20) pos[i*3+1] -= 40;

    const dist      = Math.abs(pos[i*3+1]);
    const proximity = Math.max(0, 1 - dist / 4);
    const fc        = ambientColor.clone().lerp(colorHeat, proximity * heat);

    cols[i*3]   = fc.r;
    cols[i*3+1] = fc.g;
    cols[i*3+2] = fc.b;
  }
  // Upload to GPU every 2nd frame — halves bandwidth for wind particles
  if (_frameCount % 2 === 0) {
    windParticles.geometry.attributes.position.needsUpdate = true;
    windParticles.geometry.attributes.color.needsUpdate    = true;
  }
}

function updateHeatSparks(velocity) {
  if (!heatSparks) return;
  const heat = Math.min(1, velocity / 150);
  heatSparks.material.opacity = heat * 0.8;
  const sPos = heatSparks.geometry.attributes.position.array;
  for (let i = 0; i < SPARK_COUNT; i++) {
    sPos[i*3]   += (Math.random() - 0.5) * 0.08 * heat;
    sPos[i*3+1] -= 0.05 * heat;
    sPos[i*3+2] += (Math.random() - 0.5) * 0.08 * heat;
    if (sPos[i*3+1] < -3) {
      const theta = Math.random() * Math.PI * 2;
      const r     = 1.2 + Math.random() * 1.5;
      sPos[i*3]   = Math.cos(theta) * r;
      sPos[i*3+1] = 1;
      sPos[i*3+2] = Math.sin(theta) * r;
    }
  }
  heatSparks.geometry.attributes.position.needsUpdate = true;
}

function updateArrows(Fg, Fd) {
  arrowGravity.setLength(Math.max(0.5, Fg / 12000), 0.4, 0.3);
  arrowDrag.setLength(Math.max(0.1, Fd / 12000), 0.4, 0.3);
}

function updateGFigure(gLoad) {
  if (!ui.gVal) return;
  const capped = Math.min(gLoad, 12);
  ui.gVal.textContent = `${capped.toFixed(1)} G`;
  const color = capped > 8 ? 'var(--red)' : capped > 4 ? 'var(--orange)' : 'var(--blue)';
  ui.gVal.style.color = color;
  // Tilt the body SVG slightly at high G
  const bodyLine = document.getElementById('g-body-line');
  if (bodyLine) {
    const tilt = Math.min(capped * 1.5, 15);
    document.querySelector('.g-body-svg')?.setAttribute('style', `width:60px;height:auto;transform:rotate(${tilt}deg);`);
  }
}

function setAeroStatus(level, text) {
  if (!ui.aeroStatusDot || !ui.aeroStatusText) return;
  const cls = level === 'crit' ? 'status-crit' : level === 'warn' ? 'status-warn' : '';
  ui.aeroStatusDot.className  = `status-dot ${cls}`;
  ui.aeroStatusText.textContent = text;
}

function setImpactStatus(level, text) {
  if (!ui.impactStatusDot || !ui.impactStatusText) return;
  const cls = level === 'crit' ? 'status-crit' : level === 'warn' ? 'status-warn' : '';
  ui.impactStatusDot.className  = `status-dot ${cls}`;
  ui.impactStatusText.textContent = text;
}

function updatePhase(current) {
  const phases = ['reentry', 'drogue', 'main', 'splash'];
  const ci     = phases.indexOf(current);
  phases.forEach((p, i) => {
    const el = document.getElementById(`phase-${p}`);
    if (!el) return;
    el.className = `phase-step ${i < ci ? 'done' : i === ci ? 'active' : ''}`;
  });
}

function flashSuccess() {
  if (!ui.aeroSuccess) return;
  ui.aeroSuccess.classList.add('visible');
  setTimeout(() => ui.aeroSuccess?.classList.remove('visible'), 2000);
}

// Track state for new F1 effects
let tyresScattered = false;
let noseEjected    = false;
let fireActive     = false;
let crashIntensity = 0; // 0..1

function resetF1Effects() {
  tyresScattered = false;
  noseEjected    = false;
  fireActive     = false;
  crashIntensity = 0;

  // Reset tyres to home positions
  tyrePhysics.forEach(tp => {
    tp.flying = false;
    tp.vel.set(0, 0, 0);
    tp.angVel.set(0, 0, 0);
    tp.mesh.position.copy(tp.origPos);
    tp.mesh.rotation.set(0, (Math.random() - 0.5) * 0.15, Math.PI / 2);
  });

  // Reset nose cone
  if (noseCone) {
    noseCone.visible = false;
    noseFlying = false;
    noseVel.set(0, 0, 0);
    noseAngVel.set(0, 0, 0);
  }

  // Hide fire
  fireMat.opacity = 0;
  flashMat.opacity = 0;

  // Reset skids
  skidMat.opacity = 0;
  skidL.scale.x = 0.01;
  skidR.scale.x = 0.01;
  skidL.position.x = 2;
  skidR.position.x = 2;

  // Reset debris
  debrisMat.opacity = 0;
  const dp = debrisParticles.geometry.attributes.position.array;
  for (let i = 0; i < DEBRIS_COUNT; i++) { dp[i*3] = -50; }
  debrisParticles.geometry.attributes.position.needsUpdate = true;

  const fp = flashParticles.geometry.attributes.position.array;
  for (let i = 0; i < FLASH_COUNT; i++) { fp[i*3] = -50; }
  flashParticles.geometry.attributes.position.needsUpdate = true;
}

function updateImpactCrash(dt) {
  const s = simState.impact;
  
  // 1. INITIALIZE
  if (s.phase === 'idle') {
    s.phase = 'rolling';
    s.v = s.approachVel;
    s.car_x = 4;
    s.x_crush = 0;
    
    s.k_elastic = s.stiffness * 500000;
    s.k_plastic = s.k_elastic * 0.15;
    s.yield_x = 0.1;
    
    impactHistory.length = 0;
    resetF1Effects();
  }

  // 2. ROLLING PHASE
  if (s.phase === 'rolling') {
    s.car_x -= s.v * dt;

    // Grow skid marks
    const rolled = 4 - s.car_x;
    skidMat.opacity = Math.min(0.7, rolled * 0.18);
    const skidLen = Math.max(0.01, rolled);
    skidL.scale.x = skidLen;
    skidR.scale.x = skidLen;
    skidL.position.x = 4 - rolled / 2;
    skidR.position.x = 4 - rolled / 2;

    // Wall front is at x = -3.7 (tyre wall group x - radius)
    if (s.car_x <= -0.8) {
      s.car_x = -0.8;
      s.phase = 'crashing';
      s.isCrashing = true;
      crashIntensity = Math.min(1, s.approachVel / 40);
    }

    if (carWrapper) carWrapper.position.x = s.car_x;
  }

  // 3. CRASHING PHASE — RK4
  if (s.phase === 'crashing') {
    const getForce = (x) => {
      if (x < s.yield_x) return s.k_elastic * x;
      return (s.k_elastic * s.yield_x) + s.k_plastic * (x - s.yield_x);
    };
    const getAccel = (x, v) => -(getForce(x) / s.carMass);

    const k1_x = s.v;
    const k1_v = getAccel(s.x_crush, s.v);
    const k2_x = s.v + 0.5 * dt * k1_v;
    const k2_v = getAccel(s.x_crush + 0.5 * dt * k1_x, s.v + 0.5 * dt * k1_v);
    const k3_x = s.v + 0.5 * dt * k2_v;
    const k3_v = getAccel(s.x_crush + 0.5 * dt * k2_x, s.v + 0.5 * dt * k2_v);
    const k4_x = s.v + dt * k3_v;
    const k4_v = getAccel(s.x_crush + dt * k3_x, s.v + dt * k3_v);

    s.x_crush += (dt / 6) * (k1_x + 2*k2_x + 2*k3_x + k4_x);
    s.v       += (dt / 6) * (k1_v + 2*k2_v + 2*k3_v + k4_v);
    s.F        = getForce(s.x_crush);
    s.a        = getAccel(s.x_crush, s.v);

    if (s.v <= 0) {
      s.v = 0;
      s.phase = 'done';
      s.isCrashing = false;
    }

    // --- CAR VISUAL ---
    if (carWrapper) {
      const L = 4.0;
      const scaleFactor = Math.max(0.1, (L - s.x_crush) / L);
      carWrapper.scale.x = scaleFactor;
      carWrapper.position.x = -0.8 - s.x_crush + (L * scaleFactor) / 2 + s.x_crush;
      // Repin front: front face stays at wall contact ~x=-0.8
      const frontX = -0.8;
      carWrapper.position.x = frontX + (L * scaleFactor) / 2;

      // Violent shake scaled to intensity
      if (s.x_crush > s.yield_x && s.v > 0) {
        const shake = crashIntensity * 0.12;
        carWrapper.position.y = -1 + (Math.random() - 0.5) * shake;
        carWrapper.position.z = (Math.random() - 0.5) * shake * 0.6;
        carWrapper.rotation.z = (Math.random() - 0.5) * shake * 0.15;
      }
    }

    // --- TYRE SCATTER (at yield point, intensity-scaled) ---
    if (!tyresScattered && s.x_crush > s.yield_x) {
      tyresScattered = true;
      tyrePhysics.forEach((tp, i) => {
        const intensity = crashIntensity * (0.5 + Math.random() * 0.5);
        tp.flying = true;
        tp.vel.set(
          -(Math.random() * 4 + 2) * intensity,
          (Math.random() * 3 + 1) * intensity,
          (Math.random() - 0.5) * 5 * intensity
        );
        tp.angVel.set(
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 8
        );
      });
    }

    // --- NOSE CONE EJECTION ---
    if (!noseEjected && s.x_crush > s.yield_x * 0.5 && noseCone && carWrapper) {
      noseEjected = true;
      // World position of nose: front of car
      const noseWorldX = carWrapper.position.x - 2.5 * carWrapper.scale.x;
      noseCone.position.set(noseWorldX, carWrapper.position.y, carWrapper.position.z);
      noseCone.visible = true;
      noseFlying = true;
      const speed = crashIntensity * 6;
      noseVel.set(
        -(Math.random() * 2 + speed * 0.4),
        Math.random() * speed * 0.5 + 1,
        (Math.random() - 0.5) * speed * 0.6
      );
      noseAngVel.set(
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 15
      );
    }

    // --- CARBON FIBRE DEBRIS ---
    if (s.x_crush > s.yield_x) {
      const intensity = Math.min(1, (s.x_crush - s.yield_x) * 6) * crashIntensity;
      debrisMat.opacity  = Math.min(0.85, intensity * 0.9);
      flashMat.opacity   = Math.min(0.7, intensity * 0.6);
      debrisMat.color.setHex(0x1a1a1a);

      const dp = debrisParticles.geometry.attributes.position.array;
      const wallX = -3.8;
      for (let i = 0; i < DEBRIS_COUNT; i++) {
        if (dp[i*3] < -40) {
          dp[i*3]   = wallX;
          dp[i*3+1] = (Math.random()) * 1.5 - 0.5;
          dp[i*3+2] = (Math.random() - 0.5) * 2;
        }
        dp[i*3]   += dVel[i*3]   * crashIntensity * 1.5;
        dp[i*3+1] += dVel[i*3+1] - 0.008;
        dp[i*3+2] += dVel[i*3+2];
        if (dp[i*3+1] < -2 || dp[i*3] < -12) dp[i*3] = -50;
      }
      if (_frameCount % 2 === 0) debrisParticles.geometry.attributes.position.needsUpdate = true;

      const fp = flashParticles.geometry.attributes.position.array;
      for (let i = 0; i < FLASH_COUNT; i++) {
        if (fp[i*3] < -40) {
          fp[i*3]   = wallX;
          fp[i*3+1] = Math.random() * 1.2;
          fp[i*3+2] = (Math.random() - 0.5) * 1.5;
        }
        fp[i*3]   += fVel[i*3]   * crashIntensity * 2;
        fp[i*3+1] += fVel[i*3+1] * 0.8 - 0.012;
        fp[i*3+2] += fVel[i*3+2];
        if (fp[i*3+1] < -2 || fp[i*3] < -14) fp[i*3] = -50;
      }
            if (_frameCount % 2 === 0) flashParticles.geometry.attributes.position.needsUpdate = true;
    }

    // --- FIRE at high crash intensity ---
    if (s.x_crush > s.yield_x && crashIntensity > 0.55 && !fireActive) {
      fireActive = true;
    }

    impactHistory.push({ d: (s.x_crush * 100).toFixed(1), f: (s.F / 1000).toFixed(2) });

    const gPeak = Math.abs(s.a) / 9.81;
    if (gPeak > 40) setImpactStatus('crit', 'FATAL IMPACT');
    else if (gPeak > 20) setImpactStatus('warn', 'HIGH FORCE');
    else setImpactStatus('ok', 'SURVIVABLE');

    // Update readout cells live during crash
    updateImpactReadouts();

    if (s.phase === 'done') {
      window._telemetryLog.impact.push({
        velocity: s.approachVel, stiffness: s.stiffness,
        peak_force_kN: (s.F / 1000).toFixed(2),
        peak_g: gPeak.toFixed(1),
        crush_cm: (s.x_crush * 100).toFixed(1)
      });
      if (gPeak > 40 && ui.impactFailure) {
        setTimeout(() => ui.impactFailure.classList.add('visible'), 600);
      }
    }
  }

  // 4. TYRE PHYSICS (always runs if flying)
  tyrePhysics.forEach(tp => {
    if (!tp.flying) return;
    tp.vel.y -= 9.81 * dt; // gravity
    tp.mesh.position.x += tp.vel.x * dt;
    tp.mesh.position.y += tp.vel.y * dt;
    tp.mesh.position.z += tp.vel.z * dt;
    tp.mesh.rotation.x += tp.angVel.x * dt;
    tp.mesh.rotation.y += tp.angVel.y * dt;
    tp.mesh.rotation.z += tp.angVel.z * dt;
    // Bounce on floor
    const floorY = -1 + 0.52; // tyre radius above track floor
    if (tp.mesh.position.y + tyreWallGroup.position.y < -1 + 0.52) {
      tp.mesh.position.y = -1 + 0.52 - tyreWallGroup.position.y;
      tp.vel.y = Math.abs(tp.vel.y) * 0.35;
      tp.vel.x *= 0.7;
      tp.vel.z *= 0.7;
      tp.angVel.multiplyScalar(0.6);
    }
  });

  // 5. NOSE CONE PHYSICS
  if (noseFlying && noseCone) {
    noseVel.y -= 9.81 * dt;
    noseCone.position.x += noseVel.x * dt;
    noseCone.position.y += noseVel.y * dt;
    noseCone.position.z += noseVel.z * dt;
    noseCone.rotation.x += noseAngVel.x * dt;
    noseCone.rotation.y += noseAngVel.y * dt;
    noseCone.rotation.z += noseAngVel.z * dt;
    if (noseCone.position.y < -0.8) {
      noseCone.position.y = -0.8;
      noseVel.y = Math.abs(noseVel.y) * 0.25;
      noseVel.x *= 0.6;
      noseVel.z *= 0.6;
      noseAngVel.multiplyScalar(0.5);
    }
  }

  // 6. FIRE PARTICLE SYSTEM — skip entirely if impact tab is not visible
  const _impactVisible = document.getElementById('panel-impact')?.classList.contains('is-visible') ?? true;
  if (fireActive && _impactVisible) {
    const fp = fireParticles.geometry.attributes.position.array;
    const targetOpacity = Math.min(0.65, crashIntensity * 0.8);
    fireMat.opacity = Math.min(fireMat.opacity + dt * 2, targetOpacity);
    // Cycle fire color: orange → yellow → red
    const t = performance.now() * 0.001;
    const fireR = 1.0, fireG = 0.2 + Math.sin(t * 4) * 0.15, fireB = 0;
    fireMat.color.setRGB(fireR, fireG, fireB);
    const fireOriginX = -2.5;
    for (let i = 0; i < FIRE_COUNT; i++) {
      if (fp[i*3] < -30 || fireLife[i] <= 0) {
        // Respawn
        fp[i*3]   = fireOriginX + (Math.random() - 0.5) * 0.6;
        fp[i*3+1] = -0.5 + Math.random() * 0.3;
        fp[i*3+2] = (Math.random() - 0.5) * 0.8;
        fireLife[i] = 0.8 + Math.random() * 0.8;
        fireVelArr[i*3]   = (Math.random() - 0.5) * 0.5;
        fireVelArr[i*3+1] = 1.5 + Math.random() * 2.5;
        fireVelArr[i*3+2] = (Math.random() - 0.5) * 0.5;
      }
      fp[i*3]   += fireVelArr[i*3]   * dt;
      fp[i*3+1] += fireVelArr[i*3+1] * dt;
      fp[i*3+2] += fireVelArr[i*3+2] * dt;
      fireLife[i] -= dt * 0.8;
    }
    fireParticles.geometry.attributes.position.needsUpdate = true;
  }
}


// ============================================================
// 11. SCISSOR VIEWPORT RENDERER
// ============================================================
const viewports = [
  { elementId: 'view-aero',   scene: sceneAero,   camera: camAero,   controls: ctrlsAero },
  { elementId: 'view-impact', scene: sceneImpact, camera: camImpact, controls: ctrlsImpact }
];

function resizeRenderer() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  if (renderer.domElement.width !== w * pixelRatio) {
    renderer.setSize(w, h);
  }
}

// ============================================================
// 12. MAIN ANIMATION LOOP
// ============================================================
let lastTime   = 0;
const SIM_DT   = 1 / 60;         // fixed physics step
let accumulator = 0;
let _frameCount = 0; // used to throttle heavy GPU uploads

function animate(now) {
  requestAnimationFrame(animate);

  const ms  = now - lastTime;
  lastTime  = now;
  // Apply speed multiplier (0.2–1.0) from UI — physics stays consistent, just time dilates
  const speed = (typeof window._simSpeed === 'number') ? window._simSpeed : 1;
  const raw = Math.min(ms / 1000, 0.033) * speed; // cap at 33ms, then scale
  accumulator += raw;

  resizeRenderer();
  _frameCount++;

  // Handle graph reinit request from graph-only toggle
  if (window._forceGraphReinit) {
    ctxAero = null; ctxImpact = null;
    window._forceGraphReinit = false;
  }

  // Fixed physics steps — max 1 sub-step; drops sim time rather than lagging
  let steps = 0;
  while (accumulator >= SIM_DT && steps < 1) {
    const result = updateAeroPhysics(SIM_DT);
    if (result) updateArrows(result.Fg, result.Fd);
    updateWindParticles(simState.aero.velocity);
    updateHeatSparks(simState.aero.velocity);
    updateImpactCrash(SIM_DT);
    accumulator -= SIM_DT;
    steps++;
  }

  // Visual updates (every frame)
  const t = now * 0.001;

  // Capsule oscillation
  if (dragonCapsule) {
    const shake = simState.aero.velocity * 0.0004;
    dragonCapsule.rotation.z = Math.sin(t * 1.8) * shake;
    dragonCapsule.rotation.x = Math.cos(t * 1.4) * shake;
  }
  // Parachute sway
  if (parachuteGroup && parachuteGroup.scale.x > 0.05) {
    parachuteGroup.rotation.z = Math.sin(t * 0.8) * 0.04;
  }

  // Graphs — init once, reinit only if canvas lost its dimensions
  if (!ctxAero   || ctxAero.canvas.width   < 10) ctxAero   = setupGraph('graph-aero');
  if (!ctxImpact || ctxImpact.canvas.width < 10) ctxImpact = setupGraph('graph-impact');
  drawGraph(ctxAero, aeroHistory, 't', 'v', '#4d9fff', 't', 'v', null, [0, 100],
    { safeZone: { lo: 0, hi: 10, label: '✓ SAFE ≤10 m/s' } });
  drawGraph(ctxImpact, impactHistory, 'd', 'f', '#ff7a28', 'd', 'f', null, null,
    { yieldX: (simState.impact.yield_x * 100).toFixed(1) });

  // Render all viewports via scissor test
  renderer.setScissorTest(true);
  renderer.setClearColor(0x000000, 0);
  renderer.clear(true, true);

  const canvasRect = renderer.domElement.getBoundingClientRect();

  viewports.forEach(({ elementId, scene, camera, controls }) => {
    const el = document.getElementById(elementId);
    if (!el) return;

    // Skip inactive tab panels — halves GPU cost on mobile
    const panel = el.closest('.sim-module-panel');
    if (panel && !panel.classList.contains('is-visible')) {
      controls.update();
      return;
    }

    const rect = el.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight ||
        rect.right  < 0 || rect.left > window.innerWidth) return;

    const width  = rect.right  - rect.left;
    const height = rect.bottom - rect.top;
    const left   = rect.left   - canvasRect.left;
    const bottom = renderer.domElement.clientHeight - rect.bottom + canvasRect.top;

    if (width <= 0 || height <= 0) return;

    renderer.setViewport(left, bottom, width, height);
    renderer.setScissor(left, bottom, width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    controls.update();
    renderer.render(scene, camera);
  });
}

// Kick off
updatePhase('drogue');
updateImpactReadouts();

// Start Simulation Event Listeners
document.addEventListener('startAero', () => {
  if (!simState.aero.failed && !simState.aero.succeeded) {
    simState.aero.running = true;
  }
});

document.addEventListener('startImpact', () => {
  if (simState.impact.phase === 'standby' || simState.impact.phase === 'done') {
    if (simState.impact.phase === 'done') resetImpactState();
    simState.impact.phase = 'idle'; // Triggers crash sequence
  }
});

requestAnimationFrame((t) => { lastTime = t; animate(t); });

// Handle resize
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  // Rebuild graph canvases
  ctxAero   = null;
  ctxImpact = null;
});
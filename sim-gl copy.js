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
const isLowEnd    = navigator.hardwareConcurrency <= 2 || isMobile;
const pixelRatio  = Math.min(window.devicePixelRatio, isLowEnd ? 1.5 : 2);

// Particle counts scaled by device
const WIND_COUNT   = isMobile ? 150 : isTablet ? 350 : 600;
const SPARK_COUNT  = isMobile ? 40  : isTablet ? 80  : 150;

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
renderer.shadowMap.enabled = isDesktop;

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
    running:    true,
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
    phase: 'idle'        // idle -> rolling -> crashing -> done
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
ctrlsAero.enableZoom    = isDesktop;
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
// 4. SCENE B — IMPACT KINEMATICS
// ============================================================
const sceneImpact = new THREE.Scene();
const camImpact   = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
camImpact.position.set(6, 3.5, 9);
camImpact.lookAt(0, 0, 0);

const ctrlsImpact = new OrbitControls(camImpact, document.getElementById('view-impact'));
ctrlsImpact.enableDamping = true;
ctrlsImpact.dampingFactor = 0.08;
ctrlsImpact.enableZoom    = isDesktop;
ctrlsImpact.enablePan     = false;

sceneImpact.add(new THREE.AmbientLight(0xffffff, 0.7));
const sunImpact = new THREE.DirectionalLight(0xffffff, 2);
sunImpact.position.set(-5, 10, 5);
sceneImpact.add(sunImpact);
if (isDesktop) {
  sunImpact.castShadow = true;
  sunImpact.shadow.mapSize.setScalar(1024);
}

// Grid
const gridImpact = new THREE.GridHelper(18, 18, 0xFF6B00, 0x1a1a3a);
gridImpact.position.y = -1;
sceneImpact.add(gridImpact);

// Wall
const wallMesh = new THREE.Mesh(
  new THREE.BoxGeometry(2, 5, 8),
  new THREE.MeshStandardMaterial({ color: 0x111122, roughness: 0.95, metalness: 0.1 })
);
wallMesh.position.set(-5, 0.5, 0);
sceneImpact.add(wallMesh);

// Wall cracks (visual — desktop)
let crackGroup = null;
if (isDesktop) {
  crackGroup = new THREE.Group();
  crackGroup.position.copy(wallMesh.position);
  crackGroup.visible = false;
  sceneImpact.add(crackGroup);
}

// Impact debris particles
const debrisGeo = new THREE.BufferGeometry();
const DEBRIS_COUNT = isLowEnd ? 20 : 60;
const dPos = new Float32Array(DEBRIS_COUNT * 3);
const dVel = new Float32Array(DEBRIS_COUNT * 3);
for (let i = 0; i < DEBRIS_COUNT; i++) {
  dPos[i*3] = -5; dPos[i*3+1] = 0; dPos[i*3+2] = 0;
  dVel[i*3]   = -Math.random() * 0.1;
  dVel[i*3+1] = Math.random() * 0.2 - 0.05;
  dVel[i*3+2] = (Math.random() - 0.5) * 0.15;
}
debrisGeo.setAttribute('position', new THREE.BufferAttribute(dPos, 3));
const debrisMat = new THREE.PointsMaterial({ size: 0.06, color: 0xff6600, transparent: true, opacity: 0 });
const debrisParticles = new THREE.Points(debrisGeo, debrisMat);
sceneImpact.add(debrisParticles);

// Car (procedural)
const carGroup = new THREE.Group();
// let carChassis = null;

function buildProceduralCar() {
  const g = new THREE.Group();
  // Body
  const bodyMesh = new THREE.Mesh(
    new THREE.BoxGeometry(4, 1.2, 2),
    new THREE.MeshStandardMaterial({ color: 0x334466, metalness: 0.5, roughness: 0.4 })
  );
  bodyMesh.position.y = 0.4;
  g.add(bodyMesh);
  // Cabin
  const cabinMesh = new THREE.Mesh(
    new THREE.BoxGeometry(2.2, 1, 1.8),
    new THREE.MeshStandardMaterial({ color: 0x445577, metalness: 0.3, roughness: 0.5 })
  );
  cabinMesh.position.set(0.3, 1.4, 0);
  g.add(cabinMesh);
  // Wheels
  const wheelGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.25, 16);
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });
  [[1.5, -0.1, 1.2], [1.5, -0.1, -1.2], [-1.5, -0.1, 1.2], [-1.5, -0.1, -1.2]].forEach(([x,y,z]) => {
    const w = new THREE.Mesh(wheelGeo, wheelMat);
    w.position.set(x, y, z);
    w.rotation.z = Math.PI / 2;
    g.add(w);
  });
  return g;
}

// LOAD CAR CHASSIS
let carWrapper = new THREE.Group();
sceneImpact.add(carWrapper);

let carChassis = null;
loader.load('low_poly_car.glb', (gltf) => {
    carChassis = gltf.scene;
    
    // Normalize size
    const box = new THREE.Box3().setFromObject(carChassis);
    const size = box.getSize(new THREE.Vector3());
    const sf = 4 / size.z; // Force length to be 4 units
    carChassis.scale.setScalar(sf);
    
    // Center it
    const center = box.getCenter(new THREE.Vector3());
    carChassis.position.sub(center.multiplyScalar(sf));
    
    // Face the wall (-X direction)
    carChassis.rotation.y = -Math.PI / 2; 
    
    // Add to our wrapper
    carWrapper.add(carChassis);
});
carWrapper.position.set(4, -1, 0); // Start position



// ============================================================
// 5. GRAPH ENGINES (2D canvas)
// ============================================================
function setupGraph(canvasId) {
  const cvs = document.getElementById(canvasId);
  if (!cvs) return null;
  const parent = cvs.parentElement;
  cvs.width  = parent.clientWidth  || 300;
  cvs.height = parent.clientHeight || 140;
  return cvs.getContext('2d');
}

let ctxAero   = null;
let ctxImpact = null;
const aeroHistory   = [];   // { t, v } pairs
const impactHistory = [];   // { d, f } pairs
const MAX_HISTORY   = 200;

function drawGraph(ctx, data, xKey, yKey, color, xLabel, yLabel, xRange, yRange) {
  if (!ctx || !data.length) return;
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  ctx.clearRect(0, 0, w, h);

  // Background
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, w, h);

  // Grid
  ctx.strokeStyle = 'rgba(80,120,255,0.08)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = (i / 4) * h;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }
  for (let i = 0; i <= 6; i++) {
    const x = (i / 6) * w;
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
  }

  if (data.length < 2) return;

  const xMin = xRange ? xRange[0] : data[0][xKey];
  const xMax = xRange ? xRange[1] : Math.max(...data.map(d => d[xKey]));
  const yMin = yRange ? yRange[0] : 0;
  const yMax = yRange ? yRange[1] : Math.max(...data.map(d => d[yKey])) * 1.1 || 1;

  const toX = v => ((v - xMin) / (xMax - xMin || 1)) * w;
  const toY = v => h - ((v - yMin) / (yMax - yMin || 1)) * h;

  // Glow line
  ctx.save();
  ctx.shadowBlur  = 8;
  ctx.shadowColor = color;
  ctx.strokeStyle = color;
  ctx.lineWidth   = 1.5;
  ctx.lineJoin    = 'round';
  ctx.beginPath();
  data.forEach((d, i) => {
    const x = toX(d[xKey]);
    const y = toY(d[yKey]);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.stroke();
  ctx.restore();

  // Fill under
  ctx.save();
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, color.replace(')', ', 0.3)').replace('rgb', 'rgba'));
  grad.addColorStop(1, 'transparent');
  ctx.fillStyle = grad;
  ctx.beginPath();
  data.forEach((d, i) => {
    const x = toX(d[xKey]);
    const y = toY(d[yKey]);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.lineTo(toX(data[data.length-1][xKey]), h);
  ctx.lineTo(toX(data[0][xKey]), h);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Latest value dot
  const last = data[data.length - 1];
  ctx.beginPath();
  ctx.arc(toX(last[xKey]), toY(last[yKey]), 3, 0, Math.PI*2);
  ctx.fillStyle = color;
  ctx.fill();
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
    const mapped = (raw / 100) * 120; // 0–120 m²
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
    simState.impact.velocity = parseFloat(e.target.value);
    if (ui.valVel) ui.valVel.textContent = `${simState.impact.velocity.toFixed(1)} m/s`;
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
  s.phase        = 'idle';
  s.x_crush      = 0;
  s.v            = s.approachVel;
  s.F            = 0;
  s.car_x        = 4;

  impactHistory.length = 0;
  
  if (carWrapper) {
      carWrapper.position.set(4, -1, 0);
      carWrapper.scale.set(1, 1, 1);
  }
  if (debrisMat) debrisMat.opacity = 0;
  
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
  simState.aero.running   = true;
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
  simState.aero.running   = true;
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
  const v   = s.velocity;
  const k   = s.stiffness * 50000;      // spring constant N/m
  const KE  = 0.5 * m * v * v;         // Joules
  const dCrush = Math.sqrt(2 * KE / k); // meters
  const Fpeak  = k * dCrush;            // Newtons
  const gPeak  = Fpeak / (m * 9.81);
  const impulse = m * v;                // kg*m/s

  const setCell = (el, val, unit, cls) => {
    if (!el) return;
    el.className = `readout-cell ${cls || ''}`;
    el.querySelector('.readout-cell__value').innerHTML =
      `${val}<span class="readout-cell__unit">${unit}</span>`;
  };

  const gCls = gPeak > 40 ? 'is-alert' : gPeak > 20 ? 'is-warn' : 'is-ok';
  setCell(ui.readoutImpactForce,  (Fpeak/1000).toFixed(1), 'kN', gCls);
  setCell(ui.readoutImpactG,      gPeak.toFixed(1), 'G', gCls);
  setCell(ui.readoutImpactEnergy, (KE/1000).toFixed(1), 'kJ', '');
  setCell(ui.readoutImpactStop,   (dCrush*100).toFixed(1), 'cm', '');

  // Engineer panel
  if (ui.eqKe)     ui.eqKe.textContent     = `${(KE/1000).toFixed(2)} kJ`;
  if (ui.eqWork)   ui.eqWork.textContent   = `${(KE/1000).toFixed(2)} kJ`;
  if (ui.eqPeakF)  ui.eqPeakF.textContent  = `${(Fpeak/1000).toFixed(1)} kN`;
  if (ui.eqImpulse) ui.eqImpulse.textContent = `${impulse.toFixed(0)} N·s`;

  // Live graph label
  if (ui.graphImpactLive) ui.graphImpactLive.textContent = `${gPeak.toFixed(1)} G`;

  // Impact status
  if (gPeak > 40) {
    setImpactStatus('crit', 'FATAL IMPACT');
  } else if (gPeak > 20) {
    setImpactStatus('warn', 'HIGH FORCE');
  } else {
    setImpactStatus('ok', 'SURVIVABLE');
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
  windParticles.geometry.attributes.position.needsUpdate = true;
  windParticles.geometry.attributes.color.needsUpdate    = true;
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

// ============================================================
// 10. IMPACT CRASH ANIMATION
// ============================================================
function updateImpactCrash(dt) {
  const s = simState.impact;
  
  // 1. INITIALIZE
  if (s.phase === 'idle') {
    s.phase = 'rolling';
    s.v = s.approachVel;
    s.car_x = 4;
    s.x_crush = 0;
    
    // Calculate Material Properties
    s.k_elastic = s.stiffness * 500000;  // Stiff elastic region
    s.k_plastic = s.k_elastic * 0.15;    // Weak plastic region (yielding)
    s.yield_x = 0.1;                     // Yields at 10cm
    
    impactHistory.length = 0;
  }

  // 2. ROLLING PHASE (Moving to the wall)
  if (s.phase === 'rolling') {
    s.car_x -= s.v * dt; // Move left
    
    // Check collision. Wall front face is at X = -3. Car length is 4.
    // Car front hits the wall when car center (car_x) is at -1.
    if (s.car_x <= -1) {
        s.car_x = -1; // Snap exactly to wall
        s.phase = 'crashing';
        s.isCrashing = true;
    }
    
    if (carWrapper) carWrapper.position.x = s.car_x;
  }

  // 3. CRASHING PHASE (RK4 Integration)
  if (s.phase === 'crashing') {
    
    // Bilinear Isotropic Hardening Force Function
    const getForce = (x) => {
        if (x < s.yield_x) return s.k_elastic * x; 
        return (s.k_elastic * s.yield_x) + s.k_plastic * (x - s.yield_x);
    };
    const getAccel = (x, v) => -(getForce(x) / s.carMass);

    // RK4 Integration Steps
    const k1_x = s.v;
    const k1_v = getAccel(s.x_crush, s.v);
    const k2_x = s.v + 0.5 * dt * k1_v;
    const k2_v = getAccel(s.x_crush + 0.5 * dt * k1_x, s.v + 0.5 * dt * k1_v);
    const k3_x = s.v + 0.5 * dt * k2_v;
    const k3_v = getAccel(s.x_crush + 0.5 * dt * k2_x, s.v + 0.5 * dt * k2_v);
    const k4_x = s.v + dt * k3_v;
    const k4_v = getAccel(s.x_crush + dt * k3_x, s.v + dt * k3_v);

    s.x_crush += (dt / 6) * (k1_x + 2 * k2_x + 2 * k3_x + k4_x);
    s.v += (dt / 6) * (k1_v + 2 * k2_v + 2 * k3_v + k4_v);
    s.F = getForce(s.x_crush);
    s.a = getAccel(s.x_crush, s.v);

    // Stop condition (velocity hits 0)
    if (s.v <= 0) {
        s.v = 0;
        s.phase = 'done';
        s.isCrashing = false;
    }

    // --- APPLY VISUALS ---
    if (carWrapper) {
        // Car length is 4. Scale down the X axis to simulate crushing.
        const L = 4.0;
        const scaleFactor = Math.max(0.1, (L - s.x_crush) / L);
        carWrapper.scale.x = scaleFactor;
        
        // Keep the front of the car pinned to the wall (X = -3)
        // As the car scales down, its center must shift right.
        carWrapper.position.x = -3 + (L * scaleFactor) / 2;

        // Violent shake if plastic yield is reached
        if (s.x_crush > s.yield_x && s.v > 0) {
            carWrapper.position.y = -1 + (Math.random() - 0.5) * 0.08;
            carWrapper.position.z = (Math.random() - 0.5) * 0.05;
        }
    }

    impactHistory.push({ d: (s.x_crush * 100).toFixed(1), f: (s.F / 1000).toFixed(2) });

    // UI Updates
    const gPeak = Math.abs(s.a) / 9.81;
    if (gPeak > 40) setImpactStatus('crit', 'FATAL IMPACT');
    else if (gPeak > 20) setImpactStatus('warn', 'HIGH FORCE');
    else setImpactStatus('ok', 'SURVIVABLE');

    // Debris generation at the wall face
    if (s.x_crush > s.yield_x) {
      debrisMat.opacity = Math.min(0.9, (s.x_crush - s.yield_x) * 5);
      const dp = debrisParticles.geometry.attributes.position.array;
      for (let i = 0; i < DEBRIS_COUNT; i++) {
        if(dp[i*3] === -5) { // If uninitialized, place at wall
            dp[i*3] = -3; 
            dp[i*3+1] = Math.random() * 2;
        }
        dp[i*3]   += dVel[i*3];
        dp[i*3+1] += dVel[i*3+1] - 0.01; // Gravity on debris
        dp[i*3+2] += dVel[i*3+2];
      }
      debrisParticles.geometry.attributes.position.needsUpdate = true;
    }

    if (s.phase === 'done') {
      window._telemetryLog.impact.push({
        velocity: s.approachVel, stiffness: s.stiffness,
        peak_force_kN: (s.F / 1000).toFixed(2),
        peak_g: gPeak.toFixed(1),
        crush_cm: (s.x_crush * 100).toFixed(1)
      });
      if (gPeak > 40 && ui.impactFailure) {
          setTimeout(() => ui.impactFailure.classList.add('visible'), 500);
      }
    }
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

function animate(now) {
  requestAnimationFrame(animate);

  const ms  = now - lastTime;
  lastTime  = now;
  const raw = Math.min(ms / 1000, 0.05); // cap delta at 50ms
  accumulator += raw;

  resizeRenderer();

  // Fixed physics steps
  while (accumulator >= SIM_DT) {
    const result = updateAeroPhysics(SIM_DT);
    if (result) updateArrows(result.Fg, result.Fd);
    updateWindParticles(simState.aero.velocity);
    updateHeatSparks(simState.aero.velocity);
    updateImpactCrash(SIM_DT);
    accumulator -= SIM_DT;
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

  // Graphs
  if (!ctxAero) ctxAero = setupGraph('graph-aero');
  if (!ctxImpact) ctxImpact = setupGraph('graph-impact');
  drawGraph(ctxAero, aeroHistory, 't', 'v', '#4d9fff', 't', 'v', null, [0, 100]);
  drawGraph(ctxImpact, impactHistory, 'd', 'f', '#ff7a28', 'd', 'f', null, null);

  // Render all viewports via scissor test
  renderer.setScissorTest(true);
  renderer.setClearColor(0x000000, 0);
  renderer.clear(true, true);

  const canvasRect = renderer.domElement.getBoundingClientRect();

  viewports.forEach(({ elementId, scene, camera, controls }) => {
    const el = document.getElementById(elementId);
    if (!el) return;

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

// Trigger first crash cycle after a short delay
setTimeout(() => {
  simState.impact.phase = 'idle';
}, 800);

requestAnimationFrame((t) => { lastTime = t; animate(t); });

// Handle resize
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  // Rebuild graph canvases
  ctxAero   = null;
  ctxImpact = null;
});
/* ═══════════════════════════════════════════════════════════════════
   ATLAS LAB — team.js
   Pure Three.js formation. Keplerian orbital mechanics.

   ── TO ADD/REMOVE MEMBERS ──────────────────────────────────────
   Edit CORE_MEMBERS (Operators) or SUPPORTED_MEMBERS (Members).
   The scene rebuilds automatically. No other code needs touching.
═══════════════════════════════════════════════════════════════════ */

'use strict';

/* ════════════════════════════════════════════════════════════════
   ██████╗  █████╗ ████████╗ █████╗
   ██╔══██╗██╔══██╗╚══██╔══╝██╔══██╗
   ██║  ██║███████║   ██║   ███████║
   ██║  ██║██╔══██║   ██║   ██╔══██║
   ██████╔╝██║  ██║   ██║   ██║  ██║
   ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝

   CLUB ROSTER DATA
════════════════════════════════════════════════════════════════ */

const CORE_MEMBERS =[
  {
    id: 'c0', name: 'Mohana Rangan Desigan', role: 'Club Operator', initials: 'MRD',
    research: 'Math Guide & Session Planner & Website manager',
    bio: 'Calculates probability, descent formulas, statistical analysis for engineering post-mortems, creates, manages website, and responsible for the simulations',
     email: 'mohanrd200932@gmail.com'
  },
  {
    id: 'c1', name: 'Vivaan Keluskar', role: 'Club Operator', initials: 'VK',
    research: 'Physics Guide & Challenge Designer',
    bio: 'Oversees the physical mechanics of drops and designs high-pressure engineering constraints.',
    email: 'vivaan@enggclub.edu'
  },

  {
    id: 'c2', name: 'Buvan Senthil Vinayakam', role: 'Club Operator', initials: 'BSV',
    research: 'Guide & Challenge Designer',
    bio: 'Develops structural parameters and failure-condition simulations for team challenges.',
    email: 'buvan@enggclub.edu'
  },
  {
    id: 'c3', name: 'Shora Uchida', role: 'Club Operator', initials: 'SU',
    research: 'Guide & Website Manager',
    bio: 'Maintains digital telemetry systems and interactive archives for the club network.',
    email: 'shora@enggclub.edu'
  },

  {
    id: 'c4', name: 'Ziwen An', role: 'Club Operator', initials: 'ZA',
    research: 'Guide & Analyst',
    bio: 'Tracks team telemetry, evaluates design trade-offs, and breaks down failure points.',
    email: 'ziwen@enggclub.edu'
  },
  {
    id: 'c5', name: 'Dharanevasan Sathishkumar', role: 'Club Operator', initials: 'DS',
    research: 'Guide & Materials, Logistics & Website Manager',
    bio: 'Manages physical resource constraints, system administration, Physics Guide, and club infrastructure.',
    email: 'dharanevasan@enggclub.edu'
  },
  {
    id: 'c6', name: 'Adhvaith V. Saravanan', role: 'Club Operator', initials: 'AVS',
    research: 'Guide & Materials and Logistics',
    bio: 'Controls inventory bottlenecks and simulates real-world supply chain pressures for builds.',
    email: 'adhvaith@enggclub.edu'
  },

  {
    id: 'c7', name: 'Laeem Khan', role: 'Club Operator', initials: 'LK',
    research: 'Guide & Session Planner',
    bio: 'Architects the session timelines and ensures mission objectives are met efficiently.',
    publications: 8, h_index: 3, email: 'laeem@enggclub.edu'
  },

  {
    id: 'c8', name: 'Shaurya Shukla', role: 'Club Operator', initials: 'SS',
    research: 'Guide & Social Media',
    bio: 'Handles external communications, operational reporting, and visual data archiving.',
    email: 'shaurya@enggclub.edu'
  }
];

const SUPPORTED_MEMBERS =[
  /* anchor: id of the CORE_MEMBERS entry this person orbits */
  { id:'s0',  name:'Aaradhya Akabari',   initials:'AA',  domain:'cfd', role:'Club Member', anchor:'c0', semi_a:3.2, ecc:0.18, incl:15, lan:  0, aop: 30, period:1.0  },
  { id:'s1',  name:'Aarsh Jayswal',      initials:'AJ',  domain:'ml',  role:'Club Member', anchor:'c1', semi_a:2.8, ecc:0.10, incl:35, lan: 60, aop: 80, period:0.85 },
  { id:'s2',  name:'Adam Widad',         initials:'AW',  domain:'fem', role:'Club Member', anchor:'c2', semi_a:3.5, ecc:0.30, incl:50, lan:120, aop:150, period:1.2  },
  { id:'s3',  name:'Adhyayan Akabari',   initials:'AA2', domain:'cfd', role:'Club Member', anchor:'c3', semi_a:3.0, ecc:0.22, incl:10, lan:180, aop:200, period:0.95 },
  { id:'s4',  name:'Ahaan Rudra',        initials:'AR',  domain:'ml',  role:'Club Member', anchor:'c4', semi_a:2.6, ecc:0.08, incl:65, lan:240, aop:270, period:0.75 },
  { id:'s5',  name:'Areeba Khan',        initials:'AK',  domain:'fem', role:'Club Member', anchor:'c5', semi_a:3.8, ecc:0.40, incl:25, lan:300, aop:320, period:1.35 },
  { id:'s6',  name:'Arkin Bhadauria',    initials:'AB',  domain:'cfd', role:'Club Member', anchor:'c6', semi_a:3.1, ecc:0.15, incl:42, lan: 30, aop: 50, period:1.05 },
  { id:'s7',  name:'Bhrainaa Pillai',    initials:'BP',  domain:'ml',  role:'Club Member', anchor:'c7', semi_a:2.9, ecc:0.12, incl:58, lan: 90, aop:100, period:0.9  },
  { id:'s8',  name:'Chirayu Gupta',      initials:'CG',  domain:'fem', role:'Club Member', anchor:'c8', semi_a:4.0, ecc:0.35, incl:20, lan:150, aop:180, period:1.4  },
  { id:'s9',  name:'Dahye Choi',         initials:'DC',  domain:'cfd', role:'Club Member', anchor:'c0', semi_a:3.4, ecc:0.20, incl:70, lan:210, aop:230, period:1.15 },
  { id:'s10', name:'Daichi D. Ingram',   initials:'DDI', domain:'ml',  role:'Club Member', anchor:'c1', semi_a:2.7, ecc:0.25, incl:32, lan:270, aop:290, period:0.8  },
  { id:'s11', name:'Mahir Tazwar',       initials:'MT',  domain:'fem', role:'Club Member', anchor:'c2', semi_a:3.6, ecc:0.28, incl:48, lan:330, aop:350, period:1.25 },
  { id:'s12', name:'Pragatheesh R. D.',  initials:'PRD', domain:'cfd', role:'Club Member', anchor:'c3', semi_a:2.5, ecc:0.05, incl:22, lan: 45, aop: 60, period:0.7  },
  { id:'s13', name:'Rayden Dsilva',      initials:'RD',  domain:'ml',  role:'Club Member', anchor:'c4', semi_a:3.3, ecc:0.45, incl:55, lan:105, aop:120, period:1.1  },
  { id:'s14', name:'Reva Pushpahas',     initials:'RP',  domain:'fem', role:'Club Member', anchor:'c5', semi_a:3.7, ecc:0.32, incl:15, lan:135, aop:160, period:1.3  },
  { id:'s15', name:'Rimi Kawamoto',      initials:'RK',  domain:'cfd', role:'Club Member', anchor:'c6', semi_a:2.9, ecc:0.18, incl:60, lan:225, aop:250, period:0.88 },
  { id:'s16', name:'Samika Karthik',     initials:'SK',  domain:'ml',  role:'Club Member', anchor:'c7', semi_a:3.1, ecc:0.10, incl:40, lan:315, aop:340, period:1.0  },
  { id:'s17', name:'Sosuke Iyoda',       initials:'SI',  domain:'fem', role:'Club Member', anchor:'c8', semi_a:3.9, ecc:0.28, incl:75, lan: 15, aop: 40, period:1.45 },
  { id:'s18', name:'Tanisha Velu',       initials:'TV',  domain:'cfd', role:'Club Member', anchor:'c0', semi_a:2.6, ecc:0.08, incl:28, lan:195, aop:210, period:0.82 }
];

/* ════════════════════════════════════════════════════════════════
   END OF DATA — everything below is engine code
════════════════════════════════════════════════════════════════ */

/* ── DOMAIN COLORS ── */
// const DOMAIN_COLOR = { cfd: 0xFF6B00, ml: 0x4499DD, fem: 0x00CC66 };
// const DOMAIN_HEX   = { cfd: '#FF6B00', ml: '#4499DD', fem: '#00CC66' };
// const DOMAIN_LABEL = { cfd: 'Fluid Dynamics', ml: 'ML + Engineering', fem: 'Structural / FEM' };
const DOMAIN_COLOR = { cfd: 0xFF7A00, ml: 0x00E5FF, fem: 0x00FF66 };
const DOMAIN_HEX   = { cfd: '#FF7A00', ml: '#00E5FF', fem: '#00FF66' };
const DOMAIN_LABEL = { cfd: 'Fluid Dynamics', ml: 'ML + Engineering', fem: 'Structural / FEM' };

/* ── KEPLERIAN ORBITAL MECHANICS ───────────────────────────────
   Reference: Curtis, H. D. "Orbital Mechanics for Engineering Students"
   We place each satellite's focus at its anchor core position.

   State at time t (eccentric anomaly solved via Newton–Raphson):
     M(t) = n·t + M0            Mean anomaly
     E: M = E − e·sin(E)        Kepler's equation → Newton–Raphson
     ν = 2·atan2(√(1+e)·sin(E/2), √(1−e)·cos(E/2))   True anomaly
     r = a(1 − e²)/(1 + e·cosν)  Radius

   Then rotate by (ω, i, Ω) via DCM (3-1-3 Euler angles).
────────────────────────────────────────────────────────────── */

const BASE_PERIOD = 8.0; // seconds for period multiplier = 1.0

function solveKepler(M, e, tol = 1e-8) {
  // Newton–Raphson on Kepler's equation: E - e*sin(E) = M
  let E = M + e * Math.sin(M) * (1 + e * Math.cos(M));
  for (let i = 0; i < 30; i++) {
    const dE = (M - E + e * Math.sin(E)) / (1 - e * Math.cos(E));
    E += dE;
    if (Math.abs(dE) < tol) break;
  }
  return E;
}

function keplerState(orb, t, focusX, focusY, focusZ) {
  // orb: { semi_a, ecc, incl_rad, lan_rad, aop_rad, n, M0 }
  const M = orb.n * t + orb.M0;
  const E = solveKepler(M, orb.ecc);

  // True anomaly
  const nu = 2 * Math.atan2(
    Math.sqrt(1 + orb.ecc) * Math.sin(E / 2),
    Math.sqrt(1 - orb.ecc) * Math.cos(E / 2)
  );

  // Distance from focus
  const r = orb.semi_a * (1 - orb.ecc * orb.ecc) / (1 + orb.ecc * Math.cos(nu));

  // Position in orbital plane (perifocal frame)
  const xp = r * Math.cos(nu);
  const yp = r * Math.sin(nu);

  // Rotate to 3-D inertial frame via DCM: R3(-Ω)·R1(-i)·R3(-ω)
  const cW = Math.cos(orb.lan_rad),  sW = Math.sin(orb.lan_rad);
  const ci = Math.cos(orb.incl_rad), si = Math.sin(orb.incl_rad);
  const cw = Math.cos(orb.aop_rad),  sw = Math.sin(orb.aop_rad);

  // DCM row by row (perifocal → inertial)
  const Qxx = cW*cw - sW*sw*ci;
  const Qxy = -cW*sw - sW*cw*ci;
  const Qyx = sW*cw + cW*sw*ci;
  const Qyy = -sW*sw + cW*cw*ci;
  const Qzx = sw*si;
  const Qzy = cw*si;

  return {
    x: focusX + Qxx*xp + Qxy*yp,
    y: focusY + Qzx*xp + Qzy*yp,   // Y-up in Three.js
    z: focusZ + Qyx*xp + Qyy*yp,
  };
}

/* Build precomputed orbital params from human-friendly degrees */
function buildOrbitalParams(s, sceneScale) {
  const period = BASE_PERIOD * s.period;
  return {
    semi_a:   s.semi_a * (sceneScale || 1.0),
    ecc:      s.ecc,
    incl_rad: s.incl * Math.PI / 180,
    lan_rad:  s.lan  * Math.PI / 180,
    aop_rad:  s.aop  * Math.PI / 180,
    n:        (2 * Math.PI) / period,
    M0:       Math.random() * 2 * Math.PI,
  };
}

/* Sample full orbit for the ghost trail (100 points) */
function sampleOrbit(orb, nPts = 120) {
  const pts = [];
  for (let i = 0; i < nPts; i++) {
    const M = (i / nPts) * 2 * Math.PI;
    const E = solveKepler(M, orb.ecc);
    const nu = 2 * Math.atan2(
      Math.sqrt(1 + orb.ecc) * Math.sin(E / 2),
      Math.sqrt(1 - orb.ecc) * Math.cos(E / 2)
    );
    const r = orb.semi_a * (1 - orb.ecc * orb.ecc) / (1 + orb.ecc * Math.cos(nu));
    pts.push({ x: r * Math.cos(nu), y: r * Math.sin(nu) });
  }
  return pts;
}

/* Compute orbit ellipse world points (for ghost ring) */
function orbitWorldPoints(orb, focusX, focusY, focusZ, nPts = 120) {
  const cW = Math.cos(orb.lan_rad),  sW = Math.sin(orb.lan_rad);
  const ci = Math.cos(orb.incl_rad), si = Math.sin(orb.incl_rad);
  const cw = Math.cos(orb.aop_rad),  sw = Math.sin(orb.aop_rad);
  const Qxx = cW*cw - sW*sw*ci,  Qxy = -cW*sw - sW*cw*ci;
  const Qyx = sW*cw + cW*sw*ci,  Qyy = -sW*sw + cW*cw*ci;
  const Qzx = sw*si,              Qzy =  cw*si;

  const pts = sampleOrbit(orb, nPts);
  return pts.map(p => new THREE.Vector3(
    focusX + Qxx*p.x + Qxy*p.y,
    focusY + Qzx*p.x + Qzy*p.y,
    focusZ + Qyx*p.x + Qyy*p.y
  ));
}

/* ════════════════════════════════════════════════════════════════
   THREE.JS SCENE
════════════════════════════════════════════════════════════════ */

(function main() {
  /* ── Renderer ── */
  const canvas = document.getElementById('scene');
  const isMobile = /Mobi|Android|iPhone/i.test(navigator.userAgent) || window.innerWidth < 768;
  const dpr = Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !isMobile, alpha: true });
  renderer.setPixelRatio(dpr);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x000000, 0.018);

  /* ── Formation Root Group (Phase 1) ── */
  // All formation meshes, rings, lines, sprites go here.
  // Resize only needs to scale this single group.
  const formationGroup = new THREE.Group();
  scene.add(formationGroup);

  /* ── Responsive Scale Helpers (Phase 2) ── */
  /* ── Mathematical Bounds Guarantee (Phase 2) ── */
  function calcResponsive(w, h) {
    const aspect = w / h;
    
    // 1. Determine maximum physical radius the system can span
    // Assuming largest satellite orbit is 6.0 units away from core
    const SCENE_SCALE = isMobile ? 1.2 : Math.max(1.6, Math.min(2.4, w / 1000));
    const CORE_ORBIT_R = Math.max(9.0, CORE_MEMBERS.length * 2.2) * SCENE_SCALE;
    const maxSystemRadius = CORE_ORBIT_R + (6.0 * SCENE_SCALE); 

    // 2. Trigonometric fitting based on Camera FOV (52 degrees)
    const fovRad = (52 * Math.PI) / 180;
    const distForHeight = maxSystemRadius / Math.tan(fovRad / 2);
    const distForWidth  = maxSystemRadius / (aspect * Math.tan(fovRad / 2));
    
    // 3. Guarantee screen bounds: use the largest distance + a 15% safety margin
    const requiredDist = Math.max(distForHeight, distForWidth) * 1.15;

    // We no longer scale down the group, we mathematically step the camera back.
    return { targetScale: 1.0, camDist: requiredDist };
  }

  /* ── Camera ── */
/* ── Camera & Orbitron HUD Layer ── */
  const _init = calcResponsive(window.innerWidth, window.innerHeight);
  const CAM_DIST = _init.camDist;
  
  // INCREASED FAR PLANE FROM 400 TO 8000 so the background galaxy is never clipped!
  const camera = new THREE.PerspectiveCamera(52, window.innerWidth / window.innerHeight, 0.05, 8000);
  const DEFAULT_CAM_POS = new THREE.Vector3(0, 5, CAM_DIST);
  camera.position.copy(DEFAULT_CAM_POS);
  camera.lookAt(0, 0, 0);

  // Inject Orbitron Font
  const fontLink = document.createElement('link');
  fontLink.rel = 'stylesheet';
  fontLink.href = 'https://fonts.googleapis.com/css2?family=Orbitron:wght@400..900&display=swap';
  document.head.appendChild(fontLink);

  // Create the 2D HUD layer for the names
  const labelsLayer = document.createElement('div');
  labelsLayer.id = 'html-labels-layer';
  labelsLayer.style.cssText = 'position:fixed; inset:0; pointer-events:none; z-index:45; overflow:hidden;';
  document.body.appendChild(labelsLayer);

  // Helper function to create beautiful 2D Orbitron labels
  function createHtmlLabel(name, type, meshTarget) {
    const isCore = type === 'core';
    const col = isCore ? '#FF6B00' : '#4499DD';
    const size = isCore ? '14px' : '11px';

    const wrapper = document.createElement('div');
    wrapper.style.cssText = `
      position: absolute; top: 0; left: 0;
      transform: translate(0px, -50%);
      display: flex; align-items: center; gap: 8px;
      cursor: pointer; pointer-events: auto;
      opacity: 0.85; transition: opacity 0.2s, transform 0.1s;
    `;

    // Interaction effects
    wrapper.onmouseover = () => { wrapper.style.opacity = '1'; wrapper.style.transform = 'translate(6px, -50%) scale(1.05)'; };
    wrapper.onmouseout = () => { wrapper.style.opacity = '0.85'; wrapper.style.transform = 'translate(0px, -50%) scale(1)'; };
    wrapper.onclick = () => handleNodeClick(meshTarget);

    // Decorative connection line
    const line = document.createElement('div');
    line.style.cssText = `width: ${isCore ? '24px' : '12px'}; height: 1.5px; background: ${col}; box-shadow: 0 0 6px ${col};`;

    // Orbitron Text
    const text = document.createElement('div');
    text.innerText = name.toUpperCase();
    text.style.cssText = `
      font-family: 'Orbitron', sans-serif; font-weight: 600;
      font-size: ${size}; color: ${col}; letter-spacing: 2px;
      white-space: nowrap; text-shadow: 0 0 10px rgba(0,0,0,0.9), 0 0 6px ${col};
    `;

    wrapper.appendChild(line);
    wrapper.appendChild(text);
    labelsLayer.appendChild(wrapper);

    return wrapper;
  }

  /* ── Lights ── */
  scene.add(new THREE.AmbientLight(0x111122, 4)); // Boosted ambient light
  const sunLight = new THREE.PointLight(0xFFE8CC, 6, 150);
  sunLight.position.set(0, 18, 0);
  scene.add(sunLight);
  const rimA = new THREE.PointLight(0xFF7A00, 6, 120); rimA.position.set(-20, 8, 12); scene.add(rimA);
  const rimB = new THREE.PointLight(0x00E5FF, 5, 120); rimB.position.set(20, -6, 10); scene.add(rimB);
  const rimC = new THREE.PointLight(0x00FF66, 3, 100); rimC.position.set(0, -15, -8); scene.add(rimC);

  /* ── Star field — three layers + constellation lines ── */
  (function buildStars() {
    // Layer A: dense dim background dust
    const NA = isMobile ? 1200 : 4000;
    const posA = new Float32Array(NA * 3);
    const colA = new Float32Array(NA * 3);
    for (let i = 0; i < NA; i++) {
      const r = 200 + Math.random() * 600;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      posA[i*3]   = r * Math.sin(ph) * Math.cos(th);
      posA[i*3+1] = r * Math.cos(ph);
      posA[i*3+2] = r * Math.sin(ph) * Math.sin(th);
      const t = Math.random();
      colA[i*3]   = 0.55 + t * 0.30;
      colA[i*3+1] = 0.60 + t * 0.05;
      colA[i*3+2] = 0.85 - t * 0.25;
    }
    const gA = new THREE.BufferGeometry();
    gA.setAttribute('position', new THREE.BufferAttribute(posA, 3));
    gA.setAttribute('color',    new THREE.BufferAttribute(colA, 3));
    scene.add(new THREE.Points(gA, new THREE.PointsMaterial({
      size: 0.12, vertexColors: true, transparent: true, opacity: 0.55
    })));

    // Layer B: mid-size "named" stars — fewer, slightly brighter
    const NB = isMobile ? 160 : 500;
    const posB = new Float32Array(NB * 3);
    const colB = new Float32Array(NB * 3);
    const starBPositions = [];
    for (let i = 0; i < NB; i++) {
      const r = 180 + Math.random() * 400;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      const x = r * Math.sin(ph) * Math.cos(th);
      const y = r * Math.cos(ph);
      const z = r * Math.sin(ph) * Math.sin(th);
      posB[i*3] = x; posB[i*3+1] = y; posB[i*3+2] = z;
      starBPositions.push(new THREE.Vector3(x, y, z));
      const t = Math.random();
      colB[i*3]   = 0.70 + t * 0.25;
      colB[i*3+1] = 0.72 + t * 0.05;
      colB[i*3+2] = 0.90 - t * 0.40;
    }
    const gB = new THREE.BufferGeometry();
    gB.setAttribute('position', new THREE.BufferAttribute(posB, 3));
    gB.setAttribute('color',    new THREE.BufferAttribute(colB, 3));
    const matB = new THREE.PointsMaterial({
      size: 0.38, vertexColors: true, transparent: true, opacity: 0.80
    });
    scene.add(new THREE.Points(gB, matB));
    scene.userData.starMatB = matB; // picked up in animate for twinkle

    // Layer C: handful of bright accent stars — very sparse
    const NC = isMobile ? 25 : 60;
    const posC = new Float32Array(NC * 3);
    const colC = new Float32Array(NC * 3);
    for (let i = 0; i < NC; i++) {
      const r = 160 + Math.random() * 300;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      posC[i*3]   = r * Math.sin(ph) * Math.cos(th);
      posC[i*3+1] = r * Math.cos(ph);
      posC[i*3+2] = r * Math.sin(ph) * Math.sin(th);
      const t = Math.random();
      colC[i*3]   = 0.85 + t * 0.15;
      colC[i*3+1] = 0.88;
      colC[i*3+2] = 0.95 - t * 0.30;
    }
    const gC = new THREE.BufferGeometry();
    gC.setAttribute('position', new THREE.BufferAttribute(posC, 3));
    gC.setAttribute('color',    new THREE.BufferAttribute(colC, 3));
    const matC = new THREE.PointsMaterial({
      size: 0.65, vertexColors: true, transparent: true, opacity: 0.90
    });
    scene.add(new THREE.Points(gC, matC));
    scene.userData.starMatC = matC; // second twinkle phase

    // Constellation lines — connect layer-B nearest neighbours
    if (!isMobile) {
      const linePts = [];
      const THRESH = 90;
      for (let i = 0; i < NB; i++) {
        let best = -1, bestD = THRESH;
        for (let j = i + 1; j < NB; j++) {
          const d = starBPositions[i].distanceTo(starBPositions[j]);
          if (d < bestD) { bestD = d; best = j; }
        }
        if (best >= 0) {
          linePts.push(
            starBPositions[i].x,    starBPositions[i].y,    starBPositions[i].z,
            starBPositions[best].x, starBPositions[best].y, starBPositions[best].z
          );
        }
      }
      const lgeo = new THREE.BufferGeometry();
      lgeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(linePts), 3));
      scene.add(new THREE.LineSegments(lgeo, new THREE.LineBasicMaterial({
        color: 0x99aadd, transparent: true, opacity: 0.14
      })));
    }
  })();

  /* ── Central glow (lab nucleus) ── */
  (function buildNucleus() {
    // Core attractor glow sphere
    const g = new THREE.SphereGeometry(0.35, 32, 32);
    const m = new THREE.MeshStandardMaterial({
      color: 0xFFFFFF, emissive: 0xFF8844, emissiveIntensity: 2,
      metalness: 0, roughness: 0.1, transparent: true, opacity: 0.9
    });
    scene.add(new THREE.Mesh(g, m));

    // Outer diffuse ring
    const rg = new THREE.RingGeometry(0.5, 1.2, 64);
    const rm = new THREE.MeshBasicMaterial({ color: 0xFF6B00, transparent: true, opacity: 0.06, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(rg, rm);
    ring.userData.isNucleusRing = true;
    scene.add(ring);
  })();

  /* ═══════════════════════════════════════════════════════════
     SPACETIME MANIFOLD BACKGROUND
     ────────────────────────────────────────────────────────
     A large quad rendered at depth behind everything.
     The GLSL fragment shader implements:

     1. SCHWARZSCHILD CURVATURE — grid lines bend toward each
        mass source using the weak-field metric approximation:
        deflection ∝ GM/rc² (represented by mass strength)
        sampled over up to 8 attractor positions passed as uniforms.

     2. LORENTZ CONTRACTION STREAKS — along the "velocity" axis
        of orbiting bodies a slight length-contraction smear
        in the grid spacing illustrates SR.

     3. GRAVITATIONAL REDSHIFT — grid colour shifts from blue/violet
        in flat space toward warm amber/red near each mass,
        matching the GR prediction that photons lose energy
        climbing out of a gravity well.

     4. LIGHT CONE GLOW — a subtle radiating cone pattern at
        each attractor, visualising the forward/backward light
        cone of an event at that point.

     5. SPACETIME RIPPLE — low-frequency waves radiate outward
        from each mass source (linearised gravitational waves
        from a non-stationary mass distribution).
  ═══════════════════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════════════════
     THE OMNI-MANIFOLD (360° Infinite Dimensional Space)
     ────────────────────────────────────────────────────────
     Replaces the flat floor with a massive inside-out sphere.
     A Raymarching fragment shader calculates infinite 
     folded fractal topology (Gyroid) to simulate shifting 
     higher-dimensional spacetime geometry.
  ═══════════════════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════════════════
     THE OMNI-MANIFOLD (Elegant, Visible Deep Space)
  ═══════════════════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════════════════
     THE OMNI-MANIFOLD (Elegant, Visible Deep Space)
  ═══════════════════════════════════════════════════════════ */
  // (function buildOmniManifold() {
  //   const stGeo = new THREE.SphereGeometry(250, 64, 64);

  //   const stMat = new THREE.ShaderMaterial({
  //     uniforms: {
  //       time: { value: 0 },
  //       resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
  //     },
  //     side: THREE.BackSide,
  //     depthWrite: false,

  //     vertexShader: `
  //       varying vec3 vWorldPos;
  //       void main() {
  //         vec4 wp = modelMatrix * vec4(position, 1.0);
  //         vWorldPos = wp.xyz;
  //         gl_Position = projectionMatrix * viewMatrix * wp;
  //       }
  //     `,

  //     fragmentShader: `
  //       precision highp float;
  //       varying vec3 vWorldPos;
  //       uniform float time;

  //       mat2 rot(float a) {
  //           float s = sin(a), c = cos(a);
  //           return mat2(c, -s, s, c);
  //       }

  //       void main() {
  //           vec3 rd = normalize(vWorldPos);
  //           vec3 ro = vec3(0.0, 0.0, time * 0.2); // Slower, graceful drift

  //           float t = 0.0, d = 0.0, glow = 0.0;
  //           vec3 p;

  //           for(int i = 0; i < 40; i++) {
  //               p = ro + rd * t;
  //               p.xy *= rot(t * 0.015);
  //               p.xz *= rot(time * 0.04);
                
  //               // Elegant, sweeping cosmic folds
  //               d = abs(dot(sin(p * 1.2), cos(p.zxy * 1.2))) * 0.5 - 0.08;
                
  //               glow += 0.006 / (0.01 + d * d); // Boosted glow thickness
  //               t += d * 0.8;
  //               if(t > 40.0 || d < 0.002) break;
  //           }

  //           // Cinematic Palette: Deep Void to Bioluminescent Cobalt
  //           vec3 voidColor = vec3(0.008, 0.012, 0.02); // Lighter deep space
  //           vec3 dustBlue  = vec3(0.05, 0.15, 0.35);   // Brighter blue
  //           vec3 deepPlum  = vec3(0.1, 0.02, 0.15);    // Brighter plum

  //           vec3 fogColor = mix(dustBlue, deepPlum, sin(p.z * 0.3 + time * 0.5) * 0.5 + 0.5);
            
  //           // Increased the glow multiplier from 0.04 to 0.1 for high visibility
  //           vec3 col = voidColor + fogColor * glow * 0.1;
            
  //           // Subtle stardust noise
  //           float star = fract(sin(dot(rd.xy, vec2(12.9898, 78.233))) * 43758.5453);
  //           col += vec3(0.8, 0.9, 1.0) * smoothstep(0.995, 1.0, star) * 0.4;

  //           col *= exp(-t * 0.035); // Pushed fog further back

  //           gl_FragColor = vec4(col, 1.0);
  //       }
  //     `
  //   });

  //   const stMesh = new THREE.Mesh(stGeo, stMat);
  //   stMesh.renderOrder = -100;
  //   scene.add(stMesh);
  //   scene.userData.stManifold = { mat: stMat };
  // })();

// /* ═══════════════════════════════════════════════════════════
//      CYBER-GRID HOLOGRAPHIC MANIFOLD
//   ═══════════════════════════════════════════════════════════ */
//   (function buildCyberGrid() {
//     const stGeo = new THREE.SphereGeometry(250, 64, 64);
//     const stMat = new THREE.ShaderMaterial({
//       uniforms: {
//         time: { value: 0 }
//       },
//       side: THREE.BackSide,
//       depthWrite: false,
//       vertexShader: `
//         varying vec3 vWorldPos;
//         void main() {
//           vec4 wp = modelMatrix * vec4(position, 1.0);
//           vWorldPos = wp.xyz;
//           gl_Position = projectionMatrix * viewMatrix * wp;
//         }
//       `,
//       fragmentShader: `
//         precision highp float;
//         varying vec3 vWorldPos;
//         uniform float time;

//         void main() {
//             vec3 rd = normalize(vWorldPos);
//             vec3 col = vec3(0.012, 0.015, 0.022); // Deep Void Space background

//             // Raytrace mathematical infinite grid planes (top and bottom)
//             float h = 25.0; // Distance of the grid planes
//             float tBottom = (-h) / (rd.y - 0.0001);
//             float tTop    = ( h) / (rd.y + 0.0001);
//             float t = rd.y < 0.0 ? tBottom : tTop;

//             if (t > 0.0 && t < 300.0) {
//                 vec3 p = rd * t;
//                 p.x += time * 1.5; // Steady pan forward
//                 p.z -= time * 1.0;

//                 // Engineering Sub-grid (minor lines)
//                 vec2 grid = abs(fract(p.xz * 0.1) - 0.5);
//                 float line = smoothstep(0.04, 0.0, min(grid.x, grid.y));

//                 // Major Grid (10x wider spacing)
//                 vec2 majorGrid = abs(fract(p.xz * 0.01) - 0.5);
//                 float majorLine = smoothstep(0.015, 0.0, min(majorGrid.x, majorGrid.y));

//                 // Tech Colors
//                 vec3 gridColor = vec3(0.05, 0.18, 0.35); // Engineering Blue
//                 vec3 majorColor = vec3(1.0, 0.42, 0.0);  // Atlas Orange

//                 // Compose the lines
//                 float glow = line * 0.35 + majorLine * 1.5;
//                 vec3 c = mix(gridColor, majorColor, majorLine);

//                 // Data packet pulses running rapidly along the major lines
//                 float dataFlowX = step(0.95, fract(p.x * 0.02 + time * 0.8)) * step(0.98, fract(p.z * 0.01));
//                 float dataFlowZ = step(0.95, fract(p.z * 0.02 - time * 0.9)) * step(0.98, fract(p.x * 0.01));
//                 col += (dataFlowX + dataFlowZ) * vec3(0.0, 0.8, 1.0) * majorLine * 2.5;

//                 // Distance fog fade-out
//                 float fade = exp(-t * 0.007);
//                 col += c * glow * fade;
//             }

//             // Orbital Horizon / Equator HUD glow
//             float equator = smoothstep(0.04, 0.0, abs(rd.y));
//             col += vec3(0.1, 0.25, 0.5) * equator * 0.2;

//             // Stardust noise overlay (subtle static field)
//             float star = fract(sin(dot(rd.xy, vec2(12.9898, 78.233))) * 43758.5453);
//             col += vec3(0.5, 0.7, 1.0) * smoothstep(0.995, 1.0, star) * 0.4;

//             gl_FragColor = vec4(col, 1.0);
//         }
//       `
//     });

//     const stMesh = new THREE.Mesh(stGeo, stMat);
//     stMesh.renderOrder = -100;
//     scene.add(stMesh);
//     scene.userData.stManifold = { mat: stMat };
//   })();

/* ═══════════════════════════════════════════════════════════
     DEEP SPACE SKYBOX — faint stars, nebula wisps, galactic band
  ═══════════════════════════════════════════════════════════ */
  (function buildGalaxyManifold() {
    const stGeo = new THREE.SphereGeometry(4000, 64, 64);
    const stMat = new THREE.ShaderMaterial({
      uniforms: { time: { value: 0 } },
      side: THREE.BackSide, depthWrite: false,
      vertexShader: `
        varying vec3 vWorldPos;
        void main() {
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vWorldPos = wp.xyz;
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,
      fragmentShader: `
        precision highp float;
        varying vec3 vWorldPos;
        uniform float time;

        // 3-D hash — uniform distribution, no pole artefacts
        float hash3(vec3 p) {
          p = fract(p * vec3(443.897, 441.423, 437.195));
          p += dot(p, p.yxz + 19.19);
          return fract(p.x * p.y * p.z);
        }

        float noise3(vec3 p) {
          vec3 i = floor(p); vec3 f = fract(p);
          f = f*f*(3.0-2.0*f);
          return mix(
            mix(mix(hash3(i),             hash3(i+vec3(1,0,0)),f.x),
                mix(hash3(i+vec3(0,1,0)), hash3(i+vec3(1,1,0)),f.x), f.y),
            mix(mix(hash3(i+vec3(0,0,1)), hash3(i+vec3(1,0,1)),f.x),
                mix(hash3(i+vec3(0,1,1)), hash3(i+vec3(1,1,1)),f.x), f.y), f.z);
        }

        float fbm(vec3 p) {
          float v=0.0, a=0.5;
          for(int i=0;i<5;i++){v+=a*noise3(p);p*=2.01;a*=0.5;}
          return v;
        }

        void main() {
          vec3 rd = normalize(vWorldPos);

          // Very slow majestic sky rotation
          float s = sin(time * 0.004), c = cos(time * 0.004);
          rd.xz = mat2(c,-s,s,c) * rd.xz;

          // ── Deep void base — slightly lighter so nebula reads ──
          vec3 col = vec3(0.006, 0.010, 0.018);

          // ── Layer 1: micro-star dust ──
          float h1 = hash3(rd * 500.0);
          col += vec3(0.60, 0.70, 0.95) * smoothstep(0.988, 1.0, h1) * 0.50;

          // ── Layer 2: mid stars — gentle twinkle ──
          float h2 = hash3(rd * 220.0 + 7.3);
          if (h2 > 0.992) {
            float twinkle = 0.82 + 0.18 * sin(time * 0.9 + h2 * 80.0);
            float brightness = smoothstep(0.992, 1.0, h2) * twinkle;
            float ct = hash3(rd * 220.0 + 13.7);
            vec3 starCol = mix(vec3(0.75,0.85,1.0), vec3(1.0,0.88,0.70), ct);
            col += starCol * brightness * 0.65;
          }

          // ── Layer 3: sparse bright stars ──
          float h3 = hash3(rd * 90.0 + 41.0);
          if (h3 > 0.997) {
            float twinkle2 = 0.80 + 0.20 * sin(time * 0.55 + h3 * 60.0);
            col += vec3(0.95, 0.97, 1.0) * twinkle2 * 0.90;
          }

          // ── Galactic band — warm dusty haze ──
          float band = exp(-pow(rd.y * 2.8, 2.0));
          float galNoise = fbm(rd * 3.0 + vec3(0.0, 0.0, time * 0.003));
          col += vec3(0.18, 0.09, 0.04) * band * galNoise * 0.70;
          // blue arm
          float arm = exp(-pow((rd.y - 0.18) * 4.5, 2.0));
          col += vec3(0.02, 0.07, 0.22) * arm * fbm(rd * 5.0) * 0.50;

          // ── Nebula wisps — three distinct clouds, clearly visible ──
          float n1 = fbm(rd * 2.2 + vec3(time * 0.006, 0.0, 0.0));
          float n2 = fbm(rd * 3.8 - vec3(0.0, time * 0.005, time * 0.004));
          float n3 = fbm(rd * 2.8 + vec3(3.7, time * 0.004, 1.2));
          // blue-violet emission nebula
          col += vec3(0.03, 0.12, 0.38) * smoothstep(0.45, 0.68, n1) * 0.85;
          // magenta reflection cloud
          col += vec3(0.18, 0.03, 0.22) * smoothstep(0.48, 0.72, n2) * 0.65;
          // teal cloud
          col += vec3(0.02, 0.16, 0.20) * smoothstep(0.47, 0.70, n3) * 0.50;

          // Clamp to keep it atmospheric, not blown-out
          col = min(col, vec3(0.55));

          gl_FragColor = vec4(col, 1.0);
        }
      `
    });
    const stMesh = new THREE.Mesh(stGeo, stMat);
    stMesh.renderOrder = -100;
    scene.add(stMesh);
    scene.userData.skyMat = stMat; // ticked in animate loop
  })();

  /* ── HUD counter ── */
  document.getElementById('hud-core').textContent = CORE_MEMBERS.length;
  document.getElementById('hud-orb').textContent  = SUPPORTED_MEMBERS.length;

  /* ═══════════════════════════════════════════════════════════
     CORE MEMBER SPHERES
  ═══════════════════════════════════════════════════════════ */

  // Distribute core members in a gentle 3D arrangement
  // Using a golden-ratio spherical layout for even spacing
  const corePositions = [];
  const N_CORE = CORE_MEMBERS.length;
  // Scale formation radius with screen — wider screens get more spread
  const SCENE_SCALE = isMobile ? 1.2 : Math.max(1.6, Math.min(2.4, window.innerWidth / 1000));
  const CORE_ORBIT_R = Math.max(9.0, N_CORE * 2.2) * SCENE_SCALE;

  if (N_CORE === 1) {
    corePositions.push(new THREE.Vector3(0, 0, 0));
  } else {
    // Distribute on a slightly flattened sphere shell
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < N_CORE; i++) {
      const t = i / (N_CORE - 1);
      const inclination = Math.acos(1 - 2 * t) - Math.PI / 2;
      const azimuth = goldenAngle * i;
      const flattenY = 0.4; // flatten the vertical spread
      corePositions.push(new THREE.Vector3(
        CORE_ORBIT_R * Math.cos(inclination) * Math.cos(azimuth),
        CORE_ORBIT_R * flattenY * Math.sin(inclination),
        CORE_ORBIT_R * Math.cos(inclination) * Math.sin(azimuth)
      ));
    }
  }

  const coreObjects = []; // { mesh, glowRing, outerRing, sprite, pos, member }

  // Shared geometries for core nodes
  const coreGeoHi = new THREE.SphereGeometry(0.95 * SCENE_SCALE, 64, 64);
  const coreGeoLo = new THREE.SphereGeometry(0.95 * SCENE_SCALE, 24, 24);

  CORE_MEMBERS.forEach((m, i) => {
    const pos = corePositions[i];
    const col = 0xFF6B00; // Orange strictly for Core Operators

/* ── Phase 2: Singularity & 4D Tesseract Fold ── */
    const coreGroup = new THREE.Group();
    coreGroup.position.copy(pos);
    coreGroup.userData = { type: 'core', member: m, idx: i };
    
    // 1. Event Horizon (Glowing Shell) - Boosted Opacity
    const shellMat = new THREE.MeshBasicMaterial({ 
        color: col, transparent: true, opacity: 0.35, // Was 0.15
        blending: THREE.AdditiveBlending, depthWrite: false 
    });
    const shell = new THREE.Mesh(new THREE.SphereGeometry(1.05 * SCENE_SCALE, 32, 32), shellMat);
    coreGroup.add(shell);

    // 2. The Dark Singularity (Absolute Black Core)
    const blackMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const singularity = new THREE.Mesh(new THREE.SphereGeometry(0.5 * SCENE_SCALE, 32, 32), blackMat);
    coreGroup.add(singularity);

    // 3. The 4D Fold (Intersecting Geometry) - Boosted Wireframe visibility
    const wireGeo = new THREE.IcosahedronGeometry(0.8 * SCENE_SCALE, 1);
    const wireMat = new THREE.MeshBasicMaterial({ 
        color: col, wireframe: true, transparent: true, opacity: 0.85, // Was 0.4
        blending: THREE.AdditiveBlending, depthWrite: false 
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    const wireMesh2 = new THREE.Mesh(wireGeo, wireMat);
    wireMesh2.scale.set(0.7, 0.7, 0.7);
    coreGroup.add(wireMesh);
    coreGroup.add(wireMesh2);

    // 4. NEW: Add a physical light inside each core to illuminate the background/smoke
    const coreLight = new THREE.PointLight(col, 2.5, 8 * SCENE_SCALE);
    coreGroup.add(coreLight);

    formationGroup.add(coreGroup);

    /* Spoke line to origin */
    const spokeGeom = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), pos]);
    const spokeMat = new THREE.LineBasicMaterial({ color: col, transparent: true, opacity: 0.08 });
    formationGroup.add(new THREE.Line(spokeGeom, spokeMat));

    /* Canvas sprite */
    const sprite = makeSprite(m.initials, m.name, m.role.split('/')[0].trim(), col, true);
    // [INCREASED]: Lifted higher to match new sphere sizes
    sprite.position.copy(pos).add(new THREE.Vector3(0, 1.85 * SCENE_SCALE, 0));
    // [INCREASED]: Bigger labels
    const coreScale = isMobile ? 1.6 : Math.max(1.8, Math.min(2.6, window.innerWidth / 900));
    sprite.scale.set(coreScale * 1.6, coreScale * 0.72, 1);
    sprite.userData = { baseScaleX: coreScale * 1.6, baseScaleY: coreScale * 0.72, isCore: true };
    formationGroup.add(sprite);

    // We store the group as `mesh` so raycasting and camera targeting still works perfectly
    coreObjects.push({ mesh: coreGroup, wire1: wireMesh, wire2: wireMesh2, sprite, pos, member: m });
  });

  /* ═══════════════════════════════════════════════════════════
     SUPPORTED MEMBERS — KEPLERIAN ORBITS
  ═══════════════════════════════════════════════════════════ */

  const suppObjects = []; // { mesh, sprite, orb, anchorPos, member }

  const suppGeoHi = new THREE.SphereGeometry(0.38 * SCENE_SCALE, 24, 24);
  const suppGeoLo = new THREE.SphereGeometry(0.38 * SCENE_SCALE, 12, 12);

  SUPPORTED_MEMBERS.forEach((s, i) => {
    const anchorIdx = CORE_MEMBERS.findIndex(c => c.id === s.anchor);
    const anchorPos = corePositions[anchorIdx] || corePositions[0];
    const col = 0x4499DD; // Blue strictly for Orbiting Members
    const orb = buildOrbitalParams(s, SCENE_SCALE);

/* ── Phase 2: Quantum Probability Cloud ── */
    const nParticles = isMobile ? 80 : 200;
    const cloudGeo = new THREE.BufferGeometry();
    const cPos = new Float32Array(nParticles * 3);
    
    // Distribute particles in a sphere
    for(let j=0; j<nParticles; j++) {
       const u = Math.random(), v = Math.random();
       const theta = u * 2.0 * Math.PI;
       const phi = Math.acos(2.0 * v - 1.0);
       const r = Math.cbrt(Math.random()) * (0.38 * SCENE_SCALE);
       cPos[j*3]   = r * Math.sin(phi) * Math.cos(theta);
       cPos[j*3+1] = r * Math.sin(phi) * Math.sin(theta);
       cPos[j*3+2] = r * Math.cos(phi);
    }
    
    cloudGeo.setAttribute('position', new THREE.BufferAttribute(cPos, 3));
    // We duplicate position into 'basePos' so the shader knows their resting state
    cloudGeo.setAttribute('basePos', new THREE.BufferAttribute(new Float32Array(cPos), 3));

    // Custom shader to make them swarm/vibrate on the GPU
// Custom shader to make them swarm/vibrate on the GPU
    const cloudMat = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 },
            color: { value: new THREE.Color(col) }
        },
        vertexShader: `
            uniform float time;
            attribute vec3 basePos;
            void main() {
                vec3 p = basePos;
                p.x += sin(time * 3.0 + basePos.y * 20.0) * 0.04;
                p.y += cos(time * 4.0 + basePos.z * 20.0) * 0.04;
                p.z += sin(time * 5.0 + basePos.x * 20.0) * 0.04;
                
                vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
                gl_Position = projectionMatrix * mvPosition;
                gl_PointSize = (100.0 / -mvPosition.z); // Was 60.0 (Bigger particles)
            }
        `,
        fragmentShader: `
            uniform vec3 color;
            void main() {
                float dist = length(gl_PointCoord - vec2(0.5));
                if (dist > 0.5) discard;
                // Boosted alpha from 0.6 to 1.5 to force a strong glow
                float alpha = smoothstep(0.5, 0.05, dist) * 1.5; 
                gl_FragColor = vec4(color, alpha);
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    // The Points object acts as the container mesh
    const mesh = new THREE.Points(cloudGeo, cloudMat);
    mesh.userData = { type: 'supported', member: s, idx: i };
    formationGroup.add(mesh);

    /* Orbit ellipse ghost line */
    const orbitPts = orbitWorldPoints(orb, anchorPos.x, anchorPos.y, anchorPos.z);
    orbitPts.push(orbitPts[0]); // close loop
    const orbitGeom = new THREE.BufferGeometry().setFromPoints(orbitPts);
    const orbitMat = new THREE.LineBasicMaterial({ 
        color: col, 
        transparent: true, 
        opacity: 0.35, // Increased from 0.1
        blending: THREE.AdditiveBlending // Makes the lines glow when they overlap
    });
    const orbitLine = new THREE.Line(orbitGeom, orbitMat);
    formationGroup.add(orbitLine);

    /* Label sprite */
/* Label sprite */
    const sprite = makeSprite(s.initials, s.name, s.role, col, false);
    //[INCREASED]: Bigger labels for satellites
    const suppScale = isMobile ? 1.1 : Math.max(1.2, Math.min(1.7, window.innerWidth / 1200));
    sprite.scale.set(suppScale * 1.5, suppScale * 0.72, 1);
    sprite.userData.baseScaleX = suppScale * 1.5;
    sprite.userData.baseScaleY = suppScale * 0.72;
    sprite.userData.isCore = false;
    formationGroup.add(sprite);

    suppObjects.push({ mesh, sprite, orbitLine, orb, anchorPos, member: s });
  });

/* ═══════════════════════════════════════════════════════════
     SPRITE FACTORY (Sleek UI, High Legibility)
  ═══════════════════════════════════════════════════════════ */
  function makeSprite(initials, name, subtitle, hexColor, isCore) {
    const px = Math.max(1, Math.min(2, window.innerWidth / 1200)); 
    const W = isCore ? Math.round(240 * px) : Math.round(160 * px);
    const H = isCore ? Math.round(96  * px) : Math.round(64  * px);
    const S = 3; 
    const cw = W * S, ch = H * S;

    const c = document.createElement('canvas');
    c.width = cw; c.height = ch;
    const ctx = c.getContext('2d');
    ctx.scale(S, S);
    ctx.clearRect(0, 0, W, H);

    const hex = '#' + hexColor.toString(16).padStart(6, '0');
    const cut = 12 * px;

    // ── Glass/Dark Panel ─────────────────────────
    ctx.beginPath();
    ctx.moveTo(0, cut); ctx.lineTo(cut, 0); ctx.lineTo(W, 0);
    ctx.lineTo(W, H - cut); ctx.lineTo(W - cut, H); ctx.lineTo(0, H);
    ctx.closePath();

    ctx.fillStyle = 'rgba(4, 5, 10, 0.85)'; // Deep, transparent glass
    ctx.fill();

    ctx.lineWidth = 1.5 * px;
    ctx.strokeStyle = `rgba(255, 255, 255, 0.15)`; // Subtle edge
    ctx.stroke();

    // Domain Color Accents
    ctx.fillStyle = hex;
    ctx.fillRect(cut, 0, W * 0.3, 3 * px); 
    ctx.fillRect(W - cut - W * 0.15, H - 3 * px, W * 0.15, 3 * px); 

    // ── SHARP INITIALS ──────────────────────────
    const fsI = isCore ? Math.round(34 * px) : Math.round(24 * px);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const iy = H * (isCore ? 0.36 : 0.40);

    // Subtle colored glow, sharp white text
    ctx.shadowColor = hex;
    ctx.shadowBlur  = 8 * px; 
    ctx.font = `800 ${fsI}px "Bebas Neue", "Impact", sans-serif`;
    ctx.fillStyle = '#ffffff'; 
    ctx.fillText(initials, W / 2, iy);
    
    ctx.shadowBlur = 0; // Turn off shadow for crisp text
    ctx.fillText(initials, W / 2, iy);

    // ── NAME & ROLE ──────────────────────────────────────────
    if (isCore) {
      const fsN = Math.round(11 * px);
      ctx.font = `500 ${fsN}px "IBM Plex Mono", monospace`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillText(name.substring(0, 24).toUpperCase(), W / 2, H * 0.68);
    }

    const fsS = isCore ? Math.round(8.5 * px) : Math.round(8 * px);
    ctx.font = `500 ${fsS}px "IBM Plex Mono", monospace`;
    ctx.fillStyle = hex;
    ctx.fillText(subtitle.substring(0, 22).toUpperCase(), W / 2, isCore ? H * 0.86 : H * 0.78);

    const tex = new THREE.CanvasTexture(c);
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
    return new THREE.Sprite(mat);
  }

  /* ═══════════════════════════════════════════════════════════
     ORBIT CONTROLS (manual — no dependency)
  ═══════════════════════════════════════════════════════════ */
  let isDragging = false;
  let prevPointer = { x: 0, y: 0 };
  let spherical = { theta: 0, phi: Math.PI / 3, r: CAM_DIST }; // initial camera spherical
  let targetSpherical = { ...spherical };
  let targetLookAt = new THREE.Vector3(0, 0, 0);
  let currentLookAt = new THREE.Vector3(0, 0, 0);
  let isZoomedIn = false;
  let zoomTarget = null; // { pos, member }
  let cameraAnimating = false;

  function applySpherical() {
    const sp = targetSpherical;
    camera.position.set(
      sp.r * Math.sin(sp.phi) * Math.sin(sp.theta) + targetLookAt.x,
      sp.r * Math.cos(sp.phi) + targetLookAt.y,
      sp.r * Math.sin(sp.phi) * Math.cos(sp.theta) + targetLookAt.z
    );
    camera.lookAt(targetLookAt);
  }

  // Mouse
  canvas.addEventListener('mousedown', e => {
    if (e.button !== 0) return;
    isDragging = true;
    prevPointer = { x: e.clientX, y: e.clientY };
  });
  window.addEventListener('mouseup', () => isDragging = false);
  window.addEventListener('mousemove', e => {
    if (!isDragging || isZoomedIn) return;
    const dx = e.clientX - prevPointer.x;
    const dy = e.clientY - prevPointer.y;
    targetSpherical.theta -= dx * 0.005;
    targetSpherical.phi   = Math.max(0.15, Math.min(Math.PI - 0.15, targetSpherical.phi + dy * 0.004));
    prevPointer = { x: e.clientX, y: e.clientY };
  });

  // Scroll zoom
  canvas.addEventListener('wheel', e => {
    if (isZoomedIn) return;
    e.preventDefault();
    targetSpherical.r = Math.max(8, Math.min(80, targetSpherical.r + e.deltaY * 0.04));
  }, { passive: false });

  // Touch
  let lastTouches = [];
  canvas.addEventListener('touchstart', e => { lastTouches = [...e.touches]; }, { passive: true });
  canvas.addEventListener('touchmove', e => {
    if (isZoomedIn) return;
    if (e.touches.length === 1 && lastTouches.length === 1) {
      const dx = e.touches[0].clientX - lastTouches[0].clientX;
      const dy = e.touches[0].clientY - lastTouches[0].clientY;
      targetSpherical.theta -= dx * 0.005;
      targetSpherical.phi   = Math.max(0.15, Math.min(Math.PI - 0.15, targetSpherical.phi + dy * 0.004));
    } else if (e.touches.length === 2 && lastTouches.length === 2) {
      // Pinch zoom
      const dCur  = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      const dPrev = Math.hypot(lastTouches[0].clientX - lastTouches[1].clientX, lastTouches[0].clientY - lastTouches[1].clientY);
      targetSpherical.r = Math.max(8, Math.min(80, targetSpherical.r - (dCur - dPrev) * 0.08));
    }
    lastTouches = [...e.touches];
  }, { passive: true });

  /* ═══════════════════════════════════════════════════════════
     RAYCASTING + CLICK
  ═══════════════════════════════════════════════════════════ */
  const raycaster = new THREE.Raycaster();
  raycaster.params.Points.threshold = 0.2;
  const mouse = new THREE.Vector2(-9999, -9999);
  const hoverHud = document.getElementById('hud-hover');
  const hoverText = document.getElementById('hud-hover-text');

  const allClickable = () => [
    ...coreObjects.map(o => o.mesh),
    ...suppObjects.map(o => o.mesh)
  ];

  canvas.addEventListener('mousemove', e => {
    mouse.x =  (e.clientX / window.innerWidth)  * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  let clickStartPos = { x: 0, y: 0 };
  canvas.addEventListener('mousedown', e => { clickStartPos = { x: e.clientX, y: e.clientY }; });
  canvas.addEventListener('mouseup', e => {
    const dist = Math.hypot(e.clientX - clickStartPos.x, e.clientY - clickStartPos.y);
    if (dist > 6) return; // was a drag, not a click

    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(allClickable(), true); // Added recursive flag
    if (hits.length) {
      let obj = hits[0].object;
      while (obj && !obj.userData.type && obj.parent) obj = obj.parent; // Traverse up to group
      if (obj && obj.userData.type) handleNodeClick(obj);
    } else if (isZoomedIn) {
      resetCamera();
    }
  });

  // Touch tap
  let touchStart = null;
  canvas.addEventListener('touchstart', e => { touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY, t: Date.now() }; }, { passive: true });
  canvas.addEventListener('touchend', e => {
    if (!touchStart) return;
    const dx = e.changedTouches[0].clientX - touchStart.x;
    const dy = e.changedTouches[0].clientY - touchStart.y;
    const dtClick = Date.now() - touchStart.t;
    if (Math.hypot(dx, dy) < 12 && dtClick < 300) {
      const tx = (touchStart.x / window.innerWidth) * 2 - 1;
      const ty = -(touchStart.y / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(new THREE.Vector2(tx, ty), camera);
      const hits = raycaster.intersectObjects(allClickable(), true); // Added recursive flag
      if (hits.length) {
        let obj = hits[0].object;
        while (obj && !obj.userData.type && obj.parent) obj = obj.parent;
        if (obj && obj.userData.type) handleNodeClick(obj);
      }
      else if (isZoomedIn) resetCamera();
    }
    touchStart = null;
  });
  /* ── Node click handler ── */
  function handleNodeClick(obj) {
    const { type, member } = obj.userData;
    const worldPos = new THREE.Vector3();
    obj.getWorldPosition(worldPos);

    zoomTarget = { pos: worldPos.clone(), member, type };
    isZoomedIn = true;
    cameraAnimating = true;

    // Phase 5: zoom distance scaled to current world size of the sphere.
    // formationGroup.scale gives us the effective size multiplier.
    // A core sphere has local radius ~0.95 * SCENE_SCALE; after group scaling
    // its world radius = 0.95 * SCENE_SCALE * formationGroup.scale.x.
    // We want to frame it nicely: zoom_r ≈ world_radius * 8 (feels consistent).
    const groupScale = formationGroup.scale.x;
    const baseRadius = (type === 'core') ? 0.95 * SCENE_SCALE : 0.38 * SCENE_SCALE;
    const worldRadius = baseRadius * groupScale;
    // const zoomRadius = Math.max(4, worldRadius * 8);

    const themeHex = (type === 'core') ? '#FF6B00' : '#4499DD';
    const zoomRadius = Math.max(8, worldRadius * 12); // Pulled slightly back for comfort

    targetLookAt.copy(worldPos);
    targetSpherical.r = zoomRadius;

    spawnShockwave(worldPos, themeHex);

    wormholeMesh.position.copy(worldPos);
    wormholeState.isActive  = true; // Using the fixed keyword!
    wormholeState.phase     = 1;
    wormholeState.time      = 0;
    wormholeState.targetPos = worldPos.clone();
    wormholeMat.uniforms.isActive.value = 1.0;
    wormholeMat.uniforms.color.value.set(themeHex);

    showMemberCard(member, type, themeHex);

    // Show back button
    document.getElementById('btn-back').style.display = 'block';
    document.getElementById('hud-hint').style.opacity = '0';
  }

  window.resetCamera = function () {
    isZoomedIn = false;
    zoomTarget = null;
    targetLookAt.set(0, 0, 0);
    // Restore current responsive camera distance (may have changed since init)
    const { camDist } = calcResponsive(window.innerWidth, window.innerHeight);
    targetSpherical.r = camDist;
    closeMemberCard();
    document.getElementById('btn-back').style.display = 'none';
    document.getElementById('hud-hint').style.opacity = '1';
  };

/* ═══════════════════════════════════════════════════════════
     MEMBER CARD UI
  ═══════════════════════════════════════════════════════════ */
  function showMemberCard(m, type, hex) {
    const isCore = type === 'core';
    const anchor = isCore ? null : CORE_MEMBERS.find(c => c.id === m.anchor);

    // 1. Clean Top Header (No more ML/CFD domains)
    let html = `
      <div style="margin-bottom:16px;">
        <div style="font-family:var(--font-mono);font-size:.62rem;letter-spacing:.18em;text-transform:uppercase;color:${hex};margin-bottom:4px;">${isCore ? 'CORE OPERATOR' : 'CLUB MEMBER'}</div>
        <div style="font-family:var(--font-display);font-size:1.6rem;letter-spacing:.04em;text-transform:uppercase;color:var(--text-primary);line-height:1.05;">${m.name}</div>
        <div style="font-family:var(--font-mono);font-size:.75rem;color:var(--text-secondary);margin-top:2px;">${m.research ? m.research : m.role}</div>
      </div>`;

    if (isCore) {
      // 2. Core Operator Card (Removed Pubs & H-Index)
      html += `
      <div style="background:rgba(0,0,0,0.4);border:1px solid rgba(255,255,255,0.06);border-radius:4px;padding:12px 14px;margin-bottom:14px;">
        <div style="font-family:var(--font-mono);font-size:.6rem;letter-spacing:.14em;color:var(--text-tertiary);margin-bottom:6px;">WHAT THEY DO</div>
        <div style="font-size:.85rem;color:var(--text-primary);line-height:1.55;">${m.research}</div>
      </div>
      <div style="font-size:.85rem;color:var(--text-secondary);line-height:1.65;margin-bottom:14px;">${m.bio}</div>
      <div style="display:flex;gap:24px;margin-bottom:16px;border-top:1px solid var(--border-subtle);padding-top:12px;">
        <div style="margin-left:auto;display:flex;align-items:flex-end;">
          <a href="mailto:${m.email}" class="btn btn--ghost" style="font-size:.7rem;padding:6px 14px;">&#9993; CONTACT</a>
        </div>
      </div>`;
    } else {
      // 3. Orbiting Member Card (Removed Semi-Major Axis, ECC, INCL)
      if (anchor) {
        html += `
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;padding:8px 12px;background:rgba(0,0,0,0.3);border-radius:4px;border-left:2px solid #FF7A00;">
          <div style="font-family:var(--font-mono);font-size:.6rem;color:#FF7A00;letter-spacing:.12em;">ANCHORED TO</div>
          <div style="font-size:.85rem;font-weight:500;">${anchor.name}</div>
        </div>`;
      }
    }

    document.getElementById('card-content').innerHTML = html;
    document.getElementById('member-card-inner').style.borderTopColor = hex;
    document.getElementById('member-card').style.bottom = '24px';
  }

  window.closeMemberCard = function () {
    document.getElementById('member-card').style.bottom = '-500px';
  };

  /* ═══════════════════════════════════════════════════════════
     HOVER DETECT
  ═══════════════════════════════════════════════════════════ */
  let lastHovered = null;
  function checkHover() {
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(allClickable(), true);
    if (hits.length) {
      let obj = hits[0].object;
      while (obj && !obj.userData.type && obj.parent) obj = obj.parent;
      
      if (obj && obj.userData && obj.userData.member) {
        const { member } = obj.userData;
        if (member !== lastHovered) {
          lastHovered = member;
          hoverText.textContent = member.name + ' — ' + member.role;
          hoverHud.style.opacity = '1';
          canvas.style.cursor = 'pointer';
        }
        return;
      }
    }
    if (lastHovered) { lastHovered = null; hoverHud.style.opacity = '0'; }
    canvas.style.cursor = 'default';
  }

  /* ═══════════════════════════════════════════════════════════
     PHASE 3 — SPRITE LEGIBILITY (inverse-scale compensation)
  ═══════════════════════════════════════════════════════════ */
  function updateSpriteScales(groupScale) {
    // Sprites are children of formationGroup, so their visual size in world
    // space is already affected by the group scale.  We apply an inverse
    // compensation so text stays legible: if the group shrinks 40%, sprites
    // grow 40% relative to the group to maintain the same screen footprint.
    // We clamp so they never become comically large or vanishingly small.
    const inv = Math.max(0.7, Math.min(1.6, 1 / groupScale));

    const allSprites = [
      ...coreObjects.map(o => o.sprite),
      ...suppObjects.map(o => o.sprite),
    ];

    allSprites.forEach(sp => {
      const bx = sp.userData.baseScaleX || 1;
      const by = sp.userData.baseScaleY || 1;
      sp.scale.set(bx * inv, by * inv, 1);
    });
  }

  /* ═══════════════════════════════════════════════════════════
     PHASE 4 — RESPONSIVE MANAGER (resize event)
  ═══════════════════════════════════════════════════════════ */
  window.addEventListener('resize', () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const nowMobile = w < 768;

    // 1. Camera aspect + renderer
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);

    // 2. Formation group scale
    const { targetScale, camDist } = calcResponsive(w, h);
    formationGroup.scale.set(targetScale, targetScale, targetScale);

    // 3. Camera distance (only when not zoomed — preserve zoom state)
    if (!isZoomedIn) {
      targetSpherical.r = camDist;
    }

    // 4. Sprite legibility compensation
    updateSpriteScales(targetScale);
  });

  // Apply initial responsive state
  (function applyInitialScale() {
    const { targetScale } = calcResponsive(window.innerWidth, window.innerHeight);
    formationGroup.scale.set(targetScale, targetScale, targetScale);
    updateSpriteScales(targetScale);
  })();

  /* ═══════════════════════════════════════════════════════════════════
     ██████╗ ██╗  ██╗██╗   ██╗███████╗██╗ ██████╗███████╗
     ██╔══██╗██║  ██║╚██╗ ██╔╝██╔════╝██║██╔════╝██╔════╝
     ██████╔╝███████║ ╚████╔╝ ███████╗██║██║     ███████╗
     ██╔═══╝ ██╔══██║  ╚██╔╝  ╚════██║██║██║     ╚════██║
     ██║     ██║  ██║   ██║   ███████║██║╚██████╗███████║
     ╚═╝     ╚═╝  ╚═╝   ╚═╝   ╚══════╝╚═╝ ╚═════╝╚══════╝
     GRAVITATIONAL · PARTICLE · INTERACTION · CINEMATIC
  ═══════════════════════════════════════════════════════════════════ */

  /* ── SHARED SHADER CHUNKS ───────────────────────────────────────── */
  // Lens distortion vertex displacement (used by lensing halo)
  const lensVert = `
    varying vec2 vUv;
    varying vec3 vNormal;
    uniform float time;
    void main(){
      vUv = uv; vNormal = normal;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
    }`;
  const lensFrag = `
    varying vec2 vUv;
    uniform float time;
    uniform vec3 color;
    uniform float opacity;
    void main(){
      vec2 c = vUv - 0.5;
      float r = length(c);
      float ring = smoothstep(0.48,0.42,r) * smoothstep(0.28,0.36,r);
      float shimmer = 0.5 + 0.5*sin(r*40.0 - time*2.0);
      gl_FragColor = vec4(color, ring * shimmer * opacity);
    }`;

  /* ═══════════════════════════════════════════════════════════
     A. GRAVITATIONAL LENSING — halo rings around each core
  ═══════════════════════════════════════════════════════════ */
  const lensObjects =[];
  coreObjects.forEach(obj => {
    const col = new THREE.Color(DOMAIN_COLOR[obj.member.domain] || 0xFF6B00);
    const mat = new THREE.ShaderMaterial({
      uniforms: { time: { value: 0 }, color: { value: col }, opacity: { value: 0.18 } },
      vertexShader: lensVert,
      fragmentShader: lensFrag,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(5.5 * SCENE_SCALE, 5.5 * SCENE_SCALE), mat);
    mesh.renderOrder = -1;
    formationGroup.add(mesh);
    lensObjects.push({ mesh, mat, coreObj: obj });
  });

/* ═══════════════════════════════════════════════════════════
     B. DARK MATTER HALO — shimmering refractive sphere per core
  ═══════════════════════════════════════════════════════════ */
  const haloObjects =[];
  coreObjects.forEach(obj => {
    const col = new THREE.Color(DOMAIN_COLOR[obj.member.domain] || 0xFF6B00);
    const haloMat = new THREE.ShaderMaterial({
      uniforms: {
        time:  { value: 0 },
        color: { value: col },
      },
      vertexShader: `
        varying vec3 vNorm;
        varying vec3 vPos;
        void main(){
          vNorm = normalize(normalMatrix * normal);
          vPos  = (modelViewMatrix * vec4(position,1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
        }`,
      fragmentShader: `
        varying vec3 vNorm;
        varying vec3 vPos;
        uniform vec3 color;
        uniform float time;
        void main(){
          float fres = pow(1.0 - abs(dot(vNorm, normalize(-vPos))), 3.5);
          float shimmer = 0.5 + 0.5*sin(vPos.x*8.0 + vPos.y*6.0 + time*0.7);
          gl_FragColor = vec4(color, fres * shimmer * 0.3);
        }`,
      transparent: true,
      depthWrite: false,
      side: THREE.BackSide,
    });
    const halo = new THREE.Mesh(
      new THREE.SphereGeometry(2.8 * SCENE_SCALE, 32, 32),
      haloMat
    );
    formationGroup.add(halo);
    haloObjects.push({ halo, mat: haloMat, coreObj: obj });
  });

  /* ═══════════════════════════════════════════════════════════
     C. LAGRANGE POINT GHOSTS
     L4 / L5 of each adjacent core pair (±60° offset along midpoint)
  ═══════════════════════════════════════════════════════════ */
  const lagrangeGhosts = [];
  (function buildLagrange() {
    const N = coreObjects.length;
    for (let a = 0; a < N; a++) {
      for (let b = a + 1; b < N; b++) {
        const pA = corePositions[a];
        const pB = corePositions[b];
        const dist = pA.distanceTo(pB);
        if (dist > CORE_ORBIT_R * 1.6) continue; // skip very far pairs
        // L4 & L5 form equilateral triangles with pA, pB
        const mid    = pA.clone().add(pB).multiplyScalar(0.5);
        const arm    = pA.clone().sub(pB);
        const perp   = new THREE.Vector3(-arm.z, arm.y, arm.x).normalize().multiplyScalar(dist * 0.866);
        [perp, perp.clone().negate()].forEach((offset, li) => {
          const ghostPos = mid.clone().add(offset);
          const mat = new THREE.MeshBasicMaterial({
            color: 0xaaaacc, transparent: true, opacity: 0.0,
          });
          const ghost = new THREE.Mesh(
            new THREE.SphereGeometry(0.12 * SCENE_SCALE, 8, 8),
            mat
          );
          ghost.position.copy(ghostPos);
          formationGroup.add(ghost);
          lagrangeGhosts.push({
            ghost, mat,
            basePos: ghostPos.clone(),
            driftPhase: Math.random() * Math.PI * 2,
            pairA: a, pairB: b,
          });
        });
      }
    }
  })();

  /* ═══════════════════════════════════════════════════════════
     D. ACCRETION DISK — nucleus particle swirl
  ═══════════════════════════════════════════════════════════ */
  const ACCRETION_N = isMobile ? 600 : 1800;
  const accretionPos   = new Float32Array(ACCRETION_N * 3);
  const accretionColor = new Float32Array(ACCRETION_N * 3);
  const accretionData  = []; // per-particle { angle, radius, speed, y }
  (function buildAccretion() {
    for (let i = 0; i < ACCRETION_N; i++) {
      const angle  = Math.random() * Math.PI * 2;
      const radius = 0.8 + Math.random() * 1.8;
      const speed  = 0.4 + 1.2 / radius + Math.random() * 0.2;
      const yOff   = (Math.random() - 0.5) * 0.18;
      accretionData.push({ angle, radius, speed, yOff });
      // warm hot-disk palette: white → orange → red
      const t = Math.pow(1 - (radius - 0.8) / 1.8, 2);
      accretionColor[i*3]   = 1.0;
      accretionColor[i*3+1] = 0.4 + t * 0.5;
      accretionColor[i*3+2] = t * 0.4;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(accretionPos, 3));
    g.setAttribute('color',    new THREE.BufferAttribute(accretionColor, 3));
    const pts = new THREE.Points(g, new THREE.PointsMaterial({
      size: isMobile ? 0.05 : 0.04,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      depthWrite: false,
    }));
    scene.add(pts);
    scene.userData.accretionPts = pts;
    scene.userData.accretionPos = accretionPos;
  })();

  /* ═══════════════════════════════════════════════════════════
     E. SOLAR WIND STREAMS — per-core outward spiral particles
  ═══════════════════════════════════════════════════════════ */
  const WIND_N_PER_CORE = isMobile ? 80 : 200;
  const solarWindSystems = [];
  coreObjects.forEach((obj, ci) => {
    const N = WIND_N_PER_CORE;
    const pos   = new Float32Array(N * 3);
    const alpha = new Float32Array(N);
    const data  = [];
    const col   = DOMAIN_COLOR[obj.member.domain];
    const r = (col >> 16 & 0xff) / 255;
    const g = (col >>  8 & 0xff) / 255;
    const b = (col       & 0xff) / 255;
    const cols = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const ang   = Math.random() * Math.PI * 2;
      const life  = Math.random();
      const speed = 1.5 + Math.random() * 1.5;
      const spiralRate = 0.6 + Math.random() * 0.8;
      data.push({ ang, life, speed, spiralRate, phase: Math.random() * Math.PI * 2 });
      cols[i*3]=r; cols[i*3+1]=g; cols[i*3+2]=b;
    }
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(pos,  3));
    geom.setAttribute('color',    new THREE.BufferAttribute(cols, 3));
    const pts = new THREE.Points(geom, new THREE.PointsMaterial({
      size: 0.06, vertexColors: true, transparent: true, opacity: 0.5, depthWrite: false,
    }));
    scene.add(pts);
    solarWindSystems.push({ pts, pos, data, geom, coreObj: obj });
  });

  /* ═══════════════════════════════════════════════════════════
     F. ION TRAILS — satellite exhaust history ring buffer
  ═══════════════════════════════════════════════════════════ */
  const ION_HISTORY = 40;
  const ionTrailSystems = [];
  suppObjects.forEach(obj => {
    const positions = new Float32Array(ION_HISTORY * 3);
    const colors    = new Float32Array(ION_HISTORY * 3);
    const history   = [];
    const col       = DOMAIN_COLOR[obj.member.domain];
    const r = (col >> 16 & 0xff) / 255;
    const g = (col >>  8 & 0xff) / 255;
    const b = (col       & 0xff) / 255;
    for (let i = 0; i < ION_HISTORY; i++) {
      history.push(new THREE.Vector3(0, -9999, 0)); // off-screen initially
      colors[i*3]=r; colors[i*3+1]=g; colors[i*3+2]=b;
    }
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geom.setAttribute('color',    new THREE.BufferAttribute(colors, 3));
    const pts = new THREE.Points(geom, new THREE.PointsMaterial({
      size: 0.09, vertexColors: true, transparent: true,
      opacity: 0.6, depthWrite: false, sizeAttenuation: true,
    }));
    scene.add(pts);
    ionTrailSystems.push({ pts, positions, history, geom, suppObj: obj, head: 0 });
  });

  /* ═══════════════════════════════════════════════════════════
     G. PLASMA BRIDGES — random arcing tendrils between close nodes
  ═══════════════════════════════════════════════════════════ */
  const MAX_PLASMA = isMobile ? 2 : 4;
  const plasmaPool  = [];
  const PLASMA_SEGS = 24;
  for (let p = 0; p < MAX_PLASMA; p++) {
    const pts = new Float32Array((PLASMA_SEGS + 1) * 3);
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(pts, 3));
    const mat = new THREE.LineBasicMaterial({ color: 0xaaddff, transparent: true, opacity: 0.0 });
    const line = new THREE.Line(geom, mat);
    line.renderOrder = 2;
    scene.add(line);
    plasmaPool.push({
      line, pts, mat,
      life: 0, maxLife: 0,
      srcObj: null, dstObj: null,
      nextSpawn: Math.random() * 5,
    });
  }
  let plasmaTimer = 0;

  /* ═══════════════════════════════════════════════════════════
     H. ORBITAL RESONANCE RINGS — interference between harmonic pairs
  ═══════════════════════════════════════════════════════════ */
  const resonancePairs = [];
  (function detectResonance() {
    const harmonics = [[2,1],[3,2],[4,3]];
    for (let a = 0; a < suppObjects.length; a++) {
      for (let b = a + 1; b < suppObjects.length; b++) {
        const pa = SUPPORTED_MEMBERS[a].period;
        const pb = SUPPORTED_MEMBERS[b].period;
        const ratio = pa > pb ? pa / pb : pb / pa;
        const matched = harmonics.some(([n,d]) => Math.abs(ratio - n/d) < 0.12);
        if (!matched) continue;
        // Build ring midpoint line
        const midPts = new Float32Array(64 * 3);
        const geom = new THREE.BufferGeometry();
        geom.setAttribute('position', new THREE.BufferAttribute(midPts, 3));
        const col = DOMAIN_COLOR[SUPPORTED_MEMBERS[a].domain] || 0xffffff;
        const mat = new THREE.LineBasicMaterial({ color: col, transparent: true, opacity: 0.0 });
        const ring = new THREE.Line(geom, mat);
        scene.add(ring);
        resonancePairs.push({ ring, mat, midPts, geom, a, b, phase: Math.random() * Math.PI * 2 });
      }
    }
  })();

/* ═══════════════════════════════════════════════════════════
     I. SHOCKWAVE POOL — click ripples
  ═══════════════════════════════════════════════════════════ */
  const shockwavePool =[];
  const MAX_SHOCKWAVES = 4;
  for (let s = 0; s < MAX_SHOCKWAVES; s++) {
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        time:     { value: 0 },
        maxTime:  { value: 1.8 },
        color:    { value: new THREE.Color(0xFF6B00) },
        isActive: { value: 0.0 }, // FIXED KEYWORD
      },
      vertexShader: `
        varying vec2 vUv;
        void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
      fragmentShader: `
        varying vec2 vUv;
        uniform float time; uniform float maxTime;
        uniform vec3 color;  uniform float isActive; // FIXED KEYWORD
        void main(){
          float p = time / maxTime;
          vec2 c = vUv - 0.5;
          float r = length(c) * 2.0;
          float front = p * 2.0;
          float ring = smoothstep(0.04, 0.0, abs(r - front)) * (1.0 - p);
          float fade = ring * (1.0 - p) * isActive; // FIXED KEYWORD
          gl_FragColor = vec4(color, fade * 0.7);
        }`,
      transparent: true, depthWrite: false, side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(28, 28), mat);
    mesh.renderOrder = 10; scene.add(mesh);
    shockwavePool.push({ mesh, mat, isActive: false, time: 0, maxTime: 1.8 });
  }
  function spawnShockwave(pos, color) {
    const sw = shockwavePool.find(s => !s.isActive);
    if (!sw) return;
    sw.isActive = true; sw.time = 0;
    sw.mesh.position.copy(pos);
    sw.mesh.lookAt(camera.position);
    sw.mat.uniforms.color.value.set(color);
    sw.mat.uniforms.isActive.value = 1.0;
    sw.mat.uniforms.time.value = 0;
  }

  /* ═══════════════════════════════════════════════════════════
     J. WORMHOLE ZOOM — white ring collapse on node click
  ═══════════════════════════════════════════════════════════ */
  const wormholeMat = new THREE.ShaderMaterial({
    uniforms: {
      time:     { value: 0 },
      phase:    { value: 0 },   // 0=idle 1=collapsing 2=expanding
      color:    { value: new THREE.Color(1,1,1) },
      isActive: { value: 0.0 }, // FIXED KEYWORD
    },
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: `
      varying vec2 vUv;
      uniform float time; uniform float phase; uniform vec3 color; uniform float isActive; // FIXED KEYWORD
      void main(){
        vec2 c = vUv - 0.5;
        float r = length(c)*2.0;
        float p = clamp(time, 0.0, 1.0);
        float ring;
        if(phase < 1.5){
          float front = 1.0 - p;
          ring = smoothstep(0.06,0.0,abs(r - front)) * p;
        } else {
          float front = p;
          ring = smoothstep(0.06,0.0,abs(r - front)) * (1.0 - p * 0.5);
        }
        float white = smoothstep(0.0, 0.3, 1.0 - r) * p * (phase < 1.5 ? 1.0 : 0.0);
        gl_FragColor = vec4(color, (ring + white * 0.4) * isActive); // FIXED KEYWORD
      }`,
    transparent: true, depthWrite: false, side: THREE.DoubleSide,
  });
  const wormholeMesh = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), wormholeMat);
  wormholeMesh.renderOrder = 20; scene.add(wormholeMesh);
  let wormholeState = { isActive: false, phase: 0, time: 0, targetPos: null };

  /* ═══════════════════════════════════════════════════════════
     (K, L, M, N OMITTED HERE - KEEP YOUR EXISTING CODE FOR THOSE)
     I WILL NOW OVERRIDE CORONAL MASS EJECTION (O) BELOW
  ═══════════════════════════════════════════════════════════ */

  /* ═══════════════════════════════════════════════════════════
     K. HYPERLANE TRAILS — core-to-core connections at high zoom-out
  ═══════════════════════════════════════════════════════════ */
  const hyperlaneMeshes = [];
  (function buildHyperlanes() {
    for (let a = 0; a < coreObjects.length; a++) {
      for (let b = a + 1; b < coreObjects.length; b++) {
        const geom = new THREE.BufferGeometry().setFromPoints([
          corePositions[a].clone(),
          corePositions[b].clone(),
        ]);
        const mat = new THREE.LineDashedMaterial({
          color: 0x445566, transparent: true, opacity: 0.0,
          dashSize: 0.8, gapSize: 0.5, linewidth: 1,
        });
        const line = new THREE.Line(geom, mat);
        line.computeLineDistances();
        formationGroup.add(line);
        hyperlaneMeshes.push({ line, mat, a, b });
      }
    }
  })();

  /* ═══════════════════════════════════════════════════════════
     L. CONNECTION BEAM — hover satellite → its anchor
  ═══════════════════════════════════════════════════════════ */
  const beamPts    = new Float32Array(2 * 3);
  const beamGeom   = new THREE.BufferGeometry();
  beamGeom.setAttribute('position', new THREE.BufferAttribute(beamPts, 3));
  const beamMat    = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.0 });
  const beamLine   = new THREE.Line(beamGeom, beamMat);
  beamLine.renderOrder = 3;
  scene.add(beamLine);

  /* ═══════════════════════════════════════════════════════════
     M. MAGNETOSPHERE FIELD LINES — dipole arcs on hover
  ═══════════════════════════════════════════════════════════ */
  const FIELD_LINE_COUNT = 8;
  const fieldLineMeshes  = [];
  const FIELD_SEGS       = 32;
  for (let fi = 0; fi < FIELD_LINE_COUNT; fi++) {
    const fPts  = new Float32Array((FIELD_SEGS + 1) * 3);
    const fGeom = new THREE.BufferGeometry();
    fGeom.setAttribute('position', new THREE.BufferAttribute(fPts, 3));
    const fMat  = new THREE.LineBasicMaterial({ color: 0x88ccff, transparent: true, opacity: 0.0 });
    const fLine = new THREE.Line(fGeom, fMat);
    scene.add(fLine);
    fieldLineMeshes.push({ line: fLine, mat: fMat, pts: fPts, geom: fGeom });
  }

  /* ═══════════════════════════════════════════════════════════
     N. PULSAR SWEEP — one core fires a rotating collimated beam
  ═══════════════════════════════════════════════════════════ */
  const PULSAR_IDX = 0; // first core is the pulsar
  const PULSAR_SEGS = 48;
  const pulsarPts  = new Float32Array((PULSAR_SEGS + 1) * 3);
  const pulsarGeom = new THREE.BufferGeometry();
  pulsarGeom.setAttribute('position', new THREE.BufferAttribute(pulsarPts, 3));
  const pulsarMat  = new THREE.LineBasicMaterial({
    color: DOMAIN_COLOR[CORE_MEMBERS[PULSAR_IDX].domain] || 0xFF6B00,
    transparent: true, opacity: 0.5,
  });
  const pulsarLine = new THREE.Line(pulsarGeom, pulsarMat);
  pulsarLine.renderOrder = 1;
  formationGroup.add(pulsarLine);

  /* ═══════════════════════════════════════════════════════════
     O. CORONAL MASS EJECTION — nucleus bubble every ~30s
  ═══════════════════════════════════════════════════════════ */
  const cmeMat = new THREE.ShaderMaterial({
    uniforms: {
      time:   { value: 0 },
      isActive: { value: 0.0 },
      color:  { value: new THREE.Color(1.0, 0.55, 0.1) },
    },
    vertexShader: `
      varying vec3 vNorm;
      varying vec3 vPos;
      void main(){
        vNorm = normalize(normalMatrix*normal);
        vPos  = (modelViewMatrix*vec4(position,1.)).xyz;
        gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.);
      }`,
    fragmentShader: `
      varying vec3 vNorm; varying vec3 vPos;
      uniform float time; uniform float isActive; uniform vec3 color;
      void main(){
        float fres = pow(1.0-abs(dot(vNorm,normalize(-vPos))),2.0);
        float edge = smoothstep(0.7,1.0,fres);
        float fade = sin(time * 1.4) * isActive;
        gl_FragColor = vec4(color, edge * fade * 0.55);
      }`,
    transparent: true,
    depthWrite: false,
    side: THREE.BackSide,
  });
  
  const cmeMesh = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 32), cmeMat);
  scene.add(cmeMesh);
  let cmeState = { active: false, time: 0, scale: 0, nextCME: 30 + Math.random() * 10 };

  /* ═══════════════════════════════════════════════════════════
     P. COSMIC MICROWAVE BACKGROUND FLICKER
  ═══════════════════════════════════════════════════════════ */
  // Controlled via the ambient light color temperature tweak each frame

  /* ═══════════════════════════════════════════════════════════
     Q. GRAVITY WELL — 2D grid deformation on hover (CSS overlay)
     Implemented as a canvas2D overlay that deforms a dot-grid
  ═══════════════════════════════════════════════════════════ */
  const gravCanvas  = document.createElement('canvas');
  gravCanvas.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:2;opacity:0.18;';
  document.body.appendChild(gravCanvas);
  const gravCtx     = gravCanvas.getContext('2d');
  let   gravTarget  = null; // world position of hovered node (projected)
  let   gravAlpha   = 0;

  function resizeGravCanvas() {
    gravCanvas.width  = window.innerWidth;
    gravCanvas.height = window.innerHeight;
  }
  resizeGravCanvas();
  window.addEventListener('resize', resizeGravCanvas);

  function drawGravityWell(screenX, screenY, alpha) {
    const W = gravCanvas.width, H = gravCanvas.height;
    gravCtx.clearRect(0, 0, W, H);
    if (alpha < 0.01) return;
    const spacing = 44;
    const cols = Math.ceil(W / spacing) + 2;
    const rows = Math.ceil(H / spacing) + 2;
    gravCtx.strokeStyle = `rgba(100,160,255,${alpha * 0.5})`;
    gravCtx.lineWidth   = 0.5;
    const strength = 1400 * alpha;
    for (let gy = 0; gy < rows; gy++) {
      for (let gx = 0; gx < cols; gx++) {
        const bx = gx * spacing - spacing;
        const by = gy * spacing - spacing;
        const dx = bx - screenX, dy = by - screenY;
        const dist2 = dx*dx + dy*dy + 1;
        const pull  = strength / dist2;
        const nx    = bx - dx * pull;
        const ny    = by - dy * pull;
        const r = Math.sqrt(dist2);
        const dotA = Math.max(0, 1 - r / 200) * alpha;
        gravCtx.beginPath();
        gravCtx.arc(nx, ny, 1.2, 0, Math.PI * 2);
        gravCtx.fillStyle = `rgba(120,180,255,${dotA * 0.8})`;
        gravCtx.fill();
        // draw grid lines
        if (gx < cols - 1) {
          const bx2 = (gx+1)*spacing - spacing;
          const dx2 = bx2 - screenX, dy2 = by - screenY;
          const dist22 = dx2*dx2+dy2*dy2+1;
          const pull2  = strength/dist22;
          gravCtx.beginPath();
          gravCtx.moveTo(nx, ny);
          gravCtx.lineTo(bx2 - dx2*pull2, by - dy2*pull2);
          gravCtx.stroke();
        }
        if (gy < rows - 1) {
          const by2 = (gy+1)*spacing - spacing;
          const dx3 = bx - screenX, dy3 = by2 - screenY;
          const dist32 = dx3*dx3+dy3*dy3+1;
          const pull3  = strength/dist32;
          gravCtx.beginPath();
          gravCtx.moveTo(nx, ny);
          gravCtx.lineTo(bx - dx3*pull3, by2 - dy3*pull3);
          gravCtx.stroke();
        }
      }
    }
  }

  /* ═══════════════════════════════════════════════════════════
     R. TIME DILATION — satellites near nucleus slow down
     Handled inline in animate via a dilationFactor per suppObject
  ═══════════════════════════════════════════════════════════ */

  /* ── Store ambient light ref for CMB flicker ── */
  let ambientLight = null;
  scene.traverse(c => { if (c.isAmbientLight) ambientLight = c; });

  /* ═══════════════════════════════════════════════════════════
     ANIMATION LOOP
  ═══════════════════════════════════════════════════════════ */
  const clock = new THREE.Clock();
  let simTime = 0; // simulation time (paused when zoomed in)

  function animate() {
    requestAnimationFrame(animate);
    const dt = Math.min(clock.getDelta(), 0.05);
    if (!isZoomedIn) simTime += dt;

    // Feed time to the Infinite Background Shader
    if (scene.userData.stManifold) {
        scene.userData.stManifold.mat.uniforms.time.value = simTime;
    }

    /* Smooth camera via spherical lerp */
    spherical.theta += (targetSpherical.theta - spherical.theta) * 0.07;
    spherical.phi   += (targetSpherical.phi   - spherical.phi)   * 0.07;
    spherical.r     += (targetSpherical.r     - spherical.r)     * 0.07;
    currentLookAt.lerp(targetLookAt, 0.07);

    camera.position.set(
      spherical.r * Math.sin(spherical.phi) * Math.sin(spherical.theta) + currentLookAt.x,
      spherical.r * Math.cos(spherical.phi) + currentLookAt.y,
      spherical.r * Math.sin(spherical.phi) * Math.cos(spherical.theta) + currentLookAt.z
    );
    camera.lookAt(currentLookAt);

    /* Nucleus ring */
    scene.children.forEach(c => {
      if (c.userData && c.userData.isNucleusRing) { c.rotation.z += 0.003; }
    });

    /* Animate core spheres */
    coreObjects.forEach((obj, i) => {
      const angle = simTime * 0.04;
      const base  = corePositions[i];
      const cosA  = Math.cos(angle), sinA = Math.sin(angle);
      obj.mesh.position.set(
        base.x * cosA - base.z * sinA,
        base.y + Math.sin(simTime * 0.7 + i * 1.1) * 0.15,
        base.x * sinA + base.z * cosA
      );
      obj.sprite.position.copy(obj.mesh.position).add(new THREE.Vector3(0, 1.85 * SCENE_SCALE, 0));
      
      obj.wire1.rotation.x += 0.005;
      obj.wire1.rotation.y -= 0.01;
      obj.wire2.rotation.x -= 0.008;
      obj.wire2.rotation.z += 0.007;
      
      // Animate the outer glowing shell (which is the first child of the group)
      if (obj.mesh.children[0] && obj.mesh.children[0].material) {
        obj.mesh.children[0].material.opacity = 0.15 + Math.sin(simTime * 1.8 + i * 0.8) * 0.05;
      }
    });

    /* ── A. Gravitational lensing planes ── */
    lensObjects.forEach(lo => {
      lo.mesh.position.copy(lo.coreObj.mesh.position);
      lo.mesh.lookAt(camera.position);
      lo.mat.uniforms.time.value = simTime;
    });

    /* ── B. Dark matter halos ── */
    haloObjects.forEach(ho => {
      ho.halo.position.copy(ho.coreObj.mesh.position);
      ho.mat.uniforms.time.value = simTime;
    });

    /* ── C. Lagrange ghosts ── */
    lagrangeGhosts.forEach(lg => {
      const posA = coreObjects[lg.pairA].mesh.position;
      const posB = coreObjects[lg.pairB].mesh.position;
      const mid  = posA.clone().add(posB).multiplyScalar(0.5);
      const arm  = posA.clone().sub(posB);
      const dist = arm.length();
      const perp = new THREE.Vector3(-arm.z, arm.y, arm.x).normalize().multiplyScalar(dist * 0.866);
      const target = mid.clone().add(lg.driftPhase < Math.PI ? perp : perp.negate());
      target.y += Math.sin(simTime * 0.18 + lg.driftPhase) * 0.5;
      lg.ghost.position.lerp(target, 0.02);
      const pulse = 0.04 + 0.035 * Math.sin(simTime * 0.8 + lg.driftPhase);
      lg.mat.opacity = pulse;
    });

    /* ── D. Accretion disk ── */
    (function tickAccretion() {
      const pos = scene.userData.accretionPos;
      for (let i = 0; i < ACCRETION_N; i++) {
        const d = accretionData[i];
        d.angle += d.speed * dt;
        // Time dilation: slow down near centre (r < 1)
        const dilate = Math.max(0.1, d.radius - 0.3);
        d.angle += (d.speed * dt) / (dilate * dilate + 0.5) - d.speed * dt;
        const x = Math.cos(d.angle) * d.radius;
        const z = Math.sin(d.angle) * d.radius;
        pos[i*3]   = x;
        pos[i*3+1] = d.yOff;
        pos[i*3+2] = z;
      }
      scene.userData.accretionPts.geometry.attributes.position.needsUpdate = true;
    })();

    /* ── E. Solar wind streams ── */
    solarWindSystems.forEach(sw => {
      const origin = sw.coreObj.mesh.position;
      for (let i = 0; i < WIND_N_PER_CORE; i++) {
        const d = sw.data[i];
        d.life += dt / (4.0 + d.speed);
        if (d.life > 1.0) {
          d.life = 0;
          d.ang  = Math.random() * Math.PI * 2;
          d.spiralRate = 0.6 + Math.random() * 0.8;
        }
        const r = d.life * 8.0 * SCENE_SCALE;
        const a = d.ang + d.life * d.spiralRate * Math.PI * 2;
        sw.pos[i*3]   = origin.x + Math.cos(a) * r;
        sw.pos[i*3+1] = origin.y + Math.sin(d.phase + d.life * 3.1) * 0.08 * r;
        sw.pos[i*3+2] = origin.z + Math.sin(a) * r;
      }
      sw.geom.attributes.position.needsUpdate = true;
      sw.pts.material.opacity = 0.35 + 0.15 * Math.sin(simTime * 0.5);
    });

    /* ── F. Ion trails ── */
    ionTrailSystems.forEach(it => {
      // Push current position into ring buffer
      const curPos = it.suppObj.mesh.position.clone();
      it.history[it.head].copy(curPos);
      it.head = (it.head + 1) % ION_HISTORY;

      for (let i = 0; i < ION_HISTORY; i++) {
        const idx = (it.head + i) % ION_HISTORY;
        it.positions[i*3]   = it.history[idx].x;
        it.positions[i*3+1] = it.history[idx].y;
        it.positions[i*3+2] = it.history[idx].z;
      }
      it.geom.attributes.position.needsUpdate = true;
      it.pts.material.opacity = isZoomedIn ? 0.15 : 0.55;
    });

    /* ── Animate supported members — Keplerian + time dilation ── */
    suppObjects.forEach((obj, i) => {
      const anchorIdx = CORE_MEMBERS.findIndex(c => c.id === obj.member.anchor);
      const curAnchor = coreObjects[anchorIdx] ? coreObjects[anchorIdx].mesh.position : obj.anchorPos;

      // Initialize local time specifically for this satellite to prevent teleportation bugs
      if (obj.localTime === undefined) obj.localTime = Math.random() * 100;

      // R. Time dilation: accurately accumulate time via 'dt'
      if (!isZoomedIn) {
          const distNucleus = obj.mesh.position.length();
          const dilation = distNucleus < 3 ? Math.max(0.15, distNucleus / 3) : 1.0;
          obj.localTime += dt * dilation;
      }

      const pos = keplerState(obj.orb, obj.localTime, curAnchor.x, curAnchor.y, curAnchor.z);
      obj.mesh.position.set(pos.x, pos.y, pos.z);
      if (obj.mesh.material.uniforms) {
          obj.mesh.material.uniforms.time.value = simTime;
      }
      obj.sprite.position.set(pos.x, pos.y + 0.8 * SCENE_SCALE, pos.z);

      // const wpts = orbitWorldPoints(obj.orb, curAnchor.x, curAnchor.y, curAnchor.z);
      // wpts.push(wpts[0]);
      // const posAttr = obj.orbitLine.geometry.attributes.position;
      // if (posAttr && posAttr.count === wpts.length) {
      //   wpts.forEach((p, j) => { posAttr.setXYZ(j, p.x, p.y, p.z); });
      //   posAttr.needsUpdate = true;
      // }


      const wpts = orbitWorldPoints(obj.orb, curAnchor.x, curAnchor.y, curAnchor.z);
      wpts.push(wpts[0]);
      const posAttr = obj.orbitLine.geometry.attributes.position;
      if (posAttr && posAttr.count === wpts.length) {
        wpts.forEach((p, j) => { posAttr.setXYZ(j, p.x, p.y, p.z); });
        posAttr.needsUpdate = true;
      }

      obj.mesh.material.emissiveIntensity = 0.2 + Math.sin(simTime * 2.2 + i * 1.3) * 0.12;
    });

    /* Orbit line opacity */
    suppObjects.forEach(obj => {
      obj.orbitLine.material.opacity = isZoomedIn ? 0.04 : 0.10;
    });

    /* ── G. Plasma bridges ── */
    plasmaTimer += dt;
    plasmaPool.forEach(pb => {
      if (!pb.srcObj) {
        // Check spawn time
        if (plasmaTimer < pb.nextSpawn) return;
        pb.nextSpawn = plasmaTimer + 4 + Math.random() * 6;
        // Pick two random close nodes
        const allNodes =[
          ...coreObjects.map(o=>({pos:o.mesh.position, col: new THREE.Color(DOMAIN_COLOR[o.member.domain] || 0xFF6B00)})),
          ...suppObjects.map(o=>({pos:o.mesh.position, col: new THREE.Color(DOMAIN_COLOR[o.member.domain] || 0x888877)})),
        ];
        const ai = Math.floor(Math.random() * allNodes.length);
        let   bi = Math.floor(Math.random() * allNodes.length);
        while (bi === ai) bi = Math.floor(Math.random() * allNodes.length);
        const dist = allNodes[ai].pos.distanceTo(allNodes[bi].pos);
        if (dist > 12 * SCENE_SCALE) return;
        pb.srcObj  = allNodes[ai];
        pb.dstObj  = allNodes[bi];
        pb.life    = 0;
        pb.maxLife = 0.6 + Math.random() * 0.8;
        pb.mat.color.copy(allNodes[ai].col).lerp(allNodes[bi].col, 0.5).lerp(new THREE.Color(0xaaddff), 0.5);
      } else {
        pb.life += dt;
        const p    = pb.life / pb.maxLife;
        const fade = Math.sin(p * Math.PI);
        pb.mat.opacity = fade * 0.5;
        if (pb.life >= pb.maxLife) { pb.mat.opacity = 0; pb.srcObj = null; return; }
        // Build arc
        const A = pb.srcObj.pos, B = pb.dstObj.pos;
        const mid = A.clone().add(B).multiplyScalar(0.5);
        const up  = new THREE.Vector3(0,1,0);
        const arm = B.clone().sub(A);
        const bulge = up.clone().multiplyScalar(arm.length() * 0.35);
        mid.add(bulge);
        for (let seg = 0; seg <= PLASMA_SEGS; seg++) {
          const t  = seg / PLASMA_SEGS;
          const q0 = A.clone().lerp(mid, t);
          const q1 = mid.clone().lerp(B, t);
          const qp = q0.lerp(q1, t);
          // stable electric jitter: seeded by segment index + time quantised to 0.08s steps
          const jitSeed = Math.floor(simTime / 0.08) + seg * 7.3;
          const jit = (1 - Math.abs(t - 0.5) * 2) * 0.12 * (Math.sin(jitSeed * 2.71) * 0.5);
          pb.pts[seg*3]   = qp.x + jit;
          pb.pts[seg*3+1] = qp.y + jit;
          pb.pts[seg*3+2] = qp.z + jit;
        }
        pb.line.geometry.attributes.position.needsUpdate = true;
      }
    });

    /* ── H. Orbital resonance rings ── */
    resonancePairs.forEach(rp => {
      const posA = suppObjects[rp.a].mesh.position;
      const posB = suppObjects[rp.b].mesh.position;
      const center = posA.clone().add(posB).multiplyScalar(0.5);
      const radius = posA.distanceTo(posB) * 0.5;
      const pulse  = 0.5 + 0.5 * Math.sin(simTime * 1.2 + rp.phase);
      rp.mat.opacity = pulse * 0.12;
      for (let ri = 0; ri <= 63; ri++) {
        const a = (ri / 63) * Math.PI * 2;
        rp.midPts[ri*3]   = center.x + Math.cos(a) * radius;
        rp.midPts[ri*3+1] = center.y;
        rp.midPts[ri*3+2] = center.z + Math.sin(a) * radius;
      }
      rp.geom.attributes.position.needsUpdate = true;
    });

    /* ── I. Shockwaves ── */
    shockwavePool.forEach(sw => {
      if (!sw.active) return;
      sw.time += dt;
      sw.mat.uniforms.time.value = sw.time;
      sw.mesh.lookAt(camera.position);
      if (sw.time >= sw.maxTime) { sw.active = false; sw.mat.uniforms.active.value = 0; }
    });

    /* ── J. Wormhole ── */
    if (wormholeState.active) {
      wormholeState.time += dt * 1.4;
      wormholeMat.uniforms.time.value  = Math.min(wormholeState.time, 1.0);
      wormholeMat.uniforms.phase.value = wormholeState.phase;
      if (wormholeState.targetPos) {
        wormholeMesh.position.copy(wormholeState.targetPos);
        wormholeMesh.lookAt(camera.position);
      }
      if (wormholeState.time >= 1.0) {
        if (wormholeState.phase < 1.5) {
          // switch to expand phase
          wormholeState.phase = 2;
          wormholeState.time  = 0;
        } else {
          wormholeState.active = false;
          wormholeMat.uniforms.isActive.value = 0;
        }
      }
    }

    /* ── K. Hyperlanes (visible at high zoom-out) ── */
    const zoomOut = spherical.r;
    const hOpacity = Math.max(0, Math.min(0.25, (zoomOut - 38) / 20));
    hyperlaneMeshes.forEach(hl => {
      // Update endpoint positions (cores are moving)
      const pA = coreObjects[hl.a].mesh.position;
      const pB = coreObjects[hl.b].mesh.position;
      const posArr = hl.line.geometry.attributes.position.array;
      posArr[0]=pA.x; posArr[1]=pA.y; posArr[2]=pA.z;
      posArr[3]=pB.x; posArr[4]=pB.y; posArr[5]=pB.z;
      hl.line.geometry.attributes.position.needsUpdate = true;
      hl.line.computeLineDistances();
      hl.mat.opacity = hOpacity;
    });

    /* ── L. Connection beam (hover satellite) ── */
    (function tickBeam() {
      let beamVisible = false;
      if (lastHovered) {
        const hObj = suppObjects.find(o => o.member === lastHovered);
        if (hObj) {
          const anchorIdx = CORE_MEMBERS.findIndex(c => c.id === hObj.member.anchor);
          if (anchorIdx >= 0) {
            const src = hObj.mesh.position;
            const dst = coreObjects[anchorIdx].mesh.position;
            beamPts[0]=src.x; beamPts[1]=src.y; beamPts[2]=src.z;
            beamPts[3]=dst.x; beamPts[4]=dst.y; beamPts[5]=dst.z;
            beamGeom.attributes.position.needsUpdate = true;
            const col = DOMAIN_COLOR[hObj.member.domain] || 0xffffff;
            beamMat.color.setHex(col);
            beamMat.opacity = 0.35 + 0.25 * Math.sin(simTime * 8);
            beamVisible = true;
          }
        }
      }
      if (!beamVisible) beamMat.opacity = 0;
    })();

    /* ── M. Magnetosphere field lines (hover core) ── */
    (function tickFieldLines() {
      const hovCore = lastHovered ? coreObjects.find(o => o.member === lastHovered) : null;
      fieldLineMeshes.forEach((fl, fi) => {
        if (!hovCore) { fl.mat.opacity *= 0.85; return; }
        const center = hovCore.mesh.position;
        const R = 2.2 * SCENE_SCALE;
        // Dipole field line parametric: r = R*cos²(lambda), lambda from -PI/2 to PI/2
        const azimuth = (fi / FIELD_LINE_COUNT) * Math.PI * 2;
        for (let seg = 0; seg <= FIELD_SEGS; seg++) {
          const lambda = (seg / FIELD_SEGS - 0.5) * Math.PI;
          const r = R * Math.cos(lambda) * Math.cos(lambda);
          fl.pts[seg*3]   = center.x + Math.cos(azimuth) * r;
          fl.pts[seg*3+1] = center.y + Math.sin(lambda) * R * 0.8;
          fl.pts[seg*3+2] = center.z + Math.sin(azimuth) * r;
        }
        fl.geom.attributes.position.needsUpdate = true;
        const col = DOMAIN_COLOR[hovCore.member.domain] || 0x88ccff;
        fl.mat.color.setHex(col);
        fl.mat.opacity = Math.min(0.45, fl.mat.opacity + dt * 1.2);
      });
    })();

    /* ── N. Pulsar sweep ── */
    (function tickPulsar() {
      const pulsarCore = coreObjects[PULSAR_IDX];
      const origin     = pulsarCore.mesh.position;
      const sweepAngle = simTime * 1.4;
      const beamLen    = 22 * SCENE_SCALE;
      pulsarPts[0] = origin.x;
      pulsarPts[1] = origin.y;
      pulsarPts[2] = origin.z;
      for (let seg = 1; seg <= PULSAR_SEGS; seg++) {
        const t    = seg / PULSAR_SEGS;
        const fade = 1.0 - t;
        const jitter = Math.sin(t * 12.0 + simTime * 4.0) * 0.03 * t;
        pulsarPts[seg*3]   = origin.x + Math.cos(sweepAngle + jitter) * t * beamLen;
        pulsarPts[seg*3+1] = origin.y;
        pulsarPts[seg*3+2] = origin.z + Math.sin(sweepAngle + jitter) * t * beamLen;
      }
      pulsarGeom.attributes.position.needsUpdate = true;
      pulsarMat.opacity = 0.08 + 0.07 * Math.sin(simTime * 0.9);
    })();

    /* ── O. Coronal mass ejection ── */
    cmeState.nextCME -= dt;
    if (cmeState.nextCME <= 0 && !cmeState.active) {
      cmeState.active  = true;
      cmeState.time    = 0;
      cmeState.scale   = 0.5;
      cmeState.nextCME = 28 + Math.random() * 14;
      cmeMat.uniforms.active.value = 1.0;
    }
    if (cmeState.active) {
      cmeState.time  += dt;
      cmeState.scale += dt * 7.0;
      cmeMesh.scale.set(cmeState.scale, cmeState.scale, cmeState.scale);
      cmeMat.uniforms.time.value = cmeState.time;
      if (cmeState.scale > 60) {
        cmeState.active = false;
        cmeMat.uniforms.active.value = 0;
      }
    }

    /* ── P. Cosmic microwave background flicker ── */
    if (ambientLight) {
      const t1 = simTime * 0.07;
      const t2 = simTime * 0.041;
      const warm = 0.5 + 0.5 * Math.sin(t1);
      const cool = 0.5 + 0.5 * Math.sin(t2);
      ambientLight.color.setRGB(
        0.03 + warm * 0.015,
        0.03 + cool * 0.008,
        0.06 + cool * 0.018
      );
    }

    /* ── Q. Gravity well overlay ── */
    (function tickGravWell() {
      let targetAlpha = 0;
      let scrX = 0, scrY = 0;
      if (lastHovered) {
        const hovObj = coreObjects.find(o => o.member === lastHovered)
                    || suppObjects.find(o => o.member === lastHovered);
        if (hovObj) {
          const wp = hovObj.mesh.position.clone();
          wp.project(camera);
          scrX = (wp.x + 1) * 0.5 * window.innerWidth;
          scrY = (1 - wp.y) * 0.5 * window.innerHeight;
          targetAlpha = 1.0;
        }
      }
      gravAlpha += (targetAlpha - gravAlpha) * 0.08;
      drawGravityWell(scrX, scrY, gravAlpha);
    })();

    /* Hover check */
    checkHover();

    /* Animate lights */
    rimA.position.set(Math.cos(simTime * 0.3) * 22, 8, Math.sin(simTime * 0.3) * 14);
    rimB.position.set(Math.cos(simTime * 0.22 + 2) * 18, -6, Math.sin(simTime * 0.22 + 2) * 12);

    /* ── Sky shader time ── */
    if (scene.userData.skyMat) {
      scene.userData.skyMat.uniforms.time.value = simTime;
    }

    /* ── Gentle JS-side star twinkle (layer B & C opacity nudge) ──
       Uses two independent slow sine waves so stars breathe, not flash. */
    if (scene.userData.starMatB) {
      scene.userData.starMatB.opacity = 0.68 + 0.12 * Math.sin(simTime * 0.35);
    }
    if (scene.userData.starMatC) {
      scene.userData.starMatC.opacity = 0.78 + 0.12 * Math.sin(simTime * 0.21 + 1.4);
    }

    renderer.render(scene, camera);
  }

  animate();

  /* ── Clock ── */
  // const clockEl = document.getElementById('navClock');
  // setInterval(() => {
  //   const n = new Date();
  //   clockEl.textContent = [n.getHours(), n.getMinutes(), n.getSeconds()]
  //     .map(v => String(v).padStart(2, '0')).join(':');
  // }, 1000);

/* ── Cursor ── */
  const cursorEl = document.getElementById('cursor');
  window.addEventListener('mousemove', e => {
    if (cursorEl) cursorEl.style.transform = `translate(${e.clientX}px,${e.clientY}px)`;
  });

  /* ═══════════════════════════════════════════════════════════
     SIDEBAR ROSTER — desktop sidebar / mobile bottom-sheet
  ═══════════════════════════════════════════════════════════ */
  (function buildSidebarRoster() {

    /* ── Shared style tag (scrollbar hide + transitions) ── */
    const style = document.createElement('style');
    style.innerHTML = `
      #roster-sidebar::-webkit-scrollbar { display: none; }
      #roster-sheet::-webkit-scrollbar   { display: none; }
      #roster-sheet {
        scrollbar-width: none;
        transition: transform 0.4s cubic-bezier(0.25,0.46,0.45,0.94);
      }
      #roster-sheet-toggle {
        transition: background 0.2s;
      }
      #roster-sheet-toggle:active { background: rgba(255,107,0,0.25) !important; }
    `;
    document.head.appendChild(style);

    /* ── Helper: build a member button ── */
    function makeBtn(obj, isCore) {
      const col    = isCore ? '#FF6B00' : '#4499DD';
      const colBg  = isCore ? 'rgba(255,107,0,0.1)' : 'rgba(68,153,221,0.1)';
      const colHov = isCore ? 'rgba(255,107,0,0.3)' : 'rgba(68,153,221,0.3)';
      const btn = document.createElement('div');
      btn.style.cssText = `font-family: var(--font-mono); font-size: 11px; color: #fff;
        cursor: pointer; padding: 6px 10px; background: ${colBg};
        border-left: 2px solid ${col}; transition: background 0.2s, transform 0.2s;`;
      btn.innerText = obj.member.name;
      btn.onmouseover = () => { btn.style.background = colHov; btn.style.transform = 'translateX(-4px)'; };
      btn.onmouseout  = () => { btn.style.background = colBg;  btn.style.transform = 'translateX(0)'; };
      btn.onclick = () => {
        handleNodeClick(obj.mesh);
        /* Close the sheet on mobile after selecting */
        const sheet = document.getElementById('roster-sheet');
        if (sheet && sheet._open) toggleSheet(false);
      };
      return btn;
    }

    /* ── Helper: section title ── */
    function makeTitle(label, col, extraMargin) {
      const t = document.createElement('div');
      t.style.cssText = `font-family: var(--font-mono); font-size: 10px; color: ${col};
        letter-spacing: 2px; border-bottom: 1px solid ${col}33; padding-bottom: 4px;
        ${extraMargin ? 'margin: 12px 0 4px 0;' : 'margin-bottom: 4px;'}`;
      t.innerText = label;
      return t;
    }

    /* ── Override legend ── */
    const legend = document.getElementById('domain-legend');
    if (legend) {
      legend.innerHTML = `
        <div class="legend-item"><div class="legend-dot" style="background:#FF6B00;box-shadow:0 0 6px #FF6B00;"></div>CORE OPERATOR</div>
        <div class="legend-item"><div class="legend-dot" style="background:#4499DD;box-shadow:0 0 6px #4499DD;"></div>ORBITING MEMBER</div>
      `;
    }

    const isSmall = window.innerWidth < 768;

    /* ════════════════════════════════════════════
       DESKTOP — fixed right sidebar (unchanged)
    ════════════════════════════════════════════ */
    if (!isSmall) {
      const wrap = document.createElement('div');
      wrap.id = 'roster-sidebar';
      wrap.style.cssText = `
        position: fixed; right: 24px; top: 80px; bottom: 24px; width: 220px;
        overflow-y: auto; z-index: 150; scrollbar-width: none;
        display: flex; flex-direction: column; gap: 8px; pointer-events: auto;
      `;
      wrap.appendChild(makeTitle('CORE OPERATORS', '#FF6B00', false));
      coreObjects.forEach(o => wrap.appendChild(makeBtn(o, true)));
      wrap.appendChild(makeTitle('ORBITING MEMBERS', '#4499DD', true));
      suppObjects.forEach(o => wrap.appendChild(makeBtn(o, false)));
      document.body.appendChild(wrap);
      return; // done for desktop
    }

    /* ════════════════════════════════════════════
       MOBILE — bottom sheet (hidden by default)
    ════════════════════════════════════════════ */

    /* Sheet panel */
    const sheet = document.createElement('div');
    sheet.id = 'roster-sheet';
    sheet._open = false;
    sheet.style.cssText = `
      position: fixed; left: 0; right: 0; bottom: 0;
      height: 55vh;
      background: rgba(8,8,20,0.97);
      border-top: 2px solid #FF6B00;
      border-radius: 16px 16px 0 0;
      z-index: 300;
      overflow-y: auto;
      padding: 12px 16px 32px;
      display: flex; flex-direction: column; gap: 6px;
      pointer-events: auto;
      transform: translateY(100%);
      box-shadow: 0 -8px 40px rgba(0,0,0,0.7);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
    `;

    /* Drag handle */
    const handle = document.createElement('div');
    handle.style.cssText = `
      width: 40px; height: 4px; background: rgba(255,107,0,0.5);
      border-radius: 2px; margin: 0 auto 12px; flex-shrink: 0;
    `;
    sheet.appendChild(handle);

    sheet.appendChild(makeTitle('CORE OPERATORS', '#FF6B00', false));
    coreObjects.forEach(o => sheet.appendChild(makeBtn(o, true)));
    sheet.appendChild(makeTitle('ORBITING MEMBERS', '#4499DD', true));
    suppObjects.forEach(o => sheet.appendChild(makeBtn(o, false)));

    document.body.appendChild(sheet);

    /* Toggle button — bottom-center pill */
    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'roster-sheet-toggle';
    toggleBtn.style.cssText = `
      position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
      z-index: 310; pointer-events: auto;
      font-family: var(--font-mono); font-size: 10px; letter-spacing: 2px;
      color: #FF6B00; text-transform: uppercase;
      background: rgba(8,8,20,0.9);
      border: 1px solid rgba(255,107,0,0.5);
      border-radius: 20px; padding: 7px 20px;
      cursor: pointer; display: flex; align-items: center; gap: 8px;
      backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
    `;
    toggleBtn.innerHTML = `<span id="roster-toggle-icon">☰</span> PERSONNEL`;
    document.body.appendChild(toggleBtn);

    function toggleSheet(forceState) {
      const open = forceState !== undefined ? forceState : !sheet._open;
      sheet._open = open;
      sheet.style.transform = open ? 'translateY(0)' : 'translateY(100%)';
      toggleBtn.style.bottom = open ? `calc(55vh + 12px)` : '20px';
      document.getElementById('roster-toggle-icon').textContent = open ? '✕' : '☰';
    }

    toggleBtn.onclick = () => toggleSheet();

    /* Tap on sheet handle / outside closes it */
    handle.style.cursor = 'pointer';
    handle.onclick = () => toggleSheet(false);

    /* Close sheet if user taps the canvas while sheet is open */
    document.getElementById('scene').addEventListener('touchstart', () => {
      if (sheet._open) toggleSheet(false);
    }, { passive: true });

  })();

})();
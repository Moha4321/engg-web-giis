import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// --- 1. CORE SETUP ---
const canvas = document.querySelector('#webgl-canvas');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x030308, 0.015);

const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true, // Lets the beautiful CSS gradient show through
    antialias: true,
    powerPreference: "high-performance"
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;

// Camera System (Separated state for GSAP to animate easily)
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
const camState = { 
    x: 0, 
    y: 0, 
    z: 6 // Starts VERY zoomed in
};

// --- 2. LIGHTING (Proper Hull Colors) ---
// Neutral front light to show the white rocket hull and logos
const fillLight = new THREE.DirectionalLight(0xffffff, 1.5);
fillLight.position.set(0, 0, 10);
scene.add(fillLight);

// Cinematic rim lights (Telemetry Blue & Warning Orange)
const blueLight = new THREE.DirectionalLight(0x4499DD, 4);
blueLight.position.set(-10, 5, -5);
scene.add(blueLight);

const orangeLight = new THREE.DirectionalLight(0xFF6B00, 5);
orangeLight.position.set(10, -5, -5); 
scene.add(orangeLight);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

// --- 3. PARALLAX STARFIELD ---
function createStars(count, size, opacity) {
    const geom = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    for(let i=0; i < count * 3; i+=3) {
        pos[i] = (Math.random() - 0.5) * 150;
        pos[i+1] = (Math.random() - 0.5) * 150;
        pos[i+2] = (Math.random() - 0.5) * 100 - 10;
    }
    geom.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({ color: 0xffffff, size, transparent: true, opacity });
    const field = new THREE.Points(geom, mat);
    scene.add(field);
    return field;
}
const distantStars = createStars(2000, 0.08, 0.3);
const nearStars = createStars(1000, 0.15, 0.6);

// --- 4. ROCKET & AUTO-SCALING ---
const rocketGroup = new THREE.Group();
scene.add(rocketGroup);

let rocket;
let rocketHeight = 12; // Normalized height for our scene

// Global animation state
const state = {
    throttle: 0.02,       // Engine power (starts as idle vapor)
    turbulence: 0.0,      // Screen shake
    envSpeed: 0.05,       // Background star speed
    exhaustSpread: 0.5,   // Flame width
    flameColor: { r: 1.0, g: 0.4, b: 0.0 } // Orange #FF6B00
};

const loader = new GLTFLoader();
loader.load('spacex_falcon_heavy.glb', (gltf) => {
    rocket = gltf.scene;
    
    // MATHEMATICAL AUTO-SCALING (Fixes the massive size issue)
    const box = new THREE.Box3().setFromObject(rocket);
    const size = box.getSize(new THREE.Vector3());
    const scaleFactor = rocketHeight / size.y;
    rocket.scale.set(scaleFactor, scaleFactor, scaleFactor);
    
    // Perfectly center the rocket in the group
    const center = box.getCenter(new THREE.Vector3());
    rocket.position.sub(center.multiplyScalar(scaleFactor));
    
    rocketGroup.add(rocket);
    rocketGroup.position.set(0, -1, 0); // Starting offset

    initScrollChoreography();
});

// --- 5. TRUE ROCKET EXHAUST ---
const particleCount = 3000;
const pGeom = new THREE.BufferGeometry();
const pPos = new Float32Array(particleCount * 3);
const pVel =[];

// Create a wide emission base to cover all 3 cores
for (let i = 0; i < particleCount; i++) {
    pPos[i * 3] = (Math.random() - 0.5) * 2.5; // X spread across 3 cores
    pPos[i * 3 + 1] = 0; // Y base
    pPos[i * 3 + 2] = (Math.random() - 0.5) * 0.8; // Z depth
    pVel.push({
        x: (Math.random() - 0.5) * 0.2,
        y: -Math.random() - 0.2, // Shoot down
        z: (Math.random() - 0.5) * 0.2
    });
}
pGeom.setAttribute('position', new THREE.BufferAttribute(pPos, 3));

const pMat = new THREE.PointsMaterial({
    color: new THREE.Color(state.flameColor.r, state.flameColor.g, state.flameColor.b),
    size: 0.2,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    depthWrite: false
});
const exhaust = new THREE.Points(pGeom, pMat);
scene.add(exhaust);

// --- 6. CINEMATIC GSAP TIMELINE ---
// function initScrollChoreography() {
//     gsap.registerPlugin(ScrollTrigger);
    
//     const isMobile = window.innerWidth < 768;
//     const rightOffset = isMobile ? 0 : 3.5; // Keep right on desktop

//     // Set initial X position based on screen size
//     gsap.set(rocketGroup.position, { x: rightOffset });

//     const tl = gsap.timeline({
//         scrollTrigger: {
//             trigger: "body",
//             start: "top top",
//             end: "bottom bottom",
//             scrub: 1.5,
//         }
//     });

//     // PHASE 1: ZOOM OUT (Hero -> Core Directives)
//     // Reveal the whole rocket
//     tl.to(camState, { z: 22, ease: "power1.inOut" }, 0)
//       .to(rocketGroup.position, { y: 2, ease: "power1.inOut" }, 0)
//       .to(state, { throttle: 0.1 }, 0); // Slight engine pre-burn

//     // PHASE 2: PREPARE FOR LAUNCH (Core Directives -> Ops Loop)
//     tl.to(rocketGroup.position, { x: isMobile ? 0 : 1.5, y: -2 }, 1)
//       .to(rocketGroup.rotation, { z: -0.1, x: 0.1 }, 1) // Tilt into ascent profile
//       .to(state, { turbulence: 0.1 }, 1); // Ground rumble

//     // PHASE 3: IGNITION & LIFTOFF (Ops Loop -> Bottom)
//     tl.to(state, { 
//         throttle: 1.0,         // MAX POWER
//         turbulence: 0.5,       // Heavy shake
//         envSpeed: 3.5,         // Stars streak violently
//         exhaustSpread: 2.0     // Plume expands in vacuum
//     }, 2)
//     .to(rocketGroup.position, { y: 6 }, 2) // Rocket ascends off screen
//     .to(rocketGroup.rotation, { z: 0.2, y: -0.5 }, 2) // Orbital rotation
    
//     // Interpolate flame color to Vacuum Blue (#4499DD)
//     .to(state.flameColor, {
//         r: 68/255, 
//         g: 153/255, 
//         b: 221/255,
//         onUpdate: () => {
//             pMat.color.setRGB(state.flameColor.r, state.flameColor.g, state.flameColor.b);
//         }
//     }, 2);
// }

// --- 6. CINEMATIC GSAP TIMELINE ---
function initScrollChoreography() {
    gsap.registerPlugin(ScrollTrigger);
    
    const isMobile = window.innerWidth < 768;
    // CHANGED: Negative offset moves the rocket to the left side on desktop
    const leftOffset = isMobile ? 0 : -3; 

    // Set initial X position based on screen size
    gsap.set(rocketGroup.position, { x: leftOffset });

    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: "body",
            start: "top top",
            end: "bottom bottom",
            scrub: 1.5,
        }
    });

    // PHASE 1: ZOOM OUT (Hero -> Core Directives)
    // Reveal the whole rocket
    tl.to(camState, { z: 22, ease: "power1.inOut" }, 0)
      .to(rocketGroup.position, { y: 2, ease: "power1.inOut" }, 0)
      .to(state, { throttle: 0.1 }, 0); // Slight engine pre-burn

    // PHASE 2: PREPARE FOR LAUNCH (Core Directives -> Ops Loop)
    // CHANGED: -1.5 keeps it on the left. Rotation flipped to lean inwards.
    tl.to(rocketGroup.position, { x: isMobile ? 0 : -6.5, y: -2 }, 1)
      .to(rocketGroup.rotation, { z: -0.1, x: 0.1 }, 1) 
      .to(state, { turbulence: 0.1 }, 1); // Ground rumble

    // PHASE 3: IGNITION & LIFTOFF (Ops Loop -> Bottom)
    tl.to(state, { 
        throttle: 1.0,         // MAX POWER
        turbulence: 0.5,       // Heavy shake
        envSpeed: 3.5,         // Stars streak violently
        exhaustSpread: 2.0     // Plume expands in vacuum
    }, 2)
    .to(rocketGroup.position, { y: 6 }, 2) // Rocket ascends off screen
    // CHANGED: Flipped rotation (z: -0.2, y: 0.5) to arc beautifully from the left side
    .to(rocketGroup.rotation, { z: -0.2, y: 0.5 }, 2) 
    
    // Interpolate flame color to Vacuum Blue (#4499DD)
    .to(state.flameColor, {
        r: 68/255, 
        g: 153/255, 
        b: 221/255,
        onUpdate: () => {
            pMat.color.setRGB(state.flameColor.r, state.flameColor.g, state.flameColor.b);
        }
    }, 2);
}

// --- 7. RENDER & PHYSICS LOOP ---
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const time = clock.getElapsedTime();

    // 1. Position Exhaust exactly at the bottom of the auto-scaled rocket
    if (rocket) {
        exhaust.position.x = rocketGroup.position.x;
        // The bottom of our 12-unit tall rocket is exactly 6 units down from its center
        exhaust.position.y = rocketGroup.position.y - (rocketHeight / 2) + 0.2; 
        exhaust.position.z = rocketGroup.position.z;
        exhaust.rotation.copy(rocketGroup.rotation);
        
        // Gentle idle floating
        rocketGroup.position.y += Math.sin(time * 2) * 0.005;
    }

    // 2. Flame Particle Physics
    const positions = exhaust.geometry.attributes.position.array;
    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        
        // X and Z spread based on throttle and vacuum state
        positions[i3] += pVel[i].x * state.throttle * state.exhaustSpread;
        // Y blasts downward hard based on throttle
        positions[i3 + 1] += pVel[i].y * (state.throttle * 4 + 0.1); 
        positions[i3 + 2] += pVel[i].z * state.throttle * state.exhaustSpread;

        // Reset particle if it travels too far
        if (positions[i3 + 1] < -(12 * state.throttle + 2)) {
            // Reset to nozzle base with slightly randomized width
            positions[i3] = (Math.random() - 0.5) * 2.5; 
            positions[i3 + 1] = 0;
            positions[i3 + 2] = (Math.random() - 0.5) * 0.8;
        }
    }
    exhaust.geometry.attributes.position.needsUpdate = true;

    // 3. Falling Stars (Parallax motion)
    const moveStars = (stars, speed) => {
        const sPos = stars.geometry.attributes.position.array;
        for(let i=1; i < sPos.length; i+=3) {
            sPos[i] -= speed;
            if (sPos[i] < -75) sPos[i] = 75; // Loop
        }
        stars.geometry.attributes.position.needsUpdate = true;
    };
    moveStars(nearStars, state.envSpeed);
    moveStars(distantStars, state.envSpeed * 0.4); // Parallax effect

    // 4. Camera State Application & Turbulence
    camera.position.z = camState.z;
    if (state.turbulence > 0) {
        // Apply shake on top of base position
        camera.position.x = camState.x + (Math.random() - 0.5) * state.turbulence * 0.4;
        camera.position.y = camState.y + (Math.random() - 0.5) * state.turbulence * 0.4;
    } else {
        camera.position.x = camState.x;
        camera.position.y = camState.y;
    }

    renderer.render(scene, camera);
}

animate();

// --- 8. RESIZE HANDLER ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
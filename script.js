import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/controls/OrbitControls.js';

let scene, camera, renderer, controls;
let plate1, plate2, particles = [];
let isAnimating = false;
let particleGroup;
let particleCount = 2000;
const plateDistanceElement = document.getElementById('plateDistance');

// Separate arrays for different arrows
let topOuterArrows = [];
let bottomOuterArrows = [];
let topInnerArrows = [];
let bottomInnerArrows = [];
let ruler;

const demonstrateBtn = document.getElementById('demonstrateBtn');
const demonstrateStage2Btn = document.getElementById('demonstrateStage2Btn');
const resetBtn = document.getElementById('resetBtn');
const speedSlider = document.getElementById('speedSlider');

function init() {
  scene = new THREE.Scene();
  particleGroup = new THREE.Group();

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById('demo-area').appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  camera.position.set(0, 0, 10);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0x404040, 2);
  scene.add(ambientLight);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(0, 5, 5);
  scene.add(directionalLight);

  createPlates();
  createParticles();
  createArrows();
  ruler = createRuler();
  scene.add(particleGroup);
  animate();
}

function createPlates() {
  const geometry = new THREE.BoxGeometry(6, 0.1, 3);
  const material = new THREE.MeshPhongMaterial({ color: 0x3498db });
  plate1 = new THREE.Mesh(geometry, material);
  plate2 = new THREE.Mesh(geometry, material);
  plate1.position.y = -2;
  plate2.position.y = 2;
  scene.add(plate1);
  scene.add(plate2);
}

function createParticles() {
  const particleGeometry = new THREE.SphereGeometry(0.02, 8, 8);
  const redMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
  const greenMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00 });

  for (let i = 0; i < particleCount; i++) {
    const particle = new THREE.Mesh(particleGeometry, i < particleCount / 2 ? redMaterial.clone() : greenMaterial.clone());
    resetParticlePosition(particle);
    particle.userData = {
      angle: Math.random() * Math.PI * 2,
      radius: Math.random() * 1.5 + 0.5,
      ySpeed: (Math.random() - 0.5) * 0.02,
      rotationSpeed: (Math.random() - 0.5) * 0.02,
      isRed: i < particleCount / 2
    };
    particles.push(particle);
    particleGroup.add(particle);
  }
}

function resetParticlePosition(particle) {
  if (particle.userData.isRed) {
    // Red particles between plates
    particle.position.set(
      (Math.random() - 0.5) * 6,
      (Math.random() - 0.5) * (plate2.position.y - plate1.position.y) + (plate2.position.y + plate1.position.y) / 2,
      (Math.random() - 0.5) * 3
    );
  } else {
    // Green particles outside plates
    const yPos = Math.random() < 0.5 ? 
      Math.random() * 5 + plate2.position.y : 
      Math.random() * 5 + plate1.position.y - 5;
    particle.position.set(
      (Math.random() - 0.5) * 6,
      yPos,
      (Math.random() - 0.5) * 3
    );
  }
  particle.userData.angle = Math.random() * Math.PI * 2;
  particle.userData.radius = Math.random() * 1.5 + 0.5;
  particle.userData.ySpeed = (Math.random() - 0.5) * 0.02;
  particle.userData.rotationSpeed = (Math.random() - 0.5) * 0.02;
}

function createArrow(material, scale) {
  const shaftGeometry = new THREE.CylinderGeometry(0.05 * scale, 0.05 * scale, 0.7 * scale, 12);
  const headGeometry = new THREE.ConeGeometry(0.1 * scale, 0.3 * scale, 12);

  const shaft = new THREE.Mesh(shaftGeometry, material);
  const head = new THREE.Mesh(headGeometry, material);

  shaft.position.y = 0.35 * scale;
  head.position.y = 0.85 * scale;

  const arrow = new THREE.Group();
  arrow.add(shaft);
  arrow.add(head);

  return arrow;
}

function createArrows() {
  const greenMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
  const redMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });

  const positions = [-2.25, -0.75, 0.75, 2.25];

  positions.forEach((x) => {
    const arrowTop = createArrow(greenMaterial, 1);
    arrowTop.position.set(x, plate2.position.y + 1.25, 0);
    arrowTop.rotation.x = Math.PI;
    scene.add(arrowTop);
    topOuterArrows.push(arrowTop);

    const arrowBottom = createArrow(greenMaterial, 1);
    arrowBottom.position.set(x, plate1.position.y - 1.25, 0);
    scene.add(arrowBottom);
    bottomOuterArrows.push(arrowBottom);

    const arrowTopInner = createArrow(redMaterial, 1.2);
    arrowTopInner.position.set(x, plate2.position.y - 1.25, 0);
    scene.add(arrowTopInner);
    topInnerArrows.push(arrowTopInner);

    const arrowBottomInner = createArrow(redMaterial, 1.2);
    arrowBottomInner.position.set(x, plate1.position.y + 1.25, 0);
    arrowBottomInner.rotation.x = Math.PI;
    scene.add(arrowBottomInner);
    bottomInnerArrows.push(arrowBottomInner);
  });
}

function updateArrowPositions() {
  topOuterArrows.forEach((arrow) => {
    arrow.position.y = plate2.position.y + 1.25;
  });
  bottomOuterArrows.forEach((arrow) => {
    arrow.position.y = plate1.position.y - 1.25;
  });
  topInnerArrows.forEach((arrow) => {
    arrow.position.y = plate2.position.y - 1.25;
  });
  bottomInnerArrows.forEach((arrow) => {
    arrow.position.y = plate1.position.y + 1.25;
  });
}

function animate() {
  requestAnimationFrame(animate);
  TWEEN.update();

  const plateDistance = plate2.position.y - plate1.position.y;
  const maxDistance = 10; // Maximum distance between plates
  const particleVisibilityThreshold = Math.pow(plateDistance / maxDistance, 2);

  particles.forEach((particle) => {
    particle.userData.angle += particle.userData.rotationSpeed;
    const newX = particle.position.x + Math.cos(particle.userData.angle) * 0.01 * particle.userData.radius;
    const newZ = particle.position.z + Math.sin(particle.userData.angle) * 0.01 * particle.userData.radius;
    
    particle.position.set(newX, particle.position.y + particle.userData.ySpeed, newZ);

    if (particle.userData.isRed) {
      // Red particles
      if (
        particle.position.x > 3 ||
        particle.position.x < -3 ||
        particle.position.y > plate2.position.y ||
        particle.position.y < plate1.position.y ||
        particle.position.z > 1.5 ||
        particle.position.z < -1.5
      ) {
        resetParticlePosition(particle);
      }
      particle.visible = plateDistance > 0.1 && Math.random() < particleVisibilityThreshold;
    } else {
      // Green particles
      if (
        particle.position.x > 3 ||
        particle.position.x < -3 ||
        particle.position.y > plate2.position.y + 5 ||
        particle.position.y < plate1.position.y - 5 ||
        particle.position.z > 1.5 ||
        particle.position.z < -1.5 ||
        (particle.position.y < plate2.position.y && particle.position.y > plate1.position.y)
      ) {
        resetParticlePosition(particle);
      }
      particle.visible = true;
    }
  });

  plateDistanceElement.textContent = plateDistance.toFixed(2);

  renderer.render(scene, camera);
}

function createRuler() {
  const rulerGroup = new THREE.Group();
  
  // Create the main line
  const lineGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, -10, 0),
    new THREE.Vector3(0, 10, 0)
  ]);
  const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
  const line = new THREE.Line(lineGeometry, lineMaterial);
  rulerGroup.add(line);

  // Create tick marks
  for (let i = -10; i <= 10; i++) {
    const tickLength = i % 5 === 0 ? 0.3 : (i % 1 === 0 ? 0.2 : 0.1);
    const tickGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, i, 0),
      new THREE.Vector3(tickLength, i, 0)
    ]);
    const tick = new THREE.Line(tickGeometry, lineMaterial);
    rulerGroup.add(tick);

    // Add labels for every 5th tick
    if (i % 5 === 0) {
      const label = createTextLabel(`${Math.abs(i) * 2}`, 0.8, i, 0); // Moved labels further to the right
      rulerGroup.add(label);
    }
  }

  rulerGroup.position.set(3.5, 0, 0);
  scene.add(rulerGroup);
  return rulerGroup;
}

function createTextLabel(text, x, y, z) {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 64;
  const context = canvas.getContext('2d');
  context.font = 'bold 68px Arial'; // Increased font size and added bold
  context.fillStyle = 'black';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({ map: texture });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(1, 0.5, 1); // Adjusted scale to make text larger
  sprite.position.set(x, y, z);

  return sprite;
}


function demonstrateCasimirEffect(stage) {
  if (isAnimating) return;
  isAnimating = true;
  demonstrateBtn.disabled = true;
  demonstrateStage2Btn.disabled = true;
  resetBtn.disabled = true;

  const speed = 2000 / parseFloat(speedSlider.value);
  let targetY;

  if (stage === 1) {
    targetY = 2.5; // 10nm (5 units)
  } else if (stage === 2) {
    targetY = 0; // 0nm
  }

  new TWEEN.Tween(plate1.position)
    .to({ y: -targetY }, speed)
    .easing(TWEEN.Easing.Quadratic.Out)
    .onUpdate(updateArrowPositions)
    .start();

  new TWEEN.Tween(plate2.position)
    .to({ y: targetY }, speed)
    .easing(TWEEN.Easing.Quadratic.Out)
    .onUpdate(updateArrowPositions)
    .start();

  [...topInnerArrows, ...bottomInnerArrows].forEach((arrow) => {
    new TWEEN.Tween(arrow.scale)
      .to({ x: stage === 1 ? 0.7 : 0.1, y: stage === 1 ? 0.7 : 0.1, z: stage === 1 ? 0.7 : 0.1 }, speed)
      .easing(TWEEN.Easing.Quadratic.Out)
      .start();
  });

  setTimeout(() => {
    isAnimating = false;
    demonstrateBtn.disabled = false;
    demonstrateStage2Btn.disabled = false;
    resetBtn.disabled = false;
  }, speed);
}


function reset() {
  if (isAnimating) return;
  plate1.position.y = -5; // 20nm (10 units)
  plate2.position.y = 5;  // 20nm (10 units)
  updateArrowPositions();

  [...topInnerArrows, ...bottomInnerArrows].forEach((arrow) => {
    arrow.scale.set(1, 1, 1);
  });
}

demonstrateBtn.addEventListener('click', () => demonstrateCasimirEffect(1));
demonstrateStage2Btn.addEventListener('click', () => demonstrateCasimirEffect(2));
resetBtn.addEventListener('click', reset);

window.addEventListener('resize', onWindowResize);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

init();
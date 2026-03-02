import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three-stdlib';

interface ComponentInfo {
  name: string;
  description: string;
  icon: string;
  color: string;
  specs: string;
}

const COMPONENTS: Record<string, ComponentInfo> = {
  'Water Sprinkler': {
    name: 'Water Sprinklers',
    description: 'Dual-nozzle precision irrigation heads with 360° coverage and adjustable spray patterns.',
    icon: 'fa-tint',
    color: '#38bdf8',
    specs: 'Flow Rate: 2.5 L/min | Coverage: 3m radius'
  },
  'LCD Display': {
    name: 'LCD Display',
    description: '16×2 LCD module showing real-time soil moisture %, temperature, humidity, and system status.',
    icon: 'fa-desktop',
    color: '#4ade80',
    specs: '16×2 Characters | I2C Protocol | Backlit'
  },
  'Solar Panel': {
    name: 'Solar Panel',
    description: '10W monocrystalline solar panel with 18% efficiency, providing autonomous power to the system.',
    icon: 'fa-solar-panel',
    color: '#f59e0b',
    specs: '10W Output | 18% Efficiency | IP65 Rating'
  },
  'Water Container': {
    name: 'Water Container',
    description: 'Sealed 2L polypropylene reservoir with float sensor for water level monitoring.',
    icon: 'fa-flask',
    color: '#60a5fa',
    specs: '2L Capacity | Float Sensor | UV-Resistant'
  },
  'Sensor Box': {
    name: 'Sensor Box / ESP32',
    description: 'Weatherproof enclosure housing the ESP32 microcontroller, relay board, and power regulation circuitry.',
    icon: 'fa-microchip',
    color: '#a78bfa',
    specs: 'ESP32 240MHz | WiFi 802.11b/g/n | IP54'
  },
  'Stand': {
    name: 'Tripod Stand',
    description: 'Adjustable aluminium tripod for stable deployment in soft or hard soil. Height: 0.5–1.2m.',
    icon: 'fa-border-none',
    color: '#d1d5db',
    specs: 'Aluminium 6061 | Height: 50–120cm | 2kg Load'
  },
  'Soil Moisture Sensor': {
    name: 'Soil Moisture Sensor',
    description: 'Resistive soil moisture probe inserted 15cm deep, reading 0–100% volumetric water content via ADC.',
    icon: 'fa-seedling',
    color: '#86efac',
    specs: 'Depth: 15cm | Range: 0–100% | ADC 12-bit'
  },
};

const Guardian3DViewer: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isAutoRotate, setIsAutoRotate] = useState(true);
  const [isExploded, setIsExploded] = useState(false);
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);
  const [showReference, setShowReference] = useState(false);
  const [animTick, setAnimTick] = useState(0);
  const [isCanvasActive, setIsCanvasActive] = useState(false);

  const controlsRef = useRef<OrbitControls | null>(null);
  const partsRef = useRef<{ [key: string]: THREE.Object3D }>({});
  const particlesRef = useRef<THREE.Points | null>(null);
  const labelsRef = useRef<HTMLDivElement[]>([]);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const groupRef = useRef<THREE.Group | null>(null);
  const highlightMeshRef = useRef<{ [key: string]: THREE.MeshStandardMaterial[] }>({});
  const isCanvasActiveRef = useRef(false);

  // Tick for animated readouts
  useEffect(() => {
    const timer = setInterval(() => setAnimTick(t => t + 1), 1500);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    let animationId: number;
    let raycaster: THREE.Raycaster;
    let mouse = new THREE.Vector2();
    let waterParticlePositions: Float32Array;
    let waterParticleTick = 0;

    const init = () => {
      const width = container.clientWidth || 800;
      const height = container.clientHeight || 550;

      // --- Scene ---
      const scene = new THREE.Scene();
      scene.background = null;
      sceneRef.current = scene;

      // --- Camera ---
      const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
      camera.position.set(7, 7, 7);
      cameraRef.current = camera;

      // --- Renderer ---
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;
      container.appendChild(renderer.domElement);
      rendererRef.current = renderer;

      // --- Controls ---
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.06;
      controls.autoRotate = true;
      controls.autoRotateSpeed = 1.2;
      controls.minDistance = 4;
      controls.maxDistance = 18;
      controls.target.set(0, 1.2, 0);
      // Disable zoom by default — only enabled when canvas is focused
      // This prevents the 3D viewer hijacking page scroll
      controls.enableZoom = false;
      controlsRef.current = controls;

      // ---- CANVAS FOCUS / SCROLL FIX ----
      // Wheel zoom only activates when user has clicked the canvas.
      // Otherwise the browser wheel event propagates normally (page scrolls).
      const onCanvasMouseDown = () => {
        isCanvasActiveRef.current = true;
        setIsCanvasActive(true);
        if (controlsRef.current) controlsRef.current.enableZoom = true;
      };

      const onOutsideMouseDown = (e: MouseEvent) => {
        if (container && !container.contains(e.target as Node)) {
          isCanvasActiveRef.current = false;
          setIsCanvasActive(false);
          if (controlsRef.current) controlsRef.current.enableZoom = false;
        }
      };

      const onEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          isCanvasActiveRef.current = false;
          setIsCanvasActive(false);
          if (controlsRef.current) controlsRef.current.enableZoom = false;
        }
      };

      renderer.domElement.addEventListener('mousedown', onCanvasMouseDown);
      window.addEventListener('mousedown', onOutsideMouseDown);
      window.addEventListener('keydown', onEscape);

      // --- Lights ---
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
      scene.add(ambientLight);

      const keyLight = new THREE.DirectionalLight(0xfff5e0, 2.5);
      keyLight.position.set(8, 12, 8);
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(2048, 2048);
      keyLight.shadow.camera.near = 0.5;
      keyLight.shadow.camera.far = 40;
      keyLight.shadow.camera.left = -8;
      keyLight.shadow.camera.right = 8;
      keyLight.shadow.camera.top = 8;
      keyLight.shadow.camera.bottom = -8;
      scene.add(keyLight);

      const fillLight = new THREE.DirectionalLight(0x80c8ff, 0.8);
      fillLight.position.set(-6, 4, -4);
      scene.add(fillLight);

      const rimLight = new THREE.SpotLight(0x10b981, 3);
      rimLight.position.set(-3, 8, -5);
      rimLight.angle = Math.PI / 6;
      rimLight.penumbra = 0.5;
      scene.add(rimLight);

      // Ground plane (subtle)
      const groundGeo = new THREE.CircleGeometry(6, 64);
      const groundMat = new THREE.MeshStandardMaterial({
        color: 0x0a1f0f, roughness: 1, metalness: 0,
        transparent: true, opacity: 0.4
      });
      const ground = new THREE.Mesh(groundGeo, groundMat);
      ground.rotation.x = -Math.PI / 2;
      ground.position.y = -2.2;
      ground.receiveShadow = true;
      scene.add(ground);

      // Grid circle lines
      for (let r = 1; r <= 5; r++) {
        const ring = new THREE.Mesh(
          new THREE.RingGeometry(r - 0.01, r + 0.01, 80),
          new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.06, side: THREE.DoubleSide })
        );
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = -2.19;
        scene.add(ring);
      }

      // ===== BUILD THE DEVICE MODEL =====
      const group = new THREE.Group();
      groupRef.current = group;
      highlightMeshRef.current = {};

      const addMaterial = (partName: string, mat: THREE.MeshStandardMaterial): THREE.MeshStandardMaterial => {
        if (!highlightMeshRef.current[partName]) highlightMeshRef.current[partName] = [];
        highlightMeshRef.current[partName].push(mat);
        return mat;
      };

      // ---- 1. TRIPOD STAND ----
      const standGroup = new THREE.Group();
      standGroup.name = 'Stand';

      const poleMat = addMaterial('Stand', new THREE.MeshStandardMaterial({ color: 0xd0d0d8, metalness: 0.8, roughness: 0.25 }));

      // ── Main vertical center pole (tall enough to reach sprinkler)
      const centerPole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.042, 0.042, 5.8, 14),
        poleMat
      );
      centerPole.position.y = 0.7; // center at y=0.7 → bottom y=-2.2, top y=3.6
      centerPole.castShadow = true;
      standGroup.add(centerPole);

      // ── Hub collar where legs branch from the pole ──
      const hubY = -0.9; // height on pole where legs begin
      const footRadius = 1.6; // how far out feet land
      const footY = -2.2;    // ground level for feet

      // Helper: orient a cylinder from pointA to pointB
      const makeLeg = (from: THREE.Vector3, to: THREE.Vector3, radius: number) => {
        const dir = to.clone().sub(from);
        const len = dir.length();
        const geo = new THREE.CylinderGeometry(radius, radius, len, 10);
        const mesh = new THREE.Mesh(geo, poleMat);
        mesh.position.copy(from.clone().lerp(to, 0.5));
        const quat = new THREE.Quaternion();
        quat.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
        mesh.setRotationFromQuaternion(quat);
        mesh.castShadow = true;
        return mesh;
      };

      // ── 3 legs, evenly spaced 120° around the pole ──
      const hubPt = new THREE.Vector3(0, hubY, 0);
      for (let i = 0; i < 3; i++) {
        const angle = (i * Math.PI * 2) / 3;
        const footPt = new THREE.Vector3(
          Math.sin(angle) * footRadius,
          footY,
          Math.cos(angle) * footRadius
        );

        // Main leg: hub → foot
        standGroup.add(makeLeg(hubPt, footPt, 0.028));

        // Foot pad (flat disc at ground)
        const footPad = new THREE.Mesh(
          new THREE.CylinderGeometry(0.08, 0.08, 0.04, 12),
          poleMat
        );
        footPad.position.copy(footPt);
        footPad.castShadow = true;
        standGroup.add(footPad);
      }

      // ── Horizontal ring brace connecting all 3 legs at mid height ──
      const braceY = -1.55;
      const braceRadius = footRadius * 0.6;
      for (let i = 0; i < 3; i++) {
        const a1 = (i * Math.PI * 2) / 3;
        const a2 = ((i + 1) * Math.PI * 2) / 3;
        const p1 = new THREE.Vector3(Math.sin(a1) * braceRadius, braceY, Math.cos(a1) * braceRadius);
        const p2 = new THREE.Vector3(Math.sin(a2) * braceRadius, braceY, Math.cos(a2) * braceRadius);
        standGroup.add(makeLeg(p1, p2, 0.016));
      }

      // ── Short diagonal struts: pole → each brace mid-point ──
      for (let i = 0; i < 3; i++) {
        const a1 = (i * Math.PI * 2) / 3;
        const a2 = ((i + 1) * Math.PI * 2) / 3;
        const midBrace = new THREE.Vector3(
          Math.sin((a1 + a2) / 2) * braceRadius,
          braceY,
          Math.cos((a1 + a2) / 2) * braceRadius
        );
        const poleBase = new THREE.Vector3(0, braceY + 0.3, 0);
        standGroup.add(makeLeg(poleBase, midBrace, 0.014));
      }

      group.add(standGroup);
      partsRef.current['Stand'] = standGroup;

      // ---- 2. SENSOR BOX (ESP32 unit at bottom-center) ----
      const sensorBoxGroup = new THREE.Group();
      sensorBoxGroup.name = 'Sensor Box';
      const boxMat = addMaterial('Sensor Box', new THREE.MeshStandardMaterial({ color: 0xe8e8e8, roughness: 0.6, metalness: 0.05 }));
      const boxGeo = new THREE.BoxGeometry(0.9, 0.7, 0.65);
      const sensorBox = new THREE.Mesh(boxGeo, boxMat);
      sensorBox.castShadow = true;
      sensorBoxGroup.add(sensorBox);

      // Box panel detail
      const panelDetailMat = new THREE.MeshStandardMaterial({ color: 0xb0b8c0, roughness: 0.5 });
      const panelDetail = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.55, 0.03), panelDetailMat);
      panelDetail.position.z = 0.34;
      sensorBoxGroup.add(panelDetail);

      // LEDs on box
      const ledColors = [0x00ff44, 0xff8800, 0xff2244];
      ledColors.forEach((col, i) => {
        const ledMat = new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 2 });
        const led = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 8), ledMat);
        led.position.set(-0.28 + i * 0.14, 0.22, 0.34);
        sensorBoxGroup.add(led);
      });

      sensorBoxGroup.position.set(0, -0.3, 0);
      group.add(sensorBoxGroup);
      partsRef.current['Sensor Box'] = sensorBoxGroup;

      // ---- 3. WATER CONTAINER (mounted on side of pole) ----
      const containerGroup = new THREE.Group();
      containerGroup.name = 'Water Container';
      const ctnMat = addMaterial('Water Container', new THREE.MeshStandardMaterial({
        color: 0xdaeeff, roughness: 0.1, metalness: 0.05, transparent: true, opacity: 0.75
      }));
      const ctnGeo = new THREE.BoxGeometry(0.65, 0.55, 0.45);
      const waterCtn = new THREE.Mesh(ctnGeo, ctnMat);
      waterCtn.castShadow = true;
      containerGroup.add(waterCtn);

      // Water level inside
      const waterLevelMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.55, roughness: 0.1 });
      const waterLevel = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.35, 0.38), waterLevelMat);
      waterLevel.position.y = -0.08;
      containerGroup.add(waterLevel);

      // Cap on top
      const capGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.08, 12);
      const capMat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.4 });
      const cap = new THREE.Mesh(capGeo, capMat);
      cap.position.y = 0.31;
      containerGroup.add(cap);

      containerGroup.position.set(0.6, 0.5, 0.2);
      group.add(containerGroup);
      partsRef.current['Water Container'] = containerGroup;

      // ---- 4. SOLAR PANEL ----
      // Panel is oriented flat (frame in XZ plane), then tilted so the TOP face
      // (where the cells are) faces FORWARD-UPWARD toward the viewer — matching
      // the real hardware photo where the dark-blue cell surface is clearly visible.
      const panelGroup = new THREE.Group();
      panelGroup.name = 'Solar Panel';

      // Outer silver frame — thin box lying flat in XZ plane
      const frameMat = addMaterial('Solar Panel', new THREE.MeshStandardMaterial({ color: 0xb8c0cc, metalness: 0.7, roughness: 0.25 }));
      const frame = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.07, 1.55), frameMat);
      frame.castShadow = true;
      panelGroup.add(frame);

      // Solar cells sit on the TOP face (y = +0.04) of the frame
      const cellColors = [0x15305e, 0x1a3a70, 0x112848];
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 6; col++) {
          const cellMat = addMaterial('Solar Panel', new THREE.MeshStandardMaterial({
            color: cellColors[(row + col) % cellColors.length],
            metalness: 0.35, roughness: 0.2,
            emissive: 0x0a1f50, emissiveIntensity: 0.25
          }));
          const cell = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.015, 0.33), cellMat);
          // Laid flat on the TOP surface of the frame
          cell.position.set(-0.84 + col * 0.34, 0.042, -0.47 + row * 0.35);
          panelGroup.add(cell);

          // Thin silver grid lines between cells
          const lineMat = new THREE.MeshBasicMaterial({ color: 0x8899aa });
          const lineV = new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.02, 0.33), lineMat);
          lineV.position.set(-0.84 + col * 0.34 + 0.152, 0.055, -0.47 + row * 0.35);
          panelGroup.add(lineV);
        }
      }

      // Two diagonal support struts from back of panel to the pole clamp
      const strutMat = new THREE.MeshStandardMaterial({ color: 0x888898, metalness: 0.6, roughness: 0.4 });
      [-0.5, 0.5].forEach(sx => {
        const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.9, 8), strutMat);
        strut.position.set(sx, -0.35, -0.5); // struts go toward the front to reach pole
        strut.rotation.x = -Math.PI / 5;    // angled forward to connect back to pole
        panelGroup.add(strut);
      });

      // Pole clamp / bracket at center-bottom
      const bracketMat = new THREE.MeshStandardMaterial({ color: 0x777780, metalness: 0.8, roughness: 0.3 });
      const bracketH = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.12, 0.12), bracketMat);
      bracketH.position.set(0, -0.12, 0);
      panelGroup.add(bracketH);
      const bracketV = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.45, 0.12), bracketMat);
      bracketV.position.set(0, -0.35, 0);
      panelGroup.add(bracketV);

      // ---- POSITION: BACK SIDE of pole, OPPOSITE the LCD display ----
      // LCD is at z=+0.3 (front face).  Solar panel goes to z=-1.2 (back face).
      // rotation.x = -Math.PI/3.8  =>  top/cell face tilts BACKWARD-UPWARD (away from LCD)
      // rotation.y = +0.25         =>  slight rightward angle (mirrors LCD side)
      panelGroup.position.set(0.4, 1.85, -1.2);
      panelGroup.rotation.x = -Math.PI / 3.8; // cells face BACKWARD-UPWARD (opposite LCD)
      panelGroup.rotation.y = 0.25;           // mirror angle, faces right-back
      group.add(panelGroup);
      partsRef.current['Solar Panel'] = panelGroup;

      // ---- 5. LCD DISPLAY ----
      // The camera sits at (7, 7, 7) — a 45° diagonal above (+X, +Z) corner.
      // To face the camera, the screen must point toward the (+X+Z) direction.
      // We offset the LCD to (0.5, 2.55, 0.5) and rotate.y = -PI/4 so the
      // screen normal becomes (sin(45°), 0, cos(45°)) = (+0.71, 0, +0.71) → toward camera ✓
      const lcdGroup = new THREE.Group();
      lcdGroup.name = 'LCD Display';

      // Green PCB frame (thin in its local Z — becomes the screen face direction)
      const lcdFrameMat = addMaterial('LCD Display', new THREE.MeshStandardMaterial({ color: 0x1e4a1e, roughness: 0.55, metalness: 0.08 }));
      const lcdFrame = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.52, 0.07), lcdFrameMat);
      lcdFrame.castShadow = true;
      lcdGroup.add(lcdFrame);

      // Blue emissive screen on the +Z face of the frame
      const screenMat = new THREE.MeshStandardMaterial({
        color: 0x0a1e40, emissive: 0x1a3fa0, emissiveIntensity: 1.2,
        roughness: 0.1, side: THREE.DoubleSide
      });
      const screen = new THREE.Mesh(new THREE.BoxGeometry(1.22, 0.36, 0.02), screenMat);
      screen.position.z = 0.05;
      lcdGroup.add(screen);

      // Cyan character rows (glowing text simulation)
      for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 16; col++) {
          if (Math.random() > 0.3) {
            const charMat = new THREE.MeshStandardMaterial({
              color: 0x00ffe0, emissive: 0x00ffe0, emissiveIntensity: 2.2,
              side: THREE.DoubleSide
            });
            const char = new THREE.Mesh(new THREE.BoxGeometry(0.048, 0.06, 0.006), charMat);
            char.position.set(-0.55 + col * 0.074, 0.08 - row * 0.18, 0.06);
            lcdGroup.add(char);
          }
        }
      }

      // Bracket arm: goes from bottom of frame diagonally back to the pole
      const armMat2 = new THREE.MeshStandardMaterial({ color: 0x999999, metalness: 0.65, roughness: 0.4 });
      const armH = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.07, 0.8), armMat2);
      armH.position.set(0, -0.38, -0.4);
      lcdGroup.add(armH);
      const armClamp = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.13, 12), armMat2);
      armClamp.position.set(0, -0.38, -0.8);
      lcdGroup.add(armClamp);

      // SOLAR PANEL SIDE: position at (-0.4, 2.55, -0.9)
      // rotation.y = PI → screen face (+Z local) now points toward -Z world = same side as solar panel
      // The bracket arm (-Z local → +Z world after PI flip) reaches back toward the pole.
      lcdGroup.position.set(-0.4, 2.55, -0.9);
      lcdGroup.rotation.y = Math.PI; // screen faces -Z = same side as solar panel
      group.add(lcdGroup);
      partsRef.current['LCD Display'] = lcdGroup;

      // ---- 6. WATER SPRINKLERS ----
      // The sprinkler boom extends FORWARD (+Z) from the front of the pole top,
      // then splits into two upright nozzle heads at the front tip — exactly
      // matching the hardware diagram.
      const sprinklerGroup = new THREE.Group();
      sprinklerGroup.name = 'Water Sprinkler';

      const armMat = addMaterial('Water Sprinkler', new THREE.MeshStandardMaterial({ color: 0xc8ccd4, metalness: 0.78, roughness: 0.18 }));
      const nozzleMat = addMaterial('Water Sprinkler', new THREE.MeshStandardMaterial({ color: 0x8890a0, metalness: 0.88, roughness: 0.15 }));

      const spMountY = 3.35; // height on pole where boom is clamped

      // ── Pole clamp collar ──
      const spCollar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.07, 0.07, 0.14, 16),
        armMat
      );
      spCollar.position.set(0, spMountY, 0);
      sprinklerGroup.add(spCollar);

      // ── Forward boom arm: runs from pole (z=0) to front (z=+1.1) ──
      const boomLen = 1.1;
      const boomArm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.022, 0.022, boomLen, 10),
        armMat
      );
      // Lay it along Z-axis by rotating 90° around X
      boomArm.rotation.x = Math.PI / 2;
      boomArm.position.set(0, spMountY, boomLen / 2); // z midpoint
      sprinklerGroup.add(boomArm);

      // ── Small horizontal cross-bar at the tip of the boom ──
      const tipZ = boomLen; // front end of boom
      const crossBarWidth = 0.9;
      const crossBar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, crossBarWidth, 10),
        armMat
      );
      crossBar.rotation.z = Math.PI / 2; // horizontal along X
      crossBar.position.set(0, spMountY, tipZ);
      sprinklerGroup.add(crossBar);

      // Elbow joint at boom tip
      const elbowJoint = new THREE.Mesh(
        new THREE.SphereGeometry(0.04, 10, 10),
        armMat
      );
      elbowJoint.position.set(0, spMountY, tipZ);
      sprinklerGroup.add(elbowJoint);

      // ── Two upright nozzle assemblies, one on each end of cross-bar ──
      [-crossBarWidth / 2, crossBarWidth / 2].forEach((xOff) => {
        // Riser pipe going UP
        const riser = new THREE.Mesh(
          new THREE.CylinderGeometry(0.018, 0.018, 0.5, 10),
          armMat
        );
        riser.position.set(xOff, spMountY + 0.25, tipZ);
        sprinklerGroup.add(riser);

        // Connector knuckle
        const knuckle = new THREE.Mesh(new THREE.SphereGeometry(0.032, 8, 8), armMat);
        knuckle.position.set(xOff, spMountY + 0.5, tipZ);
        sprinklerGroup.add(knuckle);

        // Nozzle cone body (narrow top = spray outlet, wide bottom = inlet)
        const nozzleBody = new THREE.Mesh(
          new THREE.CylinderGeometry(0.032, 0.062, 0.2, 14),
          nozzleMat
        );
        nozzleBody.position.set(xOff, spMountY + 0.72, tipZ);
        sprinklerGroup.add(nozzleBody);

        // Rotating head disc
        const headDisc = new THREE.Mesh(
          new THREE.CylinderGeometry(0.068, 0.068, 0.028, 16),
          new THREE.MeshStandardMaterial({ color: 0xccd0d8, metalness: 0.72, roughness: 0.22 })
        );
        headDisc.position.set(xOff, spMountY + 0.84, tipZ);
        sprinklerGroup.add(headDisc);

        // Glowing spray outlet ring
        const outletMat = new THREE.MeshStandardMaterial({
          color: 0x38bdf8, emissive: 0x00aaff, emissiveIntensity: 1.4
        });
        const outletRing = new THREE.Mesh(
          new THREE.TorusGeometry(0.052, 0.009, 8, 22),
          outletMat
        );
        outletRing.position.set(xOff, spMountY + 0.856, tipZ);
        outletRing.rotation.x = Math.PI / 2;
        sprinklerGroup.add(outletRing);
      });

      group.add(sprinklerGroup);
      partsRef.current['Water Sprinkler'] = sprinklerGroup;

      // ---- 7. SOIL MOISTURE SENSOR (probe going into ground) ----
      const probeGroup = new THREE.Group();
      probeGroup.name = 'Soil Moisture Sensor';

      const probeMat = addMaterial('Soil Moisture Sensor', new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.7 }));
      const probeBodyMat = addMaterial('Soil Moisture Sensor', new THREE.MeshStandardMaterial({ color: 0x3a7d44, roughness: 0.5 }));

      // PCB body of sensor
      const probePCB = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.18, 0.05), probeBodyMat);
      probePCB.position.set(-1.1, -0.9, 0.6);
      probeGroup.add(probePCB);

      // Two metal prongs
      [-0.07, 0.07].forEach(x => {
        const prong = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.01, 1.0, 8), probeMat);
        prong.position.set(-1.1 + x, -1.4, 0.6);
        probeGroup.add(prong);
      });

      // Wire going up to sensor box
      const wireMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });
      const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.9, 6), wireMat);
      wire.position.set(-0.9, -0.55, 0.4);
      wire.rotation.z = Math.PI / 8;
      probeGroup.add(wire);

      group.add(probeGroup);
      partsRef.current['Soil Moisture Sensor'] = probeGroup;

      // ================================================================
      // ---- PIPE CONNECTIONS, DATA CABLES & EXTENDED WATER SYSTEM ----
      // ================================================================
      const poleR = 0.042;
      const pipeMat = new THREE.MeshStandardMaterial({ color: 0xaab0ba, metalness: 0.75, roughness: 0.22 });
      const clampMat = new THREE.MeshStandardMaterial({ color: 0x888898, metalness: 0.80, roughness: 0.25 });
      // Blue water pipe material
      const waterTubeMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, metalness: 0.5, roughness: 0.3, transparent: true, opacity: 0.9 });
      // Dark data cable material
      const cableMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 });

      // Helper: pipe between any two world-space points
      const makePipe = (from: THREE.Vector3, to: THREE.Vector3, r: number, mat: THREE.Material) => {
        const dir = to.clone().sub(from);
        const len = dir.length();
        if (len < 0.01) return;
        const geo = new THREE.CylinderGeometry(r, r, len, 10);
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.copy(from.clone().lerp(to, 0.5));
        const q = new THREE.Quaternion();
        q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
        mesh.setRotationFromQuaternion(q);
        mesh.castShadow = true;
        group.add(mesh);
      };

      // Structural bracket (grey) from world point to pole surface
      const connectToPole = (wx: number, wy: number, wz: number, r = 0.02) => {
        const from = new THREE.Vector3(wx, wy, wz);
        const to = new THREE.Vector3(0, wy, 0);
        const len = Math.max(from.distanceTo(to) - poleR - 0.03, 0.05);
        const unit = to.clone().sub(from).normalize();
        const end = from.clone().add(unit.multiplyScalar(len));
        makePipe(from, end, r, pipeMat);
        // Clamp collar on pole
        const clamp = new THREE.Mesh(
          new THREE.CylinderGeometry(poleR + 0.032, poleR + 0.032, 0.055, 14), clampMat);
        clamp.position.set(0, wy, 0);
        group.add(clamp);
      };

      // ── 1. SENSOR BOX clamp collars (box hugs the pole) ──
      [[-0.08], [-0.52]].forEach(([y]) => {
        const c = new THREE.Mesh(
          new THREE.CylinderGeometry(poleR + 0.038, poleR + 0.038, 0.08, 14), clampMat);
        c.position.set(0, y, 0);
        group.add(c);
      });

      // ── 2. WATER CONTAINER structural brackets ──
      connectToPole(0.55, 0.50, 0.0, 0.022);
      connectToPole(0.55, 0.25, 0.0, 0.016);
      connectToPole(0.55, 0.75, 0.0, 0.016);

      // ── 3. SOLAR PANEL structural struts ──
      connectToPole(0.4, 1.55, -1.2, 0.022);
      connectToPole(0.4, 1.95, -1.2, 0.018);

      // ── 4. LCD DISPLAY bracket arm ──
      connectToPole(-0.4, 2.18, -0.1, 0.022);

      // ===========================================================
      // ── 5. BLUE WATER PIPE CIRCUIT: Container → Pole → Sprinkler ──
      // ===========================================================
      // A: Container outlet (bottom-left of container) to pole junction
      makePipe(
        new THREE.Vector3(0.27, 0.22, 0.2),   // container bottom face
        new THREE.Vector3(0.07, 0.22, 0.0),   // pole surface at same height
        0.018, waterTubeMat
      );
      // B: Vertical water pipe running up the pole exterior (slightly offset)
      makePipe(
        new THREE.Vector3(0.07, 0.22, 0.0),   // junction at water container height
        new THREE.Vector3(0.07, 3.35, 0.0),   // sprinkler mount height
        0.018, waterTubeMat
      );
      // C: Junction elbow at sprinkler mount
      const elbowW = new THREE.Mesh(new THREE.SphereGeometry(0.028, 8, 8), waterTubeMat);
      elbowW.position.set(0.07, 3.35, 0);
      group.add(elbowW);
      // D: Along the forward boom arm (z direction)
      makePipe(
        new THREE.Vector3(0.07, 3.38, 0.0),
        new THREE.Vector3(0.07, 3.38, 1.6),   // extended boom tip
        0.015, waterTubeMat
      );
      // E: Split to left nozzle riser  
      makePipe(
        new THREE.Vector3(0.07, 3.38, 1.6),
        new THREE.Vector3(-0.45, 3.38, 1.6),
        0.013, waterTubeMat
      );
      // F: Split to right nozzle riser
      makePipe(
        new THREE.Vector3(0.07, 3.38, 1.6),
        new THREE.Vector3(0.45, 3.38, 1.6),
        0.013, waterTubeMat
      );
      // G: Up each nozzle riser
      [-0.45, 0.45].forEach(x => {
        makePipe(
          new THREE.Vector3(x, 3.38, 1.6),
          new THREE.Vector3(x, 4.21, 1.6),
          0.013, waterTubeMat
        );
      });



      // ===========================================================
      // ── 7. SENSOR BOX → LCD DISPLAY data cable ──
      // ===========================================================
      // Cable runs: Sensor Box top (0, -0.3+0.35=0.05) → up pole exterior → LCD display
      // Segment A: from sensor box top up to just below LCD
      makePipe(
        new THREE.Vector3(-0.07, 0.05, 0.0),  // sensor box top, pole side
        new THREE.Vector3(-0.07, 2.18, 0.0),  // up pole to LCD bracket height
        0.010, cableMat
      );
      // Segment B: from pole junction diagonally to LCD position
      makePipe(
        new THREE.Vector3(-0.07, 2.18, 0.0),
        new THREE.Vector3(-0.4, 2.18, -0.9),  // to LCD panel bracket
        0.010, cableMat
      );
      // Segment C: small stub up to LCD frame
      makePipe(
        new THREE.Vector3(-0.4, 2.18, -0.9),
        new THREE.Vector3(-0.4, 2.55, -0.9),
        0.010, cableMat
      );

      // ── 8. Soil moisture sensor wire to sensor box ──
      makePipe(
        new THREE.Vector3(-1.1, -0.9, 0.6),
        new THREE.Vector3(-0.45, -0.35, 0.33),
        0.012, cableMat
      );
      connectToPole(-1.1, -0.9, 0.6, 0.012);

      // ---- WATER PARTICLES (spray from upright nozzle heads at top of pole) ----
      const particleCount = 300;
      waterParticlePositions = new Float32Array(particleCount * 3);
      const particleSizes = new Float32Array(particleCount);

      for (let i = 0; i < particleCount; i++) {
        // Start every particle at one of the two nozzle-head tops (y ≈ 3.705)
        const nozzleX = i % 2 === 0 ? -0.72 : 0.72;
        waterParticlePositions[i * 3 + 0] = nozzleX;
        waterParticlePositions[i * 3 + 1] = 3.705;
        waterParticlePositions[i * 3 + 2] = 0;
        particleSizes[i] = Math.random() * 0.05 + 0.015;
      }

      const particleGeo = new THREE.BufferGeometry();
      particleGeo.setAttribute('position', new THREE.BufferAttribute(waterParticlePositions, 3));
      particleGeo.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1));

      const particleMat = new THREE.PointsMaterial({
        color: 0x80d8ff,
        size: 0.06,
        transparent: true,
        opacity: 0.65,
        sizeAttenuation: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const particles = new THREE.Points(particleGeo, particleMat);
      scene.add(particles);
      particlesRef.current = particles;

      // Background star particles
      const starCount = 600;
      const starPositions = new Float32Array(starCount * 3);
      for (let i = 0; i < starCount; i++) {
        starPositions[i * 3] = (Math.random() - 0.5) * 30;
        starPositions[i * 3 + 1] = (Math.random() - 0.5) * 30;
        starPositions[i * 3 + 2] = (Math.random() - 0.5) * 30;
      }
      const starGeo = new THREE.BufferGeometry();
      starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
      const starMat = new THREE.PointsMaterial({ color: 0x10b981, size: 0.04, transparent: true, opacity: 0.3, sizeAttenuation: true });
      scene.add(new THREE.Points(starGeo, starMat));

      scene.add(group);

      // ---- RAYCASTER ----
      raycaster = new THREE.Raycaster();

      // ---- MOUSE EVENTS ----
      const onMouseMove = (e: MouseEvent) => {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      };

      const onClick = (e: MouseEvent) => {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        if (!groupRef.current) return;
        const intersects = raycaster.intersectObjects(groupRef.current.children, true);
        if (intersects.length > 0) {
          let obj = intersects[0].object;
          while (obj.parent && !obj.parent.name && obj.parent !== groupRef.current) {
            obj = obj.parent;
          }
          const parentName = obj.parent?.name || obj.name;
          if (parentName && COMPONENTS[parentName]) {
            setSelectedPart(prev => prev === parentName ? null : parentName);

            // Cinematic camera zoom to part
            const target = intersects[0].point;
            const startPos = camera.position.clone();
            const zoomPos = target.clone().multiplyScalar(1.4).add(new THREE.Vector3(0, 1, 0));
            const startTarget = controls.target.clone();
            const dur = 900;
            const t0 = performance.now();
            const animCam = (t: number) => {
              const p = Math.min((t - t0) / dur, 1);
              const ease = 1 - Math.pow(1 - p, 4);
              camera.position.lerpVectors(startPos, zoomPos, ease);
              controls.target.lerpVectors(startTarget, target, ease);
              if (p < 1) requestAnimationFrame(animCam);
            };
            requestAnimationFrame(animCam);
          }
        }
      };

      window.addEventListener('mousemove', onMouseMove);
      renderer.domElement.addEventListener('click', onClick);

      // ---- ANIMATION LOOP ----
      const animate = () => {
        animationId = requestAnimationFrame(animate);
        waterParticleTick += 0.04;

        if (controls) {
          controls.autoRotate = isAutoRotate;
          controls.update();
        }

        // Animate water particles — spray from forward boom nozzles
        // Nozzles are at: x=±0.45, y=spMountY+0.856=4.206, z=tipZ=1.1
        if (particlesRef.current) {
          const positions = (particlesRef.current.geometry.attributes.position as THREE.BufferAttribute).array as Float32Array;
          for (let i = 0; i < particleCount; i++) {
            const nozzleX = i % 2 === 0 ? -0.45 : 0.45;
            const nozzleY = 4.206;
            const nozzleZ = 1.1;
            const age = ((waterParticleTick * 0.42 + i * 0.10) % 1.0);
            const spread = 2.2;
            // Spray outward radially from nozzle + forward bias in Z
            const velX = nozzleX * 0.4 + Math.sin(i * 2.3 + waterParticleTick) * spread * 0.4;
            const velZ = 0.4 + Math.cos(i * 1.8 + waterParticleTick) * spread * 0.35;
            positions[i * 3] = nozzleX + velX * age;
            positions[i * 3 + 1] = nozzleY + age * 0.2 - age * age * 5.0; // slight upward then gravity
            positions[i * 3 + 2] = nozzleZ + velZ * age;
          }
          (particlesRef.current.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
          particlesRef.current.material.opacity = 0.62 + Math.sin(waterParticleTick * 2.2) * 0.08;
        }

        // Hover detection
        raycaster.setFromCamera(mouse, camera);
        if (groupRef.current) {
          const intersects = raycaster.intersectObjects(groupRef.current.children, true);
          if (intersects.length > 0) {
            let obj = intersects[0].object;
            while (obj.parent && !obj.parent.name && obj.parent !== groupRef.current) {
              obj = obj.parent;
            }
            const pName = obj.parent?.name || obj.name;
            if (pName && COMPONENTS[pName]) setHoveredPart(pName);
            else setHoveredPart(null);
          } else {
            setHoveredPart(null);
          }
        }

        // Highlight active part
        Object.keys(highlightMeshRef.current).forEach(key => {
          const isActive = key === selectedPart || key === hoveredPart;
          highlightMeshRef.current[key].forEach(mat => {
            if (isActive) {
              mat.emissiveIntensity = 0.35 + Math.sin(Date.now() * 0.003) * 0.15;
              mat.emissive = new THREE.Color(COMPONENTS[key]?.color || '#10b981');
            } else {
              mat.emissiveIntensity = 0;
            }
          });
        });

        renderer.render(scene, camera);
      };

      animate();

      const resizeObserver = new ResizeObserver(() => {
        if (!container || !camera || !renderer) return;
        const w = container.clientWidth;
        const h = container.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      });
      resizeObserver.observe(container);

      return () => {
        resizeObserver.disconnect();
        cancelAnimationFrame(animationId);
        window.removeEventListener('mousemove', onMouseMove);
        renderer.domElement.removeEventListener('click', onClick);
        renderer.domElement.removeEventListener('mousedown', onCanvasMouseDown);
        window.removeEventListener('mousedown', onOutsideMouseDown);
        window.removeEventListener('keydown', onEscape);
        if (container && renderer) container.removeChild(renderer.domElement);
        renderer.dispose();
      };
    };

    const cleanup = init();
    return () => { cleanup?.(); };
  }, []);

  // Auto rotate sync
  useEffect(() => {
    if (controlsRef.current) controlsRef.current.autoRotate = isAutoRotate;
  }, [isAutoRotate]);

  // Explode animation — positions match new stand / sprinkler geometry
  useEffect(() => {
    // "initial" = resting assembled position (group.position offsets set during build)
    const initial: Record<string, [number, number, number]> = {
      'Stand': [0, 0, 0],
      'Sensor Box': [0, -0.3, 0],
      'Water Container': [0.6, 0.5, 0.2],
      'Solar Panel': [0.4, 1.85, -1.2],
      'LCD Display': [-0.4, 2.55, -0.9],
      'Water Sprinkler': [0, 0, 0],
      'Soil Moisture Sensor': [0, 0, 0],
    };
    const exploded: Record<string, [number, number, number]> = {
      'Stand': [0, -3.0, 0],
      'Sensor Box': [3.0, -0.3, 0],
      'Water Container': [3.0, 1.5, 0],
      'Solar Panel': [-0.5, 5.0, -2.5],
      'LCD Display': [-2.5, 4.5, 0],
      'Water Sprinkler': [0, 2.5, 3.0],
      'Soil Moisture Sensor': [-3.0, -2.5, 2.0],
    };

    const dur = 1100;
    const t0 = performance.now();

    const animExplode = (t: number) => {
      const p = Math.min((t - t0) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 4);
      Object.keys(partsRef.current).forEach(key => {
        const part = partsRef.current[key];
        const from = isExploded ? initial[key] : exploded[key];
        const to = isExploded ? exploded[key] : initial[key];
        if (from && to) {
          part.position.lerpVectors(
            new THREE.Vector3(...from),
            new THREE.Vector3(...to),
            ease
          );
        }
      });
      if (p < 1) requestAnimationFrame(animExplode);
    };
    requestAnimationFrame(animExplode);
  }, [isExploded]);

  const selectedInfo = selectedPart ? COMPONENTS[selectedPart] : null;
  const sensorValues = [
    { label: 'Moisture', value: `${65 + (animTick % 8)}%`, icon: 'fa-tint' },
    { label: 'Temp', value: `${26 + (animTick % 4)}°C`, icon: 'fa-thermometer-half' },
    { label: 'Humidity', value: `${58 + (animTick % 5)}%`, icon: 'fa-cloud' },
    { label: 'Solar', value: `${8.2 + (animTick % 3) * 0.1}W`, icon: 'fa-sun' },
  ];

  return (
    <div
      className={`relative w-full rounded-[2.5rem] overflow-hidden shadow-2xl bg-stone-950 transition-all duration-300 ${isCanvasActive
          ? 'border-2 border-emerald-500/60 shadow-emerald-500/10'
          : 'border border-stone-800'
        }`}
      style={{ minHeight: '620px' }}>

      {/* Reference image overlay */}
      {showReference && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-stone-950/95 backdrop-blur-sm">
          <div className="relative max-w-2xl w-full mx-8">
            <button onClick={() => setShowReference(false)}
              className="absolute -top-4 -right-4 z-10 w-10 h-10 bg-stone-800 hover:bg-emerald-600 text-white rounded-full flex items-center justify-center transition-all">
              <i className="fas fa-times text-sm"></i>
            </button>
            <div className="bg-white rounded-[2rem] p-6 shadow-3xl">
              <img
                src="https://res.cloudinary.com/dwi2j4pju/image/upload/v1740230130/o5ftrg25rkdo9ccm97a1.png"
                alt="Guardian Device Reference"
                className="w-full h-auto object-contain rounded-xl"
              />
              <p className="text-center text-stone-500 text-xs mt-4 font-mono uppercase tracking-widest">Reference Hardware Diagram</p>
            </div>
          </div>
        </div>
      )}

      {/* Click-to-interact overlay — shown when canvas is NOT active */}
      {!isCanvasActive && (
        <div className="absolute inset-0 z-20 flex items-end justify-center pb-24 pointer-events-none">
          <div className="flex items-center gap-2.5 px-5 py-2.5 bg-stone-900/80 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl">
            <div className="w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center">
              <i className="fas fa-hand-pointer text-emerald-400 text-[10px]" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-300">
              Click model to enable zoom &amp; scroll
            </span>
          </div>
        </div>
      )}

      {/* Escape hint — shown when canvas IS active */}
      {isCanvasActive && (
        <div className="absolute inset-0 z-20 flex items-end justify-center pb-24 pointer-events-none">
          <div className="flex items-center gap-2.5 px-5 py-2.5 bg-emerald-600/20 backdrop-blur-md border border-emerald-500/30 rounded-2xl shadow-xl">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300">
              Zoom active · Press Esc or click outside to scroll page
            </span>
          </div>
        </div>
      )}

      {/* 3D Canvas */}
      <div ref={containerRef} className="w-full cursor-grab active:cursor-grabbing" style={{ height: '620px' }} />

      {/* Top HUD */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start pointer-events-none">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            <span className="text-emerald-400 font-mono text-[10px] uppercase tracking-[0.3em]">Live 3D Model</span>
          </div>
          <h3 className="text-white text-2xl font-black tracking-tighter">
            AgriSense <span className="text-emerald-400">Smart Irrigation Device</span>
          </h3>
          <p className="text-stone-500 text-[10px] font-mono uppercase tracking-widest mt-1">
            Interactive Hardware Visualization · Click any part to inspect
          </p>
        </div>

        {/* Real-time readouts */}
        <div className="grid grid-cols-2 gap-2">
          {sensorValues.map((sv, i) => (
            <div key={i} className="bg-stone-900/80 backdrop-blur-md border border-stone-800 rounded-xl px-3 py-2 text-right">
              <div className="text-[9px] text-stone-500 font-mono uppercase tracking-widest flex items-center gap-1 justify-end">
                <i className={`fas ${sv.icon} text-emerald-500`}></i> {sv.label}
              </div>
              <div className="text-emerald-400 font-black text-sm font-mono">{sv.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls Bar */}
      <div className="absolute bottom-0 left-0 right-0 p-5 flex justify-between items-end pointer-events-none">
        <div className="flex flex-wrap gap-2 pointer-events-auto">
          <button
            onClick={() => setIsAutoRotate(!isAutoRotate)}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all backdrop-blur-md flex items-center gap-2 ${isAutoRotate ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' : 'bg-stone-900/80 border border-stone-700 text-stone-400'}`}>
            <i className="fas fa-sync-alt"></i>
            {isAutoRotate ? 'Rotating' : 'Rotate'}
          </button>
          <button
            onClick={() => setIsExploded(!isExploded)}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all backdrop-blur-md flex items-center gap-2 ${isExploded ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' : 'bg-stone-900/80 border border-stone-700 text-stone-400'}`}>
            <i className="fas fa-expand-arrows-alt"></i>
            {isExploded ? 'Assemble' : 'Explode'}
          </button>
          <button
            onClick={() => setShowReference(true)}
            className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all backdrop-blur-md bg-stone-900/80 border border-stone-700 text-stone-400 hover:border-emerald-500/50 hover:text-emerald-400 flex items-center gap-2">
            <i className="fas fa-image"></i>
            Reference
          </button>
        </div>

        <div className="flex items-center gap-2 text-stone-600 text-[9px] font-mono uppercase tracking-widest">
          <i className="fas fa-mouse-pointer"></i>
          Drag · Click parts · {isCanvasActive ? 'Scroll = Zoom' : 'Click = Enable Zoom'}
        </div>
      </div>

      {/* Component Legend - Left */}
      <div className="absolute left-5 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 pointer-events-none">
        {Object.keys(COMPONENTS).map((name) => (
          <div key={name}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg backdrop-blur-md transition-all ${selectedPart === name || hoveredPart === name ? 'bg-stone-800/90 border border-emerald-500/40' : 'bg-stone-900/50'}`}>
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: COMPONENTS[name].color }}></div>
            <span className="text-[9px] font-mono text-stone-400 uppercase tracking-widest whitespace-nowrap">{name}</span>
          </div>
        ))}
      </div>

      {/* Hover Label */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-16 pointer-events-none">
        <div className={`px-5 py-2.5 bg-stone-900/90 backdrop-blur-md border rounded-xl text-white text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2 ${hoveredPart && hoveredPart !== selectedPart ? 'opacity-100 translate-y-0 border-emerald-500/40' : 'opacity-0 translate-y-2 border-transparent'}`}>
          {hoveredPart && <i className={`fas ${COMPONENTS[hoveredPart]?.icon}`} style={{ color: COMPONENTS[hoveredPart]?.color }}></i>}
          {hoveredPart}
        </div>
      </div>

      {/* Selected Part Info Panel */}
      {selectedInfo && (
        <div className="absolute right-5 top-1/2 -translate-y-1/2 w-56 pointer-events-auto animate-fade-in">
          <div className="bg-stone-900/95 backdrop-blur-xl border border-stone-700/60 rounded-2xl p-5 shadow-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${selectedInfo.color}22`, color: selectedInfo.color }}>
                <i className={`fas ${selectedInfo.icon} text-base`}></i>
              </div>
              <div>
                <div className="text-[9px] text-stone-500 font-mono uppercase tracking-widest">Component</div>
                <div className="text-white font-black text-xs leading-tight">{selectedInfo.name}</div>
              </div>
            </div>
            <div className="w-full h-px bg-stone-800 mb-3"></div>
            <p className="text-stone-400 text-[10px] leading-relaxed mb-3">{selectedInfo.description}</p>
            <div className="bg-stone-800/60 rounded-lg p-2.5">
              <div className="text-[8px] text-emerald-500 font-mono uppercase tracking-widest mb-1">Specs</div>
              <div className="text-stone-300 text-[9px] font-mono leading-relaxed">{selectedInfo.specs}</div>
            </div>
            <button onClick={() => setSelectedPart(null)}
              className="w-full mt-3 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 text-[9px] font-black uppercase tracking-widest transition-all">
              Close ×
            </button>
          </div>
        </div>
      )}

      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_50%_50%,transparent_40%,rgba(0,0,0,0.55)_100%)]"></div>
    </div>
  );
};

export default Guardian3DViewer;

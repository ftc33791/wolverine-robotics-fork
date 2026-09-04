import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';

/**
 * RobotViewer — Three.js WebGL 3D viewer for the robot.
 * Since STEP files aren't directly importable, we generate a
 * procedural robot representation that matches MATCHSTICK's
 * specs (mecanum drivetrain, funneling intake, indexer, flywheel shooter) and looks
 * photorealistic with proper PBR materials and lighting.
 *
 * When a real GLTF/GLB export of the STEP file is placed at
 * /public/data/robot.glb, this component will auto-load it.
 */
const RobotViewer = ({
  mode = 'hero',           // 'hero' | 'detail' | 'exploded'
  scrollProgress = 0,      // 0-1 drives camera path
  interactive = true,
  showAnnotations = false,
  autoRotate = true,
  height = '100%',
}) => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const robotRef = useRef(null);
  const frameRef = useRef(null);
  const isDragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const targetRot = useRef({ x: 0.2, y: 0 });
  const currentRot = useRef({ x: 0.2, y: 0 });
  const [loaded, setLoaded] = useState(false);
  const [glbFailed, setGlbFailed] = useState(false);

  // ──────────────────────────────────────────────────────────────────
  // Procedural robot geometry (fallback / placeholder geometry
  // that accurately represents MATCHSTICK's subsystems)
  // ──────────────────────────────────────────────────────────────────
  const buildRobot = useCallback((scene, exploded = false) => {
    const group = new THREE.Group();
    const E = exploded ? 1.4 : 1.0; // explode scale

    // PBR materials
    const mkMat = (color, metalness = 0.7, roughness = 0.3, emissive = '#000000') =>
      new THREE.MeshStandardMaterial({ color, metalness, roughness, emissive });

    const mat = {
      chassis:   mkMat('#1a2540', 0.8, 0.25),
      orange:    mkMat('#FF5A1F', 0.6, 0.3, '#220800'),
      silver:    mkMat('#8899AA', 0.9, 0.2),
      dark:      mkMat('#0d1520', 0.85, 0.2),
      wheel:     mkMat('#222831', 0.5, 0.6),
      roller:    mkMat('#FF5A1F', 0.3, 0.7),
      glow:      mkMat('#FF5A1F', 0.0, 0.5, '#FF3D00'),
    };

    const add = (geo, mat, x, y, z, rx = 0, ry = 0, rz = 0) => {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, y, z);
      m.rotation.set(rx, ry, rz);
      m.castShadow = true;
      m.receiveShadow = true;
      group.add(m);
      return m;
    };

    // ── Chassis base plate ──
    add(new THREE.BoxGeometry(0.45, 0.04, 0.4), mat.chassis, 0, 0, 0);

    // ── Side rails ──
    add(new THREE.BoxGeometry(0.45, 0.06, 0.01), mat.orange, 0, 0.01,  0.2);
    add(new THREE.BoxGeometry(0.45, 0.06, 0.01), mat.orange, 0, 0.01, -0.2);

    // ── Mecanum wheels (4x) ──
    const wheelPositions = [
      [-0.19, -0.03,  0.19],
      [ 0.19, -0.03,  0.19],
      [-0.19, -0.03, -0.19],
      [ 0.19, -0.03, -0.19],
    ];
    wheelPositions.forEach(([x, y, z], i) => {
      const wheelGroup = new THREE.Group();
      // wheel body
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.028, 16), mat.wheel);
      body.rotation.z = Math.PI / 2;
      body.castShadow = true;
      wheelGroup.add(body);
      // mecanum rollers (diagonal)
      for (let r = 0; r < 7; r++) {
        const angle = (r / 7) * Math.PI * 2;
        const roller = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.04, 8), mat.roller);
        roller.position.set(0, Math.sin(angle) * 0.048, Math.cos(angle) * 0.048);
        roller.rotation.x = angle + Math.PI / 4;
        roller.rotation.z = Math.PI / 4;
        wheelGroup.add(roller);
      }
      wheelGroup.position.set(x + (i % 2 === 0 ? -E * 0.02 : E * 0.02), y, z + (i < 2 ? E * 0.02 : -E * 0.02));
      group.add(wheelGroup);
    });

    // ── Horizontal extrusion rails ──
    add(new THREE.BoxGeometry(0.42, 0.025, 0.025), mat.silver, 0, 0.06,  0.12);
    add(new THREE.BoxGeometry(0.42, 0.025, 0.025), mat.silver, 0, 0.06, -0.12);

    // ── Odometry pods (swingarm) ──
    add(new THREE.BoxGeometry(0.04, 0.02, 0.06), mat.dark, -0.16, -0.04, 0.14);
    add(new THREE.CylinderGeometry(0.015, 0.015, 0.01, 12), mat.wheel, -0.16, -0.05, 0.14, 0, 0, Math.PI / 2);
    add(new THREE.BoxGeometry(0.04, 0.02, 0.06), mat.dark,  0.16, -0.04, 0.14);
    add(new THREE.CylinderGeometry(0.015, 0.015, 0.01, 12), mat.wheel,  0.16, -0.05, 0.14, 0, 0, Math.PI / 2);

    // ── Funneling intake (front) ──
    const intakeZ = exploded ? -0.22 : 0;
    // Intake ramp / funnel walls
    add(new THREE.BoxGeometry(0.36, 0.03, 0.06), mat.chassis, 0, 0.04, -0.26 + intakeZ);
    add(new THREE.BoxGeometry(0.04, 0.05, 0.12), mat.orange, -0.17, 0.03, -0.28 + intakeZ, 0, 0.52, 0);
    add(new THREE.BoxGeometry(0.04, 0.05, 0.12), mat.orange,  0.17, 0.03, -0.28 + intakeZ, 0, -0.52, 0);
    // Intake rollers (compliant + flap)
    for (let i = 0; i < 5; i++) {
      const rx2 = -0.16 + i * 0.08;
      add(new THREE.CylinderGeometry(0.02, 0.02, 0.08, 12), mat.roller, rx2, 0.05, -0.27 + intakeZ, 0, 0, Math.PI / 2);
    }
    // Limelight on intake-side C-channel
    add(new THREE.BoxGeometry(0.05, 0.03, 0.04), mat.glow, -0.2, 0.1, -0.18 + intakeZ);

    // ── Indexer tunnel (center) ──
    const indexerZ = exploded ? 0.12 : 0;
    add(new THREE.BoxGeometry(0.14, 0.12, 0.22), mat.chassis, 0, 0.1, 0.02 + indexerZ);
    // Dual compliant indexer wheels
    add(new THREE.CylinderGeometry(0.038, 0.038, 0.04, 16), mat.roller, -0.05, 0.1, 0.02 + indexerZ, 0, 0, Math.PI / 2);
    add(new THREE.CylinderGeometry(0.038, 0.038, 0.04, 16), mat.roller,  0.05, 0.1, 0.02 + indexerZ, 0, 0, Math.PI / 2);

    // ── Triple-flywheel shooter (rear/center-top) ──
    const shooterZ = exploded ? 0.28 : 0;
    // Shooter hood
    add(new THREE.BoxGeometry(0.28, 0.18, 0.06), mat.chassis, 0, 0.22, 0.22 + shooterZ, -0.35, 0, 0);
    add(new THREE.BoxGeometry(0.26, 0.005, 0.04), mat.glow, 0, 0.28, 0.24 + shooterZ, -0.2, 0, 0);
    // Three flywheels
    for (let i = 0; i < 3; i++) {
      const fz = 0.18 + i * 0.06 + shooterZ;
      add(new THREE.CylinderGeometry(0.036, 0.036, 0.035, 20), mat.silver, 0, 0.18, fz, 0, 0, Math.PI / 2);
      add(new THREE.CylinderGeometry(0.042, 0.042, 0.038, 20), mat.wheel, 0, 0.18, fz, 0, 0, Math.PI / 2);
    }

    // ── Electronics bay (central) ──
    add(new THREE.BoxGeometry(0.28, 0.07, 0.18), mat.dark, 0, 0.07, 0.04);
    // Control hub indicator light
    add(new THREE.BoxGeometry(0.04, 0.005, 0.04), mat.glow, 0.08, 0.11, 0.04);

    // ── Battery pack ──
    add(new THREE.BoxGeometry(0.16, 0.045, 0.09), mat.orange, -0.08, 0.065, -0.08);

    // ── Wire loom accent details ──
    for (let i = 0; i < 6; i++) {
      add(new THREE.BoxGeometry(0.002, 0.002, 0.12 + Math.random() * 0.06), mat.glow, -0.1 + i * 0.04, 0.06 + Math.random() * 0.04, 0);
    }

    group.position.y = -0.2;
    scene.add(group);
    robotRef.current = group;
    setLoaded(true);
    return group;
  }, []);

  // ──────────────────────────────────────────────────────────────────
  // Scene setup
  // ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const W = mount.clientWidth;
    const H = mount.clientHeight;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2('#061020', 1.8);
    sceneRef.current = scene;

    // Camera
    const cam = new THREE.PerspectiveCamera(42, W / H, 0.01, 50);
    cam.position.set(0, 0.45, 1.5);
    cameraRef.current = cam;

    // ── Lighting ──
    // Ambient
    scene.add(Object.assign(new THREE.AmbientLight('#0a1628', 0.8)));

    // Key light — warm top-left
    const key = new THREE.DirectionalLight('#ffffff', 2.5);
    key.position.set(-2, 4, 2);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.near = 0.5;
    key.shadow.camera.far = 20;
    key.shadow.camera.left = -2;
    key.shadow.camera.right = 2;
    key.shadow.camera.top = 2;
    key.shadow.camera.bottom = -2;
    key.shadow.radius = 4;
    scene.add(key);

    // Fill light — cool blue right
    const fill = new THREE.DirectionalLight('#1E90FF', 1.0);
    fill.position.set(3, 1, -2);
    scene.add(fill);

    // Rim light — orange back
    const rim = new THREE.DirectionalLight('#FF5A1F', 1.8);
    rim.position.set(0, 2, -3);
    scene.add(rim);

    // Point lights for drama
    const ptOrange = new THREE.PointLight('#FF5A1F', 2, 2);
    ptOrange.position.set(0.5, 0.8, 0.5);
    scene.add(ptOrange);

    const ptBlue = new THREE.PointLight('#1E90FF', 1.5, 2.5);
    ptBlue.position.set(-0.5, 0.2, -0.5);
    scene.add(ptBlue);

    // Ground plane
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(4, 4),
      new THREE.MeshStandardMaterial({ color: '#0a1628', metalness: 0.8, roughness: 0.4 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.22;
    ground.receiveShadow = true;
    scene.add(ground);

    // Ground glow circle
    const glowGeo = new THREE.CircleGeometry(0.45, 64);
    const glowMat = new THREE.MeshBasicMaterial({
      color: '#FF5A1F',
      transparent: true,
      opacity: 0.08,
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.rotation.x = -Math.PI / 2;
    glow.position.y = -0.219;
    scene.add(glow);

    // Try loading GLB first
    const tryLoadGlb = () => {
      fetch('/data/robot.glb', { method: 'HEAD' })
        .then((r) => {
          if (!r.ok) throw new Error('no glb');
          return import('three/examples/jsm/loaders/GLTFLoader.js');
        })
        .then(({ GLTFLoader }) => {
          const loader = new GLTFLoader();
          loader.load(
            '/data/robot.glb',
            (gltf) => {
              const model = gltf.scene;
              model.traverse((c) => {
                if (c.isMesh) {
                  c.castShadow = true;
                  c.receiveShadow = true;
                }
              });
              const box = new THREE.Box3().setFromObject(model);
              const center = box.getCenter(new THREE.Vector3());
              const size = box.getSize(new THREE.Vector3());
              const maxDim = Math.max(size.x, size.y, size.z);
              model.scale.setScalar(0.9 / maxDim);
              model.position.sub(center.multiplyScalar(0.9 / maxDim));
              scene.add(model);
              robotRef.current = model;
              setLoaded(true);
            },
            undefined,
            () => {
              setGlbFailed(true);
              buildRobot(scene, mode === 'exploded');
            }
          );
        })
        .catch(() => {
          setGlbFailed(true);
          buildRobot(scene, mode === 'exploded');
        });
    };

    tryLoadGlb();

    // ── Resize ──
    const onResize = () => {
      if (!mount) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      renderer.setSize(w, h);
      cam.aspect = w / h;
      cam.updateProjectionMatrix();
    };
    window.addEventListener('resize', onResize);

    // ── Render loop ──
    let t0 = performance.now();
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const t = (performance.now() - t0) * 0.001;

      if (robotRef.current) {
        // Smooth rotation lerp
        const rotLerp = 0.04;
        currentRot.current.x += (targetRot.current.x - currentRot.current.x) * rotLerp;
        currentRot.current.y += (targetRot.current.y - currentRot.current.y) * rotLerp;

        if (autoRotate && !isDragging.current) {
          targetRot.current.y += 0.003;
        }

        robotRef.current.rotation.x = currentRot.current.x;
        robotRef.current.rotation.y = currentRot.current.y;

        // Subtle idle float
        robotRef.current.position.y = -0.2 + Math.sin(t * 0.8) * 0.012;

        // Camera path driven by scrollProgress
        if (mode === 'hero') {
          const sp = scrollProgress;
          cam.position.x = Math.sin(sp * Math.PI * 0.5) * 0.8;
          cam.position.y = 0.45 + sp * 0.2;
          cam.position.z = 1.5 - sp * 0.3;
          cam.lookAt(0, 0.1, 0);
        }
      }

      // Animate point lights
      ptOrange.intensity = 2 + Math.sin(t * 1.5) * 0.4;
      ptBlue.intensity = 1.5 + Math.cos(t * 1.2) * 0.3;

      renderer.render(scene, cam);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [mode, buildRobot]);

  // ── Drag-to-rotate ──
  useEffect(() => {
    if (!interactive) return;
    const mount = mountRef.current;
    if (!mount) return;

    const onDown = (e) => {
      isDragging.current = true;
      lastMouse.current = { x: e.clientX, y: e.clientY };
    };
    const onMove = (e) => {
      if (!isDragging.current) return;
      const dx = e.clientX - lastMouse.current.x;
      const dy = e.clientY - lastMouse.current.y;
      targetRot.current.y += dx * 0.008;
      targetRot.current.x = Math.max(-0.8, Math.min(0.8, targetRot.current.x + dy * 0.006));
      lastMouse.current = { x: e.clientX, y: e.clientY };
    };
    const onUp = () => { isDragging.current = false; };

    mount.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);

    // Touch
    const onTouchStart = (e) => {
      isDragging.current = true;
      lastMouse.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };
    const onTouchMove = (e) => {
      if (!isDragging.current) return;
      const dx = e.touches[0].clientX - lastMouse.current.x;
      const dy = e.touches[0].clientY - lastMouse.current.y;
      targetRot.current.y += dx * 0.008;
      targetRot.current.x = Math.max(-0.8, Math.min(0.8, targetRot.current.x + dy * 0.006));
      lastMouse.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };
    mount.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onUp);

    return () => {
      mount.removeEventListener('mousedown', onDown);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      mount.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onUp);
    };
  }, [interactive]);

  // Rebuild when mode changes to exploded
  useEffect(() => {
    if (!sceneRef.current || !loaded) return;
    if (robotRef.current) {
      sceneRef.current.remove(robotRef.current);
      robotRef.current = null;
    }
    buildRobot(sceneRef.current, mode === 'exploded');
  }, [mode]);

  return (
    <div
      ref={mountRef}
      className="relative w-full"
      style={{ height, cursor: interactive ? 'grab' : 'default' }}
    >
      {/* Loading state */}
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="flex flex-col items-center gap-4">
            <div
              className="w-10 h-10 border-2 border-t-[#FF5A1F] border-r-[#FF5A1F] border-b-transparent border-l-transparent rounded-full"
              style={{ animation: 'rotate-slow 0.8s linear infinite' }}
            />
            <p
              className="text-[10px] tracking-widest uppercase"
              style={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,90,31,0.6)' }}
            >
              LOADING ROBOT…
            </p>
          </div>
        </div>
      )}

      {/* Drag hint */}
      {loaded && interactive && (
        <div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none transition-opacity duration-1000"
          style={{ opacity: 0.45 }}
        >
          <p
            className="text-[9px] tracking-[0.25em] uppercase"
            style={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.4)' }}
          >
            DRAG TO ROTATE
          </p>
        </div>
      )}

      {/* Annotation overlays */}
      {showAnnotations && loaded && (
        <div className="absolute inset-0 pointer-events-none">
          {[
            { label: 'DRIVEBASE', sub: 'All-metal direct drive', x: '8%', y: '70%' },
            { label: 'INTAKE', sub: 'Funneling ground intake', x: '5%', y: '38%' },
            { label: 'INDEXER', sub: 'High-compression feed', x: '58%', y: '42%' },
            { label: 'SHOOTER', sub: 'Triple-flywheel', x: '68%', y: '12%' },
          ].map((ann, i) => (
            <div
              key={i}
              className="absolute flex items-center gap-2"
              style={{ left: ann.x, top: ann.y, animation: `fade-up 0.6s ${i * 120}ms var(--ease-out-expo) both` }}
            >
              <div className="w-4 h-px" style={{ background: '#FF5A1F' }} />
              <div>
                <p
                  className="text-[9px] font-semibold tracking-widest uppercase"
                  style={{ fontFamily: 'var(--font-mono)', color: '#FF5A1F' }}
                >
                  {ann.label}
                </p>
                <p
                  className="text-[8px] tracking-wider"
                  style={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.35)' }}
                >
                  {ann.sub}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RobotViewer;

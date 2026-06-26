import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * GridScan — full-bleed WebGL animated blueprint grid with scan line.
 * Pure Three.js, no React Three Fiber dep required.
 */
const GridScan = ({
  sensitivity = 0.45,
  lineThickness = 1.2,
  linesColor = '#FF5A1F',
  scanColor = '#FF5A1F',
  scanOpacity = 0.25,
  gridScale = 0.18,
  noiseIntensity = 0.006,
  opacity = 0.5,
}) => {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const rafRef = useRef(null);
  const lookTarget = useRef(new THREE.Vector2(0, 0));
  const lookCurrent = useRef(new THREE.Vector2(0, 0));
  const lookVel = useRef(new THREE.Vector2(0, 0));

  const vert = `varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.0,1.0);}`;
  const frag = `
    precision highp float;
    uniform vec3 iResolution;
    uniform float iTime;
    uniform vec2 uSkew;
    uniform float uLineThickness;
    uniform vec3 uLinesColor;
    uniform vec3 uScanColor;
    uniform float uGridScale;
    uniform float uScanOpacity;
    uniform float uNoise;
    varying vec2 vUv;

    void mainImage(out vec4 fragColor, in vec2 fragCoord) {
      vec2 p = (2.0*fragCoord - iResolution.xy) / iResolution.y;
      vec3 ro = vec3(0.0);
      vec3 rd = normalize(vec3(p, 2.0));
      vec2 skew = clamp(uSkew, vec2(-0.7), vec2(0.7));
      rd.xy += skew * rd.z;

      vec3 color = vec3(0.0);
      float minT = 1e20;
      float fadeStrength = 1.4;
      vec2 gridUV = vec2(0.0);

      for (int i = 0; i < 4; i++) {
        float isY = float(i < 2);
        float pos = mix(-0.2, 0.2, float(i)) * isY + mix(-0.5, 0.5, float(i - 2)) * (1.0 - isY);
        float num = pos - (isY * ro.y + (1.0 - isY) * ro.x);
        float den = isY * rd.y + (1.0 - isY) * rd.x;
        float t = num / den;
        vec3 h = ro + rd * t;
        bool use = t > 0.0 && t < minT;
        gridUV = use ? mix(h.zy, h.xz, isY) / uGridScale : gridUV;
        minT = use ? t : minT;
      }

      vec3 hit = ro + rd * minT;
      float dist = length(hit - ro);
      float fx = fract(gridUV.x);
      float fy = fract(gridUV.y);
      float ax = min(fx, 1.0 - fx);
      float ay = min(fy, 1.0 - fy);
      float wx = fwidth(gridUV.x);
      float wy = fwidth(gridUV.y);
      float halfPx = max(0.0, uLineThickness) * 0.5;
      float tx = halfPx * wx;
      float ty = halfPx * wy;
      float lineX = 1.0 - smoothstep(tx, tx + wx, ax);
      float lineY = 1.0 - smoothstep(ty, ty + wy, ay);
      float lineMask = max(lineX, lineY);
      float fade = exp(-dist * fadeStrength);

      float scanZ = mod(iTime * 0.35, 2.0);
      float dz = abs(hit.z - scanZ);
      float sigma = 0.18;
      float scanPulse = exp(-0.5 * (dz * dz) / (sigma * sigma));

      vec3 gridCol = uLinesColor * lineMask * fade;
      vec3 scanCol = uScanColor * scanPulse * uScanOpacity;
      color = gridCol + scanCol;

      float n = fract(sin(dot(gl_FragCoord.xy + vec2(iTime * 123.4), vec2(12.9898, 78.233))) * 43758.5453123);
      color += (n - 0.5) * uNoise;
      color = clamp(color, 0.0, 1.0);

      float alpha = clamp(max(lineMask * fade, scanPulse * uScanOpacity), 0.0, 1.0) * 0.55;
      fragColor = vec4(color, alpha);
    }

    void main() {
      vec4 c;
      mainImage(c, vUv * iResolution.xy);
      gl_FragColor = c;
    }
  `;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      lookTarget.current.set(
        ((e.clientX - r.left) / r.width) * 2 - 1,
        -(((e.clientY - r.top) / r.height) * 2 - 1)
      );
    };
    const onLeave = () => lookTarget.current.set(0, 0);
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    rendererRef.current = renderer;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const srgb = (hex) => new THREE.Color(hex).convertSRGBToLinear();
    const uniforms = {
      iResolution: { value: new THREE.Vector3(container.clientWidth, container.clientHeight, renderer.getPixelRatio()) },
      iTime: { value: 0 },
      uSkew: { value: new THREE.Vector2(0, 0) },
      uLineThickness: { value: lineThickness },
      uLinesColor: { value: srgb(linesColor) },
      uScanColor: { value: srgb(scanColor) },
      uGridScale: { value: gridScale },
      uScanOpacity: { value: scanOpacity },
      uNoise: { value: noiseIntensity },
    };

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: vert,
      fragmentShader: frag,
      transparent: true,
      depthWrite: false,
      depthTest: false,
    });

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(quad);

    const onResize = () => {
      renderer.setSize(container.clientWidth, container.clientHeight);
      material.uniforms.iResolution.value.set(container.clientWidth, container.clientHeight, renderer.getPixelRatio());
    };
    window.addEventListener('resize', onResize);

    const s = THREE.MathUtils.clamp(sensitivity, 0, 1);
    const skewScale = THREE.MathUtils.lerp(0.04, 0.14, s);
    const smoothTime = THREE.MathUtils.lerp(0.5, 0.15, s);
    let last = performance.now();

    const tick = () => {
      rafRef.current = requestAnimationFrame(tick);
      const now = performance.now();
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      const omega = 2.0 / smoothTime;
      const x = omega * dt;
      const exp = 1.0 / (1.0 + x + 0.48 * x * x + 0.235 * x * x * x);
      const tx = lookTarget.current.x - lookCurrent.current.x;
      const ty = lookTarget.current.y - lookCurrent.current.y;
      lookVel.current.x = (lookVel.current.x + omega * tx) * exp;
      lookVel.current.y = (lookVel.current.y + omega * ty) * exp;
      lookCurrent.current.x = lookTarget.current.x - (tx + lookVel.current.x * dt) * exp;
      lookCurrent.current.y = lookTarget.current.y - (ty + lookVel.current.y * dt) * exp;

      material.uniforms.uSkew.value.set(
        lookCurrent.current.x * skewScale,
        lookCurrent.current.y * skewScale
      );
      material.uniforms.iTime.value = now * 0.001;
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', onResize);
      material.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none"
      style={{ opacity }}
    />
  );
};

export default GridScan;

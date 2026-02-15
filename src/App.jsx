import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, ChevronRight, Award, Calendar, Users, Mail, MapPin, Github, Linkedin, Instagram, Zap } from 'lucide-react';
import * as THREE from 'three';

// Updated ClawMarkImage component - now uses claw.png everywhere
const ClawMarkImage = ({ opacity = 0.15, className = "" }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const hasChecked = useRef(false);
  
  useEffect(() => {
    if (hasChecked.current) return;
    hasChecked.current = true;
    
    const img = new Image();
    img.onload = () => {
      setImageLoaded(true);
      setImageError(false);
    };
    img.onerror = () => {
      setImageError(true);
      setImageLoaded(true);
    };
    img.src = '/claw.png';
  }, []);
  
  return (
    <div className={`absolute pointer-events-none ${className}`} style={{ opacity }}>
      {imageLoaded && !imageError ? (
        <img 
          src="/claw.png" 
          alt="Wolverine Claw" 
          className="w-full h-full object-contain"
          style={{ filter: 'brightness(1.3) contrast(1.2)' }}
        />
      ) : (
        // Simple fallback while loading or on error
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-orange-500/30 text-6xl font-black">⚡</div>
        </div>
      )}
    </div>
  );
};

const AngleButton = ({ children, onClick, variant = 'primary', className = '' }) => {
  const baseClasses = "relative px-8 py-4 font-bold transition-all duration-300 overflow-hidden group";
  const variantClasses = {
    primary: "bg-gradient-to-br from-orange-600 to-orange-700 text-white hover:from-orange-500 hover:to-orange-600 hover:shadow-2xl hover:shadow-orange-600/50 hover:scale-105",
    secondary: "bg-gradient-to-br from-blue-900 to-blue-950 text-white border-2 border-blue-500 hover:border-blue-400 hover:shadow-2xl hover:shadow-blue-500/40 hover:scale-105",
    ghost: "bg-transparent text-white border-2 border-orange-500 hover:bg-orange-500/10 hover:border-orange-400 hover:shadow-2xl hover:shadow-orange-500/40 hover:scale-105"
  };

  return (
    <button 
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={{
        clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)'
      }}
    >
      {/* Diagonal sweep effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
      
      {/* Pulsing glow on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse-glow"
           style={{
             boxShadow: 'inset 0 0 20px rgba(255, 90, 31, 0.4)',
           }} />
      
      <span className="relative z-10 flex items-center gap-2 group-hover:translate-x-1 transition-transform duration-300">
        {children}
      </span>
    </button>
  );
};

const SponsorCard = ({ sponsor }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const hasChecked = useRef(false);
  const initials = sponsor.name.split(' ').map(word => word[0]).join('');
  
  useEffect(() => {
    if (hasChecked.current) return;
    hasChecked.current = true;
    
    const img = new Image();
    img.onload = () => {
      setImageLoaded(true);
      setImageError(false);
    };
    img.onerror = () => {
      setImageError(true);
      setImageLoaded(true);
    };
    img.src = sponsor.image;
  }, [sponsor.image]);
  
  return (
    <div 
      className="aspect-video bg-white flex items-center justify-center mb-6 overflow-hidden relative group transition-all duration-500 hover:scale-[1.03]"
      style={{
        clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 0 100%)'
      }}
    >
      {!imageLoaded ? (
        <div className="w-full h-full bg-gradient-to-br from-[#132038] to-[#FF5A1F] flex items-center justify-center">
          <div className="text-white text-6xl font-black animate-pulse">{initials}</div>
        </div>
      ) : imageError ? (
        <div className="w-full h-full bg-gradient-to-br from-[#132038] to-[#FF5A1F] flex items-center justify-center">
          <div className="text-white text-6xl font-black">{initials}</div>
        </div>
      ) : (
        <img 
          src={sponsor.image} 
          alt={sponsor.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
        />
      )}
      
      {/* Orange edge glow on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse-glow"
           style={{
             boxShadow: 'inset 0 0 30px rgba(255, 90, 31, 0.5)',
           }} />
    </div>
  );
};

const TeamMemberCard = ({ member, size = 'small', showRookie = false }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const hasChecked = useRef(false);
  
  useEffect(() => {
    if (hasChecked.current) return;
    hasChecked.current = true;
    
    const img = new Image();
    img.onload = () => {
      setImageLoaded(true);
      setImageError(false);
    };
    img.onerror = () => {
      setImageError(true);
      setImageLoaded(true);
    };
    img.src = member.image;
  }, [member.image]);
  
  const sizeClasses = size === 'small' 
    ? 'w-28 h-28 text-3xl' 
    : 'aspect-square text-6xl';
  
  return (
    <div className="relative">
      {/* CARD CONTAINER - REDUCED HOVER SCALE */}
      <div 
        className={`${sizeClasses} bg-gradient-to-br from-[#132038] to-[#1a2847] mx-auto flex items-center justify-center text-white font-black overflow-hidden relative border-2 border-[#A2A9B1] group transition-all duration-500 hover:scale-[1.05] hover:border-orange-600`}
        style={{
          clipPath: size === 'small' 
            ? 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)'
            : 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%)',
        }}
      >
        {/* PHOTO - STAYS STATIC, NO ANIMATIONS */}
        {!imageLoaded || imageError ? (
          <span className="animate-pulse">{member.initials}</span>
        ) : (
          <img 
            src={member.image} 
            alt={member.name} 
            className="w-full h-full object-cover" 
          />
        )}
        
        {/* Subtle gradient overlay - part of card */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#132038]/80 via-transparent to-transparent opacity-60" />
        
        {/* Orange edge glow on hover - applies to CARD */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse-glow"
             style={{
               boxShadow: 'inset 0 0 30px rgba(255, 90, 31, 0.6)',
             }} />
        
        {/* Diagonal accent line animation - applies to CARD */}
        <div className="absolute top-0 right-0 w-0 h-0.5 bg-gradient-to-r from-transparent via-orange-500 to-transparent group-hover:w-full transition-all duration-500" />
        <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-transparent via-orange-500 to-transparent group-hover:w-full transition-all duration-500 delay-100" />
      </div>
      
      {showRookie && member.rookie && (
        <div 
          className="absolute -top-2 -right-2 bg-orange-600 text-white text-xs font-black px-3 py-1 shadow-lg z-10 animate-pulse border border-orange-400"
          style={{
            clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)',
            boxShadow: '0 4px 15px rgba(255, 90, 31, 0.5)'
          }}
        >
          ROOKIE
        </div>
      )}
    </div>
  );
};

const RobotImage = ({ src, alt, fallbackText }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const hasChecked = useRef(false);
  
  useEffect(() => {
    if (hasChecked.current) return;
    hasChecked.current = true;
    
    const img = new Image();
    img.onload = () => {
      setImageLoaded(true);
      setImageError(false);
    };
    img.onerror = () => {
      setImageError(true);
      setImageLoaded(true);
    };
    img.src = src;
  }, [src]);
  
  return (
    <>
      {!imageLoaded || imageError ? (
        <span className="text-white font-black text-8xl animate-pulse">{fallbackText}</span>
      ) : (
        <img 
          src={src} 
          alt={alt} 
          className="w-full h-full object-cover" 
        />
      )}
    </>
  );
};

const LogoImage = () => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const hasChecked = useRef(false);
  
  useEffect(() => {
    if (hasChecked.current) return;
    hasChecked.current = true;
    
    const img = new Image();
    img.onload = () => {
      setImageLoaded(true);
      setImageError(false);
    };
    img.onerror = () => {
      setImageError(true);
      setImageLoaded(true);
    };
    img.src = '/data/logo.svg';
  }, []);
  
  return (
    <div 
      className="w-12 h-12 flex items-center justify-center overflow-hidden"
      style={{
        clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)'
      }}
    >
      {!imageLoaded || imageError ? (
        <div className="w-full h-full bg-gradient-to-br from-orange-600 to-orange-800 flex items-center justify-center text-white font-black text-xl">
          WR
        </div>
      ) : (
        <img 
          src="/data/logo.svg" 
          alt="Wolverine Robotics Logo" 
          className="w-full h-full object-contain" 
        />
      )}
    </div>
  );
};

const GridScan = ({ sensitivity = 0.55, lineThickness = 1, linesColor = '#FF5A1F', scanColor = '#FF5A1F', scanOpacity = 0.3, gridScale = 0.15, noiseIntensity = 0.008 }) => {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const rafRef = useRef(null);
  
  const lookTarget = useRef(new THREE.Vector2(0, 0));
  const lookCurrent = useRef(new THREE.Vector2(0, 0));
  const lookVel = useRef(new THREE.Vector2(0, 0));

  const vert = `
varying vec2 vUv;
void main(){
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

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

void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
    vec2 p = (2.0 * fragCoord - iResolution.xy) / iResolution.y;
    vec3 ro = vec3(0.0);
    vec3 rd = normalize(vec3(p, 2.0));

    vec2 skew = clamp(uSkew, vec2(-0.7), vec2(0.7));
    rd.xy += skew * rd.z;

    vec3 color = vec3(0.0);
    float minT = 1e20;
    float fadeStrength = 1.5;
    vec2 gridUV = vec2(0.0);

    for (int i = 0; i < 4; i++)
    {
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
    float aax = wx;
    float aay = wy;

    float lineX = 1.0 - smoothstep(tx, tx + aax, ax);
    float lineY = 1.0 - smoothstep(ty, ty + aay, ay);
    float lineMask = max(lineX, lineY);

    float fade = exp(-dist * fadeStrength);

    float scanZ = mod(iTime * 0.4, 2.0);
    float dz = abs(hit.z - scanZ);
    float sigma = 0.2;
    float scanPulse = exp(-0.5 * (dz * dz) / (sigma * sigma));

    vec3 gridCol = uLinesColor * lineMask * fade;
    vec3 scanCol = uScanColor * scanPulse * uScanOpacity;

    color = gridCol + scanCol;

    float n = fract(sin(dot(gl_FragCoord.xy + vec2(iTime * 123.4), vec2(12.9898,78.233))) * 43758.5453123);
    color += (n - 0.5) * uNoise;
    color = clamp(color, 0.0, 1.0);
    float alpha = clamp(max(lineMask * fade, scanPulse * uScanOpacity), 0.0, 1.0) * 0.6;
    fragColor = vec4(color, alpha);
}

void main(){
  vec4 c;
  mainImage(c, vUv * iResolution.xy);
  gl_FragColor = c;
}
`;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    
    const onMove = e => {
      const rect = el.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      lookTarget.current.set(nx, ny);
    };
    
    const onLeave = () => {
      lookTarget.current.set(0, 0);
    };
    
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

    const srgbColor = (hex) => {
      const c = new THREE.Color(hex);
      return c.convertSRGBToLinear();
    };

    const uniforms = {
      iResolution: {
        value: new THREE.Vector3(container.clientWidth, container.clientHeight, renderer.getPixelRatio())
      },
      iTime: { value: 0 },
      uSkew: { value: new THREE.Vector2(0, 0) },
      uLineThickness: { value: lineThickness },
      uLinesColor: { value: srgbColor(linesColor) },
      uScanColor: { value: srgbColor(scanColor) },
      uGridScale: { value: gridScale },
      uScanOpacity: { value: scanOpacity },
      uNoise: { value: noiseIntensity }
    };

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: vert,
      fragmentShader: frag,
      transparent: true,
      depthWrite: false,
      depthTest: false
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
    const skewScale = THREE.MathUtils.lerp(0.04, 0.15, s);
    const smoothTime = THREE.MathUtils.lerp(0.5, 0.15, s);
    const maxSpeed = Infinity;

    let last = performance.now();
    const tick = () => {
      const now = performance.now();
      const dt = Math.max(0, Math.min(0.1, (now - last) / 1000));
      last = now;

      const smoothDampVec2 = (current, target, currentVelocity, smoothTime, maxSpeed, deltaTime) => {
        const out = current.clone();
        smoothTime = Math.max(0.0001, smoothTime);
        const omega = 2 / smoothTime;
        const x = omega * deltaTime;
        const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);

        let change = current.clone().sub(target);
        const maxChange = maxSpeed * smoothTime;
        if (change.length() > maxChange) change.setLength(maxChange);

        const newTarget = current.clone().sub(change);
        const temp = currentVelocity.clone().addScaledVector(change, omega).multiplyScalar(deltaTime);
        currentVelocity.sub(temp.clone().multiplyScalar(omega));
        currentVelocity.multiplyScalar(exp);

        out.copy(newTarget.clone().add(change.add(temp).multiplyScalar(exp)));
        return out;
      };

      lookCurrent.current.copy(
        smoothDampVec2(lookCurrent.current, lookTarget.current, lookVel.current, smoothTime, maxSpeed, dt)
      );

      const skew = new THREE.Vector2(lookCurrent.current.x * skewScale, -lookCurrent.current.y * 1.2 * skewScale);
      material.uniforms.uSkew.value.set(skew.x, skew.y);
      material.uniforms.iTime.value = now / 1000;
      
      renderer.render(scene, camera);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', onResize);
      material.dispose();
      quad.geometry.dispose();
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, [sensitivity, lineThickness, linesColor, scanColor, scanOpacity, gridScale, noiseIntensity]);

  return <div ref={containerRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />;
};

// FIXED: Loading screen now uses claw.png image
const InitialLoadAnimation = ({ onComplete }) => {
  const [phase, setPhase] = useState('grid');
  const [clawImageLoaded, setClawImageLoaded] = useState(false);
  const [clawImageError, setClawImageError] = useState(false);
  const [imagesPreloaded, setImagesPreloaded] = useState(false);
  
  // Preload claw image
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setClawImageLoaded(true);
      setClawImageError(false);
    };
    img.onerror = () => {
      setClawImageError(true);
      setClawImageLoaded(true);
    };
    img.src = '/data/logo.svg';
  }, []);
  
  // Preload critical images
  useEffect(() => {
    const criticalImages = [
      '/data/logo.svg',
      '/claw.png',
      '/data/robots/matchstick-main.jpg',
      '/data/robots/matchstick-1.jpg',
      '/data/robots/matchstick-2.jpg',
      '/data/robots/matchstick-3.jpg',
      '/data/robots/matchstick-4.jpg',
      '/data/team/dev.jpg',
      '/data/team/sahejdeep.jpg',
      '/data/team/sripadh.jpg',
      '/data/team/manveer.jpg',
      '/data/sponsors/whs.png',
      '/data/sponsors/nhs.png'
    ];
    
    let loadedCount = 0;
    const totalImages = criticalImages.length;
    
    const checkAllLoaded = () => {
      loadedCount++;
      if (loadedCount >= totalImages) {
        setImagesPreloaded(true);
      }
    };
    
    criticalImages.forEach(src => {
      const img = new Image();
      img.onload = checkAllLoaded;
      img.onerror = checkAllLoaded; // Continue even if image fails
      img.src = src;
    });
  }, []);
  
  useEffect(() => {
    // Only start animation phases after images are preloaded
    if (!imagesPreloaded) return;
    
    const gridTimer = setTimeout(() => {
      setPhase('logo');
    }, 800);
    
    const logoTimer = setTimeout(() => {
      setPhase('complete');
    }, 1600);
    
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 2200);
    
    return () => {
      clearTimeout(gridTimer);
      clearTimeout(logoTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete, imagesPreloaded]);
  
  return (
    <div className={`fixed inset-0 z-[200] bg-[#132038] flex items-center justify-center transition-opacity duration-500 ${phase === 'complete' ? 'opacity-0' : 'opacity-100'}`}>
      {/* Animated slash line that cuts across - BEHIND logo */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <div 
          className={`absolute h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent transition-all duration-1000 ${
            phase === 'grid' ? 'w-0 left-1/2 top-1/2' : 'w-[141%] -left-[20%] top-1/2'
          }`}
          style={{ 
            boxShadow: '0 0 30px rgba(255, 90, 31, 1)',
            transform: 'rotate(-45deg)',
            transformOrigin: 'center'
          }} 
        />
      </div>
      
      {/* Logo assembly in center - ALWAYS IN FRONT */}
      <div className={`relative z-20 transition-all duration-700 ${phase === 'logo' || phase === 'complete' ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
        <div className="relative flex flex-col items-center">
          {/* 320px claw image with slash reveal - centered */}
          <div className="w-80 h-80 relative mb-8 flex items-center justify-center mx-auto">
            {/* Opaque background so slash doesn't show through */}
            <div className="absolute inset-0 bg-[#132038] z-0" />
            
            {clawImageLoaded && !clawImageError ? (
              <img 
                src="/data/logo.svg" 
                alt="Wolverine Claw" 
                className={`w-full h-full object-contain transition-all duration-1000 relative z-10 ${
                  phase === 'logo' || phase === 'complete' ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
                }`}
                style={{ 
                  filter: 'brightness(1.5) contrast(1.3) drop-shadow(0 0 50px rgba(255, 90, 31, 1))',
                }}
              />
            ) : (
              // Fallback lightning bolt
              <div className={`text-orange-500 text-9xl font-black transition-all duration-700 relative z-10 ${
                phase === 'logo' || phase === 'complete' ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
              }`}>⚡</div>
            )}
            
            {/* Pulsing glow - optimized blur */}
            <div className="absolute inset-0 bg-orange-500/40 blur-3xl animate-pulse z-5" />
          </div>
          
          {/* Team name */}
          <div className="text-center w-full">
            <h1 className="text-7xl font-black text-white mb-3 tracking-tight" style={{fontFamily: 'system-ui, -apple-system, sans-serif'}}>
              WOLVERINE
            </h1>
            <p className="text-orange-500 font-black text-3xl tracking-widest">ROBOTICS</p>
            <p className="text-[#A2A9B1] font-mono text-lg mt-6 tracking-wider">TEAM 33791</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState({});
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [pageTransitioning, setPageTransitioning] = useState(false);
  const [displayPage, setDisplayPage] = useState('home'); // The page actually being rendered
  const [transitionPhase, setTransitionPhase] = useState('none'); // 'out' or 'in' or 'none'

  // Set favicon on mount
  useEffect(() => {
    const setFavicon = () => {
      // Remove any existing favicon
      const existingFavicon = document.querySelector("link[rel*='icon']");
      if (existingFavicon) {
        existingFavicon.parentNode.removeChild(existingFavicon);
      }
      
      // Create new favicon
      const favicon = document.createElement('link');
      favicon.rel = 'icon';
      favicon.type = 'image/svg+xml';
      favicon.href = '/data/logo.svg';
      document.head.appendChild(favicon);
    };
    
    setFavicon();
  }, []);

  // Update URL when page changes
  useEffect(() => {
    const path = currentPage === 'home' ? '/' : `/${currentPage}`;
    window.history.pushState({}, '', path);
  }, [currentPage]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const page = path === '/' ? 'home' : path.substring(1);
      if (['home', 'about', 'robots', 'sponsors', 'contact'].includes(page)) {
        setCurrentPage(page);
      }
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes slideInDiagonal {
        from {
          opacity: 0;
          transform: translate(-60px, 60px);
        }
        to {
          opacity: 1;
          transform: translate(0, 0);
        }
      }
      @keyframes slideInDiagonalReverse {
        from {
          opacity: 0;
          transform: translate(60px, -60px);
        }
        to {
          opacity: 1;
          transform: translate(0, 0);
        }
      }
      @keyframes lockInPlace {
        from {
          opacity: 0;
          transform: translateX(-40px);
        }
        50% {
          transform: translateX(5px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
      @keyframes scaleIn {
        from {
          opacity: 0;
          transform: scale(0.9);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }
      @keyframes growIn {
        from {
          opacity: 0;
          transform: scale(0.85);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }
      @keyframes pulseglow {
        0%, 100% {
          box-shadow: 0 0 5px rgba(255, 90, 31, 0.3);
        }
        50% {
          box-shadow: 0 0 25px rgba(255, 90, 31, 0.6);
        }
      }
      @keyframes slideDownFade {
        from {
          opacity: 0;
          transform: translateY(-100%);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes expandFromCenter {
        from {
          opacity: 0;
          transform: scale(0.5);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }
      @keyframes clawSlashOut {
        0% {
          clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
          opacity: 1;
        }
        100% {
          clip-path: polygon(100% 0, 100% 0, 100% 100%, 100% 100%);
          opacity: 0;
        }
      }
      @keyframes clawSlashIn {
        0% {
          clip-path: polygon(0 0, 0 0, 0 100%, 0 100%);
          opacity: 0;
        }
        100% {
          clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
          opacity: 1;
        }
      }
      .animate-fade-in-up {
        animation: fadeInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        opacity: 0;
      }
      .animate-fade-in {
        animation: fadeIn 0.6s ease-out forwards;
        opacity: 0;
      }
      .animate-scale-in {
        animation: scaleIn 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        opacity: 0;
      }
      .animate-grow-in {
        animation: growIn 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        opacity: 0;
      }
      .animate-slide-diagonal {
        animation: slideInDiagonal 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        opacity: 0;
      }
      .animate-slide-diagonal-reverse {
        animation: slideInDiagonalReverse 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        opacity: 0;
      }
      .animate-lock-in {
        animation: lockInPlace 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        opacity: 0;
      }
      .animate-pulse-glow {
        animation: pulseglow 2s ease-in-out infinite;
      }
      .animate-slide-down-fade {
        animation: slideDownFade 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }
      .animate-expand-center {
        animation: expandFromCenter 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        opacity: 0;
      }
      .animate-claw-slash-out {
        animation: clawSlashOut 0.6s cubic-bezier(0.4, 0, 0.6, 1) forwards;
        will-change: clip-path, opacity;
      }
      .animate-claw-slash-in {
        animation: clawSlashIn 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        will-change: clip-path, opacity;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Page change effect - claw slash transition WITHOUT the glowing lines
  useEffect(() => {
    if (currentPage === displayPage) return; // No change needed
    if (currentPage === 'home' && isInitialLoad) return;
    
    // Phase 1: Claw slashes current page away
    setPageTransitioning(true);
    setTransitionPhase('out');
    
    // Phase 2: Mid-transition - scroll to top while slash is covering screen
    const scrollTimer = setTimeout(() => {
      window.scrollTo(0, 0); // INSTANT teleport while slash covers the screen
    }, 350); // Slightly later for better masking
    
    // Phase 3: After slash-out, switch page and slash new page in
    const switchTimer = setTimeout(() => {
      setDisplayPage(currentPage);
      setIsVisible({}); // Reset all visibility
      setTransitionPhase('in');
    }, 600); // Longer slash-out for better masking
    
    // Phase 4: End transition after slash-in completes
    const endTimer = setTimeout(() => {
      setPageTransitioning(false);
      setTransitionPhase('none');
    }, 1200); // Total: 600ms out + 600ms in
    
    return () => {
      clearTimeout(scrollTimer);
      clearTimeout(switchTimer);
      clearTimeout(endTimer);
    };
  }, [currentPage, isInitialLoad]); // Remove displayPage from dependencies to prevent double-trigger

  // Scroll-based intersection observer - triggers animations on scroll
  useEffect(() => {
    // Small delay to ensure DOM is ready after page change
    const setupTimer = setTimeout(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && entry.target.id) {
              setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }));
            }
          });
        },
        { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
      );

      const elements = document.querySelectorAll('[data-animate]');
      elements.forEach((el) => {
        if (el.id) {
          observer.observe(el);
        }
      });

      return () => {
        observer.disconnect();
      };
    }, isInitialLoad ? 200 : 150); // Longer delay on initial load to ensure everything is ready
    
    return () => clearTimeout(setupTimer);
  }, [displayPage, isInitialLoad]); // Track both displayPage and isInitialLoad

  const navigation = [
    { name: 'HOME', id: 'home' },
    { name: 'ABOUT', id: 'about' },
    { name: 'ROBOTS', id: 'robots' },
    { name: 'SPONSORS', id: 'sponsors' },
    { name: 'CONTACT', id: 'contact' },
  ];

  const teamMembers = {
    students: [
      { name: 'Dev Gavande', role: 'Team Captain, Founder, Driver, CAD Lead, Build Team Lead', image: '/data/team/dev.jpg', initials: 'DG', rookie: false },
      { name: 'Sahejdeep Singh', role: 'Software, Drive Coach, Build Team', image: '/data/team/sahejdeep.jpg', initials: 'SS', rookie: true },
      { name: 'Sripaadh J Kuppusamy', role: 'Human Player and Build Team', image: '/data/team/sripadh.jpg', initials: 'SK', rookie: true },
      { name: 'Manveer Singh Tib', role: 'Human Player and Build Team', image: '/data/team/manveer.jpg', initials: 'MT', rookie: true },
      { name: 'Piousvir Singh', role: 'Build Team', image: '/data/team/pious.jpg', initials: 'PS', rookie: true },
      { name: 'Kalvik Das', role: 'Outreach', image: '/data/team/Kalvik.jpg', initials: 'KD', rookie: true },
      { name: 'Jacob Esparza', role: 'Outreach', image: '/data/team/Jacob.jpeg', initials: 'JE', rookie: true },
      { name: 'Alexander Fiderfish', role: 'Outreach', image: '/data/team/member9.jpg', initials: 'AF', rookie: true },
      { name: 'Pratham Erramilli', role: 'Outreach', image: '/data/team/pratham.jpg', initials: 'PE', rookie: true },
      { name: 'Abhi Ravulaparthy', role: 'Outreach', image: '/data/team/member11.jpg', initials: 'AR', rookie: true },
      { name: 'Kavin Murugan', role: 'Outreach', image: '/data/team/kavin.jpg', initials: 'KM', rookie: true },
      { name: 'Kaiden Lee', role: 'Outreach', image: '/data/team/kaiden.jpg', initials: 'KL', rookie: true },
      { name: 'Jivansh Pandya', role: 'Outreach', image: '/data/team/Jivansh.jpg', initials: 'JP', rookie: true },
    ],
    mentors: [
      { name: 'Abdullah Khaled', role: 'Youth Software Mentor', image: '/data/team/abdullah.jpg', initials: 'AK', rookie: false },
    ],
    coaches: [
      { name: 'Mr. Ellis', role: 'Coach', image: '/data/team/ellis.jpg', initials: 'E', rookie: false },
      { name: 'Mr. Gavande', role: 'Coach', image: '/data/team/vijay.jpg', initials: 'V', rookie: false },
    ]
  };

  // FIXED: Function to handle navigation to home and scroll to top
  const handleLogoClick = () => {
    setCurrentPage('home');
    window.scrollTo(0, 0); // INSTANT teleport, not smooth
  };

  const renderPage = () => {
    if (displayPage === 'home') {
      return (
        <div className="min-h-screen">
          {/* Hero Section */}
          <div className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden bg-[#132038]">
            <GridScan />
            <ClawMarkImage opacity={0.12} className="bottom-0 right-0 w-[600px] h-[600px]" />
            
            {/* Blueprint overlay */}
            <div
              className="absolute inset-0 opacity-5"
              style={{
                backgroundImage: 'linear-gradient(45deg, #FF5A1F 1px, transparent 1px), linear-gradient(-45deg, #FF5A1F 1px, transparent 1px)',
                backgroundSize: '60px 60px',
                transform: `translateY(${scrollY * 0.2}px)`,
              }}
            />
            
            <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
              <div className="mb-8">
                <div 
                  id="hero-badge"
                  data-animate
                  className={`inline-block mb-6 transition-all duration-700 ${
                    isVisible['hero-badge'] ? 'animate-expand-center' : 'opacity-0 scale-[0.3]'
                  }`}
                >
                  <div className="flex items-center gap-3 px-6 py-3 bg-orange-600/20 border-2 border-orange-600 transition-all duration-300 hover:bg-orange-600/30 hover:scale-105 hover:shadow-2xl hover:shadow-orange-600/50"
                       style={{clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)'}}>
                    <Zap className="text-orange-500" size={20} />
                    <span className="text-orange-500 font-black text-sm tracking-wider">FTC TEAM 33791</span>
                  </div>
                </div>
                
                <h1 
                  id="hero-title-1"
                  data-animate
                  className={`text-7xl md:text-9xl font-black text-white mb-4 tracking-tight transition-all duration-700 ${
                    isVisible['hero-title-1'] ? 'animate-lock-in' : 'opacity-0 translate-x-[-40px]'
                  }`}
                  style={{animationDelay: '0.1s', fontFamily: 'system-ui, -apple-system, sans-serif', letterSpacing: '0.02em'}}
                >
                  WOLVERINE
                </h1>
                <h2 
                  id="hero-title-2"
                  data-animate
                  className={`text-5xl md:text-8xl font-black text-orange-500 mb-8 transition-all duration-700 ${
                    isVisible['hero-title-2'] ? 'animate-lock-in' : 'opacity-0 translate-x-[-40px]'
                  }`}
                  style={{animationDelay: '0.25s', fontFamily: 'system-ui, -apple-system, sans-serif'}}
                >
                  ROBOTICS
                </h2>
              </div>
              
              <div 
                id="hero-description"
                data-animate
                className={`max-w-2xl mx-auto mb-12 space-y-4 transition-all duration-700 ${
                  isVisible['hero-description'] ? 'animate-fade-in-up' : 'opacity-0 translate-y-[30px]'
                }`}
                style={{animationDelay: '0.4s'}}
              >
                <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
                  First-year FTC team from Frisco, TX pushing the boundaries of what rookies can achieve.
                </p>
                <p className="text-base md:text-lg text-gray-400">
                  Built with precision. Engineered for excellence. Driven by innovation.
                </p>
              </div>
              
              <div 
                id="hero-buttons"
                data-animate
                className={`flex flex-wrap gap-6 justify-center transition-all duration-700 ${
                  isVisible['hero-buttons'] ? 'animate-grow-in' : 'opacity-0 scale-[0.85]'
                }`}
                style={{animationDelay: '0.5s'}}
              >
                <AngleButton onClick={() => setCurrentPage('robots')} variant="primary">
                  VIEW MATCHSTICK <ChevronRight size={20} />
                </AngleButton>
                <AngleButton onClick={() => setCurrentPage('about')} variant="ghost">
                  MEET THE TEAM
                </AngleButton>
              </div>
            </div>
          </div>

          {/* Team Preview */}
          <div className="py-32 bg-gradient-to-b from-[#132038] to-[#0a1628] relative overflow-hidden">
            <GridScan sensitivity={0.3} scanOpacity={0.2} />
            <ClawMarkImage opacity={0.08} className="top-1/3 left-1/4 w-[550px] h-[550px]" />
            
            <div className="max-w-7xl mx-auto px-4 relative z-10">
              <div className="text-center mb-20">
                <div 
                  id="team-tag"
                  data-animate
                  className={`inline-block mb-6 transition-all duration-700 ${
                    isVisible['team-tag'] ? 'animate-grow-in' : 'opacity-0 scale-[0.85]'
                  }`}
                >
                  <div className="px-6 py-2 bg-orange-600/20 border-2 border-orange-600 hover:scale-105 transition-transform duration-300"
                       style={{clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)'}}>
                    <span className="text-orange-500 font-black text-sm tracking-widest">THE PACK</span>
                  </div>
                </div>
                
                <h2 
                  id="team-title"
                  data-animate
                  className={`text-5xl md:text-7xl font-black text-white mb-4 transition-all duration-700 ${
                    isVisible['team-title'] ? 'animate-lock-in' : 'opacity-0 translate-x-[-40px]'
                  }`}
                  style={{fontFamily: 'system-ui, -apple-system, sans-serif', transitionDelay: '100ms'}}
                >
                  MEET THE TEAM
                </h2>
                <p 
                  id="team-subtitle"
                  data-animate
                  className={`text-xl text-gray-400 max-w-2xl mx-auto transition-all duration-700 ${
                    isVisible['team-subtitle'] ? 'animate-fade-in-up' : 'opacity-0 translate-y-[30px]'
                  }`}
                  style={{transitionDelay: '200ms'}}
                >
                  17 students. 1 vision. Unlimited potential.
                </p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                {teamMembers.students.slice(0, 4).map((member, idx) => (
                  <div
                    key={idx}
                    id={`member-preview-${idx}`}
                    data-animate
                    className={`text-center transition-all duration-700 ${
                      isVisible[`member-preview-${idx}`] ? 'animate-grow-in' : 'opacity-0 scale-[0.85]'
                    }`}
                    style={{ transitionDelay: `${idx * 75}ms` }}
                  >
                    <TeamMemberCard member={member} size="small" showRookie={false} />
                    <h3 className="text-white font-bold text-base mt-4 mb-1 hover:text-orange-500 transition-colors duration-300">{member.name}</h3>
                    <p className="text-orange-500 text-xs font-bold tracking-wider">{member.role.split(',')[0]}</p>
                  </div>
                ))}
              </div>
              
              <div 
                id="team-cta"
                data-animate
                className={`text-center transition-all duration-700 ${
                  isVisible['team-cta'] ? 'animate-grow-in' : 'opacity-0 scale-[0.85]'
                }`}
                style={{transitionDelay: '0.4s'}}
              >
                <AngleButton onClick={() => setCurrentPage('about')} variant="secondary">
                  FULL ROSTER <ChevronRight size={20} />
                </AngleButton>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (displayPage === 'about') {
      return (
        <div className="min-h-screen bg-gradient-to-b from-[#132038] to-[#0a1628] py-32 relative overflow-hidden">
          <ClawMarkImage opacity={0.1} className="bottom-0 right-0 w-[800px] h-[800px]" />
          
          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <div className="text-center mb-20">
              <div 
                id="about-tag"
                data-animate
                className={`inline-block mb-6 transition-all duration-700 ${
                  isVisible['about-tag'] ? 'animate-grow-in' : 'opacity-0 scale-[0.85]'
                }`}
              >
                <div className="px-6 py-2 bg-orange-600/20 border-2 border-orange-600"
                     style={{clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)'}}>
                  <span className="text-orange-500 font-black text-sm tracking-widest">TEAM 33791</span>
                </div>
              </div>
              
              <h1 
                id="about-title"
                data-animate
                className={`text-6xl md:text-8xl font-black text-white mb-6 transition-all duration-700 ${
                  isVisible['about-title'] ? 'animate-lock-in' : 'opacity-0 translate-x-[-40px]'
                }`}
                style={{fontFamily: 'system-ui, -apple-system, sans-serif', transitionDelay: '100ms'}}
              >
                THE PACK
              </h1>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed animate-fade-in-up" style={{animationDelay: '200ms'}}>
                A first-year team built on precision engineering, relentless innovation, and the drive to prove that rookies can compete at the highest level.
              </p>
            </div>

            {/* Students */}
            <div
              id="students-section"
              data-animate
              className={`mb-24 transition-all duration-700 ${
                isVisible['students-section'] ? 'animate-fade-in' : 'opacity-0'
              }`}
              style={{transitionDelay: '300ms'}}
            >
              <div className="mb-12">
                <div className="flex items-center gap-4 mb-2">
                  <h2 className="text-4xl font-black text-white" style={{fontFamily: 'system-ui, -apple-system, sans-serif'}}>
                    STUDENTS
                  </h2>
                  <div className="flex-1 h-1 bg-gradient-to-r from-orange-600 to-transparent" />
                </div>
                <p className="text-orange-500 font-bold tracking-wider text-sm">THE ENGINEERS</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {teamMembers.students.map((member, i) => (
                  <div
                    key={i}
                    className="text-center transition-all duration-300"
                    style={{
                      animation: `growIn 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards`,
                      animationDelay: `${i * 40}ms`,
                      opacity: 0
                    }}
                  >
                    <TeamMemberCard member={member} size="large" showRookie={true} />
                    <div className="mt-4">
                      <h3 className="text-white font-bold text-base mb-1 hover:text-orange-500 transition-colors duration-300">{member.name}</h3>
                      <p className="text-orange-500 text-xs font-bold tracking-wider leading-relaxed">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mentors */}
            {teamMembers.mentors.length > 0 && (
              <div
                id="mentors-section"
                data-animate
                className={`mb-24 transition-all duration-700 ${
                  isVisible['mentors-section'] ? 'animate-fade-in' : 'opacity-0'
                }`}
                style={{transitionDelay: '400ms'}}
              >
                <div className="mb-12">
                  <div className="flex items-center gap-4 mb-2">
                    <h2 className="text-4xl font-black text-white" style={{fontFamily: 'system-ui, -apple-system, sans-serif'}}>
                      MENTORS
                    </h2>
                    <div className="flex-1 h-1 bg-gradient-to-r from-orange-600 to-transparent" />
                  </div>
                  <p className="text-orange-500 font-bold tracking-wider text-sm">THE GUIDES</p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {teamMembers.mentors.map((member, i) => (
                    <div
                      key={i}
                      className="text-center animate-grow-in"
                      style={{animationDelay: `${i * 40}ms`}}
                    >
                      <TeamMemberCard member={member} size="large" showRookie={false} />
                      <div className="mt-4">
                        <h3 className="text-white font-bold text-base mb-1 hover:text-orange-500 transition-colors duration-300">{member.name}</h3>
                        <p className="text-orange-500 text-xs font-bold tracking-wider">{member.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Coaches */}
            {teamMembers.coaches.length > 0 && (
              <div
                id="coaches-section"
                data-animate
                className={`transition-all duration-700 ${
                  isVisible['coaches-section'] ? 'animate-fade-in' : 'opacity-0'
                }`}
                style={{transitionDelay: '500ms'}}
              >
                <div className="mb-12">
                  <div className="flex items-center gap-4 mb-2">
                    <h2 className="text-4xl font-black text-white" style={{fontFamily: 'system-ui, -apple-system, sans-serif'}}>
                      COACHES
                    </h2>
                    <div className="flex-1 h-1 bg-gradient-to-r from-orange-600 to-transparent" />
                  </div>
                  <p className="text-orange-500 font-bold tracking-wider text-sm">THE LEADERS</p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {teamMembers.coaches.map((member, i) => (
                    <div
                      key={i}
                      className="text-center animate-grow-in"
                      style={{animationDelay: `${i * 40}ms`}}
                    >
                      <TeamMemberCard member={member} size="large" showRookie={false} />
                      <div className="mt-4">
                        <h3 className="text-white font-bold text-base mb-1 hover:text-orange-500 transition-colors duration-300">{member.name}</h3>
                        <p className="text-orange-500 text-xs font-bold tracking-wider">{member.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (displayPage === 'robots') {
      return (
        <div className="min-h-screen bg-gradient-to-b from-[#132038] to-[#0a1628] py-32 relative overflow-hidden">
          <ClawMarkImage opacity={0.12} className="bottom-0 right-0 w-[900px] h-[900px]" />
          
          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <div className="text-center mb-20">
              <div 
                id="robots-tag"
                data-animate
                className={`inline-block mb-6 transition-all duration-700 ${
                  isVisible['robots-tag'] ? 'animate-grow-in' : 'opacity-0 scale-[0.85]'
                }`}
              >
                <div className="px-6 py-2 bg-orange-600/20 border-2 border-orange-600"
                     style={{clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)'}}>
                  <span className="text-orange-500 font-black text-sm tracking-widest">TECHNICAL SPECS</span>
                </div>
              </div>
              
              <h1 
                id="robots-title"
                data-animate
                className={`text-6xl md:text-8xl font-black text-white transition-all duration-700 ${
                  isVisible['robots-title'] ? 'animate-lock-in' : 'opacity-0 translate-x-[-40px]'
                }`}
                style={{fontFamily: 'system-ui, -apple-system, sans-serif', transitionDelay: '100ms'}}
              >
                MATCHSTICK
              </h1>
            </div>

            <div
              id="matchstick-detail"
              data-animate
              className={`relative transition-all duration-700 ${
                isVisible['matchstick-detail'] ? 'animate-grow-in' : 'opacity-0 scale-[0.85]'
              }`}
              style={{transitionDelay: '200ms'}}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-orange-600/10 to-blue-900/10 transform translate-x-6 translate-y-6"
                   style={{clipPath: 'polygon(0 0, calc(100% - 32px) 0, 100% 32px, 100% 100%, 0 100%)'}} />
              
              <div className="relative bg-gradient-to-br from-[#1a2847] to-[#0f1629] p-8 md:p-16 border-4 border-[#A2A9B1] overflow-hidden group hover:border-orange-600 transition-all duration-500 hover:scale-[1.02]"
                   style={{clipPath: 'polygon(0 0, calc(100% - 32px) 0, 100% 32px, 100% 100%, 0 100%)'}}>
                {/* FIXED: Using claw.png instead of 3-lined pattern */}
                <ClawMarkImage className="top-0 right-0 w-64 h-64" opacity={0.05} />
                
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse-glow"
                     style={{
                       boxShadow: 'inset 0 0 60px rgba(255, 90, 31, 0.5)',
                     }} />
                
                <div className="grid md:grid-cols-2 gap-16 relative z-10">
                  <div className="space-y-8">
                    <div 
                      className="aspect-square bg-gradient-to-br from-orange-900 to-blue-900 flex items-center justify-center text-white font-black overflow-hidden relative hover:shadow-2xl hover:shadow-orange-600/60 transition-all duration-500 border-4 border-[#A2A9B1] hover:border-orange-600 hover:scale-[1.03]"
                      style={{clipPath: 'polygon(0 0, calc(100% - 32px) 0, 100% 32px, 100% 100%, 0 100%)'}}
                    >
                      <RobotImage 
                        src="/data/robots/matchstick-main.jpg" 
                        alt="Matchstick Robot" 
                        fallbackText="MS"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="aspect-square bg-gradient-to-br from-blue-800 to-orange-800 flex items-center justify-center text-white text-5xl font-bold overflow-hidden hover:scale-[1.05] transition-all duration-300 border-2 border-[#A2A9B1] hover:border-orange-600 group relative"
                          style={{clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%)'}}
                        >
                          <RobotImage 
                            src={`/data/robots/matchstick-${i}.jpg`} 
                            alt={`Matchstick detail ${i}`} 
                            fallbackText={i.toString()}
                          />
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse-glow"
                               style={{
                                 boxShadow: 'inset 0 0 25px rgba(255, 90, 31, 0.6)',
                               }} />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-10">
                    <div>
                      <h2 className="text-6xl font-black text-white mb-3" style={{fontFamily: 'system-ui, -apple-system, sans-serif'}}>
                        MATCHSTICK
                      </h2>
                      <div className="flex items-center gap-3 mb-6">
                        <div className="h-1 w-24 bg-gradient-to-r from-orange-600 to-transparent" />
                        <p className="text-orange-500 font-black tracking-widest text-sm">2025-26 DECODE</p>
                      </div>
                      <p className="text-gray-300 text-lg leading-relaxed mb-8">
                        Our first machine. Every component precision-engineered for maximum performance. Built to dominate the competition field from day one.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: 'WEIGHT', value: '28 LBS' },
                        { label: 'HEIGHT', value: '18 IN' },
                        { label: 'DRIVETRAIN', value: 'MECANUM' },
                        { label: 'LANGUAGE', value: 'JAVA 17' }
                      ].map((spec, idx) => (
                        <div 
                          key={idx}
                          className="bg-gradient-to-br from-orange-600/20 to-blue-900/20 p-6 border-2 border-[#A2A9B1] hover:border-orange-600 hover:scale-[1.05] transition-all duration-300 group relative"
                          style={{clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)'}}
                        >
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse-glow"
                               style={{
                                 boxShadow: 'inset 0 0 25px rgba(255, 90, 31, 0.5)',
                               }} />
                          <p className="text-orange-500/70 font-bold text-xs mb-2 tracking-wider relative z-10">{spec.label}</p>
                          <p className="text-white text-2xl font-black relative z-10">{spec.value}</p>
                        </div>
                      ))}
                    </div>

                    <div className="bg-gradient-to-br from-blue-900/30 to-blue-950/30 p-8 border-2 border-[#A2A9B1] hover:border-blue-500 transition-all duration-300 group relative hover:scale-[1.02]"
                         style={{clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%)'}}>
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                           style={{
                             boxShadow: 'inset 0 0 30px rgba(66, 153, 225, 0.4)',
                           }} />
                      <div className="flex items-center gap-3 mb-6 relative z-10">
                        <Award className="text-orange-500" size={28} />
                        <h3 className="text-white font-black text-2xl">ACHIEVEMENTS</h3>
                      </div>
                      <ul className="space-y-3 relative z-10">
                        {[
                          '2X CONTROL AWARD WINNER',
                          'SEMI-FINALIST AT U-LEAGUE TOURNAMENT',
                          'WINNER OF DALLAS SEMI-REGIONAL'
                        ].map((achievement, idx) => (
                          <li key={idx} className="flex items-center gap-3 text-gray-300">
                            <div className="w-2 h-2 bg-orange-600 transform rotate-45" />
                            <span className="font-semibold">{achievement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-gradient-to-br from-orange-900/30 to-orange-950/30 p-8 border-2 border-[#A2A9B1] hover:border-orange-500 transition-all duration-300 group relative hover:scale-[1.02]"
                         style={{clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%)'}}>
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse-glow"
                           style={{
                             boxShadow: 'inset 0 0 30px rgba(255, 90, 31, 0.5)',
                           }} />
                      <h3 className="text-white font-black text-2xl mb-6 relative z-10">KEY FEATURES</h3>
                      <ul className="space-y-3 relative z-10">
                        {[
                          '12 & 9 BALL AUTONOMOUS',
                          '3 SECOND CYCLE TIME',
                          'VARIABLE SHOOTING SEQUENCE',
                          'MODULAR SUBSYSTEM DESIGN'
                        ].map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-3 text-gray-300">
                            <div className="w-2 h-2 bg-orange-600 transform rotate-45" />
                            <span className="font-semibold">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (displayPage === 'sponsors') {
      return (
        <div className="min-h-screen bg-gradient-to-b from-[#132038] to-[#0a1628] py-32 relative overflow-hidden">
          <ClawMarkImage opacity={0.1} className="bottom-0 right-0 w-[750px] h-[750px]" />
          
          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <div className="text-center mb-20">
              <div 
                id="sponsors-tag"
                data-animate
                className={`inline-block mb-6 transition-all duration-700 ${
                  isVisible['sponsors-tag'] ? 'animate-grow-in' : 'opacity-0 scale-[0.85]'
                }`}
              >
                <div className="px-6 py-2 bg-orange-600/20 border-2 border-orange-600"
                     style={{clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)'}}>
                  <span className="text-orange-500 font-black text-sm tracking-widest">SUPPORTERS</span>
                </div>
              </div>
              
              <h1 
                id="sponsors-title"
                data-animate
                className={`text-6xl md:text-8xl font-black text-white mb-6 transition-all duration-700 ${
                  isVisible['sponsors-title'] ? 'animate-lock-in' : 'opacity-0 translate-x-[-40px]'
                }`}
                style={{fontFamily: 'system-ui, -apple-system, sans-serif', transitionDelay: '100ms'}}
              >
                OUR SPONSORS
              </h1>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed animate-fade-in-up" style={{animationDelay: '200ms'}}>
                Their support makes innovation possible. Together, we're building the future of robotics.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto mb-20">
              {[
                { name: 'Wakeland High School', image: '/data/sponsors/whs.png' },
                { name: 'Wakeland High School NHS', image: '/data/sponsors/nhs.png' }
              ].map((sponsor, idx) => (
                <div
                  key={idx}
                  id={`sponsor-${idx}`}
                  data-animate
                  className={`relative group transition-all duration-700 ${
                    isVisible[`sponsor-${idx}`] ? 'animate-grow-in' : 'opacity-0 scale-[0.85]'
                  }`}
                  style={{ transitionDelay: `${idx * 150}ms` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 to-blue-900/20 transform translate-x-4 translate-y-4"
                       style={{clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 0 100%)'}} />
                  
                  <div className="relative bg-[#1a2847] p-8 border-2 border-[#A2A9B1] hover:border-orange-600 transition-all duration-500 hover:scale-[1.03]"
                       style={{clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 0 100%)'}}>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse-glow"
                         style={{
                           boxShadow: 'inset 0 0 35px rgba(255, 90, 31, 0.4)',
                         }} />
                    <div className="relative z-10">
                      <SponsorCard sponsor={sponsor} />
                      <h3 className="text-white font-black text-2xl text-center group-hover:text-orange-500 transition-colors duration-300">{sponsor.name}</h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div
              id="become-sponsor"
              data-animate
              className={`relative max-w-4xl mx-auto transition-all duration-700 ${
                isVisible['become-sponsor'] ? 'animate-grow-in' : 'opacity-0 scale-[0.85]'
              }`}
              style={{transitionDelay: '300ms'}}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-orange-600/30 to-blue-900/30 transform translate-x-4 translate-y-4"
                   style={{clipPath: 'polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 0 100%)'}} />
              
              <div className="relative bg-gradient-to-br from-orange-900/40 to-blue-900/40 p-12 md:p-16 text-center border-4 border-orange-600 group hover:border-orange-500 transition-all duration-500 hover:scale-[1.02]"
                   style={{clipPath: 'polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 0 100%)'}}>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse-glow"
                     style={{
                       boxShadow: 'inset 0 0 50px rgba(255, 90, 31, 0.5)',
                     }} />
                <div className="relative z-10">
                  <h2 className="text-5xl font-black text-white mb-6" style={{fontFamily: 'system-ui, -apple-system, sans-serif'}}>
                    BECOME A SPONSOR
                  </h2>
                  <p className="text-gray-200 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
                    Join us in empowering the next generation of engineers and innovators. Your support directly impacts our ability to compete and excel.
                  </p>
                  <AngleButton onClick={() => setCurrentPage('contact')} variant="primary" className="text-lg px-12 py-5">
                    PARTNER WITH US <ChevronRight size={24} />
                  </AngleButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (displayPage === 'contact') {
      return (
        <div className="min-h-screen bg-gradient-to-b from-[#132038] to-[#0a1628] py-32 relative overflow-hidden">
          <ClawMarkImage opacity={0.12} className="bottom-0 right-0 w-[850px] h-[850px]" />
          
          <div className="max-w-5xl mx-auto px-4 relative z-10">
            <div className="text-center mb-20">
              <div 
                id="contact-tag"
                data-animate
                className={`inline-block mb-6 transition-all duration-700 ${
                  isVisible['contact-tag'] ? 'animate-grow-in' : 'opacity-0 scale-[0.85]'
                }`}
              >
                <div className="px-6 py-2 bg-orange-600/20 border-2 border-orange-600"
                     style={{clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)'}}>
                  <span className="text-orange-500 font-black text-sm tracking-widest">CONNECT</span>
                </div>
              </div>
              
              <h1 
                id="contact-title"
                data-animate
                className={`text-6xl md:text-8xl font-black text-white mb-6 transition-all duration-700 ${
                  isVisible['contact-title'] ? 'animate-lock-in' : 'opacity-0 translate-x-[-40px]'
                }`}
                style={{fontFamily: 'system-ui, -apple-system, sans-serif', transitionDelay: '100ms'}}
              >
                GET IN TOUCH
              </h1>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto animate-fade-in-up" style={{animationDelay: '200ms'}}>
                Questions? Sponsorship opportunities? Let's talk.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-10">
              <div
                id="contact-info"
                data-animate
                className={`space-y-6 transition-all duration-700 ${
                  isVisible['contact-info'] ? 'animate-fade-in' : 'opacity-0'
                }`}
                style={{transitionDelay: '300ms'}}
              >
                {[
                  {
                    icon: Mail,
                    title: 'EMAIL',
                    content: 'ftc33791@gmail.com',
                    color: 'orange'
                  },
                  {
                    icon: MapPin,
                    title: 'LOCATION',
                    content: 'Wakeland High School\nFrisco, Texas',
                    color: 'orange'
                  },
                  {
                    icon: Users,
                    title: 'SOCIAL MEDIA',
                    content: null,
                    color: 'orange'
                  }
                ].map((item, idx) => (
                  <div 
                    key={idx}
                    className="relative group"
                    style={{
                      animation: `growIn 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards`,
                      animationDelay: `${idx * 100}ms`,
                      opacity: 0
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 to-blue-900/20 transform translate-x-2 translate-y-2"
                         style={{clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)'}} />
                    
                    <div className="relative bg-[#1a2847] p-8 border-2 border-[#A2A9B1] hover:border-orange-600 transition-all duration-500 hover:scale-[1.03]"
                         style={{clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)'}}>
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse-glow"
                           style={{
                             boxShadow: 'inset 0 0 30px rgba(255, 90, 31, 0.5)',
                           }} />
                      <div className="relative z-10">
                        <item.icon className="text-orange-500 mb-4" size={32} />
                        <h3 className="text-white font-black text-lg mb-3 tracking-wider">{item.title}</h3>
                        {item.content ? (
                          <p className="text-gray-300 whitespace-pre-line">{item.content}</p>
                        ) : (
                          <div className="flex gap-4">
                            <a 
                              href="https://github.com/wolverine-robotics" 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="w-12 h-12 bg-orange-600 hover:bg-orange-500 flex items-center justify-center transition-all duration-300 hover:scale-125 relative group"
                              style={{clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)'}}
                            >
                              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                   style={{
                                     boxShadow: '0 0 25px rgba(255, 90, 31, 0.8)',
                                   }} />
                              <Github className="text-white relative z-10" size={20} />
                            </a>
                            <a 
                              href="https://www.linkedin.com/company/wolverine-robotics/" 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="w-12 h-12 bg-orange-600 hover:bg-orange-500 flex items-center justify-center transition-all duration-300 hover:scale-125 relative group"
                              style={{clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)'}}
                            >
                              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                   style={{
                                     boxShadow: '0 0 25px rgba(255, 90, 31, 0.8)',
                                   }} />
                              <Linkedin className="text-white relative z-10" size={20} />
                            </a>
                            <a 
                              href="https://www.instagram.com/wolverine_robotics/" 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="w-12 h-12 bg-orange-600 hover:bg-orange-500 flex items-center justify-center transition-all duration-300 hover:scale-125 relative group"
                              style={{clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)'}}
                            >
                              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                   style={{
                                     boxShadow: '0 0 25px rgba(255, 90, 31, 0.8)',
                                   }} />
                              <Instagram className="text-white relative z-10" size={20} />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div
                id="contact-form"
                data-animate
                className={`relative transition-all duration-700 ${
                  isVisible['contact-form'] ? 'animate-grow-in' : 'opacity-0 scale-[0.85]'
                }`}
                style={{transitionDelay: '400ms'}}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 to-blue-900/20 transform translate-x-3 translate-y-3"
                     style={{clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%)'}} />
                
                <div className="relative bg-[#1a2847] p-8 border-2 border-orange-600 group hover:border-orange-500 transition-all duration-500 hover:scale-[1.02]"
                     style={{clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%)'}}>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse-glow"
                       style={{
                         boxShadow: 'inset 0 0 35px rgba(255, 90, 31, 0.4)',
                       }} />
                  <form className="space-y-6 relative z-10">
                    <div className="animate-fade-in-up" style={{animationDelay: '500ms'}}>
                      <label className="block text-white font-bold text-sm mb-2 tracking-wider">NAME</label>
                      <input
                        type="text"
                        className="w-full px-4 py-4 bg-[#0f1629] text-white border-2 border-[#A2A9B1] focus:border-orange-600 focus:outline-none transition-colors duration-300 focus:scale-[1.02]"
                        style={{clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)'}}
                      />
                    </div>

                    <div className="animate-fade-in-up" style={{animationDelay: '600ms'}}>
                      <label className="block text-white font-bold text-sm mb-2 tracking-wider">EMAIL</label>
                      <input
                        type="email"
                        className="w-full px-4 py-4 bg-[#0f1629] text-white border-2 border-[#A2A9B1] focus:border-orange-600 focus:outline-none transition-colors duration-300 focus:scale-[1.02]"
                        style={{clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)'}}
                      />
                    </div>

                    <div className="animate-fade-in-up" style={{animationDelay: '700ms'}}>
                      <label className="block text-white font-bold text-sm mb-2 tracking-wider">MESSAGE</label>
                      <textarea
                        rows="6"
                        className="w-full px-4 py-4 bg-[#0f1629] text-white border-2 border-[#A2A9B1] focus:border-orange-600 focus:outline-none transition-colors duration-300 resize-none focus:scale-[1.02]"
                        style={{clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)'}}
                      />
                    </div>

                    <div className="animate-fade-in-up" style={{animationDelay: '800ms'}}>
                      <AngleButton variant="primary" className="w-full text-lg py-4">
                        SEND MESSAGE <ChevronRight size={20} />
                      </AngleButton>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  if (isInitialLoad) {
    return <InitialLoadAnimation onComplete={() => setIsInitialLoad(false)} />;
  }

  return (
    <div className="min-h-[100dvh] bg-[#0a1628] overflow-hidden relative">
      {/* Main Content with claw slash animations - optimized WITHOUT glowing lines */}
      <div 
        className={`min-h-[100dvh] ${
          transitionPhase === 'out' ? 'animate-claw-slash-out' : 
          transitionPhase === 'in' ? 'animate-claw-slash-in' : 
          ''
        }`}
        style={{
          willChange: transitionPhase !== 'none' ? 'clip-path, opacity' : 'auto'
        }}
      >
        <nav className="fixed top-0 w-full bg-[#0a1628]/98 backdrop-blur-md border-b-2 border-orange-600 z-50 shadow-lg shadow-orange-600/20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-20">
            <div 
              className="flex items-center gap-3 cursor-pointer group" 
              onClick={handleLogoClick}
            >
              <div className="transform group-hover:scale-110 transition-transform duration-300">
                <LogoImage />
              </div>
              <div>
                <h1 className="text-white font-black text-lg tracking-wider group-hover:text-orange-500 transition-colors duration-300" style={{fontFamily: 'system-ui, -apple-system, sans-serif'}}>
                  WOLVERINE
                </h1>
                <p className="text-orange-500 text-xs font-black tracking-widest">TEAM 33791</p>
              </div>
            </div>

            <div className="hidden md:flex gap-8">
              {navigation.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`text-sm font-black tracking-wider transition-all duration-300 relative group ${
                    currentPage === item.id
                      ? 'text-orange-500 scale-110'
                      : 'text-white hover:text-orange-500 hover:scale-110'
                  }`}
                >
                  {item.name}
                  <div className={`absolute bottom-0 left-0 h-0.5 bg-orange-600 transition-all duration-300 ${
                    currentPage === item.id ? 'w-full' : 'w-0 group-hover:w-full'
                  }`} />
                </button>
              ))}
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-white hover:text-orange-500 transition-colors duration-300 hover:scale-110"
            >
              {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0f1629] border-t-2 border-orange-600">
            <div className="flex flex-col">
              {navigation.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentPage(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`px-6 py-4 text-left font-black tracking-wider transition-all duration-300 border-b border-orange-600/20 ${
                    currentPage === item.id
                      ? 'text-orange-500 bg-orange-600/10'
                      : 'text-white hover:bg-orange-600/5'
                  }`}
                  style={{animationDelay: `${idx * 50}ms`}}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      <div className="pt-20">{renderPage()}</div>

      <footer className="bg-[#0a1628] border-t-2 border-orange-600 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-white font-black text-xl mb-4">WOLVERINE ROBOTICS</h3>
              <p className="text-gray-400">FTC Team 33791</p>
              <p className="text-gray-400">Frisco, Texas</p>
            </div>
            <div>
              <h3 className="text-white font-black text-xl mb-4">QUICK LINKS</h3>
              <div className="flex flex-col gap-2">
                {navigation.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setCurrentPage(item.id)}
                    className="text-gray-400 hover:text-orange-500 text-left transition-colors duration-300 hover:translate-x-2"
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-white font-black text-xl mb-4">CONNECT</h3>
              <div className="flex gap-4">
                <a 
                  href="https://github.com/wolverine-robotics" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-10 h-10 bg-orange-600 hover:bg-orange-500 flex items-center justify-center transition-all duration-300 hover:scale-125"
                  style={{clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)'}}
                >
                  <Github className="text-white" size={20} />
                </a>
                <a 
                  href="https://www.linkedin.com/company/wolverine-robotics/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-10 h-10 bg-orange-600 hover:bg-orange-500 flex items-center justify-center transition-all duration-300 hover:scale-125"
                  style={{clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)'}}
                >
                  <Linkedin className="text-white" size={20} />
                </a>
                <a 
                  href="https://www.instagram.com/wolverine_robotics/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-10 h-10 bg-orange-600 hover:bg-orange-500 flex items-center justify-center transition-all duration-300 hover:scale-125"
                  style={{clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)'}}
                >
                  <Instagram className="text-white" size={20} />
                </a>
              </div>
            </div>
          </div>
          <div className="border-t-2 border-gray-800 pt-8 text-center">
            <p className="text-gray-500 text-sm">
              © 2025 Wolverine Robotics. All rights reserved.
            </p>
            <p className="text-gray-600 text-xs mt-2">
              Website developed by Sahejdeep Singh: sahej.robotics@outlook.com
            </p>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
};

export default App;

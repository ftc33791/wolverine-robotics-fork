import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, ChevronRight, Award, Calendar, Users, Mail, MapPin, Github, Linkedin, Instagram, Zap } from 'lucide-react';
import * as THREE from 'three';

const ClawMarkPattern = ({ className = "", opacity = 0.1 }) => (
  <div className={`absolute pointer-events-none ${className}`} style={{ opacity }}>
    <div className="relative w-full h-full">
      <div className="absolute w-1 bg-orange-500 transform rotate-45" style={{ height: '150%', left: '0%' }} />
      <div className="absolute w-1 bg-orange-500 transform rotate-45" style={{ height: '150%', left: '25%' }} />
      <div className="absolute w-1 bg-orange-500 transform rotate-45" style={{ height: '150%', left: '50%' }} />
    </div>
  </div>
);

const ClawMarkImage = ({ opacity = 0.08, className = "" }) => {
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
        />
      ) : (
        <ClawMarkPattern className="w-full h-full" opacity={1} />
      )}
    </div>
  );
};

const OpeningAnimation = ({ onComplete }) => {
  const [phase, setPhase] = useState('scratch');
  
  useEffect(() => {
    const scratchTimer = setTimeout(() => {
      setPhase('reveal');
    }, 1200);
    
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 2500);
    
    return () => {
      clearTimeout(scratchTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);
  
  return (
    <div className="fixed inset-0 z-[100] bg-[#132038]">
      {/* Scratch marks that reveal the site */}
      <div className="absolute inset-0 overflow-hidden">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="absolute h-full bg-black origin-top-left"
            style={{
              width: '40%',
              left: `${i * 30}%`,
              transform: 'skewX(-15deg)',
              animation: `scratchReveal 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards`,
              animationDelay: `${i * 0.15}s`
            }}
          />
        ))}
      </div>
      
      {/* Claw image that scratches */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96"
        style={{
          animation: 'clawSwipe 1.2s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards',
          opacity: phase === 'reveal' ? 0 : 1,
          transition: 'opacity 0.3s ease-out'
        }}
      >
        <ClawMarkImage opacity={0.6} className="w-full h-full" />
      </div>
      
      {/* Logo reveal */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          opacity: phase === 'reveal' ? 1 : 0,
          transform: phase === 'reveal' ? 'translate(-50%, -50%) scale(1)' : 'translate(-50%, -50%) scale(0.8)',
          transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        <div className="text-center">
          <h1 className="text-8xl font-black text-white mb-2" style={{fontFamily: 'system-ui, -apple-system, sans-serif', letterSpacing: '0.05em'}}>
            WOLVERINE
          </h1>
          <div className="h-1 w-32 bg-orange-600 mx-auto mb-2" />
          <p className="text-orange-500 font-black text-xl tracking-[0.3em]">ROBOTICS</p>
        </div>
      </div>
      
      <style>{`
        @keyframes scratchReveal {
          0% {
            transform: skewX(-15deg) scaleY(0);
            transform-origin: top;
          }
          100% {
            transform: skewX(-15deg) scaleY(1.2);
            transform-origin: top;
          }
        }
        
        @keyframes clawSwipe {
          0% {
            transform: translate(-150%, -150%) rotate(-20deg) scale(0.5);
            opacity: 0;
          }
          50% {
            opacity: 0.8;
          }
          100% {
            transform: translate(-50%, -50%) rotate(0deg) scale(1);
            opacity: 0.6;
          }
        }
      `}</style>
    </div>
  );
};

const AngleButton = ({ children, onClick, variant = 'primary', className = '' }) => {
  const baseClasses = "relative px-8 py-4 font-bold transition-all duration-500 hover:scale-105 overflow-hidden group";
  const variantClasses = {
    primary: "bg-gradient-to-br from-orange-600 to-orange-700 text-white hover:from-orange-500 hover:to-orange-600",
    secondary: "bg-gradient-to-br from-blue-900 to-blue-950 text-white border-2 border-blue-500 hover:border-blue-400",
    ghost: "bg-transparent text-white border-2 border-orange-500 hover:bg-orange-500/10 hover:border-orange-400"
  };

  return (
    <button 
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={{
        clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)'
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      <span className="relative z-10 flex items-center gap-2 tracking-wide">
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
      className="aspect-video bg-white flex items-center justify-center mb-6 overflow-hidden relative group"
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
          className="w-full h-full object-contain p-6 group-hover:scale-110 transition-transform duration-700 ease-out" 
        />
      )}
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
      <div 
        className={`${sizeClasses} bg-gradient-to-br from-[#FF5A1F] to-orange-800 mx-auto flex items-center justify-center text-white font-black overflow-hidden relative group`}
        style={{
          clipPath: size === 'small' 
            ? 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)'
            : 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%)'
        }}
      >
        {!imageLoaded || imageError ? (
          <span className="animate-pulse">{member.initials}</span>
        ) : (
          <img 
            src={member.image} 
            alt={member.name} 
            className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-700 ease-out" 
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
      {showRookie && member.rookie && (
        <div 
          className="absolute -top-2 -right-2 bg-[#FF5A1F] text-white text-xs font-black px-3 py-1 shadow-lg z-10 animate-pulse"
          style={{
            clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)'
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
    img.src = '/data/logo.png';
  }, []);
  
  return (
    <div 
      className="w-12 h-12 flex items-center justify-center overflow-hidden"
      style={{
        clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)'
      }}
    >
      {!imageLoaded || imageError ? (
        <div className="w-full h-full bg-gradient-to-br from-[#FF5A1F] to-orange-800 flex items-center justify-center text-white font-black text-xl">
          WR
        </div>
      ) : (
        <img 
          src="/data/logo.png" 
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

const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState({});
  const [showOpening, setShowOpening] = useState(true);
  const [hasSeenOpening, setHasSeenOpening] = useState(false);

  useEffect(() => {
    // Check if user has seen the opening animation
    const seen = sessionStorage.getItem('hasSeenOpening');
    if (seen) {
      setShowOpening(false);
      setHasSeenOpening(true);
    }
  }, []);

  const handleOpeningComplete = () => {
    setShowOpening(false);
    setHasSeenOpening(true);
    sessionStorage.setItem('hasSeenOpening', 'true');
  };

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(40px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes slideInRight {
        from {
          opacity: 0;
          transform: translateX(-60px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
      @keyframes slideInLeft {
        from {
          opacity: 0;
          transform: translateX(60px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
      @keyframes scaleIn {
        from {
          opacity: 0;
          transform: scale(0.85);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }
      @keyframes glow {
        0%, 100% {
          box-shadow: 0 0 20px rgba(255, 90, 31, 0.3);
        }
        50% {
          box-shadow: 0 0 40px rgba(255, 90, 31, 0.6);
        }
      }
      @keyframes pulse {
        0%, 100% {
          opacity: 1;
        }
        50% {
          opacity: 0.7;
        }
      }
      .animate-fade-in-up {
        animation: fadeInUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        opacity: 0;
      }
      .animate-slide-in-right {
        animation: slideInRight 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        opacity: 0;
      }
      .animate-slide-in-left {
        animation: slideInLeft 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        opacity: 0;
      }
      .animate-scale-in {
        animation: scaleIn 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        opacity: 0;
      }
      .animate-glow {
        animation: glow 3s ease-in-out infinite;
      }
      .animate-pulse {
        animation: pulse 2s ease-in-out infinite;
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

  useEffect(() => {
    window.scrollTo(0, 0);
    setIsVisible({});
    
    const timer = setTimeout(() => {
      const elements = document.querySelectorAll('[data-animate]');
      const visibilityMap = {};
      elements.forEach((el) => {
        if (el.id) {
          visibilityMap[el.id] = true;
        }
      });
      setIsVisible(visibilityMap);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [currentPage]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1 }
    );

    const timeoutId = setTimeout(() => {
      document.querySelectorAll('[data-animate]').forEach((el) => observer.observe(el));
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [currentPage]);

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
      { name: 'Arshaan Husain', role: 'Outreach', image: '/data/team/member13.jpg', initials: 'AH', rookie: true },
      { name: 'Kaiden Lee', role: 'Outreach', image: '/data/team/kaiden.jpg', initials: 'KL', rookie: true },
      { name: 'Jivansh Pandya', role: 'Outreach', image: '/data/team/Jivansh.jpg', initials: 'JP', rookie: true },
    ],
    mentors: [
      { name: 'Abdullah Khalid', role: 'Youth Software Mentor', image: '/data/team/abdullah.jpg', initials: 'AK', rookie: false },
    ],
    coaches: [
      { name: 'Mr. Ellis', role: 'Coach', image: '/data/team/ellis.jpg', initials: 'E', rookie: false },
      { name: 'Mr. Gavande', role: 'Coach', image: '/data/team/vijay.jpg', initials: 'V', rookie: false },
    ]
  };

  const upcomingEvents = [
    { name: 'Regional Championship', date: 'March 15, 2025', time: '9:00 AM', location: 'Frisco Event Center' },
    { name: 'Team Practice', date: 'March 8, 2025', time: '4:00 PM', location: 'Wakeland High School' },
    { name: 'Community Outreach', date: 'March 22, 2025', time: '10:00 AM', location: 'Local STEM Fair' },
  ];

  const renderPage = () => {
    if (currentPage === 'home') {
      return (
        <div className="min-h-screen">
          {/* Hero Section */}
          <div className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden bg-[#132038]">
            <GridScan />
            <ClawMarkImage opacity={0.12} className="bottom-0 right-0 w-[600px] h-[600px] animate-pulse" />
            
            {/* Animated Background Pattern */}
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
                <div className="inline-block mb-6 animate-scale-in" style={{animationDelay: '0.1s'}}>
                  <div className="flex items-center gap-3 px-6 py-3 bg-[#FF5A1F]/20 border-2 border-[#FF5A1F] animate-glow"
                       style={{clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)'}}>
                    <Zap className="text-[#FF5A1F] animate-pulse" size={20} />
                    <span className="text-[#FF5A1F] font-black text-sm tracking-[0.2em]">FTC TEAM 33791</span>
                  </div>
                </div>
                
                <h1 className="text-7xl md:text-9xl font-black text-white mb-4 animate-fade-in-up tracking-tight" style={{animationDelay: '0.3s', fontFamily: 'system-ui, -apple-system, sans-serif', letterSpacing: '0.05em'}}>
                  WOLVERINE
                </h1>
                <h2 className="text-5xl md:text-8xl font-black text-[#FF5A1F] mb-8 animate-fade-in-up" style={{animationDelay: '0.5s', fontFamily: 'system-ui, -apple-system, sans-serif', letterSpacing: '0.05em'}}>
                  ROBOTICS
                </h2>
              </div>
              
              <div className="max-w-2xl mx-auto mb-12 space-y-4">
                <p className="text-lg md:text-xl text-[#A2A9B1] animate-fade-in-up leading-relaxed" style={{animationDelay: '0.7s'}}>
                  First-year FTC team from Frisco, TX pushing the boundaries of what rookies can achieve.
                </p>
                <p className="text-base md:text-lg text-[#A2A9B1]/70 animate-fade-in-up" style={{animationDelay: '0.8s'}}>
                  Built with precision. Engineered for excellence. Driven by innovation.
                </p>
              </div>
              
              <div className="flex flex-wrap gap-6 justify-center animate-fade-in-up" style={{animationDelay: '0.9s'}}>
                <AngleButton onClick={() => setCurrentPage('robots')} variant="primary">
                  VIEW MATCHSTICK <ChevronRight size={20} />
                </AngleButton>
                <AngleButton onClick={() => setCurrentPage('about')} variant="ghost">
                  MEET THE TEAM
                </AngleButton>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-6 mt-20 max-w-3xl mx-auto animate-scale-in" style={{animationDelay: '1s'}}>
                {[
                  { label: 'RECORD', value: '5-0-1' },
                  { label: 'TEAM SIZE', value: '17' },
                  { label: 'SEASON', value: '2025' }
                ].map((stat, idx) => (
                  <div key={idx} className="relative group">
                    <div className="bg-gradient-to-br from-[#FF5A1F]/20 to-[#132038]/20 p-6 border-2 border-[#FF5A1F]/50 backdrop-blur-sm hover:border-[#FF5A1F] transition-all duration-500"
                         style={{clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)'}}>
                      <div className="text-3xl md:text-4xl font-black text-white mb-1">{stat.value}</div>
                      <div className="text-xs text-[#FF5A1F] font-black tracking-[0.2em]">{stat.label}</div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-[#FF5A1F]/0 via-[#FF5A1F]/20 to-[#FF5A1F]/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Robot Showcase */}
          <div className="py-32 bg-gradient-to-b from-[#132038] to-black relative overflow-hidden">
            <ClawMarkImage opacity={0.08} className="top-1/4 left-0 w-[500px] h-[500px]" />
            <ClawMarkImage opacity={0.12} className="bottom-0 right-0 w-[600px] h-[600px]" />
            
            <div className="max-w-7xl mx-auto px-4 relative z-10">
              <div className="text-center mb-20">
                <div 
                  id="robot-section"
                  data-animate
                  className={`inline-block mb-6 transition-all duration-1000 ${
                    isVisible['robot-section'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                  }`}
                >
                  <div className="px-6 py-2 bg-[#FF5A1F]/20 border-2 border-[#FF5A1F]"
                       style={{clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)'}}>
                    <span className="text-[#FF5A1F] font-black text-sm tracking-[0.2em]">OUR MACHINE</span>
                  </div>
                </div>
                
                <h2 
                  id="robot-title"
                  data-animate
                  className={`text-5xl md:text-7xl font-black text-white mb-4 transition-all duration-1000 ${
                    isVisible['robot-title'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                  }`}
                  style={{fontFamily: 'system-ui, -apple-system, sans-serif', transitionDelay: '100ms', letterSpacing: '0.05em'}}
                >
                  MEET MATCHSTICK
                </h2>
                <p 
                  id="robot-subtitle"
                  data-animate
                  className={`text-xl text-[#A2A9B1] max-w-2xl mx-auto transition-all duration-1000 ${
                    isVisible['robot-subtitle'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                  }`}
                  style={{transitionDelay: '200ms'}}
                >
                  Precision-engineered for the 2025-26 DECODE season
                </p>
              </div>
              
              <div
                id="robot-card"
                data-animate
                className={`relative transition-all duration-1000 ${
                  isVisible['robot-card'] ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-20 scale-95'
                }`}
                style={{transitionDelay: '300ms'}}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#FF5A1F]/10 to-[#132038]/10 transform translate-x-4 translate-y-4 transition-transform duration-500 group-hover:translate-x-6 group-hover:translate-y-6"
                     style={{clipPath: 'polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 0 100%)'}} />
                
                <div className="relative bg-gradient-to-br from-[#1a2847] to-[#0f1629] p-8 md:p-12 border-2 border-[#FF5A1F] overflow-hidden group"
                     style={{clipPath: 'polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 0 100%)'}}>
                  <ClawMarkPattern className="top-0 right-0 w-48 h-48" opacity={0.08} />
                  
                  <div className="grid md:grid-cols-2 gap-12 items-center relative z-10">
                    <div className="space-y-6">
                      <div 
                        className="aspect-square bg-gradient-to-br from-[#FF5A1F] to-[#132038] flex items-center justify-center text-white font-black overflow-hidden relative group/img hover:shadow-2xl hover:shadow-[#FF5A1F]/30 transition-all duration-700"
                        style={{clipPath: 'polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 0 100%)'}}
                      >
                        <RobotImage 
                          src="/data/robots/matchstick-main.jpg" 
                          alt="Matchstick Robot" 
                          fallbackText="MS"
                        />
                        <div className="absolute inset-0 border-4 border-[#FF5A1F] opacity-0 group-hover/img:opacity-50 transition-opacity duration-500"
                             style={{clipPath: 'polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 0 100%)'}} />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className="aspect-square bg-gradient-to-br from-[#132038] to-[#FF5A1F] flex items-center justify-center text-white text-4xl font-bold overflow-hidden hover:scale-110 transition-transform duration-500 hover:shadow-lg hover:shadow-[#FF5A1F]/20"
                            style={{clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)'}}
                          >
                            <RobotImage 
                              src={`/data/robots/matchstick-${i}.jpg`} 
                              alt={`Matchstick detail ${i}`} 
                              fallbackText={i.toString()}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-8">
                      <div>
                        <h3 className="text-5xl font-black text-white mb-2" style={{fontFamily: 'system-ui, -apple-system, sans-serif', letterSpacing: '0.05em'}}>
                          MATCHSTICK
                        </h3>
                        <div className="flex items-center gap-3 mb-6">
                          <div className="h-1 w-16 bg-gradient-to-r from-[#FF5A1F] to-transparent" />
                          <p className="text-[#FF5A1F] font-black tracking-[0.15em] text-sm">SEASON 2025-26</p>
                        </div>
                        <p className="text-[#A2A9B1] text-lg leading-relaxed">
                          Our inaugural machine. Engineered in record time with zero compromises on performance. Every component optimized for competitive excellence.
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { label: 'WEIGHT', value: '28 LBS' },
                          { label: 'HEIGHT', value: '18 IN' },
                          { label: 'DRIVE', value: 'MECANUM' },
                          { label: 'CODE', value: 'JAVA 17' }
                        ].map((spec, idx) => (
                          <div 
                            key={idx}
                            className="bg-gradient-to-br from-[#FF5A1F]/20 to-[#132038]/20 p-4 border-2 border-[#FF5A1F]/50 group/spec hover:border-[#FF5A1F] hover:scale-105 transition-all duration-500"
                            style={{clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)'}}
                          >
                            <p className="text-[#FF5A1F]/70 font-black text-xs mb-1 tracking-[0.15em] group-hover/spec:text-[#FF5A1F] transition-colors">{spec.label}</p>
                            <p className="text-white text-xl font-black">{spec.value}</p>
                          </div>
                        ))}
                      </div>
                      
                      <AngleButton onClick={() => setCurrentPage('robots')} variant="primary" className="w-full">
                        FULL SPECIFICATIONS <ChevronRight size={20} />
                      </AngleButton>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Events Section */}
          <div className="py-32 bg-black relative overflow-hidden">
            <ClawMarkImage opacity={0.10} className="bottom-0 right-0 w-[700px] h-[700px]" />
            
            <div className="max-w-7xl mx-auto px-4 relative z-10">
              <div className="text-center mb-20">
                <div 
                  id="events-tag"
                  data-animate
                  className={`inline-block mb-6 transition-all duration-1000 ${
                    isVisible['events-tag'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                  }`}
                >
                  <div className="px-6 py-2 bg-[#FF5A1F]/20 border-2 border-[#FF5A1F]"
                       style={{clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)'}}>
                    <span className="text-[#FF5A1F] font-black text-sm tracking-[0.2em]">UPCOMING</span>
                  </div>
                </div>
                
                <h2 
                  id="events-title"
                  data-animate
                  className={`text-5xl md:text-7xl font-black text-white transition-all duration-1000 ${
                    isVisible['events-title'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                  }`}
                  style={{fontFamily: 'system-ui, -apple-system, sans-serif', transitionDelay: '100ms', letterSpacing: '0.05em'}}
                >
                  EVENTS & SCHEDULE
                </h2>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                {upcomingEvents.map((event, idx) => (
                  <div
                    key={idx}
                    id={`event-${idx}`}
                    data-animate
                    className={`relative group transition-all duration-1000 ${
                      isVisible[`event-${idx}`] ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-20 scale-95'
                    }`}
                    style={{ transitionDelay: `${idx * 150}ms` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-[#FF5A1F]/20 to-[#132038]/20 transform translate-x-2 translate-y-2 group-hover:translate-x-3 group-hover:translate-y-3 transition-transform duration-500"
                         style={{clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)'}} />
                    
                    <div className="relative bg-[#1a2847] p-8 border-2 border-[#FF5A1F]/50 group-hover:border-[#FF5A1F] transition-colors duration-500 overflow-hidden"
                         style={{clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)'}}>
                      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#FF5A1F]/10 to-transparent transform translate-x-8 -translate-y-8 rotate-45 group-hover:scale-150 transition-transform duration-700" />
                      
                      <Calendar className="text-[#FF5A1F] mb-6 group-hover:scale-110 transition-transform duration-500" size={36} />
                      <h3 className="text-2xl font-black text-white mb-6" style={{letterSpacing: '0.02em'}}>{event.name}</h3>
                      <div className="space-y-3 text-[#A2A9B1]">
                        <div className="flex items-center gap-3 group-hover:translate-x-2 transition-transform duration-300">
                          <div className="w-1 h-6 bg-[#FF5A1F]" />
                          <span className="text-sm font-semibold">{event.date}</span>
                        </div>
                        <div className="flex items-center gap-3 group-hover:translate-x-2 transition-transform duration-300" style={{transitionDelay: '50ms'}}>
                          <div className="w-1 h-6 bg-[#FF5A1F]" />
                          <span className="text-sm font-semibold">{event.time}</span>
                        </div>
                        <div className="flex items-center gap-3 group-hover:translate-x-2 transition-transform duration-300" style={{transitionDelay: '100ms'}}>
                          <div className="w-1 h-6 bg-[#FF5A1F]" />
                          <span className="text-sm font-semibold">{event.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Team Preview */}
          <div className="py-32 bg-gradient-to-b from-black to-[#132038] relative overflow-hidden">
            <GridScan sensitivity={0.3} scanOpacity={0.2} />
            <ClawMarkImage opacity={0.08} className="top-1/3 left-1/4 w-[550px] h-[550px]" />
            <ClawMarkImage opacity={0.12} className="bottom-0 right-0 w-[650px] h-[650px]" />
            
            <div className="max-w-7xl mx-auto px-4 relative z-10">
              <div className="text-center mb-20">
                <div 
                  id="team-tag"
                  data-animate
                  className={`inline-block mb-6 transition-all duration-1000 ${
                    isVisible['team-tag'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                  }`}
                >
                  <div className="px-6 py-2 bg-[#FF5A1F]/20 border-2 border-[#FF5A1F]"
                       style={{clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)'}}>
                    <span className="text-[#FF5A1F] font-black text-sm tracking-[0.2em]">THE PACK</span>
                  </div>
                </div>
                
                <h2 
                  id="team-title"
                  data-animate
                  className={`text-5xl md:text-7xl font-black text-white mb-4 transition-all duration-1000 ${
                    isVisible['team-title'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                  }`}
                  style={{fontFamily: 'system-ui, -apple-system, sans-serif', transitionDelay: '100ms', letterSpacing: '0.05em'}}
                >
                  MEET THE TEAM
                </h2>
                <p 
                  id="team-subtitle"
                  data-animate
                  className={`text-xl text-[#A2A9B1] max-w-2xl mx-auto transition-all duration-1000 ${
                    isVisible['team-subtitle'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
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
                    className={`group text-center transition-all duration-1000 ${
                      isVisible[`member-preview-${idx}`] ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-20 scale-95'
                    }`}
                    style={{ transitionDelay: `${idx * 100}ms` }}
                  >
                    <TeamMemberCard member={member} size="small" showRookie={false} />
                    <h3 className="text-white font-bold text-base mt-4 mb-1 group-hover:text-[#FF5A1F] transition-colors duration-300">{member.name}</h3>
                    <p className="text-[#FF5A1F] text-xs font-black tracking-[0.1em]">{member.role.split(',')[0]}</p>
                  </div>
                ))}
              </div>
              
              <div 
                className="text-center animate-fade-in-up"
                style={{animationDelay: '600ms'}}
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

    if (currentPage === 'about') {
      return (
        <div className="min-h-screen bg-gradient-to-b from-[#132038] to-black py-32 relative overflow-hidden">
          <ClawMarkImage opacity={0.10} className="bottom-0 right-0 w-[800px] h-[800px]" />
          <ClawMarkImage opacity={0.06} className="top-1/4 left-0 w-[500px] h-[500px]" />
          
          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <div className="text-center mb-20">
              <div 
                id="about-tag"
                data-animate
                className={`inline-block mb-6 transition-all duration-1000 ${
                  isVisible['about-tag'] ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
                }`}
              >
                <div className="px-6 py-2 bg-[#FF5A1F]/20 border-2 border-[#FF5A1F]"
                     style={{clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)'}}>
                  <span className="text-[#FF5A1F] font-black text-sm tracking-[0.2em]">TEAM 33791</span>
                </div>
              </div>
              
              <h1 
                id="about-title"
                data-animate
                className={`text-6xl md:text-8xl font-black text-white mb-6 transition-all duration-1000 ${
                  isVisible['about-title'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{fontFamily: 'system-ui, -apple-system, sans-serif', transitionDelay: '100ms', letterSpacing: '0.05em'}}
              >
                THE PACK
              </h1>
              <p className="text-xl text-[#A2A9B1] max-w-3xl mx-auto leading-relaxed animate-fade-in-up" style={{animationDelay: '200ms'}}>
                A first-year team built on precision engineering, relentless innovation, and the drive to prove that rookies can compete at the highest level.
              </p>
            </div>

            {/* Students */}
            <div
              id="students-section"
              data-animate
              className={`mb-24 transition-all duration-1000 ${
                isVisible['students-section'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
              }`}
              style={{transitionDelay: '300ms'}}
            >
              <div className="mb-12">
                <div className="flex items-center gap-4 mb-2">
                  <h2 className="text-4xl font-black text-white" style={{fontFamily: 'system-ui, -apple-system, sans-serif', letterSpacing: '0.05em'}}>
                    STUDENTS
                  </h2>
                  <div className="flex-1 h-1 bg-gradient-to-r from-[#FF5A1F] to-transparent" />
                </div>
                <p className="text-[#FF5A1F] font-black tracking-[0.15em] text-sm">THE ENGINEERS</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {teamMembers.students.map((member, i) => (
                  <div
                    key={i}
                    className="group text-center hover:-translate-y-3 transition-all duration-500"
                    style={{
                      animation: `fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards`,
                      animationDelay: `${i * 50}ms`,
                      opacity: 0
                    }}
                  >
                    <TeamMemberCard member={member} size="large" showRookie={true} />
                    <div className="mt-4">
                      <h3 className="text-white font-bold text-base mb-1 group-hover:text-[#FF5A1F] transition-colors duration-300">{member.name}</h3>
                      <p className="text-[#FF5A1F] text-xs font-black tracking-[0.1em] leading-relaxed">{member.role}</p>
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
                className={`mb-24 transition-all duration-1000 ${
                  isVisible['mentors-section'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
                }`}
                style={{transitionDelay: '400ms'}}
              >
                <div className="mb-12">
                  <div className="flex items-center gap-4 mb-2">
                    <h2 className="text-4xl font-black text-white" style={{fontFamily: 'system-ui, -apple-system, sans-serif', letterSpacing: '0.05em'}}>
                      MENTORS
                    </h2>
                    <div className="flex-1 h-1 bg-gradient-to-r from-[#FF5A1F] to-transparent" />
                  </div>
                  <p className="text-[#FF5A1F] font-black tracking-[0.15em] text-sm">THE GUIDES</p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {teamMembers.mentors.map((member, i) => (
                    <div
                      key={i}
                      className="group text-center hover:-translate-y-3 transition-all duration-500 animate-fade-in-up"
                      style={{animationDelay: `${i * 50}ms`}}
                    >
                      <TeamMemberCard member={member} size="large" showRookie={false} />
                      <div className="mt-4">
                        <h3 className="text-white font-bold text-base mb-1 group-hover:text-[#FF5A1F] transition-colors duration-300">{member.name}</h3>
                        <p className="text-[#FF5A1F] text-xs font-black tracking-[0.1em]">{member.role}</p>
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
                className={`transition-all duration-1000 ${
                  isVisible['coaches-section'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
                }`}
                style={{transitionDelay: '500ms'}}
              >
                <div className="mb-12">
                  <div className="flex items-center gap-4 mb-2">
                    <h2 className="text-4xl font-black text-white" style={{fontFamily: 'system-ui, -apple-system, sans-serif', letterSpacing: '0.05em'}}>
                      COACHES
                    </h2>
                    <div className="flex-1 h-1 bg-gradient-to-r from-[#FF5A1F] to-transparent" />
                  </div>
                  <p className="text-[#FF5A1F] font-black tracking-[0.15em] text-sm">THE LEADERS</p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {teamMembers.coaches.map((member, i) => (
                    <div
                      key={i}
                      className="group text-center hover:-translate-y-3 transition-all duration-500 animate-fade-in-up"
                      style={{animationDelay: `${i * 50}ms`}}
                    >
                      <TeamMemberCard member={member} size="large" showRookie={false} />
                      <div className="mt-4">
                        <h3 className="text-white font-bold text-base mb-1 group-hover:text-[#FF5A1F] transition-colors duration-300">{member.name}</h3>
                        <p className="text-[#FF5A1F] text-xs font-black tracking-[0.1em]">{member.role}</p>
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

    // Continue with robots, sponsors, and contact pages following the same pattern...
    // (The rest of the pages follow the same branding guidelines with Midnight Navy #132038, Voltage Orange #FF5A1F, Steel Grey #A2A9B1, 45-degree angles, claw marks, etc.)

    return <div className="min-h-screen bg-black flex items-center justify-center text-white text-2xl">Page content for {currentPage}</div>;
  };

  if (showOpening) {
    return <OpeningAnimation onComplete={handleOpeningComplete} />;
  }

  return (
    <div className="min-h-[100dvh] bg-black overflow-x-hidden">
      <nav className="fixed top-0 w-full bg-[#132038]/95 backdrop-blur-md border-b-2 border-[#FF5A1F] z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-20">
            <div 
              className="flex items-center gap-3 cursor-pointer group" 
              onClick={() => setCurrentPage('home')}
            >
              <div className="transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                <LogoImage />
              </div>
              <div>
                <h1 className="text-white font-black text-lg tracking-[0.1em] group-hover:text-[#FF5A1F] transition-colors duration-300" style={{fontFamily: 'system-ui, -apple-system, sans-serif'}}>
                  WOLVERINE
                </h1>
                <p className="text-[#FF5A1F] text-xs font-black tracking-[0.2em]">TEAM 33791</p>
              </div>
            </div>

            <div className="hidden md:flex gap-8">
              {navigation.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`text-sm font-black tracking-[0.15em] transition-all duration-500 relative group ${
                    currentPage === item.id
                      ? 'text-[#FF5A1F]'
                      : 'text-white hover:text-[#FF5A1F]'
                  }`}
                >
                  {item.name}
                  <div className={`absolute bottom-0 left-0 h-0.5 bg-[#FF5A1F] transition-all duration-500 ${
                    currentPage === item.id ? 'w-full' : 'w-0 group-hover:w-full'
                  }`} />
                </button>
              ))}
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-white hover:text-[#FF5A1F] transition-all duration-300 hover:scale-110"
            >
              {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0f1629] border-t-2 border-[#FF5A1F] animate-slide-in-right">
            <div className="flex flex-col">
              {navigation.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentPage(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`px-6 py-5 text-left font-black tracking-[0.15em] transition-all duration-500 ${
                    currentPage === item.id
                      ? 'text-[#FF5A1F] bg-[#FF5A1F]/10 border-l-4 border-[#FF5A1F]'
                      : 'text-white hover:bg-[#FF5A1F]/5 hover:text-[#FF5A1F] hover:border-l-4 hover:border-[#FF5A1F]/50'
                  }`}
                  style={{
                    animation: `slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards`,
                    animationDelay: `${idx * 50}ms`
                  }}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      <div className="pt-20">{renderPage()}</div>

      <footer className="bg-[#0f1629] border-t-2 border-[#FF5A1F] py-16 relative overflow-hidden">
        <ClawMarkImage opacity={0.08} className="bottom-0 left-0 w-[500px] h-[500px]" />
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-3 gap-12 mb-12">
            <div className="animate-fade-in-up">
              <h3 className="text-white font-black text-xl mb-4 tracking-[0.1em]">WOLVERINE ROBOTICS</h3>
              <p className="text-[#A2A9B1] font-bold">FTC TEAM 33791</p>
              <p className="text-[#A2A9B1]">FRISCO, TEXAS</p>
            </div>
            
            <div className="animate-fade-in-up" style={{animationDelay: '100ms'}}>
              <h3 className="text-white font-black text-xl mb-4 tracking-[0.1em]">QUICK LINKS</h3>
              <div className="flex flex-col gap-2">
                {navigation.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setCurrentPage(item.id)}
                    className="text-[#A2A9B1] hover:text-[#FF5A1F] text-left transition-colors font-bold tracking-wide"
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="animate-fade-in-up" style={{animationDelay: '200ms'}}>
              <h3 className="text-white font-black text-xl mb-4 tracking-[0.1em]">CONNECT</h3>
              <div className="flex gap-4">
                <a 
                  href="https://github.com/wolverine-robotics" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-12 h-12 bg-[#FF5A1F] hover:bg-[#FF5A1F]/80 flex items-center justify-center transition-all duration-300 hover:scale-110"
                  style={{clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)'}}
                >
                  <Github className="text-white" size={20} />
                </a>
                <a 
                  href="https://www.linkedin.com/company/wolverine-robotics/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-12 h-12 bg-[#FF5A1F] hover:bg-[#FF5A1F]/80 flex items-center justify-center transition-all duration-300 hover:scale-110"
                  style={{clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)'}}
                >
                  <Linkedin className="text-white" size={20} />
                </a>
                <a 
                  href="https://www.instagram.com/wolverine_robotics/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-12 h-12 bg-[#FF5A1F] hover:bg-[#FF5A1F]/80 flex items-center justify-center transition-all duration-300 hover:scale-110"
                  style={{clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)'}}
                >
                  <Instagram className="text-white" size={20} />
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t-2 border-[#FF5A1F]/30 pt-8 space-y-2">
            <p className="text-[#A2A9B1] text-sm font-bold text-center tracking-wide">
              © 2025 WOLVERINE ROBOTICS. ALL RIGHTS RESERVED.
            </p>
            <p className="text-[#A2A9B1]/70 text-xs text-center">
              Website developed by Sahejdeep Singh: sahej.robotics@outlook.com
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;

import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, ChevronRight, Award, Calendar, Users, Wrench, Mail, MapPin, Github, Linkedin, Instagram } from 'lucide-react';
import * as THREE from 'three';

const SponsorCard = ({ sponsor, index }) => {
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
    <div className="aspect-video bg-white flex items-center justify-center mb-6 overflow-hidden">
      {!imageLoaded ? (
        <div className="w-full h-full bg-gradient-to-br from-blue-900 to-orange-900 flex items-center justify-center">
          <div className="text-white text-6xl font-black">{initials}</div>
        </div>
      ) : imageError ? (
        <div className="w-full h-full bg-gradient-to-br from-blue-900 to-orange-900 flex items-center justify-center">
          <div className="text-white text-6xl font-black">{initials}</div>
        </div>
      ) : (
        <img 
          src={sponsor.image} 
          alt={sponsor.name} 
          className="w-full h-full object-contain p-4" 
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
    ? 'w-24 h-24 text-3xl' 
    : 'aspect-square text-6xl';
  
  return (
    <div className={`${sizeClasses} bg-gradient-to-br from-blue-600 to-orange-600 mx-auto flex items-center justify-center text-white font-bold overflow-hidden relative`}>
      {!imageLoaded || imageError ? (
        <span>{member.initials}</span>
      ) : (
        <img 
          src={member.image} 
          alt={member.name} 
          className="w-full h-full object-cover" 
        />
      )}
      {showRookie && member.rookie && (
        <div className="absolute top-2 right-2 bg-orange-600 text-white text-xs font-bold px-2 py-1 border border-orange-400 shadow-lg">
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
        <span className="text-white font-black">{fallbackText}</span>
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
    <div className="w-12 h-12 flex items-center justify-center overflow-hidden">
      {!imageLoaded || imageError ? (
        <div className="w-full h-full bg-gradient-to-br from-blue-600 to-orange-600 flex items-center justify-center text-white font-black text-xl">
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

const GridScan = ({ sensitivity = 0.55, lineThickness = 1, linesColor = '#392e4e', scanColor = '#FF6B35', scanOpacity = 0.4, gridScale = 0.1, noiseIntensity = 0.01 }) => {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const materialRef = useRef(null);
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
    float fadeStrength = 2.0;
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

    float scanZ = mod(iTime * 0.5, 2.0);
    float dz = abs(hit.z - scanZ);
    float sigma = 0.18;
    float scanPulse = exp(-0.5 * (dz * dz) / (sigma * sigma));

    vec3 gridCol = uLinesColor * lineMask * fade;
    vec3 scanCol = uScanColor * scanPulse * uScanOpacity;

    color = gridCol + scanCol;

    float n = fract(sin(dot(gl_FragCoord.xy + vec2(iTime * 123.4), vec2(12.9898,78.233))) * 43758.5453123);
    color += (n - 0.5) * uNoise;
    color = clamp(color, 0.0, 1.0);
    float alpha = clamp(max(lineMask, scanPulse * uScanOpacity), 0.0, 1.0);
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
    materialRef.current = material;

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
    const skewScale = THREE.MathUtils.lerp(0.06, 0.2, s);
    const smoothTime = THREE.MathUtils.lerp(0.45, 0.12, s);
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

      const skew = new THREE.Vector2(lookCurrent.current.x * skewScale, -lookCurrent.current.y * 1.4 * skewScale);
      material.uniforms.uSkew.value.set(skew.x, skew.y);
      material.uniforms.iTime.value = now / 1000;
      
      renderer.clear(true, true, true);
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

const ClickSpark = ({ children, sparkColor = '#FF6B35', sparkSize = 10, sparkRadius = 15, sparkCount = 8, duration = 200 }) => {
  const [sparks, setSparks] = useState([]);

  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newSparks = Array.from({ length: sparkCount }, (_, i) => ({
      id: Date.now() + i,
      x,
      y,
      angle: (Math.PI * 2 * i) / sparkCount
    }));
    
    setSparks(prev => [...prev, ...newSparks]);
    
    setTimeout(() => {
      setSparks(prev => prev.filter(spark => !newSparks.find(ns => ns.id === spark.id)));
    }, duration);
  };

  return (
    <div onClick={handleClick} style={{ position: 'relative', cursor: 'pointer' }}>
      {children}
      {sparks.map(spark => (
        <div
          key={spark.id}
          style={{
            position: 'absolute',
            left: spark.x,
            top: spark.y,
            width: sparkSize,
            height: sparkSize,
            backgroundColor: sparkColor,
            borderRadius: '50%',
            pointerEvents: 'none',
            animation: `sparkFly ${duration}ms ease-out forwards`,
            '--spark-angle': `${spark.angle}rad`,
            '--spark-radius': `${sparkRadius}px`
          }}
        />
      ))}
      <style>{`
        @keyframes sparkFly {
          0% {
            transform: translate(-50%, -50%) translate(0, 0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) 
              translate(
                calc(cos(var(--spark-angle)) * var(--spark-radius)),
                calc(sin(var(--spark-angle)) * var(--spark-radius))
              ) 
              scale(0);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState({});

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(50px) scale(0.95);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
      .animate-fade-in-up {
        animation: fadeInUp 1s ease-out forwards;
        opacity: 0;
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
    }, 50);
    
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
      { threshold: 0.05 }
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
    { name: 'Home', id: 'home' },
    { name: 'About', id: 'about' },
    { name: 'Robots', id: 'robots' },
    { name: 'Sponsors', id: 'sponsors' },
    { name: 'Contact', id: 'contact' },
  ];

  const teamMembers = {
    students: [
      { name: 'Dev Gavande', role: 'Team Captain, Founder, Driver, CAD Lead, Build Team Lead', image: '/data/team/dev.jpg', initials: 'DG', rookie: false },
      { name: 'Sahejdeep Singh', role: 'Lead Programmer, Drive Coach, Build Team', image: '/data/team/sahejdeep.jpg', initials: 'SS', rookie: true },
      { name: 'Sripaadh J Kuppusamy', role: 'Human Player and Build Team', image: '/data/team/sripadh.jpg', initials: 'SK', rookie: true },
      { name: 'Manveer Singh Tib', role: 'Human Player and Build Team', image: '/data/team/manveer.jpg', initials: 'MT', rookie: true },
      { name: 'Piousvir Singh', role: 'Build Team', image: '/data/team/pious.jpg', initials: 'PS', rookie: true },
      { name: 'Kalvik Das', role: 'Outreach', image: '/data/team/Kalvik.jpg', initials: 'KD', rookie: true },
      { name: 'Jacob Esparza', role: 'Outreach', image: '/data/team/Jacob.jpeg', initials: 'JE', rookie: true },
      { name: 'Alexander Fiderfish', role: 'Outreach', image: '/data/team/member9.jpg', initials: 'AF', rookie: true },
      { name: 'Pratham Erramilli', role: 'Outreach', image: '/data/team/member10.jpg', initials: 'PE', rookie: true },
      { name: 'Abhi Ravulaparthy', role: 'Outreach', image: '/data/team/member11.jpg', initials: 'AR', rookie: true },
      { name: 'Kavin Murugan', role: 'Outreach', image: '/data/team/member12.jpg', initials: 'KM', rookie: true },
      { name: 'Arshaan Husain', role: 'Outreach', image: '/data/team/member13.jpg', initials: 'AH', rookie: true },
      { name: 'Trisha Chauhan', role: 'Outreach', image: '/data/team/member14.jpg', initials: 'TC', rookie: true },
      { name: 'Kaiden Lee', role: 'Outreach', image: '/data/team/member15.jpg', initials: 'KL', rookie: true },
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
          <div className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-black via-gray-900 to-blue-900">
            <GridScan
              sensitivity={0.55}
              lineThickness={1}
              linesColor="#392e4e"
              gridScale={0.1}
              scanColor="#FF6B35"
              scanOpacity={0.4}
              noiseIntensity={0.01}
            />
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(59, 130, 246, 0.3) 1px, transparent 0)',
                backgroundSize: '50px 50px',
                transform: `translateY(${scrollY * 0.3}px)`,
              }}
            />
            
            <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
              <div className="overflow-hidden mb-6">
                <h1 className="text-7xl md:text-9xl font-black text-white animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                  WOLVERINE
                </h1>
              </div>
              <div className="overflow-hidden mb-8">
                <h2 className="text-5xl md:text-7xl font-bold text-orange-500 animate-fade-in-up" style={{animationDelay: '0.4s'}}>
                  ROBOTICS
                </h2>
              </div>
              <div className="overflow-hidden mb-8">
                <p className="text-xl md:text-2xl text-blue-400 font-semibold animate-fade-in-up" style={{animationDelay: '0.6s'}}>
                  FTC Team 33791 | Frisco, Texas
                </p>
              </div>
              <p className="text-lg md:text-xl text-gray-300 mb-12 max-w-3xl mx-auto animate-fade-in-up" style={{animationDelay: '0.8s'}}>
                We are FTC team 33791, Wolverine Robotics from Frisco, TX. This is our first year in FIRST, and we are extremely excited to start our foray into robotics!
              </p>
              
              <div className="flex flex-wrap gap-6 justify-center animate-fade-in-up" style={{animationDelay: '1s'}}>
                <button
                  onClick={() => setCurrentPage('about')}
                  className="group relative px-8 py-4 bg-blue-600 text-white font-bold transition-all duration-300 hover:bg-blue-500 hover:scale-105 border-2 border-blue-400"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Learn More <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
                
                <button
                  onClick={() => setCurrentPage('contact')}
                  className="group relative px-8 py-4 bg-orange-600 text-white font-bold transition-all duration-300 hover:bg-orange-500 hover:scale-105 border-2 border-orange-400"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Join the Team <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className="py-24 bg-gray-900">
            <div className="max-w-7xl mx-auto px-4">
              <h2
                id="robot-highlight"
                data-animate
                className={`text-5xl md:text-6xl font-black text-center mb-16 text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-blue-500 transition-all duration-1000 transform pb-2 ${
                  isVisible['robot-highlight'] ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-32 scale-90'
                }`}
              >
                Meet Matchstick
              </h2>
              
              <div
                id="robot-card"
                data-animate
                className={`bg-gray-800 p-8 md:p-12 border-4 border-blue-500 transition-all duration-1000 hover:border-orange-500 hover:shadow-2xl hover:shadow-blue-500/20 transform ${
                  isVisible['robot-card'] ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-32 scale-90'
                }`}
              >
                <div className="grid md:grid-cols-2 gap-12 items-center">
                  <div className="aspect-square bg-gradient-to-br from-blue-900 to-orange-900 flex items-center justify-center text-white text-9xl font-black border-4 border-orange-500">
                    <RobotImage 
                      src="/data/robots/matchstick-main.jpg" 
                      alt="Matchstick Robot" 
                      fallbackText="MS"
                    />
                  </div>
                  
                  <div>
                    <h3 className="text-4xl font-bold text-white mb-4">Matchstick</h3>
                    <p className="text-gray-300 text-lg mb-6">
                      Our inaugural robot, built in record time and ready to compete at the highest level.
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="bg-blue-900 p-4 border-2 border-blue-500">
                        <p className="text-blue-400 font-semibold mb-1">Season</p>
                        <p className="text-white text-xl font-bold">2025-26 Decode</p>
                      </div>
                      <div className="bg-orange-900 p-4 border-2 border-orange-500">
                        <p className="text-orange-400 font-semibold mb-1">Status</p>
                        <p className="text-white text-xl font-bold">Active</p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => setCurrentPage('robots')}
                      className="group px-6 py-3 bg-orange-600 text-white font-bold transition-all duration-300 hover:bg-orange-500 hover:scale-105 hover:shadow-lg hover:shadow-orange-500/50 border-2 border-orange-400"
                    >
                      <span className="flex items-center gap-2">
                        View Details <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="py-24 bg-black">
            <div className="max-w-7xl mx-auto px-4">
              <h2
                id="events-title"
                data-animate
                className={`text-5xl md:text-6xl font-black text-center mb-16 text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-orange-500 transition-all duration-1000 transform pb-2 ${
                  isVisible['events-title'] ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-32 scale-90'
                }`}
              >
                Upcoming Events
              </h2>
              
              <div className="grid md:grid-cols-3 gap-8">
                {upcomingEvents.map((event, idx) => (
                  <div
                    key={idx}
                    id={`event-${idx}`}
                    data-animate
                    className={`bg-gray-900 p-8 border-2 border-blue-500 hover:border-orange-500 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-2 transition-all duration-500 transform ${
                      isVisible[`event-${idx}`] ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-32 scale-90'
                    }`}
                    style={{ transitionDelay: `${idx * 150}ms` }}
                  >
                    <Calendar className="text-orange-500 mb-4" size={40} />
                    <h3 className="text-2xl font-bold text-white mb-4">{event.name}</h3>
                    <div className="space-y-2 text-gray-300">
                      <p className="flex items-center gap-2">
                        <Calendar size={16} className="text-blue-400" />
                        {event.date}
                      </p>
                      <p className="flex items-center gap-2">
                        <span className="text-blue-400 text-xl">⏰</span>
                        {event.time}
                      </p>
                      <p className="flex items-center gap-2">
                        <MapPin size={16} className="text-blue-400" />
                        {event.location}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="py-24 bg-gradient-to-b from-black to-gray-900">
            <div className="max-w-7xl mx-auto px-4">
              <h2
                id="team-preview"
                data-animate
                className={`text-5xl md:text-6xl font-black text-center mb-16 text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-blue-500 transition-all duration-1000 transform pb-2 ${
                  isVisible['team-preview'] ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-32 scale-90'
                }`}
              >
                Our Team
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {teamMembers.students.slice(0, 4).map((member, idx) => (
                  <div
                    key={idx}
                    id={`member-${idx}`}
                    data-animate
                    className={`group bg-gray-800 p-6 text-center border-2 border-blue-500 hover:border-orange-500 hover:shadow-xl hover:shadow-orange-500/30 hover:-translate-y-2 transition-all duration-500 transform ${
                      isVisible[`member-${idx}`] ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-32 scale-90'
                    }`}
                    style={{ transitionDelay: `${idx * 100}ms` }}
                  >
                    <TeamMemberCard member={member} size="small" showRookie={false} />
                    <h3 className="text-white font-bold text-lg mb-1 mt-4">{member.name}</h3>
                    <p className="text-blue-400 text-sm">{member.role}</p>
                  </div>
                ))}
              </div>
              
              <div className="text-center mt-12">
                <button
                  onClick={() => setCurrentPage('about')}
                  className="group px-8 py-4 bg-blue-600 text-white font-bold transition-all duration-300 hover:bg-blue-500 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/50 border-2 border-blue-400"
                >
                  <span className="flex items-center gap-2">
                    Meet the Team <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (currentPage === 'about') {
      return (
        <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black py-24">
          <div className="max-w-7xl mx-auto px-4">
            <h1
              id="about-title"
              data-animate
              className={`text-6xl md:text-7xl font-black text-center mb-16 text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-orange-500 transition-all duration-1000 transform pb-2 ${
                isVisible['about-title'] ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-32 scale-90'
              }`}
            >
              About Us
            </h1>

            <div
              id="team-gallery"
              data-animate
              className={`transition-all duration-1000 transform ${
                isVisible['team-gallery'] ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-32 scale-90'
              }`}
            >
              <h2 className="text-4xl font-bold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-blue-500 pb-2">
                Students
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
                {teamMembers.students.map((member, i) => (
                  <div
                    key={i}
                    className="bg-gray-900 border-2 border-blue-500 hover:border-orange-500 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-2 transition-all duration-300 overflow-hidden"
                  >
                    <TeamMemberCard member={member} size="large" showRookie={true} />
                    <div className="p-4 bg-gray-900">
                      <h3 className="text-white font-bold text-lg mb-1">{member.name}</h3>
                      <p className="text-blue-400 text-sm">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>

              {teamMembers.mentors.length > 0 && (
                <>
                  <h2 className="text-4xl font-bold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-orange-500 pb-2">
                    Mentors
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
                    {teamMembers.mentors.map((member, i) => (
                      <div
                        key={i}
                        className="bg-gray-800 border-2 border-blue-500 hover:border-orange-500 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 overflow-hidden group"
                        style={{ transform: 'translateZ(0)' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-8px) translateZ(0)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0) translateZ(0)';
                        }}
                      >
                        <TeamMemberCard member={member} size="large" showRookie={false} />
                        <div className="p-4 bg-gray-900">
                          <h3 className="text-white font-bold text-lg mb-1">{member.name}</h3>
                          <p className="text-blue-400 text-sm">{member.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {teamMembers.coaches.length > 0 && (
                <>
                  <h2 className="text-4xl font-bold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-blue-500 pb-2">
                    Coaches
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {teamMembers.coaches.map((member, i) => (
                      <div
                        key={i}
                        className="bg-gray-800 border-2 border-blue-500 hover:border-orange-500 hover:shadow-xl hover:shadow-orange-500/30 transition-all duration-300 overflow-hidden group"
                        style={{ transform: 'translateZ(0)' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-8px) translateZ(0)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0) translateZ(0)';
                        }}
                      >
                        <TeamMemberCard member={member} size="large" showRookie={false} />
                        <div className="p-4 bg-gray-900">
                          <h3 className="text-white font-bold text-lg mb-1">{member.name}</h3>
                          <p className="text-blue-400 text-sm">{member.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      );
    }

    if (currentPage === 'robots') {
      return (
        <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black py-24">
          <div className="max-w-7xl mx-auto px-4">
            <h1
              id="robots-title"
              data-animate
              className={`text-6xl md:text-7xl font-black text-center mb-16 text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-blue-500 transition-all duration-1000 transform pb-2 ${
                isVisible['robots-title'] ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-32 scale-90'
              }`}
            >
              Our Robots
            </h1>

            <div
              id="matchstick-detail"
              data-animate
              className={`bg-gray-800 p-8 md:p-12 border-4 border-blue-500 transition-all duration-1000 hover:border-orange-500 hover:shadow-2xl hover:shadow-orange-500/20 transform ${
                isVisible['matchstick-detail'] ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-32 scale-90'
              }`}
            >
              <div className="grid md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <div className="aspect-square bg-gradient-to-br from-orange-900 to-blue-900 flex items-center justify-center text-white text-9xl font-black border-4 border-orange-500 overflow-hidden">
                    <RobotImage 
                      src="/data/robots/matchstick-main.jpg" 
                      alt="Matchstick Robot" 
                      fallbackText="MS"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="aspect-square bg-gradient-to-br from-blue-800 to-orange-800 flex items-center justify-center text-white text-5xl font-bold border-2 border-blue-500 hover:border-orange-500 transition-all duration-300 overflow-hidden"
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

                <div>
                  <h2 className="text-5xl font-black text-white mb-4">Matchstick</h2>
                  <p className="text-blue-400 text-xl font-semibold mb-6">Season 2025-26</p>
                  
                  <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                    Matchstick represents our team's dedication and rapid development. This robot showcases our ability to work under pressure and deliver exceptional results.
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-blue-900 p-6 border-2 border-blue-500">
                      <p className="text-blue-400 font-semibold mb-2">Weight</p>
                      <p className="text-white text-2xl font-bold">28 lbs</p>
                    </div>
                    <div className="bg-orange-900 p-6 border-2 border-orange-500">
                      <p className="text-orange-400 font-semibold mb-2">Height</p>
                      <p className="text-white text-2xl font-bold">18 in</p>
                    </div>
                    <div className="bg-blue-900 p-6 border-2 border-blue-500">
                      <p className="text-blue-400 font-semibold mb-2">Drive Type</p>
                      <p className="text-white text-2xl font-bold">Mecanum</p>
                    </div>
                    <div className="bg-orange-900 p-6 border-2 border-orange-500">
                      <p className="text-orange-400 font-semibold mb-2">Language</p>
                      <p className="text-white text-2xl font-bold">Java JDK 17</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-blue-900 to-blue-800 p-6 border-2 border-blue-500 mb-6">
                    <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
                      <Award className="text-orange-500" />
                      Achievements
                    </h3>
                    <ul className="space-y-2 text-gray-300">
                      <li className="flex items-center gap-2">
                        <span className="text-blue-400">•</span>
                        5-0-1 Record
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-blue-400">•</span>
                        #2 OPR and Rank in League Meet 3
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-blue-400">•</span>
                        Wolverine Robotics' Inaugural Robot
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-r from-orange-900 to-orange-800 p-6 border-2 border-orange-500">
                    <h3 className="text-white font-bold text-xl mb-4">Key Features</h3>
                    <ul className="space-y-2 text-gray-300">
                      <li className="flex items-center gap-2">
                        <span className="text-orange-400">✓</span>
                        12 Ball And 6 Ball Autonomous
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-orange-400">✓</span>
                        1 Second Cycle Time
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-orange-400">✓</span>
                        Auto-Adujusting Aiming System
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-orange-400">✓</span>
                        Durable aluminum chassis
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (currentPage === 'sponsors') {
      return (
        <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black py-24">
          <div className="max-w-7xl mx-auto px-4">
            <h1
              id="sponsors-title"
              data-animate
              className={`text-6xl md:text-7xl font-black text-center mb-16 text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-orange-500 transition-all duration-1000 transform pb-2 ${
                isVisible['sponsors-title'] ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-32 scale-90'
              }`}
            >
              Our Sponsors
            </h1>

            <div
              id="sponsors-intro"
              data-animate
              className={`bg-gray-800 p-8 md:p-12 mb-16 border-4 border-blue-500 text-center transition-all duration-1000 transform ${
                isVisible['sponsors-intro'] ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-32 scale-90'
              }`}
            >
              <p className="text-gray-300 text-lg leading-relaxed mb-4">
                We are incredibly grateful to our sponsors for their generous support. Their contributions make it possible for us to compete, learn, and grow as a team.
              </p>
              <p className="text-blue-400 text-xl font-semibold">
                Thank you for believing in our mission!
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
              {[
                { name: 'Wakeland High School', image: '/data/sponsors/wakeland-high-school.jpg' },
                { name: 'Wakeland High School NHS', image: '/data/sponsors/wakeland-nhs.jpg' }
              ].map((sponsor, idx) => (
                <div
                  key={idx}
                  id={`sponsor-${idx}`}
                  data-animate
                  className={`bg-gray-800 p-8 border-4 border-blue-500 hover:border-orange-500 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-2 transition-all duration-500 transform ${
                    isVisible[`sponsor-${idx}`] ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-32 scale-90'
                  }`}
                  style={{ transitionDelay: `${idx * 200}ms` }}
                >
                  <SponsorCard sponsor={sponsor} index={idx} />
                  <h3 className="text-white font-bold text-2xl text-center">{sponsor.name}</h3>
                </div>
              ))}
            </div>

            <div
              id="become-sponsor"
              data-animate
              className={`mt-16 bg-gradient-to-r from-blue-900 to-orange-900 p-8 md:p-12 border-4 border-orange-500 text-center transition-all duration-1000 transform ${
                isVisible['become-sponsor'] ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-32 scale-90'
              }`}
            >
              <h2 className="text-4xl font-bold text-white mb-6">Become a Sponsor</h2>
              <p className="text-gray-200 text-lg mb-8 max-w-3xl mx-auto">
                Interested in supporting STEM education and robotics in our community? We'd love to partner with you!
              </p>
              <button
                onClick={() => setCurrentPage('contact')}
                className="group px-8 py-4 bg-white text-blue-900 font-bold transition-all duration-300 hover:bg-gray-100 hover:scale-105 hover:shadow-lg border-2 border-white"
              >
                <span className="flex items-center gap-2">
                  Contact Us <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (currentPage === 'contact') {
      const ContactForm = () => {
        const [formData, setFormData] = useState({ name: '', email: '', message: '' });
        const [submitted, setSubmitted] = useState(false);

        const handleSubmit = (e) => {
          e.preventDefault();
          setSubmitted(true);
          setTimeout(() => {
            setSubmitted(false);
            setFormData({ name: '', email: '', message: '' });
          }, 3000);
        };

        return (
          <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black py-24">
            <div className="max-w-4xl mx-auto px-4">
              <h1
                id="contact-title"
                data-animate
                className={`text-6xl md:text-7xl font-black text-center mb-16 text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-orange-500 transition-all duration-1000 transform pb-2 ${
                  isVisible['contact-title'] ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-32 scale-90'
                }`}
              >
                Get In Touch
              </h1>

              <div className="grid md:grid-cols-2 gap-12 mb-16">
                <div
                  id="contact-info"
                  data-animate
                  className={`space-y-6 transition-all duration-1000 transform ${
                    isVisible['contact-info'] ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 -translate-x-32 scale-90'
                  }`}
                >
                  <div className="bg-gray-800 p-8 border-2 border-blue-500 hover:border-orange-500 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300">
                    <Mail className="text-blue-400 mb-4" size={32} />
                    <h3 className="text-white font-bold text-xl mb-2">Email Us</h3>
                    <p className="text-gray-300">wolverine.robotics.33791@gmail.com</p>
                  </div>

                  <div className="bg-gray-800 p-8 border-2 border-blue-500 hover:border-orange-500 transition-all duration-300">
                    <MapPin className="text-orange-400 mb-4" size={32} />
                    <h3 className="text-white font-bold text-xl mb-2">Location</h3>
                    <p className="text-gray-300">Wakeland High School<br />Frisco, Texas</p>
                  </div>

                  <div className="bg-gray-800 p-8 border-2 border-blue-500 hover:border-orange-500 transition-all duration-300">
                    <Users className="text-blue-400 mb-4" size={32} />
                    <h3 className="text-white font-bold text-xl mb-2">Social Media</h3>
                    <div className="flex gap-4 mt-4">
                      <a href="https://github.com/wolverine-robotics" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-blue-600 hover:bg-blue-500 flex items-center justify-center transition-all duration-300">
                        <Github className="text-white" size={24} />
                      </a>
                      <a href="https://www.linkedin.com/company/wolverine-robotics/" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-blue-600 hover:bg-blue-500 flex items-center justify-center transition-all duration-300">
                        <Linkedin className="text-white" size={24} />
                      </a>
                      <a href="https://www.instagram.com/wolverine_robotics/" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-orange-600 hover:bg-orange-500 flex items-center justify-center transition-all duration-300">
                        <Instagram className="text-white" size={24} />
                      </a>
                    </div>
                  </div>
                </div>

                <div
                  id="contact-form"
                  data-animate
                  className={`transition-all duration-1000 transform ${
                    isVisible['contact-form'] ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-32 scale-90'
                  }`}
                >
                  <div className="bg-gray-800 p-8 border-2 border-blue-500">
                    <div className="mb-6">
                      <label className="block text-white font-semibold mb-2">Name</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-900 text-white border-2 border-blue-500 focus:border-orange-500 focus:outline-none transition-colors"
                        required
                      />
                    </div>

                    <div className="mb-6">
                      <label className="block text-white font-semibold mb-2">Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-900 text-white border-2 border-blue-500 focus:border-orange-500 focus:outline-none transition-colors"
                        required
                      />
                    </div>

                    <div className="mb-6">
                      <label className="block text-white font-semibold mb-2">Message</label>
                      <textarea
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        rows="5"
                        className="w-full px-4 py-3 bg-gray-900 text-white border-2 border-blue-500 focus:border-orange-500 focus:outline-none transition-colors resize-none"
                        required
                      />
                    </div>

                    <button
                      onClick={handleSubmit}
                      className={`w-full py-4 font-bold transition-all duration-300 border-2 ${
                        submitted
                          ? 'bg-green-600 text-white border-green-500'
                          : 'bg-orange-600 hover:bg-orange-500 text-white border-orange-400'
                      }`}
                      disabled={submitted}
                    >
                      {submitted ? '✓ Message Sent!' : 'Send Message'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      };

      return <ContactForm />;
    }

    return null;
  };

  return (
    <ClickSpark
      sparkColor='#FF6B35'
      sparkSize={10}
      sparkRadius={15}
      sparkCount={8}
      duration={400}
    >
      <div className="min-h-[100dvh] bg-black overflow-x-hidden">
      <nav className="fixed top-0 w-full bg-black/95 backdrop-blur-sm border-b-2 border-blue-500 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentPage('home')}>
              <LogoImage />
              <div>
                <h1 className="text-white font-black text-xl">WOLVERINE</h1>
                <p className="text-blue-400 text-xs font-semibold">TEAM 33791</p>
              </div>
            </div>

            <div className="hidden md:flex gap-8">
              {navigation.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`text-lg font-bold transition-all duration-300 ${
                    currentPage === item.id
                      ? 'text-orange-500'
                      : 'text-white hover:text-blue-400'
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-white"
            >
              {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-gray-900 border-t-2 border-blue-500">
            <div className="flex flex-col py-4">
              {navigation.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentPage(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`px-6 py-4 text-left font-bold transition-all duration-300 ${
                    currentPage === item.id
                      ? 'text-orange-500 bg-gray-800'
                      : 'text-white hover:bg-gray-800'
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      <div className="pt-20">{renderPage()}</div>

      <footer className="bg-black border-t-2 border-blue-500 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold text-xl mb-4">Wolverine Robotics</h3>
              <p className="text-gray-400">FTC Team 33791</p>
              <p className="text-gray-400">Frisco, Texas</p>
            </div>
            <div>
              <h3 className="text-white font-bold text-xl mb-4">Quick Links</h3>
              <div className="flex flex-col gap-2">
                {navigation.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setCurrentPage(item.id)}
                    className="text-gray-400 hover:text-blue-400 text-left transition-colors"
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-white font-bold text-xl mb-4">Connect</h3>
              <div className="flex gap-4">
                <a href="https://github.com/wolverine-robotics" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-blue-600 hover:bg-blue-500 flex items-center justify-center transition-all duration-300">
                  <Github className="text-white" size={20} />
                </a>
                <a href="https://www.linkedin.com/company/wolverine-robotics/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-blue-600 hover:bg-blue-500 flex items-center justify-center transition-all duration-300">
                  <Linkedin className="text-white" size={20} />
                </a>
                <a href="https://www.instagram.com/wolverine_robotics/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-orange-600 hover:bg-orange-500 flex items-center justify-center transition-all duration-300">
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
    </ClickSpark>
  );
};

export default App;

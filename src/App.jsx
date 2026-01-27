import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, ChevronRight, Award, Calendar, Users, Wrench, Mail, MapPin, Github, Linkedin, Instagram } from 'lucide-react';

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
      <img 
        src="/data/logo.png" 
        alt="Wolverine Robotics Logo" 
        className="w-full h-full object-contain" 
      />
    </div>
  );
};

const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState({});

  // Add CSS animations
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
      { name: 'Dev Gavande', role: 'Team Captain, Founder, Driver, CAD Lead, Build Team Lead', image: '/data/team/dev.jpg', initials: 'D', rookie: false },
      { name: 'Sahejdeep Singh', role: 'Build Team, Drive Coach, and Lead Programmer', image: '/data/team/sahejdeep.jpg', initials: 'S', rookie: true },
      { name: 'Sripaadh J Kuppusamy', role: 'Human Player and Build Team', image: '/data/team/sripadh.jpg', initials: 'S', rookie: true },
      { name: 'Manveer Singh Tib', role: 'Human Player and Build Team', image: '/data/team/manveer.jpg', initials: 'M', rookie: true },
      { name: 'Piousvir Singh', role: 'Build Team', image: '/data/team/pious.jpg', initials: 'P', rookie: true },
      { name: 'Kalvik Das', role: 'MoneyBag', image: '/data/team/Kalvik.jpg', initials: 'KD', rookie: true },
      { name: 'Jacob Esparza', role: 'MoneyBag', image: '/data/team/Jacob.jpeg', initials: 'JE', rookie: true },
      { name: 'Alexander Fiderfish', role: 'MoneyBag', image: '/data/team/member9.jpg', initials: 'M9', rookie: true },
      { name: 'Pratham Erramilli', role: 'MoneyBag', image: '/data/team/member10.jpg', initials: 'M10', rookie: true },
      { name: 'Abhi Ravulaparthy', role: 'MoneyBag', image: '/data/team/member11.jpg', initials: 'M11', rookie: true },
      { name: 'Kavin Murugan', role: 'MoneyBag', image: '/data/team/member12.jpg', initials: 'M12', rookie: true },
      { name: 'Arshaan Husain', role: 'MoneyBag', image: '/data/team/member13.jpg', initials: 'M13', rookie: true },
      { name: 'Trisha Chauhan', role: 'MoneyBag', image: '/data/team/member14.jpg', initials: 'M14', rookie: true },
      { name: 'Kaiden Lee', role: 'MoneyBag', image: '/data/team/member15.jpg', initials: 'M15', rookie: true },
      { name: 'Jivansh Pandya', role: 'MoneyBag', image: '/data/team/Jivansh.jpg', initials: 'M16', rookie: true },
    ],
    mentors: [
      { name: 'Abdullah Khalid', role: 'Youth Software Mentor', image: '/data/team/abdullah.jpg', initials: 'A', rookie: false },
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
              Website developed by Sahejdeep Singh: deepsahejs@gmail.com
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;

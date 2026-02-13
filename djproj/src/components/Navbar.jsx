import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { NavLink } from "react-router-dom";

const Navbar = ({ isMinimalist, setIsMinimalist }) => {
  const navRef = useRef(null);
  const linksRef = useRef([]);
  const toggleRef = useRef(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef(null);

  // GSAP for navbar elem
  useEffect(() => {
    gsap.fromTo(
      navRef.current,
      { y: -100, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: 'power3.out' }
    );

    gsap.fromTo(
      linksRef.current,
      { y: -30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.15,
        delay: 0.5,
        ease: 'power2.out'
      }
    );

    gsap.fromTo(
      toggleRef.current,
      { scale: 0, opacity: 0 },
      {
        scale: 1,
        opacity: 1,
        duration: 0.8,
        delay: 0.95,
        ease: 'back.out(2)'
      }
    );
  }, []);

  // Mobile ke liye animation
  useEffect(() => {
    if (isMobileMenuOpen && mobileMenuRef.current) {
      gsap.fromTo(
        mobileMenuRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
      );
    }
  }, [isMobileMenuOpen]);

  return (
    <>
      <nav 
        ref={navRef} 
        className={`fixed top-0 left-0 w-full z-[1000] py-3 sm:py-4 transition-all duration-700 ease-in-out border-b ${
          isMinimalist 
            ? 'bg-white/40 backdrop-blur-xl border-white/20 shadow-[0_10px_30px_rgba(240,98,146,0.1)]' 
            : 'bg-black/85 backdrop-blur-lg border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.3)]'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">

          <div className={`text-2xl sm:text-3xl font-black tracking-tight transition-all duration-500 cursor-pointer hover:scale-105 active:scale-95 ${
            isMinimalist 
              ? 'text-[#ad1457]' 
              : 'bg-gradient-to-r from-purple-500 to-purple-700 bg-clip-text text-transparent'
          }`}>
            VibeSync
          </div>
          
         {/*Desktop k liye  */}
          <div className="hidden md:flex items-center gap-6 lg:gap-10">
            <ul className="flex gap-6 lg:gap-10 list-none">
              {['Home', 'Explore'].map((item, index) => (
                <li key={item} ref={el => linksRef.current[index] = el}>
                  <NavLink
                    to={
                      item === "Home"
                        ? "/"
                        : item === "My Space"
                        ? "/my-space"
                        : "/explore"
                    }

                    // to show(hover) on which page user is
                    className={({ isActive }) => `
                      no-underline text-xs sm:text-sm uppercase tracking-widest font-bold relative py-2 transition-all duration-500 group
                      ${isActive 
                        ? isMinimalist
                          ? 'text-[#ad1457] font-black'
                          : 'text-purple-400 font-black'
                        : isMinimalist
                          ? 'text-[#880e4f]/80 hover:text-[#ad1457]'
                          : 'text-white hover:text-purple-500'
                      }
                    `}
                  >
                    {({ isActive }) => (
                      <>
                        {item}
                        <span
                          className={`absolute bottom-0 left-0 h-0.5 transition-all duration-300 ${
                            isMinimalist
                              ? 'bg-[#ad1457]'
                              : 'bg-gradient-to-r from-purple-500 to-purple-700'
                          } ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`}
                        />
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>

            {/* Theme Toggle Button */}
            <button
              ref={toggleRef}
              onClick={() => setIsMinimalist(!isMinimalist)}
              className={`relative flex items-center gap-2 lg:gap-3 px-3 lg:px-5 py-2 rounded-full transition-all duration-500 group border-2 ${
                isMinimalist 
                  ? 'bg-white/60 border-pink-200 hover:border-pink-300 shadow-inner' 
                  : 'bg-gradient-to-r from-purple-500/10 to-purple-700/10 border-purple-500/40 hover:border-purple-400'
              }`}
            >
              <span className={`text-[9px] lg:text-[10px] uppercase tracking-tighter font-black transition-colors duration-500 ${
                isMinimalist ? 'text-[#ad1457]' : 'text-white/80 group-hover:text-white'
              }`}>
                {isMinimalist ? 'Minimalist' : 'Dynamic'}
              </span>
              
              <div className={`relative w-8 lg:w-10 h-4 lg:h-5 rounded-full transition-all duration-500 ${
                isMinimalist ? 'bg-pink-100 shadow-inner' : 'bg-purple-900/40'
              }`}>
                <div 
                  className={`absolute top-0.5 w-3 lg:w-4 h-3 lg:h-4 rounded-full shadow-md transition-all duration-500 ease-[cubic-bezier(0.68,-0.55,0.27,1.55)] ${
                    isMinimalist 
                      ? 'left-[18px] lg:left-[22px] bg-[#f06292] shadow-[0_0_8px_rgba(240,98,146,0.4)]' 
                      : 'left-0.5 bg-gradient-to-r from-purple-400 to-purple-600'
                  }`}
                />
              </div>
              
              <span className="text-base lg:text-lg leading-none">{isMinimalist ? '✨' : '🎨'}</span>
            </button>
          </div>

          {/* Mobile ka Menu Button */}
          <div className="md:hidden flex items-center gap-3">
            {/* Mobile Theme Toggle */}
            <button
              onClick={() => setIsMinimalist(!isMinimalist)}
              className={`p-2 rounded-lg transition-all duration-500 ${
                isMinimalist 
                  ? 'bg-white/60 text-[#ad1457]' 
                  : 'bg-purple-500/20 text-white'
              }`}
            >
              <span className="text-lg">{isMinimalist ? '✨' : '🎨'}</span>
            </button>

            {/* Hamburger Menu */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2 rounded-lg transition-all duration-300 ${
                isMinimalist 
                  ? 'bg-white/60 text-[#ad1457]' 
                  : 'bg-purple-500/20 text-white'
              }`}
            >
              <div className="w-6 h-5 flex flex-col justify-between">
                <span className={`block h-0.5 w-full transition-all duration-300 ${
                  isMinimalist ? 'bg-[#ad1457]' : 'bg-white'
                } ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                <span className={`block h-0.5 w-full transition-all duration-300 ${
                  isMinimalist ? 'bg-[#ad1457]' : 'bg-white'
                } ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
                <span className={`block h-0.5 w-full transition-all duration-300 ${
                  isMinimalist ? 'bg-[#ad1457]' : 'bg-white'
                } ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className={`fixed top-[60px] sm:top-[68px] left-0 right-0 z-[999] md:hidden transition-all duration-300 border-b ${
            isMinimalist
              ? 'bg-white/95 backdrop-blur-xl border-white/20 shadow-lg'
              : 'bg-black/95 backdrop-blur-lg border-white/5 shadow-xl'
          }`}
        >
          <ul className="flex flex-col px-4 py-4 gap-2">
            {['Home', 'Explore'].map((item) => (
              <li key={item}>
                <NavLink
                  to={
                    item === "Home"
                      ? "/"
                      : item === "My Space"
                      ? "/my-space"
                      : "/explore"
                  }
                  onClick={() => setIsMobileMenuOpen(false)}
                  // mob hover effect 
                  className={({ isActive }) => `
                    block px-4 py-3 rounded-lg text-sm uppercase tracking-widest font-bold transition-all duration-300
                    ${isActive
                      ? isMinimalist
                        ? 'bg-pink-100 text-[#ad1457] font-black'
                        : 'bg-purple-500/20 text-purple-300 font-black'
                      : isMinimalist
                        ? 'text-[#880e4f]/80 hover:bg-pink-50 hover:text-[#ad1457]'
                        : 'text-white hover:bg-purple-500/10 hover:text-purple-400'
                    }
                  `}
                >
                  {item}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Mobile Theme Info */}
          <div className={`px-4 py-3 border-t ${
            isMinimalist ? 'border-pink-100' : 'border-white/10'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs uppercase tracking-wider font-bold ${
                isMinimalist ? 'text-[#880e4f]/60' : 'text-white/60'
              }`}>
                Current Theme
              </span>
              <span className={`text-sm font-black ${
                isMinimalist ? 'text-[#ad1457]' : 'text-purple-400'
              }`}>
                {isMinimalist ? 'Minimalist ✨' : 'Dynamic 🎨'}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
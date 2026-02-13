import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import Navbar from './Navbar';
import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import Robot from "./robot";
import { OrbitControls } from "@react-three/drei";
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';

gsap.registerPlugin(ScrollTrigger);

const Home = () => {
  const heroTitleRef = useRef(null);
  const heroDescRef = useRef(null);
  const startButtonRef = useRef(null);
  const ctaButtonsRef = useRef([]);
  const emotionCardsRef = useRef([]);
  const containerRef = useRef(null);
  const featureCardsRef = useRef([]);
  const [isPaused, setIsPaused] = useState(false);
  const pausedTextRef = useRef(null);

  const [heartbeatActive, setHeartbeatActive] = useState(false);
  const [isMinimalist, setIsMinimalist] = useState(false);

  useEffect(() => {
    // Hero text animations
    const tl = gsap.timeline({ delay: 0.3 });
    if (heroTitleRef.current) {
      const titleChars = heroTitleRef.current.querySelectorAll('.char');
      tl.fromTo(
        titleChars,
        { y: 100, opacity: 0, rotationX: -90 },
        { y: 0, opacity: 1, rotationX: 0, duration: 1, stagger: 0.05, ease: 'back.out(1.7)' }
      );
    }

    tl.fromTo(heroDescRef.current, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out' }, '-=0.4');

    // Animate CTA buttons
    tl.fromTo(
      [startButtonRef.current, ctaButtonsRef.current[0]],
      { scale: 0, opacity: 0, y: 30 },
      { scale: 1, opacity: 1, y: 0, duration: 0.7, stagger: 0.2, ease: 'back.out(1.8)' },
      '-=0.4'
    );

    // ScrollTrigger for emotion cards
    emotionCardsRef.current.forEach((card) => {
      if (!card) return;
      gsap.fromTo(
        card,
        { y: 70, opacity: 0, scale: 0.94 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: card,
            start: "top 82%",
            toggleActions: "play none none reverse",
          }
        }
      );
    });

    // ScrollTrigger for feature cards
    if (featureCardsRef.current.length > 0) {
      gsap.fromTo(
        featureCardsRef.current,
        { y: 90, opacity: 0, scale: 0.92 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 1,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: featureCardsRef.current[0],
            start: "top 90%",
            toggleActions: "play none none reverse",
          }
        }
      );
    }
  }, []);

  useEffect(() => {
    if (isPaused && pausedTextRef.current) {
      gsap.fromTo(
        pausedTextRef.current,
        { opacity: 0, scale: 0.8, y: 40 },
        { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: "power3.out" }
      );
    }
  }, [isPaused]);

  const handleHeartbeat = (e) => {
    setHeartbeatActive(true);
    const ripple = document.createElement('div');
    ripple.className = 'fixed w-0 h-0 border-[3px] border-pink-400 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[9998] animate-[ripple_1s_ease-out_forwards]';
    ripple.style.left = `${e.clientX}px`;
    ripple.style.top = `${e.clientY}px`;
    document.body.appendChild(ripple);
    setTimeout(() => {
      ripple.remove();
      setHeartbeatActive(false);
    }, 1000);
  };

  const splitText = (text) => {
    return text.split('').map((char, i) => (
      <span
        key={i}
        className={`inline-block origin-center char ${
          !isMinimalist
            ? 'bg-gradient-to-r from-[#a855f7] via-[#d946ef] to-[#ec4899] bg-clip-text text-transparent'
            : ''
        }`}
        style={!isMinimalist ? { WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' } : {}}
      >
        {char === ' ' ? '\u00A0' : char}
      </span>
    ));
  };

  return (
    <div
      ref={containerRef}
      className={`min-h-screen transition-all duration-1000 ease-in-out overflow-x-hidden relative ${
        isMinimalist
          ? 'bg-[#fff5f7] text-[#880e4f]'
          : 'bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white'
      }`}
      onClick={handleHeartbeat}
    >
      <Navbar isMinimalist={isMinimalist} setIsMinimalist={setIsMinimalist} />

      {/* Minimalist background overlay */}
      {isMinimalist && (
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute inset-0 bg-[#f6f1f4]" />
          <div className="absolute right-[8%] top-[20%] w-[420px] h-[420px] rounded-full bg-gradient-to-tr from-[#7b61ff] via-[#c850c0] to-[#ffcc70] opacity-80 blur-[2px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(200,150,255,0.25),transparent_60%)] animate-[ambientBreath_14s_ease-in-out_infinite]" />
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-[8px] h-[8px] rounded-full bg-purple-300/60 animate-[minimalFloat_12s_linear_infinite]"
            />
          ))}
        </div>
      )}

      {/* Dynamic particles effect*/}
      {!isMinimalist && (
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-[1]">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-purple-500/60 rounded-full animate-[float-particle_linear_infinite]"
            />
          ))}
        </div>
      )}

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-between pt-[100px] sm:pt-[120px] pb-12 sm:pb-20 px-4 sm:px-[5%] gap-8 lg:gap-16 relative z-[2] flex-col lg:flex-row overflow-hidden">
        <div className="flex-1 max-w-[600px] z-10">
          <h1
            ref={heroTitleRef}
            className={`text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black mb-4 sm:mb-6 leading-tight transition-all duration-700 relative overflow-visible ${
              isMinimalist
                ? 'text-[#ad1457] opacity-100'
                : 'bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent inline-block'
            }`}
          >
            {splitText('VIBESYNC')}
          </h1>

          <p
            ref={heroDescRef}
            className={`text-base sm:text-lg leading-relaxed mb-6 sm:mb-10 max-w-[500px] transition-colors duration-700 ${
              isMinimalist ? 'text-[#880e4f]/70 font-medium' : 'text-gray-300'
            }`}
          >
            Experience music like never before. Your emotions control the vibe.  
            Tilt to balance, feel the beat through your screen.
          </p>

          <div className="flex gap-4 sm:gap-6 flex-wrap">
            <button
              ref={startButtonRef}
              onClick={() => {
                console.log("Button clicked → should go to /experience");
                window.location.href = "/experience";
              }}
              className={`px-6 sm:px-10 py-3 sm:py-4 text-sm sm:text-base font-bold rounded-full transition-all duration-700 hover:-translate-y-1 active:scale-95 shadow-lg hover:shadow-2xl ${
                isMinimalist
                  ? 'bg-gradient-to-r from-[#f06292] via-[#ec4899] to-[#e91e63] text-white shadow-[0_10px_30px_rgba(240,98,146,0.4)] hover:shadow-[0_15px_40px_rgba(240,98,146,0.6)]'
                  : 'bg-gradient-to-r from-[#8b5cf6] via-[#a855f7] to-[#c026d3] text-white shadow-[0_10px_30px_rgba(168,85,247,0.4)] hover:shadow-[0_15px_40px_rgba(168,85,247,0.6)]'
              }`}
            >
              Start Experience
            </button>
          </div>
        </div>

        {/* 3D Character Container */}
        <div className="relative w-full lg:w-1/2 h-[50vh] sm:h-[60vh] lg:h-[90vh] z-0 pointer-events-none lg:pointer-events-auto">
          <Canvas
            camera={{ position: [0, 1.5, 8], fov: 40 }}
            style={{ position: 'absolute', inset: 0 }}
            gl={{ preserveDrawingBuffer: true }}
            dpr={[1, 2]}
          >
            <ambientLight intensity={1.2} />
            <directionalLight position={[5, 5, 5]} intensity={1} />
            <pointLight position={[10, 10, 10]} />

            <Suspense fallback={null}>
              {!isPaused && <Robot isPaused={isPaused} />}
            </Suspense>

            <OrbitControls
              enableZoom={false}
              enablePan={false}
              enableRotate={false}
              minDistance={2}
              maxDistance={12}
            />
          </Canvas>

          {isPaused && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-4 lg:pr-10">
              <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-[5.5rem] font-black leading-tight bg-gradient-to-r from-purple-500 via-pink-500 to-fuchsia-500 bg-clip-text text-transparent text-center whitespace-pre-line">
                Too Much Vibe?<br />We Paused It.
              </h1>
            </div>
          )}

          <button
            onClick={() => setIsPaused(!isPaused)}
            className="absolute bottom-10 sm:bottom-15 right-2 z-50 px-3 sm:px-4 py-2 rounded-xl bg-black/70 text-white text-xs sm:text-sm md:text-base backdrop-blur-sm border border-white/20"
          >
            {isPaused ? "Resume" : "Pause"}
          </button>
        </div>
      </section>

      {/* Emotions Cards */}
      <section className="py-12 sm:py-20 px-4 sm:px-[5%] relative z-[2]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 max-w-[1200px] mx-auto">
          {['Happy', 'Sad', 'Angry', 'Neutral'].map((mood, idx) => (
            <div
              key={mood}
              ref={el => emotionCardsRef.current[idx] = el}
              className={`p-6 sm:p-8 md:p-10 rounded-[2rem] sm:rounded-[2.5rem] text-center transition-all duration-200 ease-out cursor-pointer hover:-translate-y-4 ${
                isMinimalist
                  ? 'bg-white/60 backdrop-blur-md border border-white/80 shadow-[0_20px_40px_rgba(0,0,0,0.03)] hover:bg-white hover:shadow-[0_30px_60px_rgba(240,98,146,0.2)]'
                  : 'bg-white/5 backdrop-blur-lg border-white/10 text-white hover:border-purple-500/30'
              }`}
            >
              <div className={`text-5xl sm:text-6xl mb-4 sm:mb-6 transition-transform duration-200 hover:-translate-y-2 ${
                isMinimalist ? 'drop-shadow-[0_10px_15px_rgba(240,98,146,0.2)]' : 'drop-shadow-[0_0_20px_rgba(139,92,246,0.5)]'
              }`}>
                {['😊', '😢', '😠', '😐'][idx]}
              </div>

              <h4 className={`text-xl sm:text-2xl font-black mb-2 sm:mb-3 transition-colors duration-700 ${
                isMinimalist ? 'text-[#ad1457]' : 'text-white'
              }`}>
                {mood}
              </h4>

              <p className={`text-sm sm:text-base leading-relaxed transition-colors duration-700 ${
                isMinimalist ? 'text-[#880e4f]/50 font-medium' : 'text-gray-300 opacity-80'
              }`}>
                Personalized beats for your mood
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section - CENTERED */}
      <section className="py-12 sm:py-20 px-4 sm:px-[5%] relative z-[2]">
        <div className="flex justify-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-10 max-w-[800px] w-full">
            {[
              { icon: '🎧', title: 'Tilt Balance', desc: 'Lean left or right to adjust audio balance' },
              { icon: '🌌', title: 'Metaverse Mode', desc: 'Switch to an immersive 3D experience' }
            ].map((feature, idx) => (
              <div
                key={idx}
                ref={el => featureCardsRef.current[idx] = el}
                className={`p-6 sm:p-8 md:p-10 rounded-[1.5rem] sm:rounded-[2rem] transition-all duration-1 00 hover:-translate-y-4 ${
                  isMinimalist
                    ? 'bg-white/30 border border-white/50 shadow-sm hover:bg-white/80 hover:shadow-xl'
                    : 'bg-white/[0.03] backdrop-blur-lg border-white/10 hover:bg-white/[0.08] hover:border-purple-500/30'
                }`}
              >
                <div className="text-4xl sm:text-5xl transition-transform duration-400 mb-4 sm:mb-6 hover:-translate-y-2">
                  {feature.icon}
                </div>
                <h4 className={`text-lg sm:text-xl mb-3 sm:mb-4 font-black transition-colors duration-700 ${
                  isMinimalist ? 'text-[#ad1457]' : 'text-white'
                }`}>
                  {feature.title}
                </h4>
                <p className={`text-sm sm:text-base leading-relaxed transition-colors duration-700 ${
                  isMinimalist ? 'text-[#880e4f]/60' : 'text-gray-300'
                }`}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {heartbeatActive && (
        <div className="fixed inset-0 bg-[radial-gradient(circle,rgba(255,100,150,0.15)_0%,transparent_70%)] pointer-events-none z-[9999] animate-[heartbeat-pulse_0.5s_ease-in-out]"></div>
      )}

      <style jsx>{`
        @keyframes float-particle {
          0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
        }
        @keyframes heartbeat-pulse {
          0%, 100% { opacity: 0; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.02); }
        }
        @keyframes ripple {
          0% { width: 0; height: 0; opacity: 1; }
          100% { width: 400px; height: 400px; opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default Home;
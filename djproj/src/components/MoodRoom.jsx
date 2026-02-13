import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, Cloud, Sky } from '@react-three/drei';
import * as THREE from 'three';

//  mood environments for all 8 moods
const moodSettings = {
  happy: {
    theme: "New York City",
    description: "Happy Vibes - NYC ✨🏙️",
    skyColor: "#1a1a2e",
    groundColor: "#2a2a3e",
    fogColor: "#4a4a6e",
    fogNear: 30,
    fogFar: 200,
    lightIntensity: 1.2,
    particleCount: 1000,
    particleColor: "#ffeb3b",
    particleSpeed: 0.4,
    sunPosition: [100, 50, 100],
    buildingCount: 40,
    buildingColors: ["#4a90e2", "#5fa3d0", "#2c5aa0", "#7eb6e8"],
    addStars: true,
    addClouds: false
  },
  sad: {
    theme: "Silent Jungle",
    description: "Melancholic Mood - Silent Jungle 🌧️🌳",
    skyColor: "#1a2a1a",
    groundColor: "#0d1f0d",
    fogColor: "#2a3a2a",
    fogNear: 20,
    fogFar: 100,
    lightIntensity: 0.4,
    particleCount: 600,
    particleColor: "#4a7c59",
    particleSpeed: 0.15,
    sunPosition: [50, 20, 50],
    buildingCount: 50,
    buildingColors: ["#1a4d2e", "#2d5016", "#0f3d1e", "#3a5f2f"],
    addStars: false,
    addClouds: true
  },
  angry: {
    theme: "Volcano",
    description: "Intense Energy - Volcano 🔥🌋",
    skyColor: "#1a0a0a",
    groundColor: "#2d0d0d",
    fogColor: "#ff4422",
    fogNear: 25,
    fogFar: 120,
    lightIntensity: 1.5,
    particleCount: 1500,
    particleColor: "#ff5722",
    particleSpeed: 0.6,
    sunPosition: [100, 60, 100],
    buildingCount: 35,
    buildingColors: ["#8B0000", "#B22222", "#DC143C", "#FF4500"],
    addStars: false,
    addClouds: false
  },
  neutral: {
    theme: "Peaceful Village",
    description: "Calm & Balanced - Village 🌿🏡",
    skyColor: "#87CEEB",
    groundColor: "#5d8a3a",
    fogColor: "#b8d4e8",
    fogNear: 40,
    fogFar: 180,
    lightIntensity: 1.0,
    particleCount: 500,
    particleColor: "#90ee90",
    particleSpeed: 0.2,
    sunPosition: [80, 40, 80],
    buildingCount: 25,
    buildingColors: ["#8B4513", "#A0522D", "#CD853F", "#DEB887"],
    addStars: false,
    addClouds: true
  },
  excited: {
    theme: "New York City Night",
    description: "Excited Energy - NYC Night ⚡🌃",
    skyColor: "#0a0a1a",
    groundColor: "#1a1a2a",
    fogColor: "#2a2a4a",
    fogNear: 30,
    fogFar: 180,
    lightIntensity: 1.3,
    particleCount: 1200,
    particleColor: "#00e676",
    particleSpeed: 0.5,
    sunPosition: [100, 50, 100],
    buildingCount: 40,
    buildingColors: ["#9C27B0", "#E91E63", "#FF1493", "#00BCD4"],
    addStars: true,
    addClouds: false
  }
};

//  Movement Controls
function FPVControls({ isMobile }) {
  const { camera } = useThree();
  const moveSpeed = useRef(0.4);
  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());
  
  const keys = useRef({
    w: false,
    a: false,
    s: false,
    d: false,
    shift: false
  });

  const mouseMovement = useRef({ x: 0, y: 0 });
  const isPointerLocked = useRef(false);
  const touchStart = useRef({ x: 0, y: 0 });
  const touchCurrent = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const euler = new THREE.Euler(0, 0, 0, 'YXZ');
    
    const onKeyDown = (e) => {
      const key = e.key.toLowerCase();
      if (keys.current.hasOwnProperty(key)) {
        keys.current[key] = true;
      }
    };

    const onKeyUp = (e) => {
      const key = e.key.toLowerCase();
      if (keys.current.hasOwnProperty(key)) {
        keys.current[key] = false;
      }
    };

    const onMouseMove = (e) => {
      if (!isPointerLocked.current) return;
      
      const sensitivity = 0.002;
      mouseMovement.current.x = e.movementX * sensitivity;
      mouseMovement.current.y = e.movementY * sensitivity;
      
      euler.setFromQuaternion(camera.quaternion);
      euler.y -= mouseMovement.current.x;
      euler.x -= mouseMovement.current.y;
      euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, euler.x));
      camera.quaternion.setFromEuler(euler);
    };

    //  controls for mobile
    const onTouchStart = (e) => {
      if (e.touches.length === 1) {
        touchStart.current.x = e.touches[0].clientX;
        touchStart.current.y = e.touches[0].clientY;
      }
    };

    const onTouchMove = (e) => {
      if (e.touches.length === 1) {
        touchCurrent.current.x = e.touches[0].clientX;
        touchCurrent.current.y = e.touches[0].clientY;
        
        const deltaX = (touchCurrent.current.x - touchStart.current.x) * 0.003;
        const deltaY = (touchCurrent.current.y - touchStart.current.y) * 0.003;
        
        euler.setFromQuaternion(camera.quaternion);
        euler.y -= deltaX;
        euler.x -= deltaY;
        euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, euler.x));
        camera.quaternion.setFromEuler(euler);
        
        touchStart.current.x = touchCurrent.current.x;
        touchStart.current.y = touchCurrent.current.y;
      }
    };

    const onClick = () => {
      if (!isMobile) {
        document.body.requestPointerLock();
      }
    };

    const onPointerLockChange = () => {
      isPointerLocked.current = document.pointerLockElement === document.body;
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('click', onClick);
    document.addEventListener('pointerlockchange', onPointerLockChange);
    document.addEventListener('touchstart', onTouchStart);
    document.addEventListener('touchmove', onTouchMove);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('click', onClick);
      document.removeEventListener('pointerlockchange', onPointerLockChange);
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchmove', onTouchMove);
    };
  }, [camera, isMobile]);

  useFrame(() => {
    direction.current.set(0, 0, 0);
    
    const speed = keys.current.shift ? moveSpeed.current * 2.5 : moveSpeed.current;
    
    if (keys.current.w) direction.current.z -= 1;
    if (keys.current.s) direction.current.z += 1;
    if (keys.current.a) direction.current.x -= 1;
    if (keys.current.d) direction.current.x += 1;
    
    direction.current.normalize();
    
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();
    
    const right = new THREE.Vector3();
    right.crossVectors(forward, camera.up);
    
    velocity.current.set(0, 0, 0);
    velocity.current.addScaledVector(forward, -direction.current.z * speed);
    velocity.current.addScaledVector(right, direction.current.x * speed);
    
    camera.position.add(velocity.current);
    
    camera.position.y = 2;
    
    // Boundary limits
    camera.position.x = Math.max(-250, Math.min(250, camera.position.x));
    camera.position.z = Math.max(-250, Math.min(250, camera.position.z));
  });

  return null;
}

//  buildings/environment
function Buildings({ mood }) {
  const settings = moodSettings[mood?.toLowerCase()] || moodSettings.neutral;
  
  return (
    <group>
      {[...Array(settings.buildingCount)].map((_, i) => {
        const x = (Math.random() - 0.5) * 400;
        const z = (Math.random() - 0.5) * 400;
        
        // Different building styles per mood
        if (mood?.toLowerCase() === 'happy' || mood?.toLowerCase() === 'excited') {
          // NYC Skyscrapers
          const height = 20 + Math.random() * 60;
          const width = 4 + Math.random() * 6;
          const depth = 4 + Math.random() * 6;
          const color = settings.buildingColors[Math.floor(Math.random() * settings.buildingColors.length)];
          
          return (
            <mesh key={i} position={[x, height / 2, z]} castShadow receiveShadow>
              <boxGeometry args={[width, height, depth]} />
              <meshStandardMaterial 
                color={color}
                emissive={color}
                emissiveIntensity={0.3}
                metalness={0.5}
                roughness={0.3}
              />
            </mesh>
          );
        } else if (mood?.toLowerCase() === 'sad') {
          // Jungle Trees
          const trunkHeight = 10 + Math.random() * 20;
          const foliageSize = 8 + Math.random() * 6;
          const color = settings.buildingColors[Math.floor(Math.random() * settings.buildingColors.length)];
          
          return (
            <group key={i} position={[x, 0, z]}>
              {/* Tree  */}
              <mesh position={[0, trunkHeight / 2, 0]} castShadow>
                <cylinderGeometry args={[1.5, 2, trunkHeight, 8]} />
                <meshStandardMaterial color="#3d2817" roughness={0.9} />
              </mesh>
              {/* Tree foliage */}
              <mesh position={[0, trunkHeight + foliageSize / 2, 0]} castShadow>
                <sphereGeometry args={[foliageSize, 8, 8]} />
                <meshStandardMaterial color={color} roughness={0.8} />
              </mesh>
            </group>
          );
        } else if (mood?.toLowerCase() === 'angry') {
          // Volcanic rocks and lava pools
          const size = 5 + Math.random() * 10;
          const color = settings.buildingColors[Math.floor(Math.random() * settings.buildingColors.length)];
          
          return (
            <mesh key={i} position={[x, size / 3, z]} castShadow>
              <dodecahedronGeometry args={[size, 0]} />
              <meshStandardMaterial 
                color={color}
                emissive={color}
                emissiveIntensity={0.6}
                roughness={0.7}
              />
            </mesh>
          );
        } else {
          // Village houses
          const height = 4 + Math.random() * 4;
          const width = 4 + Math.random() * 3;
          const color = settings.buildingColors[Math.floor(Math.random() * settings.buildingColors.length)];
          
          return (
            <group key={i} position={[x, 0, z]}>
              {/* House body */}
              <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
                <boxGeometry args={[width, height, width]} />
                <meshStandardMaterial color={color} roughness={0.8} />
              </mesh>
              {/* Roof */}
              <mesh position={[0, height + 1.5, 0]} castShadow>
                <coneGeometry args={[width * 0.8, 3, 4]} />
                <meshStandardMaterial color="#8B0000" roughness={0.9} />
              </mesh>
            </group>
          );
        }
      })}
    </group>
  );
}

// Animated particles
function MoodParticles({ mood }) {
  const settings = moodSettings[mood?.toLowerCase()] || moodSettings.neutral;
  const particlesRef = useRef();
  
  const positions = useMemo(() => {
    const pos = new Float32Array(settings.particleCount * 3);
    for (let i = 0; i < settings.particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 300;
      pos[i * 3 + 1] = Math.random() * 80;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 300;
    }
    return pos;
  }, [settings.particleCount]);

  useFrame((state, delta) => {
    if (!particlesRef.current) return;
    const pos = particlesRef.current.geometry.attributes.position.array;
    
    for (let i = 0; i < settings.particleCount; i++) {
      // Different particle behaviors per mood
      if (mood?.toLowerCase() === 'angry') {
        // Upward rising like smoke/embers
        pos[i * 3 + 1] += delta * settings.particleSpeed * 3;
        if (pos[i * 3 + 1] > 80) pos[i * 3 + 1] = 0;
      } else if (mood?.toLowerCase() === 'sad') {
        // Falling like rain
        pos[i * 3 + 1] -= delta * settings.particleSpeed * 2;
        if (pos[i * 3 + 1] < 0) pos[i * 3 + 1] = 80;
      } else {
        // Floating
        pos[i * 3 + 1] += Math.sin(state.clock.elapsedTime * 2 + i) * delta * settings.particleSpeed;
      }
    }
    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={settings.particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={mood?.toLowerCase() === 'angry' ? 2.5 : 1.5}
        color={settings.particleColor}
        transparent
        opacity={mood?.toLowerCase() === 'angry' ? 0.8 : 0.5}
        sizeAttenuation
      />
    </points>
  );
}

// Ground
function Ground({ mood }) {
  const settings = moodSettings[mood?.toLowerCase()] || moodSettings.neutral;
  
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[600, 600, 100, 100]} />
      <meshStandardMaterial 
        color={settings.groundColor} 
        roughness={mood?.toLowerCase() === 'angry' ? 0.9 : 0.8}
        metalness={0.1}
      />
    </mesh>
  );
}

// Special effects per mood
function SpecialEffects({ mood }) {
  
  if (mood?.toLowerCase() === 'angry') {
    // Volcano crater in center
    return (
      <group position={[0, 0, 0]}>
        <mesh position={[0, 15, 0]}>
          <coneGeometry args={[30, 30, 8, 1, true]} />
          <meshStandardMaterial 
            color="#8B0000"
            emissive="#ff4400"
            emissiveIntensity={0.4}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Lava pool */}
        <mesh position={[0, 0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[25, 32]} />
          <meshStandardMaterial 
            color="#ff4400"
            emissive="#ff4400"
            emissiveIntensity={0.8}
          />
        </mesh>
      </group>
    );
  }
  
  return null;
}

function MoodRoom({ mood, isMobile }) {
  const settings = moodSettings[mood?.toLowerCase()] || moodSettings.neutral;

  return (
    <Canvas camera={{ position: [0, 2, 15], fov: 75 }}>
      <color attach="background" args={[settings.skyColor]} />
      <fog attach="fog" args={[settings.fogColor, settings.fogNear, settings.fogFar]} />
      
      <ambientLight intensity={0.3} />
      <directionalLight 
        position={settings.sunPosition} 
        intensity={settings.lightIntensity} 
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <hemisphereLight 
        intensity={0.4} 
        groundColor={settings.groundColor}
        color={settings.skyColor}
      />
      
      {settings.addStars && (
        <Stars radius={200} depth={80} count={6000} factor={4} saturation={0} fade speed={1} />
      )}
      
      {settings.addClouds && (
        <>
          <Cloud position={[-30, 25, -50]} speed={0.2} opacity={0.4} width={60} />
          <Cloud position={[30, 30, -70]} speed={0.15} opacity={0.3} width={50} />
          <Cloud position={[0, 35, -90]} speed={0.25} opacity={0.35} width={70} />
        </>
      )}
      
      <Ground mood={mood} />
      <Buildings mood={mood} />
      <MoodParticles mood={mood} />
      <SpecialEffects mood={mood} />
      <FPVControls isMobile={isMobile} />
    </Canvas>
  );
}

// Mobile control buttons
function MobileControls({ onMove }) {
  return (
    <div className="fixed bottom-4 left-4 right-4 z-[130] flex justify-between items-end lg:hidden pointer-events-none">
      {/* Left side - Movement buttons */}
      <div className="grid grid-cols-3 gap-1 w-36 pointer-events-auto">
        <div></div>
        <button
          onTouchStart={() => onMove('w', true)}
          onTouchEnd={() => onMove('w', false)}
          className="bg-white/20 backdrop-blur-md text-white text-xl font-bold rounded-lg h-14 active:bg-white/30 border border-white/40"
        >
          ↑
        </button>
        <div></div>
        
        <button
          onTouchStart={() => onMove('a', true)}
          onTouchEnd={() => onMove('a', false)}
          className="bg-white/20 backdrop-blur-md text-white text-xl font-bold rounded-lg h-14 active:bg-white/30 border border-white/40"
        >
          ←
        </button>
        <button
          onTouchStart={() => onMove('s', true)}
          onTouchEnd={() => onMove('s', false)}
          className="bg-white/20 backdrop-blur-md text-white text-xl font-bold rounded-lg h-14 active:bg-white/30 border border-white/40"
        >
          ↓
        </button>
        <button
          onTouchStart={() => onMove('d', true)}
          onTouchEnd={() => onMove('d', false)}
          className="bg-white/20 backdrop-blur-md text-white text-xl font-bold rounded-lg h-14 active:bg-white/30 border border-white/40"
        >
          →
        </button>
      </div>

      {/* Right side - Run button */}
      <button
        onTouchStart={() => onMove('shift', true)}
        onTouchEnd={() => onMove('shift', false)}
        className="bg-purple-600/40 backdrop-blur-md text-white text-base font-bold rounded-lg px-6 h-14 active:bg-purple-600/60 border border-white/40 pointer-events-auto"
      >
        🏃 Run
      </button>
    </div>
  );
}

export default function FullMoodRoom({ mood, onClose }) {
  const settings = moodSettings[mood?.toLowerCase()] || moodSettings.neutral;
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleMobileMove = (key, isPressed) => {
    const event = new KeyboardEvent(isPressed ? 'keydown' : 'keyup', { key });
    document.dispatchEvent(event);
  };
  
  return (
    <div className="fixed inset-0 z-[100] bg-black">
      {/* Header - Responsive */}
      <div className="absolute top-20 sm:top-24 md:top-28 left-1/2 -translate-x-1/2 z-[120] bg-black/90 backdrop-blur-md px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 rounded-xl sm:rounded-2xl text-white shadow-2xl border border-white/40 max-w-[95%] sm:max-w-2xl md:max-w-3xl">
        <div className="text-center">
          <h2 className="text-base sm:text-xl md:text-2xl lg:text-3xl font-bold mb-2 sm:mb-3">{settings.description}</h2>
          
          {/* Desktop instructions */}
          <div className="hidden lg:block">
            <p className="text-sm md:text-base opacity-90 mb-1">
              🎮 <strong>Click screen</strong> to start exploring
            </p>
            <p className="text-xs md:text-sm opacity-80">
              <strong>W A S D</strong> to walk • 
              <strong> Shift</strong> to run • 
              <strong> Mouse</strong> to look around • 
              <strong> ESC</strong> to unlock cursor
            </p>
          </div>

          {/* Mobile instructions */}
          <div className="lg:hidden">
            <p className="text-xs sm:text-sm opacity-90 mb-1">
              📱 <strong>Touch & drag</strong> to look around
            </p>
            <p className="text-xs opacity-80">
              Use on-screen buttons to move
            </p>
          </div>
        </div>
      </div>
      
      {/* Exit button - Responsive  */}
      <button
        onClick={onClose}
        className="absolute top-20 sm:top-4 md:top-20 right-2 sm:right-4 md:right-6 z-[120] px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 bg-red-600/80 backdrop-blur-lg text-white text-sm sm:text-base md:text-lg font-bold rounded-full hover:bg-red-500 transition shadow-2xl border border-white/40"
      >
        ✕ <span className="hidden sm:inline">Exit</span>
      </button>
      
      {/* 3D Scene */}
      <MoodRoom mood={mood} isMobile={isMobile} />

      {/* Mobile Controls */}
      {isMobile && <MobileControls onMove={handleMobileMove} />}
    </div>
  );
}
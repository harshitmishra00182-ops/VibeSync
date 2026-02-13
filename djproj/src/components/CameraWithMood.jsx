import React, { useRef, useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';

function estimateYaw(positions) {
  if (!positions || positions.length < 46) return 0;

  const nose = positions[30];
  const leftEyeOuter = positions[36];
  const rightEyeOuter = positions[45];

  const faceCenterX = (leftEyeOuter.x + rightEyeOuter.x) / 2;
  const faceWidth = rightEyeOuter.x - leftEyeOuter.x;
  
  // Calculate offset from center
  const offset = (nose.x - faceCenterX) / (faceWidth + 0.0001);

  // Convert to degrees convenience k liye
  return offset * 100;
}

const moodMapping = {
  happy: 'Happy',
  sad: 'Sad',
  angry: 'Angry',
  neutral: 'Neutral',
  surprised: 'Excited',
  fearful: 'Tensed',
  disgusted: 'Angry',
};

export default function CameraWithMood({
  onMoodChange = () => {},
  onFaceDetected = () => {},
  onCameraReady = () => {},
  onVolumeDown = () => {},
  onVolumeUp = () => {},
}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [currentMood, setCurrentMood] = useState(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [cameraStarted, setCameraStarted] = useState(false);
  const [faceIsVisible, setFaceIsVisible] = useState(false);

  // Lean control
  const lastVolumeChange = useRef(0);
  const lastYawDirection = useRef(0); 
  const yawHistory = useRef([]); 
  const VOLUME_THROTTLE_MS = 1000;
  const YAW_THRESHOLD = 15; 
  const YAW_NEUTRAL_ZONE = 8; 

  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = '/models';
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        ]);
        console.log("✅ Face detection models loaded");
        setIsModelLoaded(true);
        onCameraReady();
      } catch (err) {
        console.error("Model load failed:", err);
        setErrorMsg("Failed to load models – check /public/models");
      }
    };
    loadModels();
  }, [onCameraReady]);

  useEffect(() => {
    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" }
        });
        setCameraStarted(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(e => console.error("Play error:", e));
        }
      } catch (err) {
        setErrorMsg("Camera access denied or failed");
        console.error(err);
      }
    };
    startVideo();

    return () => {
      videoRef.current?.srcObject?.getTracks()?.forEach(t => t.stop());
    };
  }, []);

  useEffect(() => {
    if (!isModelLoaded || !cameraStarted) return;

    const interval = setInterval(async () => {
      if (!videoRef.current || videoRef.current.readyState < 2) return;

      try {
        const detection = await faceapi
          .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceExpressions();

        if (detection) {
          setFaceIsVisible(true);
          onFaceDetected(true);

          // Mood detection
          const expressions = detection.expressions || {};
          const topMood = Object.entries(expressions).reduce((a, b) => a[1] > b[1] ? a : b, ['', 0])[0];
          const mood = moodMapping[topMood] || null;
          if (mood?.toLowerCase() !== currentMood) {
            setCurrentMood(mood?.toLowerCase());
            onMoodChange(mood?.toLowerCase());
            console.log("😊 Mood detected:", mood);
          }

          // Head lean detection 
          if (detection.landmarks && detection.landmarks.positions) {
            const positions = detection.landmarks.positions;
            const yaw = estimateYaw(positions);

            
            yawHistory.current.push(yaw);
            if (yawHistory.current.length > 3) {
              yawHistory.current.shift();
            }

            
            const avgYaw = yawHistory.current.reduce((a, b) => a + b, 0) / yawHistory.current.length;

            const now = Date.now();

            
            if (now - lastVolumeChange.current > VOLUME_THROTTLE_MS) {
              // Left tilt  - Volume DOWN
              if (avgYaw < -YAW_THRESHOLD && lastYawDirection.current !== -1) {
                onVolumeDown();
                lastVolumeChange.current = now;
                lastYawDirection.current = -1;
                console.log(`⬅️ HEAD LEFT → Volume DOWN (${avgYaw.toFixed(1)}°)`);
              } 
              // Right tilt  - Volume UP
              else if (avgYaw > YAW_THRESHOLD && lastYawDirection.current !== 1) {
                onVolumeUp();
                lastVolumeChange.current = now;
                lastYawDirection.current = 1;
                console.log(`➡️ HEAD RIGHT → Volume UP (${avgYaw.toFixed(1)}°)`);
              } 
              // Neutral zone 
              else if (Math.abs(avgYaw) < YAW_NEUTRAL_ZONE) {
                lastYawDirection.current = 0;
              }
            }

           
          }
        } else {
          setFaceIsVisible(false);
          onFaceDetected(false);
          lastYawDirection.current = 0;
          yawHistory.current = [];
        }
      } catch (err) {
        console.error("Detection error:", err);
      }
    }, 500); //
    return () => clearInterval(interval);
  }, [isModelLoaded, cameraStarted, currentMood, onMoodChange, onFaceDetected, onVolumeDown, onVolumeUp]);

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      />
      <canvas ref={canvasRef} className="absolute inset-0" />

      <div className="absolute bottom-6 left-6 right-6 bg-black/70 backdrop-blur-md p-4 rounded-xl text-white text-center text-sm">
        {errorMsg && <p className="text-red-400 mb-2">{errorMsg}</p>}

        {!cameraStarted && !errorMsg && <p>Waiting for camera permission...</p>}

        {cameraStarted && !isModelLoaded && <p>Loading AI models...</p>}

        {cameraStarted && isModelLoaded && !faceIsVisible && (
          <p>No face detected – adjust lighting / position</p>
        )}

        {faceIsVisible && currentMood && (
          <div>
            <p className="mb-1">Mood: <strong className="text-purple-300 capitalize">{currentMood}</strong></p>
            <p className="text-xs opacity-70">💡 Tilt head left/right to adjust volume</p>
          </div>
        )}
      </div>
    </div>
  );
}
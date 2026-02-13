import { useGLTF, Center, useAnimations } from "@react-three/drei";
import { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import model from "../assets/robot.glb";

export default function Robot({ isPaused, ...props }) {
  const group = useRef();
  const { invalidate } = useThree();

  const { scene, animations } = useGLTF(model);
  const { actions } = useAnimations(animations, group);

  useEffect(() => {
    if (group.current) {
      group.current.scale.set(2.4, 2.4, 2.4); //sirf yhi se scale hoga
      
      invalidate();
      
    }
  }, [invalidate]);

  //safety scale ke liye
  useEffect(() => {
    const checkScale = () => {
      if (group.current) {
        const currentScale = group.current.scale;
        if (currentScale.x !== 2.2 || currentScale.y !== 2.2 || currentScale.z !== 2.2) {
          group.current.scale.set(2.2, 2.2, 2.2);
          invalidate();
        }
      }
    };

    const interval = setInterval(checkScale, 100);
    setTimeout(() => clearInterval(interval), 2000);

    return () => clearInterval(interval);
  }, [invalidate]);

  // Animation yha se control hogi
  useEffect(() => {
    if (!actions) return;

    const action = Object.values(actions)[0];

    if (action) {
      if (isPaused) {
        action.stop();
        action.setEffectiveTimeScale(0);
      } else {
        action.setEffectiveTimeScale(1);
        action.play();
      }
    }
  }, [isPaused, actions]);

  return (
    <group
      ref={group}
      rotation={[0, -Math.PI / 4, 0]} 
      scale={[2.2, 2.2, 2.2]} //again safety scaleee
      {...props}
    >
      <Center>
        <primitive object={scene} />
      </Center>
    </group>
  );
}

//  to prevent loading delays
useGLTF.preload(model);
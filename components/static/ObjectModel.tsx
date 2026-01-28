// @ts-nocheck
import React, { Suspense, useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";

function Model({ path }) {
  const { scene, animations } = useGLTF(path);
  const { actions, names } = useAnimations(animations, scene);
  const mixer = useRef(new THREE.AnimationMixer(scene));

  useEffect(() => {
    if (animations.length > 0) {
      actions[names[0]].play(); // Play the first animation
    }
    return () => {
      // Cleanup when component unmounts
      mixer.current.stopAllAction();
    };
  }, [actions, names, animations]);

  useFrame((state, delta) => {
    mixer.current.update(delta); // Update the mixer in the render loop
  });

  return <primitive object={scene} scale={1} />;
}

export default function GlbModel() {
  return (
    <Canvas>
      <Suspense fallback={null}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[2, 5, 2]} />
        <Model path="/3d/robot_playground.glb" />
        <OrbitControls
          enableZoom={true}
          minDistance={1} // Very close zoom distance
          maxDistance={100} // Adjust as needed
        />
      </Suspense>
    </Canvas>
  );
}

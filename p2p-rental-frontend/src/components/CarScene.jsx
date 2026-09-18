import { useRef, useLayoutEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, ContactShadows, Float, MeshDistortMaterial, Center, Environment } from '@react-three/drei'
import * as THREE from 'three'

function BMWModel() {
  const { scene } = useGLTF('/bmw.glb')
  const modelRef = useRef()

  useLayoutEffect(() => {
    // 1. Traverse and clean the model
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true

        // Fix pitch-black materials by enforcing a minimum roughness
        if (child.material) {
          child.material.side = THREE.DoubleSide
          child.material.roughness = Math.max(child.material.roughness || 0, 0.2)
          child.material.needsUpdate = true
        }
      }

      // 2. Remove phantom cameras/lights from the Blender export
      if (child.isCamera || child.isLight) {
        if (child.parent) child.parent.remove(child)
      }
    })
  }, [scene])

  useFrame((state) => {
    if (modelRef.current) {
      // Gentle idle floating and rotation
      modelRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.15) * 0.25 + Math.PI * 0.1
      modelRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.02 - 0.8
    }
  })

  return (
    <Center top>
      <primitive
        ref={modelRef}
        object={scene}
        scale={1}
        position={[0, -0.8, 0]}
        rotation={[0, Math.PI * 0.1, 0]}
      />
    </Center>
  )
}

function FloatingSphere({ position, scale, color, speed, distort, opacity }) {
  const meshRef = useRef()

  useFrame((state) => {
    meshRef.current.rotation.x = state.clock.elapsedTime * speed * 0.2
    meshRef.current.rotation.z = state.clock.elapsedTime * speed * 0.3
  })

  return (
    <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.6}>
      <mesh ref={meshRef} position={position} scale={scale}>
        <sphereGeometry args={[1, 32, 32]} />
        <MeshDistortMaterial
          color={color}
          roughness={0.15}
          metalness={0.95}
          distort={distort}
          speed={1.5}
          transparent
          opacity={opacity || 0.6}
        />
      </mesh>
    </Float>
  )
}



export default function CarScene() {
  return (
    <>
      {/* 
        CRITICAL: The Environment preset gives the car's metallic paint 
        something to reflect. Without this, the car will look black.
      */}
      <Environment preset="city" />

      {/* Lighting Setup */}
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 8, 5]} intensity={2.5} color="#ffffff" castShadow />
      <directionalLight position={[-5, 3, -5]} intensity={1.2} color="#ffffff" />
      <spotLight position={[-8, 6, 3]} angle={0.25} penumbra={1} intensity={0.5} color="#00f0ff" />
      <pointLight position={[0, -0.5, 3]} intensity={0.2} color="#00f0ff" distance={8} />
      <hemisphereLight color="#b1e1ff" groundColor="#000000" intensity={1.0} />
      <directionalLight position={[-3, 5, -3]} intensity={0.8} color="#ffeedd" />

      {/* Main Vehicle */}
      <BMWModel />

      {/* Fake shadow underneath the car to ground it */}
      <ContactShadows
        position={[0, -1, 0]}
        opacity={0.6}
        scale={12}
        blur={2.5}
        far={4}
        color="#00f0ff"
      />

      {/* Environment Elements */}
      <FloatingSphere position={[5, 2, -5]} scale={0.6} color="#00f0ff" speed={0.2} distort={0.4} opacity={0.25} />
      <FloatingSphere position={[-5.5, -0.5, -4]} scale={0.35} color="#ffffff" speed={0.4} distort={0.5} opacity={0.15} />
      <FloatingSphere position={[4, -1.5, -6]} scale={0.25} color="#00f0ff" speed={0.6} distort={0.3} opacity={0.2} />
    </>
  )
}

// Preload the GLB model to prevent layout shift
useGLTF.preload('/bmw.glb')
import { Environment, SoftShadows } from '@react-three/drei';

export function StudioEnvironment() {
  return (
    <>
      <ambientLight intensity={0.4} />
      
      {/* Key Light */}
      <directionalLight 
        position={[5, 10, 5]} 
        intensity={2.5} 
        castShadow 
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.001}
      >
        <orthographicCamera attach="shadow-camera" args={[-20, 20, 20, -20]} />
      </directionalLight>
      
      {/* Fill Light */}
      <directionalLight 
        position={[-5, 0, 5]} 
        intensity={0.8} 
        color="#b0c4de" 
      />
      
      {/* Rim Light */}
      <spotLight 
        position={[0, 10, -10]} 
        intensity={2} 
        color="#ffd700" 
        angle={0.5} 
        penumbra={1} 
      />

      <SoftShadows size={15} samples={16} />
      
      <Environment preset="city" blur={0.8} />
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -4, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <shadowMaterial transparent opacity={0.2} />
      </mesh>
      
       <gridHelper args={[100, 100, 0x444444, 0x222222]} position={[0, -4.01, 0]} />
    </>
  );
}

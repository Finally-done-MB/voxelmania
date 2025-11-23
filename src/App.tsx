import { Canvas } from '@react-three/fiber';
import { OrbitControls, Center, Bounds, useBounds } from '@react-three/drei';
import { Physics, CuboidCollider } from '@react-three/rapier';
import { StudioEnvironment } from './components/StudioEnvironment';
import { VoxelRenderer } from './components/VoxelRenderer';
import { ControlPanel } from './components/ControlPanel';
import { useAppStore } from './store/useAppStore';
import { useRef, useEffect } from 'react';
import { Group } from 'three';
import { useFrame } from '@react-three/fiber';
import { DebrisField } from './components/DebrisField';

function AutoRotator() {
  const groupRef = useRef<Group>(null);
  const { isAutoRotating, currentObject, isScrapped, scrapMode } = useAppStore();

  // Reset rotation when new object is generated
  useEffect(() => {
    if (groupRef.current && currentObject && !isScrapped) {
      groupRef.current.rotation.y = 0;
    }
  }, [currentObject?.id, isScrapped]);

  useFrame((_, delta) => {
    if (isAutoRotating && groupRef.current && !isScrapped) {
      groupRef.current.rotation.y += delta * 0.2;
    }
  });

  if (!currentObject) return null;

  return (
    <group ref={groupRef}>
       {!isScrapped ? (
         <Center top>
            <VoxelRenderer voxels={currentObject.voxels} />
         </Center>
       ) : (
         <DebrisField key={`debris-${scrapMode}-${currentObject.id}`} voxels={currentObject.voxels} mode={scrapMode || 'crumble'} />
       )}
    </group>
  );
}

function BoundsFitter() {
  const { currentObject, isScrapped } = useAppStore();
  const bounds = useBounds();

  useEffect(() => {
    // Only refit when a new object is generated (not when scrapped)
    if (currentObject && !isScrapped && bounds) {
      // Small delay to ensure geometry is rendered
      const timeoutId = setTimeout(() => {
        bounds.refresh().fit();
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [currentObject?.id, isScrapped, bounds]);

  return null;
}

function App() {
  const { currentObject, isScrapped } = useAppStore();
  
  return (
    <div className="w-full h-full relative">
      <ControlPanel />
      
      <div className="absolute inset-0 z-0 bg-[#202025]">
        <Canvas shadows camera={{ position: [20, 20, 20], fov: 40 }} dpr={[1, 2]}>
          <color attach="background" args={['#202025']} />
          
          <StudioEnvironment />

          <Physics gravity={[0, -40, 0]}>
             <Bounds key={isScrapped ? `scrapped-${currentObject?.id}` : `object-${currentObject?.id}`} fit clip observe margin={1.6}>
                <BoundsFitter />
                <AutoRotator />
             </Bounds>
             
             {/* Invisible Physics Floor */}
             <CuboidCollider position={[0, -5, 0]} args={[100, 0.5, 100]} />
          </Physics>

          <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2} />
        </Canvas>
      </div>
    </div>
  );
}

export default App;

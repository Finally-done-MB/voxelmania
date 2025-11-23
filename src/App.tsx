import { useRef, useEffect, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Center } from '@react-three/drei';
import { Physics, CuboidCollider } from '@react-three/rapier';
import { StudioEnvironment } from './components/StudioEnvironment';
import { VoxelRenderer } from './components/VoxelRenderer';
import { ControlPanel } from './components/ControlPanel';
import { ObjectNameOverlay } from './components/ObjectNameOverlay';
import { useAppStore } from './store/useAppStore';
import { Group, Box3, Vector3, PerspectiveCamera } from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { DebrisField } from './components/DebrisField';
import type { Voxel } from './types';

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

function calculateBoundingBox(voxels: Voxel[]): Box3 {
  const box = new Box3();
  voxels.forEach(voxel => {
    box.expandByPoint(new Vector3(voxel.x, voxel.y, voxel.z));
    // Account for voxel size (1 unit cube)
    box.expandByPoint(new Vector3(voxel.x + 1, voxel.y + 1, voxel.z + 1));
  });
  return box;
}

function CameraFitter() {
  const { currentObject, isScrapped } = useAppStore();
  const { camera, size, controls } = useThree();
  const gl = useThree((state) => state.gl);

  // Shared fitCamera function that uses size from useThree()
  const fitCamera = useCallback(() => {
    if (!currentObject || isScrapped || !controls) return;

    const box = calculateBoundingBox(currentObject.voxels);
    if (box.isEmpty()) return;

    const center = box.getCenter(new Vector3());
    const boxSize = box.getSize(new Vector3());
    
    // Use size from useThree() - this is the actual canvas render dimensions
    // Canvas container already accounts for sidebar (md:left-80), so size is correct
    const canvasWidth = size.width;
    const canvasHeight = size.height;
    const aspect = canvasWidth / canvasHeight;
    
    // More aggressive margin scaling for smaller canvases
    // Smaller canvas = reduce margin significantly to bring object closer and make it appear larger
    // This compensates for the fact that narrower canvases naturally push camera further away
    let margin = 1.4;
    if (canvasWidth < 300) {
      margin = 1.0; // Very small canvas - minimal margin
    } else if (canvasWidth < 500) {
      margin = 1.1;
    } else if (canvasWidth < 640) {
      margin = 1.2;
    } else if (canvasWidth < 1024) {
      margin = 1.3;
    }

    const fov = (camera as PerspectiveCamera).fov || 40;
    const fovRad = (fov * Math.PI) / 180;
    
    // Calculate distance needed for each dimension
    // For width: account for aspect ratio (narrower canvas needs closer camera for same width)
    const distanceForWidth = (boxSize.x * margin) / (2 * Math.tan(fovRad / 2) * aspect);
    const distanceForHeight = (boxSize.y * margin) / (2 * Math.tan(fovRad / 2));
    const distanceForDepth = (boxSize.z * margin) / (2 * Math.tan(fovRad / 2));
    
    // Use the maximum distance needed, but reduce padding for smaller canvases
    const padding = canvasWidth < 640 ? 1.05 : 1.1;
    const distance = Math.max(distanceForWidth, distanceForHeight, distanceForDepth) * padding;
    
    // Position camera at angle
    const cameraPos = new Vector3(
      center.x + distance * 0.7,
      center.y + distance * 0.7,
      center.z + distance * 0.7
    );

    camera.position.copy(cameraPos);
    // @ts-ignore
    if (controls && 'target' in controls) {
      // @ts-ignore
      controls.target.copy(center);
      // @ts-ignore
      if (controls.update) controls.update();
    }
  }, [currentObject, isScrapped, camera, controls, size]);

  useEffect(() => {
    const timeoutId = setTimeout(fitCamera, 100);
    return () => clearTimeout(timeoutId);
  }, [currentObject?.id, isScrapped, fitCamera]);

  // Refit on canvas size change
  useEffect(() => {
    const timeoutId = setTimeout(fitCamera, 100);
    return () => clearTimeout(timeoutId);
  }, [size.width, size.height, fitCamera]);

  // ResizeObserver for more reliable detection
  useEffect(() => {
    if (!currentObject || isScrapped || !controls) return;

    const canvas = gl.domElement;
    const container = canvas.parentElement;
    if (!container) return;

    let resizeTimeout: ReturnType<typeof setTimeout>;
    const resizeObserver = new ResizeObserver(() => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(fitCamera, 100);
    });

    resizeObserver.observe(container);
    
    return () => {
      resizeObserver.disconnect();
      clearTimeout(resizeTimeout);
    };
  }, [currentObject?.id, isScrapped, fitCamera, gl]);

  return null;
}

function App() {
  return (
    <div className="w-full h-full relative">
      <ControlPanel />
      
      <div className="absolute inset-0 md:left-80 z-0 bg-[#202025]">
        <ObjectNameOverlay />
        <Canvas 
          shadows 
          camera={{ position: [20, 20, 20], fov: 40 }} 
          dpr={[1, 2]}
          gl={{ antialias: true, preserveDrawingBuffer: true }}
          resize={{ scroll: false }}
        >
          <color attach="background" args={['#202025']} />
          
          <StudioEnvironment />

          <CameraFitter />

          <Physics gravity={[0, -40, 0]}>
             <AutoRotator />
             
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

import React, { useRef, useMemo, Component } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, OrbitControls, useGLTF, useTexture, Html, useProgress } from '@react-three/drei';
import * as THREE from 'three';
import { SPINE_COLORS, CHARM_TYPES } from '../../config/constants';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <mesh>
          <boxGeometry args={[2, 3, 0.5]} />
          <meshStandardMaterial color="#F2A900" />
        </mesh>
      );
    }
    return this.props.children;
  }
}

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center pointer-events-none mt-10">
        <div className="w-12 h-12 border-4 border-brand-amber border-t-transparent rounded-full animate-spin mb-2" />
        <p className="font-san text-sm text-brand-muted shrink-0 w-32 text-center">
          {progress ? progress.toFixed(0) : 0}% tải 3D...
        </p>
      </div>
    </Html>
  );
}

function BookcharmModel({ charmTypeColor, spineColorHex, engravedText, coverImageUrl, fallbackCoverUrl, onCenterComputed }) {
  const group = useRef();
  const { nodes } = useGLTF('/model/charm2.glb');
  const coverTexture = useTexture(coverImageUrl || fallbackCoverUrl || '/images/BookCover/01.png');

  useMemo(() => {
    coverTexture.colorSpace = THREE.SRGBColorSpace;
    coverTexture.flipY = false;
    coverTexture.wrapS = THREE.ClampToEdgeWrapping;
    coverTexture.wrapT = THREE.ClampToEdgeWrapping;
    coverTexture.magFilter = THREE.LinearFilter;
    coverTexture.minFilter = THREE.LinearMipmapLinearFilter;
    coverTexture.generateMipmaps = true;

    coverTexture.center.set(0.5, 0.5);
    coverTexture.repeat.set(-1, 1);

    coverTexture.rotation = Math.PI;
    coverTexture.anisotropy = 16;
    coverTexture.needsUpdate = true;
  }, [coverTexture]);

  const [modelCenter, coverOverlay, spineTextOverlay] = useMemo(() => {
    if (!nodes || !nodes.CoverMesh) {
      return [[0, 0, 0], null, null];
    }

    nodes.CoverMesh.geometry.computeBoundingBox();
    const coverBox = nodes.CoverMesh.geometry.boundingBox;

    const center = new THREE.Vector3();
    coverBox.getCenter(center);

    const coverSize = new THREE.Vector3();
    coverBox.getSize(coverSize);

    // Render cover image on the opposite cover face (-X side).
    const frontCover = {
      position: [coverBox.min.x - 0.0012, center.y, center.z],
      rotation: [0, -Math.PI / 2, 0],
      size: [Math.max(coverSize.z * 0.992, 0.001), Math.max(coverSize.y * 0.992, 0.001)],
    };

    if (!nodes.SpineMesh?.geometry) {
      return [[center.x, center.y, center.z], frontCover, null];
    }

    nodes.SpineMesh.geometry.computeBoundingBox();
    const spineBox = nodes.SpineMesh.geometry.boundingBox;
    const spineCenter = new THREE.Vector3();
    spineBox.getCenter(spineCenter);
    const spineSize = new THREE.Vector3();
    spineBox.getSize(spineSize);

    const textWidth = Math.max(spineSize.z * 0.92, 0.06);
    const textHeight = Math.max(spineSize.y * 0.84, 0.12);

    const overlay = {
      // Outward spine face only, so text stays on the blue spine surface.
      position: [spineBox.max.x + 0.0015, spineCenter.y, spineCenter.z],
      rotation: [0, Math.PI / 2, 0],
      size: [textWidth, textHeight],
    };

    return [[center.x, center.y, center.z], frontCover, overlay];
  }, [nodes]);

  // Notify parent of the book's center so camera can target it
  React.useEffect(() => {
    if (onCenterComputed) onCenterComputed(modelCenter);
  }, [modelCenter, onCenterComputed]);
  useFrame((state) => {
    if (group.current) {
      group.current.rotation.z = Math.sin(state.clock.elapsedTime) * 0.05;
    }
  });

  const spineTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 2048;
    const context = canvas.getContext('2d');

    context.fillStyle = spineColorHex || '#1A1A1A';
    context.fillRect(0, 0, canvas.width, canvas.height);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.flipY = false;
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.magFilter = THREE.LinearFilter;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.generateMipmaps = true;
    tex.anisotropy = 16;
    tex.needsUpdate = true;
    return tex;
  }, [spineColorHex, engravedText]);

  const engravingOverlayTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 2048;
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);

    if (engravedText && engravedText.trim() !== '') {
      const text = engravedText.trim().replace(/\s+/g, ' ').toUpperCase();
      const maxTextWidth = canvas.height * 0.84;

      let fontSize = 190;
      while (fontSize > 44) {
        context.font = `bold ${fontSize}px "Playfair Display", serif`;
        if (context.measureText(text).width <= maxTextWidth) break;
        fontSize -= 4;
      }

      context.save();
      context.translate(canvas.width / 2, canvas.height / 2);
      context.rotate(-Math.PI / 2);
      context.fillStyle = '#FFF5C5';
      context.strokeStyle = 'rgba(22, 22, 22, 0.72)';
      context.lineWidth = 12;
      context.shadowColor = 'rgba(0, 0, 0, 0.32)';
      context.shadowBlur = 10;
      context.font = `bold ${fontSize}px "Playfair Display", serif`;
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.strokeText(text, 0, 0, maxTextWidth);
      context.fillText(text, 0, 0, maxTextWidth);
      context.restore();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.flipY = false;
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.magFilter = THREE.LinearFilter;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.repeat.set(-1, 1);
    tex.offset.set(1, 0);
    tex.generateMipmaps = true;
    tex.anisotropy = 16;
    tex.needsUpdate = true;
    return tex;
  }, [engravedText]);

  if (!nodes || Object.keys(nodes).length === 0) {
    return (
      <mesh>
        <boxGeometry args={[2, 3, 0.5]} />
        <meshStandardMaterial map={coverTexture} />
      </mesh>
    );
  }

  // Restore position to [0,0,0], we will center camera using OrbitControls instead
  return (
    <group ref={group} dispose={null} position={[0, 0, 0]} scale={[1.29, 1.29, 1.29]}>
      {nodes.CoverMesh && (
        <mesh geometry={nodes.CoverMesh.geometry}>
          <meshStandardMaterial color="#1a1a1a" roughness={0.45} metalness={0.08} />
        </mesh>
      )}

      {coverOverlay && (
        <mesh position={coverOverlay.position} rotation={coverOverlay.rotation}>
          <planeGeometry args={coverOverlay.size} />
          <meshStandardMaterial
            map={coverTexture}
            transparent
            side={THREE.FrontSide}
            polygonOffset
            polygonOffsetFactor={-3}
            roughness={0.45}
            metalness={0.08}
          />
        </mesh>
      )}

      {nodes.SpineMesh && (
        <mesh geometry={nodes.SpineMesh.geometry}>
          <meshStandardMaterial
            map={spineTexture}
            roughness={0.45}
            metalness={0.08}
          />
        </mesh>
      )}

      {spineTextOverlay && (
        <mesh position={spineTextOverlay.position} rotation={spineTextOverlay.rotation}>
          <planeGeometry args={spineTextOverlay.size} />
          <meshStandardMaterial
            map={engravingOverlayTexture}
            transparent
            alphaTest={0.02}
            side={THREE.FrontSide}
            polygonOffset
            polygonOffsetFactor={-3}
            roughness={0.45}
            metalness={0.05}
          />
        </mesh>
      )}

      {nodes.PageMesh && (
        <mesh geometry={nodes.PageMesh.geometry}>
          <meshStandardMaterial color="#FFF9E6" roughness={0.9} />
        </mesh>
      )}

      {nodes.HardwareMesh && (
        <mesh geometry={nodes.HardwareMesh.geometry}>
          <meshStandardMaterial
            color={charmTypeColor}
            metalness={1}
            roughness={0.2}
          />
        </mesh>
      )}

      {nodes.Object && (
        <mesh geometry={nodes.Object.geometry}>
          <meshStandardMaterial
            color={charmTypeColor}
            metalness={0.95}
            roughness={0.22}
          />
        </mesh>
      )}
    </group>
  );
}

try {
  useGLTF.preload('/model/charm2.glb');
} catch (e) { }

export default function Product3DPreview({ charmTypeId, spineColorId, engravedText, coverPreviewUrl, fallbackCoverUrl }) {

  const charmConfig = CHARM_TYPES.find(c => c.id === charmTypeId);
  const charmTypeColor = charmConfig?.id === 'gold' ? '#FFD700' : '#C0C0C0';

  const spineConfig = SPINE_COLORS.find(s => s.id === spineColorId);
  const spineColorHex = spineConfig?.hex || '#1A1A1A';

  // Track book center for camera
  const [target, setTarget] = React.useState([0, 0, 0]);

  return (
    <div className="w-full h-full min-h-[400px] lg:min-h-screen relative flex items-center justify-center bg-[radial-gradient(circle_at_center,_rgba(242,169,0,0.28)_0%,_rgba(242,169,0,0.16)_26%,_#ffffff_62%)]">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] lg:w-[560px] lg:h-[560px] bg-brand-amber/35 rounded-full blur-2xl" />

      <Canvas shadows camera={{ position: [0, 0, 3.5], fov: 35 }} className="w-full h-full absolute inset-0 z-10 transition-opacity duration-1000">
        <ambientLight intensity={0.5} />
        <Environment preset="studio" />

        <ErrorBoundary>
          <React.Suspense fallback={<Loader />}>
            <BookcharmModel
              charmTypeColor={charmTypeColor}
              spineColorHex={spineColorHex}
              engravedText={engravedText}
              coverImageUrl={coverPreviewUrl}
              fallbackCoverUrl={fallbackCoverUrl}
              onCenterComputed={setTarget}
            />
          </React.Suspense>
        </ErrorBoundary>

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={true}
          autoRotateSpeed={1.5}
          target={target}
        />
      </Canvas>

      <div className="absolute bottom-6 md:top-6 md:bottom-auto left-1/2 -translate-x-1/2 md:left-6 md:translate-x-0 z-20">
        <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-full shadow-sm border border-white flex items-center gap-2">
          <span className="text-[16px]">💡</span>
          <span className="font-san text-xs font-medium text-brand-charcoal">
            Có thể dùng chuột/cảm ứng để xoay 360°
          </span>
        </div>
      </div>
    </div>
  )
}

import React, { useRef, useMemo, Component } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, OrbitControls, useGLTF, useTexture, Html, useProgress } from '@react-three/drei';
import * as THREE from 'three';
import { SPINE_COLORS, CHARM_TYPES } from '../../config/constants';

// Manual tuning knobs for engraving-focus camera POV.
const SPINE_FOCUS_CAMERA = {
  distance: 1.3,
  lateralOffset: -0.04,
  verticalOffset: 0.001,
  positionLerp: 0.05,
  targetLerp: 0.08,
};

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
          <meshBasicMaterial color="#F2A900" />
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

function BookcharmModel({
  charmTypeColor,
  spineColorHex,
  engravedText,
  coverImageUrl,
  fallbackCoverUrl,
  onCenterComputed,
  onSpineFocusComputed,
}) {
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

  const [modelCenter, coverOverlay, spineTextOverlay, spineFocusPoint] = useMemo(() => {
    if (!nodes || !nodes.CoverMesh) {
      return [[0, 0, 0], null, null, [0, 0, 0]];
    }

    nodes.CoverMesh.geometry.computeBoundingBox();
    const coverBox = nodes.CoverMesh.geometry.boundingBox;

    const center = new THREE.Vector3();
    coverBox.getCenter(center);

    const coverSize = new THREE.Vector3();
    coverBox.getSize(coverSize);

    // New 4-mesh model: paint only one cover face (+Z) and keep the back cover plain.
    const frontCover = {
      position: [center.x, center.y, coverBox.max.z + 0.0012],
      rotation: [0, 0, 0],
      size: [Math.max(coverSize.x * 0.992, 0.001), Math.max(coverSize.y * 0.992, 0.001)],
    };

    if (!nodes.SpineMesh?.geometry) {
      return [[center.x, center.y, center.z], frontCover, null, [center.x, center.y, center.z]];
    }

    nodes.SpineMesh.geometry.computeBoundingBox();
    const spineBox = nodes.SpineMesh.geometry.boundingBox;
    const spineCenter = new THREE.Vector3();
    spineBox.getCenter(spineCenter);
    const spineSize = new THREE.Vector3();
    spineBox.getSize(spineSize);

    const textOverlay = {
      // position: [spineBox.min.x - 0.001, spineCenter.y, spineCenter.z],
      // rotation: [0, -Math.PI / 2, 0],
      // size: [spineSize.z * 0.9, spineSize.y * 0.8],

      position: [spineBox.min.x + (spineSize.x / 6.3), spineCenter.y, spineBox.max.z + 0.002],
      rotation: [0, 0, 0],
      size: [Math.max(spineSize.x * 0.8, 0.015), Math.max(spineSize.y * 0.85, 0.1)],
    };

    // Focus around the left edge of the front face (near spine on main cover side).
    const focusPoint = [
      coverBox.min.x + coverSize.x * 0.08,
      center.y,
      coverBox.max.z + 0.001,
    ];

    return [[center.x, center.y, center.z], frontCover, textOverlay, focusPoint];
  }, [nodes]);

  // Notify parent of the book's center so camera can target it
  React.useEffect(() => {
    if (onCenterComputed) onCenterComputed(modelCenter);
  }, [modelCenter, onCenterComputed]);

  React.useEffect(() => {
    if (onSpineFocusComputed) onSpineFocusComputed(spineFocusPoint);
  }, [spineFocusPoint, onSpineFocusComputed]);
  useFrame((state) => {
    if (group.current) {
      group.current.rotation.z = Math.sin(state.clock.elapsedTime) * 0.05;
    }
  });

  const spineTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
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
  }, [engravedText, spineColorHex]);

  const engravingOverlayTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 2048;
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);

    if (engravedText && engravedText.trim() !== '') {
      const text = engravedText.trim().replace(/\s+/g, ' ').toUpperCase();
      const maxTextWidth = canvas.height * 0.74;

      let fontSize = 170;

      while (fontSize > 42) {
        context.font = `bold ${fontSize}px "Playfair Display", serif`;
        if (context.measureText(text).width <= maxTextWidth) break;
        fontSize -= 4;
      }

      const hex = (spineColorHex || '#1A1A1A').replace('#', '');
      const normalized = hex.length === 3
        ? `${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`
        : hex;
      const r = parseInt(normalized.slice(0, 2), 16) / 255;
      const g = parseInt(normalized.slice(2, 4), 16) / 255;
      const b = parseInt(normalized.slice(4, 6), 16) / 255;
      const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      const fillColor = luminance > 0.55 ? '#1A2A45' : '#FFF2B8';
      const strokeColor = luminance > 0.55 ? 'rgba(255,255,255,0.62)' : 'rgba(16,16,16,0.72)';

      context.save();
      context.translate(canvas.width / 2, canvas.height / 2);
      context.scale(1, -1); // Flip vertically to match texture orientation
      context.rotate(-Math.PI / 2);
      context.fillStyle = fillColor;
      context.strokeStyle = strokeColor;
      context.lineWidth = 11;
      context.shadowColor = 'rgba(0, 0, 0, 0.28)';
      context.shadowBlur = 8;
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
    tex.generateMipmaps = true;
    tex.anisotropy = 16;
    tex.needsUpdate = true;
    return tex;
  }, [engravedText, spineColorHex]);

  if (!nodes || Object.keys(nodes).length === 0) {
    return (
      <mesh>
        <boxGeometry args={[2, 3, 0.5]} />
        <meshBasicMaterial map={coverTexture} />
      </mesh>
    );
  }

  // Restore position to [0,0,0], we will center camera using OrbitControls instead
  return (
    <group ref={group} dispose={null} position={[0, 0, 0]} scale={[1.419, 1.419, 1.419]}>
      {nodes.CoverMesh && (
        <mesh geometry={nodes.CoverMesh.geometry}>
          <meshBasicMaterial color="#1a1a1a" />
        </mesh>
      )}

      {coverOverlay && (
        <mesh position={coverOverlay.position} rotation={coverOverlay.rotation}>
          <planeGeometry args={coverOverlay.size} />
          <meshBasicMaterial
            map={coverTexture}
            transparent
            side={THREE.FrontSide}
            polygonOffset
            polygonOffsetFactor={-3}
          />
        </mesh>
      )}

      {nodes.SpineMesh && (
        <mesh geometry={nodes.SpineMesh.geometry}>
          <meshStandardMaterial
            map={spineTexture}
            roughness={0.55}
            metalness={0.04}
          />
        </mesh>
      )}

      {spineTextOverlay && engravedText?.trim() && (
  <mesh position={spineTextOverlay.position} rotation={spineTextOverlay.rotation}>
    <planeGeometry args={spineTextOverlay.size} />
    <meshBasicMaterial
      map={engravingOverlayTexture}
      transparent={true}
      alphaTest={0.1} // Tăng lên một chút để lọc bỏ vùng thừa tốt hơn
      side={THREE.FrontSide}
      // Quan trọng: polygonOffset giúp mesh overlay nằm đè lên mesh chính mà không bị mất nét
      polygonOffset={true}
      //polygon càng lớn thì mesh càng được đẩy về phía camera, nhưng nếu quá lớn có thể gây ra hiện tượng z-fighting với các chi tiết khác. 
      polygonOffsetFactor={-1} 
      polygonOffsetUnits={-1}
      depthWrite={false} // Không ghi vào các mesh khác.
    />
  </mesh>
)}

      {nodes.PaperMesh && (
        <mesh geometry={nodes.PaperMesh.geometry}>
          <meshBasicMaterial color="#FFF9E6" />
        </mesh>
      )}

      {nodes.HardwareMesh && (
        <mesh geometry={nodes.HardwareMesh.geometry}>
          <meshStandardMaterial
            color={charmTypeColor}
            metalness={0.65}
            roughness={0.38}
          />
        </mesh>
      )}

    </group>
  );
}

function CameraFocusController({ controlsRef, target, spineFocusPoint, focusSpine }) {
  const { camera } = useThree();

  React.useEffect(() => {
    if (focusSpine) return;

    // Restore default framing once when leaving spine-focus mode,
    // then let OrbitControls fully own interaction again.
    camera.position.set(0, 0, 3.5);
    if (controlsRef.current) {
      controlsRef.current.target.set(target[0], target[1], target[2]);
      controlsRef.current.update();
    }
  }, [focusSpine, camera, controlsRef, target]);

  useFrame(() => {
    if (!focusSpine) return;

    const desiredTarget = spineFocusPoint;
    // Wider shot around front-cover left edge so users can inspect engraved result.
    const desiredPosition = new THREE.Vector3(
      desiredTarget[0] + SPINE_FOCUS_CAMERA.lateralOffset,
      desiredTarget[1] + SPINE_FOCUS_CAMERA.verticalOffset,
      desiredTarget[2] + SPINE_FOCUS_CAMERA.distance
    );

    camera.position.lerp(desiredPosition, SPINE_FOCUS_CAMERA.positionLerp);

    if (controlsRef.current) {
      const t = controlsRef.current.target;
      t.lerp(
        new THREE.Vector3(desiredTarget[0], desiredTarget[1], desiredTarget[2]),
        SPINE_FOCUS_CAMERA.targetLerp
      );
      controlsRef.current.update();
    }
  });

  return null;
}

try {
  useGLTF.preload('/model/charm2.glb');
} catch (e) { }

export default function Product3DPreview({
  charmTypeId,
  spineColorId,
  engravedText,
  coverPreviewUrl,
  fallbackCoverUrl,
  focusSpine = false,
}) {

  const charmConfig = CHARM_TYPES.find(c => c.id === charmTypeId);
  const charmTypeColor = charmConfig?.id === 'gold' ? '#FFD700' : '#C0C0C0';

  const spineConfig = SPINE_COLORS.find(s => s.id === spineColorId);
  const spineColorHex = spineConfig?.hex || '#1A1A1A';

  // Track book center for camera
  const [target, setTarget] = React.useState([0, 0, 0]);
  const [spineFocusPoint, setSpineFocusPoint] = React.useState([0, 0, 0]);
  const controlsRef = useRef(null);

  return (
    <div className="w-full h-full min-h-[400px] lg:min-h-screen bg-brand-cream-dark/20 relative flex items-center justify-center">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] lg:w-[500px] lg:h-[500px] bg-white/50 rounded-full blur-3xl" />

      <Canvas camera={{ position: [0, 0, 3.5], fov: 35 }} className="w-full h-full absolute inset-0 z-10 transition-opacity duration-1000">
        <ambientLight intensity={0.5} />
        <hemisphereLight args={['#fff6de', '#efe3c3', 0.25]} />
        <directionalLight position={[2.8, 2.4, 2.6]} intensity={0.3} />
        <directionalLight position={[-2.8, 2.0, -2.6]} intensity={0.26} />
        <Environment preset="studio" intensity={0.12} />

        <ErrorBoundary>
          <React.Suspense fallback={<Loader />}>
            <BookcharmModel
              charmTypeColor={charmTypeColor}
              spineColorHex={spineColorHex}
              engravedText={engravedText}
              coverImageUrl={coverPreviewUrl}
              fallbackCoverUrl={fallbackCoverUrl}
              onCenterComputed={setTarget}
              onSpineFocusComputed={setSpineFocusPoint}
            />
          </React.Suspense>
        </ErrorBoundary>

        <CameraFocusController
          controlsRef={controlsRef}
          target={target}
          spineFocusPoint={spineFocusPoint}
          focusSpine={focusSpine}
        />

        <OrbitControls
          ref={controlsRef}
          enableZoom={false}
          enablePan={false}
          autoRotate={!focusSpine}
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

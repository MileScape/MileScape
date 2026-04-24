import { OrbitControls, Text, useGLTF } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useMemo } from "react";
import type { Group } from "three";
import { landmarkModelMap, landmarkModelPaths, type LandmarkModelConfig } from "../../data/landmarkModels";
import type { MyScapePlacedLandmark } from "../../types";
import type { UnlockedLandmarkAsset } from "../../utils/myScape";

interface MyScapeSceneProps {
  assets: UnlockedLandmarkAsset[];
  placedLandmarks: MyScapePlacedLandmark[];
  selectedId: string | null;
  boardWidth: number;
  boardHeight: number;
  onSelectItem: (itemId: string) => void;
}

const toScenePosition = (
  item: MyScapePlacedLandmark,
  boardWidth: number,
  boardHeight: number,
) => {
  const safeWidth = Math.max(boardWidth, 1);
  const safeHeight = Math.max(boardHeight, 1);
  const x = ((item.x / safeWidth) - 0.5) * 8.6;
  const z = ((item.y / safeHeight) - 0.5) * 6.2;

  return [x, 0.5, z] as const;
};

const LandmarkModel = ({
  path,
  scale,
  rotationY = 0,
  heightOffset = 0,
}: {
  path: string;
  scale: number;
  rotationY?: number;
  heightOffset?: number;
}) => {
  const { scene } = useGLTF(path);
  const clonedScene = useMemo(() => scene.clone(), [scene]);

  useEffect(() => {
    clonedScene.traverse((child) => {
      const meshLike = child as Group & {
        isMesh?: boolean;
        castShadow?: boolean;
        receiveShadow?: boolean;
      };

      if (meshLike.isMesh) {
        meshLike.castShadow = true;
        meshLike.receiveShadow = true;
      }
    });
  }, [clonedScene]);

  return (
    <primitive
      object={clonedScene}
      position={[0, heightOffset, 0]}
      rotation={[0, rotationY, 0]}
      scale={scale}
    />
  );
};

const LandmarkMesh = ({
  asset,
  item,
  boardWidth,
  boardHeight,
  selected,
  onSelect,
  modelConfig,
}: {
  asset: UnlockedLandmarkAsset;
  item: MyScapePlacedLandmark;
  boardWidth: number;
  boardHeight: number;
  selected: boolean;
  onSelect: () => void;
  modelConfig: LandmarkModelConfig;
}) => {
  const [x, y, z] = toScenePosition(item, boardWidth, boardHeight);
  const scale = item.scale;
  const labelHeight = 2.15 * scale;

  return (
    <group
      position={[x, y, z]}
      onClick={(event) => {
        event.stopPropagation();
        onSelect();
      }}
    >
      <Suspense fallback={null}>
        <LandmarkModel
          path={modelConfig.path}
          scale={modelConfig.scale * scale}
          rotationY={modelConfig.rotationY}
          heightOffset={modelConfig.heightOffset ?? 0}
        />
      </Suspense>

      {selected ? (
        <Text
          position={[0, labelHeight, 0]}
          fontSize={0.24}
          color="#44574a"
          anchorX="center"
          anchorY="middle"
          maxWidth={2.8}
        >
          {asset.name}
        </Text>
      ) : null}
    </group>
  );
};

export const MyScapeScene = ({
  assets,
  placedLandmarks,
  selectedId,
  boardWidth,
  boardHeight,
  onSelectItem,
}: MyScapeSceneProps) => {
  const assetMap = useMemo(() => new Map(assets.map((asset) => [asset.id, asset])), [assets]);

  return (
    <Canvas
      shadows
      camera={{ position: [0, 6.8, 7.4], fov: 38 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true }}
      className="absolute inset-0"
    >
      <color attach="background" args={["#f3f4ee"]} />
      <fog attach="fog" args={["#eef3eb", 9, 18]} />

      <ambientLight intensity={1.15} />
      <directionalLight
        castShadow
        intensity={1.35}
        position={[6, 9, 5]}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <pointLight intensity={0.5} position={[-4, 4, -3]} color="#f6f1e7" />

      <group rotation={[-0.54, 0.62, 0]}>
        <mesh receiveShadow position={[0, -0.7, 0]}>
          <cylinderGeometry args={[4.3, 4.9, 1.2, 6]} />
          <meshStandardMaterial color="#6f8374" roughness={0.92} metalness={0.02} />
        </mesh>
        <mesh receiveShadow position={[0, -0.12, 0]}>
          <cylinderGeometry args={[4.6, 4.2, 0.38, 6]} />
          <meshStandardMaterial color="#dce7db" roughness={0.88} metalness={0.02} />
        </mesh>
        <mesh receiveShadow position={[-0.6, 0.02, -0.5]} rotation={[0, 0.3, 0]}>
          <boxGeometry args={[2.4, 0.08, 1.5]} />
          <meshStandardMaterial color="#c8d8c8" roughness={0.88} metalness={0.02} />
        </mesh>
        <mesh receiveShadow position={[1.3, 0.04, 1.1]} rotation={[0, -0.2, 0]}>
          <cylinderGeometry args={[0.85, 1.1, 0.1, 18]} />
          <meshStandardMaterial color="#dbe7d9" roughness={0.88} metalness={0.02} />
        </mesh>

        {placedLandmarks.map((item) => {
          const asset = assetMap.get(item.landmarkId);
          if (!asset) {
            return null;
          }

          const modelConfig = landmarkModelMap[asset.id];
          if (!modelConfig) {
            return null;
          }

          return (
            <LandmarkMesh
              key={item.id}
              asset={asset}
              item={item}
              boardWidth={boardWidth}
              boardHeight={boardHeight}
              selected={selectedId === item.id}
              onSelect={() => onSelectItem(item.id)}
              modelConfig={modelConfig}
            />
          );
        })}
      </group>

      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.86, 0]}>
        <circleGeometry args={[7.8, 48]} />
        <shadowMaterial transparent opacity={0.22} />
      </mesh>

      <OrbitControls
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        minDistance={7}
        maxDistance={10}
        minPolarAngle={0.78}
        maxPolarAngle={1.2}
      />
    </Canvas>
  );
};

landmarkModelPaths.forEach((path) => {
  useGLTF.preload(path);
});

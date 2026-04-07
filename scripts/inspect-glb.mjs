import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { Box3, Vector3 } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

globalThis.self = globalThis;

const modelPath = path.resolve('public/model/charm2.glb');
const basePath = `file://${path.dirname(modelPath)}/`;

const loader = new GLTFLoader();
const data = await readFile(modelPath);

const gltf = await new Promise((resolve, reject) => {
  loader.parse(
    data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength),
    basePath,
    resolve,
    reject
  );
});

const box = new Box3();
const size = new Vector3();
const meshes = [];

gltf.scene.traverse((node) => {
  if (!node.isMesh) return;
  box.setFromObject(node);
  box.getSize(size);

  const materialName = Array.isArray(node.material)
    ? node.material.map((m) => m?.name || '(unnamed)').join(', ')
    : node.material?.name || '(unnamed)';

  meshes.push({
    mesh: node.name || '(unnamed mesh)',
    material: materialName,
    size: [
      Number(size.x.toFixed(4)),
      Number(size.y.toFixed(4)),
      Number(size.z.toFixed(4)),
    ],
  });
});

console.log(`Model: ${modelPath}`);
console.log(`Mesh count: ${meshes.length}`);
for (const [i, m] of meshes.entries()) {
  console.log(`${i + 1}. mesh=\"${m.mesh}\" | material=\"${m.material}\" | bboxSize=[${m.size.join(', ')}]`);
}

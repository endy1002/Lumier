import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { Box3 } from 'three';
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
const fmt = (v) => `[${v.x.toFixed(4)}, ${v.y.toFixed(4)}, ${v.z.toFixed(4)}]`;
const rows = [];

gltf.scene.traverse((node) => {
  if (!node.isMesh) return;
  box.setFromObject(node);
  rows.push({
    mesh: node.name || '(unnamed mesh)',
    min: fmt(box.min),
    max: fmt(box.max),
    center: fmt(box.getCenter(node.position.clone())),
    size: fmt(box.getSize(node.position.clone())),
  });
});

console.table(rows);

// @ts-check

import * as THREE from "three";
import { ImprovedNoise } from "three/examples/jsm/math/ImprovedNoise.js";
import { introStartPosition, SCENE_COLORS } from "./config.js";
import { usesReducedSceneQuality } from "./device-profile.js";

/**
 * @param {THREE.Object3D} object
 * @param {[number, number, number]} position
 * @param {THREE.Object3D[]} introObjects
 */
function placeForIntro(object, position, introObjects) {
  const start = introStartPosition(position);
  object.position.fromArray(start);
  object.userData.introPosition = new THREE.Vector3(...start);
  object.userData.targetPosition = new THREE.Vector3(...position);
  introObjects.push(object);
}

function createColorCube() {
  const material = new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    uniforms: { time: { value: 0 } },
    vertexShader: `
      varying vec2 textureCoordinates;
      void main() {
        textureCoordinates = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 textureCoordinates;
      uniform float time;
      void main() {
        vec2 point = textureCoordinates * 1.5;
        vec2 originalPoint = point;
        float octave = 1.0;
        float speed = 1.0;
        float strength = 1.0;
        float phase = 0.0;
        for (int index = 0; index < 7; index++) {
          vec2 ripple = vec2(
            cos(point.y * octave - phase + time / speed),
            sin(point.x * octave - phase + time / speed)
          ) / strength;
          ripple += vec2(-ripple.y, ripple.x) * 0.3;
          point += ripple;
          octave *= 1.93;
          speed *= 1.15;
          strength *= 1.7;
          phase += 0.05 + 0.1 * time * speed;
        }
        float red = sin(point.x - time) * 0.5 + 0.3;
        float blue = sin(point.y + time) * 0.5 + 0.3;
        float green = sin((point.x + point.y + sin(time * 0.5)) * 0.5) * 0.5 + 0.3;
        gl_FragColor = vec4(red, green, blue, 1.0 + originalPoint.x * 0.0);
      }
    `,
  });
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(16, 19, 16), material);
  mesh.userData.update = (/** @type {number} */ frame) => {
    material.uniforms.time.value = frame * 0.003;
  };
  return mesh;
}

function createMagnetsCube() {
  const group = new THREE.Group();
  const width = 18;
  const count = 4;
  const radius = width / (count * 2);
  const offset = width / 2 - radius;
  const geometry = new THREE.IcosahedronGeometry(radius, 2);
  const material = new THREE.MeshPhysicalMaterial({
    color: 0x4f4d4a,
    emissive: 0x07010e,
    roughness: 0.1,
    metalness: 0.8,
    clearcoat: 0.7,
    reflectivity: 1,
  });
  for (let layer = 0; layer < count; layer += 1) {
    const row = new THREE.Group();
    row.position.y = (layer * width) / count - offset;
    for (let index = 0; index < count * count; index += 1) {
      const sphere = new THREE.Mesh(geometry, material);
      sphere.position.set(
        ((index % count) * width) / count - offset,
        0,
        (Math.floor(index / count) * width) / count - offset,
      );
      row.add(sphere);
    }
    group.add(row);
  }
  group.userData.update = (/** @type {number} */ frame) => {
    const phase = (frame % 240) / 240;
    group.children.forEach((row, index) => {
      row.rotation.y = Math.sin(Math.PI * phase) * Math.PI * 0.5 * (index / 4);
    });
  };
  return group;
}

function createOrangeCube() {
  const texture = new THREE.TextureLoader().load("/assets/models/map.jpg");
  const sides = new THREE.MeshStandardMaterial({
    color: SCENE_COLORS.orange,
    roughness: 0.9,
    metalness: 0.5,
    map: texture,
  });
  const materials = Array(6).fill(sides);
  materials[2] = new THREE.MeshStandardMaterial({
    color: SCENE_COLORS.orange,
    metalness: 1,
  });
  return new THREE.Mesh(new THREE.BoxGeometry(16, 19, 16), materials);
}

function createBlob() {
  const radius = 5;
  const geometry = new THREE.IcosahedronGeometry(radius, 3);
  const blob = new THREE.Mesh(
    geometry,
    new THREE.MeshPhysicalMaterial({
      color: SCENE_COLORS.dark,
      emissive: SCENE_COLORS.dark,
      roughness: 0.1,
      metalness: 0.6,
      clearcoat: 0.7,
      reflectivity: 1,
    }),
  );
  const noise = new ImprovedNoise();
  const vertex = new THREE.Vector3();
  let offset = 0;
  blob.userData.update = () => {
    offset += 0.006;
    const positions = geometry.attributes.position;
    for (let index = 0; index < positions.count; index += 1) {
      vertex.fromBufferAttribute(positions, index).normalize();
      const displacement =
        1 +
        0.5 *
          noise.noise(vertex.x + offset, vertex.y + offset, vertex.z + offset);
      vertex.multiplyScalar(radius * displacement);
      positions.setXYZ(index, vertex.x, vertex.y, vertex.z);
    }
    positions.needsUpdate = true;
    geometry.computeVertexNormals();
    blob.rotation.x += 0.004;
    blob.rotation.y += 0.004;
  };
  return blob;
}

function createParticles() {
  const count = usesReducedSceneQuality() ? 100 : 150;
  const positions = new Float32Array(count * 3);
  const speeds = new Float32Array(count);
  const directions = new Float32Array(count);
  for (let index = 0; index < count; index += 1) {
    const radius = 100 + Math.random() * 50;
    const phi = Math.random() * Math.PI;
    const theta = Math.random() * Math.PI * 2;
    positions[index * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[index * 3 + 1] = radius * Math.cos(phi);
    positions[index * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
    speeds[index] = 0.2 + Math.random() * 1.8;
    directions[index] = Math.random() < 0.5 ? -1 : 1;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("speed", new THREE.BufferAttribute(speeds, 1));
  geometry.setAttribute("direction", new THREE.BufferAttribute(directions, 1));
  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: { time: { value: 0 } },
    vertexShader: `
      attribute float speed;
      attribute float direction;
      varying float particleDirection;
      uniform float time;
      void main() {
        float angle = radians(-time * speed * 0.03);
        mat2 rotation = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
        vec2 rotated = rotation * position.xz;
        float height = position.y + (direction < 0.0 ? sin(time * speed * 0.002) : cos(time * speed * 0.002)) * 50.0;
        vec4 viewPosition = modelViewMatrix * vec4(rotated.x, height, rotated.y, 1.0);
        gl_PointSize = 2500.0 / -viewPosition.z;
        gl_Position = projectionMatrix * viewPosition;
        particleDirection = direction;
      }
    `,
    fragmentShader: `
      varying float particleDirection;
      void main() {
        float radius = distance(gl_PointCoord, vec2(0.5));
        float alpha = 1.0 - smoothstep(0.0, 0.5, radius);
        vec3 color = particleDirection > 0.0 ? vec3(1.0, 1.0, 0.0) : vec3(1.0);
        gl_FragColor = vec4(color, alpha);
      }
    `,
  });
  const particles = new THREE.Points(geometry, material);
  particles.userData.update = (/** @type {number} */ frame) => {
    material.uniforms.time.value = frame;
  };
  return particles;
}

/** @param {THREE.Group} root @param {THREE.Object3D} teamBlock */
export function addAuthoredObjects(root, teamBlock) {
  /** @type {THREE.Object3D[]} */
  const introObjects = [];
  const animatedObjects = [];
  /** @type {[THREE.Object3D, [number, number, number]][]} */
  const definitions = [
    [createColorCube(), [7, 51, -48]],
    [createMagnetsCube(), [14, -2, 60]],
    [teamBlock, [-25.8, -19.5, -49]],
    [createOrangeCube(), [21, 6.6, 34.4]],
    [createBlob(), [-7, 19, -36]],
  ];
  for (const [object, position] of definitions) {
    root.add(object);
    placeForIntro(object, position, introObjects);
    if (object.userData.update) animatedObjects.push(object);
  }
  const particles = createParticles();
  root.add(particles);
  animatedObjects.push(particles);
  return { introObjects, animatedObjects };
}

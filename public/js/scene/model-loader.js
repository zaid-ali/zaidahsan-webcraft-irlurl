// @ts-check

import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { introStartPosition } from "./config.js";

const MODEL_ROOT = "/assets/models/cubes/";

/** @param {THREE.Material | THREE.Material[]} material @param {number} metalness */
function tuneMaterial(material, metalness) {
  const materials = Array.isArray(material) ? material : [material];
  for (const candidate of materials) {
    if (candidate instanceof THREE.MeshStandardMaterial) {
      candidate.metalness = metalness;
      candidate.needsUpdate = true;
    }
  }
}

export class ModelLoader {
  constructor() {
    this.loader = new GLTFLoader();
  }

  /**
   * @param {[string, number[], number, string]} definition
   * @param {number} order
   * @returns {Promise<THREE.Group>}
   */
  async load(definition, order) {
    const [filename, position, metalness, animation] = definition;
    const model = await this.loader.loadAsync(`${MODEL_ROOT}${filename}`);
    const group = model.scene;
    group.scale.setScalar(5);
    const introPosition = introStartPosition(position);
    group.position.fromArray(introPosition);
    group.userData.targetPosition = new THREE.Vector3(...position);
    group.userData.introPosition = new THREE.Vector3(...introPosition);
    group.userData.baseY = position[1];
    group.userData.animation = animation;
    group.userData.floatDirection = order % 2 === 1 ? -1 : 1;
    group.userData.animationTarget =
      animation === "rotate"
        ? group.getObjectByName("Suzanne") || group
        : group;
    group.traverse((/** @type {THREE.Object3D} */ child) => {
      if (child instanceof THREE.Mesh) tuneMaterial(child.material, metalness);
    });
    return group;
  }
}

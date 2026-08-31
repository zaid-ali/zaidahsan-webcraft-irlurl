// @ts-check

import * as THREE from "three";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";

/** @param {THREE.Scene} scene */
export async function loadSceneEnvironment(scene) {
  const texture = await new RGBELoader().loadAsync(
    "/assets/models/hdr/empty_warehouse_01_1k.hdr",
  );
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = texture;
}

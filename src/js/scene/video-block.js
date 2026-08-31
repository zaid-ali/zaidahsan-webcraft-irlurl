// @ts-check

import * as THREE from "three";

export class VideoBlock {
  /**
   * @param {{ width: number, height: number, depth: number, material: THREE.Material, sheared?: boolean }} options
   */
  constructor(options) {
    this.baseMaterial = options.material;
    this.sheared = Boolean(options.sheared);
    /** @type {THREE.Material[]} */
    this.materials = Array(6).fill(this.baseMaterial);
    const geometry = new THREE.BoxGeometry(
      options.width,
      options.height,
      options.depth,
      1,
      options.sheared ? 5 : 1,
      1,
    );
    if (options.sheared) {
      const shear = new THREE.Matrix4().makeShear(0, 0, -0.39, 0, 0, 0);
      geometry.applyMatrix4(shear);
    }
    this.mesh = new THREE.Mesh(geometry, this.materials);
    this.video = document.createElement("video");
    this.video.muted = true;
    this.video.loop = true;
    this.video.playsInline = true;
    this.video.preload = "metadata";
    this.currentSource = "";
  }

  createVideoTexture() {
    const texture = new THREE.VideoTexture(this.video);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.format = THREE.RGBAFormat;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }

  /** @param {string} source */
  async play(source) {
    const normalized = source.trim().replace(/^\/?/, "/");
    if (this.currentSource !== normalized) {
      this.currentSource = normalized;
      this.video.src = normalized;
      this.video.load();
    }

    try {
      await this.video.play();
    } catch {
      return;
    }

    const firstTexture = this.createVideoTexture();
    const secondTexture = this.createVideoTexture();
    if (this.sheared) {
      firstTexture.repeat.set(0.25, 1.5);
      firstTexture.offset.set(1.25, -0.5);
      secondTexture.repeat.set(0.25, 1.5);
      secondTexture.offset.set(0.5, -0.5);
      this.materials[1] = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        map: firstTexture,
      });
      this.materials[4] = new THREE.MeshBasicMaterial({
        color: 0xbbbbbb,
        map: secondTexture,
      });
    } else {
      firstTexture.repeat.set(0.5, 0.5);
      firstTexture.offset.set(0.1, 0.45);
      secondTexture.repeat.set(0.5, 0.5);
      secondTexture.offset.set(0.6, 0.45);
      this.materials[0] = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        map: firstTexture,
      });
      this.materials[5] = new THREE.MeshBasicMaterial({
        color: 0xbbbbbb,
        map: secondTexture,
      });
    }
    this.mesh.material = this.materials;
  }

  stop() {
    this.video.pause();
    this.materials = Array(6).fill(this.baseMaterial);
    this.mesh.material = this.materials;
  }
}

export function createWorkBlock() {
  return new VideoBlock({
    width: 18,
    height: 110,
    depth: 15,
    material: new THREE.MeshPhysicalMaterial({
      color: 0xf37330,
      roughness: 0.3,
      metalness: 0.9,
    }),
    sheared: true,
  });
}

export function createTeamBlock() {
  return new VideoBlock({
    width: 16,
    height: 19,
    depth: 16,
    material: new THREE.MeshStandardMaterial({
      color: 0xe54e01,
      emissive: 0xe54e01,
      roughness: 0.9,
      metalness: 0.7,
    }),
  });
}

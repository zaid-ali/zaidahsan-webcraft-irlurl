// @ts-check

import * as THREE from "three";
import { clamp, easeInOutCubic, easeOutExpo, lerp } from "../core/math.js";
import { CAMERA_STOPS, MODEL_DEFINITIONS } from "./config.js";
import {
  preferredCameraFov,
  usesReducedSceneQuality,
} from "./device-profile.js";
import { loadSceneEnvironment } from "./environment.js";
import { ModelLoader } from "./model-loader.js";
import { PostProcessor } from "./post-processor.js";
import { addAuthoredObjects } from "./scene-objects.js";
import { createTeamBlock, createWorkBlock } from "./video-block.js";

const INTRO_CAMERA_MS = 3_500;
const INTRO_OBJECT_MS = 2_666;
const INTRO_OBJECT_STAGGER_MS = 122;
const SECTION_COLOR_MS = 3_000;
const SECTION_POSITION_DELAY_MS = 1_000;
const SECTION_ROTATION_DELAY_MS = 1_200;
const SECTION_MOTION_MS = 3_000;

export class VisualScene {
  /** @param {HTMLElement} container */
  constructor(container) {
    this.container = container;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(CAMERA_STOPS[1].color);
    this.scene.fog = new THREE.Fog(CAMERA_STOPS[1].color, 0, 1_000);
    this.root = new THREE.Group();
    this.scene.add(this.root);

    this.baseFov = preferredCameraFov();
    this.targetFov = this.baseFov;
    this.camera = new THREE.PerspectiveCamera(this.baseFov, 1, 1, 3_000);
    this.camera.position.set(0, 0, 10);
    this.camera.lookAt(0, 0, 0);
    this.scene.add(this.camera);

    this.renderer = new THREE.WebGLRenderer({
      powerPreference: "high-performance",
      antialias: false,
    });
    const maximumPixelRatio = usesReducedSceneQuality() ? 1.25 : 1.5;
    this.renderer.setPixelRatio(
      Math.min(window.devicePixelRatio || 1, maximumPixelRatio),
    );
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.domElement.setAttribute("aria-hidden", "true");
    container.appendChild(this.renderer.domElement);
    this.postProcessor = new PostProcessor(
      this.renderer,
      this.scene,
      this.camera,
    );

    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 0.85));

    this.pointer = new THREE.Vector2();
    /** @type {THREE.Object3D[]} */
    this.introObjects = [];
    /** @type {THREE.Object3D[]} */
    this.animatedObjects = [];
    /** @type {THREE.Group[]} */
    this.animatedModels = [];
    this.introObjectsStartedAt = null;
    this.ambientAnimationStartedAt = Number.POSITIVE_INFINITY;
    /** @type {null | { startedAt: number, resolve: () => void }} */
    this.introCamera = null;
    /** @type {null | { startedAt: number, fromPosition: THREE.Vector3, toPosition: THREE.Vector3, fromRotation: THREE.Vector3, toRotation: THREE.Vector3, fromColor: THREE.Color, toColor: THREE.Color, fromFov: number }} */
    this.transition = null;
    this.currentSection = -1;
    this.frame = 0;

    this.workBlock = createWorkBlock();
    this.root.add(this.workBlock.mesh);
    this.teamBlock = createTeamBlock();

    this.resize = this.resize.bind(this);
    this.render = this.render.bind(this);
    window.addEventListener("resize", this.resize);
    window.addEventListener("pointermove", (event) => {
      this.pointer.set(
        event.clientX / Math.max(window.innerWidth, 1) - 0.5,
        event.clientY / Math.max(window.innerHeight, 1) - 0.5,
      );
    });
    this.resize();
    this.render(performance.now());
  }

  async initialize() {
    const authored = addAuthoredObjects(this.root, this.teamBlock.mesh);
    this.introObjects.push(...authored.introObjects);
    this.animatedObjects.push(...authored.animatedObjects);
    const origin = new THREE.Vector3();
    this.workBlock.mesh.userData.introPosition = origin.clone();
    this.workBlock.mesh.userData.targetPosition = origin.clone();
    this.introObjects.push(this.workBlock.mesh);

    const loader = new ModelLoader();
    for (const [order, definition] of MODEL_DEFINITIONS.entries()) {
      try {
        const model = await loader.load(definition, order);
        this.root.add(model);
        this.introObjects.push(model);
        if (model.userData.animation) this.animatedModels.push(model);
      } catch {
        // Keep loading the remaining authored models if one asset is unavailable.
      }
    }
    void loadSceneEnvironment(this.scene).catch(() => undefined);
  }

  /** @returns {Promise<void>} */
  playIntro() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      for (const object of this.introObjects)
        object.position.copy(object.userData.targetPosition);
      this.applyCameraStop(0);
      return Promise.resolve();
    }

    const startedAt = performance.now();
    this.camera.position.set(0, 0, 10);
    this.camera.lookAt(0, 0, 0);
    this.introObjectsStartedAt = startedAt;
    this.ambientAnimationStartedAt = startedAt + 4_600;

    return new Promise((resolve) => {
      this.introCamera = { startedAt, resolve: () => resolve() };
    });
  }

  /** @param {number} index */
  applyCameraStop(index) {
    const stop = CAMERA_STOPS[index];
    this.camera.position.fromArray(stop.position);
    this.camera.rotation.fromArray(stop.rotation);
    this.camera.fov = this.baseFov;
    this.camera.updateProjectionMatrix();
    this.scene.background = new THREE.Color(stop.color);
    this.scene.fog?.color.set(stop.color);
  }

  /** @param {number} index */
  setSection(index) {
    const nextIndex = clamp(index, 0, CAMERA_STOPS.length - 1);
    if (nextIndex === this.currentSection) return;
    const stop = CAMERA_STOPS[nextIndex];
    this.transition = {
      startedAt: performance.now(),
      fromPosition: this.camera.position.clone(),
      toPosition: new THREE.Vector3(...stop.position),
      fromRotation: new THREE.Vector3(
        this.camera.rotation.x,
        this.camera.rotation.y,
        this.camera.rotation.z,
      ),
      toRotation: new THREE.Vector3(...stop.rotation),
      fromColor:
        this.scene.background instanceof THREE.Color
          ? this.scene.background.clone()
          : new THREE.Color(stop.color),
      toColor: new THREE.Color(stop.color),
      fromFov: this.camera.fov,
    };
    this.targetFov = this.baseFov;
    this.currentSection = nextIndex;
  }

  /** @param {number} direction */
  nudgeFov(direction) {
    if (this.transition || this.introCamera || !direction) return;
    this.targetFov -= 0.1 * Math.sign(direction);
    this.camera.fov = lerp(this.camera.fov, this.targetFov, 0.07);
    this.camera.updateProjectionMatrix();
  }

  /** @param {boolean} open */
  setMenuOpen(open) {
    this.root.visible = !open;
  }

  /** @param {string} source */
  playWorkVideo(source) {
    return this.workBlock.play(source);
  }

  stopWorkVideo() {
    this.workBlock.stop();
  }

  /** @param {string} source */
  playTeamVideo(source) {
    return this.teamBlock.play(source);
  }

  stopTeamVideo() {
    this.teamBlock.stop();
  }

  resize() {
    const width = Math.max(this.container.clientWidth, 1);
    const height = Math.max(this.container.clientHeight, 1);
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.postProcessor.resize(width, height, this.renderer.getPixelRatio());
  }

  /** @param {number} timestamp */
  updateIntro(timestamp) {
    const objectsStartedAt = this.introObjectsStartedAt;
    if (objectsStartedAt !== null) {
      let finished = true;
      this.introObjects.forEach((object, index) => {
        const progress = clamp(
          (timestamp - objectsStartedAt - index * INTRO_OBJECT_STAGGER_MS) /
            INTRO_OBJECT_MS,
          0,
          1,
        );
        object.position.lerpVectors(
          object.userData.introPosition,
          object.userData.targetPosition,
          easeOutExpo(progress),
        );
        if (progress < 1) finished = false;
      });
      if (finished) this.introObjectsStartedAt = null;
    }

    const introCamera = this.introCamera;
    if (!introCamera) return;
    const progress = clamp(
      (timestamp - introCamera.startedAt) / INTRO_CAMERA_MS,
      0,
      1,
    );
    const eased = easeInOutCubic(progress);
    this.camera.position.set(lerp(0, 80, eased), 0, lerp(10, 100, eased));
    this.camera.lookAt(0, 0, 0);
    if (progress === 1) {
      this.introCamera = null;
      introCamera.resolve();
    }
  }

  /** @param {number} timestamp */
  updateTransition(timestamp) {
    if (!this.transition) return;
    const colorProgress = clamp(
      (timestamp - this.transition.startedAt) / SECTION_COLOR_MS,
      0,
      1,
    );
    const positionProgress = clamp(
      (timestamp - this.transition.startedAt - SECTION_POSITION_DELAY_MS) /
        SECTION_MOTION_MS,
      0,
      1,
    );
    const rotationProgress = clamp(
      (timestamp - this.transition.startedAt - SECTION_ROTATION_DELAY_MS) /
        SECTION_MOTION_MS,
      0,
      1,
    );
    const color = this.transition.fromColor
      .clone()
      .lerp(this.transition.toColor, easeInOutCubic(colorProgress));
    this.scene.background = color;
    this.scene.fog?.color.copy(color);
    this.camera.position.lerpVectors(
      this.transition.fromPosition,
      this.transition.toPosition,
      easeInOutCubic(positionProgress),
    );
    const rotation = this.transition.fromRotation
      .clone()
      .lerp(this.transition.toRotation, easeInOutCubic(rotationProgress));
    this.camera.rotation.set(rotation.x, rotation.y, rotation.z);
    this.camera.fov = lerp(
      this.transition.fromFov,
      this.baseFov,
      easeInOutCubic(colorProgress),
    );
    const distortionProgress =
      colorProgress < 0.5
        ? easeInOutCubic(colorProgress * 2)
        : 1 - easeInOutCubic((colorProgress - 0.5) * 2);
    this.postProcessor.setDistortion(3 * distortionProgress);
    this.camera.updateProjectionMatrix();
    if (rotationProgress === 1) {
      this.postProcessor.setDistortion(0);
      this.transition = null;
    }
  }

  /** @param {number} timestamp */
  render(timestamp) {
    this.updateIntro(timestamp);
    this.updateTransition(timestamp);
    this.root.rotation.y = lerp(
      this.root.rotation.y,
      (this.pointer.x * Math.PI) / 40,
      0.05,
    );
    this.root.rotation.x = lerp(
      this.root.rotation.x,
      (this.pointer.y * Math.PI) / 40,
      0.07,
    );

    this.frame += 1;
    for (const object of this.animatedObjects)
      object.userData.update?.(this.frame);
    if (timestamp >= this.ambientAnimationStartedAt) {
      for (const model of this.animatedModels) {
        if (model.userData.animation === "rotate")
          model.userData.animationTarget.rotation.y += 0.01;
        if (model.userData.animation === "float") {
          model.position.y =
            model.userData.baseY +
            5 * Math.sin(this.frame * 0.01) * model.userData.floatDirection;
        }
      }
    }
    this.postProcessor.render();
    requestAnimationFrame(this.render);
  }
}

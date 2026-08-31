// @ts-check

import * as THREE from "three";

const FILM_GRAIN_INTENSITY = 0.065;

const fragmentShader = `
  varying vec2 textureCoordinates;
  uniform sampler2D sceneTexture;
  uniform float distortion;

  vec2 distortedCoordinates(vec2 coordinates, float strength) {
    vec2 centered = (coordinates - 0.5) * 2.0;
    float radiusSquared = dot(centered, centered);
    centered *= 1.0 - 0.02 * strength * radiusSquared;
    return centered * 0.5 + 0.5;
  }

  float gaussian(float value, float mean, float deviation) {
    float difference = value - mean;
    return 1.0 / (deviation * sqrt(2.0 * 3.1415))
      * exp(-(difference * difference) / (2.0 * deviation * deviation));
  }

  void main() {
    float maximumDistortion = 4.0 * distortion;
    vec3 wavelength = vec3(700.0, 560.0, 490.0) / 700.0;
    wavelength *= 2.0 * maximumDistortion;

    vec3 color = vec3(0.0);
    for (int sampleIndex = 0; sampleIndex < 8; sampleIndex++) {
      color.r += texture2D(
        sceneTexture,
        distortedCoordinates(textureCoordinates, wavelength.r)
      ).r;
      color.g += texture2D(
        sceneTexture,
        distortedCoordinates(textureCoordinates, wavelength.g)
      ).g;
      color.b += texture2D(
        sceneTexture,
        distortedCoordinates(textureCoordinates, wavelength.b)
      ).b;
      wavelength *= 0.99;
    }
    color /= 8.0;

    float seed = dot(textureCoordinates, vec2(12.9898, 78.233));
    float randomValue = fract(sin(seed) * 43758.5453);
    float noise = gaussian(randomValue, 0.0, 0.25);
    color += vec3(noise) * (1.0 - color) * ${FILM_GRAIN_INTENSITY};
    gl_FragColor = vec4(color, 1.0);
  }
`;

export class PostProcessor {
  /**
   * @param {THREE.WebGLRenderer} renderer
   * @param {THREE.Scene} scene
   * @param {THREE.Camera} camera
   */
  constructor(renderer, scene, camera) {
    this.renderer = renderer;
    this.sourceScene = scene;
    this.sourceCamera = camera;
    this.target = new THREE.WebGLRenderTarget(1, 1, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
    });
    this.screenScene = new THREE.Scene();
    this.screenCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.material = new THREE.ShaderMaterial({
      depthTest: false,
      depthWrite: false,
      uniforms: {
        sceneTexture: { value: this.target.texture },
        distortion: { value: 0 },
      },
      vertexShader: `
        varying vec2 textureCoordinates;
        void main() {
          textureCoordinates = uv;
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader,
    });
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute([-1, 3, 0, -1, -1, 0, 3, -1, 0], 3),
    );
    geometry.setAttribute(
      "uv",
      new THREE.Float32BufferAttribute([0, 2, 0, 0, 2, 0], 2),
    );
    this.screenScene.add(new THREE.Mesh(geometry, this.material));
  }

  /** @param {number} width @param {number} height @param {number} pixelRatio */
  resize(width, height, pixelRatio) {
    this.target.setSize(width * pixelRatio, height * pixelRatio);
  }

  /** @param {number} value */
  setDistortion(value) {
    this.material.uniforms.distortion.value = value;
  }

  render() {
    this.renderer.setRenderTarget(this.target);
    this.renderer.render(this.sourceScene, this.sourceCamera);
    this.renderer.setRenderTarget(null);
    this.renderer.render(this.screenScene, this.screenCamera);
  }
}

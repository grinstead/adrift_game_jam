import {
  Program,
  Shader,
  Texture,
  doAnimationFrame,
  wrapPremadeTexture,
  loadTextureFromRawBitmap,
} from "./swagl.js";
import { SpriteSet } from "./sprites.js";

const COMPRESSION = 4;

const fadeWidth = 64;

export class Lighting {
  constructor(gl, viewportWidth, viewportHeight, texPixelsPerMeter) {
    const lightingTexWidth = viewportWidth / COMPRESSION;
    const lightingTexHeight = viewportHeight / COMPRESSION;

    const vShader = new Shader(
      { gl, type: "vertex" },
      `#version 300 es
in vec3 a_position;
in vec2 a_texturePosition;

uniform mat4 u_projection;

out vec2 v_texturePosition;

void main() {
    vec4 position = u_projection * vec4(a_position, 1);
    gl_Position = vec4(position.x, -position.y, position.z, position.w);
    v_texturePosition = a_texturePosition;
}`
    );
    const fShader = new Shader(
      { gl, type: "fragment" },
      `#version 300 es
precision mediump float;

uniform sampler2D u_texture;
uniform float u_threshold;

in vec2 v_texturePosition;
out vec4 output_color;

void main() {
    vec4 color = texture(u_texture, v_texturePosition.st);
    if (color.a == 0.f || color.x <= u_threshold) {
        discard;
    }
    output_color = vec4(color.xyz, 1);
}`
    );

    const program = new Program({ gl, projection: "projection" });
    program.attach(vShader, fShader).link();

    const targetTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, targetTex);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      lightingTexWidth,
      lightingTexHeight,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null
    );
    // set the filtering so we don't need mips
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    const fb = gl.createFramebuffer();

    // define the framebuffer as writing to our texture
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      targetTex,
      0
    );
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    const fadeRadius = (COMPRESSION * (0.5 * fadeWidth)) / texPixelsPerMeter;

    const fadeTexture = loadTextureFromRawBitmap({
      name: "fade",
      width: fadeWidth,
      height: fadeWidth,
      gl,
      bmp: makeQuadraticDropoff(fadeWidth, fadeWidth, 0.01, texPixelsPerMeter),
    });

    this._program = program;
    this._targetTex = wrapPremadeTexture({
      tex: targetTex,
      name: "lighting",
      width: lightingTexWidth,
      height: lightingTexHeight,
      gl,
    });
    this._frameBuffer = fb;
    this._fade = new SpriteSet(fadeTexture, {
      // prettier-ignore
      "main": [[
           fadeRadius, 0, -fadeRadius, 1, 0,
           fadeRadius, 0,  fadeRadius, 1, 1,
          -fadeRadius, 0, -fadeRadius, 0, 0,
          -fadeRadius, 0,  fadeRadius, 0, 1,
        ]],
    });
  }

  renderLighting(scene) {
    const gl = this._program.gl;
    const tex = this._targetTex;

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);

    // render everything to our target texture and frame buffer
    gl.bindFramebuffer(gl.FRAMEBUFFER, this._frameBuffer);
    gl.viewport(0, 0, tex.w, tex.h);

    doAnimationFrame(this._program, (gl, program) => {
      renderLightingToTexture(gl, program, this, scene);
    });
  }

  /**
   * @returns {Texture}
   */
  lightingTex() {
    return this._targetTex;
  }
}

/**
 *
 * @param {WebGL2RenderingContext} gl
 * @param {Program} program
 * @param {Lighting} lighting
 * @param {Object} scene
 */
function renderLightingToTexture(gl, program, lighting, scene) {
  if (scene.lightsOn) {
    gl.clearColor(1, 1, 1, 1);
  } else {
    gl.clearColor(0.2, 0.2, 0.2, 1);
  }
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  scene.renderInCamera(gl, program, () => {
    const fade = lighting._fade;
    fade.bindTo(program);

    const thresholder = program.u["threshold"];
    const time = scene.timeDiff;

    scene.particles.forEach((particle) => {
      if (!particle.dead) {
        const startTime = particle.startTime;
        const percentPassed =
          (time - startTime) / (particle.deathTime - startTime);

        // set the circle to fade out
        gl.uniform1f(thresholder, percentPassed * percentPassed);

        program.stack.pushTranslation(particle.x, particle.y, particle.z);
        fade.renderSpriteDatumPrebound("main", 0);
        program.stack.pop();
      }
    });
  });
}

function makeQuadraticDropoff(width, height, brightRadius, texPixelsPerMeter) {
  const bitmap = new Uint8Array(4 * width * height);

  const getDistanceSquared = (pixelDx, pixelDy) => {
    const dx = pixelDx / texPixelsPerMeter;
    const dy = pixelDy / texPixelsPerMeter;
    return dx * dx + dy * dy;
  };

  const middleX = width / 2;
  const middleY = height / 2;

  const brightRadiusSquared = brightRadius * brightRadius;
  const edgeValue = Math.min(
    getDistanceSquared(middleX, 0),
    getDistanceSquared(middleY, 0)
  );

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const offset = 4 * (y * width + x);
      const distanceSquared = getDistanceSquared(x - middleX, y - middleY);

      if (distanceSquared <= brightRadiusSquared) {
        bitmap[offset + 0] = 255;
        bitmap[offset + 1] = 255;
        bitmap[offset + 2] = 255;
        bitmap[offset + 3] = 255;
      } else {
        const concentration = Math.sqrt(brightRadiusSquared / distanceSquared);

        const primary = Math.floor(256 * concentration);
        const secondary = Math.floor(256 * concentration * concentration);

        bitmap[offset + 0] = primary;
        bitmap[offset + 1] = secondary;
        bitmap[offset + 2] = secondary;
        bitmap[offset + 3] = distanceSquared >= edgeValue ? 0 : 255;
      }
    }
  }

  return bitmap;
}

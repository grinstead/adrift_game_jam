import {
  MatrixStack,
  Program,
  Shader,
  Texture,
  doAnimationFrame,
  wrapPremadeTexture,
  loadTextureFromRawBitmap,
  makeSolidTexture,
} from "./swagl.js";
import { SpriteSet, Sprite } from "./sprites.js";
import { WALL_META, ROOM_DEPTH_RADIUS, ROOM_HEIGHT } from "./SpriteData.js";
import { Room } from "./Scene.js";

const COMPRESSION = 4;

const fadeWidth = 64;

// I have no idea why, but we need to flip the y coordinate
// prettier-ignore
const FLIP_Y = new Float32Array([
  1, 0, 0, 0,
  0, -1, 0, 0,
  0, 0, 1, 0,
  0, 0, 0, 1,
]);

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
  gl_Position = u_projection * vec4(a_position, 1);
  v_texturePosition = a_texturePosition;
}`
    );
    const fShader = new Shader(
      { gl, type: "fragment" },
      `#version 300 es
precision mediump float;

uniform sampler2D u_texture;
uniform float u_threshold;
uniform vec4 u_color;

in vec2 v_texturePosition;
out vec4 output_color;

void main() {
    vec4 color = texture(u_texture, v_texturePosition.st);
    
    if (u_threshold != -1.f) {
      color.a -= u_threshold;
      if (color.a <= u_threshold) {
          discard;
      }
      output_color = color;
    } else {
      if (color.a == 0.f) {
        discard;
      }
      output_color = u_color;
    }
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
    // this._portholeSprite = new SpriteSet(makeSolidTexture(gl, 0, 0, 0, 255), {
    //   name: "porthole light",
    //   main: [[]],
    // });

    /** @private {SpriteSet} */
    this._fade = new SpriteSet(fadeTexture, {
      // prettier-ignore
      "main": [[
           fadeRadius, 0, -fadeRadius, 1, 0,
           fadeRadius, 0,  fadeRadius, 1, 1,
          -fadeRadius, 0, -fadeRadius, 0, 0,
          -fadeRadius, 0,  fadeRadius, 0, 1,
        ]],
    });

    /** @private {SpriteSet} */
    this._whiteSquare = new SpriteSet(
      makeSolidTexture(gl, 255, 255, 255, 255),
      {
        // prettier-ignore
        "main": [[
          0, 0, 0, 0, 0,
          1, 0, 0, 0, 0,
          0, 0, 1, 0, 0,
          1, 0, 1, 0, 0,
        ]],
      }
    );
  }

  renderLighting(renderInCamera, room) {
    const gl = this._program.gl;
    const tex = this._targetTex;

    // render everything to our target texture and frame buffer
    gl.bindFramebuffer(gl.FRAMEBUFFER, this._frameBuffer);
    gl.viewport(0, 0, tex.w, tex.h);

    doAnimationFrame(this._program, (gl, program) => {
      renderLightingToTexture(gl, program, renderInCamera, this, room);
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
 * @param {function(MatrixStack,function():void):void} renderInCamera
 * @param {Lighting} lighting
 * @param {Array<Room>} rooms
 */
function renderLightingToTexture(gl, program, renderInCamera, lighting, rooms) {
  gl.blendFunc(gl.ONE, gl.ONE);

  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  const thresholdAnchor = program.u["threshold"];
  const colorAnchor = program.u["color"];
  gl.uniform1f(thresholdAnchor, -1);

  const stack = program.stack;
  renderInCamera(stack, () => {
    const whiteSquare = lighting._whiteSquare;

    // mask the rooms
    whiteSquare.bindTo(program);
    rooms.forEach((room) => {
      gl.uniform4f(
        colorAnchor,
        0,
        0,
        0,
        window["lightsOn"] || room.lightsOn ? 1 : room.ambientLight
      );

      const projection = room.resources.environ.projection;

      const roomLeft = room.roomLeft - projection.lipWidth;
      const roomWidth = room.roomRight + projection.lipWidth - roomLeft;
      const roomBottom = room.roomBottom - projection.lipHeight;
      const roomHeight = 2 * projection.lipHeight + ROOM_HEIGHT;

      // prettier-ignore
      stack.push(new Float32Array([
        roomWidth, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, roomHeight, 0,
        roomLeft, -ROOM_DEPTH_RADIUS, roomBottom, 1
      ]));
      whiteSquare.renderSpriteDatumPrebound("main", 0);
      stack.pop();
    });

    const fade = lighting._fade;
    fade.bindTo(program);

    gl.uniform4f(colorAnchor, 0, 0, 0, 1);
    rooms.forEach((room) => {
      const time = room.roomTime;

      room.sparks.forEach((particle) => {
        if (!particle.dead) {
          const startTime = particle.startTime;
          const percentPassed =
            (time - startTime) / (particle.deathTime - startTime);

          // set the circle to fade out
          gl.uniform1f(thresholdAnchor, 0.5 * percentPassed * percentPassed);

          stack.pushTranslation(particle.x, particle.y, particle.z);
          fade.renderSpriteDatumPrebound("main", 0);
          stack.pop();
        }
      });
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
      const percentageFromEdge = 1 - Math.sqrt(distanceSquared / edgeValue);
      const brightAdd = distanceSquared <= brightRadiusSquared ? 5 : 0;

      const primary = Math.max(
        Math.round(255 * percentageFromEdge * percentageFromEdge),
        0
      );

      bitmap[offset + 0] =
        brightAdd + Math.max(Math.round(20 * percentageFromEdge), 0);
      bitmap[offset + 1] = brightAdd;
      bitmap[offset + 2] = brightAdd;
      bitmap[offset + 3] = primary;
    }
  }

  return bitmap;
}

function makeCircleSprite(radiusInPixels, texPixelsPerMeter) {
  const bitmap = new Uint8Array(4 * radiusInPixels * radiusInPixels);
}

import {
  Program,
  Shader,
  loadTextureFromImgUrl,
  loadTextureFromRawBitmap,
} from "./swagl.js";
import { GameLoop } from "./webgames/GameLoop.js";
import { SpriteSet } from "./sprites.js";

const PIXELS_PER_METER = 180;
const ROOM_DEPTH = 2; // meters

async function onLoad() {
  const fpsNode = document.getElementById("fps");
  const canvas = document.getElementById("canvas");
  const computedStyle = window.getComputedStyle(canvas);

  let width = parseInt(computedStyle.getPropertyValue("width"), 10);
  let height = parseInt(computedStyle.getPropertyValue("height"), 10);

  const ratio = window.devicePixelRatio || 1;
  if (ratio !== 1) {
    canvas.width = ratio * width;
    canvas.height = ratio * height;
  }

  const gl = canvas.getContext("webgl2", { antialias: false, alpha: false });
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);

  const vShader = new Shader(
    { gl, type: "vertex" },
    `#version 300 es

    in vec3 a_position;
    in vec2 a_texturePosition;

    uniform mat4 u_projection;

    out vec2 v_texturePosition;

    void main() {
        vec4 position = u_projection * vec4(a_position, 1);
        float variance = 1.f / (position.z + 1.f);

        vec4 result = vec4(position.x, position.y * variance, -.5f * (position.z - 1.f) * variance, variance);
        gl_Position = result;

        v_texturePosition = a_texturePosition;
    }
`
  );

  const fShader = new Shader(
    { gl, type: "fragment" },
    `#version 300 es
    precision mediump float;

    uniform sampler2D u_texture;

    in vec2 v_texturePosition;
    out vec4 output_color;

    void main() {
        vec4 color = texture(u_texture, v_texturePosition.st);
        if (color.a == 0.0) {
            discard;
        }
        output_color = color;
    }
`
  );

  const program = new Program({ gl, projection: "projection" });
  program.attach(vShader, fShader).link();

  const [wallTex, floorTex] = await Promise.all([
    loadTextureFromImgUrl({
      gl,
      src: "assets/Background Wall.png",
      name: "wall",
    }),
    loadTextureFromImgUrl({
      gl,
      src: "assets/Floor 2.png",
      name: "floor",
    }),
  ]);

  // the division by 2 is because the textures are designed for retina
  const floorDims = {
    w: floorTex.w / PIXELS_PER_METER / 2,
    h: 34 / PIXELS_PER_METER / 2,
    d: 175 / PIXELS_PER_METER / 2,
    boundary: 175 / 209,
  };

  const wall = new SpriteSet(wallTex, {
    // prettier-ignore
    "main": [[
        wallTex.w / PIXELS_PER_METER / 2, -floorDims.d/2, 0, 1, 0,
        wallTex.w / PIXELS_PER_METER / 2, -floorDims.d/2, wallTex.h/PIXELS_PER_METER/2, 1, 1,
        0, -floorDims.d/2, 0, 0, 0,
        0, -floorDims.d/2, wallTex.h/PIXELS_PER_METER/2, 0, 1,
      ]],
  });

  const floor = new SpriteSet(floorTex, {
    // prettier-ignore
    "main": [[
        floorDims.w,  floorDims.d/2, -floorDims.h, 1,                  1,
                  0,  floorDims.d/2, -floorDims.h, 0,                  1,
        floorDims.w,  floorDims.d/2,            0, 1, floorDims.boundary,
                  0,  floorDims.d/2,            0, 0, floorDims.boundary,
        floorDims.w, -floorDims.d/2,            0, 1,                  0,
                  0, -floorDims.d/2,            0, 0,                  0,
      ]],
  });

  const fadeTexture = loadTextureFromRawBitmap({
    name: "fade",
    width: PIXELS_PER_METER,
    height: PIXELS_PER_METER,
    gl,
    bmp: makeQuadraticDropoff(PIXELS_PER_METER, PIXELS_PER_METER, 2),
  });

  const fade = new SpriteSet(fadeTexture, {
    // prettier-ignore
    "main": [[
       .5, 0, -.5, 1, 0,
       .5, 0,  .5, 1, 1,
      -.5, 0, -.5, 0, 0,
      -.5, 0,  .5, 0, 1,
    ]],
    // prettier-ignore
    "white": [[
      40, 0, 0, .5, .5,
      40, 0, 20, .5, .5,
      0, 0, 0, .5, .5,
      0, 0, 20, .5, .5,
    ]],
  });

  let mouseX = 0;
  let mouseY = 0;

  // makes the viewport 40m wide
  // prettier-ignore
  const projection = new Float32Array([
    2 * PIXELS_PER_METER / width, 0,    0, 0,
    0,    -2 * PIXELS_PER_METER / height, 1/4, 0,
    0,    2 * PIXELS_PER_METER / height, 0, 0,
    -1,   -1,   0, 1,
  ]);

  let startTime = Date.now();

  function renderStep(gl, program) {
    program.stack.pushAbsolute(projection);

    const timeDiff = (Date.now() - startTime) / 1000;

    program.stack.pushTranslation(
      Math.sin(timeDiff / 4) - 1.5,
      0,
      floorDims.d / 2 + floorDims.h
    );
    wall.bindTo(program);
    wall.renderSpriteDatumPrebound("main", 0);

    floor.bindTo(program);
    floor.renderSpriteDatumPrebound("main", 0);
    program.stack.pop();

    fade.bindTo(program);
    program.stack.pushTranslation(
      mouseX / PIXELS_PER_METER,
      0,
      (height - mouseY) / PIXELS_PER_METER
    );
    fade.renderSpriteDatumPrebound("main", 0);
  }

  function logicStep() {
    fpsNode.innerHTML = `fps=${Math.round(loop.avgFps())}/${loop.fps}`;

    program.runInFrame(renderStep);
  }

  const loop = new GameLoop();
  loop.onLoop = logicStep;
  loop.start(60);
  // setTimeout(logicStep, 0);

  canvas.onmousemove = (event) => {
    mouseX = event.offsetX;
    mouseY = event.offsetY;
  };
}

function makeQuadraticDropoff(width, height, brightRadius) {
  const bitmap = new Uint8Array(4 * width * height);

  const middleX = width / 2;
  const middleY = height / 2;
  const brightRadiusSquared = brightRadius * brightRadius;
  const edgeValue = Math.min(width * width, height * height) / 4;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const offset = 4 * (y * width + x);

      const dx = x - middleX;
      const dy = y - middleY;
      const distanceSquared = dx * dx + dy * dy;

      if (distanceSquared <= brightRadiusSquared) {
        bitmap[offset + 0] = 255;
        bitmap[offset + 1] = 255;
        bitmap[offset + 2] = 255;
        bitmap[offset + 3] = 255;
      } else {
        const concentration = brightRadiusSquared / distanceSquared;

        const primary = Math.floor(256 * concentration);
        const secondary = Math.floor(256 * concentration * concentration);

        bitmap[offset + 0] = 255;
        bitmap[offset + 1] = secondary;
        bitmap[offset + 2] = secondary;
        bitmap[offset + 3] = distanceSquared >= edgeValue ? 0 : primary;
      }
    }
  }

  return bitmap;
}

window.onload = onLoad;

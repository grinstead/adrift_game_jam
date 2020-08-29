import {
  Program,
  Shader,
  loadTextureFromImgUrl,
  loadTextureFromRawBitmap,
} from "./swagl.js";
import { GameLoop } from "./webgames/GameLoop.js";
import { SpriteSet } from "./sprites.js";

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

  const vShader = new Shader(
    { gl, type: "vertex" },
    `#version 300 es

    in vec3 a_position;
    in vec2 a_texturePosition;

    uniform mat4 u_projection;

    out highp vec2 v_texturePosition;

    void main() {
        vec4 position = u_projection * vec4(a_position, 1);

        gl_Position = position / position.w;
        v_texturePosition = a_texturePosition;
    }
`
  );

  const fShader = new Shader(
    { gl, type: "fragment" },
    `#version 300 es
    precision mediump float;

    uniform sampler2D u_texture;

    in highp vec2 v_texturePosition;
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

  // const basicTexture = await loadTextureFromImgUrl({
  //   gl,
  //   src: "assets/marblol2.PNG",
  //   name: "pretend wall",
  // });

  // const wall = new SpriteSet(basicTexture, {
  //   // prettier-ignore
  //   "main": [[
  //     1, 0, 0, 1, 0,
  //     1, 0, 1, 1, 1,
  //     0, 0, 0, 0, 0,
  //     0, 0, 1, 0, 1,
  //   ]],
  // });

  const fadeTexture = loadTextureFromRawBitmap({
    name: "fade",
    width: 32,
    height: 32,
    gl,
    bmp: makeQuadraticDropoff(32, 32, 3),
  });

  const fade = new SpriteSet(fadeTexture, {
    // prettier-ignore
    "main": [[
      1, 0, 0, 1, 0,
      1, 0, 1, 1, 1,
      0, 0, 0, 0, 0,
      0, 0, 1, 0, 1,
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
    2/40, 0,    0, 0,
    0,    0,    0, 0,
    0,    2/20, 0, 0,
    -1,   -1,   0, 1,
  ]);

  function renderStep(gl, program) {
    program.stack.pushAbsolute(projection);
    console.log(fade.data);
    fade.bindTo(program);
    fade.renderSpriteDatumPrebound("white", 0);
    program.stack.pushTranslation(
      (mouseX - 16) / 32,
      0,
      20 - (mouseY + 16) / 32
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

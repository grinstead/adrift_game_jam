import { Program, Shader, Texture } from "./swagl.js";
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

  const gl = canvas.getContext("webgl", { antialias: false });
  gl.enable(gl.DEPTH_TEST);

  const vShader = new Shader(
    { gl, type: "vertex" },
    `
    attribute vec3 a_position;
    attribute vec2 a_texturePosition;

    uniform mat4 u_projection;

    varying highp vec2 v_texturePosition;

    void main() {
        vec4 position = u_projection * vec4(a_position, 1);

        gl_Position = position / position.w;
        v_texturePosition = a_texturePosition;
    }
`
  );

  const fShader = new Shader(
    { gl, type: "fragment" },
    `
    precision mediump float;

    uniform sampler2D u_texture;

    varying highp vec2 v_texturePosition;

    void main() {
        vec4 color = texture2D(u_texture, v_texturePosition.st);
        if (color.a == 0.0) {
            discard;
        }
        gl_FragColor = color;
    }
`
  );

  const program = new Program({ gl, projection: "projection" });
  program.attach(vShader, fShader).link();

  const basicTexture = await Texture.loadFromUrl({
    gl,
    src: "assets/marblol2.PNG",
    name: "pretend wall",
  });

  const wall = new SpriteSet(basicTexture, {
    // prettier-ignore
    "main": [[
      1, 0, 0, 1, 0,
      1, 0, 1, 1, 1,
      0, 0, 0, 0, 0,
      0, 0, 1, 0, 1,
    ]],
  });

  let mouseX = 0;
  let mouseY = 0;

  // makes the viewport 40m wide
  // prettier-ignore
  const projection = new Float32Array([
    2/40, 0,    0, 0,
    0,    0,    0, 0,
    0,    2/25, 0, 0,
    -1,   -1,   0, 1,
  ]);

  function renderStep(gl, program) {
    program.stack.pushAbsolute(projection);
    program.stack.pushTranslation(
      (mouseX - 16) / 32,
      0,
      25 - (mouseY + 16) / 32
    );
    wall.renderSpriteDatum(program, "main", 0);
  }

  function logicStep() {
    fpsNode.innerHTML = `fps=${Math.round(loop.avgFps())}/${loop.fps}`;

    program.runInFrame(renderStep);
  }

  const loop = new GameLoop();
  loop.onLoop = logicStep;
  loop.start(60);

  canvas.onmousemove = (event) => {
    mouseX = event.offsetX;
    mouseY = event.offsetY;
  };
}

window.onload = onLoad;

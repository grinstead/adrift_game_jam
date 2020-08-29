import { Program, Shader, Texture } from "./swagl.js";
import { GameLoop } from "./webgames/GameLoop.js";

function onLoad() {
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

  width /= 1.5;
  height /= 1.5;

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

  function logicStep() {
    console.log("hi");
    fpsNode.innerHTML = `fps=${Math.round(loop.avgFps())}/${loop.fps}`;
  }

  const loop = new GameLoop();
  loop.onLoop = logicStep;
  //   loop.start(4);

  console.log("yoy oyou");
}

function render(gl, program) {}

window.onload = onLoad;

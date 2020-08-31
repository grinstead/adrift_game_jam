import { Program, Shader } from "./swagl.js";

const lightingTexWidth = 512;
const lightingTexHeight = 256;

export class Lighting {
  constructor(gl) {
    const vShader = new Shader(
      { gl, type: "vertex" },
      `#version 300 es
in vec3 a_position;
in vec2 a_texturePosition;

uniform mat4 u_projection;

out vec2 v_texturePosition;

void main() {
    vec4 position = u_projection * vec4(a_position, 1);
    gl_Position = position;
    v_texturePosition = a_texturePosition;
}`
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

    this._program = program;
    this._targetTex = targetTex;
  }
}

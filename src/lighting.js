import {
  Program,
  Shader,
  Texture,
  doAnimationFrame,
  wrapPremadeTexture,
} from "./swagl.js";

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

    this._program = program;
    this._targetTex = wrapPremadeTexture({
      tex: targetTex,
      name: "lighting",
      width: lightingTexWidth,
      height: lightingTexHeight,
      gl,
    });
    this._frameBuffer = fb;

    this._renderLightingToTextureBound = (gl, program) => {
      renderLightingToTexture(gl, program, this);
    };
  }

  renderLighting() {
    const gl = this._program.gl;

    // render everything to our target texture and frame buffer
    gl.bindFramebuffer(gl.FRAMEBUFFER, this._frameBuffer);
    gl.viewport(0, 0, lightingTexWidth, lightingTexHeight);

    doAnimationFrame(this._program, this._renderLightingToTextureBound);
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
 */
function renderLightingToTexture(gl, program, lighting) {
  gl.clearColor(0, 1, 0, 1); // clearing to green for now
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

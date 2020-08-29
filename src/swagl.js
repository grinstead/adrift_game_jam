/**
 * @file SWAGL is a "simple wrapper around gl"
 */

/**
 * @enum {string}
 */
const ShaderType = {
  FRAGMENT: "fragment",
  VERTEX: "vertex",
};

////////////////////////////////////////////////////////////////////////////////
// Locations
////////////////////////////////////////////////////////////////////////////////

/**
 * @enum {number}
 */
const LocationType = {
  UNIFORM: 1,
  ATTRIBUTE: 2,
};

/**
 * Represents a variable we can interact with in the shader. These are
 * automatically generated by running a simple regex through the shader that
 * looks for "uniform u_xxx" and "attribute a_yyy"
 *
 * @property {string} name - The name of the value, equal to the name in the shader but with the u_ or a_ prefix removed
 * @property {string} glName - The name of the value in the shader
 * @property {LocationType} type
 */
class Location {
  constructor(type, prefix, name) {
    this.name = name;
    this.glName = `${prefix}${name}`;

    switch (type) {
      case "uniform":
        this.type = LocationType.UNIFORM;
        if (prefix !== "u_") {
          throw new Error(
            `uniform field "${this.glName}" invalid, must start with u_`
          );
        }
        break;
      case "in":
        this.type = LocationType.ATTRIBUTE;
        if (prefix !== "a_") {
          throw new Error(
            `in field "${this.glName}" invalid, must start with a_`
          );
        }
        break;
      default:
        throw new Error("Impossible");
    }
  }
}

function findLocations(code) {
  const locs = [];
  code.split("\n").forEach((line) => {
    let name, declaration;

    // Check for uniform declaration
    declaration = /^\s*(in|uniform)\s(?:\w+\s)*([ua]_)(\w+);/.exec(line);
    if (declaration) {
      locs.push(new Location(declaration[1], declaration[2], declaration[3]));
    }
  });
  return locs;
}

////////////////////////////////////////////////////////////////////////////////
// Matrices
////////////////////////////////////////////////////////////////////////////////

// prettier-ignore
const identityMat = new Float32Array([
  1, 0, 0, 0,
  0, 1, 0, 0,
  0, 0, 1, 0,
  0, 0, 0, 1,
]);

class MatrixStack {
  constructor(gl, anchor) {
    this.gl = gl;
    this.anchor = anchor;
    this._stack = [];
    gl.uniformMatrix4fv(anchor, false, identityMat);
  }

  peek() {
    const stack = this._stack;
    return stack[stack.length - 1] || identityMat;
  }

  pop() {
    return this._stack.pop();
  }

  pushAbsolute(matrix) {
    this.gl.uniformMatrix4fv(this.anchor, false, matrix);
    this._stack.push(matrix);
  }

  push(matrix) {
    const stack = this._stack;
    if (stack.length === 0) {
      this.pushAbsolute(matrix);
    } else {
      const A = matrix;
      const B = stack[stack.length - 1];

      // Multiply A and B... beautiful...
      this.pushAbsolute(
        new Float32Array([
          A[0] * B[0] + A[1] * B[4] + A[2] * B[8] + A[3] * B[12],
          A[0] * B[1] + A[1] * B[5] + A[2] * B[9] + A[3] * B[13],
          A[0] * B[2] + A[1] * B[6] + A[2] * B[10] + A[3] * B[14],
          A[0] * B[3] + A[1] * B[7] + A[2] * B[11] + A[3] * B[15],
          A[4] * B[0] + A[5] * B[4] + A[6] * B[8] + A[7] * B[12],
          A[4] * B[1] + A[5] * B[5] + A[6] * B[9] + A[7] * B[13],
          A[4] * B[2] + A[5] * B[6] + A[6] * B[10] + A[7] * B[14],
          A[4] * B[3] + A[5] * B[7] + A[6] * B[11] + A[7] * B[15],
          A[8] * B[0] + A[9] * B[4] + A[10] * B[8] + A[11] * B[12],
          A[8] * B[1] + A[9] * B[5] + A[10] * B[9] + A[11] * B[13],
          A[8] * B[2] + A[9] * B[6] + A[10] * B[10] + A[11] * B[14],
          A[8] * B[3] + A[9] * B[7] + A[10] * B[11] + A[11] * B[15],
          A[12] * B[0] + A[13] * B[4] + A[14] * B[8] + A[15] * B[12],
          A[12] * B[1] + A[13] * B[5] + A[14] * B[9] + A[15] * B[13],
          A[12] * B[2] + A[13] * B[6] + A[14] * B[10] + A[15] * B[14],
          A[12] * B[3] + A[13] * B[7] + A[14] * B[11] + A[15] * B[15],
        ])
      );
    }
  }

  pushTranslation(x, y, z = 0) {
    const stack = this._stack;
    const A = stack[stack.length - 1] || identityMat;
    this.pushAbsolute(
      // prettier-ignore
      new Float32Array([
        A[0], A[1], A[2], A[3],
        A[4], A[5], A[6], A[7],
        A[8], A[9], A[10], A[11],
        x * A[0] + y * A[4] + z * A[8] + A[12],
        x * A[1] + y * A[5] + z * A[9] + A[13],
        x * A[2] + y * A[6] + z * A[10] + A[14],
        x * A[3] + y * A[7] + z * A[11] + A[15],
      ])
    );
  }
}

////////////////////////////////////////////////////////////////////////////////
// Shader
////////////////////////////////////////////////////////////////////////////////

/**
 * Class wrapping a WebGL Shader
 * @readonly @property {string} name - The name of the Shader, provided in the constructor for debugging purposes
 * @readonly @property {WebGL2RenderingContext} gl - The WebGL context this shader is attached to
 * @readonly @property {ShaderType} type - The type of the shader
 */
export class Shader {
  /**
   * Create a Shader class and immediately compile the shader using the provided webgl context
   *
   * @param {Object} options - The named arguments
   * @param {string} options.name - The name of the shader (for debugging)
   * @param {WebGL2RenderingContext} options.gl - The rendering context this shader applies to
   * @param {ShaderType} options.type - The type of the shader
   * @param {string} code - The webgl shader code, the variable names matter a lot
   */
  constructor(options, code) {
    this.name = options.name;

    var gl = (this.gl = options.gl);
    var type = (this.type = options.type);

    var glType;
    switch (type) {
      case ShaderType.VERTEX:
        glType = this.gl.VERTEX_SHADER;
        break;
      case ShaderType.FRAGMENT:
        glType = this.gl.FRAGMENT_SHADER;
        break;
      default:
        throw new Error(`Unrecognized shader type "${type}"`);
    }
    this._glType = glType;

    var shader = (this._glShader = gl.createShader(glType));

    gl.shaderSource(shader, code);
    gl.compileShader(shader);

    var compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!compiled) {
      var error = gl.getShaderInfoLog(shader);
      var message = `Failed to compile ${this.name} ${type}-shader: ${error}`;
      gl.deleteShader(shader);
      throw new Error(message);
    }

    this._locs = findLocations(code);
  }
}

////////////////////////////////////////////////////////////////////////////////
// Program
////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps a WebGL Program. It understands all the entry points.
 * @property {Object.<string, number>} u
 * @property {Object.<string, number>} a
 */
export class Program {
  constructor(options) {
    this.name = options.name;
    this.projection = options.projection;

    var gl = (this.gl = options.gl);

    this.linked = false;

    this._glProgram = gl.createProgram();

    this._shaders = [];
    this.u = {};
    this.a = {};
    this.stack = null;

    this._isScheduled = false;
    this._jobs = [];
    this._doAnimationFrame = () => void doAnimationFrame(this);
  }

  /**
   * Attaches shaders to the webgl instance
   * @param {...Shader} shaders - The shaders (generally a vertex and fragment shader)
   */
  attach(...shaders) {
    const gl = this.gl;
    const glProgram = this._glProgram;
    shaders.forEach((shader) => {
      this._shaders.push(shader);
      gl.attachShader(glProgram, shader._glShader);
    });

    return this;
  }

  link() {
    if (this.linked) return this;

    var gl = this.gl;
    var glProgram = this._glProgram;

    gl.linkProgram(glProgram);
    if (!gl.getProgramParameter(glProgram, gl.LINK_STATUS)) {
      var info = gl.getProgramInfoLog(glProgram);
      var message = `Failed to link ${this.name} program: ${info}`;
      gl.deleteProgram(glProgram);
      throw new Error(message);
    }

    this.linked = true;

    return this;
  }

  /**
   * Schedules the "job" (a render function) to run on the next animation frame.
   * Multiple calls to this function will be batched and called in order.
   * @param {function(WebGL2RenderingContext,Program):void} job - the code to run
   */
  runInFrame(job) {
    this._jobs.push(job);

    if (!this._isScheduled) {
      requestAnimationFrame(this._doAnimationFrame);
    }
  }
}

function doAnimationFrame(program) {
  var gl = program.gl;
  var glProgram = program._glProgram;
  gl.useProgram(glProgram);

  var u = {},
    a = {},
    shaders = program._shaders;
  for (var i = 0; i < shaders.length; i++) {
    var locs = shaders[i]._locs;
    for (var j = 0; j < locs.length; j++) {
      var loc = locs[j];

      if (loc.type === LocationType.UNIFORM) {
        if (loc.glName in u) continue;

        u[loc.name] = gl.getUniformLocation(glProgram, loc.glName);
      } else {
        if (loc.glName in a) continue;

        a[loc.name] = gl.getAttribLocation(glProgram, loc.glName);
      }
    }
  }

  program.u = u;
  program.a = a;

  const projection = program.projection;
  if (projection) {
    if (projection in program.u) {
      program.stack = new MatrixStack(gl, program.u[projection]);
    } else {
      throw new Error(`No anchor point "${projection}" in program`);
    }
  }

  try {
    var jobs = program._jobs;
    for (var i = 0; i < jobs.length; jobs++) {
      jobs[i](gl, program);
    }
  } finally {
    program.u = {};
    program.a = {};
    program.stack = null;
    if (program._jobs.length === 1) {
      program._jobs = []; // optimizing the common case
    } else {
      program._jobs.pop();
    }
  }
}

////////////////////////////////////////////////////////////////////////////////
// Textures
////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps a WebGL texture.
 * @property {string} name - A name for debugging
 * @property {WebGL2RenderingContext} gl - The context this texture is attached to
 * @property {number} w - the width of the texture (in pixels)
 * @property {number} h - the height of the texture (in pixels)
 */
export class Texture {
  constructor(gl, name, width, height, loadTexture) {
    this.gl = gl;
    this.name = name;
    this.w = width;
    this.h = height;

    const texture = (this._glTex = gl.createTexture());
    gl.bindTexture(gl.TEXTURE_2D, texture);
    loadTexture(gl);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.bindTexture(gl.TEXTURE_2D, null);
  }

  bindTexture() {
    this.gl.bindTexture(this.gl.TEXTURE_2D, this._glTex);
  }

  passSize(anchor) {
    this.gl.uniform2f(anchor, this.w, this.h);
  }
}

/**
 * Loads a texture from the internet
 * @param {Object} options
 * @param {string} options.src - The url of the image (must be on the same domain)
 * @param {string} options.name - The name of the resultant Texture (for debugging)
 * @param {WebGL2RenderingContext} options.gl
 * @returns {Promise<Texture>} The loaded texture
 */
export function loadTextureFromImgUrl(options) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => void resolve(image);
    image.onerror = () => {
      reject(new Error(`failed to load ${options.src}`));
    };
    image.mode = "no-cors";
    image.src = options.src;
  }).then((img) => {
    const width = img.naturalWidth;
    const height = img.naturalWidth;

    return new Texture(options.gl, options.name, width, height, (gl) => {
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        width,
        height,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        img
      );
    });
  });
}

/**
 *
 * @param {Object} options
 * @param {Uint8Array} options.bmp
 * @param {string} options.name
 * @param {number} options.width
 * @param {number} options.height
 * @param {WebGL2RenderingContext} options.gl
 * @returns {Texture}
 */
export function loadTextureFromRawBitmap(options) {
  const { width, height } = options;
  return new Texture(options.gl, options.name, width, height, (gl) => {
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      width,
      height,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      options.bmp,
      0
    );
  });
}
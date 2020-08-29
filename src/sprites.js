/**
 * @file This file defines convenient wrappers around swagl Textures.
 */
import { Program, Texture } from "./swagl.js";

const TUPLE_LENGTH = 5;

/**
 * The first three fields are the xyz position in space and the last two are the
 * xy positions in the texture. The texture coordinates are measured from 0 to
 * 1, with (0,0) being the top-left corner and (1,1) being the bottom right.
 * @typedef {Array<number>}
 */
let PositionTexPosition;

/**
 * This is the immutable data that backs up a sprite (also has some hidden fields)
 * @typedef {{ name: string, nPoints: number, _offsets: Array<number>, _set: SpriteSet}}
 */
let SpriteDatum;

/**
 * Builder
 * @param {SpriteSet} set
 * @param {string} name
 * @param {Array<number>} offsets
 * @param {number} nPoints
 * @returns {SpriteDatum}
 */
function makeDatum(set, name, offsets, nPoints) {
  return { _set: set, name, _offsets: offsets, nPoints };
}

//////////////////////////////////////////////////////////////////////////////
// Sets
//////////////////////////////////////////////////////////////////////////////

/**
 * A SpriteSet is a collections of sprites that all use the same texture. This
 * is useful if you make a combined texture with multiple elements. It is less
 * useful if a texture contains only one sprite, but you must still use a
 * SpriteSet in that instance.
 * @property {Object.<string, SpriteDatum>} data - Named sprites, takes on the same names as the data field in the constructor
 */
export class SpriteSet {
  /**
   * Creates a SpriteSet
   * @param {Texture} tex - The texture backing the whole set
   * @param {Object.<string, Array<Array<number>>>} data - Named data
   */
  constructor(tex, data) {
    this._tex = tex;
    /** @type {?WebGLBuffer} */
    this._buffer = null;

    const internalData = (this.data = {});

    const allData = [];
    let numTuples = 0;

    // We take all the split up data and we recombine it into a single Float32Array
    // while building lists of offsets within that array.
    for (const name in data) {
      const sequence = data[name];
      const offsets = [];

      const sequenceLength = sequence.length;
      if (sequenceLength === 0) {
        throw new Error("Sprite declared with 0 points");
      }

      const stepLength = sequence[0].length;
      if (stepLength == 0 || TUPLE_LENGTH % 5 !== 0) {
        throw new Error(
          `Sprite declared with list of length ${TUPLE_LENGTH} (must be non-zero multiple of 5)`
        );
      }

      for (let i = 0; i < sequenceLength; i++) {
        const tuples = sequence[i];
        if (tuples.length !== stepLength) {
          throw new Error(
            `Sprite declared with inconsistent lengths of elements`
          );
        }

        offsets.push(numTuples++);
        allData.push.apply(allData, tuples);
      }

      internalData[name] = makeDatum(this, name, offsets, stepLength / 5);
    }

    this._rawData = new Float32Array(allData);
  }

  /**
   * Sets this SpriteSet's texture and vertex data as the active texture
   * @param {Program} program
   */
  bindTo(program) {
    const gl = this._tex.gl;

    // lazily initialize the buffer
    let buffer = this._buffer;
    if (buffer != null) {
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    } else {
      this._buffer = buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, this._rawData, gl.STATIC_DRAW);
    }

    gl.activeTexture(gl.TEXTURE0);
    this._tex.bindTexture();
    gl.uniform1i(program.u["texture"], 0);

    gl.enableVertexAttribArray(program.a["texturePosition"]);
    gl.vertexAttribPointer(
      program.a["texturePosition"],
      2,
      gl.FLOAT,
      false,
      20,
      12
    );

    gl.enableVertexAttribArray(program.a["position"]);
    gl.vertexAttribPointer(program.a["position"], 3, gl.FLOAT, false, 20, 0);
  }

  /**
   * Renders a datum to the screen
   * @param {string} datumName - Must be a key on the `.data` object
   */
  renderSpriteDatum(program, datumName, index) {
    if (!this.data.hasOwnProperty(datumName)) {
      throw new Error(`Can not render unknown "${datumName}"`);
    }

    this.bindTo(program);
    const datum = this.data[datumName];
    const gl = this._tex.gl;
    gl.drawArrays(gl.TRIANGLE_STRIP, datum._offsets[index], datum.nPoints);
  }
}

//////////////////////////////////////////////////////////////////////////////
// Individual Sprite
//////////////////////////////////////////////////////////////////////////////

/**
 * A Sprite is an atomic render-able. Unlike normal sprite systems, a sprite in
 * this system has 3d coordinates, but reads from only one texture. It can also
 * have multiple ways of rendering (eg. animated, or facing different
 * directions). In many ways, I probably should have just called it a "model"
 */
export class Sprite {
  constructor() {}
}

export function singletonSprite() {}

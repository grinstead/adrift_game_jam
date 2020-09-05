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

      const tuplesPerStep = stepLength / 5;
      for (let i = 0; i < sequenceLength; i++) {
        const tuples = sequence[i];
        if (tuples.length !== stepLength) {
          throw new Error(
            `Sprite declared with inconsistent lengths of elements`
          );
        }

        offsets.push(numTuples);
        allData.push.apply(allData, tuples);
        numTuples += tuplesPerStep;
      }

      internalData[name] = makeDatum(this, name, offsets, tuplesPerStep);
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
  renderSpriteDatumPrebound(datumName, index) {
    if (!this.data.hasOwnProperty(datumName)) {
      throw new Error(`Can not render unknown "${datumName}"`);
    }

    const datum = this.data[datumName];
    const gl = this._tex.gl;
    const offsets = datum._offsets;
    gl.drawArrays(
      gl.TRIANGLE_STRIP,
      offsets[index % offsets.length],
      datum.nPoints
    );
  }
}

//////////////////////////////////////////////////////////////////////////////
// Individual Sprite
//////////////////////////////////////////////////////////////////////////////

/**
 * The options you can pass to a Sprite object on creation
 * @typedef {Object}
 * @property {string} name - The name of this Sprite (for debugging)
 * @property {SpriteSet} set - The set from which come all the Sprite's modes
 * @property {Array<string>} modes - All the modes the sprite can use, used to read directly from the SpriteSet's data field
 * @property {boolean|number} loops - The number of times a sprite loops, false (or 0) if it does not, and true if it loops forever
 * @property {Array<number> | number} frameTime - The time (in seconds) a frame (or each frame) should stay on screen
 * @property {?Array<*>} perFrameData - If you have meta-data for each frame, you can supply it and query it directly from the Sprite's frameData() method
 */
let SpriteDefinition;

/**
 * A Sprite is an atomic render-able. Unlike normal sprite systems, a sprite in
 * this system has 3d coordinates, but reads from only one texture. It can also
 * have multiple ways of rendering (eg. facing different
 * directions). In many ways, I probably should have just called it a "model".
 *
 * All the "modes" must have the same number of frames.
 */
export class Sprite {
  /**
   * Constructs a Sprite. Do not call this directly, use makeSpriteType instead
   * @private
   * @param {SpriteDefinition} options
   * @param {Array<number>} frameTimes - Computed once, supersedes the value in options
   */
  constructor(options, frameTimes) {
    const { loops, frameTime } = options;

    // set the name immediately so that the possible errors print nicely
    /** @private {string} _name - The name of this Sprite, for debugging */
    this._name = options.name;
    /** @private {number} When the current mode started */
    this._startTime = 0;
    /** @private {Array<string>} All of the modes in this sprite */
    this._modes = options.modes;
    /** @private {null|string} Which mode is currently running */
    this._activeMode = null;
    /** @private {number} The number of time a sprite loops (-1 if it loops forever) */
    this._targetLoops = typeof loops === "number" ? loops : loops ? -1 : 0;
    /** @private {SpriteSet} The set to bind when rendering this sprite */
    this._spriteSet = options.set;
    /** @private {Array<number>} The amount of time (in seconds) each frame stays on screen */
    this._frameTimes = frameTimes;
    /** @private {number} The number of times the sprite has looped since being reset */
    this._currentLoop = 0;
    /** @private {number} The index of the active frame, or -1 if the Sprite is not active */
    this._frameIndex = -1;
    /** @private {number} The time when we should switch frames, or -1 if we reached the last one */
    this._nextFrameTime = -1;
    /** @private {?Array<*>} Extra data for each frame */
    this._frameData = options.perFrameData;
  }

  /**
   * Updates the time, which updates the frame position
   * @param {number} time - The room time
   * @returns {boolean} true if the frame changed (also returns true if the animation completes)
   */
  updateTime(time) {
    let changed = false;

    // check if we should advance the frame
    let nextFrameTime = this._nextFrameTime;
    while (nextFrameTime !== -1 && nextFrameTime <= time) {
      changed = true;

      const frameTimes = this._frameTimes;
      const nextFrame = this._frameIndex + 1;
      if (nextFrame === frameTimes.length) {
        // check if we are in the last loop. This frame cleverly handles targetLoops === -1 (the infinite case)
        if (this._currentLoop === this._targetLoops) {
          // stay on this frame, but adjust the time to never advance
          this._nextFrameTime = nextFrameTime = -1;
        } else {
          this._currentLoop++;
          this._frameIndex = 0;
          this._nextFrameTime = nextFrameTime = time + frameTimes[0];
        }
      } else {
        this._frameIndex = nextFrame;
        this._nextFrameTime = nextFrameTime = time + frameTimes[nextFrame];
      }
    }

    return changed;
  }

  /**
   * Changes the mode of the sprite (eg. from "left" to "right")
   * @param {string} mode
   */
  setMode(mode) {
    this._activeMode = mode;
  }

  /**
   * Returns the frame index, or -1 if the sprite is not active
   * @returns {number} the frame index
   */
  frameIndex() {
    return this._frameIndex;
  }

  /**
   * Get the data for the sprite's current frame, as defined by the perFrameData
   * option. If perFrameData was not supplied, then this returns undefined
   * @returns {*} the data for that frame
   */
  frameData() {
    const frameData = this._frameData;
    return frameData != null ? frameData[this._frameIndex] : undefined;
  }

  /**
   * Returns whether the sprite has finished. Sprites that infinitely loop do not complete.
   * @return {boolean} Whether the sprite has finished
   */
  isFinished() {
    return this._nextFrameTime === -1;
  }

  /**
   * Resets the sprite back to the original index.
   * @param {string} mode - What subversion of the sprite to run
   * @param {number} time - The room time
   */
  resetSprite(mode, time) {
    if (!this._modes.includes(mode)) {
      throw new Error(`${this} does not have mode ${mode}`);
    }

    this._currentLoop = 0;
    this._startTime = time;
    this._activeMode = mode;
    this._frameIndex = 0;
    this._nextFrameTime = time + this._frameTimes[0];
  }

  /**
   * Update's the Sprite's frame and renders
   * @param {Program} program
   */
  renderSprite(program) {
    const mode = this._activeMode;
    if (mode == null) {
      throw new Error(`${this} tried rendering while inactive`);
    }

    this._spriteSet.bindTo(program);
    this._spriteSet.renderSpriteDatumPrebound(mode, this._frameIndex);
  }

  /**
   * Returns the name, primarily for debugging
   * @returns {string} The name (given in the options earlier)
   */
  name() {
    return this._name;
  }

  toString() {
    return `Sprite/${this._name}`;
  }
}

/**
 * Figures out how long a specific frame should last
 * @param {Sprite} sprite
 * @param {number} frameIndex
 * @param {number} time - The room time
 * @returns The length of the frame (in seconds), or -1 if should stay indefinitely
 */
function calculateNextFrameTime(sprite, frameIndex, time) {
  const frames = sprite._frameTimes;

  // check if this is the last frame in the animation, and stay on it
  // indefinitely if it is. This quite snazzily, implicitly handles _targetLoops
  // === -1
  if (
    frameIndex + 1 === frames.length &&
    sprite._currentLoop === sprite._targetLoops
  ) {
    return -1;
  } else {
    // TODO: this is wrong, we need to base it off of our theoretical start time
    // but then we need to handle multiple frames being skipped
    return time + frames[frameIndex];
  }
}

/**
 * Makes a function which will construct new sprites. It's more preferable to
 * use this, because we validate the options
 * @param {SpriteDefinition} options
 * @returns {function():Sprite} A function which outputs a new sprite on ever call
 */
export function makeSpriteType(options) {
  const { name, frameTime } = options;

  const data = options.set.data;
  let numFrames = -1;
  options.modes.forEach((mode) => {
    const datum = data[mode];
    if (!datum) throw new Error(`Sprite/${name} has non-existent mode ${mode}`);

    if (numFrames === -1) {
      numFrames = datum._offsets.length;
    } else if (numFrames !== datum._offsets.length) {
      throw new Error(`Sprite/${name} has inconsistent frame counts`);
    }
  });

  if (numFrames === -1) throw new Error(`Sprite/${name} given 0 modes`);

  if (typeof frameTime !== "number" && frameTime.length !== numFrames) {
    throw new Error(
      `Sprite/${name} given ${frameTime.length} frame times for ${numFrames} frames`
    );
  }

  if (options.frameData && options.frameData.length !== numFrames) {
    throw new Error(
      `Sprite/${name} given ${options.frameData.length} frame data points for ${numFrames} frames`
    );
  }

  const frameTimes =
    typeof frameTime === "number"
      ? new Array(numFrames).fill(frameTime)
      : frameTime;

  return () => new Sprite(options, frameTimes);
}

//////////////////////////////////////////////////////////////////////////////
// Utilities
//////////////////////////////////////////////////////////////////////////////

export function characterSpriteSheet({
  xPercent = 0,
  yInM = 0,
  zPercent = 0,
  widthInPixels,
  heightInPixels,
  texPixelsPerUnit,
  texture,
  numPerRow,
  count,
  reverseX = false,
}) {
  const width = widthInPixels / texPixelsPerUnit;
  const height = heightInPixels / texPixelsPerUnit;

  return spriteSheet({
    x: xPercent * width,
    y: yInM,
    z: zPercent * height,
    width,
    height,
    texWidth: widthInPixels / texture.w,
    texHeight: heightInPixels / texture.h,
    numPerRow,
    count,
    reverseX,
  });
}

export function spriteSheet({
  x = 0,
  y = 0,
  z = 0,
  width,
  height,
  texWidth,
  texHeight,
  numPerRow,
  count,
  texStartXOffset = 0,
  texStartYOffset = 0,
  texWidthStride = texWidth,
  texHeightStride = texHeight,
  reverseX = false,
}) {
  const result = [];
  for (let i = 0; i < count; i++) {
    const row = Math.floor(i / numPerRow);
    const col = i % numPerRow;
    const texStartX = texStartXOffset + col * texWidthStride;
    const texStartY = texStartYOffset + row * texHeightStride;
    result.push(
      flatSprite({
        x,
        y,
        z,
        width,
        height,
        texStartX,
        texEndX: texStartX + texWidth,
        texStartY,
        texEndY: texStartY + texHeight,
        reverseX,
      })
    );
  }
  return result;
}

export function flatSprite({
  x = 0,
  y = 0,
  z = 0,
  width,
  height,
  texStartX,
  texStartY,
  texEndX,
  texEndY,
  reverseX = false,
}) {
  let startX, endX, leftX, rightX;
  if (!reverseX) {
    startX = texStartX;
    endX = texEndX;
    leftX = -x;
    rightX = width - x;
  } else {
    startX = texEndX;
    endX = texStartX;
    leftX = x - width;
    rightX = x;
  }
  // prettier-ignore
  return [
    rightX, y,         -z,   endX,   texEndY,
     leftX, y,         -z, startX,   texEndY,
    rightX, y, height - z,   endX, texStartY,
     leftX, y, height - z, startX, texStartY,
  ];
}

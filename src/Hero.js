import { SpriteSet, Sprite, makeSpriteType, spriteSheet } from "./sprites.js";
import { Texture } from "./swagl.js";
import { HERO_HEIGHT } from "./SpriteData.js";
import { arctan } from "./webgames/math.js";

// The hero's scaling is off, but it is self-consistent
const HERO_PIXELS_PER_METER = 434 / HERO_HEIGHT;

/**
 * @typedef {Object}
 * @property {Sprite} idleSprite
 */
export let HeroResources;

/**
 * The flare shoots out particles, and we want to be precise
 * about how they shoot out each frame
 * @typedef {Object}
 * @property {number} x - The x position (in meters) relative to the hero
 * @property {number} z - The y position (in meters) relative to the hero
 * @property {number} angle - The angle (off the origin, in the x-z plane) of the flare
 */
let FlarePosition;

/**
 * A Map from sprite names to the torch positions for each frame
 * @type {Map<string, Array<FlarePosition>>}
 */
export const flarePositionsMap = new Map();

/**
 * Loads up all the creature resources
 * @param {function(string,string):Promise<Texture>} loadTexture
 * @returns {HeroResources}
 */
export async function loadHeroResources(loadTexture) {
  const [idleTex, walkTex, attackTex] = await Promise.all([
    loadTexture("hero_idle", "assets/Hero Breathing with axe.png"),
    loadTexture("hero_walk", "assets/Hero Walking with axe.png"),
    loadTexture("hero_attack", "assets/Axe Chop.png"),
  ]);

  const idleSprite = makeSpriteType({
    name: "hero_idle",
    set: leftAndRight({
      name: "hero_idle",
      tex: idleTex,
      widthPx: 405,
      heightPx: 434,
      xPx: 220,
      yPx: 434,
      frameCount: 16,
      flareData: [
        { tx: 388, ty: 104, bx: 385, by: 170 },
        { tx: 792, ty: 105, bx: 790, by: 170 },
        { tx: 1198, ty: 105, bx: 1195, by: 169 },
        { tx: 1602, ty: 106, bx: 1600, by: 170 },
        { tx: 2008, ty: 106, bx: 2005, by: 172 },
        { tx: 388, ty: 539, bx: 385, by: 604 },
        { tx: 794, ty: 540, bx: 790, by: 605 },
        { tx: 1196, ty: 539, bx: 1196, by: 604 },
        { tx: 1602, ty: 539, bx: 1602, by: 604 },
        { tx: 2009, ty: 541, bx: 2007, by: 604 },
        { tx: 386, ty: 974, bx: 385, by: 1036 },
        { tx: 792, ty: 972, bx: 790, by: 1033 },
        { tx: 1198, ty: 974, bx: 1196, by: 1038 },
        { tx: 1602, ty: 972, bx: 1601, by: 1036 },
        { tx: 2010, ty: 974, bx: 2005, by: 1044 },
        { tx: 386, ty: 1406, bx: 385, by: 1477 },
      ],
    }),
    modes: ["left", "right"],
    loops: true,
    frameTime: 1 / 12,
  })();

  console.log(flarePositionsMap);

  return { idleSprite };
}

/**
 * Builds a SpriteSet with with right and left modes
 * @param {Object} options - Various named options
 * @param {string} options.name - The name of the sprite
 * @param {Texture} options.tex - The sprite sheet texture to read from
 * @param {number} options.widthPx - The number of pixels wide each frame is
 * @param {number} options.heightPx - The number of pixels high each frame is
 * @param {number} options.xPx - The x position of the character's center of mass
 * @param {number} options.yPx - The character's footing
 * @param {number} options.frameCount - The number of frames
 * @param {Array<{tx: number, ty: number, bx: number, by: number}>} options.flareData - The positions in pixels of the (T)ip and (B)ase of the flare (per frame)
 */
function leftAndRight(options) {
  const { tex, widthPx, heightPx, xPx, yPx, frameCount } = options;

  // assumes things are standard-ly packed, which has been true so far
  const numPerRow = Math.floor(tex.w / widthPx);

  const spriteSheetOptions = {
    x: xPx / HERO_PIXELS_PER_METER,
    z: (heightPx - yPx) / HERO_PIXELS_PER_METER,
    width: widthPx / HERO_PIXELS_PER_METER,
    height: heightPx / HERO_PIXELS_PER_METER,
    texWidth: widthPx / tex.w,
    texHeight: heightPx / tex.h,

    numPerRow,
    count: frameCount,
  };

  const flarePositions = options.flareData.map(({ tx, ty, bx, by }, index) => {
    const row = Math.floor(index / numPerRow);
    const col = index % numPerRow;
    return {
      x: (tx - (col * widthPx + xPx)) / HERO_PIXELS_PER_METER,
      z: (row * heightPx + yPx - ty) / HERO_PIXELS_PER_METER,
      angle: arctan(-(ty - by), tx - bx),
    };
  });

  if (flarePositions.length !== frameCount) {
    throw new Error(
      `flareData length ${flarePositions.length} but expects ${frameCount}`
    );
  }

  flarePositionsMap.set(options.name, flarePositions);

  return new SpriteSet(tex, {
    // prettier-ignore
    "right": spriteSheet(spriteSheetOptions),
    // prettier-ignore
    "left": spriteSheet({ ...spriteSheetOptions, reverseX: true }),
  });
}

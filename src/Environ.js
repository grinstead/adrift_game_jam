import { SpriteSet } from "./sprites.js";
import {
  TEX_PIXELS_PER_METER,
  ROOM_DEPTH_RADIUS,
  ROOM_HEIGHT,
  LAYOUT_TARGETS,
} from "./SpriteData.js";
import { Texture } from "./swagl.js";

/**
 * @typedef {Object} EnvironResources
 * @property {SpriteSet} wallSpriteSet
 */
export let EnvironResources;

/**
 * @typedef {Object} ProjectionData
 * @property {Float32Array} matrix - The projection matrix to apply
 * @property {number} wForeground - The w coordinate of vertices in the foreground
 * @property {number} wBackground - The w coordinate of vertices in the background
 */
export let ProjectionData;

/**
 * Computes the projection (and some data associated with that) necessary to hit our layout targets
 * @param {number} outputWidth The number of pixels wide the game renders as
 * @param {number} outputHeight The number of pixels tall the game renders as
 */
export function buildProjectionData(outputWidth, outputHeight) {
  const roomDepth = 2 * ROOM_DEPTH_RADIUS;

  const layoutMiddleY =
    (LAYOUT_TARGETS.CEIL_FOREGROUND + LAYOUT_TARGETS.FLOOR_FOREGROUND) / 2;
  const clipSpaceY = (layoutTargetY) =>
    (layoutMiddleY - layoutTargetY) / outputHeight;

  // this is the vertical "radius" of the room, in meters
  // const Ry = ROOM_HEIGHT / 2;
  // this is the y position (in clip space) of the middle of the ceiling
  const Ry = clipSpaceY(
    (LAYOUT_TARGETS.CEIL_FOREGROUND + LAYOUT_TARGETS.CEIL_BACKGROUND) / 2
  );

  // this is the value we want for the w coordinate (w1 for the foreground, w2 for the background)
  const w1 = Ry / clipSpaceY(LAYOUT_TARGETS.CEIL_FOREGROUND);
  const w2 = Ry / clipSpaceY(LAYOUT_TARGETS.CEIL_BACKGROUND);

  // the projection matrix will do:
  //   x: represents the x coordinate in clip-space when z = 0
  //   y: represents the y coordinate in clip-space when z = 0
  //   z: -1/2 represents the far foreground, 1/2 represents the far background

  const scaleY = Ry / (ROOM_HEIGHT / 2);
  const scaleX = scaleY * (outputHeight / outputWidth);

  // prettier-ignore
  const matrix = new Float32Array([
    scaleX,      0,             0,                     0,
         0,      0, 1 / roomDepth, (w2 - w1) / roomDepth,
         0, scaleY,             0,                     0,
         0,      0,             0,         (w1 + w2) / 2,
  ]);

  return { matrix, wForeground: w1, wBackground: w2 };
}

/**
 * Loads up all the environment resources (things like walls)
 * @param {ProjectionData} projection,
 * @param {function(string,string):Promise<Texture>} loadTexture
 * @returns {EnvironResources}
 */
export async function loadEnvironResources(projection, loadTexture) {
  const [wallTex, floorTex] = await Promise.all([
    loadTexture("wall", "assets/Back Wall.png"),
    loadTexture("floor", "assets/floor.png"),
  ]);

  const topOfWallTex = 648 / wallTex.h;

  const wallWidth = 20;
  const wallSpriteSet = new SpriteSet(wallTex, {
    // prettier-ignore
    "main": [[
        wallWidth, ROOM_DEPTH_RADIUS, ROOM_HEIGHT, 1, topOfWallTex,
        wallWidth, ROOM_DEPTH_RADIUS, 0, 1, 1,
        0, ROOM_DEPTH_RADIUS, ROOM_HEIGHT, 0, topOfWallTex,
        0, ROOM_DEPTH_RADIUS, 0, 0, 1,
      ]],
  });

  // const floorWidth = (2 * floorTex.w) / TEX_PIXELS_PER_METER;
  // const floorSpriteSet = new SpriteSet(floorTex, {
  //   // prettier-ignore
  //   "main": [[
  //     floorWidth, -ROOM_DEPTH_RADIUS,
  //   ]]
  // })

  return { wallSpriteSet };
}

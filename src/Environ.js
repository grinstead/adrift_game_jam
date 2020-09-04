import { SpriteSet } from "./sprites";
import {
  TEX_PIXELS_PER_METER,
  ROOM_DEPTH_RADIUS,
  ROOM_HEIGHT,
} from "./SpriteData";

/**
 * @typedef {Object}
 * @property {SpriteSet} wallSpriteSet
 */
export let EnvironResources;

/**
 * Loads up all the environment resources (things like walls)
 * @param {function(string,string):Promise<Texture>} loadTexture
 * @returns {EnvironResources}
 */
export async function loadEnvironResources(loadTexture) {
  const [wallTex, floorTex] = await Promise.all([
    loadTexture("wall", "assets/Back Wall.png"),
    loadTexture("floor", "assets/floor.png"),
  ]);

  const wallWidth = wallTex.w / TEX_PIXELS_PER_METER;
  const topOfWallTex = 0.5;
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

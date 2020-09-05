import { SpriteSet, flatSprite } from "./sprites.js";
import {
  ROOM_DEPTH_RADIUS,
  ROOM_HEIGHT,
  LAYOUT_TARGETS,
} from "./SpriteData.js";
import { Texture } from "./swagl.js";

/**
 * @typedef {Object} ProjectionData
 * @property {Float32Array} matrix - The projection matrix to apply
 * @property {number} wForeground - The w coordinate of vertices in the foreground
 * @property {number} wBackground - The w coordinate of vertices in the background
 * @property {number} scaleY - The ratio between z coordinates in clip space to y coordinates in meters
 * @property {number} scaleX - The ratio between x coordinates in clip space to x coordinates in meters
 * @property {number} lipHeight - The height in meters of the floor and ceiling lips
 * @property {number} lipWidth - The width in meters of the wall lips
 */
export let ProjectionData;

/**
 * @typedef {Object} EnvironResources
 * @property {Texture} wallTex
 * @property {Texture} floorTex
 * @property {Texture} ceilTex
 * @property {Texture} sideTex
 * @property {SpriteSet} ladderSprite
 * @property {ProjectionData} projection
 */
export let EnvironResources;

/**
 * @typedef {Object} EnvironRoomSprites
 * @property {SpriteSet} wallSpriteSet
 * @property {SpriteSet} floorSpriteSet
 * @property {SpriteSet} ceilSpriteSet
 * @property {SpriteSet} sideSpriteSet
 */
export let EnvironRoomSprites;

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

  return {
    matrix,
    wForeground: w1,
    wBackground: w2,
    scaleX,
    scaleY,
    lipHeight:
      (clipSpaceY(LAYOUT_TARGETS.CEIL_LIP) * w1) / scaleY - ROOM_HEIGHT / 2,
    lipWidth: 0.3, // made up
  };
}

/**
 * Loads up all the environment resources (things like walls)
 * @param {ProjectionData} projection,
 * @param {function(string,string):Promise<Texture>} loadTexture
 * @returns {EnvironResources}
 */
export async function loadEnvironResources(projection, loadTexture) {
  const [ladderTex, wallTex, floorTex, ceilTex, sideTex] = await Promise.all([
    loadTexture("ladder", "assets/ladder.png"),
    loadTexture("wall", "assets/Back Wall.png"),
    loadTexture("floor", "assets/floor.png"),
    loadTexture("ceiling", "assets/ceiling.png"),
    loadTexture("wall", "assets/side_wall.png"),
  ]);

  const ladderWidth = (ladderTex.w * ROOM_HEIGHT) / ladderTex.h;
  const ladderSprite = new SpriteSet(ladderTex, {
    // prettier-ignore
    "main": [flatSprite({
      x: ladderWidth / 2,
      y: -ROOM_DEPTH_RADIUS,
      width: ladderWidth,
      height: ROOM_HEIGHT,
      texStartX: 0,
      texStartY: .5,
      texEndX: 1,
      texEndY: 1,
    })],
  });

  return { projection, wallTex, floorTex, ceilTex, sideTex, ladderSprite };
}

/**
 * Builds up some sprite data for the room
 * @param {EnvironResources} resources
 * @param {number} roomWidth The width of the room (in meters)
 * @param {number} roomOriginX The x-coordinate (in meters, from the left-most portion of the room) the sprites will be drawn
 * @returns {EnvironRoomSprites}
 */
export function makeRoomSprites(
  { wallTex, floorTex, ceilTex, sideTex, projection },
  roomWidth,
  roomOriginX
) {
  const roomLeft = -roomOriginX - projection.lipWidth;
  const roomRight = 2 * projection.lipWidth + roomLeft + roomWidth;

  const wallTopY = 494 / wallTex.h;
  const wallBottomY = 1016 / wallTex.h;
  const wallHeightPercent = wallBottomY - wallTopY;
  const rightWallTex =
    (((wallHeightPercent * wallTex.h) / ROOM_HEIGHT) * roomWidth) / wallTex.w;

  const wallSpriteSet = new SpriteSet(wallTex, {
    // prettier-ignore
    "main": [[
        roomRight, ROOM_DEPTH_RADIUS, ROOM_HEIGHT, rightWallTex, wallTopY,
        roomRight, ROOM_DEPTH_RADIUS, 0, rightWallTex, wallBottomY,
        roomLeft, ROOM_DEPTH_RADIUS, ROOM_HEIGHT, 0, wallTopY,
        roomLeft, ROOM_DEPTH_RADIUS, 0, 0, wallBottomY,
      ]],
  });

  const floorBackground = 110 / floorTex.h;
  const floorForeground = 220 / floorTex.h;
  const rightFloorTex =
    ((((floorForeground - floorBackground) * floorTex.h) /
      (2 * ROOM_DEPTH_RADIUS)) *
      roomWidth) /
    floorTex.w;

  const floorSpriteSet = new SpriteSet(floorTex, {
    // prettier-ignore
    "main": [[
      roomRight, -ROOM_DEPTH_RADIUS, -projection.lipHeight, rightFloorTex, 1,
      roomLeft, -ROOM_DEPTH_RADIUS, -projection.lipHeight, 0, 1,
      roomRight, -ROOM_DEPTH_RADIUS, 0, rightFloorTex, floorForeground,
      roomLeft, -ROOM_DEPTH_RADIUS, 0, 0, floorForeground,
      roomRight, ROOM_DEPTH_RADIUS, 0, rightFloorTex, floorBackground,
      roomLeft, ROOM_DEPTH_RADIUS, 0, 0, floorBackground,
    ]],
  });

  const ceilBackground = 144 / ceilTex.h;
  const ceilForeground = 32 / ceilTex.h;
  const rightCeilTex =
    ((((ceilForeground - ceilBackground) * ceilTex.h) /
      (2 * ROOM_DEPTH_RADIUS)) *
      roomWidth) /
    ceilTex.w;

  const ceilSpriteSet = new SpriteSet(ceilTex, {
    // prettier-ignore
    "main": [[
      roomRight, -ROOM_DEPTH_RADIUS, ROOM_HEIGHT + projection.lipHeight, rightCeilTex, 0,
      roomLeft, -ROOM_DEPTH_RADIUS, ROOM_HEIGHT + projection.lipHeight, 0, 0,
      roomRight, -ROOM_DEPTH_RADIUS, ROOM_HEIGHT, rightCeilTex, ceilForeground,
      roomLeft, -ROOM_DEPTH_RADIUS, ROOM_HEIGHT, 0, ceilForeground,
      roomRight, ROOM_DEPTH_RADIUS, ROOM_HEIGHT, rightCeilTex, ceilBackground,
      roomLeft, ROOM_DEPTH_RADIUS, ROOM_HEIGHT, 0, ceilBackground,
    ]],
  });

  const sideLipX = 438 / sideTex.w;
  const sideForegroundX = 318 / sideTex.w;
  const sideForegroundHighY = 194 / sideTex.h;
  const sideForegroundLowY = 1164 / sideTex.h;
  const sideBackgroundX = 84 / sideTex.w;
  const sideBackgroundHighY = 414 / sideTex.h;
  const sideBackgroundLowY = 964 / sideTex.h;
  // prettier-ignore
  const sideLeftData = [
    roomLeft, -ROOM_DEPTH_RADIUS, ROOM_HEIGHT, sideLipX, sideForegroundHighY,
    roomLeft, -ROOM_DEPTH_RADIUS, 0, sideLipX, sideForegroundLowY,
    roomLeft + projection.lipWidth, -ROOM_DEPTH_RADIUS, ROOM_HEIGHT, sideForegroundX, sideForegroundHighY,
    roomLeft + projection.lipWidth, -ROOM_DEPTH_RADIUS, 0, sideForegroundX, sideForegroundLowY,
    roomLeft + projection.lipWidth, ROOM_DEPTH_RADIUS, ROOM_HEIGHT, sideBackgroundX, sideBackgroundHighY,
    roomLeft + projection.lipWidth, ROOM_DEPTH_RADIUS, 0, sideBackgroundX, sideBackgroundLowY,
  ];
  const sideRightData = [];
  for (let i = 0; i < sideLeftData.length; i += 5) {
    const x = sideLeftData[i + 0];
    const y = sideLeftData[i + 1];
    const z = sideLeftData[i + 2];
    const texX = sideLeftData[i + 3];
    const texY = sideLeftData[i + 4];
    sideRightData.push(roomRight + (roomLeft - x), y, z, texX, texY);
  }

  const sideSpriteSet = new SpriteSet(sideTex, {
    // prettier-ignore
    "right": [sideRightData],
    // prettier-ignore
    "left": [sideLeftData],
  });

  return { wallSpriteSet, floorSpriteSet, ceilSpriteSet, sideSpriteSet };
}

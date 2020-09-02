import { TEX_PIXELS_PER_METER, TENTACLE_FRAMES } from "./SpriteData.js";
import { SpriteSet, spriteSheet, flatSprite } from "./sprites.js";
import { Texture, Program } from "./swagl.js";
import { Room } from "./Scene.js";

const CREATURE_RADIUS_PIXELS = 54;
const CREATURE_IDLE_FRAMES = 6;
const CREATURE_RADIUS = CREATURE_RADIUS_PIXELS / TEX_PIXELS_PER_METER;

/**
 * @typedef {Object}
 * @property {number} bodyX
 * @property {number} bodyY
 * @property {number} placementX
 * @property {number} placementY
 * @property {number} placementZ
 */
let Tentacle;

/**
 * @typedef {Object}
 * @property {SpriteSet} creatureSprite
 * @property {SpriteSet} tentacleSprite
 */
export let CreatureResources;

/**
 * Loads up all the creature resources
 * @param {function(string,string):Promise<Texture>} loadTexture
 * @returns {CreatureResources}
 */
export async function loadCreatureResources(loadTexture) {
  const [creatureTex, tentacleTex] = await Promise.all([
    loadTexture("creature", "assets/Enemy.png"),
    loadTexture("tentacle", "assets/Tentacle.png"),
  ]);

  const creatureSprite = new SpriteSet(creatureTex, {
    // prettier-ignore
    "blink": spriteSheet({
      x: CREATURE_RADIUS,
      z: CREATURE_RADIUS,
      width: 2 * CREATURE_RADIUS,
      height: 2 * CREATURE_RADIUS,
      texWidth: (2 * CREATURE_RADIUS_PIXELS) / creatureTex.w,
      texHeight: (2 * CREATURE_RADIUS_PIXELS) / creatureTex.h,
      numPerRow: 2,
      count: CREATURE_IDLE_FRAMES,
    }),
  });

  const tentacleFrames = [];
  const tentacleFramesPerRow = 5;

  // basically arbitrary, measured in pixels
  const tipPoint = { x: 0, y: 48 };
  const basePoint = { x: 92, y: 26 };

  // we are going to project onto the tip to base axis
  const basis = { x: basePoint.x - tipPoint.x, y: basePoint.y - tipPoint.y };
  const unitMag = Math.sqrt(basis.x * basis.x + basis.y * basis.y);
  basis.x /= unitMag;
  basis.y /= unitMag;

  const tentacleFrameW = 100;
  const tentacleFrameH = 77;
  for (let i = 0; i < TENTACLE_FRAMES; i++) {
    const col = i % tentacleFramesPerRow;
    const row = Math.floor(i / tentacleFramesPerRow);

    const points = [];
    const addProjectedPoint = (rawX, rawY) => {
      const x = rawX * tentacleFrameW - tipPoint.x;
      const y = rawY * tentacleFrameH - tipPoint.y;

      // we divide by 2 for the perpendicular value just to think the tentacles a bit
      points.push(
        (x * basis.x + y * basis.y) / unitMag,
        rawX, // should be 1 for the base points
        (x * -basis.y + y * basis.x) / TEX_PIXELS_PER_METER / 2,
        (tentacleFrameW * (col + rawX)) / tentacleTex.w,
        (tentacleFrameH * (row + rawY)) / tentacleTex.h
      );
    };

    addProjectedPoint(1, 1);
    addProjectedPoint(0, 1);
    addProjectedPoint(1, 0);
    addProjectedPoint(0, 0);
    tentacleFrames.push(points);
  }

  const tentacleSprite = new SpriteSet(tentacleTex, {
    // prettier-ignore
    "wiggle": tentacleFrames,
  });

  return { creatureSprite, tentacleSprite };
}

/**
 * Represents one of the dark spawns
 * @property {number} x
 * @property {number} y
 * @property {number} z
 * @property {Array<Tentacle>} tentacles
 */
export class Creature {
  constructor(x, y, z) {
    this.startX = x;
    this.x = x;
    this.y = y;
    this.z = z;
    this.tentacles = [
      {
        bodyX: -0.05,
        bodyY: 0.01,
        placementX: x - 0.2,
        placementY: 0.1,
        placementZ: 0,
        frameOffset: 0,
      },
      {
        bodyX: 0.05,
        bodyY: 0.01,
        placementX: x + 0.2,
        placementY: 0.1,
        placementZ: 0,
        frameOffset: 3,
      },
      {
        bodyX: -0.05,
        bodyY: -0.01,
        placementX: x - 0.2,
        placementY: -0.1,
        placementZ: 0,
        frameOffset: 7,
      },
      {
        bodyX: 0.05,
        bodyY: -0.01,
        placementX: x + 0.2,
        placementY: -0.1,
        placementZ: 0,
        frameOffset: 13,
      },
    ];
  }
}

/**
 * Adds a creature to the room
 * @param {Room} room
 * @param {number} x
 */
export function spawnCreature(room, x) {
  room.creatures.push(new Creature(x, 0, 0.4));
}

/**
 * Moves all the creatures in the room around
 * @param {Room} room
 */
export function processCreatures(room) {
  const roomTime = room.roomTime;
  room.creatures.forEach((creature) => {
    creature.x = creature.startX + 0.5 * Math.sin(roomTime);
  });
}

/**
 * Renders all the creatures, assumes the camera is at the origin
 * @param {WebGL2RenderingContext} gl
 * @param {Program} program
 * @param {Room} room
 */
export function renderCreatures(gl, program, room) {
  const stack = program.stack;

  const { creatureSprite, tentacleSprite } = room.resources.creature;

  const roomTime = room.roomTime;

  creatureSprite.bindTo(program);
  room.creatures.forEach((creature) => {
    stack.pushTranslation(creature.x, creature.y, creature.z);
    const maybeFrame =
      Math.floor(8 * roomTime) % (CREATURE_IDLE_FRAMES + 8 * 4);
    creatureSprite.renderSpriteDatumPrebound(
      "blink",
      maybeFrame < CREATURE_IDLE_FRAMES ? maybeFrame : 0
    );
    stack.pop();
  });

  tentacleSprite.bindTo(program);
  room.creatures.forEach((creature) => {
    const attachZ = creature.z - 0.08;

    creature.tentacles.forEach((tentacle) => {
      const attachX = creature.x + tentacle.bodyX;
      const attachY = creature.y + tentacle.bodyY;

      const dX = attachX - tentacle.placementX;
      const dY = attachY - tentacle.placementY;
      const dZ = attachZ - tentacle.placementZ;
      const mag = Math.sqrt(dX * dX + dY * dY + dZ * dZ);

      stack.pushTranslation(
        tentacle.placementX,
        tentacle.placementY,
        tentacle.placementZ
      );
      stack.pushYRotation(arctan(dZ, dX));

      // prettier-ignore
      stack.push(
        new Float32Array([
          mag,  0, 0, 0,
            0, dY, 0, 0,
            0,  0, 1, 0,
            0,  0, 0, 1
        ])
      );

      tentacleSprite.renderSpriteDatumPrebound(
        "wiggle",
        Math.abs(
          ((Math.floor(24 * roomTime) + tentacle.frameOffset) %
            (2 * TENTACLE_FRAMES - 1)) +
            1 -
            TENTACLE_FRAMES
        )
      );

      stack.pop();
      stack.pop();
      stack.pop();
    });
  });
}

function arctan(opposite, adjacent) {
  if (adjacent > 0) {
    return Math.atan(opposite / adjacent);
  } else if (adjacent === 0) {
    if (opposite > 0) {
      return Math.PI / 2;
    } else if (opposite === 0) {
      return 0; // dunno what is best here
    } else {
      return -Math.PI / 2;
    }
  } else {
    return Math.atan(opposite / adjacent) + Math.PI;
  }
}

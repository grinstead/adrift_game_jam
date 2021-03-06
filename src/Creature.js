import {
  TEX_PIXELS_PER_METER,
  TENTACLE_FRAMES,
  HERO_HEIGHT,
  ROOM_DEPTH_RADIUS,
} from "./SpriteData.js";
import {
  SpriteSet,
  spriteSheet,
  Sprite,
  makeSpriteType,
  SpriteBuilder,
  characterSpriteSheet,
} from "./sprites.js";
import { Texture, Program } from "./swagl.js";
import { Room } from "./Scene.js";
import { arctan } from "./webgames/math.js";

const CREATURE_RADIUS_PIXELS = 54;
const CREATURE_IDLE_FRAMES = 6;
const CREATURE_RADIUS = 0.25; // CREATURE_RADIUS_PIXELS / TEX_PIXELS_PER_METER;

const CREATURE_SPEED = 0.01;
const CREATURE_BONUS_SPEED = 0.02;
const CREATURE_HUNTING_DISTANCE = 4;
const CREATURE_ATTACK_DISTANCE = 0.5;

const STEP_TIME = 1 / 8;
const ATTACH_Z_OFFSET = CREATURE_RADIUS * (3 / 4);

/**
 * @typedef {Object} Tentacle
 * @property {number} bodyX
 * @property {number} bodyY
 * @property {number} placementX
 * @property {number} placementY
 * @property {number} placementZ
 */
let Tentacle;

/**
 * @typedef {Object} CreatureResources
 * @property {SpriteSet} tentacleSprite
 * @property {SpriteBuilder} makeCreatureSprite
 * @property {SpriteBuilder} makeCreatureAttackSprite
 * @property {AudioBuffer} enemyDyingSound
 * @property {AudioBuffer} enemyScreamSound
 * @property {AudioBuffer} enemyNoticeSound
 * @property {SpriteBuilder} makeCreatureDeathSprite
 */
export let CreatureResources;

/**
 * All the states that the hero can be in
 * @typedef {Object} CreatureState
 * @property {string} name - Useful for debugging
 * @property {function(Room):void} processStep - Perform the hero's code
 * @property {function(WebGL2RenderingContext,Program,{x:number,y:number,z:number}):void} render - Render the hero
 * @property {?function():void} onExit
 */
let CreatureState;

// prettier-ignore
const mirrorX = new Float32Array([
  -1, 0, 0, 0,
  0, 1, 0, 0,
  0, 0, 1, 0,
  0, 0, 0, 1,
]);

/**
 * Loads up all the creature resources
 * @param {function(string,string):Promise<Texture>} loadTexture
 * @returns {CreatureResources}
 */
export async function loadCreatureResources(loadTexture, loadSound) {
  const [
    creatureTex,
    tentacleTex,
    creatureAttackTex,
    enemyDyingSound,
    enemyScreamSound,
    enemyNoticeSound,
    creatureDeathTex,
  ] = await Promise.all([
    loadTexture("creature", "assets/Enemy.png"),
    loadTexture("tentacle", "assets/Tentacle.png"),
    loadTexture("creature_attack", "assets/enemy_bite.png"),
    loadSound("assets/Enemy Dying.mp3"),
    loadSound("assets/enemy_scream.mp3"),
    loadSound("assets/Enemy Notices You.mp3"),
    loadTexture("creature_death", "assets/Enemy Dying.png"),
  ]);

  const creatureSpriteSet = new SpriteSet(creatureTex, {
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
      reverseX: true,
    }),
  });

  // 260x520
  const makeCreatureAttackSprite = makeSpriteType({
    name: "creature_attack",
    set: new SpriteSet(creatureAttackTex, {
      // prettier-ignore
      "bite": spriteSheet({
        x: 2 * CREATURE_RADIUS,
        z: 3 * CREATURE_RADIUS,
        width: 4 * CREATURE_RADIUS,
        height: 8 * CREATURE_RADIUS,
        texHeight: 530 / creatureAttackTex.h,
        texWidth: 278 / creatureAttackTex.w,
        numPerRow: 7,
        count: 42,
        reverseX: true,
      }),
    }),
    modes: ["bite"],
    loops: false,
    frameTime: 1 / 12,
  });

  const makeCreatureDeathSprite = makeSpriteType({
    name: "creature_death",
    set: new SpriteSet(creatureDeathTex, {
      // prettier-ignore
      "left": spriteSheet({
        x: 330 / (460 / HERO_HEIGHT),
        y: ROOM_DEPTH_RADIUS / 2,
        z: 0,
        width: 660 / (460 / HERO_HEIGHT),
        height: HERO_HEIGHT,
        texWidth: 660 / creatureDeathTex.w,
        texHeight: 500 / creatureDeathTex.h,
        numPerRow: 3,
        count: 12,
      }),
      // prettier-ignore
      "right": spriteSheet({
        x: 330 / (450 / HERO_HEIGHT),
        y: ROOM_DEPTH_RADIUS / 2,
        z: 0,
        width: 660 / (450 / HERO_HEIGHT),
        height: HERO_HEIGHT,
        texWidth: 660 / creatureDeathTex.w,
        texHeight: 500 / creatureDeathTex.h,
        numPerRow: 3,
        count: 12,
        reverseX: true,
      }),
    }),
    modes: ["left", "right"],
    loops: false,
    frameTime: 1 / 8,
  });

  const frameTimes = new Array(CREATURE_IDLE_FRAMES).fill(1 / 8);
  frameTimes[0] = 4; // make the character stare for 4s before blinking

  const makeCreatureSprite = makeSpriteType({
    name: "creature_normal",
    set: creatureSpriteSet,
    modes: ["blink"],
    loops: true,
    frameTime: frameTimes,
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
        (x * -basis.y + y * basis.x) / TEX_PIXELS_PER_METER,
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

  return {
    makeCreatureSprite,
    makeCreatureAttackSprite,
    makeCreatureDeathSprite,
    tentacleSprite,
    enemyDyingSound,
    enemyScreamSound,
    enemyNoticeSound,
  };
}

function makeDefaultCreatureSprite(room) {
  return room.resources.creature.makeCreatureSprite("blink", room.roomTime);
}

/**
 * Represents one of the dark spawns
 */
export class Creature {
  constructor(room, x, y, heightOffGround) {
    const sprite = makeDefaultCreatureSprite(room);
    const roomBottom = room.roomBottom;

    /** @private {Sprite} Set it back to this to keep consistent blinking */
    this.defaultSprite = sprite;
    /** @private {number} */
    this.startX = x;
    /** @private {number} */
    this.x = x;
    /** @private {number} */
    this.y = y;
    /** @private {number} */
    this.z = heightOffGround;
    /** @private {number} Used just to adjust tentacles */
    this.speed = 0;
    /** @private {number} */
    this.nextTentacleMove = 0;
    /** @private {number} */
    this.nextTentacleIndex = 0;
    /** @private {Array<Tentacle>} */
    this.tentacles = [
      makeTentacle(0, x, y, -1, 1, roomBottom),
      makeTentacle(1, x, y, -1, -1, roomBottom),
      makeTentacle(2, x, y, 1, 1, roomBottom),
      makeTentacle(3, x, y, 1, -1, roomBottom),
    ];
    /** @private {Sprite} */
    this.sprite = sprite;
    /** @type {CreatureState} */
    this.state = creatureStateNormal(this, room);
  }

  /**
   * Changes the creature's state. Assumed to be done during a processStep call.
   * This will invoke processStep immediately on the new step
   * @param {Room} room - The current room
   * @param {function(Creature,Room):CreatureState} stateBuilder - The thing that
   * returns the new creature state
   */
  changeState(room, stateBuilder) {
    const oldStateOnExit = this.state.onExit;
    if (oldStateOnExit) oldStateOnExit();

    const state = stateBuilder(this, room);
    this.state = state;
    state.processStep(room);
  }

  setSprite(makeSprite, time, mode) {
    this.sprite = makeSprite(mode, time);
  }

  adjustTentacles(room) {
    const tentacles = this.tentacles;
    if (tentacles.length === 0) return; // on death

    const speedX = this.speed;
    const roomTime = room.roomTime;
    if (roomTime > this.nextTentacleMove) {
      let index = this.nextTentacleIndex;
      this.nextTentacleIndex = (index + 1) % tentacles.length;
      const toPlace = tentacles[index];

      const placementX = this.x + (STEP_TIME + 0.1) * speedX + toPlace.idealX;
      if (Math.abs(placementX - toPlace.placementX) > 0.05) {
        this.nextTentacleMove = roomTime + STEP_TIME;
        toPlace.movingUntil = roomTime + STEP_TIME;
        toPlace.moveStartX = toPlace.placementX;
        toPlace.moveStartY = toPlace.placementY;
        toPlace.moveStartZ = toPlace.placementZ;
        toPlace.placementX = placementX;
        toPlace.placementY = this.y + toPlace.idealY;
        toPlace.placementZ = room.roomBottom;
      }
    }
  }
}

/**
 * @param {Creature} creature
 * @param {Room} room
 */
function distanceFromHero(creature, room) {
  return Math.abs(creature.x - room.hero.heroX);
}

/**
 * @param {Creature} creature
 * @param {Room} room
 */
function creatureStateNormal(creature, room) {
  creature.sprite = creature.defaultSprite;

  return {
    name: "creature_normal",
    processStep: () => {
      const heroDistance = distanceFromHero(creature, room);
      if (heroDistance < CREATURE_HUNTING_DISTANCE) {
        // Hero got too close, hunting time!
        if (heroDistance < CREATURE_ATTACK_DISTANCE) {
          // Oh my, already close enough to hurt him
          creature.changeState(room, creatureStateAttack);
        } else {
          creature.changeState(room, creatureStateHunting);
        }
      }
    },
    render: (gl, program, heroPoint) => {
      const stack = program.stack;
      const x = creature.x;
      const z = creature.z;

      stack.pushTranslation(x, creature.y, z);

      let needsMirror = heroPoint.x < x;
      if (needsMirror) {
        stack.push(mirrorX);
      }
      creature.sprite.renderSprite(program);
      if (needsMirror) stack.pop();
      stack.pop();
    },
  };
}

function getCreatureSpeed(room, start) {
  const currentTime = room.roomTime;
  // Speed up over 3 seconds until reach its max speed
  return (
    CREATURE_SPEED +
    Math.min(1, (currentTime - start) / 3) * CREATURE_BONUS_SPEED
  );
}

/**
 * @param {Creature} creature
 * @param {Room} room
 */
function creatureStateHunting(creature, room) {
  const startedAt = room.roomTime;
  room.audio.playSound(creature, room.resources.creature.enemyNoticeSound);
  creature.sprite = creature.defaultSprite;

  return {
    name: "creature_hunting",
    processStep: () => {
      const roomTime = room.roomTime;
      const heroX = room.hero.heroX;
      const heroDistance = distanceFromHero(creature, room);

      if (heroDistance > CREATURE_ATTACK_DISTANCE / 2) {
        const speed =
          (heroX < creature.x ? -1 : 1) * getCreatureSpeed(room, startedAt);
        creature.speed = speed;
        creature.x += speed;
      }

      if (heroDistance < CREATURE_ATTACK_DISTANCE && roomTime - startedAt > 1) {
        // Time to make someone bleed
        creature.changeState(room, creatureStateAttack);
      }
    },
    render: (gl, program, heroPoint) => {
      const stack = program.stack;
      const x = creature.x;
      const z = creature.z;

      stack.pushTranslation(x, creature.y, z);

      let needsMirror = heroPoint.x < x;
      let angle = arctan(heroPoint.z - z, heroPoint.x - x);
      if (needsMirror) {
        stack.push(mirrorX);
        angle = Math.PI - angle;
      }

      stack.pushYRotation(angle);
      creature.sprite.renderSprite(program);
      stack.pop();
      if (needsMirror) stack.pop();
      stack.pop();
    },
  };
}

/**
 * @param {Creature} creature
 * @param {Room} room
 */
function creatureStateAttack(creature, room) {
  // room.audio.playSound(creature, room.resources.creature.enemyDyingSound);
  const sprite = room.resources.creature.makeCreatureAttackSprite(
    "bite",
    room.roomTime
  );
  creature.sprite = sprite;

  room.audio.playSound(creature, room.resources.creature.enemyScreamSound);
  let facingLeft = false;

  return {
    name: "creature_attack",
    processStep: () => {
      const frameIndex = sprite.frameIndex();
      if (frameIndex <= 10) {
        facingLeft = room.hero.heroX < creature.x;
      } else if (frameIndex < 15) {
        const heroDistance = distanceFromHero(creature, room);

        // TODO not sure how much space to give for the hero to avoid the attack
        // if (heroDistance < 1) {
        //   room.heroDead = true;
        // }
      } else if (sprite.isFinished()) {
        // Back to hunting
        creature.changeState(room, creatureStateHunting);
      }
    },
    render: (gl, program, heroPoint) => {
      const stack = program.stack;
      const x = creature.x;
      const z = creature.z;

      stack.pushTranslation(x, creature.y, z);

      let needsMirror = facingLeft;
      if (needsMirror) {
        stack.push(mirrorX);
      }

      creature.sprite.renderSprite(program);
      // stack.pop();
      if (needsMirror) stack.pop();
      stack.pop();
    },
  };
}

export function deathByAxe(creature, room) {
  if (creature.state.name !== "creature_death") {
    creature.changeState(room, creatureStateDeathByAxe);
  }
}

/**
 * @param {Creature} creature
 * @param {Room} room
 */
function creatureStateDeathByAxe(creature, room) {
  room.audio.playSound(creature, room.resources.creature.enemyDyingSound);
  const sprite = room.resources.creature.makeCreatureDeathSprite(
    room.hero.heroX < creature.x ? "left" : "right",
    room.roomTime
  );
  creature.sprite = sprite;

  return {
    name: "creature_death",
    processStep: () => {
      if (sprite.frameIndex() > 1 && creature.tentacles.length) {
        creature.tentacles = [];
      }

      if (sprite.isFinished()) {
        room.creatures.splice(room.creatures.indexOf(creature), 1);
      }
    },
    render: (gl, program) => {
      const stack = program.stack;
      stack.pushTranslation(creature.x, creature.y, room.roomBottom);
      sprite.renderSprite(program);
      stack.pop();
    },
  };
}

/**
 * Adds a creature to the room
 * @param {Room} room
 * @param {number} x
 */
export function spawnCreature(room, x) {
  room.creatures.push(
    new Creature(
      room,
      x,
      0,
      room.roomBottom +
        2 * CREATURE_RADIUS +
        Math.random() * 2 * CREATURE_RADIUS
    )
  );
}
/**
 * Moves all the creatures in the room around
 * @param {Room} room
 */
export function processCreatures(room) {
  const roomTime = room.roomTime;
  room.creatures.forEach((creature) => {
    creature.sprite.updateTime(roomTime);
    creature.state.processStep(room);
    creature.adjustTentacles(room);
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

  const { tentacleSprite } = room.resources.creature;

  const roomTime = room.roomTime;
  const heroPoint = room.hero.getGoodFocusPoint();

  room.creatures.forEach((creature) => {
    creature.state.render(gl, program, heroPoint);
  });

  tentacleSprite.bindTo(program);
  room.creatures.forEach((creature) => {
    const attachZ = creature.z - ATTACH_Z_OFFSET;

    creature.tentacles.forEach((tentacle) => {
      const attachX = creature.x + tentacle.bodyX;
      const attachY = creature.y + tentacle.bodyY;

      let placementX = tentacle.placementX;
      let placementY = tentacle.placementY;
      let placementZ = tentacle.placementZ;

      const movingUntil = tentacle.movingUntil;
      if (roomTime < movingUntil) {
        const percent = 1 - (movingUntil - roomTime) / STEP_TIME;
        placementX = bezier(percent, tentacle.moveStartX, attachX, placementX);
        placementY = bezier(percent, tentacle.moveStartY, attachY, placementY);
        placementZ = bezier(percent, tentacle.moveStartZ, attachZ, placementZ);
      }

      const dX = attachX - placementX;
      const dY = attachY - placementY;
      const dZ = attachZ - placementZ;
      const mag = Math.sqrt(dX * dX + dY * dY + dZ * dZ);

      stack.pushTranslation(placementX, placementY, placementZ);
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
          ((Math.floor((24 * Date.now()) / 1000) + tentacle.frameOffset) %
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

function makeTentacle(index, x, y, xSign, ySign, roomBottom) {
  const idealX = 0.4 * xSign;
  const idealY = 0.1 * ySign;
  const placementX = x + idealX;
  const placementY = y + idealY;
  return {
    index,
    bodyX: xSign * 0.05,
    bodyY: 0,
    idealX,
    idealY,
    movingUntil: 0,
    moveStartX: placementX,
    moveStartY: placementY,
    moveStartZ: roomBottom,
    placementX,
    placementY,
    placementZ: roomBottom,
    frameOffset: 0,
  };
}

function bezier(percent, v1, v2, v3) {
  let v12 = percent * v2 + (1 - percent) * v1;
  let v23 = percent * v3 + (1 - percent) * v2;
  return percent * v23 + (1 - percent) * v12;
}

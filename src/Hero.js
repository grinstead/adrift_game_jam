import {
  SpriteSet,
  Sprite,
  makeSpriteType,
  spriteSheet,
  SpriteBuilder,
} from "./sprites.js";
import { Texture, Program } from "./swagl.js";
import { HERO_HEIGHT, ROOM_DEPTH_RADIUS, LADDER_Y } from "./SpriteData.js";
import { arctan } from "./webgames/math.js";
import { Room, Transition } from "./Scene.js";
import { deathByAxe } from "./Creature.js";
import { LightSwitch, Hatch, Ladder } from "./Interactables.js";

// The hero's scaling is off, but it is self-consistent
const HERO_PIXELS_PER_METER = 434 / HERO_HEIGHT;

const charWInM = 1;

/**
 * @typedef {Object} HeroResources
 * @property {SpriteBuilder} makeIdleSprite
 * @property {SpriteBuilder} makeWalkSprite
 * @property {SpriteBuilder} makeAttackSprite
 * @property {SpriteBuilder} makeClimbingSprite
 * @property {SpriteBuilder} makeDescendingSprite
 * @property {SpriteBuilder} makeEnterHatchSprite
 * @property {SpriteBuilder} makeExitHatchSprite
 * @property {SpriteBuilder} makeSwitchFlipSprite
 * @property {Array<AudioBuffer>} grunts
 * @property {AudioBuffer} footSteps
 * @property {AudioBuffer} lightSwitchSound
 * @property {Array<AudioBuffer>} heroDeadSounds
 */
export let HeroResources;

/**
 * The flare shoots out particles, and we want to be precise
 * about how they shoot out each frame
 * @typedef {Object} FlarePosition
 * @property {number} x - The x position (in meters) relative to the hero
 * @property {number} z - The y position (in meters) relative to the hero
 * @property {number} angle - The angle (off the origin, in the x-z plane) of the flare
 */
let FlarePosition;

/**
 * All the states that the hero can be in
 * @typedef {Object} HeroState
 * @property {string} name - Useful for debugging
 * @property {function(Room):void} processStep - Perform the hero's code
 * @property {?function(WebGL2RenderingContext,Program):void} render - Render the hero
 * @property {?function():void} onExit
 */
let HeroState;

export class Hero {
  /**
   * @param {HeroResources} resources
   * @param {number} x
   * @param {number} z
   */
  constructor(resources, x, z) {
    /** @type {number} The x position of the hero */
    this.heroX = x;
    /** @type {number} The z position of the hero's feet */
    this.heroY = 0;
    /** @type {number} The z position of the hero's feet */
    this.heroZ = z;
    /** @type {number} -1 if the hero is facing left, 1 if the hero is facing right */
    this.signX = 1;
    /** @type {number} The character's speed (in meters per second) in the x-direction */
    this.speedX = 0;
    /** @private {Sprite} The active sprite */
    this.sprite = resources.makeIdleSprite("right", 0);
    /** @private {HeroState} The hero's active state */
    this.state = {
      name: "unstarted",
      processStep: (room) => this.changeState(room, heroStateNormal),
      render: () => {
        throw new Error("Hero did not get processed before rendering!");
      },
    };
  }

  /** Enemies will stare at this point, very intimidating! */
  getGoodFocusPoint() {
    return { x: this.heroX, z: this.heroZ + HERO_HEIGHT - 0.1 };
  }

  /** @returns {boolean} */
  isFacingLeft() {
    return this.signX === -1;
  }

  directionMode() {
    return this.signX === -1 ? "left" : "right";
  }

  /** @returns {?FlarePosition} */
  flarePosition() {
    const data = this.sprite.frameData();
    return data ? data.flare : null;
  }

  /**
   * @param {number} speedX
   */
  setSpeedX(speedX) {
    this.speedX = speedX;
    if (speedX !== 0) this.signX = Math.sign(speedX);
  }

  /**
   * Sets the sprite on the hero
   * @param {SpriteBuilder} makeSprite
   * @param {number} time
   * @param {string=} mode - the initial sprite mode, defaults to the direction
   */
  setSprite(makeSprite, time, mode = this.directionMode()) {
    this.sprite = makeSprite(mode, time);
  }

  /**
   * Renders the sprite at the Hero's position
   * @param {WebGL2RenderingContext} gl
   * @param {Program} program
   * @param {Room} room
   */
  renderSprite(gl, program, room) {
    const stack = program.stack;
    stack.pushTranslation(this.heroX, this.heroY, this.heroZ);
    this.sprite.renderSprite(program);
    stack.pop();
  }

  /**
   * Changes the hero's state. Assumed to be done during a processStep call.
   * This will invoke processStep immediately on the new step
   * @param {Room} room - The current room
   * @param {function(Hero,Room,?):HeroState} stateBuilder - The thing that
   * @param {?=} arg - A per state argument
   * returns the new hero state
   */
  changeState(room, stateBuilder, arg) {
    const oldStateOnExit = this.state.onExit;
    if (oldStateOnExit) oldStateOnExit();

    const state = stateBuilder(this, room, arg);
    this.state = state;
    state.processStep(room);
  }
}

/**
 * Moves the hero
 * @param {Room} room
 */
export function processHero(room) {
  const hero = room.hero;
  hero.sprite.updateTime(room.roomTime);
  hero.state.processStep(room);
}

/**
 * Renders the hero, assumes the camera is at the origin
 * @param {WebGL2RenderingContext} gl
 * @param {Program} program
 * @param {Room} room
 */
export function renderHero(gl, program, room) {
  const render = room.hero.state.render;
  if (render) {
    render(gl, program);
  } else {
    room.hero.renderSprite(gl, program, room);
  }
}

/**
 * In this state, the hero just walks back and forth
 * @param {Hero} hero
 * @param {Room} room
 * @returns {HeroState}
 */
export function heroStateNormal(hero, room) {
  let isIdle = true;

  hero.setSprite(room.resources.hero.makeIdleSprite, room.roomTime);

  const state = {
    name: "normal",
    processStep: (/** @type {Room} */ room) => {
      const { hero, roomTime, input } = room;

      const upDown = input.getSignOfAction("down", "up");
      if (upDown) {
        const didInteract = room.interactables.some((interactable) => {
          if (interactable instanceof LightSwitch) {
            if (
              upDown === 1 &&
              !interactable.on &&
              Math.abs(hero.heroX - interactable.x) < 0.4
            ) {
              hero.changeState(room, heroStateFlipSwitch, interactable);
              return true;
            }
          } else if (interactable instanceof Hatch) {
            if (
              upDown === -1 &&
              Math.abs(hero.heroX - interactable.x) < 0.4 &&
              interactable.isOpen(room)
            ) {
              hero.changeState(room, heroStateDescending, interactable);
              return true;
            }
          } else if (interactable instanceof Ladder) {
            if (
              room.name !== "final" &&
              upDown === 1 &&
              Math.abs(hero.heroX - interactable.x) < 0.4
            ) {
              hero.changeState(room, heroStateClimbing, interactable);
              return true;
            }
          }
        });
        if (didInteract) return;
      }

      if (input.isPressed("attack")) {
        hero.changeState(room, heroStateAttacking);
        return;
      }

      // move character
      let charDx = 1.6 * room.stepSize * input.getSignOfAction("left", "right");
      const plannedX = hero.heroX + charDx;
      if (plannedX < room.roomLeft + charWInM) {
        charDx = room.roomLeft + charWInM - hero.heroX;
      } else if (plannedX > room.roomRight - charWInM) {
        charDx = room.roomRight - charWInM - hero.heroX;
      }

      hero.setSpeedX(charDx / room.stepSize);
      const mode = hero.directionMode();

      if (charDx) {
        hero.heroX += charDx;
        if (isIdle) {
          isIdle = false;
          hero.setSprite(room.resources.hero.makeWalkSprite, roomTime);
        }
      } else if (!isIdle) {
        isIdle = true;
        hero.setSprite(room.resources.hero.makeIdleSprite, roomTime);
      }

      hero.sprite.setMode(mode);
    },
  };

  return state;
}

/**
 * In this state, the hero just walks back and forth
 * @param {Hero} hero
 * @param {Room} room
 * @returns {HeroState}
 */
function heroStateAttacking(hero, room) {
  const targetX = hero.heroX + hero.signX * (300 / HERO_PIXELS_PER_METER);
  const enemyInRange = room.creatures.find(
    (creature) => Math.abs(targetX - creature.x) < 0.6
  );

  if (enemyInRange) {
    deathByAxe(enemyInRange, room);
  }

  hero.setSprite(room.resources.hero.makeAttackSprite, room.roomTime);
  hero.setSpeedX(0);

  const grunts = room.resources.hero.grunts;
  room.audio.playSound(hero, grunts[Math.floor(Math.random() * grunts.length)]);

  return {
    name: "attacking",
    processStep: (room) => {
      if (hero.sprite.isFinished()) {
        hero.changeState(room, heroStateNormal);
      }
    },
  };
}

/**
 * @param {Hero} hero
 * @param {Room} room
 * @param {LightSwitch} light
 */
function heroStateFlipSwitch(hero, room, light) {
  hero.setSprite(
    room.resources.hero.makeSwitchFlipSprite,
    room.roomTime,
    "main"
  );
  hero.setSpeedX(0);
  hero.heroX = light.x;

  return {
    name: "switch_on",
    processStep: () => {
      if (!light.on && hero.sprite.frameIndex() >= 6) {
        room.audio.playSound(light, room.resources.hero.lightSwitchSound);
        room.lightsOn = true;
        light.on = true;

        const hatch = room.interactables.find(
          (inter) => inter instanceof Hatch
        );
        if (hatch) {
          room.audio.playSound(hatch, room.resources.environ.hatchOpenSound);
        }
      }

      if (hero.sprite.isFinished()) {
        hero.changeState(room, heroStateNormal);
      }
    },
  };
}

function heroStateClimbing(hero, room, ladder) {
  hero.setSprite(room.resources.hero.makeClimbingSprite, room.roomTime, "up");
  hero.setSpeedX(0);
  hero.heroY = LADDER_Y;
  hero.heroX = ladder.x;

  room.transition = ladder.getTransition();

  return {
    name: "climbing",
    processStep: (room) => {
      if (hero.sprite.isFinished()) {
        hero.changeState(room, heroStateNormal);
      } else {
        hero.heroZ =
          room.roomBottom + 0.3 * Math.min(5, hero.sprite.frameIndex());
      }
    },
    onExit: () => {
      hero.heroY = 0;
      hero.heroZ = room.roomBottom;
    },
  };
}

function heroStateEnterFromLadder(hero, room) {
  hero.setSpeedX(0);
  hero.setSprite(
    room.resources.hero.makeDescendingSprite,
    room.roomTime,
    "down"
  );
  hero.heroY = LADDER_Y;
  room.locks++;

  return {
    name: "descending",
    processStep: (room) => {
      if (hero.sprite.isFinished()) {
        hero.changeState(room, heroStateNormal);
      } else {
        hero.heroZ =
          room.roomBottom + 0.3 * Math.min(5, 8 - hero.sprite.frameIndex());
      }
    },
    onExit: () => {
      hero.heroY = 0;
      hero.heroZ = room.roomBottom;
      room.locks--;
    },
  };
}

function heroStateDescending(hero, room, hatch) {
  hero.setSpeedX(0);
  hero.heroX = hatch.x;
  hero.setSprite(
    room.resources.hero.makeEnterHatchSprite,
    room.roomTime,
    "enter"
  );

  room.transition = hatch.getTransition();

  return {
    name: "descending",
    processStep: (room) => {
      if (hero.sprite.isFinished()) {
        hero.changeState(room, heroStateNormal);
      }
    },
  };
}

/**
 * The state of entering from a hatch (climbing up into the room)
 * @param {Hero} hero
 * @param {Room} room
 */
function heroStateEnterFromHatch(hero, room) {
  const startTime = room.roomTime;
  hero.setSprite(
    room.resources.hero.makeExitHatchSprite,
    room.roomTime,
    "exit"
  );
  hero.setSpeedX(0);
  room.locks++;

  return {
    name: "entering_hatch",
    processStep: () => {
      const sprite = hero.sprite;

      if (room.roomTime < startTime + 1) {
        // TODO: add a notion of pausing to the sprite class
        sprite.resetSprite("exit", room.roomTime);
      } else if (sprite.isFinished()) {
        hero.changeState(room, heroStateNormal);
      } else {
        const offsets = [-0.5, -0.5, -0.3, -0.3];

        hero.heroZ = room.roomBottom + (offsets[hero.sprite.frameIndex()] || 0);
      }
    },
    render: (gl, program) => {
      if (room.roomTime < startTime + 1) return;
      hero.renderSprite(gl, program, room);
    },
    onExit: () => {
      room.locks--;
      hero.heroZ = room.roomBottom;
    },
  };
}

/**
 * @param {Transition} transition
 * @param {Room} oldRoom
 * @param {Room} newRoom
 */
export function transitionInHero(transition, oldRoom, newRoom) {
  // for now always assumes a hatch
  const hero = newRoom.hero;

  if (transition.transitionType === "up") {
    hero.heroX = oldRoom.hero.heroX;
    hero.changeState(newRoom, heroStateEnterFromHatch);
  } else {
    hero.heroX = oldRoom.hero.heroX;
    hero.changeState(newRoom, heroStateEnterFromLadder);
  }
}

/**
 * Loads up all the creature resources
 * @param {function(string,string):Promise<Texture>} loadTexture
 * @param {function(string):Promise<AudioBuffer>} loadSound
 * @returns {HeroResources}
 */
export async function loadHeroResources(loadTexture, loadSound) {
  const [
    idleTex,
    walkTex,
    attackTex,
    climbingTex,
    hatchTex,
    switchTex,
    grunts,
    lightSwitchSound,
    heroDeadSounds,
  ] = await Promise.all([
    loadTexture("hero_idle", "assets/Hero Breathing with axe.png"),
    loadTexture("hero_walk", "assets/Hero Walking with axe.png"),
    loadTexture("hero_attack", "assets/Axe Chop.png"),
    loadTexture("hero_climbing", "assets/Climbing Up.png"),
    loadTexture("hero_hatch", "assets/climbing_in.png"),
    loadTexture("hero_light", "assets/Hero flipping Switch.png"),
    Promise.all([
      loadSound("assets/Grunt1.mp3"),
      loadSound("assets/Grunt2.mp3"),
      loadSound("assets/Grunt3.mp3"),
    ]),
    loadSound("assets/light.mp3"),
    Promise.all([
      loadSound("assets/Hero Dying 1.mp3"),
      loadSound("assets/Hero Dying 2.mp3"),
      loadSound("assets/Hero Dying 3.mp3"),
    ]),
  ]);

  const enterHatch = {
    name: "hero_hatch_enter",
    tex: hatchTex,
    widthPx: 350,
    heightPx: 406,
    xPx: 161,
    yPx: 479,
    frameCount: 6,
    loops: false,
    frameTime: 1 / 8,
    flareData: [
      { tx: 201, ty: 137, bx: 172, by: 175 },
      { tx: 422, ty: 246, bx: 461, by: 259 },
      { tx: 67, ty: 659, bx: 113, by: 651 },
      { tx: 419, ty: 658, bx: 462, by: 648 },
      { tx: 80, ty: 1041, bx: 106, by: 1067 },
      null,
    ],
    singleMode: "enter",
  };

  const climbingUp = {
    name: "hero_climbing_up",
    tex: climbingTex,
    widthPx: 222,
    heightPx: 412,
    xPx: 110,
    yPx: 412,
    frameCount: 8,
    loops: false,
    frameTime: 1 / 8,
    flareData: [
      { tx: 128, ty: 60, bx: 65, by: 54 },
      { tx: 329, ty: 155, bx: 277, by: 148 },
      { tx: 579, ty: 58, bx: 518, by: 56 },
      { tx: 772, ty: 157, bx: 721, by: 156 },
      { tx: 95, ty: 575, bx: 65, by: 567 },
      { tx: 337, ty: 472, bx: 286, by: 465 },
      null,
      null,
    ],
    singleMode: "up",
    scale: 1.4,
  };

  return {
    grunts,

    makeIdleSprite: makeHeroSpriteType({
      name: "hero_idle",
      tex: idleTex,
      widthPx: 405,
      heightPx: 434,
      xPx: 220,
      yPx: 434,
      frameCount: 16,
      loops: true,
      frameTime: 1 / 12,
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

    makeWalkSprite: makeHeroSpriteType({
      name: "hero_walk",
      tex: walkTex,
      widthPx: 424,
      heightPx: 444,
      xPx: 258,
      yPx: 444,
      frameCount: 8,
      loops: true,
      frameTime: 1 / 8,
      flareData: [
        { tx: 408, ty: 110, bx: 404, by: 166 },
        { tx: 830, ty: 110, bx: 829, by: 166 },
        { tx: 408, ty: 554, bx: 404, by: 614 },
        { tx: 830, ty: 554, bx: 829, by: 614 },
        { tx: 408, ty: 998, bx: 404, by: 1055 },
        { tx: 830, ty: 998, bx: 829, by: 1055 },
        { tx: 408, ty: 1444, bx: 404, by: 1500 },
        { tx: 830, ty: 1444, bx: 829, by: 1500 },
      ],
    }),

    makeAttackSprite: makeHeroSpriteType({
      name: "hero_attack",
      tex: attackTex,
      widthPx: 644,
      heightPx: 565,
      xPx: 284,
      yPx: 565,
      frameCount: 5,
      loops: false,
      frameTime: 1 / 12,
      flareData: [
        { tx: 422, ty: 285, bx: 415, by: 353 },
        { tx: 936, ty: 367, bx: 868, by: 380 },
        { tx: 1507, ty: 311, bx: 1469, by: 318 },
        { tx: 162, ty: 948, bx: 206, by: 943 },
        { tx: 1025, ty: 934, bx: 976, by: 962 },
      ],
    }),

    makeClimbingSprite: makeHeroSpriteType(climbingUp),
    makeDescendingSprite: makeHeroSpriteType({
      ...climbingUp,
      name: "hero_hatch_descend",
      singleMode: "down",
      reverseOrder: true,
    }),
    makeEnterHatchSprite: makeHeroSpriteType(enterHatch),
    makeExitHatchSprite: makeHeroSpriteType({
      ...enterHatch,
      name: "hero_hatch_exit",
      singleMode: "exit",
      reverseOrder: true,
    }),
    makeSwitchFlipSprite: makeHeroSpriteType({
      name: "hero_switch",
      tex: switchTex,
      widthPx: 274,
      heightPx: 444,
      xPx: 104,
      yPx: 442,
      frameCount: 9,
      loops: false,
      frameTime: 1 / 12,
      singleMode: "main",
      flareData: null,
    }),
    lightSwitchSound,
    heroDeadSounds,
  };

  // flare climbing up (reversed)
  // { tx: 545, ty: 571, bx: 499, by: 570 },
  // { tx: 357, ty: 472, bx: 296, by: 472 },
  // { tx: 102, ty: 568, bx: 52, by: 564 },
  // { tx: 797, ty: 55, bx: 732, by: 55 },
  // { tx: 551, ty: 159, bx: 500, by: 151 },
  // null,
  // null,
  // null,
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
 * @param {*} options.loops
 * @param {*} options.frameTime
 * @param {number=} options.scale - If the character needs to be scaled a bit
 * @param {string=} options.singleMode
 * @param {boolean=} options.reverseOrder
 * @param {?Array<{tx: number, ty: number, bx: number, by: number}>} options.flareData - The positions in pixels of the (T)ip and (B)ase of the flare (per frame)
 */
function makeHeroSpriteType(options) {
  const { tex, widthPx, heightPx, xPx, yPx, frameCount } = options;
  const maybeReverse = options.reverseOrder
    ? (array) => [...array].reverse()
    : (array) => array;

  const pxPerMeter = HERO_PIXELS_PER_METER / (options.scale || 1);

  // assumes things are standard-ly packed, which has been true so far
  const numPerRow = Math.floor(tex.w / widthPx);

  const spriteSheetOptions = {
    x: xPx / pxPerMeter,
    z: (heightPx - yPx) / pxPerMeter,
    width: widthPx / pxPerMeter,
    height: heightPx / pxPerMeter,
    texWidth: widthPx / tex.w,
    texHeight: heightPx / tex.h,

    numPerRow,
    count: frameCount,
  };

  const perFrameData =
    options.flareData &&
    options.flareData.map((data, index) => {
      if (!data) return { flare: null };

      const { tx, ty, bx, by } = data;
      const row = Math.floor(index / numPerRow);
      const col = index % numPerRow;
      return {
        flare: {
          x: (tx - (col * widthPx + xPx)) / pxPerMeter,
          z: (row * heightPx + yPx - ty) / pxPerMeter,
          angle: arctan(-(ty - by), tx - bx),
        },
      };
    });

  let spriteSet, modes;
  if (options.singleMode) {
    modes = [options.singleMode];
    spriteSet = new SpriteSet(tex, {
      [options.singleMode]: maybeReverse(spriteSheet(spriteSheetOptions)),
    });
  } else {
    modes = ["left", "right"];
    spriteSet = new SpriteSet(tex, {
      // prettier-ignore
      "right": maybeReverse(spriteSheet(spriteSheetOptions)),
      // prettier-ignore
      "left": maybeReverse(spriteSheet({ ...spriteSheetOptions, reverseX: true })),
    });
  }

  return makeSpriteType({
    name: options.name,
    set: spriteSet,
    modes,
    loops: options.loops,
    frameTime: options.frameTime,
    perFrameData: perFrameData && maybeReverse(perFrameData),
  });
}

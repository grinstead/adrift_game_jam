import { Creature, CreatureResources } from "./Creature.js";
import { HeroResources, Hero } from "./Hero.js";
import {
  EnvironResources,
  EnvironRoomSprites,
  makeRoomSprites,
} from "./Environ.js";
import { InputManager } from "./webgames/Input.js";
import { AudioManager } from "./webgames/Audio.js";
import { SparkParticle } from "./Flare.js";
import { SpriteSet } from "./sprites.js";

/**
 * The basic resources used in the game
 * @typedef {Object} Resources
 * @property {CreatureResources} creatures
 * @property {HeroResources} hero
 * @property {EnvironResources} environ
 * @property {SpriteSet} sparkSprite
 */
let Resources;

/**
 * @typedef {Object} Transition
 * @property {string} roomName
 * @property {string} transitionType
 * @property {number} realWorldStartTime - Date.now() / 1000
 * @property {number} seconds
 */
export let Transition;

/**
 * A data structure containing almost everything relevant for the game
 * @typedef {Object} Room
 * @property {string} name - The name of the room
 * @property {Resources} resources
 * @property {InputManager} input - The inputs the user is giving
 * @property {AudioManager} audio - The audio context for the game
 * @property {Array<Creature>} creatures - All the enemy black spot creatures
 * @property {number} roomTime - The time (in seconds, accurate to ms) since the start of the room
 * @property {number} roomTimeOffset - The time to subtract from Date.now() to get roomTime
 * @property {number} stepSize - The time (in seconds, accurate to ms) since the last render
 * @property {number} roomLeft - The x coordinate of the left-most portion of the room
 * @property {number} roomRight - The x coordinate of the right-most portion of the room
 * @property {number} roomBottom - The z coordinate of the lowest-most portion of the room (ie. the floor)
 * @property {EnvironRoomSprites} environSprites
 * @property {Array<SparkParticle>} sparks
 * @property {boolean} lightsOn
 * @property {Hero} hero - The hero character for the room
 * @property {?Transition} transition - Whether the room should transition to another room
 */
export let Room;

/**
 *
 * @typedef {Object} RoomKernel
 * @property {Resources} resources - Whatever various resources were loaded up
 * @property {InputManager} input - The inputs the user is giving
 * @property {AudioManager} audio - The audio context for the game
 */
export let RoomKernel;

/**
 * Makes a room data structure object
 * @param {Object} options
 * @param {RoomKernel} options.kernel
 * @param {string} options.name - The name of the room
 * @param {number} options.roomLeft - The x coordinate of the left-most portion of the room
 * @param {number} options.roomRight - The x coordinate of the right-most portion of the room
 * @param {number} options.roomBottom - The z coordinate of the lowest-most portion of the room (ie. the floor)
 * @returns {Room}
 */
export function makeRoom(options) {
  const { roomLeft, roomRight, roomBottom, kernel } = options;

  return {
    name: options.name,
    resources: kernel.resources,
    input: kernel.input,
    audio: kernel.audio,
    creatures: [],
    roomTime: 0,
    roomTimeOffset: offsetAFrameFrom(0),
    stepSize: 0,
    roomLeft,
    roomRight,
    roomBottom,
    environSprites: makeRoomSprites(
      kernel.resources.environ,
      roomRight - roomLeft,
      roomLeft
    ),
    sparks: [],
    lightsOn: false,
    hero: new Hero(
      kernel.resources.hero,
      (roomRight + roomLeft) / 2,
      roomBottom
    ),
    transition: null,
  };
}

export function offsetAFrameFrom(time) {
  return Date.now() / 1000 - 1 / 60 - time;
}

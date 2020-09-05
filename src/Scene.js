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
 * A data structure containing almost everything relevant for the game
 * @typedef {Object} Room
 * @property {string} name - The name of the room
 * @property {Resources} resources
 * @property {InputManager} input - The inputs the user is giving
 * @property {AudioManager} audio - The audio context for the game
 * @property {Array<Creature>} creatures - All the enemy black spot creatures
 * @property {number} roomTime - The time (in seconds, accurate to ms) since the start of the room
 * @property {number} stepSize - The time (in seconds, accurate to ms) since the last render
 * @property {number} roomLeft - The x coordinate of the left-most portion of the room
 * @property {number} roomRight - The x coordinate of the right-most portion of the room
 * @property {number} roomTop - The z coordinate of the top-most portion of the room (ie. the ceiling)
 * @property {number} roomBottom - The z coordinate of the lowest-most portion of the room (ie. the floor)
 * @property {EnvironRoomSprites} environSprites
 * @property {Array<SparkParticle>} sparks
 * @property {boolean} lightsOn
 * @property {Hero} hero
 */
export let Room;

/**
 * Makes a room data structure object
 * @param {Object} options
 * @param {string} options.name - The name of the room
 * @param {Resources} options.resources - Whatever various resources were loaded up
 * @param {InputManager} options.input - The inputs the user is giving
 * @param {AudioManager} options.audio - The audio context for the game
 * @param {number} options.roomTime - The time (in seconds, accurate to ms) since the start of the room
 * @param {number} options.roomLeft - The x coordinate of the left-most portion of the room
 * @param {number} options.roomRight - The x coordinate of the right-most portion of the room
 * @param {number} options.roomTop - The z coordinate of the top-most portion of the room (ie. the ceiling)
 * @param {number} options.roomBottom - The z coordinate of the lowest-most portion of the room (ie. the floor)
 * @param {Hero} options.hero - The hero character
 * @returns {Room}
 */
export function makeRoom(options) {
  const { resources, roomLeft, roomRight } = options;

  return {
    name: options.name,
    resources,
    input: options.input,
    audio: options.audio,
    creatures: [],
    roomTime: options.roomTime,
    stepSize: 0,
    roomLeft,
    roomRight,
    roomTop: options.roomTop,
    roomBottom: options.roomBottom,
    environSprites: makeRoomSprites(
      options.resources.environ,
      roomRight - roomLeft,
      roomLeft
    ),
    sparks: [],
    lightsOn: false,
    hero: options.hero,
  };
}

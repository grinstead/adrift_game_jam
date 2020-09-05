import { Creature, CreatureResources } from "./Creature.js";
import { HeroResources } from "./Hero.js";
import { EnvironResources } from "./Environ.js";

/**
 * The basic resources used in the game
 * @typedef {Object}
 * @property {CreatureResources} creatures
 * @property {HeroResources} hero
 * @property {EnvironResources} environ
 */
let Resources;

/**
 * A data structure containing almost everything relevant for the game
 * @typedef {Object}
 * @property {Resources} resources
 * @property {Array<Creature>} creatures - All the enemy black spot creatures
 * @property {number} roomTime - The time (in seconds, accurate to ms) since the start of the room
 * @property {number} roomLeft - The x coordinate of the left-most portion of the room
 * @property {number} roomRight - The x coordinate of the right-most portion of the room
 * @property {number} roomTop - The z coordinate of the top-most portion of the room (ie. the ceiling)
 * @property {number} roomBottom - The z coordinate of the lowest-most portion of the room (ie. the floor)
 */
export let Room;

/**
 * Makes a room data structure object
 * @param {Object} options
 * @param {Resources} options.resources - Whatever various resources were loaded up
 * @property {number} options.roomTime - The time (in seconds, accurate to ms) since the start of the room
 * @property {number} options.roomLeft - The x coordinate of the left-most portion of the room
 * @property {number} options.roomRight - The x coordinate of the right-most portion of the room
 * @property {number} options.roomTop - The z coordinate of the top-most portion of the room (ie. the ceiling)
 * @property {number} options.roomBottom - The z coordinate of the lowest-most portion of the room (ie. the floor)
 */
export function makeRoom(options) {
  return {
    resources: options.resources,
    creatures: [],
    roomTime: options.roomTime,
    roomLeft: options.roomLeft,
    roomRight: options.roomRight,
    roomTop: options.roomTop,
    roomBottom: options.roomBottom,
  };
}

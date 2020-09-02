import { Creature, CreatureResources } from "./Creature.js";

/**
 * The basic resources used in the game
 * @typedef {Object}
 * @property {CreatureResources} creatures
 */
let Resources;

/**
 * A data structure containing almost everything relevant for the game
 * @typedef {Object}
 * @property {Resources} resources
 * @property {Array<Creature>} creatures - All the enemy black spot creatures
 * @property {number} roomTime - The time (in seconds, accurate to ms) since the start of the room
 */
export let Room;

/**
 * Makes a room data structure object
 * @param {Resources} resources - Whatever various resources were loaded up
 */
export function makeRoom(resources) {
  return {
    resources,
    creatures: [],
    roomTime: 0,
  };
}

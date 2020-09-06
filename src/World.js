import { RoomKernel, Room, makeRoom } from "./Scene.js";
import { ROOM_HEIGHT } from "./SpriteData.js";
import { spawnCreature } from "./Creature.js";

const CAMERA_X_OFFSET = 1;

export class World {
  constructor(kernel, startRoom) {
    /** @private {RoomKernel} */
    this.kernel = kernel;
    /** @private {Map<string, Room>} Maps the initialized rooms' names to their data */
    this.rooms = new Map([[startRoom.name, startRoom]]);
    /** @type {Room} The active room */
    this.activeRoom = startRoom;
  }

  /**
   * @param {string} roomName
   */
  switchToRoom(roomName) {
    if (this.activeRoom.name === roomName) return;
    this.activeRoom = this.getRoom(roomName);
  }

  /**
   * Gets (or initializes) the room with the given name
   * @param {string} roomName
   * @returns {Room}
   */
  getRoom(roomName) {
    const rooms = this.rooms;
    let room = rooms.get(roomName);
    if (!room) {
      room = initRoom(this.kernel, roomName);
      rooms.set(roomName, room);
    }
    return room;
  }
}

/**
 * Start the world! Huzzah!
 * @param {RoomKernel} kernel
 */
export function initWorld(kernel) {
  return new World(kernel, initRoom(kernel, "r0"));
}

/**
 * @param {RoomKernel} kernel
 * @param {string} name
 * @returns {Room}
 */
function initRoom(kernel, name) {
  switch (name) {
    case "r0": {
      const room = makeRoom({
        kernel,
        name,
        roomLeft: 0,
        roomRight: 12,
        roomBottom: 0,
      });

      const hero = room.hero;
      hero.heroX = room.roomLeft + 4;
      spawnCreature(room, hero.heroX + 2);

      return room;
    }
    case "r1": {
      const room = makeRoom({
        kernel,
        name,
        roomLeft: -12,
        roomRight: 10,
        roomBottom: ROOM_HEIGHT + 2,
      });

      return room;
    }
    default:
      throw new Error(`Unrecognized room name "${name}"`);
  }
}

/**
 * @param {Room} room
 * @returns {x: number, y: number, z: number}
 */
export function cameraPositionForRoom(room) {
  return {
    x: Math.min(
      Math.max(room.hero.heroX, room.roomLeft + CAMERA_X_OFFSET),
      room.roomRight - CAMERA_X_OFFSET
    ),
    y: 0,
    z: room.roomBottom + ROOM_HEIGHT / 2,
  };
}

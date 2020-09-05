import { RoomKernel, Room, makeRoom } from "./Scene.js";
import { ROOM_HEIGHT } from "./SpriteData.js";
import { spawnCreature } from "./Creature.js";

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

    const rooms = this.rooms;
    let newRoom = rooms.get(roomName);
    if (!newRoom) {
      newRoom = initRoom(this.kernel, roomName);
      rooms.set(roomName, newRoom);
    }

    this.activeRoom = newRoom;
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
        roomRight: 2,
        roomBottom: ROOM_HEIGHT + 2,
      });

      return room;
    }
    default:
      throw new Error(`Unrecognized room name "${name}"`);
  }
}

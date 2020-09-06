import { RoomKernel, Room, makeRoom, Transition } from "./Scene.js";
import { ROOM_HEIGHT } from "./SpriteData.js";
import { spawnCreature } from "./Creature.js";
import { LightSwitch, Hatch, Ladder } from "./Interactables.js";

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
  return new World(kernel, initRoom(kernel, "start"));
}

/**
 * @param {RoomKernel} kernel
 * @param {string} name
 * @returns {Room}
 */
function initRoom(kernel, name) {
  switch (name) {
    case "start": {
      const room = makeRoom({
        kernel,
        name,
        roomRight: 5,
        roomLeft: -5,
        roomBottom: 20,
        ambientLight: 0.4,
      });
      room.hero.heroX = -1;

      room.interactables.push(new LightSwitch(1), new Hatch(3, "second"));

      return room;
    }
    case "second": {
      const room = makeRoom({
        kernel,
        name,
        roomRight: 5,
        roomLeft: -15,
        roomBottom: 15,
        ambientLight: 0.4,
      });

      room.interactables.push(
        new LightSwitch(1),
        new Ladder(3, "start"),
        new Hatch(-10, "third")
      );
      spawnCreature(room, -8);

      return room;
    }
    case "third": {
      const room = makeRoom({
        kernel,
        name,
        roomRight: 10,
        roomLeft: -12,
        roomBottom: 10,
        ambientLight: 0.4,
      });

      room.interactables.push(
        new LightSwitch(6),
        new Ladder(-10, "second"),
        new Hatch(8, "r0")
      );
      spawnCreature(room, 0);

      return room;
    }
    case "fourth": {
      const room = makeRoom({});
    }
    case "r0": {
      const room = makeRoom({
        kernel,
        name,
        roomLeft: 0,
        roomRight: 12,
        roomBottom: 0,
        ambientLight: 0.1,
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
        roomBottom: ROOM_HEIGHT + 3,
        ambientLight: 0,
      });

      spawnCreature(room, 0);

      return room;
    }
    default:
      throw new Error(`Unrecognized room name "${name}"`);
  }
}

/**
 * @param {Room} room
 * @returns {{x: number, y: number, z: number}}
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

/**
 * Updates the room's time and step size
 * @param {Room} room
 * @param {number} time
 */
export function updateRoomTime(room, time) {
  const newTime = time - room.roomTimeOffset;
  room.stepSize = newTime - room.roomTime;
  room.roomTime = newTime;
}

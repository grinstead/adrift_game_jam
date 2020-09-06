import { RoomKernel, Room, makeRoom, Transition } from "./Scene.js";
import { ROOM_HEIGHT } from "./SpriteData.js";
import { spawnCreature } from "./Creature.js";
import { LightSwitch, Hatch, Ladder } from "./Interactables.js";

const CAMERA_X_OFFSET = 1;

const TOP_ROOM_BASE = 80;

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
  return new World(kernel, initRoom(kernel, "sixth"));
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
        roomBottom: TOP_ROOM_BASE,
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
        roomLeft: -10,
        roomBottom: TOP_ROOM_BASE - 5,
        ambientLight: 0.4,
      });

      room.interactables.push(
        new LightSwitch(1),
        new Ladder(3, "start"),
        new Hatch(-7, "third")
      );
      spawnCreature(room, -4);

      return room;
    }
    case "third": {
      const room = makeRoom({
        kernel,
        name,
        roomRight: 5,
        roomLeft: -10,
        roomBottom: TOP_ROOM_BASE - 10,
        ambientLight: 0.4,
      });

      room.interactables.push(
        new LightSwitch(2),
        new Ladder(-7, "second"),
        new Hatch(3, "fourth")
      );
      spawnCreature(room, 0);

      return room;
    }
    case "fourth": {
      const room = makeRoom({
        kernel,
        name,
        roomRight: 12,
        roomLeft: 0,
        roomBottom: TOP_ROOM_BASE - 15,
        ambientLight: 0.2,
      });

      spawnCreature(room, 1.5);
      spawnCreature(room, 9);

      room.interactables.push(
        new LightSwitch(6),
        new Ladder(3, "third"),
        new Hatch(10, "fifth")
      );
      return room;
    }
    case "fifth": {
      const room = makeRoom({
        kernel,
        name,
        roomRight: 28,
        roomLeft: 7,
        roomBottom: TOP_ROOM_BASE - 20,
        ambientLight: 0,
      });

      spawnCreature(room, 20);
      spawnCreature(room, 25);

      room.interactables.push(
        new LightSwitch(23),
        new Ladder(10, "fourth"),
        new Hatch(25, "sixth")
      );
      return room;
    }
    case "sixth": {
      const room = makeRoom({
        kernel,
        name,
        roomLeft: 10,
        roomRight: 45,
        roomBottom: TOP_ROOM_BASE - 25,
        ambientLight: 0,
      });

      room.interactables.push(new Ladder(25, "fifth"));

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

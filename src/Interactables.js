import { Program } from "./swagl.js";
import { Room } from "./Scene.js";
import { ROOM_HEIGHT } from "./SpriteData.js";

export class LightSwitch {
  constructor(x) {
    /** @type {boolean} */
    this.on = false;
    /** @type {number} */
    this.x = x;
  }

  /**
   * @param {WebGL2RenderingContext} gl
   * @param {Program} program
   * @param {Room} room
   */
  render(gl, program, room) {
    const stack = program.stack;
    const switches = room.resources.environ.lightSwitches;

    stack.pushTranslation(this.x, 0, room.roomBottom);
    switches.bindTo(program);
    switches.renderSpriteDatumPrebound(this.on ? "on" : "off", 0);
    stack.pop();
  }
}

export class Hatch {
  constructor(x, destination) {
    /** @type {string} */
    this.destination = destination;
    /** @type {number} */
    this.x = x;
  }

  getTransition() {
    return makeTransition(this.destination, "down");
  }

  isOpen(room) {
    return room.lightsOn;
  }

  /**
   * @param {WebGL2RenderingContext} gl
   * @param {Program} program
   * @param {Room} room
   */
  render(gl, program, room) {
    const stack = program.stack;
    const setPieces = room.resources.environ.setPieces;

    stack.pushTranslation(this.x, 0, room.roomBottom);
    setPieces.bindTo(program);
    setPieces.renderSpriteDatumPrebound(
      room.lightsOn ? "lowerHatch" : "lowerHatchClosed",
      0
    );
    stack.pop();
  }
}

export class Ladder {
  constructor(x, destination) {
    /** @type {string} */
    this.destination = destination;
    /** @type {number} */
    this.x = x;
  }

  getTransition() {
    return makeTransition(this.destination, "up");
  }

  /**
   * @param {WebGL2RenderingContext} gl
   * @param {Program} program
   * @param {Room} room
   */
  render(gl, program, room) {
    const stack = program.stack;
    const ladderSprite = room.resources.environ.ladderSprite;
    const setPieces = room.resources.environ.setPieces;

    stack.pushTranslation(this.x, 0, room.roomBottom);
    ladderSprite.bindTo(program);
    ladderSprite.renderSpriteDatumPrebound("main", 0);

    setPieces.bindTo(program);
    setPieces.renderSpriteDatumPrebound("upperHatch", 0);

    stack.pop();
  }
}

function makeTransition(roomName, type) {
  return {
    roomName,
    transitionType: type,
    realWorldStartTime: Date.now() / 1000,
    seconds: 1,
  };
}

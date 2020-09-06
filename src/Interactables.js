import { Program } from "./swagl.js";
import { Room } from "./Scene.js";

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
    setPieces.renderSpriteDatumPrebound("lowerHatch", 0);
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

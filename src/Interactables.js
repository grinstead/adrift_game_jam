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
   *
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

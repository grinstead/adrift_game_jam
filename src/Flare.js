import { Room } from "./Scene.js";
import {
  ROOM_DEPTH_RADIUS,
  TEX_PIXEL_PER_PIXEL,
  PIXELS_PER_METER,
} from "./SpriteData.js";
import { loadTextureFromRawBitmap, Program } from "./swagl.js";
import { SpriteSet, spriteSheet } from "./sprites.js";

const SPAWN_HERTZ = 48;
const MAX_SPARKS = 100;

/**
 * @typedef {Object} SparkParticle
 * @property {boolean} dead
 * @property {number} x
 * @property {number} y
 * @property {number} z
 * @property {number} dx
 * @property {number} dy
 * @property {number} dz
 * @property {number} startTime
 * @property {number} deathTime
 * @property {boolean} onFloor
 */
export let SparkParticle;

/**
 * @param {Room} room
 */
export function processFlare(room) {
  const { roomTime, stepSize, hero, sparks } = room;

  // spawn any missing particles
  const toSpawn =
    Math.floor(SPAWN_HERTZ * roomTime) -
    Math.floor(SPAWN_HERTZ * (roomTime - stepSize));
  for (let i = 0; i < toSpawn; i++) {
    const speed = Math.random() * 2 + 1.4; // measured in meters per second
    let dy = 0.1 * Math.sin(2 * Math.PI * Math.random());

    const flarePosition = hero.flarePosition();
    if (!flarePosition) break;

    const x = hero.heroX + flarePosition.x * hero.signX;
    const z = flarePosition.z; // assumes character is at 0
    const angle = (Math.random() - 0.5) * (Math.PI / 4) + flarePosition.angle;
    const dz = speed * Math.sin(angle);
    const dx = speed * Math.cos(angle) + hero.speedX;

    if (sparks.length > MAX_SPARKS) {
      sparks.pop();
    }

    sparks.push({
      dead: false,
      x,
      y: 0.01,
      z,
      dx,
      dy,
      dz,
      startTime: roomTime,
      deathTime: roomTime + 1.5,
      onFloor: false,
    });
  }

  // TODO: restore
  const normalZ = 1;
  const normalX = 0;

  const gravityZ = normalZ * 9.8 * stepSize;
  const gravityX = normalX * 9.8 * stepSize;

  // move all the particles
  const friction = 1 - 0.8 * stepSize;
  sparks.forEach((particle) => {
    const declaredDead = particle.dead;
    if (!declaredDead && roomTime < particle.deathTime) {
      particle.x += particle.dx * stepSize;
      particle.y += particle.dy * stepSize;
      particle.z += particle.dz * stepSize;

      let dz = particle.dz;
      if (particle.onFloor) {
        particle.dx *= friction;
        particle.dy *= friction;
      } else {
        dz -= gravityZ;
        particle.dx -= gravityX;
        particle.dz = dz;
      }

      if (particle.x < room.roomLeft || particle.x > room.roomRight) {
        particle.dead = true;
      }

      const y = particle.y;
      if (y < -ROOM_DEPTH_RADIUS || y > ROOM_DEPTH_RADIUS) {
        const reflectAgainst = y > 0 ? ROOM_DEPTH_RADIUS : -ROOM_DEPTH_RADIUS;
        particle.y = reflectAgainst + (reflectAgainst - y);
        particle.dy = -particle.dy;
      }

      const floorZ = room.roomBottom;
      if (particle.z < floorZ) {
        if (dz > -0.01) {
          particle.z = PIXELS_PER_METER;
          particle.dz = floorZ;
          particle.onFloor = true;
        } else {
          particle.z = floorZ - particle.z;
          particle.dz = -0.25 * dz;
        }
      }
    } else if (!declaredDead) {
      particle.dead = true;
    }
  });

  sparks.sort(compareSparks);
}

// makes a fading sprite for sparks
export function makeSparkSprite(gl) {
  const FADE_STEPS = 18;
  const TAIL_LEAD = 6; // the tail is 8 this many frames ahead
  const FADE_COEFFICIENT = 1 / FADE_STEPS / FADE_STEPS;

  const colorVal = (dropIndex) => {
    return Math.max(
      0,
      Math.min(
        255,
        Math.round(256 * (1 - FADE_COEFFICIENT * dropIndex * dropIndex))
      )
    );
  };

  const bmp = [];
  for (let repeatedRow = 0; repeatedRow < TEX_PIXEL_PER_PIXEL; repeatedRow++) {
    for (let i = 0; i < FADE_STEPS; i++) {
      for (let pixel = 0; pixel < 2; pixel++) {
        let r, gb, alpha;

        const pseudoframe = i + pixel * TAIL_LEAD;
        if (pseudoframe < FADE_STEPS) {
          r = 255;
          gb = colorVal(pseudoframe);
          alpha = 255;
        } else {
          r = 0;
          gb = 0;
          alpha = 0;
        }

        const a = colorVal(i + pixel * TAIL_LEAD);
        const b = colorVal(i + pixel * TAIL_LEAD + 1);
        for (
          let repeatedCol = 0;
          repeatedCol < TEX_PIXEL_PER_PIXEL;
          repeatedCol++
        ) {
          bmp.push(r, gb, gb, alpha);
        }
      }
    }
  }

  const tex = loadTextureFromRawBitmap({
    name: "spark",
    width: 2 * FADE_STEPS * TEX_PIXEL_PER_PIXEL,
    height: TEX_PIXEL_PER_PIXEL,
    gl,
    bmp: new Uint8Array(bmp),
  });

  return new SpriteSet(tex, {
    // prettier-ignore
    "fading": spriteSheet({
      x: 1 / PIXELS_PER_METER,
      width: .04,
      height: 2 / PIXELS_PER_METER,
      texWidth: 1 / FADE_STEPS,
      texHeight: 1,
      numPerRow: FADE_STEPS,
      count: FADE_STEPS,
    }),
  });
}

// dead particles to the back, otherwise sort by depth so that alpha blending could ideally work
function compareSparks(a, b) {
  return a.dead ? (b.dead ? 0 : 1) : b.dead ? -1 : a.y - b.y;
}

/**
 * Renders all the sparks
 * @param {WebGL2RenderingContext} gl
 * @param {Program} program
 * @param {Room} room
 */
export function renderSparks(gl, program, room) {
  const sparkSprite = room.resources.sparkSprite;
  const stack = program.stack;

  sparkSprite.bindTo(program);
  room.sparks.forEach((particle) => {
    if (!particle.dead) {
      stack.pushTranslation(particle.x, particle.y, particle.z);
      stack.pushYRotation(
        (particle.dx >= 0 ? Math.PI : 0) + Math.atan(particle.dz / particle.dx)
      );

      sparkSprite.renderSpriteDatumPrebound(
        "fading",
        Math.floor(12 * (room.roomTime - particle.startTime))
      );
      stack.pop();
      stack.pop();
    }
  });
}

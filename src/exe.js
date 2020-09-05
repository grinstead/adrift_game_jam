import {
  Program,
  Shader,
  loadTextureFromImgUrl,
  loadTextureFromRawBitmap,
  doAnimationFrame,
} from "./swagl.js";
import { GameLoop } from "./webgames/GameLoop.js";
import {
  SpriteSet,
  characterSpriteSheet,
  spriteSheet,
  flatSprite,
  makeSpriteType,
  Sprite,
} from "./sprites.js";
import { InputManager } from "./webgames/Input.js";
import { Lighting } from "./lighting.js";
import {
  TEX_PIXEL_PER_PIXEL,
  PIXELS_PER_METER,
  TEX_PIXELS_PER_METER,
  ROOM_DEPTH_RADIUS,
  ROOM_HEIGHT,
  LAYOUT_TARGETS,
} from "./SpriteData.js";
import {
  loadCreatureResources,
  spawnCreature,
  renderCreatures,
  processCreatures,
} from "./Creature.js";
import { makeRoom } from "./Scene.js";
import { loadHeroResources, Hero } from "./Hero.js";
import { loadEnvironResources } from "./Environ.js";

const ATTACK_ORIGIN_X = 284;
const ATTACK_WIDTH = 644;
const ATTACK_HEIGHT = 565;
const FLARE_DURING_ATTACK = [
  { x1: 422, y1: 285, x2: 415, y2: 353 },
  { x1: 936, y1: 367, x2: 868, y2: 380 },
  { x1: 1507, y1: 311, x2: 1469, y2: 318 },
  { x1: 162, y1: 948, x2: 206, y2: 943 },
  { x1: 1025, y1: 934, x2: 976, y2: 962 },
];

const CAMERA_X_OFFSET = 2;

window.ambientLight = 0.1;

async function onLoad() {
  const fpsNode = document.getElementById("fps");
  const canvas = document.getElementById("canvas");
  const computedStyle = window.getComputedStyle(canvas);

  const input = new InputManager(document.body);
  input.setKeysForAction("left", ["a", "ArrowLeft"]);
  input.setKeysForAction("right", ["d", "ArrowRight"]);
  input.setKeysForAction("showLights", ["l"]);
  input.setKeysForAction("attack", ["f", " "]);
  input.setKeysForAction("fullscreen", ["u"]);
  input.setKeysForAction("up", ["w", "ArrowUp"]);
  input.setKeysForAction("down", ["s", "ArrowDown"]);
  input.setKeysForAction("lightUp", ["y"]);
  input.setKeysForAction("lightDown", ["h"]);

  let width = parseInt(computedStyle.getPropertyValue("width"), 10);
  let height = parseInt(computedStyle.getPropertyValue("height"), 10);

  let debugShowLights = false;

  const ratio = window.devicePixelRatio || 1;
  const canvasWidth = ratio * width;
  const canvasHeight = ratio * height;
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  let cameraZ = ROOM_HEIGHT / 2;

  const layoutMiddleY =
    (LAYOUT_TARGETS.CEIL_FOREGROUND + LAYOUT_TARGETS.FLOOR_FOREGROUND) / 2;
  const clipSpaceY = (layoutTargetY) =>
    (layoutMiddleY - layoutTargetY) / height;

  // this is the vertical "radius" of the room, in meters
  // const Ry = ROOM_HEIGHT / 2;
  // this is the y position (in clip space) of the middle of the ceiling
  const Ry = clipSpaceY(
    (LAYOUT_TARGETS.CEIL_FOREGROUND + LAYOUT_TARGETS.CEIL_BACKGROUND) / 2
  );

  // this is the value we want for the w coordinate in the foreground
  const w1 = Ry / clipSpaceY(LAYOUT_TARGETS.CEIL_FOREGROUND);
  const w2 = Ry / clipSpaceY(LAYOUT_TARGETS.CEIL_BACKGROUND);

  // the projection matrix will do:
  //   x: represents the x coordinate in clip-space when z = 0
  //   y: represents the y coordinate in clip-space when z = 0
  //   z: -1/2 represents the far foreground, 1/2 represents the far background

  const scaleY = Ry / (ROOM_HEIGHT / 2);
  const scaleX = scaleY * (height / width);

  // prettier-ignore
  const projection = new Float32Array([
    scaleX, 0, 0, 0,
    0, 0, 1 / (2 * ROOM_DEPTH_RADIUS), (w2 - w1) / (2 * ROOM_DEPTH_RADIUS),
    0, scaleY, 0, 0,
    0, 0, 0, (w1 + w2) / 2,
  ]);

  // prettier-ignore
  // const projection = new Float32Array([
  //   2 * PIXELS_PER_METER / width, 0,    0, 0,
  //   0,    -2 * PIXELS_PER_METER / height, 1/4, 0,
  //   0,    2 * PIXELS_PER_METER / height, 0, 0,
  //   -1,   -1,   0, 1,
  // ]);

  const gl = canvas.getContext("webgl2", { antialias: false, alpha: false });
  // gl.enable(gl.BLEND);
  // gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);

  const vShader = new Shader(
    { gl, type: "vertex" },
    `#version 300 es
in vec3 a_position;
in vec2 a_texturePosition;

uniform mat4 u_projection;

out vec4 v_clipSpace;
out vec2 v_texturePosition;

void main() {
    vec4 position = u_projection * vec4(a_position, 1);
    // float inverse = 1.f / (1.f - position.z * .2f);

    // vec4 result = vec4(position.x, inverse * position.y * (1.f - .5f * position.z), inverse * position.z, inverse * position.w);
    // vec4 result = vec4(position.x * position.w, position.y, position.z, position.w);
    vec4 result = position;
    gl_Position = result;
    
    v_clipSpace = result;
    v_texturePosition = a_texturePosition;
}`
  );

  const fShader = new Shader(
    { gl, type: "fragment" },
    `#version 300 es
precision mediump float;

uniform sampler2D u_texture;
uniform sampler2D u_lighting;

in vec2 v_texturePosition;
in vec4 v_clipSpace;
out vec4 output_color;

void main() {
    vec4 clipSpace = v_clipSpace / v_clipSpace.w; //vec4(.5f * (v_clipSpace.x + 1.f), -.5f * (v_clipSpace.y - 1.f), v_clipSpace.z, v_clipSpace.w) / v_clipSpace.w;
    clipSpace.x = .5f * (clipSpace.x + 1.f);
    clipSpace.y = 1.f - .5f * (1.f - clipSpace.y); // why????

    vec4 color = texture(u_texture, v_texturePosition.st);
    if (color.a == 0.0) {
        discard;
    }

    vec4 light = texture(u_lighting, clipSpace.xy);
    vec3 math = min(light.xyz + color.xyz * light.a, vec3(1.f, 1.f, 1.f));
    output_color = vec4(math, color.a);
}`
  );

  const program = new Program({ gl, projection: "projection" });
  program.attach(vShader, fShader).link();

  const lighting = new Lighting(
    gl,
    canvasWidth,
    canvasHeight,
    TEX_PIXELS_PER_METER
  );

  const audioContext = new AudioContext();

  const loadTexture = (name, url) => {
    return loadTextureFromImgUrl({ gl, name, src: url });
  };

  const [
    environResources,
    floorTex,
    gruntSounds,
    exclaimSound,
    creatureResources,
    ceilingTex,
    heroResources,
  ] = await Promise.all([
    loadEnvironResources(loadTexture),
    loadTextureFromImgUrl({
      gl,
      src: "assets/floor.png",
      name: "floor",
    }),
    Promise.all([
      loadSound(audioContext, "assets/Grunt1.mp3"),
      loadSound(audioContext, "assets/Grunt2.mp3"),
      loadSound(audioContext, "assets/Grunt3.mp3"),
    ]),
    loadSound(audioContext, "assets/Theres something here.mp3"),
    loadCreatureResources(loadTexture),
    loadTexture("ceiling", "assets/ceiling.png"),
    loadHeroResources(loadTexture),
  ]);

  let exclamation = null;

  const floorDims = {
    top: 220 / floorTex.h,
    w: floorTex.w / TEX_PIXELS_PER_METER,
    h: 70 / TEX_PIXELS_PER_METER,
    boundary: (512 - 70) / floorTex.h,
  };

  // I divided the texture by 2
  floorDims.top /= 2;
  floorDims.w *= 2;
  floorDims.boundary /= 2;

  const floor = new SpriteSet(floorTex, {
    // prettier-ignore
    "main": [[
        floorDims.w, -ROOM_DEPTH_RADIUS, -floorDims.h, 1,                  1,
                  0, -ROOM_DEPTH_RADIUS, -floorDims.h, 0,                  1,
        floorDims.w, -ROOM_DEPTH_RADIUS,            0, 1, floorDims.boundary,
                  0, -ROOM_DEPTH_RADIUS,            0, 0, floorDims.boundary,
        floorDims.w,  ROOM_DEPTH_RADIUS,            0, 1,      floorDims.top,
                  0,  ROOM_DEPTH_RADIUS,            0, 0,      floorDims.top,
      ]],
  });

  const ceilDims = {
    edgeY: 62,
    wallY: 288,
    w: ceilingTex.w / TEX_PIXELS_PER_METER,
    h: floorDims.h,
  };

  // I divided the texture by 2
  ceilDims.edgeY /= 2;
  ceilDims.wallY /= 2;
  ceilDims.w *= 2;

  // prettier-ignore
  const ceilingSprite = new SpriteSet(ceilingTex, {
    "main": [[
      ceilDims.w, -ROOM_DEPTH_RADIUS, ROOM_HEIGHT + ceilDims.h, 1, 0,
               0, -ROOM_DEPTH_RADIUS, ROOM_HEIGHT + ceilDims.h, 0, 0,
      ceilDims.w, -ROOM_DEPTH_RADIUS, ROOM_HEIGHT, 1, ceilDims.edgeY / ceilingTex.h,
               0, -ROOM_DEPTH_RADIUS, ROOM_HEIGHT, 0, ceilDims.edgeY / ceilingTex.h,
      ceilDims.w,  ROOM_DEPTH_RADIUS, ROOM_HEIGHT, 1, ceilDims.wallY / ceilingTex.h,
               0,  ROOM_DEPTH_RADIUS, ROOM_HEIGHT, 0, ceilDims.wallY / ceilingTex.h,
      ]],
  });

  const charW = 405;
  const charH = 434;
  const charCenter = 220 / charW;

  const charWInM = charW / TEX_PIXELS_PER_METER;
  const flareX = (387 / charW - charCenter) * charWInM;

  const charSprite = heroResources.idleSprite;
  const charWalkSprite = heroResources.walkSprite;
  const charAxeSprite = heroResources.attackSprite;
  let charSpriteMode = "right";

  const hero = new Hero(4);
  const room = makeRoom({
    resources: {
      creature: creatureResources,
      hero: heroResources,
      environ: environResources,
    },
    roomTime: 0,
    roomLeft: 0,
    roomRight: 12,
    roomTop: ROOM_HEIGHT,
    roomBottom: 0,
    hero,
  });

  const sparkSprite = makeSparkSprite(gl);

  let mouseX = 0;
  let mouseY = 0;

  const particles = [];

  let startTime = Date.now();
  let timeDiff = 0;
  let avgFps = -1;
  let stepSize = 0;
  function updateTime() {
    const newTime = (Date.now() - startTime) / 1000;
    stepSize = newTime - room.roomTime;
    timeDiff = room.roomTime = newTime;

    if (avgFps === -1) {
      avgFps = 60;
    } else {
      avgFps = 1 / stepSize / 16 + (15 / 16) * avgFps;
    }
    fpsNode.innerHTML = `fps=${Math.round(avgFps)}`;
  }

  let charDx = 0;
  let charFacingLeft = false;
  const spawnHertz = 48;

  let charFrameStart = 0;
  let activeCharSprite = charWalkSprite;
  let charFps = 12;

  let fullScreenRequest = null;
  document.addEventListener("fullscreenchange", (event) => {
    if (!document.fullscreenElement) {
      fullScreenRequest = null;
    }
  });

  const shipLength = 100;
  const wave1 = (isFar) => {
    const time = timeDiff + (isFar ? 170 : 0);
    return Math.sin((Math.PI * time) / 8) / 2;
    // return 0;
  };
  const wave2 = (isFar) => {
    const time = timeDiff + (isFar ? 130 : 0);
    return Math.sin((Math.PI * time) / 3) / 8;
    // return 0;
  };

  spawnCreature(room, hero.heroX + 2);

  let shipAngle, normalX, normalZ, shipDz;
  function movePieces() {
    // calculate the boat rocking
    const bowY = wave1(false) + wave2(false);
    const sternY = wave1(true) + wave2(true);
    shipAngle = Math.asin((bowY - sternY) / shipLength);
    normalZ = Math.cos(shipAngle);
    normalX = Math.sin(shipAngle);
    shipDz = (bowY + sternY) / 2;

    let charSpeedX = 0;
    if (activeCharSprite === charAxeSprite && !charAxeSprite.isFinished()) {
      // do nothing
    } else if (input.isPressed("attack")) {
      activeCharSprite = charAxeSprite;
      charAxeSprite.resetSprite(charSpriteMode, timeDiff);

      if (exclamation) {
        exclamation.stop();
      }

      const audioSource = audioContext.createBufferSource();
      audioSource.buffer =
        gruntSounds[Math.floor(Math.random() * gruntSounds.length)];
      audioSource.connect(audioContext.destination);
      audioSource.start(0);
    } else {
      // move character
      charDx = 1.2 * stepSize * input.getSignOfAction("left", "right");
      let plannedX = hero.heroX + charDx;
      if (plannedX < room.roomLeft + charWInM) {
        charDx = room.roomLeft + charWInM - hero.heroX;
      } else if (plannedX > room.roomRight - charWInM) {
        charDx = room.roomRight - charWInM - hero.heroX;
      }

      if (charDx !== 0) {
        hero.heroX += charDx;
        charFacingLeft = charDx < 0;
        if (activeCharSprite !== charWalkSprite) {
          activeCharSprite = charWalkSprite;
          charWalkSprite.resetSprite(
            charFacingLeft ? "left" : "right",
            timeDiff
          );
        }
      } else if (activeCharSprite !== charSprite) {
        activeCharSprite = charSprite;
        charSprite.resetSprite(charFacingLeft ? "left" : "right", timeDiff);
      } else if (exclamation == null && charFrameStart < timeDiff - 4) {
        exclamation = audioContext.createBufferSource();
        exclamation.buffer = exclaimSound;
        exclamation.connect(audioContext.destination);
        exclamation.start(0);
      }
    }

    activeCharSprite.updateTime(timeDiff);

    const toSpawn =
      Math.floor(spawnHertz * timeDiff) -
      Math.floor(spawnHertz * (timeDiff - stepSize));
    for (let i = 0; i < toSpawn; i++) {
      const speed = Math.random() * 2 + 1.4; // measured in meters per second
      let dy = 0.1 * Math.sin(2 * Math.PI * Math.random());

      const frameData = activeCharSprite.frameData();
      const flarePosition = frameData && frameData.flare;
      if (!flarePosition) continue;

      const x = hero.heroX + flarePosition.x * (charFacingLeft ? -1 : 1);
      const z = flarePosition.z; // assumes character is at 0
      const angle = (Math.random() - 0.5) * (Math.PI / 4) + flarePosition.angle;
      const dz = speed * Math.sin(angle);
      const dx = speed * Math.cos(angle) + charDx / stepSize;

      if (particles.length > 100) {
        particles.pop();
      }

      particles.push({
        dead: false,
        x,
        y: 0.01,
        z,
        dx,
        dy,
        dz,
        startTime: timeDiff,
        deathTime: timeDiff + 1.5,
        onFloor: false,
      });
    }

    const gravityZ = normalZ * 9.8 * stepSize;
    const gravityX = normalX * 9.8 * stepSize;

    // move all the particles
    const friction = 1 - 0.8 * stepSize;
    particles.forEach((particle) => {
      const declaredDead = particle.dead;
      if (!declaredDead && timeDiff < particle.deathTime) {
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

    particles.sort(sortParticles);

    processCreatures(room);
  }

  function renderInCamera(gl, program, subcode) {
    program.stack.push(projection);

    // set the camera
    const cameraX = Math.min(
      Math.max(hero.heroX, room.roomLeft + CAMERA_X_OFFSET),
      room.roomRight - CAMERA_X_OFFSET
    );
    program.stack.pushTranslation(-cameraX, 0, -cameraZ);

    // rock the boat
    program.stack.pushYRotation(shipAngle);
    program.stack.pushTranslation(0, 0, shipDz);

    subcode(gl, program);

    program.stack.pop();
    program.stack.pop();
    program.stack.pop();
  }

  function renderInSceneContent(gl, program) {
    const stack = program.stack;

    const wall = environResources.wallSpriteSet;
    wall.bindTo(program);
    wall.renderSpriteDatumPrebound("main", 0);

    floor.bindTo(program);
    floor.renderSpriteDatumPrebound("main", 0);

    ceilingSprite.bindTo(program);
    ceilingSprite.renderSpriteDatumPrebound("main", 0);

    stack.pushTranslation(hero.heroX, 0, 0);
    activeCharSprite.setMode(charFacingLeft ? "left" : "right");
    activeCharSprite.renderSprite(program);
    stack.pop();

    renderCreatures(gl, program, room);

    sparkSprite.bindTo(program);
    particles.forEach((particle) => {
      if (!particle.dead) {
        stack.pushTranslation(particle.x, particle.y, particle.z);
        stack.pushYRotation(
          (particle.dx >= 0 ? Math.PI : 0) +
            Math.atan(particle.dz / particle.dx)
        );

        sparkSprite.renderSpriteDatumPrebound(
          "fading",
          Math.floor(12 * (timeDiff - particle.startTime))
        );
        stack.pop();
        stack.pop();
      }
    });
  }

  function renderMain(gl, program) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, canvasWidth, canvasHeight);
    gl.disable(gl.BLEND);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.activeTexture(gl.TEXTURE1);
    lighting.lightingTex().bindTexture();
    gl.uniform1i(program.u["lighting"], 1);
    gl.activeTexture(gl.TEXTURE0);

    renderInCamera(gl, program, renderInSceneContent);

    // this is how to render the mouse
    // program.stack.pushTranslation(
    //   mouseX / PIXELS_PER_METER,
    //   0,
    //   (height - mouseY) / PIXELS_PER_METER
    // );
  }

  function renderStep() {
    updateTime();

    window.ambientLight = Math.max(
      0,
      Math.min(
        1,
        window.ambientLight +
          (stepSize / 4) * input.getSignOfAction("lightDown", "lightUp")
      )
    );

    if (input.numPresses("showLights") % 2) {
      debugShowLights = !debugShowLights;
    }

    if (!fullScreenRequest && input.isPressed("fullscreen")) {
      fullScreenRequest = canvas.requestFullscreen();
    }

    cameraZ += stepSize * input.getSignOfAction("down", "up");
    window["cameraZ"] = cameraZ;

    movePieces();

    lighting.renderLighting({
      renderInCamera,
      timeDiff,
      particles,
      lightsOn: debugShowLights,
    });
    doAnimationFrame(program, renderMain);
    requestAnimationFrame(renderStep);
  }

  requestAnimationFrame(renderStep);

  // function logicStep() {
  //   program.runInFrame(renderStep);
  // }

  // const loop = new GameLoop();
  // loop.onLoop = logicStep;
  // loop.start(60);
  // setTimeout(logicStep, 0);

  canvas.onmousemove = (event) => {
    mouseX = event.offsetX;
    mouseY = event.offsetY;
  };
}

// makes a fading sprite for sparks
function makeSparkSprite(gl) {
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
function sortParticles(a, b) {
  return a.dead ? (b.dead ? 0 : 1) : b.dead ? -1 : a.y - b.y;
}

function loadSound(audioContext, url) {
  return fetch(url)
    .then((response) => {
      if (!response.ok) throw new Error(`failed to load ${url}`);
      return response.arrayBuffer();
    })
    .then((buffer) => audioContext.decodeAudioData(buffer));
}

function sqr(val) {
  return val * val;
}

function arctan(opposite, adjacent) {
  if (adjacent > 0) {
    return Math.atan(opposite / adjacent);
  } else if (adjacent === 0) {
    if (opposite > 0) {
      return Math.PI / 2;
    } else if (opposite === 0) {
      return 0; // dunno what is best here
    } else {
      return -Math.PI / 2;
    }
  } else {
    return Math.atan(opposite / adjacent) + Math.PI;
  }
}

window.onload = onLoad;

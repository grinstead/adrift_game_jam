import {
  Program,
  Shader,
  loadTextureFromImgUrl,
  doAnimationFrame,
} from "./swagl.js";
import { SpriteSet, spriteSheet } from "./sprites.js";
import { InputManager } from "./webgames/Input.js";
import { Lighting } from "./lighting.js";
import {
  TEX_PIXEL_PER_PIXEL,
  PIXELS_PER_METER,
  TEX_PIXELS_PER_METER,
  ROOM_DEPTH_RADIUS,
  ROOM_HEIGHT,
} from "./SpriteData.js";
import {
  loadCreatureResources,
  spawnCreature,
  renderCreatures,
  processCreatures,
} from "./Creature.js";
import { makeRoom, Room } from "./Scene.js";
import { loadHeroResources, Hero, renderHero, processHero } from "./Hero.js";
import { loadEnvironResources, buildProjectionData } from "./Environ.js";
import { AudioManager } from "./webgames/Audio.js";
import { processFlare, makeSparkSprite, renderSparks } from "./Flare.js";
import { initWorld } from "./World.js";

const CAMERA_X_OFFSET = 1;

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

  const projection = buildProjectionData(width, height);

  const gl = canvas.getContext("webgl2", { antialias: false, alpha: false });
  gl.enable(gl.BLEND);
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

  const audioManager = new AudioManager();

  const loadTexture = (name, url) => {
    return loadTextureFromImgUrl({ gl, name, src: url });
  };

  const loadSound = (url) => audioManager.loadSound(url);

  const [
    environResources,
    creatureResources,
    heroResources,
  ] = await Promise.all([
    loadEnvironResources(projection, loadTexture),
    loadCreatureResources(loadTexture),
    loadHeroResources(loadTexture, loadSound),
  ]);

  const hero = new Hero(heroResources, 2);
  const kernel = {
    resources: {
      creature: creatureResources,
      hero: heroResources,
      environ: environResources,
      sparkSprite: makeSparkSprite(gl),
    },
    input,
    audio: audioManager,
    hero,
  };

  const world = initWorld(kernel);
  let room = world.activeRoom;

  let mouseX = 0;
  let mouseY = 0;

  let avgFps = -1;
  let stepSize = 0;
  function updateTime() {
    const newTime = Date.now() / 1000 - room.roomTimeOffset;
    const stepSize = newTime - room.roomTime;

    room.stepSize = stepSize;
    room.roomTime = newTime;

    if (avgFps === -1) {
      avgFps = 60;
    } else {
      avgFps = 1 / stepSize / 16 + (15 / 16) * avgFps;
    }
    fpsNode.innerHTML = `fps=${Math.round(avgFps)}`;
  }

  let fullScreenRequest = null;
  document.addEventListener("fullscreenchange", (event) => {
    if (!document.fullscreenElement) {
      fullScreenRequest = null;
    }
  });

  const shipLength = 100;
  const wave1 = (isFar) => {
    const time = room.roomTime + (isFar ? 170 : 0);
    return Math.sin((Math.PI * time) / 8) / 2;
    // return 0;
  };
  const wave2 = (isFar) => {
    const time = room.roomTime + (isFar ? 130 : 0);
    return Math.sin((Math.PI * time) / 3) / 8;
    // return 0;
  };

  let shipAngle, normalX, normalZ, shipDz;
  function movePieces() {
    // calculate the boat rocking
    const bowY = wave1(false) + wave2(false);
    const sternY = wave1(true) + wave2(true);
    shipAngle = Math.asin((bowY - sternY) / shipLength);
    normalZ = Math.cos(shipAngle);
    normalX = Math.sin(shipAngle);
    shipDz = (bowY + sternY) / 2;

    processHero(room);
    processFlare(room);
    processCreatures(room);
  }

  function renderInCamera(gl, program, subcode) {
    program.stack.push(projection.matrix);

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

    const wall = room.environSprites.wallSpriteSet;
    wall.bindTo(program);
    wall.renderSpriteDatumPrebound("main", 0);

    const floor = room.environSprites.floorSpriteSet;
    floor.bindTo(program);
    floor.renderSpriteDatumPrebound("main", 0);

    const ceilingSprite = room.environSprites.ceilSpriteSet;
    ceilingSprite.bindTo(program);
    ceilingSprite.renderSpriteDatumPrebound("main", 0);

    const sideSprite = room.environSprites.sideSpriteSet;
    sideSprite.bindTo(program);
    sideSprite.renderSpriteDatumPrebound("left", 0);
    sideSprite.renderSpriteDatumPrebound("right", 0);

    stack.pushTranslation(2, 0, 0);
    const ladderSprite = room.resources.environ.ladderSprite;
    ladderSprite.bindTo(program);
    ladderSprite.renderSpriteDatumPrebound("main", 0);
    stack.pop();

    renderHero(gl, program, room);
    renderCreatures(gl, program, room);
    renderSparks(gl, program, room);
  }

  function renderMain(gl, program) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, canvasWidth, canvasHeight);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

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

    if (input.numPresses("showLights") % 2) {
      debugShowLights = !debugShowLights;
      room.lightsOn = debugShowLights;
    }

    if (!fullScreenRequest && input.isPressed("fullscreen")) {
      fullScreenRequest = canvas.requestFullscreen();
    }

    movePieces();

    lighting.renderLighting(renderInCamera, room);
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

window.onload = onLoad;

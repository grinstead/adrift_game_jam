import {
  Program,
  Shader,
  loadTextureFromImgUrl,
  loadTextureFromRawBitmap,
} from "./swagl.js";
import { GameLoop } from "./webgames/GameLoop.js";
import { SpriteSet, Sprite } from "./sprites.js";

const PIXELS_PER_METER = 180;
const TEX_PIXELS_PER_METER = 2 * PIXELS_PER_METER;
const ROOM_DEPTH = 2; // meters

async function onLoad() {
  const fpsNode = document.getElementById("fps");
  const canvas = document.getElementById("canvas");
  const computedStyle = window.getComputedStyle(canvas);

  let width = parseInt(computedStyle.getPropertyValue("width"), 10);
  let height = parseInt(computedStyle.getPropertyValue("height"), 10);

  const ratio = window.devicePixelRatio || 1;
  canvas.width = ratio * width;
  canvas.height = ratio * height;

  const gl = canvas.getContext("webgl2", { antialias: false, alpha: false });
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);

  const vShader = new Shader(
    { gl, type: "vertex" },
    `#version 300 es

    in vec3 a_position;
    in vec2 a_texturePosition;

    uniform mat4 u_projection;

    out vec2 v_texturePosition;

    void main() {
        vec4 position = u_projection * vec4(a_position, 1);
        float variance = 1.f / (position.z + 1.f);

        vec4 result = vec4(position.x, position.y * variance, -.5f * (position.z - 1.f) * variance, position.w * variance);
        gl_Position = result;

        v_texturePosition = a_texturePosition;
    }
`
  );

  const fShader = new Shader(
    { gl, type: "fragment" },
    `#version 300 es
    precision mediump float;

    uniform sampler2D u_texture;

    in vec2 v_texturePosition;
    out vec4 output_color;

    void main() {
        vec4 color = texture(u_texture, v_texturePosition.st);
        if (color.a == 0.0) {
            discard;
        }
        output_color = color;
    }
`
  );

  const program = new Program({ gl, projection: "projection" });
  program.attach(vShader, fShader).link();

  const [wallTex, floorTex, charTex, enemyTex] = await Promise.all([
    loadTextureFromImgUrl({
      gl,
      src: "assets/Back Wall.png",
      name: "wall",
    }),
    loadTextureFromImgUrl({
      gl,
      src: "assets/Floor 2.png",
      name: "floor",
    }),
    loadTextureFromImgUrl({
      gl,
      src: "assets/Hero Breathing.png",
      name: "idle",
    }),
    loadTextureFromImgUrl({
      gl,
      src: "assets/Enemy.png",
      name: "enemy",
    }),
  ]);

  // the division by 2 is because the textures are designed for retina
  const floorDims = {
    w: floorTex.w / TEX_PIXELS_PER_METER,
    h: 34 / TEX_PIXELS_PER_METER,
    d: 175 / TEX_PIXELS_PER_METER,
    boundary: 175 / 209,
  };

  const wall = new SpriteSet(wallTex, {
    // prettier-ignore
    "main": [[
        wallTex.w / TEX_PIXELS_PER_METER, -floorDims.d/2, wallTex.h/TEX_PIXELS_PER_METER, 1, 0,
        wallTex.w / TEX_PIXELS_PER_METER, -floorDims.d/2, 0, 1, 1,
        0, -floorDims.d/2, wallTex.h/TEX_PIXELS_PER_METER, 0, 0,
        0, -floorDims.d/2, 0, 0, 1,
      ]],
  });

  const floor = new SpriteSet(floorTex, {
    // prettier-ignore
    "main": [[
        floorDims.w,  floorDims.d/2, -floorDims.h, 1,                  1,
                  0,  floorDims.d/2, -floorDims.h, 0,                  1,
        floorDims.w,  floorDims.d/2,            0, 1, floorDims.boundary,
                  0,  floorDims.d/2,            0, 0, floorDims.boundary,
        floorDims.w, -floorDims.d/2,            0, 1,                  0,
                  0, -floorDims.d/2,            0, 0,                  0,
      ]],
  });

  const charW = 296;
  const charH = 434;

  const charWInM = charW / TEX_PIXELS_PER_METER;

  const numCharIdleFrames = 16;
  const charSprite = new SpriteSet(charTex, {
    // prettier-ignore
    "idle": spriteSheet({
      x: charWInM / 2,
      width: charW / TEX_PIXELS_PER_METER,
      height: charH / TEX_PIXELS_PER_METER,
      texWidth: charW / charTex.w,
      texHeight: charH / charTex.h,
      numPerRow: 6,
      count: numCharIdleFrames
    }),
  });

  const fadeWidth = 32;
  const fadeTexture = loadTextureFromRawBitmap({
    name: "fade",
    width: fadeWidth,
    height: fadeWidth,
    gl,
    bmp: makeQuadraticDropoff(fadeWidth, fadeWidth, 0.01),
  });

  const enemyRInPixels = 54;
  const enemyIdleFrames = 6;
  const enemyR = enemyRInPixels / TEX_PIXELS_PER_METER;
  const enemySprite = new SpriteSet(enemyTex, {
    // prettier-ignore
    "blink": spriteSheet({
      x: enemyR,
      width: 2 * enemyR,
      height: 2 * enemyR,
      texWidth: 2 * enemyRInPixels / enemyTex.w,
      texHeight: 2 * enemyRInPixels / enemyTex.h,
      numPerRow: 2,
      count: enemyIdleFrames
    }),
  });

  const fade = new SpriteSet(fadeTexture, {
    // prettier-ignore
    "main": [[
       .5 * fadeWidth / TEX_PIXELS_PER_METER, 0, -.5 * fadeWidth / TEX_PIXELS_PER_METER, 1, 0,
       .5 * fadeWidth / TEX_PIXELS_PER_METER, 0,  .5 * fadeWidth / TEX_PIXELS_PER_METER, 1, 1,
      -.5 * fadeWidth / TEX_PIXELS_PER_METER, 0, -.5 * fadeWidth / TEX_PIXELS_PER_METER, 0, 0,
      -.5 * fadeWidth / TEX_PIXELS_PER_METER, 0,  .5 * fadeWidth / TEX_PIXELS_PER_METER, 0, 1,
    ]],
  });

  let mouseX = 0;
  let mouseY = 0;

  // makes the viewport 40m wide
  // prettier-ignore
  const projection = new Float32Array([
    2 * PIXELS_PER_METER / width, 0,    0, 0,
    0,    -2 * PIXELS_PER_METER / height, 1/4, 0,
    0,    2 * PIXELS_PER_METER / height, 0, 0,
    -1,   -1,   0, 1,
  ]);

  const particles = [];

  let startTime = Date.now();
  let lastLoopRun = Date.now();
  let lastTimeDiff = 0;

  const charX = 4;
  const spawnHertz = 10;

  const shipLength = 100;
  const wave1 = (isFar) => {
    const time = lastTimeDiff + (isFar ? 170 : 0);
    return Math.sin((Math.PI * time) / 8) / 2;
  };
  const wave2 = (isFar) => {
    const time = lastTimeDiff + (isFar ? 130 : 0);
    return Math.sin((Math.PI * time) / 3) / 8;
  };

  function renderStep(gl, program) {
    const newTime = Date.now();
    const stepSize = (newTime - lastLoopRun) / 1000;
    lastLoopRun = newTime;
    fpsNode.innerHTML = `fps=${Math.round(1 / stepSize)}`;

    program.stack.pushAbsolute(projection);

    const timeDiff = (newTime - startTime) / 1000;

    const toSpawn =
      Math.floor(spawnHertz * timeDiff) - Math.floor(spawnHertz * lastTimeDiff);
    for (let i = 0; i < toSpawn; i++) {
      const random = Math.random() - 0.5;
      const angle = (random * Math.PI) / 4 + Math.PI / 2;
      const speed = Math.random() * 2 + 1; // measured in meters per second

      const x = charX - charWInM / 2 + 282 / TEX_PIXELS_PER_METER;
      const z = (charH - 108) / TEX_PIXELS_PER_METER;
      const dz = speed * Math.sin(angle);
      const dx = speed * Math.cos(angle);

      if (particles.length > 100) {
        particles.shift();
      }

      particles.push({
        dead: false,
        x,
        y: 0,
        z,
        dx,
        dy: 0.1 * Math.sin(2 * Math.PI * Math.random()),
        dz,
      });
    }

    lastTimeDiff = timeDiff;

    // program.stack.pushYRotation(Math.sin(timeDiff / 4) / 4);

    // set the camera
    program.stack.pushTranslation(-1.5, 0, floorDims.d / 2 + floorDims.h + 0.5);

    // rock the boat
    const bowY = wave1(false) + wave2(false);
    const sternY = wave1(true) + wave2(true);
    const shipAngle = Math.asin((bowY - sternY) / shipLength);
    program.stack.pushYRotation(shipAngle);
    program.stack.pushTranslation(0, 0, (bowY + sternY) / 2);

    const normalZ = Math.cos(shipAngle);
    const normalX = Math.sin(shipAngle);

    wall.bindTo(program);
    wall.renderSpriteDatumPrebound("main", 0);

    floor.bindTo(program);
    floor.renderSpriteDatumPrebound("main", 0);

    program.stack.pushTranslation(charX, 0, 0);
    charSprite.bindTo(program);
    charSprite.renderSpriteDatumPrebound(
      "idle",
      Math.floor(12 * timeDiff) % numCharIdleFrames
    );
    program.stack.pop();

    fade.bindTo(program);
    particles.forEach((particle) => {
      if (!particle.dead) {
        particle.dz -= normalZ * 9.8 * stepSize;
        particle.dx -= normalX * 9.8 * stepSize;

        particle.x += particle.dx * stepSize;
        particle.y += particle.dy * stepSize;
        particle.z += particle.dz * stepSize;

        if (particle.z < 0) {
          particle.z = -particle.z;
          particle.dz *= -0.25;
        } else if (particle.z < 0.01 && Math.abs(particle.dz) < 0.1) {
          particle.dead = true;
        }

        program.stack.pushTranslation(particle.x, particle.y, particle.z);
        fade.renderSpriteDatumPrebound("main", 0);
        program.stack.pop();
      }
    });

    program.stack.pop();
    program.stack.pop();
    program.stack.pop();

    program.stack.pushTranslation(
      mouseX / PIXELS_PER_METER,
      0,
      (height - mouseY) / PIXELS_PER_METER
    );

    const maybeFrame = Math.floor(8 * timeDiff) % (enemyIdleFrames + 8 * 4);
    enemySprite.bindTo(program);
    enemySprite.renderSpriteDatumPrebound(
      "blink",
      maybeFrame < enemyIdleFrames ? maybeFrame : 0
    );

    program.runInFrame(renderStep);
  }

  program.runInFrame(renderStep);

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

function makeQuadraticDropoff(width, height, brightRadius) {
  const bitmap = new Uint8Array(4 * width * height);

  const getDistanceSquared = (pixelDx, pixelDy) => {
    const dx = pixelDx / TEX_PIXELS_PER_METER;
    const dy = pixelDy / TEX_PIXELS_PER_METER;
    return dx * dx + dy * dy;
  };

  const middleX = width / 2;
  const middleY = height / 2;

  const brightRadiusSquared = brightRadius * brightRadius;
  const edgeValue = Math.min(
    getDistanceSquared(middleX, 0),
    getDistanceSquared(middleY, 0)
  );

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const offset = 4 * (y * width + x);
      const distanceSquared = getDistanceSquared(x - middleX, y - middleY);

      if (distanceSquared <= brightRadiusSquared) {
        bitmap[offset + 0] = 255;
        bitmap[offset + 1] = 255;
        bitmap[offset + 2] = 255;
        bitmap[offset + 3] = 255;
      } else {
        const concentration = Math.sqrt(brightRadiusSquared / distanceSquared);

        const primary = Math.floor(256 * concentration);
        const secondary = Math.floor(256 * concentration * concentration);

        bitmap[offset + 0] = 255;
        bitmap[offset + 1] = secondary;
        bitmap[offset + 2] = secondary;
        bitmap[offset + 3] = distanceSquared >= edgeValue ? 0 : primary;
      }
    }
  }

  return bitmap;
}

function spriteSheet({
  x = 0,
  y = 0,
  z = 0,
  width,
  height,
  texWidth,
  texHeight,
  numPerRow,
  count,
}) {
  const result = [];
  for (let i = 0; i < count; i++) {
    const row = Math.floor(i / numPerRow);
    const col = i % numPerRow;
    result.push(
      flatSprite({
        x,
        y,
        z,
        width,
        height,
        texStartX: col * texWidth,
        texEndX: (col + 1) * texWidth,
        texStartY: row * texHeight,
        texEndY: (row + 1) * texHeight,
      })
    );
  }
  return result;
}

function flatSprite({
  x = 0,
  y = 0,
  z = 0,
  width,
  height,
  texStartX,
  texStartY,
  texEndX,
  texEndY,
}) {
  // prettier-ignore
  return [
    width - x, y,         -z,   texEndX,   texEndY,
           -x, y,         -z, texStartX,   texEndY,
    width - x, y, height - z,   texEndX, texStartY,
           -x, y, height - z, texStartX, texStartY,
  ];
}

window.onload = onLoad;

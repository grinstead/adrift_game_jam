import {
  Program,
  Shader,
  loadTextureFromImgUrl,
  loadTextureFromRawBitmap,
  doAnimationFrame,
} from "./swagl.js";
import { GameLoop } from "./webgames/GameLoop.js";
import { SpriteSet, Sprite } from "./sprites.js";
import { InputManager } from "./webgames/Input.js";
import { Lighting } from "./lighting.js";
import {
  TEX_PIXEL_PER_PIXEL,
  PIXELS_PER_METER,
  TEX_PIXELS_PER_METER,
  ROOM_DEPTH_RADIUS,
} from "./SpriteData.js";

async function onLoad() {
  const fpsNode = document.getElementById("fps");
  const canvas = document.getElementById("canvas");
  const computedStyle = window.getComputedStyle(canvas);

  const input = new InputManager(document.body);
  input.setKeysForAction("left", ["a", "ArrowLeft"]);
  input.setKeysForAction("right", ["d", "ArrowRight"]);
  input.setKeysForAction("showLights", ["l"]);

  let width = parseInt(computedStyle.getPropertyValue("width"), 10);
  let height = parseInt(computedStyle.getPropertyValue("height"), 10);

  let debugShowLights = false;

  const ratio = 1; // window.devicePixelRatio || 1;
  const canvasWidth = ratio * width;
  const canvasHeight = ratio * height;
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  // prettier-ignore
  const projection = new Float32Array([
    2 * PIXELS_PER_METER / width, 0,    0, 0,
    0,    -2 * PIXELS_PER_METER / height, 1/4, 0,
    0,    2 * PIXELS_PER_METER / height, 0, 0,
    -1,   -1,   0, 1,
  ]);

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
    float variance = 1.f / (position.z + 1.f);

    vec4 result = vec4(position.x, position.y * variance, -.5f * (position.z - 1.f) * variance, position.w * variance);
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
    vec4 clipSpace = vec4(.5f * (v_clipSpace.x + 1.f), -.5f * (v_clipSpace.y - 1.f), v_clipSpace.z, v_clipSpace.w);

    vec4 color = texture(u_texture, v_texturePosition.st);
    if (color.a == 0.0) {
        discard;
    }

    vec4 light = texture(u_lighting, clipSpace.xy);
    output_color = vec4(
      min(1.f, light.x + color.x * light.a),
      min(1.f, light.y + color.y * light.a),
      min(1.f, light.z + color.z * light.a),
      color.a
    );
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

  const [wallTex, floorTex, charTex, enemyTex, charWalkTex] = await Promise.all(
    [
      loadTextureFromImgUrl({
        gl,
        src: "assets/Back Wall.png",
        name: "wall",
      }),
      loadTextureFromImgUrl({
        gl,
        src: "assets/new floor Floor.png",
        name: "floor",
      }),
      loadTextureFromImgUrl({
        gl,
        src: "assets/Hero Breathing with axe.png",
        name: "idle",
      }),
      loadTextureFromImgUrl({
        gl,
        src: "assets/Enemy.png",
        name: "enemy",
      }),
      loadTextureFromImgUrl({
        gl,
        src: "assets/Hero Walking with axe.png",
        name: "walk",
      }),
    ]
  );

  // the division by 2 is because the textures are designed for retina
  const floorDims = {
    top: 52 / floorTex.h,
    w: floorTex.w / TEX_PIXELS_PER_METER,
    h: (256 - 218) / TEX_PIXELS_PER_METER,
    d: (218 - 52) / TEX_PIXELS_PER_METER,
    boundary: 218 / floorTex.h,
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
        floorDims.w, -floorDims.d/2,            0, 1,      floorDims.top,
                  0, -floorDims.d/2,            0, 0,      floorDims.top,
      ]],
  });

  const charW = 405;
  const charH = 434;
  const charCenter = 220 / charW;

  const charWInM = charW / TEX_PIXELS_PER_METER;
  const flareX = (387 / charW - charCenter) * charWInM;

  const charSprite = new SpriteSet(charTex, {
    // prettier-ignore
    "right": characterSpriteSheet({
      xPercent: charCenter,
      widthInPixels: charW,
      heightInPixels: charH,
      texture: charTex,
      numPerRow: 5,
      count: 16
    }),
    // prettier-ignore
    "left": characterSpriteSheet({
      xPercent: 1 - charCenter,
      widthInPixels: charW,
      heightInPixels: charH,
      texture: charTex,
      numPerRow: 5,
      count: 16,
      reverseX: true,
    }),
  });

  const charWalkSprite = new SpriteSet(charWalkTex, {
    // prettier-ignore
    "right": characterSpriteSheet({
      xPercent: 258 / 424,
      widthInPixels: 424,
      heightInPixels: 442,
      texture: charWalkTex,
      numPerRow: 2,
      count: 8
    }),
    // prettier-ignore
    "left": characterSpriteSheet({
      xPercent: 1 - 258 / 424,
      widthInPixels: 424,
      heightInPixels: 442,
      texture: charWalkTex,
      numPerRow: 2,
      count: 8,
      reverseX: true,
    }),
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

  const lightingSprite = new SpriteSet(lighting.lightingTex(), {
    // prettier-ignore
    "main": [
      flatSprite({
        width: 2,
        height: 1,
        texStartX: 0,
        texStartY: 0,
        texEndX: 1,
        texEndY: 1,
      }),
    ],
  });

  const sparkSprite = makeSparkSprite(gl);

  let mouseX = 0;
  let mouseY = 0;

  const particles = [];

  let startTime = Date.now();
  let lastLoopRun = Date.now();
  let timeDiff = 0;
  let avgFps = 0;

  let charX = 4;
  let charDx = 0;
  let charFacingLeft = false;
  const spawnHertz = 48;

  const shipLength = 100;
  const wave1 = (isFar) => {
    const time = timeDiff + (isFar ? 170 : 0);
    return Math.sin((Math.PI * time) / 8) / 2;
  };
  const wave2 = (isFar) => {
    const time = timeDiff + (isFar ? 130 : 0);
    return Math.sin((Math.PI * time) / 3) / 8;
  };

  let shipAngle, normalX, normalZ, shipDz;
  function movePieces() {
    const newTime = Date.now();
    const stepSize = (newTime - lastLoopRun) / 1000;
    lastLoopRun = newTime;

    avgFps = 1 / stepSize / 16 + (15 / 16) * avgFps;
    fpsNode.innerHTML = `fps=${Math.round(avgFps)}`;

    const newTimeDiff = (newTime - startTime) / 1000;

    // calculate the boat rocking
    const bowY = wave1(false) + wave2(false);
    const sternY = wave1(true) + wave2(true);
    shipAngle = Math.asin((bowY - sternY) / shipLength);
    normalZ = Math.cos(shipAngle);
    normalX = Math.sin(shipAngle);
    shipDz = (bowY + sternY) / 2;

    // move character
    const charSpeedX = 1.2 * input.getSignOfAction("left", "right");
    charDx = charSpeedX * stepSize;
    if (charDx !== 0) {
      charX += charDx;
      charFacingLeft = charDx < 0;
    }

    const toSpawn =
      Math.floor(spawnHertz * newTimeDiff) - Math.floor(spawnHertz * timeDiff);
    for (let i = 0; i < toSpawn; i++) {
      const random = Math.random() - 0.5;
      const angle = random * (Math.PI / 4) + Math.PI / 2;
      const speed = Math.random() * 2 + 1.4; // measured in meters per second

      const x =
        charX + (flareX - (charDx ? 0.05 : 0)) * (charFacingLeft ? -1 : 1);
      const z = (charH - 106) / TEX_PIXELS_PER_METER;
      const dz = speed * Math.sin(angle);
      const dx = speed * Math.cos(angle) + charSpeedX;

      if (particles.length > 100) {
        particles.pop();
      }

      particles.push({
        dead: false,
        x,
        y: 0,
        z,
        dx,
        dy: 0.1 * Math.sin(2 * Math.PI * Math.random()),
        dz,
        startTime: newTimeDiff,
        deathTime: newTimeDiff + 1.5,
        onFloor: false,
      });
    }

    // move all the particles
    const friction = 1 - 0.8 * stepSize;
    particles.forEach((particle) => {
      const declaredDead = particle.dead;
      if (!declaredDead && newTimeDiff < particle.deathTime) {
        let dz = particle.dz;
        if (particle.onFloor) {
          particle.dx *= friction;
          particle.dy *= friction;
        } else {
          dz -= normalZ * 9.8 * stepSize;
          particle.dx -= normalX * 9.8 * stepSize;
          particle.dz = dz;
        }

        particle.x += particle.dx * stepSize;
        particle.y += particle.dy * stepSize;
        particle.z += particle.dz * stepSize;

        const y = particle.y;
        if (y < -ROOM_DEPTH_RADIUS || y > ROOM_DEPTH_RADIUS) {
          const reflectAgainst = y > 0 ? ROOM_DEPTH_RADIUS : -ROOM_DEPTH_RADIUS;
          particle.y = reflectAgainst + (reflectAgainst - y);
          particle.dy = -particle.dy;
        }

        if (particle.z < 0) {
          if (dz > -0.01) {
            particle.z = PIXELS_PER_METER;
            particle.dz = 0;
            particle.onFloor = true;
          } else {
            particle.z = -particle.z;
            particle.dz = -0.25 * dz;
          }
        }
      } else if (!declaredDead) {
        particle.dead = true;
      }
    });

    particles.sort(sortParticles);

    timeDiff = newTimeDiff;
  }

  function renderInCamera(gl, program, subcode) {
    program.stack.pushAbsolute(projection);

    // set the camera
    program.stack.pushTranslation(-1.5, 0, floorDims.d / 2 + floorDims.h + 0.5);

    // rock the boat
    program.stack.pushYRotation(shipAngle);
    program.stack.pushTranslation(0, 0, shipDz);

    subcode(gl, program);

    program.stack.pop();
    program.stack.pop();
    program.stack.pop();
  }

  function renderInSceneContent(gl, program) {
    wall.bindTo(program);
    wall.renderSpriteDatumPrebound("main", 0);

    floor.bindTo(program);
    floor.renderSpriteDatumPrebound("main", 0);

    program.stack.pushTranslation(charX, 0, 0);
    if (charDx === 0) {
      charSprite.bindTo(program);
      charSprite.renderSpriteDatumPrebound(
        charFacingLeft ? "left" : "right",
        Math.floor(12 * timeDiff)
      );
    } else {
      charWalkSprite.bindTo(program);
      charWalkSprite.renderSpriteDatumPrebound(
        charFacingLeft ? "left" : "right",
        Math.floor(8 * timeDiff)
      );
    }
    program.stack.pop();

    sparkSprite.bindTo(program);
    particles.forEach((particle) => {
      if (!particle.dead) {
        program.stack.pushTranslation(particle.x, particle.y, particle.z);
        program.stack.pushYRotation(
          (particle.dx >= 0 ? Math.PI : 0) +
            Math.atan(particle.dz / particle.dx)
        );

        sparkSprite.renderSpriteDatumPrebound(
          "fading",
          Math.floor(12 * (timeDiff - particle.startTime))
        );
        program.stack.pop();
        program.stack.pop();
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
  }

  function renderStep() {
    if (input.numPresses("showLights") % 2) {
      debugShowLights = !debugShowLights;
    }

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

function characterSpriteSheet({
  xPercent = 0,
  yInM = 0,
  zPercent = 0,
  widthInPixels,
  heightInPixels,
  texture,
  numPerRow,
  count,
  reverseX = false,
}) {
  const width = widthInPixels / TEX_PIXELS_PER_METER;
  const height = heightInPixels / TEX_PIXELS_PER_METER;

  return spriteSheet({
    x: xPercent * width,
    y: yInM,
    z: zPercent * height,
    width,
    height,
    texWidth: widthInPixels / texture.w,
    texHeight: heightInPixels / texture.h,
    numPerRow,
    count,
    reverseX,
  });
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
  reverseX = false,
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
        reverseX,
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
  reverseX = false,
}) {
  let startX, endX;
  if (!reverseX) {
    startX = texStartX;
    endX = texEndX;
  } else {
    startX = texEndX;
    endX = texStartX;
  }
  // prettier-ignore
  return [
    width - x, y,         -z,   endX,   texEndY,
           -x, y,         -z, startX,   texEndY,
    width - x, y, height - z,   endX, texStartY,
           -x, y, height - z, startX, texStartY,
  ];
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

window.onload = onLoad;

export const TEX_PIXEL_PER_PIXEL = 2;
export const PIXELS_PER_METER = 180;
export const TEX_PIXELS_PER_METER = TEX_PIXEL_PER_PIXEL * PIXELS_PER_METER;

export const ROOM_DEPTH_RADIUS = 0.5;
export const ROOM_HEIGHT = 2.5;

export const TENTACLE_FRAMES = 29;

export const WALL_META = {
  portholeR: 100,
  portholeRNextPowerOf2: 128,
  portholeXs: [2423],
  portholeD: 353,
};

/**
 * Data I've collected in pixels of what we're trying to render
 */
export const LAYOUT_TARGETS = {
  // y values, measured in pixels, centered on the forward most point of the ceiling
  CEIL_PAD: -70,
  CEIL_FOREGROUND: 0,
  CEIL_BACKGROUND: 216,
  FLOOR_BACKGROUND: 752,
  FLOOR_FOREGROUND: 968,
  FLOOR_PAD: 1038,
};

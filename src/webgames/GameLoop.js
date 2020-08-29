const FPS_DAMPENER = 0.1;

/**
 * The GameLoop bla bla bla
 */
export class GameLoop {
  constructor() {
    this.onLoop = null;
    this.fps = 60;
    this._avgFps = 0; // running average
    this._interval = 0;
    this._nextTimeout = 0;
    this._loopId = 0;
    this._run = () => void runStep(this);
    this._lastRun = 0;
  }

  start(fps = this.fps) {
    this.fps = fps;

    if (!this._nextTimeout) {
      this._lastRun = 0;
      this._avgFps = fps;
      this._nextTimeout = setTimeout(this._run, 0);
    }
  }

  avgFps() {
    return this._avgFps;
  }

  isRunning() {
    return this._nextTimeout !== 0;
  }

  stop() {
    const timeout = this._nextTimeout;
    if (timeout) {
      this._nextTimeout = 0;
      clearTimeout(timeout);
    }
  }
}

// Always bound to a GameLoop
function runStep(loop) {
  // this was the timeout used to run this step
  const invocation = loop._nextTimeout;

  const time = Date.now();

  // update the rolling average
  const lastRun = loop._lastRun;
  if (lastRun !== 0) {
    const hertz = 1000 / (time - lastRun);
    loop._avgFps = FPS_DAMPENER * hertz + (1 - FPS_DAMPENER) * loop._avgFps;
  }
  loop._lastRun = time;

  try {
    const onLoop = loop.onLoop;
    onLoop();
  } finally {
    // Loop
    const delay = 1000 / loop.fps - (Date.now() - time);
    if (loop._nextTimeout === invocation) {
      loop._nextTimeout = setTimeout(loop._run, Math.max(delay, 0));
    }
  }
}

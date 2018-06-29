
declare function require(x: string): any;
require('./clock.css');

export interface IClockOptions {
  bgColor?: string;
  faceColor: string;
  hourColor: string;
  minColor: string;
  secColor: string;
}

function doNothing() {}

export function clock(element: HTMLElement | null, options: Partial<IClockOptions> = {}): () => void {
  if (null == element) {
    return doNothing;
  }

  while (element.children.length) {
    element.removeChild(element.children[0]);
  }
  element.classList.add('clock');

  const face = document.createElement('canvas');
  face.classList.add('face');
  const hands = document.createElement('canvas');
  hands.classList.add('hands');
  const seconds = document.createElement('canvas');
  seconds.classList.add('seconds');

  element.appendChild(face);
  element.appendChild(hands);
  element.appendChild(seconds);

  let clockState: IClockState = {
    face, hands, seconds,
    lastPaintHands: new Date(0),
    lastPaintSeconds: new Date(0),
    paintFace: true,
    secondMode: SecondMode.SMOOTH,
    options: getOptions(options),
    stop: false
  };
  queueUpdate(clockState);

  const visibilityChangeListener = (event) => {
    console.log(`visibility changed: ${document.hidden ? 'hidden' : 'visible'}`, event.type, event);
  };
  document.addEventListener('visibilitychange', visibilityChangeListener);
  return () => {
    clockState.stop = true;
    document.removeEventListener('visibilitychange', visibilityChangeListener);
    //queueUpdate(clockState);
  };
}

enum SecondMode {
  NONE,
  SMOOTH,
  CHOPPY
}

interface IClockState {
  face: HTMLCanvasElement;
  hands: HTMLCanvasElement;
  seconds: HTMLCanvasElement;
  lastPaintHands: Date;
  lastPaintSeconds: Date;
  secondMode: SecondMode;
  paintFace: boolean;
  options: IClockOptions;
  stop: boolean;
}

function queueUpdate(clockState: IClockState) {
  const {
    face, hands, seconds,
    stop,
    lastPaintHands,
    lastPaintSeconds,
  } = clockState;

  let { secondMode } = clockState;

  if (stop) {
    nuke(face);
    nuke(hands);
    nuke(seconds);
    return;
  }

  const delta = Date.now() - Math.max(+lastPaintHands, +lastPaintSeconds);

  if (document.hidden && secondMode === SecondMode.SMOOTH) {
    console.log('downgrading secondMode, document is hidden');
    secondMode = SecondMode.CHOPPY;
  }

  if (secondMode === SecondMode.SMOOTH || delta > 1000) {
    doPaint(clockState);
  } else {
    let sleepTime;
    if (secondMode == SecondMode.NONE) {
      sleepTime = 60000 - (Date.now() % 60000) + 1;
    } else {
      sleepTime = 1000 - (Date.now() % 1000) + 1;
    }
    console.log(`need to sleep ${sleepTime}ms`);
    setTimeout(() => doPaint(clockState), sleepTime);
  }
}

function doPaint(clockState: IClockState) {
  const {
    face, hands, seconds,
    stop,
    options,
    lastPaintHands,
    lastPaintSeconds,
  } = clockState;

  if (clockState.paintFace) {
    console.log('need to paint face');
    window.requestAnimationFrame(() => {
      paintFace(clockState.face, clockState.options);
      clockState.paintFace = false;
    });
  }
  const now = new Date();
  let paintDone = false;
  if (lastPaintHands.getMinutes() != now.getMinutes() || lastPaintHands.getHours() != now.getHours()) {
    console.log('need to paint hands');
    window.requestAnimationFrame(() => {
      clockState.lastPaintHands = paintHands(clockState.hands, clockState.options);
      clockState.lastPaintSeconds = paintSeconds(clockState.seconds, clockState.options);
      queueUpdate(clockState);
    });
    paintDone = true;
  }
  if (clockState.secondMode != SecondMode.NONE && !paintDone) {
    paintDone = true;
    window.requestAnimationFrame(() => {
      clockState.lastPaintSeconds = paintSeconds(clockState.seconds, clockState.options);
      queueUpdate(clockState);
    });
  }
  if (!paintDone) {
    const delta = +now - Math.max(+lastPaintHands, +lastPaintSeconds);
    console.log('no need to paint anything???!?!?', delta, new Date(), lastPaintHands, lastPaintSeconds);
    setTimeout(() => doPaint(clockState), 100);
  }
}

function nuke(element: HTMLElement) {
  if (element && element.parentElement) {
    element.parentElement.removeChild(element);
  }
}

function getOptions(options: Partial<IClockOptions>): IClockOptions {
  const {
    bgColor = undefined,
    faceColor = '#333333',
    hourColor = '#6666666',
    minColor = '#666666',
    secColor = '#ff4422',
  } = options || {};
  return {
    bgColor,
    faceColor,
    hourColor,
    minColor,
    secColor
  };
}

function paintFace(face: HTMLCanvasElement, options: IClockOptions) {
  const { faceColor, bgColor } = options;
  const parentElement = face.parentElement;
  if (null == parentElement) {
    return;
  }
  const dpr = window.devicePixelRatio;
  const w = parentElement.offsetWidth;
  const h = parentElement.offsetHeight;
  const wd = Math.floor(dpr*w);
  const hd = Math.floor(dpr*h);
  if (face.width != wd || face.height != hd) {
    face.width = wd;
    face.height = hd;
  }

  const ctx = face.getContext('2d');
  if (null == ctx) {
    console.log('got no context("2d"');
    return;
  }
  const w2 = wd/2;
  const h2 = hd/2;

  ctx.clearRect(0, 0, wd, hd);
  if (null != bgColor) {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0,0, wd, hd);
  }

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.fillStyle = faceColor;
  ctx.strokeStyle = faceColor;
  ctx.lineWidth = 5*dpr;
  ctx.font = `${Math.ceil(25*dpr)}px Helvetica,Courier,sans bold`;
  ctx.beginPath();
  for (var d = 1; d <= 12; ++d) {
      var a = (d + 9) / 12.0 * 2.0 * Math.PI;

      const x = Math.cos(a);
      const y = Math.sin(a);

      let l1 = Math.min(w2,h2)*0.9;
      let l2 = l1 * 0.9;
      let l3 = l1 * 0.8;
      let xs, ys, xe, ye, xt, yt;

      xs = w2 + l1 * x;
      ys = h2 + l1 * y;
      xe = w2 + l2 * x;
      ye = h2 + l2 * y;
      xt = w2 + l3 * x;
      yt = h2 + l3 * y;

      ctx.moveTo(xs, ys);
      ctx.lineTo(xe, ye);

//      ctx.fillText('' + d, xt, yt);
  }
  ctx.stroke();
}

function paintHands(hands: HTMLCanvasElement, options: IClockOptions): Date {
  const { hourColor } = getOptions(options);
  const parentElement = hands.parentElement;
  if (null == parentElement) {
    return new Date(0);
  }
  const dpr = window.devicePixelRatio;
  const w = parentElement.offsetWidth;
  const h = parentElement.offsetHeight;
  const wd = Math.floor(dpr*w);
  const hd = Math.floor(dpr*h);
  if (hands.width != wd || hands.height != hd) {
    hands.width = wd;
    hands.height = hd;
  }

  const ctx = hands.getContext('2d');
  if (null == ctx) {
    console.log('got no context("2d"');
    return new Date(0);
  }
  const w2 = wd/2;
  const h2 = hd/2;

  ctx.clearRect(0, 0, wd, hd);

  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();

  ctx.strokeStyle = hourColor;
  ctx.lineWidth = 3*dpr;
  ctx.beginPath();
  for (let i of [ [(hours*5+minutes/60*5)%60, 0.55], [minutes, 0.7] ]) {
    const [ v, len ] = i;
    const a = v*2*Math.PI/60-Math.PI/2;
    const x = Math.cos(a);
    const y = Math.sin(a);

    let l1 = Math.min(w2,h2)*len;

    ctx.moveTo(w2, h2);
    ctx.lineTo(w2+x*l1, h2+y*l1);
  }
  ctx.stroke();

  return now;
}

function paintSeconds(secondsCanvas: HTMLCanvasElement, options: IClockOptions): Date {
  const { secColor } = getOptions(options);
  const parentElement = secondsCanvas.parentElement;
  if (null == parentElement) {
    return new Date(0);
  }
  const dpr = window.devicePixelRatio;
  const w = parentElement.offsetWidth;
  const h = parentElement.offsetHeight;
  const wd = Math.floor(dpr*w);
  const hd = Math.floor(dpr*h);
  if (secondsCanvas.width != wd || secondsCanvas.height != hd) {
    secondsCanvas.width = wd;
    secondsCanvas.height = hd;
  }

  const ctx = secondsCanvas.getContext('2d');
  if (null == ctx) {
    console.log('got no context("2d"');
    return new Date(0);
  }
  const w2 = wd/2;
  const h2 = hd/2;

  ctx.clearRect(0, 0, wd, hd);

  const now = new Date();
  const seconds = now.getSeconds();
  const millis = now.getMilliseconds();

  ctx.strokeStyle = secColor;
  ctx.lineWidth = 1*dpr;
  ctx.beginPath();
  for (let i of [ [seconds+(millis/1000), 0.7] ]) {
    const [ v, len ] = i;
    const a = v*2*Math.PI/60-Math.PI/2;
    const x = Math.cos(a);
    const y = Math.sin(a);

    let l1 = Math.min(w2,h2)*len;

    ctx.moveTo(w2, h2);
    ctx.lineTo(w2+x*l1, h2+y*l1);
  }
  ctx.stroke();

  return now;
}

import Canvas from './Canvas';
import Cursor, { CURSOR_STATE } from './Cursor';
import HandposeDetection from './HandposeDetection';
import Video from './Video';
import { BrowserFrame, CursorPoint, HANDPOSES, isFocusable } from './utlis';

const FLIP_VIDEO_HORIZONTAL = true;

class CursorControl {
  private static instance: CursorControl;
  private id = 'cursorControl';
  private wrapper: HTMLDivElement;
  private video: Video;
  private canvas: Canvas;
  public cursor: Cursor;
  private frame: BrowserFrame;
  private handposeDetection: HandposeDetection;
  private doAnimationFrame: boolean = false;
  private showVideo: boolean = false;

  private constructor() {
    this.cursor = new Cursor();
  }

  public static getInstance(): CursorControl {
    if (!CursorControl.instance) {
      CursorControl.instance = new CursorControl();
    }

    return CursorControl.instance;
  }

  public destroy = async () => {
    this.doAnimationFrame = false;
    await new Promise((resolve) => window.setTimeout(resolve, 1000));
    this.video.destroy();
    this.handposeDetection.destroy();
    this.wrapper.remove();
    this.cursor.destroy();
    window.removeEventListener('resize', this.setFrame);
  };

  public initialize = async (activeCameraId: string = ''): Promise<void> => {
    if (Boolean(document.querySelector(`#${this.id}`))) await this.destroy();

    this.wrapper = document.createElement('div');
    this.wrapper.id = this.id;
    this.wrapper.style.position = 'fixed';
    this.wrapper.style.right = '0px';
    this.wrapper.style.bottom = '0px';
    this.wrapper.style.pointerEvents = '0px';
    this.wrapper.style.zIndex = '999';
    this.wrapper.style.pointerEvents = 'none';

    document.body.append(this.wrapper);

    this.video = Video.getInstance(this.wrapper);
    this.video.init();
    if (FLIP_VIDEO_HORIZONTAL)
      this.video.element.style.transform = 'scale(-1, 1)';
    this.video.element.style.opacity = '0';

    this.canvas = Canvas.getInstance(this.wrapper);
    this.canvas.init();
    this.canvas.element.style.position = 'absolute';
    this.canvas.element.style.left = '0px';
    this.canvas.element.style.top = '0px';

    await this.video.activate(activeCameraId);

    this.canvas.element.width = this.video.element.width;
    this.canvas.element.height = this.video.element.height;

    this.cursor.init();
    if (
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    ) {
      this.cursor.setCursorColor('white');
    } else {
      this.cursor.setCursorColor('black');
    }

    this.setFrame();
    window.addEventListener('resize', this.setFrame);

    this.handposeDetection = HandposeDetection.getInstance();
    await this.handposeDetection.setUp();

    this.cursor.addEventListener('click', (e) =>
      e.target.dispatchEvent(
        new MouseEvent('click', {
          view: window,
          bubbles: true,
          cancelable: true,
        })
      )
    );

    this.cursor.addEventListener('drag', (e) =>
      window.scrollTo(0, window.scrollY + e.movementY * -1)
    );

    this.cursor.addEventListener('mousedown', (e) =>
      this.cursor.setCursorStyle({ scale: '0.7' })
    );

    this.cursor.addEventListener('mouseup', (e) =>
      this.cursor.setCursorStyle({ scale: '1' })
    );

    this.cursor.addEventListener('move', (e) =>
      isFocusable(e.target)
        ? this.cursor.setCursorStyle({ scale: '1.5' })
        : this.cursor.setCursorStyle({ scale: '1' })
    );
  };

  private setFrame = () => {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    const videoRatio = this.video.element.width / this.video.element.height;
    const windowRatio = windowWidth / windowHeight;
    const adjustHorizontal = windowRatio <= videoRatio;

    const frameWidth = adjustHorizontal
      ? this.video.element.height * windowRatio
      : this.video.element.width;
    const frameHeight = adjustHorizontal
      ? this.video.element.height
      : this.video.element.width * (windowHeight / windowWidth);

    const left = adjustHorizontal
      ? (this.video.element.width - frameWidth) / 2
      : 0;
    const top = adjustHorizontal
      ? 0
      : (this.video.element.height - frameHeight) / 2;

    this.frame = { left, top, width: frameWidth, height: frameHeight };
  };

  private predict = async () => {
    if (!this.doAnimationFrame) return;
    const predictMiddelPoint = await this.handposeDetection.predictMiddelPoint(
      this.video.element
    );

    const point: CursorPoint = predictMiddelPoint
      ? {
          x: FLIP_VIDEO_HORIZONTAL
            ? this.video.element.width - predictMiddelPoint.center.x
            : predictMiddelPoint.center.x,
          y: predictMiddelPoint.center.y,
          size: predictMiddelPoint.distance / 2,
        }
      : null;

    this.showVideo && this.canvas.draw(point, this.frame);

    if (point) {
      const leftInFrame = point.x - this.frame.left;
      const topInFrame = point.y - this.frame.top;
      const leftInFrameRelative =
        ((100 / this.frame.width) * leftInFrame) / 100;
      const topInFrameRelative = ((100 / this.frame.height) * topInFrame) / 100;

      this.cursor.setCursorPosition(
        window.innerWidth * leftInFrameRelative,
        window.innerHeight * topInFrameRelative
      );

      const sizeRelative = ((100 / this.frame.height) * point.size) / 100;
      const pose =
        sizeRelative > 0.04 ? HANDPOSES.DEFAULT : HANDPOSES.INDEX_TO_THUMB;

      if (pose === HANDPOSES.INDEX_TO_THUMB) {
        this.cursor.setCursorState(CURSOR_STATE.PINCH);
      } else {
        this.cursor.setCursorState(CURSOR_STATE.OPEN);
      }
    }

    requestAnimationFrame(this.predict);
  };

  public startPrediction = () => {
    this.doAnimationFrame = true;
    this.predict();
  };

  public setShowVideo = (show: boolean) => {
    this.showVideo = show;
    this.wrapper.style.opacity = show ? '1' : '0';
    this.video.element.style.opacity = show ? '1' : '0';
  };

  public setActiveCameraId = async (id: string = '') => {
    await this.destroy();
    await this.initialize(id);
    this.startPrediction();
    this.setShowVideo(this.showVideo);
  };

  public getCameraIds = () =>
    this.video.cameras.reduce(
      (acc, current) => ({ ...acc, [current.deviceId]: current.label }),
      {}
    );
}

export default CursorControl;

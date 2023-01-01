import {
  APPLICATION_STATES,
  updateExtensionState,
} from '../helpers/chromeStorage';
import { LOG_TYPES, error, log } from '../helpers/log';
import Cursor from './cursor/Cursor';
import { CURSOR_STATE } from './cursor/Cursor.type';
import HandposeDetection, {
  HANDPOSES,
} from './handposeDetection/HandposeDetection';
import Video from './video/Video';

const ID = 'handtracking-cursor-control';

class InjectExtension {
  private app: HTMLDivElement;
  private video: HTMLVideoElement;
  private canvas: HTMLCanvasElement;
  private videoInstance: Video;
  private cursorInstance: Cursor;
  private handpose: HandposeDetection;

  constructor() {}

  public isActive = (): boolean => {
    const app = document.querySelector<HTMLDivElement>(`#${ID}`);
    return Boolean(app);
  };

  public start = async (): Promise<void> => {
    if (this.isActive()) {
      await this.destroy();
    }
    this.initDOM();
    await this.startAnalyzer();
  };

  public destroy = async (): Promise<void> => {
    if (!this.isActive()) {
      return;
    }
    this.destroyDOM();

    if (this.videoInstance) {
      await this.videoInstance.destroy();
      this.videoInstance = null;
    }

    if (this.cursorInstance) {
      await this.cursorInstance.destroy();
      this.cursorInstance = null;
    }

    await updateExtensionState({ appState: APPLICATION_STATES.IDLE });
  };

  private initDOM = () => {
    log(LOG_TYPES.INJECT, 'initDOM start');

    this.app = document.createElement('div');
    this.app.id = ID;
    this.app.style.position = 'fixed';
    this.app.style.inset = '0';
    this.app.style['pointer-events '] = 'none';
    this.app.style.opacity = '0';
    document.body.appendChild(this.app);

    this.video = document.createElement('video');
    this.video.style.display = 'none';
    this.app.appendChild(this.video);

    this.canvas = document.createElement('canvas');
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.transform = 'scaleX(-1)';
    this.app.appendChild(this.canvas);

    log(LOG_TYPES.INJECT, 'initDOM done');
  };

  private destroyDOM = () => {
    log(LOG_TYPES.INJECT, 'destroyDOM');

    this.app.remove();
  };

  public startAnalyzer = async (): Promise<void> => {
    this.videoInstance = new Video(this.app, this.video, this.canvas);
    await this.videoInstance.init();

    log(LOG_TYPES.INJECT, 'videoInstance init');

    this.cursorInstance = new Cursor();
    this.cursorInstance.init();

    log(LOG_TYPES.INJECT, 'cursorInstance init');

    this.handpose = new HandposeDetection(this.canvas);

    log(LOG_TYPES.INJECT, 'handpose init');

    /**
     * listeners
     */

    this.handpose.onDetectorSetUp(() => {
      log(LOG_TYPES.INJECT, 'onDetectorSetUp');

      updateExtensionState({ appState: APPLICATION_STATES.RUNNING });
    });

    this.handpose.onPositionUpdate((point) => {
      const x = window.innerWidth - point.position.x; // because transform: scaleX(-1) in index.css
      const y = point.position.y;

      this.cursorInstance.setCursorPosition(x, y);

      if (point.handpose === HANDPOSES.INDEX_TO_THUMB) {
        this.cursorInstance.setCursorState(CURSOR_STATE.PINCH);
      } else {
        this.cursorInstance.setCursorState(CURSOR_STATE.OPEN);
      }
    });

    this.cursorInstance.addEventListener('click', (e) => {
      log(LOG_TYPES.INJECT, 'Cursor click', e.target);

      const evt = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true,
      });
      e.target.dispatchEvent(evt);
    });

    this.cursorInstance.addEventListener('drag', (e) => {
      log(LOG_TYPES.INJECT, 'Cursor mousemove', e.target);

      window.scrollTo(0, window.scrollY + e.movementY * -1);
    });
  };
}

export default InjectExtension;

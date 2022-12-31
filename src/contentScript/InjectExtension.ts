import {
  APPLICATION_STATES,
  updateExtensionState,
} from '../helpers/chromeStorage';
import { log } from '../helpers/log';
import styles from './contentScript.css';
import Cursor from './cursor/Cursor';
import { CURSOR_STATE } from './cursor/Cursor.type';
import HandposeDetection, {
  HANDPOSES,
} from './handposeDetection/HandposeDetection';
import Video from './video/Video';

class InjectExtension {
  private app: HTMLDivElement;
  private video: HTMLVideoElement;
  private canvas: HTMLCanvasElement;
  private videoInstance: Video;
  private cursorInstance: Cursor;
  private handpose: HandposeDetection;

  constructor() {
    this.initDOM();
    this.startAnalyzer();
  }

  public destroy = async (): Promise<void> => {
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
    log('initDOM start');

    this.app = document.createElement('div');
    this.app.classList.add(styles.root);
    document.body.appendChild(this.app);

    this.video = document.createElement('video');
    this.video.classList.add(styles.video);
    this.app.appendChild(this.video);

    this.canvas = document.createElement('canvas');
    this.canvas.classList.add(styles.canvas);
    this.app.appendChild(this.canvas);

    log('initDOM done');
  };

  private destroyDOM = () => {
    log('destroyDOM');

    this.app.remove();
  };

  public startAnalyzer = async (): Promise<void> => {
    this.videoInstance = new Video(this.app, this.video, this.canvas);
    await this.videoInstance.init();

    log('videoInstance init');

    this.cursorInstance = new Cursor(styles.cursor);
    this.cursorInstance.init();

    log('cursorInstance init');

    this.handpose = new HandposeDetection(this.canvas);

    log('handpose init');

    /**
     * listeners
     */

    this.handpose.onDetectorSetUp(() => {
      console.log('onDetectorSetUp');

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
      log('Cursor click', e.target);

      const evt = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true,
      });
      e.target.dispatchEvent(evt);
    });

    this.cursorInstance.addEventListener('drag', (e) => {
      log('Cursor mousemove', e.target);

      window.scrollTo(0, window.scrollY + e.movementY * -1);
    });
  };
}

export default InjectExtension;

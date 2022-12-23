import styles from "./contentScript.css";
import { onMessageReceive } from "./helpers/chromeMessage";
import { MESSAGE_TYPES } from "./helpers/constants";
import Video from "./helpers/Video";
import Cursor from "./helpers/Cursor";
import { CURSOR_STATE } from "./helpers/Cursor.type";
import HandposeDetection, {
  HANDPOSES,
} from "./handposeDetection/handposeDetection";

let app: HTMLDivElement,
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  videoInstance: Video,
  cursorInstance: Cursor,
  handpose: HandposeDetection;

const init = () => {
  app = document.createElement("div");
  app.classList.add(styles.root);

  video = document.createElement("video");
  video.classList.add(styles.video);
  app.appendChild(video);

  canvas = document.createElement("canvas");
  canvas.classList.add(styles.canvas);
  app.appendChild(canvas);
};

const start = async () => {
  if (!app || !video || !canvas) init();

  videoInstance = new Video(app, video, canvas);
  await videoInstance.startUp();
  //console.log(videoInstance.devices);

  cursorInstance = new Cursor(styles.cursor);
  handpose = new HandposeDetection(canvas);

  handpose.onPositionUpdate((point) => {
    const x = window.innerWidth - point.position.x; // because transform: scaleX(-1) in index.css
    const y = point.position.y;

    cursorInstance.setCursorPosition(x, y);

    if (point.handpose === HANDPOSES.INDEX_TO_THUMB) {
      cursorInstance.setCursorState(CURSOR_STATE.PINCH);
    } else {
      cursorInstance.setCursorState(CURSOR_STATE.OPEN);
    }
  });

  cursorInstance.addEventListener("mousemove", (e) =>
    window.scrollTo(0, window.scrollY + e.movementY * -1)
  );
};

const stop = async () => {
  await videoInstance.shutDown();
  cursorInstance = null;
  handpose = null;
};

init();

onMessageReceive<boolean>(async (type, payload) => {
  if (type === MESSAGE_TYPES.SET_STATE) {
    if (payload) {
      await start();
    } else {
      await stop();
    }
  }
});

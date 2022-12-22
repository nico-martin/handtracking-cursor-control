import styles from "./index.css";
import Video from "./helpers/Video";
import Cursor from "./helpers/Cursor";
import { CURSOR_STATE } from "./helpers/Cursor.d";
import HandposeDetection, {
  HANDPOSES,
} from "./handposeDetection/handposeDetection";

const init = async (app) => {
  if (!app) return;

  app.classList.add(styles.root);

  const video: HTMLVideoElement = document.createElement("video");
  video.classList.add(styles.video);
  app.appendChild(video);

  const canvas: HTMLCanvasElement = document.createElement("canvas");
  canvas.classList.add(styles.canvas);
  app.appendChild(canvas);

  const videoInstance = new Video(app, video, canvas);
  await videoInstance.startUp();
  //console.log(videoInstance.devices);

  const cursorInstance = new Cursor(styles.cursor);

  const handpose = new HandposeDetection(canvas);

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

init(document.querySelector<HTMLDivElement>("#app"));

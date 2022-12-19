import styles from "./index.css";
import Video from "./helpers/video";
import Cursor from "./helpers/cursor";
import HandposeDetection from "./helpers/handposeDetection";

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
  console.log(videoInstance.devices);

  const handpose = new HandposeDetection(canvas);
  handpose.onPositionUpdate((point) => {
    console.log({
      position: point.center,
      state: point.distance > 50 ? "open" : "closed",
    });
  });

  //const cursorInstance = new Cursor();
};

init(document.querySelector<HTMLDivElement>("#app"));

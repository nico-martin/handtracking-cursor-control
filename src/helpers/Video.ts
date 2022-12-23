import { log } from "./log";

class Video {
  private readonly video: HTMLVideoElement = null;
  private readonly canvas: HTMLCanvasElement = null;
  private renderFrame: boolean = false;
  private activeCameraID = null;
  private artboardSize: { width: number; height: number } = {
    height: 0,
    width: 0,
  };
  public devices: Array<MediaDeviceInfo> = null;
  private stream = null;

  constructor(
    artboard: HTMLDivElement,
    video: HTMLVideoElement,
    canvas: HTMLCanvasElement = null
  ) {
    this.video = video;
    this.canvas = canvas;
    navigator.mediaDevices.enumerateDevices().then((deviceInfos) => {
      this.devices = deviceInfos.filter(
        (device) => device.kind === "videoinput"
      );
    });

    this.artboardSize = {
      width: artboard.offsetWidth,
      height: artboard.offsetHeight,
    };
    window.addEventListener("resize", () => {
      this.artboardSize = {
        width: artboard.offsetWidth,
        height: artboard.offsetHeight,
      };
    });
  }

  private calculateSize = (srcSize, dstSize) => {
    const srcRatio = srcSize.width / srcSize.height;
    const dstRatio = dstSize.width / dstSize.height;

    if (dstRatio < srcRatio) {
      return {
        width: dstSize.height * srcRatio,
        height: dstSize.height,
      };
    } else {
      return {
        width: dstSize.width,
        height: dstSize.width / srcRatio,
      };
    }
  };

  private initCamera = async (cameraId, width, height, fps): Promise<void> => {
    this.stream && this.stream.getTracks().forEach((track) => track.stop());

    const constraints: MediaStreamConstraints = {
      audio: false,
      video: {
        facingMode: "user",
        width: width,
        height: height,
        frameRate: { max: fps },
        deviceId: cameraId,
      },
    };

    const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
    this.stream = mediaStream;
    this.activeCameraID = mediaStream
      .getTracks()
      .map((track) => track.getSettings().deviceId)[0];
    this.video.srcObject = mediaStream;
  };

  public startUp = async (cameraId = "") => {
    this.renderFrame = true;
    await this.initCamera(
      cameraId,
      this.artboardSize[0],
      this.artboardSize[1],
      30
    );
    await this.video.play();
    this.video.addEventListener("loadeddata", () => {
      log("Camera is ready");
    });
    this.renderCanvas();
  };

  public shutDown = async () => {
    this.renderFrame = false;
    this.stream && this.stream.getTracks().forEach((track) => track.stop());
  };

  private renderCanvas = () => {
    if (!this.canvas || !this.renderFrame) return;
    const context = this.canvas.getContext("2d");
    // re-register callback
    requestAnimationFrame(this.renderCanvas);
    // set internal canvas size to match HTML element size
    this.canvas.width = this.canvas.scrollWidth;
    this.canvas.height = this.canvas.scrollHeight;
    if (this.video.readyState === this.video.HAVE_ENOUGH_DATA) {
      // scale and horizontally center the camera image
      const videoSize = {
        width: this.video.videoWidth,
        height: this.video.videoHeight,
      };
      const canvasSize = {
        width: this.canvas.width,
        height: this.canvas.height,
      };
      const renderSize = this.calculateSize(videoSize, canvasSize);
      const yOffset = (canvasSize.height - renderSize.height) / 2;
      const xOffset = (canvasSize.width - renderSize.width) / 2;
      context.drawImage(
        this.video,
        xOffset,
        yOffset,
        renderSize.width,
        renderSize.height
      );
    }
  };
}

export default Video;

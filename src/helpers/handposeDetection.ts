import "@tensorflow/tfjs-backend-webgl";
import * as mpHands from "@mediapipe/hands";
import { MediaPipeHandsMediaPipeModelConfig } from "@tensorflow-models/hand-pose-detection";

import * as tfjsWasm from "@tensorflow/tfjs-backend-wasm";

tfjsWasm.setWasmPaths(
  `https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm@${tfjsWasm.version_wasm}/dist/`
);

import * as handdetection from "@tensorflow-models/hand-pose-detection";
import { HandDetector } from "@tensorflow-models/hand-pose-detection/dist/hand_detector";
import { Hand } from "@tensorflow-models/hand-pose-detection/dist/types";

class HandposeDetection {
  private detector: HandDetector = null;
  private canvas: HTMLCanvasElement = null;
  private ctx: CanvasRenderingContext2D = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    const model = handdetection.SupportedModels.MediaPipeHands;
    const detectorConfig: MediaPipeHandsMediaPipeModelConfig = {
      runtime: "mediapipe", // or 'tfjs',
      solutionPath: "https://cdn.jsdelivr.net/npm/@mediapipe/hands",
      modelType: "full",
    };
    handdetection.createDetector(model, detectorConfig).then((detector) => {
      this.detector = detector;
      this.doPredictions();
    });
  }

  drawPoint = (x, y, r, color = "black", text = "") => {
    this.ctx.beginPath();
    this.ctx.arc(x, y, r, 0, 2 * Math.PI);
    if (text !== "") this.ctx.fillText(text, x, y);
    this.ctx.fillStyle = color;
    this.ctx.fill();
    this.ctx.font = "48px serif";
  };

  calculateMiddle = (
    p1: { x: number; y: number },
    p2: { x: number; y: number }
  ): { x: number; y: number } => {
    const centerX = (p1.x + p2.x) / 2;
    const centerY = (p1.y + p2.y) / 2;
    return { x: centerX, y: centerY };
  };

  doPredictions = async () => {
    const hands = await this.detector.estimateHands(this.canvas);
    const rightHand: Hand =
      hands.find((hand) => hand.handedness === "Left") || null;

    if (rightHand) {
      const indexTip = rightHand.keypoints.find(
        (finger) => finger.name === "index_finger_tip"
      );
      const thumbTip = rightHand.keypoints.find(
        (finger) => finger.name === "thumb_tip"
      );
      const middle = this.calculateMiddle(indexTip, thumbTip);
      this.drawPoint(middle.x, middle.y, 5, "black");
    }

    requestAnimationFrame(this.doPredictions);
  };
}

export default HandposeDetection;

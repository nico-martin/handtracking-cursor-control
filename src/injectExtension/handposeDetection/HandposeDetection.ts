import {
  Hand,
  HandDetector,
  SupportedModels,
  createDetector,
} from '@tensorflow-models/hand-pose-detection';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';

import { LOG_TYPES, error, log } from '../../helpers/log';
import EventBus from '../eventBus/EventBus';

export enum HANDPOSES {
  DEFAULT = 'default',
  INDEX_TO_THUMB = 'indexToThumb',
}

type PointType = { position: { x: number; y: number }; handpose: HANDPOSES };

class HandposeDetection {
  private detector: HandDetector = null;
  private readonly canvas: HTMLCanvasElement = null;
  private ctx: CanvasRenderingContext2D = null;
  private eventBus = new EventBus<{
    'update-position': PointType;
    'detector-setup': true;
  }>();

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    tf.setBackend('webgl').then(() => {
      log(LOG_TYPES.HPD, 'tf backend set', tf.getBackend());
      createDetector(SupportedModels.MediaPipeHands, {
        runtime: 'tfjs',
        modelType: 'full',
      })
        .then(async (detector) => {
          this.detector = detector;
          this.eventBus.publish('detector-setup', true);
          await this.doPredictions();
        })
        .catch((e) => error(e));
    });
  }

  private drawPoint = (x, y, r, color = 'black', text = '') => {
    this.ctx.beginPath();
    this.ctx.arc(x, y, r, 0, 2 * Math.PI);
    if (text !== '') this.ctx.fillText(text, x, y);
    this.ctx.fillStyle = color;
    this.ctx.fill();
    this.ctx.font = '48px serif';
  };

  private findCenterAndDistance = (
    p1: { x: number; y: number },
    p2: { x: number; y: number }
  ): { center: { x: number; y: number }; distance: number } => {
    const centerX = (p1.x + p2.x) / 2;
    const centerY = (p1.y + p2.y) / 2;
    const distance = Math.sqrt(
      Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2)
    );
    return { center: { x: centerX, y: centerY }, distance: distance };
  };

  private doPredictions = async (): Promise<void> => {
    const hands = await this.detector.estimateHands(this.canvas);

    const rightHand: Hand =
      hands.find((hand) => hand.handedness === 'Left') || null;

    if (rightHand) {
      const indexTip = rightHand.keypoints.find(
        (finger) => finger.name === 'index_finger_tip'
      );
      const thumbTip = rightHand.keypoints.find(
        (finger) => finger.name === 'thumb_tip'
      );
      const middlePoint = this.findCenterAndDistance(indexTip, thumbTip);
      this.eventBus.publish('update-position', {
        position: middlePoint.center,
        handpose:
          middlePoint.distance > 50
            ? HANDPOSES.DEFAULT
            : HANDPOSES.INDEX_TO_THUMB,
      });

      this.drawPoint(middlePoint.center.x, middlePoint.center.y, 10, 'black');
    }

    requestAnimationFrame(this.doPredictions);
  };

  public onPositionUpdate = (callback: (point: PointType) => void) =>
    this.eventBus.subscribe('update-position', callback);

  public onDetectorSetUp = (callback: (state: true) => void) =>
    this.eventBus.subscribe('detector-setup', callback);
}

export default HandposeDetection;

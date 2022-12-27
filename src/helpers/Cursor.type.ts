export enum CURSOR_STATE {
  OPEN = "open",
  PINCH = "pinch",
}

export interface CursorPosition {
  x: number;
  y: number;
  clientX: number;
  clientY: number;
  pageX: number;
  pageY: number;
  target: Element;
}

interface CursorEvent extends CursorPosition {
  type: keyof EventsDefinitions;
}

interface CursorPointerEvent extends CursorEvent {
  timestamp: number;
}

interface CursorMoveEvent extends CursorPointerEvent {
  movementX: number;
  movementY: number;
}

export type EventsDefinitions = {
  click: CursorEvent;
  mouseup: CursorPointerEvent;
  mousedown: CursorPointerEvent;
  drag: CursorMoveEvent;
};

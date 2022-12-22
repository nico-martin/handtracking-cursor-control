import EventBus from "./EventBus";
import { CURSOR_STATE, CursorPosition, EventsDefinitions } from "./Cursor.d";

class Cursor {
  private readonly cursor: HTMLDivElement = null;
  private cursorState: CURSOR_STATE = CURSOR_STATE.OPEN;
  private eventBus = new EventBus<EventsDefinitions>();
  private movePosition: { x: number; y: number } = null;

  constructor(className: string = "") {
    this.cursor = document.createElement("div");
    className && this.cursor.classList.add(className);
    this.cursor.style.borderColor = "black";
    this.cursor.style.position = "fixed";
    this.cursor.style.top = "100px";
    this.cursor.style.left = "100px";
    document.body.appendChild(this.cursor);

    this.eventBus.subscribe("click", () => {
      const rect = this.cursor.getBoundingClientRect();

      const evt = new MouseEvent("click", {
        view: window,
        bubbles: true,
        cancelable: true,
      });
      document.elementFromPoint(rect.left, rect.top).dispatchEvent(evt);
    });
  }

  private getCursorPosition = (): CursorPosition => {
    const rect = this.cursor.getBoundingClientRect();
    return {
      x: Math.round(rect.left),
      y: Math.round(rect.top),
      clientX: Math.round(rect.left),
      clientY: Math.round(rect.top),
      pageX: Math.round(rect.left),
      pageY: Math.round(window.scrollY + rect.top),
      target: document.elementFromPoint(rect.left, rect.top),
    };
  };

  public setCursorColor = (color: string): void => {
    this.cursor.style.borderColor = color;
  };

  public setCursorPosition = (left: number, top: number): void => {
    this.cursor.style.top = top + "px";
    this.cursor.style.left = left + "px";
  };

  public setCursorState = (state: CURSOR_STATE) => {
    if (state === CURSOR_STATE.PINCH) {
      const cursorPosition = this.getCursorPosition();
      this.movePosition &&
        this.eventBus.publish("mousemove", {
          ...cursorPosition,
          type: "mousemove",
          timestamp: Date.now(),
          movementX: cursorPosition.x - this.movePosition.x,
          movementY: cursorPosition.y - this.movePosition.y,
        });
      this.movePosition = { x: cursorPosition.x, y: cursorPosition.y };
    }
    if (state === this.cursorState) return;
    this.onCursorStateChange(state, this.cursorState);
    this.cursorState = state;
  };

  public onCursorStateChange = (
    state: CURSOR_STATE,
    oldState: CURSOR_STATE
  ) => {
    const cursorPosition = this.getCursorPosition();
    if (oldState === CURSOR_STATE.OPEN && state === CURSOR_STATE.PINCH) {
      this.eventBus.publish("mousedown", {
        ...cursorPosition,
        type: "mousedown",
        timestamp: Date.now(),
      });
    } else if (oldState === CURSOR_STATE.PINCH && state === CURSOR_STATE.OPEN) {
      this.eventBus.publish("click", {
        ...cursorPosition,
        type: "click",
      });
      this.eventBus.publish("mouseup", {
        ...cursorPosition,
        type: "mouseup",
        timestamp: Date.now(),
      });
      this.movePosition = null;
    }
  };

  public addEventListener = <T extends keyof EventsDefinitions>(
    eventName: T,
    listener: (payload: EventsDefinitions[T]) => void
  ) => this.eventBus.subscribe(eventName, listener);
}

export default Cursor;
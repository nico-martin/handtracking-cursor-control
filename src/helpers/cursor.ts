import EventBus from "./EventBus";

export enum CURSOR_STATE {
  OPEN = "open",
  RIGHTCLICK = "right",
  LEFTCLICK = "left",
}

type EventsDefinitions = {
  click: {};
  onmousedown: {};
  onmouseup: {};
};

class Cursor {
  private readonly cursor: HTMLDivElement = null;
  private cursorState: CURSOR_STATE = CURSOR_STATE.OPEN;
  private eventBus = new EventBus<EventsDefinitions>();

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

  public setCursorColor = (color: string): void => {
    this.cursor.style.borderColor = color;
  };

  public setCursorPosition = (left: number, top: number): void => {
    this.cursor.style.top = top + "px";
    this.cursor.style.left = left + "px";
  };

  public setCursorState = (state: CURSOR_STATE) => {
    if (state === this.cursorState) return;
    this.onCursorStateChange(state);
    this.cursorState = state;
  };

  public onCursorStateChange = (state: CURSOR_STATE) => {
    if (state === CURSOR_STATE.LEFTCLICK) {
      this.eventBus.publish("click", {});
    } else if (state === CURSOR_STATE.OPEN) {
    }
  };

  public addEventListener = <T extends keyof EventsDefinitions>(
    eventName: T,
    listener: (payload: EventsDefinitions[T]) => void
  ) => this.eventBus.subscribe(eventName, listener);
}

export default Cursor;

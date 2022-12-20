export enum CURSOR_STATE {
  OPEN = "open",
  RIGHTCLICK = "right",
  LEFTCLICK = "left",
}

class Cursor {
  private readonly cursor: HTMLDivElement = null;
  private cursorState: CURSOR_STATE = CURSOR_STATE.OPEN;

  constructor(className: string = "") {
    this.cursor = document.createElement("div");
    className && this.cursor.classList.add(className);
    this.cursor.style.borderColor = "black";
    this.cursor.style.position = "fixed";
    this.cursor.style.top = "100px";
    this.cursor.style.left = "100px";
    document.body.appendChild(this.cursor);
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
      console.log(this.cursor.style.borderColor);
      this.cursor.style.backgroundColor = this.cursor.style.borderColor;
      this.click();
    } else if (state === CURSOR_STATE.OPEN) {
      this.cursor.style.backgroundColor = "transparent";
    }
  };

  public click = () => {
    const rect = this.cursor.getBoundingClientRect();

    const evt = new MouseEvent("click", {
      view: window,
      bubbles: true,
      cancelable: true,
    });
    document.elementFromPoint(rect.left, rect.top).dispatchEvent(evt);
  };
}

export default Cursor;

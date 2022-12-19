class Cursor {
  private cursor: HTMLDivElement = null;

  constructor() {
    this.cursor = document.createElement("div");
    this.cursor.style.width = "20px";
    this.cursor.style.height = "20px";
    this.cursor.style.backgroundColor = "blue";
    this.cursor.style.position = "fixed";
    this.cursor.style.top = "100px";
    this.cursor.style.left = "100px";
    document.body.appendChild(this.cursor);
  }

  public setCursorVisibility = (visible: boolean): void => {
    if (!visible) {
      this.cursor.style.display = "none";
    } else {
      this.cursor.style.display = "block";
    }
  };

  public setCursorColor(color: string): void {
    this.cursor.style.backgroundColor = color;
  }

  public setCursorPosition(left: number, top: number): void {
    this.cursor.style.top = window.innerHeight * top + "px";
    this.cursor.style.left = window.innerWidth * left + "px";
  }
}

export default Cursor;

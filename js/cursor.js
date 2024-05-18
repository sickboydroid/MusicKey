export default class Cursor {
  constructor(lyricsTraverser) {
    this.lineNumber = 1;
    this.position = 0;
    this.lyricsTraverser = lyricsTraverser;
  }

  getCharAtCursor() {
    return this.lyricsTraverser.getCharAt(this.position);
  }

  moveToNextChar() {
    if (this.position === this.lyricsTraverser.length - 1) return;
    if (this.lyricsTraverser.getCharAt(this.position) === "\n") this.lineNumber++;
    this.position++;
  }

  moveToPreviousChar() {
    if (this.position === 0) return;
    if (this.lyricsTraverser.getCharAt(this.position) === "\n") this.lineNumber--;
    this.position--;
  }

  getCurrentPosition() {
    return this.position;
  }

  draw(ctx, textDrawer) {
    ctx.fillStyle = "#282828";
    const offset = 10;
    const x = textDrawer.x;
    const y = textDrawer.y - textDrawer.lineHeight/1.8;
    const cursorHeight = textDrawer.lineHeight - offset;
    ctx.fillRect(x, y, 2, cursorHeight);
  }

  getLineNumber() {
    return this.lineNumber;
  }

  resetPosition() {
    this.position = 0;
  }

  scrollToCursor(traverser, canvasHeight, lineHeight) {
    let cursorLine = this.getLineNumber();
    const maxOnScreenLines = canvasHeight / lineHeight;
    const totalLinesOnPrevScreens = Math.floor(cursorLine / maxOnScreenLines) * maxOnScreenLines;
    this.skipLines(traverser, totalLinesOnPrevScreens - 1);
    if (cursorLine % maxOnScreenLines === maxOnScreenLines)
      this.skipLines(traverser, maxOnScreenLines - 1);
  }

  skipLines(traverser, numLines) {
    while (numLines > 0 && traverser.hasNext()) {
      if (traverser.next()[1] === "\n") numLines -= 1;
    }
  }
}

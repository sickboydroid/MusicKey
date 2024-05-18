export class TextDrawer {
  constructor(
    canvasContext,
    startX,
    startY,
    lineHeight,
    letterSpacing = 5,
    isMonospaceFont = true
  ) {
    this.ctx = canvasContext;
    this.charWidths = this.calculateCharWidths(letterSpacing, isMonospaceFont);
    this.x = this.startX = startX;
    this.y = this.startY = startY;
    this.lineHeight = lineHeight;
    this.letterSpacing = letterSpacing;
  }

  resetPosition() {
    this.x = this.startX;
    this.y = this.startY;
  }

  addChar(char, useCachedCharWidth = true) {
    if (char === "\n") {
      this.addNewLine();
      return;
    }
    this.ctx.fillText(char, this.x, this.y);
    const charWidth = useCachedCharWidth
      ? this.charWidths.get(char) ?? this.charWidths.get("0")
      : this.getCharacterWidth(char);
    this.x += charWidth;
  }

  addNewLine() {
    this.y += this.lineHeight;
    this.x = this.startX;
  }

  calculateCharWidths(letterSpacing, isMonospaceFont) {
    const charWidths = new Map();
    if (isMonospaceFont) {
      charWidths.set("0", this.getCharacterWidth("0") + letterSpacing);
      return charWidths;
    }
    for (let charCode = 32; charCode <= 126; charCode++) {
      const char = String.fromCharCode(charCode);
      charWidths.set(char, this.getCharacterWidth(char) + letterSpacing);
    }
    return charWidths;
  }

  getCharacterWidth(character) {
    return this.ctx.measureText(character).width;
  }

  getCharacterHeight(character) {
    const metrics = this.ctx.measureText(character);
    return metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
  }
}

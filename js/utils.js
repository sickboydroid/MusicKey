export class Utils {
  constructor() {}
  static getCharacterWidth(element, document) {
    const tempDiv = document.createElement("div");
    tempDiv.style.fontFamily = getComputedStyle(element).fontFamily;
    tempDiv.style.fontSize = getComputedStyle(element).fontSize;
    tempDiv.style.fontWeight = getComputedStyle(element).fontWeight;
    tempDiv.style.whiteSpace = "nowrap";
    tempDiv.style.opacity = "0";
    tempDiv.textContent = "M";
    document.body.appendChild(tempDiv);
    const avgCharacterWidth = tempDiv.getBoundingClientRect().width / tempDiv.textContent.length;
    document.body.removeChild(tempDiv);
    return avgCharacterWidth;
  }
}
